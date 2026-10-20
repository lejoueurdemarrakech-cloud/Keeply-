import { route } from "@/lib/http";
import { analyze, instagramOverview } from "@/lib/instagram";

export const GET = route(async (req: Request) => {
  const force = new URL(req.url).searchParams.has("refresh");
  const o = await instagramOverview(force);
  return { ...o, analysis: analyze(o) };
});
