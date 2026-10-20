import { route } from "@/lib/http";
import { effectiveChecks, type E2eReport } from "@/lib/health";
import { read } from "@/lib/store";
import type { HealthRun } from "@/lib/types";

export const GET = route(async () => ({
  runs: await read<HealthRun[]>("health:runs", []),
  checks: await effectiveChecks(),
  e2e: await read<E2eReport | null>("health:e2e", null),
  ingestReady: !!process.env.INGEST_TOKEN,
}));
