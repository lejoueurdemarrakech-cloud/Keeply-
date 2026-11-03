import { HttpError, route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { adsSummary, getMemory } from "@/lib/jarvis";
import { read, store } from "@/lib/store";
import { addTask } from "@/lib/tasks";
import { todayOverview } from "@/lib/today";

/**
 * Accès de l'app Jarvis installée sur le Mac (même jeton que le pont).
 * GET : les chiffres et listes de HQ. POST : tâche ou note créée à la voix.
 */
export const GET = route(async (req: Request) => {
  checkIngestToken(req);
  const [today, ads, memory] = await Promise.all([todayOverview(), adsSummary().catch(() => null), getMemory()]);
  return { at: new Date().toISOString(), today, ads, memory };
});

export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  const b = (await req.json()) as { type?: string; text?: string };
  const text = String(b.text ?? "").trim().slice(0, 500);
  if (!text) throw new HttpError(400, "Texte vide.");
  if (b.type === "task") return addTask({ title: text, status: "todo", priority: "normale", tag: "Jarvis" });
  if (b.type === "note") {
    const cur = await read<string>("notes", "");
    const stamp = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    await store.set("notes", `${cur ? cur.trimEnd() + "\n\n" : ""}${stamp} (Jarvis) : ${text}`);
    return { ok: true };
  }
  throw new HttpError(400, "Action inconnue.");
});
