import "server-only";
import Stripe from "stripe";
import { toEur } from "@/lib/fx";
import type { SaleRecord } from "@/lib/types";

type Cfg = Record<string, string>;
const sec = (d: string, end = false) => Math.floor(new Date(d + (end ? "T23:59:59Z" : "T00:00:00Z")).getTime() / 1000);

export async function stripeSales(cfg: Cfg, from: string, to: string): Promise<SaleRecord[]> {
  const stripe = new Stripe(cfg.secretKey);
  const out: SaleRecord[] = [];
  for await (const tx of stripe.balanceTransactions.list({ created: { gte: sec(from), lte: sec(to, true) }, limit: 100, expand: ["data.source"] })) {
    if (!["charge", "payment", "refund", "payment_refund"].includes(tx.type)) continue;
    const src = tx.source as Stripe.Charge | Stripe.Refund | null;
    const charge = src && "billing_details" in src ? src : null;
    const amount = await toEur(tx.net / 100, tx.currency.toUpperCase());
    out.push({
      id: tx.id,
      date: new Date(tx.created * 1000).toISOString().slice(0, 10),
      source: "stripe",
      product: tx.description || charge?.description || "Paiement Stripe",
      country: charge?.billing_details?.address?.country || "",
      units: tx.type.includes("refund") ? -1 : 1,
      amount: Math.round(amount * 100) / 100,
      kind: tx.type.includes("refund") ? "remboursement" : /subscription|abonnement|invoice/i.test(tx.description ?? "") ? "abonnement" : "achat",
    });
    if (out.length > 5000) break;
  }
  return out;
}

export async function stripeSubscriptions(cfg: Cfg) {
  const stripe = new Stripe(cfg.secretKey);
  let mrr = 0;
  let active = 0;
  let trials = 0;
  for await (const sub of stripe.subscriptions.list({ status: "all", limit: 100 })) {
    if (sub.status === "trialing") trials++;
    if (sub.status !== "active" && sub.status !== "past_due") continue;
    active++;
    for (const item of sub.items.data) {
      const price = item.price;
      const unit = (price.unit_amount ?? 0) / 100;
      const interval = price.recurring?.interval ?? "month";
      const count = price.recurring?.interval_count ?? 1;
      const perMonth = interval === "year" ? unit / (12 * count) : interval === "week" ? (unit * 52) / (12 * count) : interval === "day" ? (unit * 365) / (12 * count) : unit / count;
      mrr += await toEur(perMonth * (item.quantity ?? 1), price.currency.toUpperCase());
    }
  }
  return { mrr: Math.round(mrr * 100) / 100, active, trials, source: "Stripe" };
}

export async function testStripe(cfg: Cfg) {
  const stripe = new Stripe(cfg.secretKey);
  const bal = await stripe.balance.retrieve();
  const avail = bal.available.map((b) => `${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`).join(", ");
  return `Connecté. Solde disponible : ${avail || "0"}.`;
}
