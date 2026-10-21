import { route, HttpError } from "@/lib/http";
import { ROUNDS, runRound, type RoundName } from "@/lib/rounds";
import { store } from "@/lib/store";

export const maxDuration = 300;

export const GET = route(async () => {
  const names = Object.keys(ROUNDS) as RoundName[];
  return Object.fromEntries(await Promise.all(names.map(async (n) => [n, (await store.get("round:last:" + n)) ?? null] as const)));
});

/** « Lancer maintenant » depuis HQ. */
export const POST = route(async (req: Request) => {
  const { name } = (await req.json()) as { name: string };
  if (!(name in ROUNDS)) throw new HttpError(400, "Tournée inconnue.");
  return { name, result: await runRound(name as RoundName) };
});
