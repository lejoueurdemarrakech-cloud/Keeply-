import "server-only";
import { configOrNull } from "@/lib/connectors/config";
import { igOverview, igPublish } from "@/lib/connectors/meta";
import { demoInstagram } from "@/lib/demo";
import { read, update } from "@/lib/store";
import { logActivity } from "@/lib/settings";
import type { Post } from "@/lib/types";

type Overview = ReturnType<typeof demoInstagram>;

let memo: { at: number; data: Overview & { live: boolean; error?: string } } | null = null;

export async function instagramOverview(force = false) {
  if (!force && memo && Date.now() - memo.at < 10 * 60_000) return memo.data;
  const cfg = await configOrNull("instagram");
  let data: Overview & { live: boolean; error?: string };
  if (!cfg) data = { ...demoInstagram(), live: false };
  else {
    try {
      data = { ...(await igOverview(cfg)), live: true };
    } catch (e) {
      data = { ...demoInstagram(), live: false, error: e instanceof Error ? e.message : String(e) };
    }
  }
  memo = { at: Date.now(), data };
  return data;
}

/** Analyses dérivées : meilleurs créneaux, formats, hashtags, taux d'engagement. */
export function analyze(o: Overview) {
  const media = o.media;
  const followers = o.account.followers || 1;
  const eng = (m: Overview["media"][number]) => m.likes + m.comments * 2 + m.saves * 3 + m.shares * 3;

  const heat = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => ({ sum: 0, n: 0 })));
  for (const m of media) {
    const d = new Date(m.timestamp);
    const day = (d.getDay() + 6) % 7; // lundi = 0
    heat[day][d.getHours()].sum += eng(m) / Math.max(1, m.reach || followers);
    heat[day][d.getHours()].n += 1;
  }
  const best = heat
    .flatMap((row, day) => row.map((c, hour) => ({ day, hour, score: c.n ? c.sum / c.n : 0, n: c.n })))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const byType = new Map<string, { n: number; reach: number; eng: number }>();
  for (const m of media) {
    const t = byType.get(m.type) ?? { n: 0, reach: 0, eng: 0 };
    t.n++;
    t.reach += m.reach;
    t.eng += eng(m);
    byType.set(m.type, t);
  }
  const formats = [...byType.entries()].map(([type, v]) => ({ type, posts: v.n, avgReach: Math.round(v.reach / v.n), avgEngagement: Math.round(v.eng / v.n) }));

  const tags = new Map<string, { n: number; reach: number }>();
  for (const m of media) {
    for (const t of m.caption.match(/#[\p{L}\d_]+/gu) ?? []) {
      const cur = tags.get(t.toLowerCase()) ?? { n: 0, reach: 0 };
      cur.n++;
      cur.reach += m.reach;
      tags.set(t.toLowerCase(), cur);
    }
  }
  const hashtags = [...tags.entries()].map(([tag, v]) => ({ tag, posts: v.n, avgReach: Math.round(v.reach / v.n) })).sort((a, b) => b.avgReach - a.avgReach).slice(0, 15);

  const recent = media.slice(0, 12);
  const engagementRate = recent.length ? recent.reduce((s, m) => s + (m.likes + m.comments + m.saves + m.shares), 0) / recent.length / followers : 0;
  const g = o.growth;
  const last7 = g.slice(-7).reduce((s, d) => s + d.gained - d.lost, 0);
  const prev7 = g.slice(-14, -7).reduce((s, d) => s + d.gained - d.lost, 0);
  const postsPerWeek = media.filter((m) => Date.now() - new Date(m.timestamp).getTime() < 28 * 864e5).length / 4;

  return {
    heat: heat.map((row) => row.map((c) => (c.n ? Math.round((c.sum / c.n) * 1000) / 10 : null))),
    best,
    formats,
    hashtags,
    engagementRate,
    followersGained7: last7,
    followersGainedPrev7: prev7,
    postsPerWeek,
    top: [...media].sort((a, b) => eng(b) - eng(a)).slice(0, 5),
  };
}

/* ---------- posts programmés ---------- */

export const listPosts = () => read<Post[]>("posts", []);

export async function savePost(post: Post) {
  await update<Post[]>("posts", [], (all) => {
    const i = all.findIndex((p) => p.id === post.id);
    if (i >= 0) all[i] = post;
    else all.push(post);
    return all;
  });
  return post;
}

export async function deletePost(id: string) {
  await update<Post[]>("posts", [], (all) => all.filter((p) => p.id !== id));
}

export async function publishPost(id: string) {
  const posts = await listPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error("Post introuvable.");
  if (!post.media.length) throw new Error("Ajoute au moins une image ou une vidéo.");
  const cfg = await configOrNull("instagram");
  if (!cfg) throw new Error("Connecte Instagram (page Connexions) pour publier.");
  const local = post.media.find((u) => !/^https:\/\//.test(u));
  if (local) throw new Error("Instagram ne peut pas lire les fichiers locaux : configure le stockage des images (Vercel Blob) ou colle une adresse https publique.");
  await savePost({ ...post, status: "publication", error: undefined });
  try {
    const res = await igPublish(cfg, post);
    const done = { ...post, status: "publie" as const, igMediaId: res.id, permalink: res.permalink, publishedAt: new Date().toISOString(), error: undefined };
    await savePost(done);
    await logActivity("instagram", `Post publié : « ${post.caption.slice(0, 50)}… »`, "succes");
    memo = null;
    return done;
  } catch (e) {
    const failed = { ...post, status: "echec" as const, error: e instanceof Error ? e.message : String(e) };
    await savePost(failed);
    await logActivity("instagram", `Échec de publication : ${failed.error}`, "erreur");
    throw e;
  }
}

/** Appelé par la tâche planifiée : publie tout ce qui est arrivé à échéance. */
export async function publishDuePosts() {
  const now = Date.now();
  const due = (await listPosts()).filter((p) => p.status === "programme" && p.scheduledAt && new Date(p.scheduledAt).getTime() <= now);
  const results: string[] = [];
  for (const p of due) {
    try {
      await publishPost(p.id);
      results.push(`publié ${p.id}`);
    } catch (e) {
      results.push(`échec ${p.id}: ${e instanceof Error ? e.message : e}`);
    }
  }
  return results;
}
