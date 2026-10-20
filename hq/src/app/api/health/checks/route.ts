import { route } from "@/lib/http";
import { getSettings, saveSettings } from "@/lib/settings";
import { runCheck } from "@/lib/health";
import type { HealthCheck } from "@/lib/types";

export const PUT = route(async (req: Request) => {
  const { checks } = (await req.json()) as { checks: HealthCheck[] };
  const s = await getSettings();
  await saveSettings({ health: { ...s.health, checks } });
  return { ok: true };
});

/** Teste un contrôle tout de suite, sans l'enregistrer. */
export const POST = route(async (req: Request) => runCheck((await req.json()) as HealthCheck));
