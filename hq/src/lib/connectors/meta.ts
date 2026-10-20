import "server-only";
import { fetchJson } from "@/lib/http";
import type { Post } from "@/lib/types";

type Cfg = Record<string, string>;
const base = (cfg: Cfg) => `https://${cfg.apiHost || "graph.facebook.com"}/${cfg.graphVersion || "v24.0"}`;

async function graph<T>(cfg: Cfg, path: string, params: Record<string, string> = {}, method: "GET" | "POST" = "GET") {
  const qs = new URLSearchParams({ ...params, access_token: cfg.accessToken });
  const url = `${base(cfg)}/${path}`;
  if (method === "GET") return fetchJson<T>(`${url}?${qs}`);
  return fetchJson<T>(url, { method: "POST", body: qs, headers: { "Content-Type": "application/x-www-form-urlencoded" } });
}

export async function igAccount(cfg: Cfg) {
  return graph<{ username: string; name?: string; followers_count: number; follows_count: number; media_count: number; profile_picture_url?: string }>(
    cfg,
    cfg.igUserId,
    { fields: "username,name,followers_count,follows_count,media_count,profile_picture_url" },
  );
}

export async function igTest(cfg: Cfg) {
  const a = await igAccount(cfg);
  return `Connecté à @${a.username} (${a.followers_count} abonnés).`;
}

interface IgMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

async function mediaInsights(cfg: Cfg, m: IgMedia) {
  const metrics = "reach,saved,shares,views";
  try {
    const r = await graph<{ data: { name: string; values?: { value: number }[]; total_value?: { value: number } }[] }>(cfg, `${m.id}/insights`, { metric: metrics });
    return Object.fromEntries(r.data.map((d) => [d.name, d.total_value?.value ?? d.values?.[0]?.value ?? 0])) as Record<string, number>;
  } catch {
    return {} as Record<string, number>;
  }
}

export async function igOverview(cfg: Cfg) {
  const account = await igAccount(cfg);
  const media = await graph<{ data: IgMedia[] }>(cfg, `${cfg.igUserId}/media`, {
    fields: "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
    limit: "30",
  });
  const withStats = await Promise.all(
    media.data.map(async (m) => {
      const ins = await mediaInsights(cfg, m);
      return {
        id: m.id,
        caption: m.caption ?? "",
        type: m.media_product_type === "REELS" ? "REEL" : m.media_type,
        timestamp: m.timestamp,
        permalink: m.permalink,
        thumbnail: m.thumbnail_url || m.media_url || "",
        likes: m.like_count ?? 0,
        comments: m.comments_count ?? 0,
        saves: ins.saved ?? 0,
        shares: ins.shares ?? 0,
        reach: ins.reach ?? 0,
        views: ins.views ?? 0,
      };
    }),
  );

  // Évolution quotidienne : abonnés gagnés + portée (30 derniers jours).
  const since = Math.floor(Date.now() / 1000) - 29 * 86400;
  const until = Math.floor(Date.now() / 1000);
  let growth: { date: string; followers: number; gained: number; lost: number; reach: number; views: number; profileViews: number }[] = [];
  try {
    const daily = await graph<{ data: { name: string; values: { value: number; end_time: string }[] }[] }>(cfg, `${cfg.igUserId}/insights`, {
      metric: "reach,follower_count",
      period: "day",
      since: String(since),
      until: String(until),
    });
    const reach = daily.data.find((d) => d.name === "reach")?.values ?? [];
    const gained = daily.data.find((d) => d.name === "follower_count")?.values ?? [];
    let running = account.followers_count - gained.reduce((s, v) => s + v.value, 0);
    growth = reach.map((v, i) => {
      const g = gained[i]?.value ?? 0;
      running += g;
      return { date: v.end_time.slice(0, 10), followers: running, gained: g, lost: 0, reach: v.value, views: 0, profileViews: 0 };
    });
  } catch {}

  let audience: { cities: { name: string; value: number }[]; ages: { name: string; value: number }[] } = { cities: [], ages: [] };
  try {
    const demo = async (breakdown: string) => {
      const r = await graph<{ data: { total_value: { breakdowns: { results: { dimension_values: string[]; value: number }[] }[] } }[] }>(cfg, `${cfg.igUserId}/insights`, {
        metric: "follower_demographics",
        period: "lifetime",
        metric_type: "total_value",
        breakdown,
      });
      const res = r.data[0]?.total_value.breakdowns[0]?.results ?? [];
      const total = res.reduce((s, x) => s + x.value, 0) || 1;
      return res
        .map((x) => ({ name: x.dimension_values[0].split(",")[0], value: Math.round((x.value / total) * 100) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    };
    audience = { cities: await demo("city"), ages: await demo("age") };
  } catch {}

  return {
    account: { username: account.username, name: account.name ?? "", followers: account.followers_count, following: account.follows_count, mediaCount: account.media_count, picture: account.profile_picture_url ?? "" },
    growth,
    media: withStats,
    audience,
  };
}

/** Infos publiques d'un autre compte pro (concurrent, inspiration) via business_discovery. */
export async function igDiscover(cfg: Cfg, username: string) {
  const u = username.replace(/^@/, "").trim();
  const r = await graph<{
    business_discovery: { username: string; name?: string; followers_count: number; media_count: number; biography?: string; media?: { data: { caption?: string; like_count?: number; comments_count?: number; timestamp: string; media_type: string; permalink: string }[] } };
  }>(cfg, cfg.igUserId, {
    fields: `business_discovery.username(${u}){username,name,followers_count,media_count,biography,media.limit(12){caption,like_count,comments_count,timestamp,media_type,permalink}}`,
  });
  return r.business_discovery;
}

async function waitContainer(cfg: Cfg, id: string) {
  for (let i = 0; i < 30; i++) {
    const s = await graph<{ status_code: string; status?: string }>(cfg, id, { fields: "status_code,status" });
    if (s.status_code === "FINISHED") return;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`Instagram n'a pas pu traiter le média : ${s.status ?? s.status_code}`);
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error("Instagram met trop de temps à traiter la vidéo. Réessaie dans quelques minutes.");
}

/** Publie un post sur Instagram. Les médias doivent être accessibles par une adresse publique (https). */
export async function igPublish(cfg: Cfg, post: Post) {
  const isVideo = (u: string) => /\.(mp4|mov)(\?|$)/i.test(u);
  const user = cfg.igUserId;
  let creationId: string;

  if (post.format === "carrousel") {
    const children: string[] = [];
    for (const url of post.media.slice(0, 10)) {
      const c = await graph<{ id: string }>(cfg, `${user}/media`, isVideo(url) ? { media_type: "VIDEO", video_url: url, is_carousel_item: "true" } : { image_url: url, is_carousel_item: "true" }, "POST");
      if (isVideo(url)) await waitContainer(cfg, c.id);
      children.push(c.id);
    }
    creationId = (await graph<{ id: string }>(cfg, `${user}/media`, { media_type: "CAROUSEL", children: children.join(","), caption: post.caption }, "POST")).id;
  } else if (post.format === "reel") {
    creationId = (await graph<{ id: string }>(cfg, `${user}/media`, { media_type: "REELS", video_url: post.media[0], caption: post.caption, share_to_feed: "true" }, "POST")).id;
  } else if (post.format === "story") {
    const url = post.media[0];
    creationId = (await graph<{ id: string }>(cfg, `${user}/media`, isVideo(url) ? { media_type: "STORIES", video_url: url } : { media_type: "STORIES", image_url: url }, "POST")).id;
  } else {
    creationId = (await graph<{ id: string }>(cfg, `${user}/media`, { image_url: post.media[0], caption: post.caption }, "POST")).id;
  }
  await waitContainer(cfg, creationId);
  const published = await graph<{ id: string }>(cfg, `${user}/media_publish`, { creation_id: creationId }, "POST");
  const info = await graph<{ permalink?: string }>(cfg, published.id, { fields: "permalink" }).catch(() => ({ permalink: undefined }));
  if (post.firstComment?.trim()) {
    await graph(cfg, `${published.id}/comments`, { message: post.firstComment.trim() }, "POST").catch(() => undefined);
  }
  return { id: published.id, permalink: info.permalink };
}

/* ---------------- Meta Ads ---------------- */

interface Insight {
  campaign_id?: string;
  campaign_name?: string;
  spend: string;
  impressions: string;
  reach?: string;
  clicks: string;
  ctr: string;
  cpc?: string;
  cpm: string;
  frequency?: string;
  date_start: string;
  actions?: { action_type: string; value: string }[];
  action_values?: { action_type: string; value: string }[];
}

const RESULT_TYPES = ["mobile_app_install", "app_install", "omni_app_install", "lead", "offsite_conversion.fb_pixel_lead", "omni_purchase", "purchase", "link_click"];
function mainResult(actions?: { action_type: string; value: string }[]) {
  if (!actions?.length) return 0;
  for (const t of RESULT_TYPES) {
    const hit = actions.find((a) => a.action_type === t);
    if (hit) return Number(hit.value);
  }
  return 0;
}

export async function adsOverview(cfg: Cfg, days = 30) {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const preset = days <= 7 ? "last_7d" : days <= 14 ? "last_14d" : days <= 30 ? "last_30d" : "last_90d";
  const ver = cfg.graphVersion || "v24.0";
  const call = <T,>(params: Record<string, string>) =>
    fetchJson<T>(`https://graph.facebook.com/${ver}/${account}/insights?${new URLSearchParams({ ...params, access_token: cfg.accessToken })}`);

  const [byCampaign, daily, campaigns] = await Promise.all([
    call<{ data: Insight[] }>({ level: "campaign", date_preset: preset, fields: "campaign_id,campaign_name,spend,impressions,reach,clicks,ctr,cpc,cpm,frequency,actions,action_values", limit: "50" }),
    call<{ data: Insight[] }>({ date_preset: preset, time_increment: "1", fields: "spend,clicks,impressions,ctr,cpm,actions", limit: "100" }),
    fetchJson<{ data: { id: string; name: string; status: string; objective: string }[] }>(
      `https://graph.facebook.com/${ver}/${account}/campaigns?${new URLSearchParams({ fields: "id,name,status,objective", limit: "50", access_token: cfg.accessToken })}`,
    ),
  ]);
  const meta = new Map(campaigns.data.map((c) => [c.id, c]));
  return {
    campaigns: byCampaign.data.map((c) => {
      const spend = Number(c.spend);
      const clicks = Number(c.clicks);
      const impressions = Number(c.impressions);
      const results = mainResult(c.actions);
      const revenue = Number(c.action_values?.find((a) => /purchase/.test(a.action_type))?.value ?? 0);
      return {
        id: c.campaign_id!,
        name: c.campaign_name!,
        objective: meta.get(c.campaign_id!)?.objective ?? "",
        status: meta.get(c.campaign_id!)?.status ?? "",
        spend,
        impressions,
        reach: Number(c.reach ?? 0),
        clicks,
        ctr: Number(c.ctr) / 100,
        cpc: Number(c.cpc ?? (clicks ? spend / clicks : 0)),
        cpm: Number(c.cpm),
        results,
        costPerResult: results ? spend / results : 0,
        frequency: Number(c.frequency ?? 0),
        revenue,
      };
    }),
    daily: daily.data.map((d) => ({ date: d.date_start, spend: Number(d.spend), clicks: Number(d.clicks), results: mainResult(d.actions) })),
  };
}

export async function adsTest(cfg: Cfg) {
  const account = cfg.adAccountId.startsWith("act_") ? cfg.adAccountId : `act_${cfg.adAccountId}`;
  const r = await fetchJson<{ name: string; currency: string }>(
    `https://graph.facebook.com/${cfg.graphVersion || "v24.0"}/${account}?fields=name,currency&access_token=${encodeURIComponent(cfg.accessToken)}`,
  );
  return `Connecté au compte « ${r.name} » (${r.currency}).`;
}
