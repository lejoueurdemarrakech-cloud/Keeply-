import "server-only";
import { configOrNull } from "@/lib/connectors/config";
import { appStoreSales } from "@/lib/connectors/appstore";
import { googlePlaySales } from "@/lib/connectors/google";
import { stripeSales, stripeSubscriptions } from "@/lib/connectors/stripe";
import { revenueCatOverview } from "@/lib/connectors/revenuecat";
import { demoSales, daysBetween, isoDay } from "@/lib/demo";
import { read } from "@/lib/store";
import type { SaleRecord, SalesSummary, SourceStatus } from "@/lib/types";

export const SOURCE_LABELS: Record<string, string> = {
  appstore: "App Store",
  googleplay: "Google Play",
  stripe: "Stripe",
  revenuecat: "RevenueCat",
  manual: "Autres / import",
};

type Fetcher = (cfg: Record<string, string>, from: string, to: string) => Promise<SaleRecord[]>;
const FETCHERS: Record<"appstore" | "googleplay" | "stripe", Fetcher> = {
  appstore: appStoreSales,
  googleplay: googlePlaySales,
  stripe: stripeSales,
};

async function collect(from: string, to: string) {
  const records: SaleRecord[] = [];
  const sources: SourceStatus[] = [];
  const cfgs = {
    appstore: await configOrNull("appstore"),
    googleplay: await configOrNull("googleplay"),
    stripe: await configOrNull("stripe"),
  };
  const manual = (await read<SaleRecord[]>("sales:manual", [])).filter((r) => r.date >= from && r.date <= to);
  const anyLive = Object.values(cfgs).some(Boolean) || !!(await configOrNull("revenuecat")) || manual.length > 0;

  await Promise.all(
    (Object.keys(FETCHERS) as (keyof typeof FETCHERS)[]).map(async (id) => {
      const cfg = cfgs[id];
      if (cfg) {
        try {
          records.push(...(await FETCHERS[id](cfg, from, to)));
          sources.push({ id, label: SOURCE_LABELS[id], state: "live" });
        } catch (e) {
          sources.push({ id, label: SOURCE_LABELS[id], state: "error", message: e instanceof Error ? e.message : String(e) });
        }
      } else if (!anyLive) {
        records.push(...demoSales(id, from, to));
        sources.push({ id, label: SOURCE_LABELS[id], state: "demo" });
      } else {
        sources.push({ id, label: SOURCE_LABELS[id], state: "off" });
      }
    }),
  );
  if (manual.length) {
    records.push(...manual);
    sources.push({ id: "manual", label: SOURCE_LABELS.manual, state: "live" });
  }
  return { records, sources, anyLive };
}

function totalsOf(rows: SaleRecord[]) {
  const t = { revenue: 0, units: 0, downloads: 0, refunds: 0, orders: 0 };
  for (const r of rows) {
    if (r.kind === "telechargement") t.downloads += r.units;
    else {
      t.revenue += r.amount;
      if (r.kind === "remboursement") t.refunds += Math.abs(r.amount);
      else {
        t.units += r.units;
        t.orders += 1;
      }
    }
  }
  t.revenue = Math.round(t.revenue * 100) / 100;
  t.refunds = Math.round(t.refunds * 100) / 100;
  return t;
}

export async function salesSummary(from: string, to: string): Promise<SalesSummary> {
  const span = daysBetween(from, to).length;
  const prevTo = isoDay(new Date(new Date(from + "T00:00:00Z").getTime() - 864e5));
  const prevFrom = isoDay(new Date(new Date(prevTo + "T00:00:00Z").getTime() - (span - 1) * 864e5));

  const [{ records, sources }, prev] = await Promise.all([collect(from, to), collect(prevFrom, prevTo)]);
  const paid = records.filter((r) => r.kind !== "telechargement");

  const byDay = new Map<string, Record<string, number | string>>();
  for (const d of daysBetween(from, to)) byDay.set(d, { date: d, total: 0, downloads: 0 });
  for (const r of records) {
    const row = byDay.get(r.date);
    if (!row) continue;
    if (r.kind === "telechargement") row.downloads = (row.downloads as number) + r.units;
    else {
      row[r.source] = Math.round((((row[r.source] as number) ?? 0) + r.amount) * 100) / 100;
      row.total = Math.round(((row.total as number) + r.amount) * 100) / 100;
    }
  }

  const group = (key: (r: SaleRecord) => string) => {
    const m = new Map<string, { revenue: number; units: number }>();
    for (const r of paid) {
      const k = key(r) || "—";
      const cur = m.get(k) ?? { revenue: 0, units: 0 };
      cur.revenue += r.amount;
      cur.units += r.units;
      m.set(k, cur);
    }
    return [...m.entries()].map(([k, v]) => ({ k, revenue: Math.round(v.revenue * 100) / 100, units: v.units })).sort((a, b) => b.revenue - a.revenue);
  };

  let subscriptions: SalesSummary["subscriptions"];
  const rc = await configOrNull("revenuecat");
  const st = await configOrNull("stripe");
  try {
    if (rc) {
      const o = await revenueCatOverview(rc);
      subscriptions = { mrr: o.mrr, active: o.active, trials: o.trials, source: "RevenueCat" };
      sources.push({ id: "revenuecat", label: "RevenueCat", state: "live" });
    } else if (st) {
      subscriptions = await stripeSubscriptions(st);
    }
  } catch (e) {
    sources.push({ id: "revenuecat", label: "Abonnements", state: "error", message: e instanceof Error ? e.message : String(e) });
  }
  if (!subscriptions && sources.every((s) => s.state === "demo" || s.state === "off")) {
    subscriptions = { mrr: 2384, active: 87, trials: 14, churnRate: 0.031, source: "Démo" };
  }

  return {
    from,
    to,
    currency: "EUR",
    totals: totalsOf(records),
    previous: totalsOf(prev.records),
    series: [...byDay.values()],
    bySource: group((r) => r.source).map((g) => ({ source: g.k, label: SOURCE_LABELS[g.k] ?? g.k, revenue: g.revenue, units: g.units })),
    byCountry: group((r) => r.country).map((g) => ({ country: g.k, revenue: g.revenue, units: g.units })).slice(0, 12),
    byProduct: group((r) => r.product).map((g) => ({ product: g.k, revenue: g.revenue, units: g.units })).slice(0, 10),
    recent: paid.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60),
    subscriptions,
    sources: sources.sort((a, b) => a.label.localeCompare(b.label)),
  };
}

/** Normalise une ligne importée (CSV ou webhook) venant d'une autre plateforme. */
export function normalizeImported(row: Record<string, unknown>, i: number, fallbackSource = "manual"): SaleRecord | null {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const hit = Object.keys(row).find((x) => x.toLowerCase().replace(/[^a-z]/g, "") === k);
      if (hit && row[hit] !== "" && row[hit] != null) return String(row[hit]);
    }
    return "";
  };
  const rawDate = get("date", "createdat", "created", "paidat", "orderdate");
  const date = rawDate ? new Date(/^\d{2}\/\d{2}\/\d{4}/.test(rawDate) ? rawDate.split("/").reverse().join("-") : rawDate) : null;
  const amount = Number(get("amount", "montant", "total", "net", "price", "prix").replace(",", ".").replace(/[^\d.-]/g, ""));
  if (!date || isNaN(date.getTime()) || isNaN(amount)) return null;
  return {
    id: `imp-${date.getTime()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
    date: isoDay(date),
    source: get("source", "platform", "plateforme") || fallbackSource,
    product: get("product", "produit", "description", "item") || "Vente",
    country: get("country", "pays").slice(0, 2).toUpperCase(),
    units: Number(get("units", "quantity", "quantite", "qty")) || 1,
    amount: Math.round(amount * 100) / 100,
    kind: amount < 0 ? "remboursement" : "achat",
  };
}
