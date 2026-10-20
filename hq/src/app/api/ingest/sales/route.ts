import { route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { normalizeImported } from "@/lib/sales";
import { update } from "@/lib/store";
import { logActivity } from "@/lib/settings";
import type { SaleRecord } from "@/lib/types";

/**
 * Webhook générique : POST /api/ingest/sales
 * Authorization: Bearer <INGEST_TOKEN>
 * Corps : une vente { date, amount, currency?, product?, country?, source } ou une liste.
 * Pratique avec Zapier / Make pour Lemon Squeezy, Paddle, Shopify, Gumroad…
 */
export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  const body = await req.json();
  const list = (Array.isArray(body) ? body : [body]) as Record<string, unknown>[];
  const records = list.map((r, i) => normalizeImported(r, i, String(r.source ?? "webhook"))).filter(Boolean) as SaleRecord[];
  await update<SaleRecord[]>("sales:manual", [], (cur) => [...cur, ...records]);
  if (records.length) await logActivity("ventes", `${records.length} vente(s) reçue(s) par webhook`, "succes");
  return { received: records.length };
});
