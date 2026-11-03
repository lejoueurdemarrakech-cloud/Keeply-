import { route } from "@/lib/http";
import { DEFAULT_FEEDS, snapshot } from "@/lib/jarvis";

export const GET = route(async (req: Request) => {
  const p = new URL(req.url).searchParams;
  const feeds = (p.get("feeds") || DEFAULT_FEEDS.join(",")).split(",").filter(Boolean);
  return snapshot({ city: p.get("city") || "Paris", feeds });
});
