import { route } from "@/lib/http";
import { saveProspects } from "@/lib/prospects";
import { update } from "@/lib/store";
import type { Prospect } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const patch = (await req.json()) as Partial<Prospect>;
  let out: Prospect | undefined;
  await saveProspects((all) =>
    all.map((p) => {
      if (p.id !== id) return p;
      out = { ...p, ...patch, id, history: patch.status && patch.status !== p.status ? [...p.history, { at: new Date().toISOString(), event: `Statut : ${patch.status}` }] : p.history };
      if (patch.status && ["repondu", "interesse", "refus", "client", "exclu"].includes(patch.status)) out.nextSendAt = null;
      return out;
    }),
  );
  if (patch.status === "exclu" && out?.email) await update<string[]>("prospects:optout", [], (l) => [...new Set([...l, out!.email!.toLowerCase()])]);
  return out ?? {};
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const { id } = await params;
  await saveProspects((all) => all.filter((p) => p.id !== id));
  return { ok: true };
});
