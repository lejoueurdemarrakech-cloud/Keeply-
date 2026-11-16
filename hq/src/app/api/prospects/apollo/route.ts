import { route, HttpError } from "@/lib/http";
import { searchApollo } from "@/lib/apollo";

export const maxDuration = 120;
export const POST = route(async (req: Request) => {
  const b = (await req.json()) as { country: string; city: string; types: string[]; limit: number };
  if (!b.country) throw new HttpError(400, "Choisis un pays.");
  if (!b.types?.length) throw new HttpError(400, "Choisis au moins un type d'établissement.");
  try {
    return await searchApollo({ ...b, city: (b.city ?? "").trim() });
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : String(e));
  }
});
