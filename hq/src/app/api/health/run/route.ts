import { route } from "@/lib/http";
import { HttpError } from "@/lib/http";
import { runHealth } from "@/lib/health";
import { CHECKS_PAUSED, PAUSED_MESSAGE } from "@/lib/prelaunch";

export const maxDuration = 300;
export const POST = route(() => {
  if (CHECKS_PAUSED) throw new HttpError(423, PAUSED_MESSAGE);
  return runHealth("manuel");
});
