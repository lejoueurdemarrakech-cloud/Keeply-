import { eur, pct } from "@/lib/format";

export interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  results: number;
  costPerResult: number;
  frequency: number;
  revenue: number;
}

export interface Ads {
  live: boolean;
  error?: string;
  campaigns: Campaign[];
  daily: { date: string; spend: number; clicks: number; results: number }[];
}

/** Prix Keeply, utilisés pour la rentabilité (voir CONTEXTE-KEEPLY.md). */
export const PRICE_MONTH = 39.99;
export const PRICE_YEAR = 359.99;

export const OBJECTIVE_LABEL: Record<string, string> = {
  OUTCOME_APP_PROMOTION: "Installations",
  OUTCOME_TRAFFIC: "Trafic",
  OUTCOME_LEADS: "Prospects",
  OUTCOME_AWARENESS: "Notoriété",
  OUTCOME_ENGAGEMENT: "Interactions",
  OUTCOME_SALES: "Ventes",
};
export const objectiveLabel = (o: string) => OBJECTIVE_LABEL[o] ?? o;

export type Alert = { level: "danger" | "warn"; text: string; fix: string };

/** Règles simples, lisibles par un non-spécialiste. Seuils indicatifs. */
export function alerts(c: Campaign): Alert[] {
  const out: Alert[] = [];
  if (c.results === 0 && c.spend > 30) out.push({ level: "danger", text: `${eur(c.spend)} dépensés sans aucun résultat.`, fix: "Vérifie le suivi des conversions (SDK, pixel) ou mets la campagne en pause." });
  if (c.frequency > 3) out.push({ level: "warn", text: `Fréquence de ${c.frequency.toFixed(1).replace(".", ",")} : les mêmes personnes voient trop souvent la pub.`, fix: "Change le visuel ou élargis l'audience." });
  if (c.ctr < 0.008 && c.impressions > 2000) out.push({ level: "warn", text: `Taux de clic faible (${pct(c.ctr, 2)}).`, fix: "Teste une autre accroche dans les 2 premières secondes ou un autre visuel." });
  if (c.cpm > 15) out.push({ level: "warn", text: `CPM élevé (${eur(c.cpm, true)} pour 1 000 affichages).`, fix: "Audience trop étroite ou très disputée : élargis-la ou laisse Meta optimiser (Advantage+)." });
  return out;
}

/**
 * Score de santé indicatif sur 100 : clic, fréquence, coût par résultat
 * comparé à la moyenne du compte, et présence de résultats.
 */
export function score(c: Campaign, avgCpr: number) {
  if (c.spend === 0) return null;
  let s = 0;
  s += Math.min(30, (c.ctr / 0.015) * 30); // 1,5 % de clic = plein
  s += c.frequency <= 2 ? 20 : c.frequency <= 3 ? 12 : 4;
  s += c.results > 0 ? 20 : 0;
  if (c.results > 0 && avgCpr > 0) s += Math.max(0, Math.min(30, 30 * (1.5 - c.costPerResult / avgCpr)));
  return Math.round(Math.max(0, Math.min(100, s)));
}

export const scoreTone = (s: number) => (s >= 70 ? "var(--mint)" : s >= 45 ? "var(--honey)" : "var(--coral)");
export const scoreLabel = (s: number) => (s >= 70 ? "En forme" : s >= 45 ? "À surveiller" : "À corriger");

export function totals(cs: Campaign[]) {
  const t = cs.reduce(
    (s, c) => ({ spend: s.spend + c.spend, results: s.results + c.results, clicks: s.clicks + c.clicks, impressions: s.impressions + c.impressions, reach: s.reach + c.reach, revenue: s.revenue + c.revenue }),
    { spend: 0, results: 0, clicks: 0, impressions: 0, reach: 0, revenue: 0 },
  );
  return {
    ...t,
    cpr: t.results ? t.spend / t.results : 0,
    ctr: t.impressions ? t.clicks / t.impressions : 0,
    cpm: t.impressions ? (t.spend / t.impressions) * 1000 : 0,
    cpc: t.clicks ? t.spend / t.clicks : 0,
    clickToResult: t.clicks ? t.results / t.clicks : 0,
    roas: t.spend && t.revenue ? t.revenue / t.spend : 0,
  };
}
