import { route } from "@/lib/http";
import { clearHistory, getHistory, pushHistory, type Turn } from "@/lib/jarvis";

export const GET = route(getHistory);
/** Les réponses instantanées (sans Claude) sont aussi gardées, pour que Claude ait le fil. */
export const POST = route(async (req: Request) => {
  const { turns } = (await req.json()) as { turns?: Pick<Turn, "role" | "text">[] };
  const clean = (turns ?? []).filter((t) => (t.role === "user" || t.role === "jarvis") && typeof t.text === "string" && t.text.trim()).slice(0, 4);
  return pushHistory(clean);
});
export const DELETE = route(async () => {
  await clearHistory();
  return [];
});
