import "server-only";
import dns from "node:dns/promises";
import { configOrNull } from "@/lib/connectors/config";
import { prospectEmailTool } from "@/lib/ai-tools";
import { demoProspects } from "@/lib/demo";
import { fetchJson, UA } from "@/lib/http";
import { fetchInbox, outreachConfig, sendMail } from "@/lib/mail";
import { getSettings, logActivity } from "@/lib/settings";
import { read, uid, update } from "@/lib/store";
import type { Prospect } from "@/lib/types";

export const COUNTRIES: Record<string, { name: string; lang: string }> = {
  FR: { name: "France", lang: "fr" },
  BE: { name: "Belgique", lang: "fr" },
  CH: { name: "Suisse", lang: "fr" },
  LU: { name: "Luxembourg", lang: "fr" },
  MC: { name: "Monaco", lang: "fr" },
  CA: { name: "Canada", lang: "fr" },
  MA: { name: "Maroc", lang: "fr" },
  TN: { name: "Tunisie", lang: "fr" },
  DZ: { name: "Algérie", lang: "fr" },
  SN: { name: "Sénégal", lang: "fr" },
  CI: { name: "Côte d'Ivoire", lang: "fr" },
  ES: { name: "Espagne", lang: "es" },
  IT: { name: "Italie", lang: "it" },
  DE: { name: "Allemagne", lang: "de" },
  AT: { name: "Autriche", lang: "de" },
  NL: { name: "Pays-Bas", lang: "nl" },
  PT: { name: "Portugal", lang: "pt" },
  GB: { name: "Royaume-Uni", lang: "en" },
  IE: { name: "Irlande", lang: "en" },
  US: { name: "États-Unis", lang: "en" },
  AE: { name: "Émirats arabes unis", lang: "en" },
};

export const TYPES: Record<string, { label: string; osm: string[]; google: string }> = {
  cafe: { label: "Café / coffee shop", osm: ['["amenity"="cafe"]', '["shop"="coffee"]'], google: "café" },
  restaurant: { label: "Restaurant", osm: ['["amenity"="restaurant"]'], google: "restaurant" },
  fastfood: { label: "Fast-food / burger", osm: ['["amenity"="fast_food"]'], google: "fast food" },
  boulangerie: { label: "Boulangerie / pâtisserie", osm: ['["shop"="bakery"]', '["shop"="pastry"]'], google: "boulangerie" },
  bar: { label: "Bar", osm: ['["amenity"="bar"]', '["amenity"="pub"]'], google: "bar" },
  glacier: { label: "Glacier / salon de thé", osm: ['["amenity"="ice_cream"]', '["shop"="tea"]'], google: "salon de thé" },
};

const CHAINS = /starbucks|mcdonald|burger king|kfc|subway|paul\b|columbus|brioche dor|la mie c[aâ]line|domino|pizza hut|quick\b|o'tacos|five guys|costa coffee|tim hortons|dunkin|pret a manger|class'croute|boulangerie ange|marie blach|feuillette|hippopotamus|buffalo grill|courtepaille|del arte|leon de bruxelles|big fernand|jour\b|exki|le pain quotidien|bagelstein|cojean|sushi shop|planet sushi|nespresso|yogurt factory/i;
const COMPETITORS = /zerosix|fidme|stampme|stamp me|loyoly|fidelity card|fid[ée]lit[ée] digitale|pmyfid|karte|thefork|lafourchette|yuzzit|squarespace loyalty|square loyalty|sumup loyalty/i;

/* ---------- Recherche ---------- */

interface Found {
  name: string;
  type: string;
  city: string;
  country: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  rating?: number;
  reviews?: number;
  source: Prospect["source"];
  chain?: boolean;
  closed?: boolean;
  osmId?: string;
  placeId?: string;
}

async function searchGoogle(apiKey: string, city: string, country: string, type: string, limit: number): Promise<Found[]> {
  const out: Found[] = [];
  let pageToken: string | undefined;
  const lang = COUNTRIES[country]?.lang ?? "fr";
  do {
    const data = await fetchJson<{
      places?: { id: string; displayName?: { text: string }; formattedAddress?: string; websiteUri?: string; internationalPhoneNumber?: string; rating?: number; userRatingCount?: number; businessStatus?: string }[];
      nextPageToken?: string;
    }>("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,nextPageToken",
      },
      body: JSON.stringify({ textQuery: `${TYPES[type]?.google ?? type} ${city}, ${COUNTRIES[country]?.name ?? country}`, languageCode: lang, regionCode: country, pageSize: 20, ...(pageToken ? { pageToken } : {}) }),
    });
    for (const p of data.places ?? []) {
      const name = p.displayName?.text ?? "";
      out.push({
        name,
        type,
        city,
        country,
        address: p.formattedAddress,
        website: p.websiteUri,
        phone: p.internationalPhoneNumber,
        rating: p.rating,
        reviews: p.userRatingCount,
        source: "google",
        chain: CHAINS.test(name),
        closed: !!p.businessStatus && p.businessStatus !== "OPERATIONAL",
        placeId: p.id,
      });
    }
    pageToken = data.nextPageToken;
    if (pageToken) await new Promise((r) => setTimeout(r, 1500));
  } while (pageToken && out.length < limit);
  return out.slice(0, limit);
}

async function searchOsm(city: string, country: string, type: string, limit: number): Promise<Found[]> {
  const places = await fetchJson<{ osm_type: string; osm_id: number; display_name: string }[]>(
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ city, countrycodes: country.toLowerCase(), format: "json", limit: "5" })}`,
    { headers: { "User-Agent": UA, "Accept-Language": "fr" } },
  );
  const rel = places.find((p) => p.osm_type === "relation");
  if (!rel) throw new Error(`Ville « ${city} » introuvable dans OpenStreetMap pour ${COUNTRIES[country]?.name ?? country}.`);
  const areaId = 3600000000 + rel.osm_id;
  const filters = (TYPES[type]?.osm ?? TYPES.cafe.osm).map((f) => `nwr${f}["name"](area.a);`).join("");
  const query = `[out:json][timeout:60];area(${areaId})->.a;(${filters});out center tags ${Math.min(limit * 4, 600)};`;
  const data = await fetchJson<{ elements: { type: string; id: number; tags: Record<string, string> }[] }>("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": UA },
    body: new URLSearchParams({ data: query }),
    timeoutMs: 70000,
  });
  const found: Found[] = data.elements.map((e) => {
    const t = e.tags;
    const ig = (t["contact:instagram"] || "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
    return {
      name: t.name,
      type,
      city,
      country,
      address: [t["addr:housenumber"], t["addr:street"], t["addr:postcode"], t["addr:city"]].filter(Boolean).join(" ") || undefined,
      website: t.website || t["contact:website"] || undefined,
      email: (t.email || t["contact:email"] || "").toLowerCase() || undefined,
      phone: t.phone || t["contact:phone"] || undefined,
      instagram: ig || undefined,
      source: "osm",
      chain: !!t.brand || !!t["brand:wikidata"] || CHAINS.test(t.name),
      osmId: `${e.type}/${e.id}`,
    };
  });
  // Les fiches avec site ou mail d'abord : elles sont contactables.
  found.sort((a, b) => Number(!!b.email) * 2 + Number(!!b.website) - (Number(!!a.email) * 2 + Number(!!a.website)));
  return found.slice(0, limit);
}

/* ---------- Enrichissement ---------- */

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,24}/gi;
const BAD_EMAIL = /\.(png|jpe?g|gif|webp|svg)$|example\.|sentry|wixpress|domain\.com|email\.com|votre-?mail|yourmail|@2x|godaddy|jimdo|cloudflare|placeholder/i;

async function getPage(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(9000) });
  if (!res.ok) return "";
  return (await res.text()).slice(0, 400_000);
}

function pickEmails(html: string, site?: string) {
  const decoded = html.replace(/&#64;|\[at\]|\(at\)| at /gi, "@").replace(/&#46;|\[dot\]|\(dot\)/gi, ".");
  const all = [...new Set((decoded.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase().replace(/^mailto:/, "")))].filter((e) => !BAD_EMAIL.test(e));
  const host = site ? new URL(site).hostname.replace(/^www\./, "") : "";
  const score = (e: string) => (host && e.endsWith("@" + host) ? 4 : 0) + (/^(contact|bonjour|hello|info|reservation|resa|accueil)@/.test(e) ? 2 : 0) - (/noreply|no-reply|rgpd|dpo|privacy|jobs|recrutement/.test(e) ? 5 : 0);
  return all.sort((a, b) => score(b) - score(a));
}

async function verifyDomain(email: string): Promise<Prospect["emailCheck"]> {
  try {
    const mx = await dns.resolveMx(email.split("@")[1]);
    return mx.length ? "ok" : "sans-mx";
  } catch (e) {
    return (e as { code?: string }).code === "ENOTFOUND" || (e as { code?: string }).code === "ENODATA" ? "sans-mx" : "inconnu";
  }
}

async function enrich(f: Found) {
  const signals: string[] = [];
  let emails = f.email ? [f.email] : [];
  let instagram = f.instagram;
  let snippet = "";
  if (f.website) {
    try {
      const site = f.website.startsWith("http") ? f.website : `https://${f.website}`;
      const home = await getPage(site);
      const title = home.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim() ?? "";
      const desc = home.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1] ?? "";
      const text = home.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      snippet = [title, desc, text.slice(0, 1200)].filter(Boolean).join(" — ");
      emails.push(...pickEmails(home, site));
      instagram ||= home.match(/instagram\.com\/([a-z0-9._]{2,30})/i)?.[1];
      if (emails.length === 0) {
        const links = [...home.matchAll(/href=["']([^"']*(contact|mentions|legal|impressum|about|a-propos|nous-trouver)[^"']*)["']/gi)].map((m) => m[1]).slice(0, 2);
        for (const l of links) {
          try {
            emails.push(...pickEmails(await getPage(new URL(l, site).href), site));
          } catch {}
        }
      }
      if (/fid[ée]lit[ée]|loyalty|carte de fid|tampon|stamp/i.test(text)) signals.push("Parle déjà de fidélité sur son site");
      if (COMPETITORS.test(home)) signals.push("Utilise peut-être un concurrent");
      if (/ubereats|deliveroo|just ?eat|glovo/i.test(home)) signals.push("Fait de la livraison (clients réguliers)");
      if (/click.?(and|&).?collect|commander en ligne|order online/i.test(text)) signals.push("Commande en ligne");
    } catch {
      signals.push("Site injoignable");
    }
  }
  emails = [...new Set(emails)].slice(0, 4);
  const email = emails[0];
  const emailCheck = email ? await verifyDomain(email) : undefined;
  if (instagram) signals.push(`Instagram @${instagram}`);
  return { emails, email: emailCheck === "sans-mx" ? emails[1] : email, emailCheck, instagram, snippet: snippet.slice(0, 2000), signals };
}

function scoreOf(p: Pick<Prospect, "email" | "emailCheck" | "website" | "instagram" | "rating" | "reviews" | "type">, chain?: boolean, closed?: boolean): Prospect["score"] {
  if (chain || closed) return "ecarte";
  let s = 0;
  if (p.email && p.emailCheck === "ok") s += 3;
  else if (p.email) s += 1;
  if (p.website) s += 1;
  if (p.instagram) s += 1;
  if ((p.rating ?? 0) >= 4.3) s += 1;
  if ((p.reviews ?? 0) >= 100) s += 1;
  if (["cafe", "boulangerie", "glacier", "fastfood"].includes(p.type)) s += 1;
  return s >= 6 ? "chaud" : s >= 4 ? "tiede" : "froid";
}

export const listProspects = () => read<Prospect[]>("prospects", []);
export const saveProspects = (fn: (all: Prospect[]) => Prospect[]) => update<Prospect[]>("prospects", [], fn);

const key = (p: { name: string; city: string }) => `${p.name}|${p.city}`.toLowerCase().normalize("NFD").replace(/[^a-z|]/g, "");

export async function searchProspects(input: { country: string; city: string; types: string[]; limit: number }) {
  const places = await configOrNull("places");
  const limit = Math.min(Math.max(input.limit || 30, 5), 120);
  const perType = Math.ceil(limit / Math.max(1, input.types.length));
  let found: Found[] = [];
  let notice: string | undefined;
  let source: "google" | "osm" | "demo" = places ? "google" : "osm";
  try {
    for (const type of input.types) {
      found.push(...(places ? await searchGoogle(places.apiKey, input.city, input.country, type, perType) : await searchOsm(input.city, input.country, type, perType)));
    }
  } catch (e) {
    if (found.length === 0) {
      source = "demo";
      notice = `Recherche réelle impossible (${e instanceof Error ? e.message : e}). Voici des exemples fictifs pour tester l'outil : ils ne peuvent pas recevoir de mail.`;
      found = input.types.flatMap((t) => demoProspects(input.city, input.country, t, perType).map((d) => ({ ...d, chain: false })));
    }
  }

  const existing = new Set((await listProspects()).map(key));
  const optout = new Set(await read<string[]>("prospects:optout", []));
  const fresh = found.filter((f) => f.name && !existing.has(key(f)));
  const lang = COUNTRIES[input.country]?.lang ?? "en";

  const enriched: Prospect[] = [];
  for (let i = 0; i < fresh.length; i += 6) {
    const batch = await Promise.all(
      fresh.slice(i, i + 6).map(async (f) => {
        const e = f.source === "demo" ? { emails: f.email ? [f.email] : [], email: f.email, emailCheck: undefined, instagram: f.instagram, snippet: "", signals: [] as string[] } : await enrich(f);
        const p: Prospect = {
          id: uid("pr"),
          name: f.name,
          type: f.type,
          city: f.city,
          country: f.country,
          address: f.address,
          website: f.website,
          email: e.email,
          emails: e.emails,
          emailCheck: e.emailCheck,
          phone: f.phone,
          instagram: e.instagram,
          rating: f.rating,
          reviews: f.reviews,
          source: f.source,
          signals: [...(f.chain ? ["Chaîne ou franchise"] : []), ...(f.closed ? ["Fermé"] : []), ...e.signals],
          score: "froid",
          lang,
          status: e.email && optout.has(e.email) ? "exclu" : "nouveau",
          history: [{ at: new Date().toISOString(), event: `Trouvé via ${f.source === "google" ? "Google Places" : f.source === "osm" ? "OpenStreetMap" : "exemple"}` }],
          createdAt: new Date().toISOString(),
          siteSnippet: e.snippet,
          osmId: f.osmId,
          placeId: f.placeId,
        };
        p.score = scoreOf(p, f.chain, f.closed);
        return p;
      }),
    );
    enriched.push(...batch);
  }
  await saveProspects((all) => [...enriched, ...all]);
  await logActivity("prospection", `${enriched.length} établissements ajoutés (${input.city}, ${COUNTRIES[input.country]?.name ?? input.country})`, "succes");
  return {
    added: enriched.length,
    duplicates: found.length - fresh.length,
    withEmail: enriched.filter((p) => p.email).length,
    source,
    notice,
  };
}

/* ---------- Rédaction ---------- */

export async function draftFor(ids: string[]) {
  const all = await listProspects();
  const targets = all.filter((p) => ids.includes(p.id));
  let done = 0;
  const errors: string[] = [];
  for (let i = 0; i < targets.length; i += 3) {
    await Promise.all(
      targets.slice(i, i + 3).map(async (p) => {
        try {
          const d = await prospectEmailTool(p, p.siteSnippet);
          await saveProspects((list) =>
            list.map((x) =>
              x.id === p.id
                ? { ...x, draft: { subject: d.subject, body: d.body, followUps: d.followUps }, status: x.status === "nouveau" ? "pret" : x.status, history: [...x.history, { at: new Date().toISOString(), event: "Mail préparé" }] }
                : x,
            ),
          );
          done++;
        } catch (e) {
          errors.push(`${p.name} : ${e instanceof Error ? e.message : e}`);
        }
      }),
    );
  }
  return { drafted: done, errors };
}

/* ---------- Envoi ---------- */

function parisNow() {
  const tz = process.env.HQ_TIMEZONE || "Europe/Paris";
  const d = new Date();
  return {
    day: d.toLocaleDateString("en-CA", { timeZone: tz }),
    hm: d.toLocaleTimeString("fr-FR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    weekday: new Date(d.toLocaleString("en-US", { timeZone: tz })).getDay(),
  };
}

export async function sentToday() {
  return read<number>(`prospects:sent:${parisNow().day}`, 0);
}

async function sendStep(p: Prospect, cfg: Record<string, string>) {
  if (!p.email || !p.draft) throw new Error("Pas d'adresse ou pas de mail préparé.");
  if (p.source === "demo") throw new Error("Établissement d'exemple : impossible d'envoyer.");
  const s = await getSettings();
  const step = p.step === undefined ? -1 : p.step; // -1 = rien envoyé
  const isFirst = step < 0;
  const fu = isFirst ? null : p.draft.followUps[step];
  if (!isFirst && !fu) throw new Error("Plus de relance prévue.");
  const subject = isFirst ? p.draft.subject : fu!.subject;
  const text = isFirst ? p.draft.body : fu!.body;
  await sendMail(cfg, {
    to: p.email,
    subject,
    text,
    headers: { "List-Unsubscribe": `<mailto:${cfg.user}?subject=desinscription>` },
  });
  const nextIndex = step + 1; // index de la prochaine relance
  const delay = p.draft.followUps[nextIndex]?.delayDays ?? s.prospecting.followUpDays[nextIndex];
  const nextSendAt = delay ? new Date(Date.now() + delay * 864e5).toISOString() : null;
  const status: Prospect["status"] = isFirst ? "envoye" : step === 0 ? "relance1" : "relance2";
  await saveProspects((all) =>
    all.map((x) =>
      x.id === p.id ? { ...x, status, step: nextIndex, nextSendAt, history: [...x.history, { at: new Date().toISOString(), event: isFirst ? `Mail envoyé à ${p.email}` : `Relance ${nextIndex} envoyée` }] } : x,
    ),
  );
  const day = parisNow().day;
  await update<number>(`prospects:sent:${day}`, 0, (n) => n + 1);
}

export async function sendNow(id: string) {
  const cfg = await outreachConfig();
  if (!cfg) throw new Error("Connecte une boîte d'envoi (Connexions > Boîte mail pro ou Boîte d'envoi prospection).");
  const p = (await listProspects()).find((x) => x.id === id);
  if (!p) throw new Error("Prospect introuvable.");
  await sendStep(p, cfg);
}

/** Repère les réponses des prospects et les désinscriptions dans la boîte d'envoi. */
export async function checkReplies() {
  const cfg = await outreachConfig();
  if (!cfg?.imapHost) return 0;
  const contacted = (await listProspects()).filter((p) => p.email && ["envoye", "relance1", "relance2"].includes(p.status));
  if (!contacted.length) return 0;
  const byEmail = new Map(contacted.map((p) => [p.email!.toLowerCase(), p]));
  const inbox = await fetchInbox(cfg, { days: 21, limit: 150 });
  let n = 0;
  for (const m of inbox) {
    const p = byEmail.get(m.from.email);
    if (!p) continue;
    const optout = /non merci|d[ée]sinscri|unsubscribe|stop|ne plus (me |nous )?(contacter|écrire)|pas int[ée]ress/i.test(`${m.subject} ${m.text.slice(0, 400)}`);
    await saveProspects((all) =>
      all.map((x) => (x.id === p.id ? { ...x, status: optout ? "refus" : "repondu", nextSendAt: null, history: [...x.history, { at: m.date, event: optout ? "A répondu : pas intéressé" : `A répondu : « ${m.snippet.slice(0, 80)} »` }] } : x)),
    );
    if (optout) await update<string[]>("prospects:optout", [], (l) => [...new Set([...l, p.email!.toLowerCase()])]);
    byEmail.delete(m.from.email);
    n++;
  }
  if (n) await logActivity("prospection", `${n} prospect(s) ont répondu`, "succes");
  return n;
}

/** Tâche planifiée : envoie les mails approuvés et les relances, en douceur. */
export async function outreachTick() {
  const s = await getSettings();
  const cfg = await outreachConfig();
  if (!cfg) return "pas de boîte d'envoi";
  const now = parisNow();
  if (now.weekday === 0 || now.weekday === 6) return "week-end";
  if (now.hm < s.prospecting.sendWindow.start || now.hm > s.prospecting.sendWindow.end) return "hors créneau d'envoi";
  await checkReplies().catch(() => 0);
  const budget = s.prospecting.dailyLimit - (await sentToday());
  if (budget <= 0) return "limite du jour atteinte";
  const optout = new Set(await read<string[]>("prospects:optout", []));
  const due = (await listProspects()).filter(
    (p) =>
      p.email &&
      p.draft &&
      p.source !== "demo" &&
      !optout.has(p.email.toLowerCase()) &&
      ((p.status === "approuve" && (p.step ?? -1) < 0) || (["envoye", "relance1"].includes(p.status) && p.nextSendAt && new Date(p.nextSendAt).getTime() <= Date.now())),
  );
  let sent = 0;
  // Au plus 4 mails par passage pour étaler les envois.
  for (const p of due.slice(0, Math.min(4, budget))) {
    try {
      await sendStep(p, cfg);
      sent++;
      await new Promise((r) => setTimeout(r, 2500 + Math.random() * 4000));
    } catch (e) {
      await saveProspects((all) => all.map((x) => (x.id === p.id ? { ...x, history: [...x.history, { at: new Date().toISOString(), event: `Échec d'envoi : ${e instanceof Error ? e.message : e}` }] } : x)));
    }
  }
  if (sent) await logActivity("prospection", `${sent} mail(s) de prospection envoyé(s)`, "succes");
  return `${sent} envoyé(s)`;
}

export async function resetOptOut(email: string) {
  await update<string[]>("prospects:optout", [], (l) => l.filter((e) => e !== email.toLowerCase()));
}

export async function clearDemoProspects() {
  await saveProspects((all) => all.filter((p) => p.source !== "demo"));
}
