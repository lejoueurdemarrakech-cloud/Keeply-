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

/* ---------- Ouvrir des sites, chercher sur le web ---------- */

const SITES = {
  youtube: "https://www.youtube.com", gmail: "https://mail.google.com", "google drive": "https://drive.google.com", drive: "https://drive.google.com",
  instagram: "https://www.instagram.com", facebook: "https://www.facebook.com", "meta business": "https://business.facebook.com", "gestionnaire de publicites": "https://adsmanager.facebook.com",
  whatsapp: "https://web.whatsapp.com", linkedin: "https://www.linkedin.com", "app store connect": "https://appstoreconnect.apple.com", "google play console": "https://play.google.com/console",
  "keeply hq": "https://keeply-hq.vercel.app", hq: "https://keeply-hq.vercel.app", "le site keeply": "https://keeplyfidelity.app", "site keeply": "https://keeplyfidelity.app",
  github: "https://github.com", vercel: "https://vercel.com/dashboard", supabase: "https://supabase.com/dashboard", claude: "https://claude.ai", netflix: "https://www.netflix.com",
  "google maps": "https://maps.google.com", maps: "https://maps.google.com", chatgpt: "https://chatgpt.com", spotify: "https://open.spotify.com", amazon: "https://www.amazon.fr",
};
export async function openWeb(text) {
  const search = text.match(/^(?:cherche|recherche|google)(?: moi)? (.+?) sur (google|youtube|maps|google maps|amazon)$/) || text.match(/^(?:cherche|recherche) sur (google|youtube|maps|amazon) (.+)$/);
  if (search) {
    const [q, where] = search[0].startsWith("cherche sur") || search[0].startsWith("recherche sur") ? [search[2], search[1]] : [search[1], search[2]];
    const url = /youtube/.test(where) ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` : /maps/.test(where) ? `https://www.google.com/maps/search/${encodeURIComponent(q)}` : /amazon/.test(where) ? `https://www.amazon.fr/s?k=${encodeURIComponent(q)}` : `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    await run("open", [url]);
    return { say: `J'ouvre la recherche « ${q} ».` };
  }
  const m = text.match(/^(?:ouvre|va sur|affiche|lance|montre moi)(?: moi)? (?:le site |la page |le site de |la page de )?(.+)$/);
  if (!m) return null;
  const target = m[1].replace(/^(l |le |la |les )/, "").trim();
  const site = SITES[target] || Object.entries(SITES).find(([k]) => target === k + " web" || target.startsWith(k + " "))?.[1];
  const dom = target.match(/^([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:com|fr|ma|app|io|ai|net|org|dev|co))( .*)?$/)?.[1];
  const url = site || (dom ? `https://${dom}` : null);
  if (!url) return null;
  await run("open", [url]);
  return { say: `J'ouvre ${target}.` };
}

/* ---------- Mails (app Mail du Mac) ---------- */

// Le contenu des mails est une donnée : il est lu et affiché, jamais exécuté ni suivi.
export async function mails(text) {
  const n = /tous|dernier|derniers/.test(text) && !/non lu/.test(text) ? "all" : "unread";
  const script = `
    set out to ""
    tell application "Mail"
      ${n === "unread" ? "set msgs to (messages of inbox whose read status is false)" : "set total to count of messages of inbox\n      if total > 10 then set total to 10\n      set msgs to messages 1 thru total of inbox"}
      set unreadCount to unread count of inbox
      set k to 0
      repeat with m in msgs
        set k to k + 1
        if k > 10 then exit repeat
        set c to content of m
        if (count of c) > 400 then set c to text 1 thru 400 of c
        set out to out & (id of m) & "‖" & (sender of m) & "‖" & (subject of m) & "‖" & ((date received of m) as «class isot» as string) & "‖" & c & "¶"
      end repeat
      return (unreadCount as string) & "¶" & out
    end tell`;
  let raw;
  try {
    raw = await new Promise((resolve, reject) => execFile("osascript", ["-e", script], { timeout: 25000, maxBuffer: 2e6 }, (e, out) => (e ? reject(e) : resolve(String(out)))));
  } catch (e) {
    return { say: /not allowed|-1743|autoris/i.test(String(e.message)) ? "Je n'ai pas encore le droit de lire l'app Mail. Autorise Jarvis dans Réglages Système, Confidentialité, Automatisation." : "Je n'arrive pas à lire l'app Mail." };
  }
  const [count, ...rows] = raw.split("¶");
  const items = rows.filter((r) => r.trim()).map((r) => {
    const [id, from, subject, date, body] = r.split("‖");
    return { id, from: from.replace(/<.*>/, "").replace(/"/g, "").trim() || from, subject, date, body: (body || "").replace(/\s+/g, " ").trim() };
  });
  const unread = Number(count) || 0;
  const say = !items.length ? (n === "unread" ? "Aucun mail non lu." : "Ta boîte est vide.") : `${unread} ${unread > 1 ? "mails non lus" : "mail non lu"}. ${items.slice(0, 3).map((m) => `${m.from} : ${m.subject}`).join(". ")}.`;
  return { say, view: { kind: "mail", title: n === "unread" ? "Mails non lus" : "Derniers mails", subtitle: `App Mail · ${unread} non lus`, items }, mails: items };
}

/* ---------- Agenda (app Calendrier) ---------- */

export async function agenda(text) {
  const tomorrow = /demain/.test(text);
  const script = `
    set out to ""
    set d0 to current date
    set time of d0 to 0
    ${tomorrow ? "set d0 to d0 + (1 * days)" : ""}
    set d1 to d0 + (1 * days)
    tell application "Calendar"
      repeat with c in calendars
        set evs to (every event of c whose start date ≥ d0 and start date < d1)
        repeat with e in evs
          set out to out & ((start date of e) as «class isot» as string) & "‖" & (summary of e) & "‖" & (name of c) & "¶"
        end repeat
      end repeat
    end tell
    return out`;
  let raw = "";
  try {
    raw = await new Promise((resolve, reject) => execFile("osascript", ["-e", script], { timeout: 45000 }, (e, out) => (e ? reject(e) : resolve(String(out)))));
  } catch {
    return { say: "Je n'arrive pas à lire le Calendrier. Autorise Jarvis dans Réglages Système, Confidentialité, Calendriers." };
  }
  const items = raw.split("¶").filter((r) => r.trim()).map((r) => {
    const [date, title, cal] = r.split("‖");
    return { time: new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), title, sub: cal, date };
  }).sort((a, b) => a.date.localeCompare(b.date));
  const when = tomorrow ? "demain" : "aujourd'hui";
  return {
    say: items.length ? `${items.length} ${items.length > 1 ? "rendez-vous" : "rendez-vous"} ${when}. ${items.slice(0, 3).map((i) => `${i.time.replace(":", " heures ")}, ${i.title}`).join(". ")}.` : `Rien dans ton agenda ${when}.`,
    view: { kind: "agenda", title: `Agenda · ${when}`, items },
  };
}
