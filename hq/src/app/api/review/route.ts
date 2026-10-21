import { route, HttpError } from "@/lib/http";
import { decideReview, listReview } from "@/lib/rounds";

export const maxDuration = 60;

export const GET = route(async (req: Request) => {
  const items = await listReview();
  if (new URL(req.url).searchParams.has("count")) return { pending: items.filter((x) => x.status === "a-valider").length };
  return { items };
});

export const POST = route(async (req: Request) => {
  const b = (await req.json()) as { id: string; decision: "valider" | "refuser"; body?: string; subject?: string };
  if (!b.id || !["valider", "refuser"].includes(b.decision)) throw new HttpError(400, "Demande invalide.");
  return decideReview(b.id, b.decision, { body: b.body, subject: b.subject });
});
