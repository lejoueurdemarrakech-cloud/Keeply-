const eurFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
const eurFmt2 = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numFmt = new Intl.NumberFormat("fr-FR");
const compactFmt = new Intl.NumberFormat("fr-FR", { notation: "compact", maximumFractionDigits: 1 });

export const eur = (n: number | undefined | null, cents = false) => (n == null ? "—" : (cents ? eurFmt2 : eurFmt).format(n));
export const num = (n: number | undefined | null) => (n == null ? "—" : numFmt.format(Math.round(n)));
export const compact = (n: number | undefined | null) => (n == null ? "—" : compactFmt.format(n));
export const pct = (n: number | undefined | null, digits = 1) => (n == null || !isFinite(n) ? "—" : `${(n * 100).toFixed(digits).replace(".", ",")} %`);

export function delta(cur: number, prev: number) {
  if (!prev) return cur ? 1 : 0;
  return (cur - prev) / Math.abs(prev);
}

export function relative(iso: string | undefined | null) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const future = diff < 0;
  const s = Math.abs(diff);
  const say = (v: string) => (future ? `dans ${v}` : `il y a ${v}`);
  if (s < 60) return future ? "dans un instant" : "à l'instant";
  if (s < 3600) return say(`${Math.round(s / 60)} min`);
  if (s < 86400) return say(`${Math.round(s / 3600)} h`);
  if (s < 86400 * 7) return say(`${Math.round(s / 86400)} j`);
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export const dateShort = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
export const dateLong = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
export const dateTime = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
export const isoDay = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export const COUNTRY_NAMES: Record<string, string> = {
  FR: "France", BE: "Belgique", CH: "Suisse", LU: "Luxembourg", CA: "Canada", MA: "Maroc", ES: "Espagne", US: "États-Unis", GB: "Royaume-Uni",
  DE: "Allemagne", IT: "Italie", TN: "Tunisie", SN: "Sénégal", CI: "Côte d'Ivoire", NL: "Pays-Bas", PT: "Portugal", MC: "Monaco", DZ: "Algérie", AE: "Émirats",
};
export const countryName = (c: string) => COUNTRY_NAMES[c] ?? (c || "—");
export const flag = (c: string) => (c && c.length === 2 ? String.fromCodePoint(...[...c.toUpperCase()].map((ch) => 127397 + ch.charCodeAt(0))) : "🌍");
