import "server-only";
import { SignJWT, importPKCS8 } from "jose";
import { unzipSync } from "fflate";
import { parseCsv } from "@/lib/csv";
import { read, store } from "@/lib/store";
import { toEur } from "@/lib/fx";
import { fetchJson } from "@/lib/http";
import type { Review, SaleRecord } from "@/lib/types";

type Cfg = Record<string, string>;
interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

const tokens = new Map<string, { token: string; exp: number }>();

/** Jeton OAuth Google à partir d'un compte de service. */
export async function googleToken(serviceAccountJson: string, scope: string) {
  const sa = JSON.parse(serviceAccountJson) as ServiceAccount;
  const memo = tokens.get(sa.client_email + scope);
  if (memo && memo.exp > Date.now() + 60_000) return memo.token;
  const aud = sa.token_uri || "https://oauth2.googleapis.com/token";
  const key = await importPKCS8(sa.private_key, "RS256");
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setAudience(aud)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
  const data = await fetchJson<{ access_token: string; expires_in: number }>(aud, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  tokens.set(sa.client_email + scope, { token: data.access_token, exp: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}

const GCS_SCOPE = "https://www.googleapis.com/auth/devstorage.read_only";
const PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher";

function bucketName(cfg: Cfg) {
  return cfg.bucket.replace(/^gs:\/\//, "").split("/")[0];
}

async function listObjects(cfg: Cfg, prefix: string) {
  const tk = await googleToken(cfg.serviceAccount, GCS_SCOPE);
  const data = await fetchJson<{ items?: { name: string; updated: string }[] }>(
    `https://storage.googleapis.com/storage/v1/b/${bucketName(cfg)}/o?prefix=${encodeURIComponent(prefix)}`,
    { headers: { Authorization: `Bearer ${tk}` } },
  );
  return data.items ?? [];
}

async function download(cfg: Cfg, name: string) {
  const tk = await googleToken(cfg.serviceAccount, GCS_SCOPE);
  const res = await fetch(`https://storage.googleapis.com/storage/v1/b/${bucketName(cfg)}/o/${encodeURIComponent(name)}?alt=media`, {
    headers: { Authorization: `Bearer ${tk}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Cloud Storage ${res.status} pour ${name}`);
  return new Uint8Array(await res.arrayBuffer());
}

function decode(bytes: Uint8Array) {
  // Les rapports d'installations sont en UTF-16 LE.
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
  return new TextDecoder().decode(bytes);
}

function months(from: string, to: string) {
  const out: string[] = [];
  const d = new Date(from.slice(0, 7) + "-01T00:00:00Z");
  const end = new Date(to.slice(0, 7) + "-01T00:00:00Z");
  while (d <= end) {
    out.push(d.toISOString().slice(0, 7).replace("-", ""));
    d.setUTCMonth(d.getUTCMonth() + 1);
  }
  return out;
}

async function monthSales(cfg: Cfg, ym: string): Promise<SaleRecord[]> {
  const isCurrent = ym === new Date().toISOString().slice(0, 7).replace("-", "");
  const key = `sales:googleplay:${ym}`;
  const cached = await read<{ at: number; rows: SaleRecord[] } | null>(key, null);
  if (cached && (!isCurrent || Date.now() - cached.at < 6 * 36e5)) return cached.rows;

  const rows: SaleRecord[] = [];
  const files = await listObjects(cfg, `sales/salesreport_${ym}`);
  for (const f of files) {
    const zip = unzipSync(await download(cfg, f.name));
    for (const content of Object.values(zip)) {
      const lines = parseCsv(decode(content), ",");
      let i = 0;
      for (const r of lines) {
        const status = r["Financial Status"] || "";
        const price = Number(r["Item Price"] || r["Charged Amount"] || 0);
        const refund = /refund/i.test(status);
        // Estimation du net : prix hors taxes moins la commission Google (15 %).
        const net = await toEur(price * 0.85, r["Currency of Sale"]);
        rows.push({
          id: `gp-${ym}-${i++}`,
          date: (r["Order Charged Date"] || "").slice(0, 10),
          source: "googleplay",
          product: r["Product Title"] || r["SKU ID"] || "App",
          country: r["Country of Buyer"] || "",
          units: refund ? -1 : 1,
          amount: Math.round((refund ? -net : net) * 100) / 100,
          kind: refund ? "remboursement" : /subscription/i.test(r["Product Type"] || "") ? "abonnement" : "achat",
        });
      }
    }
  }
  if (cfg.packageName) {
    const installs = await listObjects(cfg, `stats/installs/installs_${cfg.packageName}_${ym}_overview`);
    for (const f of installs) {
      const lines = parseCsv(decode(await download(cfg, f.name)), ",");
      for (const r of lines) {
        const n = Number(r["Daily User Installs"] || r["Install events"] || 0);
        if (!n) continue;
        rows.push({ id: `gp-dl-${r["Date"]}`, date: r["Date"], source: "googleplay", product: cfg.packageName, country: "", units: n, amount: 0, kind: "telechargement" });
      }
    }
  }
  await store.set(key, { at: Date.now(), rows });
  return rows;
}

export async function googlePlaySales(cfg: Cfg, from: string, to: string) {
  const all = (await Promise.all(months(from, to).map((m) => monthSales(cfg, m)))).flat();
  return all.filter((r) => r.date >= from && r.date <= to);
}

export async function testGooglePlay(cfg: Cfg) {
  const items = await listObjects(cfg, "sales/");
  return `Connecté au bucket. ${items.length} rapport(s) de ventes trouvés.`;
}

export async function googlePlayReviews(cfg: Cfg): Promise<Review[]> {
  if (!cfg.packageName) return [];
  const tk = await googleToken(cfg.serviceAccount, PUBLISHER_SCOPE);
  const data = await fetchJson<{
    reviews?: { reviewId: string; authorName: string; comments: { userComment?: { text: string; starRating: number; lastModified: { seconds: string }; appVersionName?: string; reviewerLanguage?: string }; developerComment?: { text: string } }[] }[];
  }>(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${cfg.packageName}/reviews?maxResults=100`, {
    headers: { Authorization: `Bearer ${tk}` },
  });
  return (data.reviews ?? []).map((r) => {
    const user = r.comments.find((c) => c.userComment)?.userComment;
    const dev = r.comments.find((c) => c.developerComment)?.developerComment;
    return {
      id: r.reviewId,
      store: "googleplay" as const,
      rating: user?.starRating ?? 0,
      title: "",
      body: user?.text?.trim() ?? "",
      author: r.authorName || "Utilisateur Google",
      date: new Date(Number(user?.lastModified.seconds ?? 0) * 1000).toISOString(),
      country: user?.reviewerLanguage,
      version: user?.appVersionName,
      reply: dev?.text,
    };
  });
}

export async function replyGooglePlayReview(cfg: Cfg, reviewId: string, text: string) {
  const tk = await googleToken(cfg.serviceAccount, PUBLISHER_SCOPE);
  await fetchJson(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${cfg.packageName}/reviews/${reviewId}:reply`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tk}`, "Content-Type": "application/json" },
    body: JSON.stringify({ replyText: text }),
  });
}
