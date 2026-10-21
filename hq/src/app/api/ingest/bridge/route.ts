import { route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { claimWork, finishCommand, finishJob, getBudget, recordUsage, saveHarveySnapshot, saveQuota, touchHeartbeat, type CallUsage, type HarveySnapshot, type QuotaSnapshot } from "@/lib/bridge";

/**
 * Échange avec le pont du Mac (un seul appel par passage) :
 * il dépose ses résultats et repart avec le travail en attente.
 */
export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  const b = (await req.json()) as {
    host?: string;
    claude?: string;
    harvey?: { dashboard: boolean; running: boolean };
    quota?: Omit<QuotaSnapshot, "at">;
    results?: { id: string; result?: string; error?: string; usage?: Partial<CallUsage> }[];
    commands?: { id: string; result?: unknown; error?: string }[];
    snapshot?: Omit<HarveySnapshot, "at">;
    harveyCalls?: { label: string; model: string; at: string; usage: Partial<CallUsage> }[];
  };
  await touchHeartbeat({ host: b.host?.slice(0, 80), claude: b.claude?.slice(0, 40), harvey: b.harvey });
  for (const r of b.results ?? []) await finishJob(String(r.id), { result: r.result, error: r.error?.slice(0, 500), usage: r.usage });
  for (const c of b.commands ?? []) await finishCommand(String(c.id), { result: c.result, error: c.error?.slice(0, 500) });
  if (b.quota) await saveQuota(b.quota);
  if (b.snapshot) await saveHarveySnapshot(b.snapshot);
  for (const h of (b.harveyCalls ?? []).slice(0, 50)) {
    const u = h.usage ?? {};
    await recordUsage({
      at: h.at,
      label: `Harvey · ${String(h.label).slice(0, 40)}`,
      model: String(h.model || "claude"),
      source: "harvey",
      ok: true,
      inputTokens: Number(u.inputTokens) || 0,
      outputTokens: Number(u.outputTokens) || 0,
      cacheReadTokens: Number(u.cacheReadTokens) || 0,
      cacheCreationTokens: Number(u.cacheCreationTokens) || 0,
      costUsd: Number(u.costUsd) || 0,
      durationMs: Number(u.durationMs) || 0,
    });
  }
  const [{ jobs, commands }, budget] = await Promise.all([claimWork(), getBudget()]);
  return { jobs, commands, budget, serverTime: new Date().toISOString() };
});
