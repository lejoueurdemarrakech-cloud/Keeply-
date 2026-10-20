import { route, HttpError } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { igDiscover } from "@/lib/connectors/meta";
import { read, update } from "@/lib/store";

interface Watch {
  username: string;
  followers?: number;
  media?: number;
  avgLikes?: number;
  avgComments?: number;
  postsPerWeek?: number;
  bio?: string;
  checkedAt?: string;
  history?: { date: string; followers: number }[];
  topPosts?: { caption: string; likes: number; comments: number; permalink: string }[];
  note?: string;
}

async function refresh(username: string): Promise<Watch> {
  const cfg = await configOrNull("instagram");
  if (!cfg) throw new HttpError(400, "Connecte Instagram pour analyser d'autres comptes.");
  const d = await igDiscover(cfg, username);
  const media = d.media?.data ?? [];
  const avg = (k: "like_count" | "comments_count") => (media.length ? Math.round(media.reduce((s, m) => s + (m[k] ?? 0), 0) / media.length) : 0);
  const span = media.length > 1 ? (new Date(media[0].timestamp).getTime() - new Date(media[media.length - 1].timestamp).getTime()) / (7 * 864e5) : 1;
  return {
    username: d.username,
    followers: d.followers_count,
    media: d.media_count,
    bio: d.biography,
    avgLikes: avg("like_count"),
    avgComments: avg("comments_count"),
    postsPerWeek: Math.round((media.length / Math.max(span, 1)) * 10) / 10,
    checkedAt: new Date().toISOString(),
    topPosts: [...media]
      .sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
      .slice(0, 3)
      .map((m) => ({ caption: (m.caption ?? "").slice(0, 160), likes: m.like_count ?? 0, comments: m.comments_count ?? 0, permalink: m.permalink })),
  };
}

export const GET = route(async () => read<Watch[]>("ig:watch", []));

export const POST = route(async (req: Request) => {
  const { username, refreshAll } = (await req.json()) as { username?: string; refreshAll?: boolean };
  const list = await read<Watch[]>("ig:watch", []);
  const targets = refreshAll ? list.map((w) => w.username) : username ? [username.replace(/^@/, "").trim()] : [];
  for (const u of targets) {
    let fresh: Watch;
    try {
      fresh = await refresh(u);
    } catch (e) {
      if (!refreshAll) throw e;
      continue;
    }
    await update<Watch[]>("ig:watch", [], (all) => {
      const prev = all.find((w) => w.username.toLowerCase() === u.toLowerCase());
      const history = [...(prev?.history ?? []), { date: new Date().toISOString().slice(0, 10), followers: fresh.followers ?? 0 }].slice(-60);
      const merged = { ...prev, ...fresh, history, note: prev?.note };
      return prev ? all.map((w) => (w === prev ? merged : w)) : [...all, merged];
    });
  }
  return read<Watch[]>("ig:watch", []);
});

export const DELETE = route(async (req: Request) => {
  const u = new URL(req.url).searchParams.get("username");
  return update<Watch[]>("ig:watch", [], (all) => all.filter((w) => w.username !== u));
});
