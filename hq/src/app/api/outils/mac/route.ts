import { route, HttpError } from "@/lib/http";
import { bridgeOnline, heartbeat, sendHarveyCommand } from "@/lib/bridge";

export const maxDuration = 60;

/** Outils installés sur le Mac (n8n, Crawl4AI), vus à travers le pont. */
export const GET = route(async () => {
  const [hb, online] = await Promise.all([heartbeat(), bridgeOnline()]);
  return { online, outils: online ? (hb?.outils ?? null) : null };
});

/** Lire un site public avec Crawl4AI sur le Mac. */
export const POST = route(async (req: Request) => {
  const { url } = (await req.json()) as { url?: string };
  const clean = String(url ?? "").trim();
  if (!clean || clean.length > 500) throw new HttpError(400, "Adresse du site manquante.");
  if (!(await bridgeOnline())) throw new HttpError(503, "Le Mac est éteint ou le pont est arrêté.");
  return sendHarveyCommand({ action: "lire-site", url: clean }, 50_000);
});
