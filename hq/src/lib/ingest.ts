import "server-only";
import { safeEqual } from "@/lib/secret";
import { HttpError } from "@/lib/http";

/** Jeton pour les envois automatiques (webhooks Zapier/Make, tests GitHub…). */
export function checkIngestToken(req: Request) {
  const expected = process.env.INGEST_TOKEN;
  if (!expected) throw new HttpError(503, "INGEST_TOKEN n'est pas défini sur le serveur.");
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || new URL(req.url).searchParams.get("token") || "";
  if (!got || !safeEqual(got, expected)) throw new HttpError(401, "Jeton invalide.");
}
