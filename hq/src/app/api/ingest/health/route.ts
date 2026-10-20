import { route } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { runHealth, type E2eReport } from "@/lib/health";
import { store } from "@/lib/store";

/** Reçoit le rapport des tests navigateur lancés chaque jour par GitHub Actions. */
export const maxDuration = 300;
export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  const body = (await req.json()) as Partial<E2eReport>;
  const report: E2eReport = {
    at: new Date().toISOString(),
    passed: Number(body.passed ?? 0),
    failed: Number(body.failed ?? 0),
    failures: (body.failures ?? []).slice(0, 30).map((f) => ({ name: String(f.name).slice(0, 200), error: String(f.error).slice(0, 500) })),
    consoleErrors: (body.consoleErrors ?? []).slice(0, 30).map((e) => String(e).slice(0, 300)),
    url: body.url ? String(body.url) : undefined,
  };
  await store.set("health:e2e", report);
  const run = await runHealth("e2e");
  return { ok: true, score: run.score };
});
