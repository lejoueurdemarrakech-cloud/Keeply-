import { HttpError, route } from "@/lib/http";
import { forget, getMemory, remember } from "@/lib/jarvis";

export const GET = route(getMemory);
export const POST = route(async (req: Request) => {
  const { text } = (await req.json()) as { text?: string };
  if (!text?.trim()) throw new HttpError(400, "Rien à retenir.");
  return remember(text);
});
export const DELETE = route(async (req: Request) => forget(new URL(req.url).searchParams.get("id") ?? ""));
