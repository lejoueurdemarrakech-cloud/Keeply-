import { HttpError, route } from "@/lib/http";
import { readOverrides, resetPosition, setOverride } from "@/lib/plan-state";
import type { PlanOverride } from "@/lib/launch-calendar";

export const GET = route(async () => readOverrides());

export const PATCH = route(async (req: Request) => {
  const body = (await req.json()) as PlanOverride & { id?: string };
  if (!body.id) throw new HttpError(400, "id manquant.");
  try {
    const { id, ...patch } = body;
    return await setOverride(id, patch);
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : String(e));
  }
});

export const DELETE = route(async (req: Request) => {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw new HttpError(400, "id manquant.");
  return resetPosition(id);
});
