import { route, HttpError } from "@/lib/http";
import { deletePost, listPosts, savePost } from "@/lib/instagram";
import type { Post } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  const { id } = await params;
  const post = (await listPosts()).find((p) => p.id === id);
  if (!post) throw new HttpError(404, "Post introuvable.");
  const patch = (await req.json()) as Partial<Post>;
  const next: Post = { ...post, ...patch, id };
  if (patch.scheduledAt !== undefined && post.status !== "publie") next.status = patch.scheduledAt ? "programme" : "brouillon";
  return savePost(next);
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  await deletePost((await params).id);
  return { ok: true };
});
