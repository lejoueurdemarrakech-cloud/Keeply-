import { route, HttpError } from "@/lib/http";
import { searchProspects } from "@/lib/prospects";

export const maxDuration = 300;
export const POST = route(async (req: Request) => {
  const b = (await req.json()) as { country: string; city: string; types: string[]; limit: number };
  if (!b.city?.trim() || !b.country) throw new HttpError(400, "Choisis un pays et une ville.");
  if (!b.types?.length) throw new HttpError(400, "Choisis au moins un type d'établissement.");
  return searchProspects({ ...b, city: b.city.trim() });
});
