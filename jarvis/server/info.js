/* Météo (Open-Meteo) et actualités (flux RSS publics) : gratuits, sans clé. */

const UA = "Jarvis/1.0 (assistant personnel)";
const cache = new Map();

async function cached(key, minutes, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < minutes * 60_000) return hit.v;
  const v = await fn();
  cache.set(key, { at: Date.now(), v });
  return v;
}

async function getJson(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(7000) });
  if (!r.ok) throw new Error(`${new URL(url).host} : ${r.status}`);
  return r.json();
}

const LABELS = [
  [[0], "ciel dégagé"],
  [[1, 2], "quelques nuages"],
  [[3], "couvert"],
  [[45, 48], "brouillard"],
  [[51, 53, 55, 56, 57], "bruine"],
  [[61, 63, 65, 66, 67, 80, 81, 82], "pluie"],
  [[71, 73, 75, 77, 85, 86], "neige"],
  [[95, 96, 99], "orage"],
];
export const weatherLabel = (c) => LABELS.find(([codes]) => codes.includes(c))?.[1] ?? "temps variable";

export async function weather(city) {
  const name = String(city || "Paris").trim().slice(0, 60);
  try {
    return await cached("w:" + name.toLowerCase(), 20, async () => {
      const geo = await getJson(`https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name, count: "1", language: "fr" })}`);
      const p = geo.results?.[0];
      if (!p) throw new Error("ville introuvable");
      const f = await getJson(
        `https://api.open-meteo.com/v1/forecast?${new URLSearchParams({
          latitude: String(p.latitude),
          longitude: String(p.longitude),
          current: "temperature_2m,apparent_temperature,wind_speed_10m,weather_code,relative_humidity_2m",
          hourly: "temperature_2m,precipitation_probability",
          daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,sunrise,sunset",
          timezone: "auto",
          forecast_days: "3",
        })}`,
      );
      const d = f.daily;
      const nowH = new Date().getHours();
      return {
        city: p.name,
        temp: Math.round(f.current.temperature_2m),
        feels: Math.round(f.current.apparent_temperature),
        wind: Math.round(f.current.wind_speed_10m),
        humidity: f.current.relative_humidity_2m,
        code: f.current.weather_code,
        label: weatherLabel(f.current.weather_code),
        hours: f.hourly.time.slice(nowH, nowH + 12).map((t, i) => ({ h: new Date(t).getHours(), temp: Math.round(f.hourly.temperature_2m[nowH + i]), rain: f.hourly.precipitation_probability[nowH + i] ?? 0 })),
        days: d.time.map((t, i) => ({ date: t, min: Math.round(d.temperature_2m_min[i]), max: Math.round(d.temperature_2m_max[i]), rain: d.precipitation_probability_max[i] ?? 0, label: weatherLabel(d.weather_code[i]) })),
        sunrise: d.sunrise[0],
        sunset: d.sunset[0],
      };
    });
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

const gnews = (q, gl = "FR") => `https://news.google.com/rss/search?${new URLSearchParams({ q, hl: "fr", gl, ceid: `${gl}:fr` })}`;
export const FEEDS = {
  une: { label: "À la une", url: "https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr" },
  maroc: { label: "Maroc", url: "https://news.google.com/rss?hl=fr&gl=MA&ceid=MA:fr" },
  tech: { label: "Tech", url: gnews("technologie OR intelligence artificielle when:2d") },
  apple: { label: "Apple", url: gnews("Apple iPhone App Store when:3d") },
  sport: { label: "Sport", url: gnews("football Ligue des champions OR Ligue 1 when:1d") },
  eco: { label: "Économie", url: gnews("économie bourse when:1d") },
  resto: { label: "Restauration", url: gnews("restauration rapide OR restaurateurs OR fast-food when:3d") },
  fidelite: { label: "Fidélité", url: gnews('"carte de fidélité" OR "programme de fidélité" when:7d') },
  startups: { label: "Startups", url: gnews("startup levée de fonds when:3d") },
};

const decode = (s) =>
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

export function parseRss(xml, feed) {
  const out = [];
  for (const m of xml.matchAll(/<item\b[\s\S]*?<\/item>/g)) {
    const pick = (tag) => decode(m[0].match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1] ?? "");
    let title = pick("title");
    let source = pick("source");
    const dash = title.lastIndexOf(" - ");
    if (dash > 20) {
      source ||= title.slice(dash + 3);
      title = title.slice(0, dash);
    }
    const link = pick("link");
    if (!title || !/^https?:\/\//.test(link)) continue;
    const d = new Date(pick("pubDate") || Date.now());
    out.push({ title, source, link, date: isNaN(d) ? new Date().toISOString() : d.toISOString(), feed });
  }
  return out;
}

export async function news(feeds) {
  const ids = (feeds || []).filter((f) => FEEDS[f]).slice(0, 6);
  const lists = await Promise.all(
    ids.map((id) =>
      cached("n:" + id, 20, async () => {
        const r = await fetch(FEEDS[id].url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(7000) });
        if (!r.ok) throw new Error(String(r.status));
        return parseRss(await r.text(), id).slice(0, 8);
      }).catch(() => []),
    ),
  );
  const out = [];
  const seen = new Set();
  for (let i = 0; i < 8; i++)
    for (const l of lists) {
      const h = l[i];
      if (!h || seen.has(h.title.slice(0, 60).toLowerCase())) continue;
      seen.add(h.title.slice(0, 60).toLowerCase());
      out.push(h);
    }
  return out.slice(0, 24);
}
