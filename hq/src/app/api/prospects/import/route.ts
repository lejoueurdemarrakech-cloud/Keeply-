import { route, HttpError } from "@/lib/http";
import { parseCsv } from "@/lib/csv";
import { saveProspects, COUNTRIES } from "@/lib/prospects";
import { uid } from "@/lib/store";
import type { Prospect } from "@/lib/types";

/** Import d'une liste existante (CSV : nom, ville, pays, email, site, téléphone, type). */
export const POST = route(async (req: Request) => {
  const { csv } = (await req.json()) as { csv: string };
  const rows = parseCsv(csv ?? "");
  if (!rows.length) throw new HttpError(400, "Fichier vide ou illisible.");
  const pick = (r: Record<string, string>, ...keys: string[]) => {
    for (const k of keys) {
      const hit = Object.keys(r).find((x) => x.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "") === k);
      if (hit && r[hit]) return r[hit];
    }
    return "";
  };
  const list: Prospect[] = rows
    .map((r) => {
      const country = (pick(r, "pays", "country") || "FR").slice(0, 2).toUpperCase();
      return {
        id: uid("pr"),
        name: pick(r, "nom", "name", "etablissement", "business"),
        type: pick(r, "type", "categorie", "category") || "restaurant",
        city: pick(r, "ville", "city"),
        country,
        email: pick(r, "email", "mail", "courriel").toLowerCase() || undefined,
        website: pick(r, "site", "website", "url") || undefined,
        phone: pick(r, "telephone", "phone", "tel") || undefined,
        instagram: pick(r, "instagram") || undefined,
        source: "manuel" as const,
        score: "tiede" as const,
        signals: [],
        lang: COUNTRIES[country]?.lang ?? "fr",
        status: "nouveau" as const,
        history: [{ at: new Date().toISOString(), event: "Importé" }],
        createdAt: new Date().toISOString(),
      };
    })
    .filter((p) => p.name);
  await saveProspects((all) => [...list, ...all]);
  return { imported: list.length };
});
