import { route, HttpError } from "@/lib/http";
import { clearConfig, saveConfig } from "@/lib/connectors/config";
import { CONNECTORS, type ConnectorId } from "@/lib/connectors/registry";

type Ctx = { params: Promise<{ id: string }> };

async function valid(params: Ctx["params"]) {
  const { id } = await params;
  if (!CONNECTORS.some((c) => c.id === id)) throw new HttpError(404, "Connexion inconnue.");
  return id as ConnectorId;
}

export const PUT = route(async (req: Request, { params }: Ctx) => {
  await saveConfig(await valid(params), (await req.json()) as Record<string, string>);
  return { ok: true };
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await clearConfig(await valid(params));
  return { ok: true };
});
