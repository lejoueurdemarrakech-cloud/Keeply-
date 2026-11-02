import { INSTAGRAM_PLAN, type LaunchPost } from "@/lib/launch-plan";
import { STORIES_PLAN, type StorySeq } from "@/lib/stories-plan";

/** Un post ou une séquence de stories du plan de lancement, placé à sa date. */
export type PlanItem =
  | { kind: "post"; id: string; date: string; heure: string; titre: string; format: string; post: LaunchPost }
  | { kind: "story"; id: string; date: string; heure: string; titre: string; format: string; story: StorySeq };

const MONTHS: Record<string, string> = { "janv.": "01", "févr.": "02", mars: "03", "avr.": "04", mai: "05", juin: "06", "juil.": "07", août: "08", "sept.": "09", "oct.": "10", "nov.": "11", "déc.": "12" };

/** « dimanche 15 nov. » ou « mardi 1er déc. » → 2026-11-15. */
export function planDate(jour: string, year = 2026) {
  const m = jour.match(/(\d{1,2})(?:er)?\s+([a-zéû.]+)/i);
  if (!m) return "";
  const month = MONTHS[m[2].toLowerCase()] ?? MONTHS[m[2].toLowerCase() + "."];
  return month ? `${year}-${month}-${m[1].padStart(2, "0")}` : "";
}

export const PLAN_ITEMS: PlanItem[] = [
  ...INSTAGRAM_PLAN.posts.map((p) => ({ kind: "post" as const, id: p.id, date: planDate(p.jour), heure: p.heure, titre: p.titre, format: p.format, post: p })),
  ...STORIES_PLAN.map((s) => ({ kind: "story" as const, id: s.id, date: s.date, heure: s.heure, titre: s.titre, format: `Stories (${s.slides.length})`, story: s })),
]
  .filter((i) => i.date)
  .sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure));

export const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Ce qu'il faut préparer : publication aujourd'hui, demain ou après-demain (prévenu 2 jours avant). */
export function dueSoon(now = new Date(), days = 2) {
  const from = isoLocal(now);
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  const to = isoLocal(end);
  return PLAN_ITEMS.filter((i) => i.date >= from && i.date <= to);
}

export function longDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

/** Commande à coller dans Claude Code pour créer le contenu. */
export function promptFor(i: PlanItem) {
  const when = `${longDate(i.date)} à ${i.heure}`;
  const common =
    "Utilise mes nouvelles cartes Keeply (entières, bien cadrées, jamais l'ancienne carte photo plein écran), la direction artistique « Ils reviennent » (phrases courtes, beaucoup de blanc) et les règles Keeply (aucun faux témoignage, produit offert = coupon, options activables). Keeply est sur l'App Store dans tous nos pays, Android bientôt sur Google Play. Range les fichiers dans Keeply-Pub/insta/lancement/" +
    i.id +
    "/ et montre-moi le résultat avant de publier.";
  if (i.kind === "post") {
    const p = i.post;
    return `Claudinho, crée le post ${p.id} « ${p.titre} » du plan de lancement de Keeply HQ (${p.format}, publication le ${when}).

Accroche : ${p.accroche}

Visuel : ${p.visuel}

Légende prévue :
${p.legende}

Hashtags : ${p.hashtags.join(" ")}
Appel à l'action : ${p.cta}
Pourquoi ce post : ${p.pourquoi}

Formats : ${p.format === "Reel" ? "vidéo verticale 1080×1920 (zone de sécurité Instagram respectée), version sans musique + texte à l'écran" : p.format === "Carrousel" ? "slides 1080×1350" : "image 1080×1350"}. ${common}`;
  }
  const s = i.story;
  return `Claudinho, crée la séquence de stories ${s.id} « ${s.titre} » du plan de lancement de Keeply HQ (${s.slides.length} stories, ${when}${s.lien_post ? `, liée au post ${s.lien_post}` : ""}).

Objectif : ${s.objectif}

${s.slides.map((sl, n) => `Story ${n + 1}\n  Texte : ${sl.texte}\n  Visuel : ${sl.visuel}${sl.sticker ? `\n  Sticker : ${sl.sticker}` : ""}`).join("\n\n")}

Format : 1080×1920, textes hors des zones couvertes par l'interface d'Instagram (haut 250 px, bas 340 px). Les stickers se posent dans l'app au moment de publier : indique où les placer. ${common}`;
}
