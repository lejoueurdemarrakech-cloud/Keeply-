import { route, HttpError } from "@/lib/http";
import { listPosts, savePost } from "@/lib/instagram";
import { uid } from "@/lib/store";
import type { Post } from "@/lib/types";

export const GET = route(async () => (await listPosts()).sort((a, b) => (a.scheduledAt ?? a.createdAt).localeCompare(b.scheduledAt ?? b.createdAt)));

export const POST = route(async (req: Request) => {
  const body = (await req.json()) as Partial<Post>;
  if (!body.caption?.trim() && !body.media?.length) throw new HttpError(400, "Ajoute une légende ou un média.");
  const post: Post = {
    id: uid("p"),
    format: body.format ?? "image",
    caption: body.caption ?? "",
    media: body.media ?? [],
    firstComment: body.firstComment,
    pillar: body.pillar,
    scheduledAt: body.scheduledAt ?? null,
    status: body.scheduledAt ? "programme" : "brouillon",
    createdAt: new Date().toISOString(),
  };
  return savePost(post);
});
