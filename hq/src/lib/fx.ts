import "server-only";
import { read, store } from "@/lib/store";

// Taux approximatifs de secours (1 unité = x EUR) si le service de change est injoignable.
const FALLBACK: Record<string, number> = {
  EUR: 1, USD: 0.92, GBP: 1.17, CHF: 1.05, CAD: 0.67, AUD: 0.6, JPY: 0.0061, MAD: 0.092, SEK: 0.087, NOK: 0.085,
  DKK: 0.134, PLN: 0.23, CZK: 0.04, HUF: 0.0025, TRY: 0.027, BRL: 0.17, MXN: 0.05, INR: 0.011, CNY: 0.127, KRW: 0.00068,
  SGD: 0.69, HKD: 0.118, NZD: 0.55, ZAR: 0.05, AED: 0.25, SAR: 0.245, ILS: 0.25, RON: 0.2, TND: 0.29, XOF: 0.0015,
};

let memo: { day: string; rates: Record<string, number> } | null = null;

export async function eurRates(): Promise<Record<string, number>> {
  const day = new Date().toISOString().slice(0, 10);
  if (memo?.day === day) return memo.rates;
  const cached = await read<{ day: string; rates: Record<string, number> } | null>("fx", null);
  if (cached?.day === day) return (memo = cached).rates;
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=EUR", { signal: AbortSignal.timeout(6000) });
    const data = (await res.json()) as { rates: Record<string, number> };
    const rates: Record<string, number> = { ...FALLBACK, EUR: 1 };
    for (const [cur, perEur] of Object.entries(data.rates)) rates[cur] = 1 / perEur;
    memo = { day, rates };
    await store.set("fx", memo);
    return rates;
  } catch {
    return cached?.rates ?? FALLBACK;
  }
}

export async function toEur(amount: number, currency: string) {
  const rates = await eurRates();
  return amount * (rates[currency?.toUpperCase()] ?? 1);
}
