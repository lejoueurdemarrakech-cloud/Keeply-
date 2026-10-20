import { route } from "@/lib/http";
import { publishPost } from "@/lib/instagram";

export const maxDuration = 300;
export const POST = route(async (_req: Request, { params }: { params: Promise<{ id: string }> }) => publishPost((await params).id));
