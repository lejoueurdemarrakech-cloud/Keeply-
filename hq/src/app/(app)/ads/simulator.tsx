"use client";
import { Card, Ring, Segmented, cx } from "@/components/ui";
import { eur, num } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { PRICE_MONTH, PRICE_YEAR } from "./shared";

interface Sim {
  daily: number;
  cpr: number;
  conv: number; // % de résultats qui deviennent abonnés payants
  months: number; // durée moyenne d'abonnement
  plan: "mensuel" | "annuel";
}

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (n: number) => string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-semibold text-ink-2">{label}</span>
        <span className="tnum font-display text-[18px] font-bold">{format(value)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-2 w-full accent-[var(--violet)]" />
    </label>
  );
}

export function Simulator({ currentCpr }: { currentCpr: number }) {
  const [sim, setSim] = usePref<Sim>("ads-sim", { daily: 20, cpr: Math.round((currentCpr || 6) * 2) / 2, conv: 12, months: 8, plan: "mensuel" });
  const set = (p: Partial<Sim>) => setSim({ ...sim, ...p });

  const monthBudget = sim.daily * 30;
  const results = sim.cpr ? monthBudget / sim.cpr : 0;
  const subs = results * (sim.conv / 100);
  const cac = subs ? monthBudget / subs : 0;
  const ltv = sim.plan === "annuel" ? PRICE_YEAR * Math.max(1, sim.months / 12) : PRICE_MONTH * sim.months;
  const ratio = cac ? ltv / cac : 0;
  const monthly = sim.plan === "annuel" ? PRICE_YEAR / 12 : PRICE_MONTH;
  const payback = monthly ? cac / monthly : 0;
  const verdict = ratio >= 3 ? { t: "Très rentable", c: "var(--mint)", d: "Chaque euro investi en rapporte au moins 3 sur la durée de vie du client. Tu peux augmenter le budget progressivement." } : ratio >= 1.5 ? { t: "Rentable, marge fine", c: "var(--honey)", d: "Ça rapporte plus que ça ne coûte, mais peu d'écart : améliore le taux de conversion avant d'augmenter le budget." } : { t: "Pas rentable", c: "var(--coral)", d: "Un client coûte plus cher qu'il ne rapporte. Baisse le coût par résultat (visuels, audience) ou améliore la conversion de l'essai gratuit." };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card title="Tes hypothèses">
        <div className="space-y-6">
          <Slider label="Budget par jour" value={sim.daily} min={5} max={200} step={5} onChange={(v) => set({ daily: v })} format={(n) => eur(n)} />
          <Slider label="Coût par résultat (installation, prospect)" value={sim.cpr} min={0.5} max={40} step={0.5} onChange={(v) => set({ cpr: v })} format={(n) => eur(n, true)} />
          <Slider label="Résultats qui deviennent abonnés payants" value={sim.conv} min={1} max={60} step={1} onChange={(v) => set({ conv: v })} format={(n) => `${n} %`} />
          <Slider label="Durée moyenne d'abonnement" value={sim.months} min={1} max={36} step={1} onChange={(v) => set({ months: v })} format={(n) => `${n} mois`} />
          <div>
            <p className="mb-2 text-[13.5px] font-semibold text-ink-2">Formule choisie le plus souvent</p>
            <Segmented
              value={sim.plan}
              onChange={(v) => set({ plan: v })}
              options={[
                { value: "mensuel", label: `Mensuel ${eur(PRICE_MONTH, true)}` },
                { value: "annuel", label: `Annuel ${eur(PRICE_YEAR, true)}` },
              ]}
            />
          </div>
          {currentCpr > 0 && (
            <button className="text-[13px] font-semibold text-violet hover:underline" onClick={() => set({ cpr: Math.round(currentCpr * 2) / 2 })}>
              Reprendre mon coût réel actuel ({eur(currentCpr, true)})
            </button>
          )}
        </div>
      </Card>

      <div className="space-y-5">
        <Card title="Sur un mois">
          <div className="grid grid-cols-2 gap-4">
            {[
              { l: "Budget", v: eur(monthBudget) },
              { l: "Résultats", v: num(results) },
              { l: "Nouveaux abonnés", v: subs < 10 ? subs.toFixed(1).replace(".", ",") : num(subs) },
              { l: "Coût d'un abonné", v: eur(cac, true) },
            ].map((x) => (
              <div key={x.l} className="glass-soft rounded-2xl p-4">
                <p className="text-[13px] text-ink-2">{x.l}</p>
                <p className="font-display tnum mt-1 text-[24px] font-bold">{x.v}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Verdict">
          <div className="flex items-center gap-5">
            <Ring value={Math.min(1, ratio / 4)} size={84} stroke={8} color={verdict.c}>
              <span className="text-[15px]">{ratio ? `${ratio.toFixed(1).replace(".", ",")}×` : "-"}</span>
            </Ring>
            <div className="min-w-0">
              <p className="font-display text-[20px] font-bold" style={{ color: verdict.c }}>
                {verdict.t}
              </p>
              <p className="mt-1 text-[13.5px] text-ink-2">{verdict.d}</p>
            </div>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-[13.5px]">
            <div>
              <dt className="text-ink-3">Valeur d&apos;un client</dt>
              <dd className="tnum font-semibold">{eur(ltv, true)}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Remboursé en</dt>
              <dd className={cx("tnum font-semibold", payback > sim.months && "text-coral")}>{payback ? `${payback.toFixed(1).replace(".", ",")} mois` : "-"}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Revenu généré sur la durée</dt>
              <dd className="tnum font-semibold">{eur(subs * ltv)}</dd>
            </div>
            <div>
              <dt className="text-ink-3">Abonnés pour rembourser le mois</dt>
              <dd className="tnum font-semibold">{ltv ? Math.ceil(monthBudget / ltv) : "-"}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[12.5px] text-ink-3">Simulation hors TVA et hors commission de l&apos;App Store. Les chiffres réels dépendent de ton essai gratuit de 14 jours et de la saison.</p>
        </Card>
      </div>
    </div>
  );
}
