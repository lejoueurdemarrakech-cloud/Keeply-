import { route, HttpError } from "@/lib/http";
import { revealEmail } from "@/lib/apollo";

export const POST = route(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  try {
    return await revealEmail(id);
  } catch (e) {
    throw new HttpError(400, e instanceof Error ? e.message : String(e));
  }
});
