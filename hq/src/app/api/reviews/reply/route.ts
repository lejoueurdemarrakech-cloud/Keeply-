import { route, HttpError } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { replyAppStoreReview } from "@/lib/connectors/appstore";
import { replyGooglePlayReview } from "@/lib/connectors/google";
import { resetReviewsCache } from "@/lib/reviews";
import { logActivity } from "@/lib/settings";

export const POST = route(async (req: Request) => {
  const { id, store, text } = (await req.json()) as { id: string; store: "appstore" | "googleplay"; text: string };
  if (!text?.trim()) throw new HttpError(400, "La réponse est vide.");
  if (id.startsWith("demo-")) throw new HttpError(400, "Avis de démonstration : connecte App Store Connect ou Google Play pour répondre.");
  const cfg = await configOrNull(store);
  if (!cfg) throw new HttpError(400, "Store non connecté.");
  if (store === "appstore") await replyAppStoreReview(cfg, id, text.trim());
  else await replyGooglePlayReview(cfg, id, text.trim());
  resetReviewsCache();
  await logActivity("systeme", `Réponse publiée sur un avis ${store === "appstore" ? "App Store" : "Google Play"}`, "succes");
  return { ok: true };
});
