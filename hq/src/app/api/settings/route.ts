import { route } from "@/lib/http";
import { getSettings, saveSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export const GET = route(getSettings);
export const PUT = route(async (req: Request) => {
  await saveSettings((await req.json()) as Partial<Settings>);
  return getSettings();
});
