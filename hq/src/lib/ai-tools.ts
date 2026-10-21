import "server-only";
import { aiAvailable, arr, askJson, askText, num, obj, oneOf, str, untrusted } from "@/lib/ai";
import { getSettings } from "@/lib/settings";
import { PROSPECT_PLAYBOOK } from "@/lib/playbook";
import type { Prospect } from "@/lib/types";

const STYLE = `Règles d'écriture : phrases courtes, concrètes, un seul appel à l'action. Pas de « ce n'est pas X, c'est Y », pas de listes « pas de X, pas de Y », pas d'emojis en rafale (2 maximum), pas de promesses invérifiables.`;

/* ---------- Instagram ---------- */

export async function captionTool(input: { topic: string; format?: string; pillar?: string; tone?: string }) {
  const s = await getSettings();
  if (!(await aiAvailable())) return { demo: true, variants: fallbackCaptions(input.topic, s.instagram.defaultHashtags) };
  return askJson<{ variants: { hook: string; caption: string; hashtags: string; cta: string }[] }>(
    `Écris 3 légendes Instagram différentes pour le compte @${s.instagram.handle} (Keeply).
Sujet : ${input.topic}
Format : ${input.format || "image"}${input.pillar ? `\nRubrique : ${input.pillar}` : ""}
Ton : ${input.tone || "chaleureux et expert, tutoiement interdit, vouvoiement pour les restaurateurs"}
Cible : gérants de cafés, restaurants, boulangeries.
Chaque légende : une accroche (première ligne qui donne envie de cliquer sur « plus »), un corps utile de 3 à 6 lignes, un appel à l'action (enregistrer, commenter, lien en bio).
Hashtags : 8 à 12, mélange de niche (#cartedefidelite) et de moyens (#restaurateur), en français.
${STYLE}`,
    obj({ variants: arr(obj({ hook: str, caption: str, hashtags: str, cta: str })) }),
    { effort: "low", label: "Instagram · légendes" },
  );
}

export async function ideasTool(input: { pillar?: string; count?: number; context?: string }) {
  const s = await getSettings();
  if (!(await aiAvailable())) return { demo: true, ideas: FALLBACK_IDEAS };
  return askJson<{ ideas: { title: string; format: string; hook: string; outline: string; why: string }[] }>(
    `Propose ${input.count ?? 8} idées de posts Instagram pour Keeply.
Rubriques possibles : ${s.instagram.pillars.join(" / ")}${input.pillar ? `\nConcentre-toi sur : ${input.pillar}` : ""}
${input.context ? `Ce qui marche déjà sur le compte :\n${input.context}` : ""}
Pour chaque idée : un titre, le format conseillé (Reel, Carrousel, Image, Story), l'accroche des 2 premières secondes ou de la 1re slide, un plan en 3-5 étapes, et pourquoi elle peut faire grandir le compte (partages, enregistrements, nouveaux abonnés).
Privilégie les formats qui font gagner des abonnés en 2026 : Reels courts avec accroche forte, carrousels utiles à enregistrer, contenus partageables entre restaurateurs.
${STYLE}`,
    obj({ ideas: arr(obj({ title: str, format: str, hook: str, outline: str, why: str })) }),
    { effort: "low", label: "Instagram · idées" },
  );
}

export async function hooksTool(input: { topic: string }) {
  if (!(await aiAvailable())) return { demo: true, hooks: FALLBACK_HOOKS };
  return askJson<{ hooks: string[] }>(
    `Écris 12 accroches pour un Reel Instagram sur : ${input.topic}. Public : restaurateurs et gérants de café. Chaque accroche fait moins de 12 mots et se lit en 2 secondes à l'écran. Varie les mécaniques : question, chiffre, erreur courante, avant/après, contre-intuitif, POV. ${STYLE}`,
    obj({ hooks: arr(str) }),
    { label: "Instagram · accroches", model: "haiku" },
  );
}

export async function hashtagsTool(input: { topic: string }) {
  if (!(await aiAvailable())) return { demo: true, sets: FALLBACK_HASHTAGS };
  return askJson<{ sets: { name: string; tags: string[] }[] }>(
    `Prépare 3 jeux de hashtags Instagram pour un post sur « ${input.topic} » (compte Keeply, cible restaurateurs francophones) : « Niche » (petits hashtags très ciblés), « Moyens » (communauté restauration / commerce local), « Ville & local » (hashtags géographiques utiles en France, Belgique, Suisse). 8 à 10 hashtags par jeu, sans #.`,
    obj({ sets: arr(obj({ name: str, tags: arr(str) })) }),
    { label: "Instagram · hashtags", model: "haiku" },
  );
}

export async function bioTool(input: { current?: string }) {
  const s = await getSettings();
  return askJson<{ bios: { text: string; why: string }[] }>(
    `Propose 4 bios Instagram (150 caractères max chacune) pour @${s.instagram.handle}. Bio actuelle : ${input.current || "(vide)"}.
Doit dire en une ligne ce que fait Keeply, pour qui, une preuve ou un bénéfice, et un appel vers le lien. ${STYLE}`,
    obj({ bios: arr(obj({ text: str, why: str })) }),
    { label: "Instagram · bio" },
  );
}

export async function weekPlanTool(input: { goal?: string; context: string }) {
  const s = await getSettings();
  return askJson<{ days: { day: string; time: string; format: string; pillar: string; idea: string; caption_start: string }[]; tips: string[] }>(
    `Construis le planning Instagram de la semaine pour Keeply (objectif : ${input.goal || "gagner des abonnés qualifiés (restaurateurs)"}).
Rubriques : ${s.instagram.pillars.join(", ")}.
Données du compte :\n${input.context}
Donne 5 à 7 publications (jour, heure conseillée selon les meilleurs créneaux observés, format, rubrique, idée, début de légende) et 3 conseils précis pour la semaine. ${STYLE}`,
    obj({ days: arr(obj({ day: str, time: str, format: str, pillar: str, idea: str, caption_start: str })), tips: arr(str) }),
    { effort: "medium", label: "Instagram · planning semaine" },
  );
}

export async function coachTool(input: { question: string; context: string }) {
  return {
    answer: await askText(
      `Tu es le coach Instagram de Keeply. Voici les chiffres du compte :\n${input.context}\n\nQuestion : ${input.question}\n\nRéponds en t'appuyant sur ces chiffres, avec des actions concrètes à faire cette semaine. Format court, titres en gras si utile.`,
      { effort: "medium", label: "Instagram · coach" },
    ),
  };
}

export async function adCopyTool(input: { objective: string; audience: string; angle?: string }) {
  return askJson<{ ads: { primary: string; headline: string; description: string; cta: string; visual: string }[] }>(
    `Écris 5 variantes d'annonces Meta (Facebook + Instagram) pour Keeply.
Objectif : ${input.objective}
Audience : ${input.audience}
${input.angle ? `Angle : ${input.angle}` : "Varie les angles : perte de clients, simplicité, preuve, coût du papier, rappels automatiques."}
Pour chaque variante : texte principal (125 caractères conseillés, 1 à 3 phrases), titre (40 caractères max), description (30 caractères), bouton conseillé, et une idée de visuel ou de vidéo. ${STYLE}`,
    obj({ ads: arr(obj({ primary: str, headline: str, description: str, cta: str, visual: str })) }),
    { label: "Meta Ads · annonces" },
  );
}

/* ---------- Avis, mails, briefing ---------- */

export async function reviewReplyTool(input: { rating: number; body: string; store: string }) {
  const s = await getSettings();
  return askJson<{ reply: string }>(
    `Rédige la réponse publique de Keeply à cet avis ${input.store === "appstore" ? "App Store" : "Google Play"} (${input.rating}/5).
${untrusted("avis", input.body)}
Remercie sans flatter, réponds au point soulevé, si c'est un bug donne une piste concrète ou invite à écrire au support. 350 caractères max. Signe « ${s.signature} ».`,
    obj({ reply: str }),
    { label: "Avis · réponse" },
  );
}

export async function mailReplyTool(input: { from: string; subject: string; text: string; intent?: string }) {
  const s = await getSettings();
  return askJson<{ subject: string; body: string }>(
    `Rédige une réponse à ce mail reçu par Keeply.
Expéditeur : ${input.from}
Objet : ${input.subject}
${untrusted("mail", input.text)}
${input.intent ? `Ce que je veux répondre : ${input.intent}` : "Réponds au mieux, propose une solution ou une prochaine étape claire."}
Vouvoiement, ton professionnel et humain, court. Signature : ${s.signature}. Ne promets rien que tu ne peux pas savoir (dates, prix) : mets [À COMPLÉTER] si une info manque.`,
    obj({ subject: str, body: str }),
    { label: "Mails · réponse" },
  );
}

export async function mailTriageTool(mails: { id: string; from: string; subject: string; text: string }[]) {
  return askJson<{ items: { id: string; priority: number; category: string; summary: string; action: string }[] }>(
    `Trie ces mails reçus par le fondateur de Keeply.
Priorité de 1 (peut attendre) à 5 (à traiter dans l'heure : client bloqué, panne, argent, presse avec échéance, gros partenariat).
Catégories : client, prospect, partenariat, support, facturation, presse, store, notification, newsletter, perso, autre.
Pour chaque mail : un résumé en une phrase et l'action à faire.
${untrusted("mails", JSON.stringify(mails), 40000)}`,
    obj({
      items: arr(
        obj({ id: str, priority: num, category: oneOf("client", "prospect", "partenariat", "support", "facturation", "presse", "store", "notification", "newsletter", "perso", "autre"), summary: str, action: str }),
      ),
    }),
    { label: "Mails · tri", model: "haiku" },
  );
}

export async function briefTool(context: string) {
  return {
    brief: await askText(
      `Voici l'état de Keeply aujourd'hui :\n${context}\n\nÉcris mon briefing du matin : 3 points clés (ce qui va bien, ce qui coince), puis les 3 actions les plus utiles à faire aujourd'hui, dans l'ordre. 150 mots maximum, en Markdown simple.`,
      { effort: "medium", label: "Briefing du matin" },
    ),
  };
}

export async function healthSummaryTool(context: string) {
  return askText(
    `Voici le résultat des tests automatiques de Keeply (site, app, fiches stores, erreurs, avis) :\n${context}\n\nRésume en 4 lignes maximum : ce qui est cassé, la cause probable, l'urgence et la première chose à vérifier. Si tout va bien, dis-le en une ligne.`,
    { effort: "low", label: "Santé · résumé", model: "haiku" },
  );
}

export const ATELIER_PRESETS = {
  aso: "Rédige la description App Store / Google Play de Keeply (sous-titre 30 caractères, texte promotionnel 170 caractères, description structurée) et propose 20 mots-clés ASO séparés par des virgules (100 caractères max au total pour Apple).",
  nouveautes: "Rédige le texte « Nouveautés de cette version » pour l'App Store à partir de ces changements :",
  linkedin: "Écris un post LinkedIn de fondateur (sans emojis inutiles, avec une histoire vraie) sur :",
  newsletter: "Écris une newsletter courte pour les restaurateurs clients de Keeply sur :",
  faq: "Écris la réponse de FAQ, claire et rassurante, à la question :",
  sms: "Écris 5 SMS promotionnels (160 caractères max) qu'un café client de Keeply pourrait envoyer à ses clients fidèles pour :",
  pitch: "Écris un pitch de 30 secondes à dire à l'oral à un gérant de restaurant, puis les réponses aux 5 objections les plus fréquentes (prix, temps, mes clients sont âgés, j'ai déjà une carte papier, je n'ai pas besoin).",
} as const;

export async function atelierTool(input: { preset: keyof typeof ATELIER_PRESETS | "libre"; text: string }) {
  const intro = input.preset === "libre" ? "" : ATELIER_PRESETS[input.preset];
  return { text: await askText(`${intro}\n${input.text}\n\n${STYLE}`, { effort: "medium", label: "Atelier d'écriture" }) };
}

/* ---------- Prospection ---------- */

const LANG_NAMES: Record<string, string> = { fr: "français", en: "anglais", es: "espagnol", it: "italien", de: "allemand", nl: "néerlandais", pt: "portugais", ar: "français (le Maroc et la Tunisie écrivent en français en B2B)" };

export interface ProspectDraft {
  id: string;
  fit: number;
  fitReason: string;
  angle: string;
  subject: string;
  body: string;
  followUps: { delayDays: number; subject: string; body: string }[];
}

function describe(p: Prospect) {
  return [
    `id: ${p.id}`,
    `établissement: ${p.name}, ${p.type} à ${p.city} (${p.country}), langue du mail: ${LANG_NAMES[p.lang] ?? "français"}`,
    `faits: ${[
      p.rating ? `note Google ${p.rating}/5 (${p.reviews ?? "?"} avis)` : "",
      p.instagram ? `Instagram @${p.instagram}` : "",
      p.website ? `site ${p.website}` : "pas de site web",
      ...p.signals,
    ]
      .filter(Boolean)
      .join(" ; ")}`,
    p.siteSnippet ? untrusted("extrait_site_" + p.id, p.siteSnippet, 1500) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Qualifie et rédige pour plusieurs établissements en UNE seule demande à Claude
 * (5 par appel = 5 fois moins de crédits qu'un appel par mail).
 */
export async function prospectEmailsBatchTool(ps: Prospect[]): Promise<{ demo?: boolean; drafts: ProspectDraft[] }> {
  const s = await getSettings();
  const sender = s.prospecting.senderName || s.ownerName || "L'équipe Keeply";
  const followUpDays = s.prospecting.followUpDays;
  if (!(await aiAvailable())) {
    return {
      demo: true,
      drafts: ps.map((p) => ({ id: p.id, fit: 5, fitReason: "Estimation sans IA", angle: "", ...fallbackProspectEmail(p, sender, followUpDays, s.prospecting.optOutLine, s.prospecting.offer) })),
    };
  }
  const res = await askJson<{ drafts: ProspectDraft[] }>(
    `Voici ${ps.length} établissements à prospecter. Pour CHACUN (même id), qualifie-le puis écris sa séquence.

${ps.map(describe).join("\n\n---\n\n")}

Keeply : ${s.prospecting.pitch}
Offre : ${s.prospecting.offer}
${s.prospecting.calendarLink ? `Lien pour réserver 15 min (relances seulement) : ${s.prospecting.calendarLink}` : ""}
Expéditeur et signature : ${sender}
Dernière ligne de chaque mail : « ${s.prospecting.optOutLine} »
Relances : ${followUpDays.length} (J+${followUpDays.join(", J+")}). La dernière est la clôture.

Pour chaque établissement : fit (1 à 10), fitReason (une phrase), angle (le signal choisi comme accroche), subject, body, followUps. Si fit est de 4 ou moins, écris quand même un mail sobre mais explique pourquoi dans fitReason.
Chaque mail doit être différent des autres : ne recopie pas la même structure en changeant le nom.`,
    obj({ drafts: arr(obj({ id: str, fit: num, fitReason: str, angle: str, subject: str, body: str, followUps: arr(obj({ delayDays: num, subject: str, body: str })) })) }),
    { system: `${PROSPECT_PLAYBOOK}\n\n${STYLE}`, effort: "medium", label: "Prospection · qualification + mails", model: "opus" },
  );
  const known = new Set(ps.map((p) => p.id));
  return { drafts: res.drafts.filter((d) => known.has(d.id)) };
}

/** Un seul établissement (garde l'ancienne signature). */
export async function prospectEmailTool(p: Prospect, siteText?: string) {
  const { demo, drafts } = await prospectEmailsBatchTool([{ ...p, siteSnippet: siteText ?? p.siteSnippet }]);
  const d = drafts[0];
  if (!d) throw new Error("Claude n'a pas rendu de mail pour cet établissement.");
  return { demo, subject: d.subject, body: d.body, followUps: d.followUps, fit: d.fit, fitReason: d.fitReason, angle: d.angle };
}

/* ---------- Secours sans IA ---------- */

function fallbackCaptions(topic: string, tags: string) {
  return [
    { hook: `${topic} : la petite chose qui change tout`, caption: `Vos clients de passage ne reviennent pas ? Souvent, ils ont juste oublié votre carte.\n\nAvec une carte dans leur Wallet, elle est toujours sur eux. Et un rappel leur dit quand il ne manque plus qu'un tampon.`, hashtags: tags, cta: "Enregistrez ce post pour plus tard." },
    { hook: `On a demandé à 50 gérants de café ce qui marche pour fidéliser`, caption: `Réponse n°1 : la récompense doit être proche. 10 tampons, c'est loin. 6, ça motive.\n\n${topic}`, hashtags: tags, cta: "Dites-nous en commentaire combien de tampons vous demandez." },
    { hook: `Carte papier ou carte dans le téléphone ?`, caption: `Papier : perdue, oubliée, lavée.\nWallet : toujours là, et elle rappelle à votre client de revenir.\n\n${topic}`, hashtags: tags, cta: "Lien en bio pour essayer 14 jours." },
  ];
}

const FALLBACK_IDEAS = [
  { title: "3 erreurs qui font fuir vos clients fidèles", format: "Carrousel", hook: "La n°2 coûte des centaines d'euros par mois", outline: "Couverture choc / Erreur 1 : récompense trop lointaine / Erreur 2 : pas de rappel / Erreur 3 : carte papier / Solution + CTA", why: "Contenu utile = enregistrements et partages entre restaurateurs." },
  { title: "Démo : un tampon en 2 secondes", format: "Reel", hook: "Regardez la caisse, pas le téléphone", outline: "Client tend son téléphone / scan / tampon qui s'ajoute / réaction / texte final", why: "Montre le produit sans le vendre, se partage facilement." },
  { title: "Avant / après d'un café client", format: "Carrousel", hook: "+38 % de visites en 2 mois", outline: "Le café / le problème / ce qu'ils ont mis en place / les chiffres / citation du gérant", why: "La preuve sociale convertit les visiteurs du profil en abonnés." },
  { title: "POV : le client a encore oublié sa carte", format: "Reel", hook: "POV : « je l'ai laissée dans mon autre veste »", outline: "Sketch 7 secondes / chute avec la carte dans le Wallet", why: "L'humour de métier se partage entre pros." },
  { title: "Combien vaut un client fidèle ?", format: "Carrousel", hook: "Faites le calcul avec nous", outline: "Ticket moyen × visites par mois × 12 / coût d'un nouveau client / conclusion", why: "Chiffres concrets = enregistrements." },
  { title: "Les coulisses d'une carte Keeply", format: "Story", hook: "On vous montre comment on la dessine", outline: "Croquis / couleurs / test en vrai / sondage « laquelle vous préférez ? »", why: "Les sondages en story augmentent la portée des posts suivants." },
];

const FALLBACK_HOOKS = [
  "Votre carte de fidélité est dans la poubelle de vos clients",
  "Ce café a doublé ses habitués sans pub",
  "Arrêtez de donner le 10e café gratuit",
  "La question que tous les gérants me posent",
  "3 secondes en caisse. C'est tout.",
  "POV : votre client a oublié sa carte. Encore.",
  "Combien vous coûte un client qui ne revient pas ?",
  "Le tampon le plus rapide de France ?",
];

const FALLBACK_HASHTAGS = [
  { name: "Niche", tags: ["cartedefidelite", "fidelisationclient", "programmefidelite", "applewallet", "googlewallet", "fideliteclient", "tamponfidelite", "clientfidele"] },
  { name: "Moyens", tags: ["restaurateur", "gerantderestaurant", "cafeindependant", "commercedeproximite", "boulangerieartisanale", "coffeeshopfrance", "restaurationrapide", "entrepreneurfrancais"] },
  { name: "Ville & local", tags: ["lyoncafe", "parisrestaurant", "bordeauxfood", "marseillefood", "bruxellesresto", "geneverestaurant", "lillefood", "toulousefood"] },
];

function fallbackProspectEmail(p: Prospect, sender: string, followUpDays: number[], optOut: string, offer: string) {
  const hello = "Bonjour,";
  const detail = p.rating && p.reviews ? `Avec ${p.reviews} avis à ${String(p.rating).replace(".", ",")}/5, vos clients vous adorent déjà.` : `J'ai découvert ${p.name} en cherchant les adresses à ${p.city}.`;
  const body = `${hello}\n\n${detail} La question, c'est combien reviennent vraiment chaque semaine.\n\nKeeply met votre carte de fidélité dans l'iPhone et l'Android de vos clients, sans application à installer : ils scannent un QR code, la carte reste dans leur Wallet et leur rappelle de revenir.\n\n${offer}\n\nJe vous montre en 10 minutes ?\n\n${sender}\n\n${optOut}`;
  return {
    demo: true,
    subject: `carte de fidélité ${p.name.toLowerCase()}`,
    body,
    followUps: followUpDays.map((d, i) => ({
      delayDays: d,
      subject: i === 0 ? `re: carte de fidélité ${p.name.toLowerCase()}` : `${p.name.toLowerCase()} et vos habitués`,
      body:
        i === 0
          ? `${hello}\n\nJe me permets de relancer : un café de ${p.city} qui utilise Keeply a vu ses clients revenir plus souvent dès le premier mois.\n\nUn essai gratuit de 14 jours vous intéresse ?\n\n${sender}`
          : `${hello}\n\nDernier message de ma part. Si la fidélité de vos clients n'est pas un sujet en ce moment, aucun souci.\n\nSinon, répondez « oui » et je vous envoie un exemple de carte aux couleurs de ${p.name}.\n\n${sender}`,
    })),
  };
}
