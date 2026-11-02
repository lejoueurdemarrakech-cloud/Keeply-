import { HttpError, route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { COUNTRIES, listProspects, saveProspects, scoreOf } from "@/lib/prospects";
import { read, uid } from "@/lib/store";
import type { Prospect } from "@/lib/types";

export const maxDuration = 60;

type In = Partial<Pick<Prospect, "name" | "type" | "city" | "country" | "address" | "website" | "email" | "phone" | "instagram" | "lat" | "lon" | "osmId" | "hours">>;

/** Import en masse depuis le Mac (recherche OpenStreetMap ou Harvey). Les doublons et les désinscrits sont ignorés. */
export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  const { prospects = [], source = "osm" } = (await req.json()) as { prospects?: In[]; source?: "osm" | "manuel" };
  if (!Array.isArray(prospects) || prospects.length > 5000) throw new HttpError(400, "Liste invalide.");
  const optout = new Set((await read<string[]>("prospects:optout", [])).map((e) => e.toLowerCase()));
  const existing = await listProspects();
  const key = (p: { name?: string; city?: string }) => `${(p.name ?? "").toLowerCase().trim()}|${(p.city ?? "").toLowerCase().trim()}`;
  const seen = new Set([...existing.map(key), ...existing.map((p) => p.osmId).filter(Boolean)]);
  const now = new Date().toISOString();
  const fresh: Prospect[] = [];
  for (const r of prospects) {
    if (!r.name || !r.city || seen.has(key(r)) || (r.osmId && seen.has(r.osmId))) continue;
    seen.add(key(r));
    const email = r.email?.toLowerCase().trim() || undefined;
    const country = (r.country || "FR").toUpperCase();
    const base = { email, website: r.website || undefined, instagram: r.instagram || undefined, type: r.type || "restaurant" };
    fresh.push({
      id: uid("pr"),
      name: r.name.slice(0, 120),
      type: base.type,
      city: r.city,
      country,
      address: r.address || undefined,
      website: base.website,
      email,
      phone: r.phone || undefined,
      instagram: base.instagram,
      lat: typeof r.lat === "number" ? r.lat : undefined,
      lon: typeof r.lon === "number" ? r.lon : undefined,
      hours: r.hours || undefined,
      osmId: r.osmId || undefined,
      source,
      score: scoreOf(base),
      signals: [],
      lang: COUNTRIES[country]?.lang ?? "fr",
      status: email && optout.has(email) ? "exclu" : "nouveau",
      history: [{ at: now, event: "Trouvé sur OpenStreetMap" }],
      createdAt: now,
    });
  }
  await saveProspects((all) => [...all, ...fresh]);
  return { added: fresh.length, skipped: prospects.length - fresh.length };
});
