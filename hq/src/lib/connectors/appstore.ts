import "server-only";
import { SignJWT, importPKCS8 } from "jose";
import { gunzipSync } from "fflate";
import { parseCsv } from "@/lib/csv";
import { read, store } from "@/lib/store";
import { toEur } from "@/lib/fx";
import { daysBetween } from "@/lib/demo";
import type { Review, SaleRecord } from "@/lib/types";

type Cfg = Record<string, string>;
const API = "https://api.appstoreconnect.apple.com/v1";

async function token(cfg: Cfg) {
  const key = await importPKCS8(cfg.privateKey.trim(), "ES256");
  return new SignJWT({ aud: "appstoreconnect-v1" })
    .setProtectedHeader({ alg: "ES256", kid: cfg.keyId, typ: "JWT" })
    .setIssuer(cfg.issuerId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(key);
}

async function asc(cfg: Cfg, path: string, init: RequestInit = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { Authorization: `Bearer ${await token(cfg)}`, ...(init.headers || {}) },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  return res;
}

const DOWNLOAD_TYPES = new Set(["1", "1F", "1T", "1E", "1EP", "1EU", "F1", "FI1"]);
const UPDATE_TYPES = new Set(["7", "7F", "7T", "3", "3F"]);

async function dailyReport(cfg: Cfg, day: string): Promise<SaleRecord[]> {
  const cacheKey = `sales:appstore:${day}`;
  const cached = await read<SaleRecord[] | null>(cacheKey, null);
  if (cached) return cached;
  const qs = new URLSearchParams({
    "filter[frequency]": "DAILY",
    "filter[reportType]": "SALES",
    "filter[reportSubType]": "SUMMARY",
    "filter[vendorNumber]": cfg.vendorNumber,
    "filter[reportDate]": day,
    "filter[version]": "1_1",
  });
  const res = await asc(cfg, `/salesReports?${qs}`, { headers: { Accept: "application/a-gzip" } });
  const ageDays = (Date.now() - new Date(day + "T00:00:00Z").getTime()) / 864e5;
  if (res.status === 404) {
    // Pas de vente ce jour-là (ou rapport pas encore publié).
    if (ageDays > 3) await store.set(cacheKey, []);
    return [];
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`App Store Connect ${res.status} : ${body.slice(0, 180)}`);
  }
  const tsv = new TextDecoder().decode(gunzipSync(new Uint8Array(await res.arrayBuffer())));
  const rows = parseCsv(tsv, "\t");
  const out: SaleRecord[] = [];
  let i = 0;
  for (const r of rows) {
    const type = r["Product Type Identifier"];
    if (UPDATE_TYPES.has(type)) continue;
    const units = Number(r["Units"]) || 0;
    const proceeds = Number(r["Developer Proceeds"]) || 0;
    const amount = await toEur(units * proceeds, r["Currency of Proceeds"]);
    const isDownload = DOWNLOAD_TYPES.has(type) && proceeds === 0;
    out.push({
      id: `as-${day}-${i++}`,
      date: day,
      source: "appstore",
      product: r["Title"] || r["SKU"] || "App",
      country: r["Country Code"] || "",
      units,
      amount: Math.round(amount * 100) / 100,
      kind: isDownload ? "telechargement" : units < 0 ? "remboursement" : type === "IAY" ? (r["Subscription"] === "Renewal" ? "renouvellement" : "abonnement") : "achat",
    });
  }
  if (ageDays > 2) await store.set(cacheKey, out);
  return out;
}

export async function appStoreSales(cfg: Cfg, from: string, to: string) {
  const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const limit = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
  const days = daysBetween(from < limit ? limit : from, to > yesterday ? yesterday : to);
  const out: SaleRecord[] = [];
  for (let i = 0; i < days.length; i += 8) {
    const chunk = await Promise.all(days.slice(i, i + 8).map((d) => dailyReport(cfg, d)));
    chunk.forEach((c) => out.push(...c));
  }
  return out;
}

export async function testAppStore(cfg: Cfg) {
  const res = await asc(cfg, "/apps?limit=5&fields[apps]=name,bundleId");
  if (!res.ok) throw new Error(`Apple a refusé la clé (${res.status}). Vérifie Issuer ID, Key ID et la clé .p8.`);
  const data = (await res.json()) as { data: { id: string; attributes: { name: string } }[] };
  return `Connecté. Apps : ${data.data.map((a) => `${a.attributes.name} (${a.id})`).join(", ") || "aucune"}.`;
}

export async function appStoreReviews(cfg: Cfg): Promise<Review[]> {
  if (!cfg.appId) return [];
  const res = await asc(cfg, `/apps/${cfg.appId}/customerReviews?sort=-createdDate&limit=50&include=response`);
  if (!res.ok) throw new Error(`Avis App Store : ${res.status}`);
  const data = (await res.json()) as {
    data: { id: string; attributes: { rating: number; title: string; body: string; reviewerNickname: string; createdDate: string; territory: string }; relationships?: { response?: { data?: { id: string } | null } } }[];
    included?: { id: string; attributes: { responseBody: string } }[];
  };
  const responses = new Map((data.included ?? []).map((r) => [r.id, r.attributes.responseBody]));
  return data.data.map((r) => ({
    id: r.id,
    store: "appstore" as const,
    rating: r.attributes.rating,
    title: r.attributes.title ?? "",
    body: r.attributes.body ?? "",
    author: r.attributes.reviewerNickname,
    date: r.attributes.createdDate,
    country: r.attributes.territory,
    reply: r.relationships?.response?.data?.id ? responses.get(r.relationships.response.data.id) : undefined,
  }));
}

export async function replyAppStoreReview(cfg: Cfg, reviewId: string, body: string) {
  const res = await asc(cfg, "/customerReviewResponses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: { type: "customerReviewResponses", attributes: { responseBody: body }, relationships: { review: { data: { type: "customerReviews", id: reviewId } } } },
    }),
  });
  if (!res.ok) throw new Error(`Réponse refusée par Apple (${res.status}) : ${(await res.text()).slice(0, 160)}`);
}
