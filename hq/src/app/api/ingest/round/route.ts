import { route, HttpError } from "@/lib/http";
import { checkIngestToken } from "@/lib/ingest";
import { ROUNDS, runRound, type RoundName } from "@/lib/rounds";
import { CHECKS_PAUSED, PAUSED_MESSAGE } from "@/lib/prelaunch";

export const maxDuration = 300;

/** Tournée planifiée, déclenchée par le pont du Mac à l'heure choisie. */
export const POST = route(async (req: Request) => {
  checkIngestToken(req);
  if (CHECKS_PAUSED) return { skipped: PAUSED_MESSAGE };
  const { name } = (await req.json()) as { name: string };
  if (!(name in ROUNDS)) throw new HttpError(400, "Tournée inconnue.");
  return { name, result: await runRound(name as RoundName) };
});
