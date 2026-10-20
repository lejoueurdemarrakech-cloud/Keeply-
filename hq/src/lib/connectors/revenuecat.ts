import "server-only";
import { fetchJson } from "@/lib/http";

type Cfg = Record<string, string>;

export async function revenueCatOverview(cfg: Cfg) {
  const data = await fetchJson<{ metrics: { id: string; value: number; unit?: string }[] }>(
    `https://api.revenuecat.com/v2/projects/${cfg.projectId}/metrics/overview`,
    { headers: { Authorization: `Bearer ${cfg.secretKey}` } },
  );
  const m = Object.fromEntries(data.metrics.map((x) => [x.id, x.value]));
  return {
    mrr: Number(m.mrr ?? 0),
    active: Number(m.active_subscriptions ?? 0),
    trials: Number(m.active_trials ?? 0),
    revenue28d: Number(m.revenue ?? 0),
    newCustomers: Number(m.new_customers ?? 0),
    source: "RevenueCat",
  };
}

export async function testRevenueCat(cfg: Cfg) {
  const o = await revenueCatOverview(cfg);
  return `Connecté. MRR ${o.mrr.toFixed(0)} $, ${o.active} abonnés actifs.`;
}
