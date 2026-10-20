import { route, HttpError } from "@/lib/http";
import { parseCsv } from "@/lib/csv";
import { normalizeImported } from "@/lib/sales";
import { read, store, update } from "@/lib/store";
import { logActivity } from "@/lib/settings";
import type { SaleRecord } from "@/lib/types";

export const POST = route(async (req: Request) => {
  const { csv, source } = (await req.json()) as { csv: string; source?: string };
  if (!csv?.trim()) throw new HttpError(400, "Fichier vide.");
  const rows = parseCsv(csv);
  const records = rows.map((r, i) => normalizeImported(r, i, source || "manual")).filter(Boolean) as SaleRecord[];
  if (!records.length) throw new HttpError(400, "Aucune ligne reconnue. Il faut au moins une colonne date et une colonne montant.");
  await update<SaleRecord[]>("sales:manual", [], (cur) => [...cur, ...records]);
  await logActivity("ventes", `${records.length} ventes importées (${source || "import"})`, "succes");
  return { imported: records.length, skipped: rows.length - records.length };
});

export const GET = route(async () => {
  const rows = await read<SaleRecord[]>("sales:manual", []);
  const bySource = rows.reduce<Record<string, number>>((m, r) => ((m[r.source] = (m[r.source] ?? 0) + 1), m), {});
  return { count: rows.length, bySource };
});

export const DELETE = route(async (req: Request) => {
  const source = new URL(req.url).searchParams.get("source");
  if (!source) await store.set("sales:manual", []);
  else await update<SaleRecord[]>("sales:manual", [], (cur) => cur.filter((r) => r.source !== source));
  return { ok: true };
});
