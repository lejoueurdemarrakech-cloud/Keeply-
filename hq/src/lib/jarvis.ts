import "server-only";
import { arr, askJson, obj, oneOf, str, untrusted } from "@/lib/ai";
import { bridgeOnline, heartbeat } from "@/lib/bridge";
import { configOrNull } from "@/lib/connectors/config";
import { adsOverview } from "@/lib/connectors/meta";
import { demoAds } from "@/lib/demo";
import { UA, fetchJson } from "@/lib/http";
import { read, store, uid, update } from "@/lib/store";
import { DEFAULT_FEEDS, EDGE_VOICES, FEED_LABELS, type EdgeVoice } from "@/lib/jarvis-shared";
import { briefContext, todayOverview } from "@/lib/today";

export { DEFAULT_FEEDS, EDGE_VOICES, type EdgeVoice };

/* ============================================================
   Jarvis : l'assistant vocal de Keeply HQ.
   Ce module rassemble ce que Jarvis sait (HQ, météo, actus,
   mémoire) et pose les questions ouvertes à Claude.
   ============================================================ */

const CACHE_MIN = 20;

async function cached<T>(key: string, minutes: number, load: () => Promise<T>): Promise<T> {
  const hit = await store.get<{ at: number; v: T }>(key);
  if (hit && Date.now() - hit.at < minutes * 60_000) return hit.v;
  const v = await load();
  await store.set(key, { at: Date.now(), v });
  return v;
}

/* ---------- Météo (Open-Meteo, gratuit, sans clé) ---------- */

export interface Weather {
  city: string;
  temp: number;
  feels: number;
  wind: number;
  code: number;
  label: string;
  today: { min: number; max: number; rain: number };
  tomorrow: { min: number; max: number; rain: number; label: string };
}

const WEATHER_LABEL: [number[], string][] = [
  [[0], "ciel dégagé"],
  [[1, 2], "quelques nuages"],
  [[3], "couvert"],
  [[45, 48], "brouillard"],
  [[51, 53, 55, 56, 57], "bruine"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "pluie"],
  [[71, 73, 75, 77, 85, 86], "neige"],
  [[95, 96, 99], "orage"],
];
export const weatherLabel = (code: number) => WEATHER_LABEL.find(([c]) => c.includes(code))?.[1] ?? "temps variable";

export async function weather(city: string): Promise<Weather | null> {
  const name = city.trim().slice(0, 60) || "Paris";
  try {
    return await cached(`jarvis:weather:${name.toLowerCase()}`, CACHE_MIN, async () => {
      const geo = await fetchJson<{ results?: { latitude: number; longitude: number; name: string }[] }>(
        `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name, count: "1", language: "fr" })}`,
        { timeoutMs: 6000 },
      );
      const place = geo.results?.[0];
      if (!place) throw new Error("Ville introuvable");
      const f = await fetchJson<{
        current: { temperature_2m: number; apparent_temperature: number; wind_speed_10m: number; weather_code: number };
        daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[]; weather_code: number[] };
      }>(
        `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
          latitude: String(place.latitude),
          longitude: String(place.longitude),
          current: "temperature_2m,apparent_temperature,wind_speed_10m,weather_code",
          daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code",
          timezone: "auto",
          forecast_days: "2",
        })}`,
        { timeoutMs: 6000 },
      );
      const d = f.daily;
      return {
        city: place.name,
        temp: Math.round(f.current.temperature_2m),
        feels: Math.round(f.current.apparent_temperature),
        wind: Math.round(f.current.wind_speed_10m),
        code: f.current.weather_code,
        label: weatherLabel(f.current.weather_code),
        today: { min: Math.round(d.temperature_2m_min[0]), max: Math.round(d.temperature_2m_max[0]), rain: d.precipitation_probability_max[0] ?? 0 },
        tomorrow: { min: Math.round(d.temperature_2m_min[1]), max: Math.round(d.temperature_2m_max[1]), rain: d.precipitation_probability_max[1] ?? 0, label: weatherLabel(d.weather_code[1]) },
      };
    });
  } catch {
    return null;
  }
}

/* ---------- Actualités (flux RSS publics) ---------- */

const gnews = (q: string, gl = "FR") => `https://news.google.com/rss/search?${new URLSearchParams({ q, hl: "fr", gl, ceid: `${gl}:fr` })}`;

const FEED_URLS: Record<string, string> = {
  une: "https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr",
  maroc: "https://news.google.com/rss?hl=fr&gl=MA&ceid=MA:fr",
  tech: gnews("technologie OR intelligence artificielle when:2d"),
  apple: gnews("Apple iPhone App Store when:3d"),
  resto: gnews("restauration rapide OR restaurateurs OR fast-food when:3d"),
  fidelite: gnews('"carte de fidélité" OR "programme de fidélité" when:7d'),
  startups: gnews("startup levée de fonds France when:3d"),
};
export const NEWS_FEEDS: Record<string, { label: string; url: string }> = Object.fromEntries(Object.entries(FEED_URLS).map(([id, url]) => [id, { label: FEED_LABELS[id] ?? id, url }]));

export interface Headline {
  title: string;
  source: string;
  link: string;
  date: string;
  feed: string;
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

export function parseRss(xml: string, feed: string): Headline[] {
  const out: Headline[] = [];
  for (const m of xml.matchAll(/<item\b[\s\S]*?<\/item>/g)) {
    const item = m[0];
    const pick = (tag: string) => decode(item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");
    let title = pick("title");
    let source = pick("source");
    // Google News ajoute « - Source » à la fin du titre.
    const dash = title.lastIndexOf(" - ");
    if (dash > 20) {
      source ||= title.slice(dash + 3);
      title = title.slice(0, dash);
    }
    const link = pick("link");
    if (!title || !/^https?:\/\//.test(link)) continue;
    const date = new Date(pick("pubDate") || Date.now());
    out.push({ title, source, link, date: isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(), feed });
  }
  return out;
}

export async function news(feeds: string[]): Promise<Headline[]> {
  const ids = feeds.filter((f) => NEWS_FEEDS[f]).slice(0, 6);
  const lists = await Promise.all(
    ids.map((id) =>
      cached(`jarvis:news:${id}`, CACHE_MIN, async () => {
        const res = await fetch(NEWS_FEEDS[id].url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000), cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        return parseRss(await res.text(), id).slice(0, 8);
      }).catch(() => [] as Headline[]),
    ),
  );
  // On alterne les rubriques pour ne pas avoir 8 titres de la même.
  const merged: Headline[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < 8; i++) {
    for (const l of lists) {
      const h = l[i];
      if (!h) continue;
      const key = h.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(h);
    }
  }
  return merged.slice(0, 24);
}

/* ---------- Mémoire et historique ---------- */

export interface MemoryFact {
  id: string;
  text: string;
  at: string;
}
export interface Turn {
  role: "user" | "jarvis";
  text: string;
  at: string;
}

export const getMemory = () => read<MemoryFact[]>("jarvis:memory", []);

export async function remember(text: string) {
  const clean = text.trim().slice(0, 300);
  if (!clean) return getMemory();
  return update<MemoryFact[]>("jarvis:memory", [], (m) => [{ id: uid("m"), text: clean, at: new Date().toISOString() }, ...m.filter((f) => f.text !== clean)].slice(0, 80));
}

export const forget = (id: string) => update<MemoryFact[]>("jarvis:memory", [], (m) => m.filter((f) => f.id !== id));

export const getHistory = () => read<Turn[]>("jarvis:history", []);

export const pushHistory = (turns: Omit<Turn, "at">[]) =>
  update<Turn[]>("jarvis:history", [], (h) => [...h, ...turns.map((t) => ({ ...t, text: t.text.slice(0, 2000), at: new Date().toISOString() }))].slice(-60));

export const clearHistory = () => store.set("jarvis:history", []);

/* ---------- Pubs (résumé court) ---------- */

async function adsSummary() {
  const cfg = await configOrNull("metaads").catch(() => null);
  let data: { campaigns: { name: string; status: string; spend: number; results: number; clicks: number; impressions: number }[] };
  let live = false;
  try {
    data = cfg ? await adsOverview(cfg, 7) : demoAds();
    live = !!cfg;
  } catch {
    data = demoAds();
  }
  const spend = data.campaigns.reduce((s, c) => s + c.spend, 0);
  const results = data.campaigns.reduce((s, c) => s + c.results, 0);
  const clicks = data.campaigns.reduce((s, c) => s + c.clicks, 0);
  const impressions = data.campaigns.reduce((s, c) => s + c.impressions, 0);
  return {
    live,
    spend,
    results,
    cpr: results ? spend / results : 0,
    ctr: impressions ? clicks / impressions : 0,
    active: data.campaigns.filter((c) => c.status === "ACTIVE").length,
    best: [...data.campaigns].filter((c) => c.results > 0).sort((a, b) => a.spend / a.results - b.spend / b.results)[0]?.name ?? null,
  };
}

/* ---------- Instantané : tout ce que Jarvis sait, en un appel ---------- */

export async function snapshot(opts: { city: string; feeds: string[] }) {
  const [today, ads, w, headlines, memory, hb, online] = await Promise.all([
    todayOverview(),
    cached("jarvis:ads7", 15, adsSummary).catch(() => null),
    weather(opts.city),
    news(opts.feeds),
    getMemory(),
    heartbeat(),
    bridgeOnline(),
  ]);
  return { at: new Date().toISOString(), today, ads, weather: w, news: headlines, memory, bridge: { online, host: hb?.host ?? null, claude: hb?.claude ?? null } };
}

export type Snapshot = Awaited<ReturnType<typeof snapshot>>;

/* ---------- Questions ouvertes : Claude ---------- */

export type Personality = "sobre" | "chaleureux" | "concis";

const PERSONA: Record<Personality, string> = {
  sobre: "Ton : posé, précis, un peu britannique, une pointe d'humour très rare.",
  chaleureux: "Ton : chaleureux et encourageant, comme un associé qui croit au projet.",
  concis: "Ton : ultra concis. Une ou deux phrases, jamais plus.",
};

export interface JarvisReply {
  say: string;
  detail: string;
  actions: { type: "task" | "note" | "remember" | "open"; text: string; href: string }[];
}

const PAGES = "/, /valider, /ventes, /sante, /reseaux, /instagram, /ads, /prospection, /harvey, /mails, /clients, /avis, /taches, /outils, /claude, /connexions, /reglages";

export async function askJarvis(input: { text: string; personality: Personality; city: string; feeds: string[]; owner?: string }) {
  const [snap, history] = await Promise.all([snapshot({ city: input.city, feeds: input.feeds }), getHistory()]);
  const t = snap.today;
  const ctx = [
    `Date et heure : ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris", dateStyle: "full", timeStyle: "short" })} (heure de Paris).`,
    briefContext(t),
    snap.ads ? `Meta Ads (7 jours${snap.ads.live ? "" : ", données d'exemple"}) : ${snap.ads.spend.toFixed(0)} € dépensés, ${snap.ads.results} résultats, ${snap.ads.cpr.toFixed(2)} € par résultat, ${snap.ads.active} campagne(s) active(s).` : "",
    snap.weather ? `Météo à ${snap.weather.city} : ${snap.weather.temp} °C, ${snap.weather.label}. Aujourd'hui ${snap.weather.today.min} à ${snap.weather.today.max} °C, pluie ${snap.weather.today.rain} %. Demain ${snap.weather.tomorrow.label}, ${snap.weather.tomorrow.min} à ${snap.weather.tomorrow.max} °C.` : "",
    snap.memory.length ? `Ce que le fondateur t'a demandé de retenir :\n${snap.memory.slice(0, 30).map((m) => `- ${m.text}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const headlines = snap.news.slice(0, 12).map((h) => `- ${h.title} (${h.source})`).join("\n");
  const convo = history
    .slice(-10)
    .map((h) => `${h.role === "user" ? "Fondateur" : "Jarvis"} : ${h.text}`)
    .join("\n");

  const system = `Tu es Jarvis, l'assistant vocal personnel de ${input.owner || "du fondateur"} de Keeply. Tu réponds à l'oral : ta réponse « say » sera lue par une synthèse vocale.
${PERSONA[input.personality]}
Règles :
- « say » : 1 à 4 phrases courtes, sans markdown, sans liste, sans emoji, chiffres écrits simplement (« 114 euros »). Va droit au fait.
- « detail » : facultatif, markdown court pour l'écran (liste, chiffres), sinon chaîne vide.
- Appuie-toi uniquement sur le contexte fourni. Si une donnée manque, dis-le simplement, n'invente rien. Les données marquées « exemple » ne sont pas réelles : précise-le.
- « actions » : seulement si le fondateur le demande ou si c'est clairement utile. Types : task (créer une tâche, text = titre), note (ajouter au bloc-notes, text = contenu), remember (retenir une préférence ou un fait, text = le fait), open (ouvrir une page de HQ, href parmi ${PAGES}). Laisse les champs inutiles vides.
- Tu ne peux ni envoyer de mail, ni publier, ni dépenser : propose plutôt d'ouvrir la bonne page.
- Récompenses Keeply : remises en % ou en €, un produit offert seulement sous forme de coupon.`;

  const prompt = [
    `Contexte Keeply HQ :\n${ctx}`,
    headlines ? untrusted("actualites", headlines, 3000) : "",
    convo ? `Conversation récente :\n${convo}` : "",
    `Demande du fondateur : ${input.text}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const reply = await askJson<JarvisReply>(
    prompt,
    obj({
      say: str,
      detail: str,
      actions: arr(obj({ type: oneOf("task", "note", "remember", "open"), text: str, href: str })),
    }),
    { system, label: "Jarvis", model: "sonnet", effort: "low", maxTokens: 1500 },
  );
  await pushHistory([
    { role: "user", text: input.text },
    { role: "jarvis", text: reply.say },
  ]);
  return { ...reply, actions: (reply.actions ?? []).slice(0, 4) };
}

/* ---------- Voix réaliste (Microsoft Edge, gratuite) ---------- */


const xml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function synthesize(text: string, voice: EdgeVoice, rate = 0): Promise<Buffer> {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 6000, synthesisTimeoutMs: 15000 });
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(xml(text.slice(0, 1200)), { rate: `${rate >= 0 ? "+" : ""}${Math.round(rate)}%` });
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (c: Buffer) => chunks.push(c));
      audioStream.on("end", () => resolve());
      audioStream.on("close", () => resolve());
      audioStream.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    if (buf.length < 500) throw new Error("Aucun son reçu");
    return buf;
  } finally {
    tts.close();
  }
}
