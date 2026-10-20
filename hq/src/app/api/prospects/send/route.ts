import { route } from "@/lib/http";
import { sendNow, checkReplies } from "@/lib/prospects";

export const maxDuration = 60;
export const POST = route(async (req: Request) => {
  const { id, checkOnly } = (await req.json()) as { id?: string; checkOnly?: boolean };
  if (checkOnly) return { replies: await checkReplies() };
  await sendNow(id!);
  return { ok: true };
});
