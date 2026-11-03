import { HttpError, route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { adsSummary, getMemory } from "@/lib/jarvis";
import { read, store } from "@/lib/store";
import { addTask } from "@/lib/tasks";
import { todayOverview } from "@/lib/today";
import { PLAN_ITEMS, isoLocal } from "@/lib/launch-calendar";
import { listProspects } from "@/lib/prospects";
import { androidWaitlist } from "@/lib/android";
import type { ActivityEntry } from "@/lib/settings";

/**
 * Accès de l'app Jarvis installée sur le Mac (même jeton que le pont).
 * GET : les chiffres et listes de HQ. POST : tâche ou note créée à la voix.
 */
export const GET = route(async (req: Request) => {
  checkIngestToken(req);
  const [today, ads, memory, activity, prospects, android] = await Promise.all([
    todayOverview(),
    adsSummary().catch(() => null),
    getMemory(),
    read<ActivityEntry[]>("activity", []),
    listProspects().catch(() => []),
    androidWaitlist().catch(() => []),
  ]);
  // Écran d'accueil de Jarvis : fil d'actu de HQ, calendrier du lancement, prospection.
  const now = new Date();
  const from = isoLocal(now);
  const plan = PLAN_ITEMS.filter((i) => i.date >= from).slice(0, 8).map((i) => ({ kind: i.kind, id: i.id, date: i.date, heure: i.heure, titre: i.titre, format: i.format }));
  // Tout le plan, avec de quoi le lire à voix haute (accroche des posts, objectif des stories).
  const planFull = PLAN_ITEMS.filter((i) => i.date >= from).slice(0, 60).map((i) => ({
    kind: i.kind, id: i.id, date: i.date, heure: i.heure, titre: i.titre, format: i.format,
    texte: i.kind === "post" ? String(i.post.accroche ?? "").slice(0, 300) : String(i.story.objectif ?? "").slice(0, 300),
  }));
  const live = prospects.filter((p) => p.status !== "exclu" && p.score !== "ecarte");
  const contacted = ["contacte", "envoye", "relance1", "relance2", "repondu", "interesse", "refus", "client"];
  const byCountry: Record<string, number> = {};
  for (const p of live) byCountry[p.country] = (byCountry[p.country] ?? 0) + 1;
  const extra = {
    activity: activity.slice(0, 12),
    plan,
    planFull,
    launchDate: "2026-11-15",
    prospection: {
      total: live.length,
      contacted: live.filter((p) => contacted.includes(p.status)).length,
      interested: live.filter((p) => ["interesse", "client"].includes(p.status)).length,
      clients: live.filter((p) => p.status === "client").length,
      followUps: live.filter((p) => p.nextAction && p.nextAction.at <= now.toISOString() && !["client", "refus"].includes(p.status)).length,
      byCountry,
    },
    android: android.length,
  };
  return { at: now.toISOString(), today, ads, memory, extra };
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
