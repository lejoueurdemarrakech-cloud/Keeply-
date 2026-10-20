import "server-only";
import { configOrNull } from "@/lib/connectors/config";
import { appStoreReviews } from "@/lib/connectors/appstore";
import { googlePlayReviews } from "@/lib/connectors/google";
import { demoReviews } from "@/lib/demo";
import type { Review } from "@/lib/types";

export const BUG_RE = /bug|crash|plant|ne (s'ouvre|fonctionne|marche)|marche pas|écran blanc|erreur|bloqu|impossible|freeze|fige|lent|déconnect|perdu|disparu|doesn'?t work|not working/i;

let memo: { at: number; data: { reviews: Review[]; live: boolean; errors: string[] } } | null = null;

export async function getReviews(force = false) {
  if (!force && memo && Date.now() - memo.at < 30 * 60_000) return memo.data;
  const [as, gp] = await Promise.all([configOrNull("appstore"), configOrNull("googleplay")]);
  const errors: string[] = [];
  let reviews: Review[] = [];
  let live = false;
  if (as?.appId) {
    live = true;
    reviews.push(...(await appStoreReviews(as).catch((e) => (errors.push(String(e.message ?? e)), []))));
  }
  if (gp?.packageName) {
    live = true;
    reviews.push(...(await googlePlayReviews(gp).catch((e) => (errors.push(String(e.message ?? e)), []))));
  }
  if (!live) reviews = demoReviews();
  reviews = reviews.map((r) => ({ ...r, bug: BUG_RE.test(`${r.title} ${r.body}`) })).sort((a, b) => b.date.localeCompare(a.date));
  memo = { at: Date.now(), data: { reviews, live, errors } };
  return memo.data;
}

export const resetReviewsCache = () => {
  memo = null;
};
