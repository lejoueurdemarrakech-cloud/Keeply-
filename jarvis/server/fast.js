import { execFile } from "node:child_process";
import { FEEDS, news, weather } from "./info.js";

/* ============================================================
   Réponses instantanées sans Claude (quelques centaines de ms) :
   foot (ESPN, logos et direct), crypto (CoinGecko), devises,
   météo de n'importe quelle ville, actus par thème, minuteur,
   et contrôle du Mac (volume, musique, apps, écran).
   Chaque fonction renvoie { say, view } (view = écran à afficher).
   ============================================================ */

const cache = new Map();
async function cached(key, seconds, fn) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < seconds * 1000) return hit.v;
  const v = await fn();
  cache.set(key, { at: Date.now(), v });
  return v;
}
async function getJson(url, ms = 6000) {
  const r = await fetch(url, { headers: { "User-Agent": "Jarvis/2.0" }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`${new URL(url).host} : ${r.status}`);
  return r.json();
}
const ymd = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const hm = (iso) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/* ---------- Foot ---------- */

export const LEAGUES = {
  "uefa.champions": { name: "Ligue des champions", words: ["ligue des champions", "champions league", "ldc", "c1"] },
  "fra.1": { name: "Ligue 1", words: ["ligue 1", "l1", "championnat de france"] },
  "eng.1": { name: "Premier League", words: ["premier league", "angleterre", "anglais"] },
  "esp.1": { name: "Liga", words: ["liga", "espagne", "espagnol"] },
  "ita.1": { name: "Serie A", words: ["serie a", "italie", "italien"] },
  "ger.1": { name: "Bundesliga", words: ["bundesliga", "allemagne", "allemand"] },
  "uefa.europa": { name: "Ligue Europa", words: ["ligue europa", "europa league", "c3"] },
  "uefa.europa.conf": { name: "Ligue Conférence", words: ["conference league", "ligue conference", "c4"] },
  "fifa.world": { name: "Coupe du monde", words: ["coupe du monde", "mondial"] },
};

async function scoreboard(league, day) {
  return cached(`fb:${league}:${ymd(day)}`, 45, async () => {
    const d = await getJson(`https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${ymd(day)}`);
    return (d.events || []).map((e) => {
      const c = e.competitions?.[0] || {};
      const [h, a] = [...(c.competitors || [])].sort((x) => (x.homeAway === "home" ? -1 : 1));
      const st = c.status?.type || {};
      return {
        league: LEAGUES[league]?.name || d.leagues?.[0]?.name || league,
        time: hm(e.date),
        date: e.date,
        state: st.state, // pre | in | post
        status: st.state === "in" ? c.status?.displayClock || "en cours" : st.state === "post" ? "terminé" : "à venir",
        home: { name: h?.team?.shortDisplayName || h?.team?.displayName, logo: h?.team?.logo, score: st.state === "pre" ? null : h?.score },
        away: { name: a?.team?.shortDisplayName || a?.team?.displayName, logo: a?.team?.logo, score: st.state === "pre" ? null : a?.score },
        venue: c.venue?.fullName || "",
      };
    });
  });
}

export async function football(text) {
  const n = text;
  const day = new Date();
  if (/\bdemain\b/.test(n)) day.setDate(day.getDate() + 1);
  if (/\bhier\b/.test(n)) day.setDate(day.getDate() - 1);
  const wanted = Object.entries(LEAGUES).filter(([, l]) => l.words.some((w) => n.includes(w))).map(([k]) => k);
  const leagues = wanted.length ? wanted : ["uefa.champions", "fra.1", "eng.1", "esp.1", "ita.1", "ger.1", "uefa.europa"];
  const lists = await Promise.all(leagues.map((l) => scoreboard(l, day).catch(() => [])));
  const matches = lists.flat().sort((a, b) => a.date.localeCompare(b.date));
  const when = /\bdemain\b/.test(n) ? "demain" : /\bhier\b/.test(n) ? "hier" : "aujourd'hui";
  if (!matches.length) return { say: `Aucun match dans les grands championnats ${when}.`, view: { kind: "matches", title: `Matchs ${when}`, matches: [] } };
  const live = matches.filter((m) => m.state === "in");
  const first = matches.find((m) => m.state === "pre");
  const say = live.length
    ? `${live.length} ${live.length > 1 ? "matchs en cours" : "match en cours"}. ${live.slice(0, 2).map((m) => `${m.home.name} ${m.home.score}, ${m.away.name} ${m.away.score}`).join(". ")}.`
    : `${matches.length} ${matches.length > 1 ? "matchs" : "match"} ${when}${first ? `, le premier à ${first.time.replace(":", " heures ")} : ${first.home.name} contre ${first.away.name}` : ""}.`;
  return { say, view: { kind: "matches", title: `Matchs ${when}`, subtitle: [...new Set(matches.map((m) => m.league))].join(" · "), matches: matches.slice(0, 24) } };
}

/* ---------- Crypto et devises ---------- */

const COINS = { bitcoin: ["bitcoin", "btc"], ethereum: ["ethereum", "eth", "ether"], solana: ["solana", "sol"], ripple: ["xrp", "ripple"], dogecoin: ["dogecoin", "doge"] };
export async function crypto(text) {
  const ids = Object.entries(COINS).filter(([, w]) => w.some((x) => new RegExp(`(^| )${x}( |$)`).test(text))).map(([k]) => k);
  const list = ids.length ? ids : ["bitcoin", "ethereum", "solana"];
  const d = await cached(`cg:${list}`, 30, () => getJson(`https://api.coingecko.com/api/v3/simple/price?ids=${list.join(",")}&vs_currencies=eur,usd&include_24hr_change=true`));
  const items = list.filter((k) => d[k]).map((k) => ({ name: k[0].toUpperCase() + k.slice(1), eur: d[k].eur, usd: d[k].usd, change: d[k].eur_24h_change }));
  const a = items[0];
  return {
    say: a ? `${a.name} : ${Math.round(a.eur).toLocaleString("fr-FR")} euros, ${a.change >= 0 ? "en hausse" : "en baisse"} de ${Math.abs(a.change).toFixed(1).replace(".", ",")} % sur 24 heures.` : "Je n'ai pas trouvé ce cours.",
    view: { kind: "crypto", title: "Crypto", subtitle: "Cours en direct · 24 h", items },
  };
}

const CUR = { euro: "EUR", euros: "EUR", eur: "EUR", dollar: "USD", dollars: "USD", usd: "USD", dirham: "MAD", dirhams: "MAD", mad: "MAD", livre: "GBP", livres: "GBP", franc: "CHF", "franc suisse": "CHF", chf: "CHF", "dollar canadien": "CAD", cad: "CAD" };
const SPOKEN = { EUR: "euros", USD: "dollars", MAD: "dirhams", GBP: "livres", CHF: "francs suisses", CAD: "dollars canadiens" };
export async function fx(text) {
  const found = Object.entries(CUR).filter(([w]) => new RegExp(`(^| )${w}( |$)`).test(text)).map(([, c]) => c);
  const amount = Number((text.match(/(\d+(?:[.,]\d+)?)/) || [])[1]?.replace(",", ".")) || 1;
  const from = found[0] || "EUR";
  const to = found.find((c) => c !== from) || (from === "EUR" ? "MAD" : "EUR");
  const d = await cached(`fx:${from}`, 600, () => getJson(`https://open.er-api.com/v6/latest/${from}`));
  const rate = d.rates?.[to];
  if (!rate) return { say: "Je n'ai pas ce taux de change." };
  const res = amount * rate;
  const others = ["EUR", "USD", "MAD", "GBP", "CHF", "CAD"].filter((c) => c !== from).map((c) => ({ code: c, value: amount * d.rates[c] }));
  return {
    say: `${amount.toLocaleString("fr-FR")} ${SPOKEN[from] || from} font ${res.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${SPOKEN[to] || to}.`,
    view: { kind: "fx", title: "Change", subtitle: `${amount} ${from}`, from, amount, items: others, main: { code: to, value: res } },
  };
}

/* ---------- Météo et actus ---------- */

export async function weatherView(city) {
  const w = await weather(city);
  if (w.error) return { say: `Je n'ai pas la météo de ${city}.` };
  const d = w.days?.[1];
  return {
    say: `À ${w.city}, ${w.temp} degrés, ${w.label}. Ressenti ${w.feels}.${d ? ` Demain, entre ${d.min} et ${d.max}, ${d.label}.` : ""}`,
    view: { kind: "weather", title: w.city, weather: w },
  };
}

export async function newsView(text) {
  const topic = /maroc/.test(text) ? "maroc" : /tech|ia|intelligence/.test(text) ? "tech" : /apple|iphone/.test(text) ? "apple" : /sport|foot/.test(text) ? "sport" : /eco|bourse/.test(text) ? "eco" : /resto|restaurant|fast food/.test(text) ? "resto" : /fidelite/.test(text) ? "fidelite" : "une";
  const items = await news([topic]);
  return {
    say: items.length ? `Les titres ${FEEDS[topic].label.toLowerCase()} : ${items.slice(0, 3).map((x) => x.title.replace(/ - [^-]+$/, "")).join(". ")}.` : "Je n'ai pas d'actus pour l'instant.",
    view: { kind: "news", title: `Actus · ${FEEDS[topic].label}`, items: items.slice(0, 12) },
  };
}

/* ---------- Mac ---------- */

const osa = (script) =>
  new Promise((resolve, reject) => execFile("osascript", ["-e", script], { timeout: 6000 }, (e, out) => (e ? reject(e) : resolve(String(out).trim()))));
const run = (bin, args) => new Promise((resolve, reject) => execFile(bin, args, { timeout: 6000 }, (e, out) => (e ? reject(e) : resolve(String(out).trim()))));

/** Lecteur de musique ouvert : Spotify en priorité, sinon Musique. */
async function player() {
  const apps = await osa('tell application "System Events" to get name of every process whose background only is false').catch(() => "");
  return /Spotify/.test(apps) ? "Spotify" : "Music";
}

export async function mac(text) {
  // Volume
  const vol = text.match(/(?:volume|son)(?: a| au| sur)? (\d{1,3})/);
  if (vol) {
    const v = Math.max(0, Math.min(100, Number(vol[1])));
    await osa(`set volume output volume ${v}`);
    return { say: `Volume à ${v}.` };
  }
  if (/(monte|augmente|plus fort)/.test(text) && /(son|volume)|plus fort/.test(text)) {
    await osa("set volume output volume ((output volume of (get volume settings)) + 15)");
    return { say: "Plus fort." };
  }
  if (/(baisse|diminue|moins fort)/.test(text) && /(son|volume)|moins fort/.test(text)) {
    await osa("set volume output volume ((output volume of (get volume settings)) - 15)");
    return { say: "Moins fort." };
  }
  if (/(coupe|mute) (le )?son/.test(text)) {
    await osa("set volume with output muted");
    return { say: "" };
  }
  // Musique
  if (/(musique|chanson|morceau|spotify|play|lecture|pause|suivant|precedent)/.test(text) && /(mets|lance|joue|reprends|pause|stop|suivant|suivante|precedent|passe|play|coupe)/.test(text)) {
    const app = await player();
    if (/(suivant|suivante|passe|next)/.test(text)) await osa(`tell application "${app}" to next track`);
    else if (/precedent/.test(text)) await osa(`tell application "${app}" to previous track`);
    else if (/(pause|stop|coupe|arrete)/.test(text)) await osa(`tell application "${app}" to pause`);
    else await osa(`tell application "${app}" to play`);
    const now = await osa(`tell application "${app}" to if player state is playing then return (name of current track) & " · " & (artist of current track)`).catch(() => "");
    return { say: now ? "" : "C'est fait.", view: now ? { kind: "music", title: app === "Music" ? "Musique" : app, track: now } : null };
  }
  // Écran
  if (/(eteins|mets en veille|veille) (l )?ecran/.test(text)) {
    setTimeout(() => run("pmset", ["displaysleepnow"]).catch(() => {}), 1500);
    return { say: "Je mets l'écran en veille." };
  }
  // Ouvrir une app
  const app = text.match(/^(?:ouvre|lance|demarre)(?: moi)? (?:l app |l application |le logiciel )?([a-z0-9 .+-]{2,30})$/);
  if (app && !/(page|site|onglet|dossier|fichier|projet|hq|keeply)/.test(app[1])) {
    const name = app[1].trim().replace(/\b\w/g, (c) => c.toUpperCase());
    const alias = { Musique: "Music", Mail: "Mail", Calendrier: "Calendar", Notes: "Notes", Photos: "Photos", Messages: "Messages", Plans: "Maps", Reglages: "System Settings", Terminal: "Terminal", Finder: "Finder", Safari: "Safari", Edge: "Microsoft Edge", Xcode: "Xcode", Whatsapp: "WhatsApp", Vs: "Visual Studio Code", Vscode: "Visual Studio Code", Code: "Visual Studio Code" }[name] || name;
    try {
      await run("open", ["-a", alias]);
      return { say: `J'ouvre ${alias}.` };
    } catch {
      return null; // pas une app : on laisse Claude comprendre
    }
  }
  return null;
}

/* ---------- Minuteur ---------- */

export function timer(text) {
  const m = text.match(/(\d+)\s*(secondes?|sec|s|minutes?|min|heures?|h)\b/);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2][0];
  const ms = n * (unit === "s" ? 1000 : unit === "h" ? 3_600_000 : 60_000);
  const label = text.match(/(?:pour|de) (?:le |la |les |l )?([a-z ]{3,30})$/)?.[1];
  return {
    say: `Minuteur de ${n} ${unit === "s" ? "secondes" : unit === "h" ? (n > 1 ? "heures" : "heure") : n > 1 ? "minutes" : "minute"} lancé.`,
    view: { kind: "timer", title: label ? `Minuteur · ${label}` : "Minuteur", endsAt: Date.now() + ms, total: ms },
    pin: true,
  };
}
