import { route } from "@/lib/http";
import { read, store } from "@/lib/store";

export const GET = route(async () => ({ text: await read<string>("notes", "") }));
export const PUT = route(async (req: Request) => {
  const { text } = (await req.json()) as { text: string };
  await store.set("notes", text.slice(0, 200_000));
  return { ok: true };
});
