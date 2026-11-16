import { ACCOUNT_LABEL, BASE_ITEMS, type PlanItem } from "@/lib/plan-v7";

export type { PlanItem } from "@/lib/plan-v7";

/** Ce que le fondateur a changé sur un élément du plan (gardé dans le store, clé ig-plan-v7). */
export type PlanStatus = "afaire" | "pret" | "publie";
export interface PlanOverride {
  date?: string;
  heure?: string;
  status?: PlanStatus;
  note?: string;
}
export type PlanOverrides = Record<string, PlanOverride>;

export type LivePlanItem = PlanItem & { status: PlanStatus; note?: string; moved: boolean };

/** Le plan de départ, sans les déplacements. */
export const PLAN_ITEMS: PlanItem[] = BASE_ITEMS;

export function applyOverrides(overrides: PlanOverrides = {}): LivePlanItem[] {
  return BASE_ITEMS.map((i) => {
    const o = overrides[i.id] ?? {};
    const date = o.date ?? i.date;
    const heure = o.heure ?? i.heure;
    return { ...i, date, heure, status: o.status ?? "afaire", note: o.note, moved: date !== i.date || heure !== i.heure };
  }).sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure));
}

export const isoLocal = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Ce qu'il faut préparer : publication aujourd'hui, demain ou après-demain (prévenu 2 jours avant). */
export function dueSoon(items: LivePlanItem[], now = new Date(), days = 2) {
  const from = isoLocal(now);
  const end = new Date(now);
  end.setDate(end.getDate() + days);
  const to = isoLocal(end);
  return items.filter((i) => i.date >= from && i.date <= to && i.status !== "publie" && !i.repostOf);
}

export function longDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

const RULES =
  "Règles Keeply : on parle aux PATRONS (fast-foods, cafés, restaurants), une idée par visuel, beaucoup de blanc, vrais écrans de l'app, cartes du Studio HQ entières et bien cadrées. Aucun faux témoignage, aucun chiffre inventé (un exemple est écrit « exemple »), un produit offert passe par un coupon, rappeler que les options s'activent ou se coupent. Pas de tiret cadratin. Passe les textes au skill unslop. Charge les skills marketing (ig-reel, ig-carousel, ig-story, ig-caption) et vidéo (Remotion / HyperFrames) utiles.";

/** Commande à coller dans Claude Code pour fabriquer le contenu. */
export function promptFor(i: PlanItem & { date: string; heure: string }) {
  const lang = i.account === "en" ? "EN ANGLAIS uniquement (compte anglais : aucun mot de français)" : "en français uniquement";
  const where = `Range les fichiers dans Keeply-Pub/insta/v7/${i.id}/ et montre-moi le résultat avant de publier.`;
  const when = `${longDate(i.date)} à ${i.heure} (heure de Paris)`;
  const head = `Claudinho, crée le contenu ${i.id} « ${i.titre} » pour ${ACCOUNT_LABEL[i.account]}, ${lang}. Publication : ${when}.`;

  if (i.repostOf) {
    return `${head}\n\nC'est le repartage en story du post ${i.repostOf}. Fais une story 1080×1920 qui reprend le visuel du post avec une phrase courte (« ${i.accroche} ») et indique où poser le sticker « nouveau post ». ${where}`;
  }
  if (i.kind === "story") {
    return `${head}\n\nSéquence de ${i.slides?.length ?? 0} stories. Objectif : ${i.contenu}\n\n${(i.slides ?? [])
      .map((s, n) => `Story ${n + 1}\n  Texte : ${s.texte}\n  Visuel : ${s.visuel}${s.sticker ? `\n  Sticker : ${s.sticker}` : ""}`)
      .join("\n\n")}\n\nFormat 1080×1920, textes hors des zones couvertes par Instagram (haut 250 px, bas 340 px). Les stickers se posent dans l'app : indique où. ${RULES} ${where}`;
  }
  const size = i.format === "Carrousel" ? "slides 1080×1350" : i.format === "Photo" ? "image 1080×1350" : "vidéo verticale 1080×1920 (zones de sécurité respectées), texte à l'écran, une version sans musique";
  return `${head}

Type : ${i.type}${i.hook ? ` · formule d'accroche ${i.hook}` : ""}
Accroche (les 2 premières secondes) : ${i.accroche}

À fabriquer :
${i.contenu}

Légende :
${i.legende ?? ""}

Hashtags : ${(i.hashtags ?? []).join(" ")}
Appel à l'action : ${i.cta ?? ""}

Format : ${size}. ${RULES} ${where}`;
}
