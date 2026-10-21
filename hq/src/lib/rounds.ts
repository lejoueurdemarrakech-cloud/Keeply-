import "server-only";
import { arr, askJson, num, obj, oneOf, str, untrusted } from "@/lib/ai";
import { briefTool } from "@/lib/ai-tools";
import { configOrNull } from "@/lib/connectors/config";
import { adsOverview } from "@/lib/connectors/meta";
import { replyAppStoreReview } from "@/lib/connectors/appstore";
import { replyGooglePlayReview } from "@/lib/connectors/google";
import { demoAds } from "@/lib/demo";
import { analyze, instagramOverview, listPosts, savePost } from "@/lib/instagram";
import { imapAction, inbox, sendMail, updateMailState } from "@/lib/mail";
import { getReviews, resetReviewsCache } from "@/lib/reviews";
import { getSettings, logActivity } from "@/lib/settings";
import { read, store, uid, update } from "@/lib/store";
import { briefContext, todayOverview } from "@/lib/today";
import type { MailCategory, Post } from "@/lib/types";

/* ---------- File « À valider » ---------- */

export type ReviewKind = "mail" | "avis" | "instagram" | "ads" | "note";

export interface ReviewItem {
  id: string;
  kind: ReviewKind;
  title: string;
  /** Texte proposé, modifiable avant validation. */
  body: string;
  subject?: string;
  context?: string;
  payload: Record<string, string | undefined>;
  createdAt: string;
  round: string;
  status: "a-valider" | "valide" | "refuse" | "echec";
  error?: string;
}

const QUEUE = "review:items";
export const listReview = () => read<ReviewItem[]>(QUEUE, []);

async function enqueue(items: Omit<ReviewItem, "id" | "createdAt" | "status">[]) {
  if (!items.length) return 0;
  const now = new Date().toISOString();
  await update<ReviewItem[]>(QUEUE, [], (all) => {
    // Pas de doublon pour une même cible (même mail, même avis…) encore en attente.
    const pending = new Set(all.filter((x) => x.status === "a-valider").map((x) => `${x.kind}:${x.payload.target}`));
    const fresh = items.filter((i) => !pending.has(`${i.kind}:${i.payload.target}`)).map((i) => ({ ...i, id: uid("rv"), createdAt: now, status: "a-valider" as const }));
    return [...fresh, ...all].slice(0, 300);
  });
  return items.length;
}

export async function decideReview(id: string, decision: "valider" | "refuser", edit?: { body?: string; subject?: string }) {
  const item = (await listReview()).find((x) => x.id === id);
  if (!item) throw new Error("Élément introuvable.");
  if (item.status !== "a-valider") throw new Error("Déjà traité.");
  const body = edit?.body?.trim() || item.body;
  const subject = edit?.subject?.trim() || item.subject;
  let status: ReviewItem["status"] = decision === "valider" ? "valide" : "refuse";
  let error: string | undefined;
  let note: string | undefined;
  if (decision === "valider") {
    try {
      note = await execute(item, body, subject);
    } catch (e) {
      status = "echec";
      error = e instanceof Error ? e.message : String(e);
    }
  }
  await update<ReviewItem[]>(QUEUE, [], (all) => all.map((x) => (x.id === id ? { ...x, body, subject, status, error } : x)));
  if (error) throw new Error(error);
  return { ok: true, note };
}

/** Exécute l'action validée. Renvoie éventuellement une remarque pour l'interface. */
async function execute(item: ReviewItem, body: string, subject?: string): Promise<string | undefined> {
  const p = item.payload;
  switch (item.kind) {
    case "mail": {
      const cfg = await configOrNull("mail");
      if (!cfg) throw new Error("Boîte mail non connectée.");
      await sendMail(cfg, { to: p.to!, subject: subject || "Re:", text: body, inReplyTo: p.inReplyTo, references: p.references });
      if (p.inReplyTo) {
        await updateMailState((s) => ({ ...s, overrides: { ...s.overrides, [p.inReplyTo!]: { ...s.overrides[p.inReplyTo!], done: true } }, lastReplyTo: { ...s.lastReplyTo, [p.to!.toLowerCase()]: new Date().toISOString() } }));
      }
      if (p.uid) await imapAction(cfg, p.uid, "seen").catch(() => undefined);
      await logActivity("mails", `Réponse validée envoyée à ${p.to}`, "succes");
      return;
    }
    case "avis": {
      const st = p.store as "appstore" | "googleplay";
      const cfg = await configOrNull(st);
      if (!cfg) throw new Error("Store non connecté.");
      if (st === "appstore") await replyAppStoreReview(cfg, p.target!, body);
      else await replyGooglePlayReview(cfg, p.target!, body);
      resetReviewsCache();
      await logActivity("systeme", "Réponse à un avis publiée", "succes");
      return;
    }
    case "instagram": {
      const post = (await listPosts()).find((x) => x.id === p.target);
      if (!post) throw new Error("Post introuvable.");
      const ready = post.media.length > 0;
      // Validé + visuel présent : programmé, HQ le publiera tout seul à l'heure (sans Claude).
      await savePost({ ...post, caption: body, status: ready ? "programme" : "brouillon" });
      if (!ready) return "Légende validée. Ajoute le visuel ou la vidéo dans Instagram > Planning : le post sera alors programmé.";
      return "Programmé : HQ le publiera tout seul à l'heure prévue.";
    }
    default:
      return;
  }
}

/* ---------- Tournées ---------- */

const REPLY_CATEGORIES: MailCategory[] = ["client", "prospect", "partenariat", "support", "facturation", "presse"];

/** Tri de tous les nouveaux mails (1 demande, modèle léger) + brouillons des réponses importantes (1 demande). */
export async function mailRound() {
  const { items } = await inbox(true);
  const todo = items.filter((m) => !m.summary && !m.isBulk && !m.done).slice(0, 40);
  let triaged = 0;
  let needs = new Set<string>();
  if (todo.length) {
    const res = await askJson<{ items: { id: string; priority: number; category: string; summary: string; action: string; needsReply: boolean }[] }>(
      `Trie ces mails reçus par le fondateur de Keeply.
Priorité 1 (peut attendre) à 5 (dans l'heure : client bloqué, panne, argent, presse avec échéance, gros partenariat).
Catégories : client, prospect, partenariat, support, facturation, presse, store, notification, newsletter, perso, autre.
Pour chacun : résumé en une phrase, action à faire, et needsReply = true seulement si une personne attend une réponse écrite de sa part.
${untrusted("mails", JSON.stringify(todo.map((m) => ({ id: m.messageId, from: `${m.from.name} <${m.from.email}>`, subject: m.subject, text: m.text.slice(0, 1200) }))), 45000)}`,
      obj({ items: arr(obj({ id: str, priority: num, category: oneOf("client", "prospect", "partenariat", "support", "facturation", "presse", "store", "notification", "newsletter", "perso", "autre"), summary: str, action: str, needsReply: { type: "boolean" } })) }),
      { label: "Tournée mails · tri", model: "haiku" },
    );
    const known = new Set(todo.map((m) => m.messageId));
    await updateMailState((s) => {
      const ai = { ...s.ai };
      for (const it of res.items) if (known.has(it.id)) ai[it.id] = { priority: it.priority, category: it.category as MailCategory, summary: it.summary, action: it.action };
      return { ...s, ai };
    });
    triaged = res.items.length;
    needs = new Set(res.items.filter((i) => i.needsReply).map((i) => i.id));
  }

  const fresh = (await inbox()).items;
  const queued = new Set((await listReview()).filter((x) => x.kind === "mail").map((x) => x.payload.target));
  const toAnswer = fresh
    .filter((m) => !m.done && !m.isBulk && !queued.has(m.messageId) && (needs.has(m.messageId) || (m.priority >= 4 && REPLY_CATEGORIES.includes(m.category))))
    .slice(0, 6);
  let drafted = 0;
  if (toAnswer.length) {
    const s = await getSettings();
    const res = await askJson<{ replies: { id: string; subject: string; body: string }[] }>(
      `Rédige une réponse pour chacun de ces mails reçus par Keeply (même id).
Vouvoiement, ton professionnel et humain, court. Signature : ${s.signature}.
Ne promets rien que tu ne peux pas savoir (dates, prix, délais) : écris [À COMPLÉTER] si une info manque.
${untrusted("mails", JSON.stringify(toAnswer.map((m) => ({ id: m.messageId, from: `${m.from.name} <${m.from.email}>`, subject: m.subject, text: m.text.slice(0, 2500), summary: m.summary }))), 30000)}`,
      obj({ replies: arr(obj({ id: str, subject: str, body: str })) }),
      { label: "Tournée mails · réponses", model: "sonnet" },
    );
    const byId = new Map(toAnswer.map((m) => [m.messageId, m]));
    drafted = await enqueue(
      res.replies
        .filter((r) => byId.has(r.id))
        .map((r) => {
          const m = byId.get(r.id)!;
          return {
            kind: "mail" as const,
            round: "mails",
            title: `Réponse à ${m.from.name || m.from.email}`,
            subject: r.subject,
            body: r.body,
            context: `${m.subject}\n\n${m.summary ?? m.snippet}`,
            payload: { target: m.messageId, to: m.from.email, inReplyTo: m.messageId, references: m.references, uid: m.id },
          };
        }),
    );
  }
  return { triaged, drafted };
}

export async function briefRound() {
  const { brief } = await briefTool(briefContext(await todayOverview()));
  await store.set("brief", { brief, at: new Date().toISOString() });
  return { brief: true };
}

/** Réponses aux avis sans réponse, toutes dans une seule demande. */
export async function reviewsRound() {
  const { reviews, live } = await getReviews(true);
  if (!live) return { drafted: 0, note: "stores non connectés" };
  const queued = new Set((await listReview()).filter((x) => x.kind === "avis").map((x) => x.payload.target));
  const todo = reviews.filter((r) => !r.reply && !queued.has(r.id)).slice(0, 8);
  if (!todo.length) return { drafted: 0 };
  const s = await getSettings();
  const res = await askJson<{ replies: { id: string; reply: string }[] }>(
    `Rédige la réponse publique de Keeply à chacun de ces avis (même id). Remercie sans flatter, réponds au point soulevé, si c'est un bug donne une piste concrète ou invite à écrire au support. 350 caractères max. Signe « ${s.signature} ».
${untrusted("avis", JSON.stringify(todo.map((r) => ({ id: r.id, store: r.store, note: r.rating, titre: r.title, texte: r.body }))), 20000)}`,
    obj({ replies: arr(obj({ id: str, reply: str })) }),
    { label: "Tournée avis · réponses", model: "sonnet" },
  );
  const byId = new Map(todo.map((r) => [r.id, r]));
  const n = await enqueue(
    res.replies
      .filter((r) => byId.has(r.id))
      .map((r) => {
        const rv = byId.get(r.id)!;
        return { kind: "avis" as const, round: "avis", title: `Avis ${rv.rating}/5 · ${rv.store === "appstore" ? "App Store" : "Google Play"}`, body: r.reply, context: `${rv.title}\n${rv.body}`, payload: { target: rv.id, store: rv.store } };
      }),
  );
  return { drafted: n };
}

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

/** Toute la semaine Instagram préparée en une demande : posts, Reels, stories, légendes complètes. */
export async function instagramWeekRound() {
  const s = await getSettings();
  const o = await instagramOverview();
  const a = analyze(o);
  const already = (await listPosts()).filter((p) => p.scheduledAt && new Date(p.scheduledAt).getTime() > Date.now());
  const monday = nextMonday();
  const res = await askJson<{ posts: { dayIndex: number; time: string; format: "image" | "carrousel" | "reel" | "story"; pillar: string; caption: string; firstComment: string; visual: string }[]; advice: string }>(
    `Prépare la semaine Instagram de @${s.instagram.handle} (Keeply) du lundi ${monday.toLocaleDateString("fr-FR")}.
Rubriques : ${s.instagram.pillars.join(", ")}.
Chiffres du compte : ${o.account.followers} abonnés (${a.followersGained7 >= 0 ? "+" : ""}${a.followersGained7} sur 7 jours), ${a.postsPerWeek.toFixed(1)} posts/semaine, engagement ${(a.engagementRate * 100).toFixed(2)} %.
Formats : ${a.formats.map((f) => `${f.type} portée moy. ${f.avgReach}`).join(" ; ")}.
Meilleurs créneaux : ${a.best.map((b) => `${DAYS[b.day]} ${b.hour}h`).join(", ") || "inconnus (vise 8h, 12h30, 19h)"}.
Déjà programmé : ${already.map((p) => `${p.format} le ${p.scheduledAt}`).join(", ") || "rien"}.

Donne 5 à 7 publications dont au moins 2 Reels et 2 stories. Pour chacune : dayIndex (0 = lundi), time (HH:MM), format, pillar, caption (légende COMPLÈTE prête à publier : accroche, corps, appel à l'action, 8 à 12 hashtags à la fin ; pour une story, juste le texte à l'écran), firstComment (vide si inutile), visual (ce qu'il faut filmer ou créer : pour un Reel, le script plan par plan avec le texte à l'écran ; pour un carrousel, le texte de chaque slide).
Puis advice : 2 conseils pour la semaine.
Cible : gérants de cafés, fast-foods et restaurants. Vouvoiement. Phrases courtes, pas d'emojis en rafale, pas de « ce n'est pas X, c'est Y ».`,
    obj({ posts: arr(obj({ dayIndex: num, time: str, format: oneOf("image", "carrousel", "reel", "story"), pillar: str, caption: str, firstComment: str, visual: str })), advice: str }),
    { label: "Tournée Instagram · semaine", model: "opus", effort: "medium" },
  );
  const items: Omit<ReviewItem, "id" | "createdAt" | "status">[] = [];
  for (const p of res.posts) {
    const [h, m] = p.time.split(":").map(Number);
    const when = new Date(monday);
    when.setDate(when.getDate() + Math.max(0, Math.min(6, Math.round(p.dayIndex))));
    when.setHours(h || 9, m || 0, 0, 0);
    const post: Post = { id: uid("ig"), format: p.format, caption: p.caption, media: [], firstComment: p.firstComment || undefined, pillar: p.pillar, scheduledAt: when.toISOString(), status: "brouillon", createdAt: new Date().toISOString() };
    await savePost(post);
    items.push({
      kind: "instagram",
      round: "instagram",
      title: `${p.format === "reel" ? "Reel" : p.format === "story" ? "Story" : p.format === "carrousel" ? "Carrousel" : "Post"} · ${DAYS[Math.round(p.dayIndex)] ?? ""} ${p.time}`,
      body: p.caption,
      context: `À préparer : ${p.visual}`,
      payload: { target: post.id },
    });
  }
  await enqueue(items);
  await store.set("instagram:advice", { at: new Date().toISOString(), advice: res.advice });
  return { posts: items.length };
}

function nextMonday() {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? 1 : 8 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Analyse Meta Ads + nouvelles annonces, en une demande. Rien n'est modifié sur Meta sans toi. */
export async function adsRound() {
  const cfg = await configOrNull("metaads");
  const data = cfg ? await adsOverview(cfg, 14).catch(() => null) : null;
  const overview = data ?? demoAds();
  const s = await getSettings();
  const res = await askJson<{ verdict: string; actions: { campaign: string; action: string; why: string }[]; audiences: string[]; ads: { primary: string; headline: string; description: string; cta: string; visual: string; audience: string }[] }>(
    `Tu gères les publicités Meta (Facebook + Instagram) de Keeply : carte de fidélité dans Apple Wallet et Google Wallet pour cafés, fast-foods et restaurants (${s.prospecting.offer}).
Objectif : des essais d'app au coût le plus bas possible, auprès de gérants de commerces de bouche (France, Belgique, Suisse, Maroc).
Résultats des 14 derniers jours${data ? "" : " (données d'exemple, compte pub non connecté)"} :
${JSON.stringify(overview).slice(0, 12000)}

Donne : verdict (3 phrases : ce qui rapporte, ce qui coûte trop), actions (par campagne : couper, garder, augmenter de X %, changer le visuel… avec la raison chiffrée), audiences (3 à 5 ciblages précis à tester : centres d'intérêt, métiers, lookalike, zones), ads (4 nouvelles annonces prêtes : texte principal 125 caractères, titre 40, description 30, bouton, visuel, audience visée).
Ne propose jamais d'augmenter un budget sans résultat mesuré. ${data ? "" : "Signale que les chiffres sont des exemples."}`,
    obj({ verdict: str, actions: arr(obj({ campaign: str, action: str, why: str })), audiences: arr(str), ads: arr(obj({ primary: str, headline: str, description: str, cta: str, visual: str, audience: str })) }),
    { label: "Tournée Meta Ads · analyse", model: "opus", effort: "medium" },
  );
  await store.set("ads:advice", { ...res, at: new Date().toISOString(), live: !!data });
  await enqueue([
    {
      kind: "ads",
      round: "ads",
      title: "Meta Ads · recommandations",
      body: [res.verdict, "", ...res.actions.map((a) => `• ${a.campaign} : ${a.action} (${a.why})`), "", "Audiences à tester :", ...res.audiences.map((x) => `• ${x}`)].join("\n"),
      context: res.ads.map((a, i) => `Annonce ${i + 1} (${a.audience})\n${a.primary}\nTitre : ${a.headline} · ${a.description} · ${a.cta}\nVisuel : ${a.visual}`).join("\n\n"),
      payload: { target: "ads-" + new Date().toISOString().slice(0, 10) },
    },
  ]);
  return { ads: res.ads.length };
}

export const ROUNDS = {
  mails: mailRound,
  brief: briefRound,
  avis: reviewsRound,
  instagram: instagramWeekRound,
  ads: adsRound,
} as const;
export type RoundName = keyof typeof ROUNDS;

export async function runRound(name: RoundName) {
  const started = Date.now();
  try {
    const result = await ROUNDS[name]();
    await logActivity("systeme", `Tournée Claude « ${name} » terminée`, "succes");
    await store.set("round:last:" + name, { at: new Date().toISOString(), ms: Date.now() - started, result });
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await store.set("round:last:" + name, { at: new Date().toISOString(), ms: Date.now() - started, error: message });
    await logActivity("systeme", `Tournée Claude « ${name} » : ${message}`, "erreur");
    throw e;
  }
}
