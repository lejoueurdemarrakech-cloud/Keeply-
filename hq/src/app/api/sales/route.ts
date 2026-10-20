import { route } from "@/lib/http";
import { salesSummary } from "@/lib/sales";
import { isoDay } from "@/lib/demo";

export const GET = route(async (req: Request) => {
  const url = new URL(req.url);
  const to = url.searchParams.get("to") || isoDay(new Date());
  const from = url.searchParams.get("from") || isoDay(new Date(Date.now() - 29 * 864e5));
  return salesSummary(from, to);
});
