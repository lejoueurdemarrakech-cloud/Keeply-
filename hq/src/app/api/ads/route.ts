import { route } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { adsOverview } from "@/lib/connectors/meta";
import { demoAds } from "@/lib/demo";

export const GET = route(async (req: Request) => {
  const days = Number(new URL(req.url).searchParams.get("days") || 30);
  const cfg = await configOrNull("metaads");
  if (!cfg) return { ...demoAds(), live: false };
  try {
    return { ...(await adsOverview(cfg, days)), live: true };
  } catch (e) {
    return { ...demoAds(), live: false, error: e instanceof Error ? e.message : String(e) };
  }
});
