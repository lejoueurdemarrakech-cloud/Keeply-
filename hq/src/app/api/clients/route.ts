import { route } from "@/lib/http";
import { read, store } from "@/lib/store";
import { demoClients } from "@/lib/demo";
import type { Client } from "@/lib/types";

export const GET = route(async () => {
  const saved = await store.get<Client[]>("clients");
  return { clients: saved ?? demoClients(), demo: saved === undefined };
});

export const PUT = route(async (req: Request) => {
  const clients = (await req.json()) as Client[];
  await store.set("clients", clients);
  return { clients, demo: false };
});

export const DELETE = route(async () => {
  await store.set("clients", (await read<Client[]>("clients", [])).filter((c) => !c.id.startsWith("demo-")));
  return { ok: true };
});
