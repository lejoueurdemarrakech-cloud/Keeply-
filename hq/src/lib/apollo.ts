import "server-only";
import { configOrNull } from "@/lib/connectors/config";
import { COUNTRIES, listProspects, saveProspects, scoreOf } from "@/lib/prospects";
import { logActivity } from "@/lib/settings";
import { read, uid } from "@/lib/store";
import type { Prospect } from "@/lib/types";

/*
 * Apollo (apollo.io) : trouve les gérants, fondateurs et franchisés des commerces de restauration.
 * La recherche (entreprises + personnes) ne consomme pas de crédits ; révéler un e-mail (people/match) en consomme 1.
 * La clé est saisie par le fondateur dans HQ > Connexions (jamais écrite dans le code).
 */

const BASE = "https://api.apollo.io/api/v1";

/** Noms de pays en anglais, comme Apollo les attend dans les filtres de lieu. */
const COUNTRY_EN: Record<string, string> = {
  FR: "France", BE: "Belgium", CH: "Switzerland", LU: "Luxembourg", MC: "Monaco", CA: "Canada", MA: "Morocco", TN: "Tunisia",
  DZ: "Algeria", SN: "Senegal", CI: "Ivory Coast", NL: "Netherlands", AU: "Australia", ID: "Indonesia", GB: "United Kingdom",
  US: "United States", ES: "Spain", IT: "Italy", DE: "Germany", AT: "Austria", PT: "Portugal", IE: "Ireland", AE: "United Arab Emirates",
};

const KEYWORDS: Record<string, string[]> = {
  cafe: ["cafe", "coffee shop"],
  restaurant: ["restaurant"],
  fastfood: ["fast food", "burger", "pizza"],
  boulangerie: ["bakery"],
  bar: ["bar"],
  glacier: ["ice cream", "tea room"],
};

/** Postes de décideurs, en français et en anglais. */
const TITLES = ["owner", "co-owner", "founder", "co-founder", "franchisee", "general manager", "managing director", "gérant", "gérante", "fondateur", "fondatrice", "propriétaire", "directeur", "directrice"];

async function call<T>(apiKey: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache", "x-api-key": apiKey },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  let data: unknown = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* réponse non JSON */
  }
  if (!res.ok) {
    const msg = (data as { error?: string; message?: string }).error ?? (data as { message?: string }).message ?? text.slice(0, 200);
    if (res.status === 401) throw new Error("Clé Apollo refusée : vérifie-la dans Connexions.");
    if (res.status === 403) throw new Error(`Apollo refuse cet accès avec ta formule ou ta clé (${msg}). Vérifie les droits de la clé (ou « master key »).`);
    if (res.status === 429) throw new Error("Apollo : trop de demandes d'un coup, réessaie dans une minute.");
    throw new Error(`Apollo ${res.status} : ${msg}`);
  }
  return data as T;
}

export async function apolloPing(apiKey: string) {
  const r = await call<{ is_logged_in?: boolean; healthy?: boolean }>(apiKey, "/auth/health");
  if (r.is_logged_in === false) throw new Error("Clé Apollo non reconnue.");
  return "Clé Apollo valide.";
}

async function key() {
  const cfg = await configOrNull("apollo");
  if (!cfg?.apiKey) throw new Error("Apollo n'est pas connecté : ajoute ta clé dans Connexions > Apollo.");
  return cfg.apiKey;
}

interface ApolloOrg {
  id: string;
  name: string;
  website_url?: string | null;
  primary_domain?: string | null;
  linkedin_url?: string | null;
  phone?: string | null;
  primary_phone?: { number?: string | null; sanitized_number?: string | null } | null;
  city?: string | null;
  country?: string | null;
  street_address?: string | null;
  estimated_num_employees?: number | null;
  industry?: string | null;
}
interface ApolloPerson {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  last_name_obfuscated?: string | null;
  title?: string | null;
  linkedin_url?: string | null;
  has_email?: boolean;
  organization_id?: string | null;
  organization?: { id?: string; name?: string } | null;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[^a-z|]/g, "");

/** Cherche les commerces d'une ville dans Apollo, avec leur décideur, et les ajoute aux prospects. */
export async function searchApollo(input: { country: string; city: string; types: string[]; limit: number }) {
  const apiKey = await key();
  const country = COUNTRY_EN[input.country] ?? input.country;
  const location = input.city ? `${input.city}, ${country}` : country;
  const limit = Math.min(Math.max(input.limit || 25, 5), 100);
  const keywords = [...new Set(input.types.flatMap((t) => KEYWORDS[t] ?? [t]))];

  const orgs = await call<{ organizations?: ApolloOrg[]; accounts?: ApolloOrg[] }>(apiKey, "/mixed_companies/search", {
    q_organization_keyword_tags: keywords,
    organization_locations: [location],
    organization_num_employees_ranges: ["1,10", "11,20", "21,50", "51,200"],
    per_page: limit,
    page: 1,
  });
  const found = [...(orgs.organizations ?? []), ...(orgs.accounts ?? [])].filter((o) => o?.id && o.name);

  // Décideurs de ces commerces (sans crédit : l'e-mail se révèle ensuite, au cas par cas).
  const people = new Map<string, ApolloPerson>();
  for (let i = 0; i < found.length; i += 25) {
    const ids = found.slice(i, i + 25).map((o) => o.id);
    try {
      const r = await call<{ people?: ApolloPerson[] }>(apiKey, "/mixed_people/api_search", { organization_ids: ids, person_titles: TITLES, per_page: 100, page: 1 });
      for (const p of r.people ?? []) {
        const org = p.organization_id ?? p.organization?.id;
        if (org && !people.has(org)) people.set(org, p);
      }
    } catch (e) {
      if (people.size === 0 && i === 0) console.warn("[apollo] personnes", e instanceof Error ? e.message : e);
    }
  }

  const existing = new Set((await listProspects()).map((p) => norm(`${p.name}|${p.city}`)));
  const lang = COUNTRIES[input.country]?.lang ?? "en";
  const now = new Date().toISOString();
  const type = input.types[0] ?? "restaurant";
  const fresh: Prospect[] = [];
  for (const o of found) {
    const city = o.city || input.city;
    if (existing.has(norm(`${o.name}|${city}`))) continue;
    const person = people.get(o.id);
    const contactName = person ? [person.first_name, person.last_name || person.last_name_obfuscated].filter(Boolean).join(" ") : undefined;
    const p: Prospect = {
      id: uid("pr"),
      name: o.name,
      type,
      city,
      country: input.country,
      address: o.street_address ?? undefined,
      website: o.website_url ?? (o.primary_domain ? `https://${o.primary_domain}` : undefined),
      phone: o.primary_phone?.sanitized_number ?? o.primary_phone?.number ?? o.phone ?? undefined,
      source: "apollo",
      score: "froid",
      signals: [
        ...(person?.title ? [`Décideur trouvé : ${person.title}`] : []),
        ...(o.estimated_num_employees ? [`${o.estimated_num_employees} salariés environ`] : []),
        ...((o.estimated_num_employees ?? 0) > 20 ? ["Petite chaîne possible (plusieurs adresses)"] : []),
      ],
      lang,
      status: "nouveau",
      history: [{ at: now, event: "Trouvé via Apollo" }],
      createdAt: now,
      contact: person ? { name: contactName ?? "", title: person.title ?? undefined, apolloId: person.id, linkedin: person.linkedin_url ?? undefined, hasEmail: person.has_email } : undefined,
      apolloOrgId: o.id,
    };
    p.score = scoreOf(p);
    if (person) p.score = p.score === "froid" ? "tiede" : "chaud";
    fresh.push(p);
    existing.add(norm(`${o.name}|${city}`));
  }
  await saveProspects((all) => [...fresh, ...all]);
  await logActivity("prospection", `Apollo : ${fresh.length} commerces ajoutés (${input.city || country})`, "succes");
  return { added: fresh.length, duplicates: found.length - fresh.length, withContact: fresh.filter((p) => p.contact).length, source: "Apollo" };
}

/** Révèle l'e-mail professionnel du décideur (1 crédit Apollo). */
export async function revealEmail(prospectId: string) {
  const apiKey = await key();
  const p = (await listProspects()).find((x) => x.id === prospectId);
  if (!p) throw new Error("Prospect introuvable.");
  if (!p.contact?.apolloId) throw new Error("Pas de décideur Apollo pour ce commerce.");
  const optout = new Set(await read<string[]>("prospects:optout", []));
  const r = await call<{ person?: { email?: string | null; email_status?: string | null; first_name?: string; last_name?: string; linkedin_url?: string } }>(apiKey, "/people/match", {
    id: p.contact.apolloId,
    reveal_personal_emails: false,
  });
  const email = r.person?.email ?? undefined;
  if (!email || /email_not_unlocked|domain\.com$/.test(email)) throw new Error("Apollo n'a pas d'e-mail pour cette personne.");
  const name = [r.person?.first_name, r.person?.last_name].filter(Boolean).join(" ") || p.contact.name;
  let updated: Prospect | undefined;
  await saveProspects((all) =>
    all.map((x) => {
      if (x.id !== prospectId) return x;
      updated = {
        ...x,
        email,
        emails: [...new Set([email, ...(x.emails ?? [])])],
        emailCheck: r.person?.email_status === "verified" ? "ok" : "inconnu",
        status: optout.has(email) ? "exclu" : x.status,
        contact: { ...x.contact!, name, linkedin: r.person?.linkedin_url ?? x.contact?.linkedin },
        history: [...x.history, { at: new Date().toISOString(), event: `E-mail révélé via Apollo (${r.person?.email_status ?? "statut inconnu"})` }],
      };
      updated.score = scoreOf(updated);
      return updated;
    }),
  );
  return updated;
}
