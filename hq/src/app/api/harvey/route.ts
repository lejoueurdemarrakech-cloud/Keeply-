import { route, HttpError } from "@/lib/http";
import { bridgeOnline, harveySnapshot, heartbeat, sendHarveyCommand, type HarveyAction } from "@/lib/bridge";

export const maxDuration = 60;

export const GET = route(async () => {
  const [snapshot, hb, online] = await Promise.all([harveySnapshot(), heartbeat(), bridgeOnline()]);
  return { online, bridge: hb ?? null, snapshot: snapshot ?? null };
});

const ACTIONS = new Set(["start", "stop", "approve", "approve-all", "reject", "edit", "sending", "profile", "discover-estimate", "discover-run"]);

export const POST = route(async (req: Request) => {
  const cmd = (await req.json()) as HarveyAction;
  if (!cmd || !ACTIONS.has(cmd.action)) throw new HttpError(400, "Action inconnue.");
  if (!(await bridgeOnline())) throw new HttpError(503, "Le Mac est éteint ou le pont est arrêté : Harvey n'est pas joignable.");
  return sendHarveyCommand(cmd, 50_000);
});
