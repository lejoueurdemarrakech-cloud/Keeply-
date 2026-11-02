"use client";
import { AlertTriangle, BadgeEuro, CircleCheck, MousePointerClick, Target, TrendingUp, Wallet } from "lucide-react";
import { ComboChart, Funnel, Legend } from "@/components/charts";
import { Badge, Button, Card, Empty, Stat, cx } from "@/components/ui";
import { compact, eur, num, pct } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { PRICE_MONTH, alerts, totals, type Ads } from "./shared";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function Overview({ data, onTab }: { data: Ads; onTab: (t: "campagnes" | "simulateur" | "annonces") => void }) {
  const t = totals(data.campaigns);
  const [target] = usePref<number>("ads-target-cpr", 6);
  const all = data.campaigns.flatMap((c) => alerts(c).map((a) => ({ ...a, campaign: c.name })));
  const half = Math.floor(data.daily.length / 2);
  const spendNow = data.daily.slice(half).reduce((s, d) => s + d.spend, 0);
  const spendPrev = data.daily.slice(0, half).reduce((s, d) => s + d.spend, 0);
  const resNow = data.daily.slice(half).reduce((s, d) => s + d.results, 0);
  const resPrev = data.daily.slice(0, half).reduce((s, d) => s + d.results, 0);
  const share = [...data.campaigns].sort((a, b) => b.spend - a.spend);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 2xl:grid-cols-6">
        <Stat label="Dépensé" value={eur(t.spend)} icon={<Wallet />} tone="coral" current={spendNow} prev={spendPrev || undefined} invert hint="2e moitié vs 1re" />
        <Stat label="Résultats" value={num(t.results)} icon={<Target />} tone="violet" current={resNow} prev={resPrev || undefined} hint="installations, prospects" />
        <Stat label="Coût / résultat" value={eur(t.cpr, true)} icon={<BadgeEuro />} tone={t.cpr && t.cpr <= target ? "mint" : "honey"} hint={`objectif ${eur(target, true)}`} />
        <Stat label="Taux de clic" value={pct(t.ctr, 2)} icon={<MousePointerClick />} tone="violet" hint={`CPC ${eur(t.cpc, true)}`} />
        <Stat label="CPM" value={eur(t.cpm, true)} icon={<TrendingUp />} tone="honey" hint="pour 1 000 affichages" />
        <Stat label="Retour (ROAS)" value={t.roas ? `${t.roas.toFixed(2).replace(".", ",")}×` : "-"} icon={<CircleCheck />} tone="mint" hint={t.revenue ? `${eur(t.revenue)} attribués` : "pas de valeur suivie"} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
        <Card title="Dépense et résultats par jour" action={<Legend items={[{ label: "Dépense", color: "var(--chart-5)" }, { label: "Résultats", color: "var(--chart-1)" }]} />}>
          <ComboChart
            data={data.daily}
            bar={{ key: "spend", label: "Dépense", color: "var(--chart-5)", format: (n) => eur(n, true) }}
            line={{ key: "results", label: "Résultats", color: "var(--chart-1)", format: num }}
            height={270}
          />
        </Card>
        <Card title="Le parcours de tes pubs">
          <Funnel
            steps={[
              { label: "Affichages", value: t.impressions, color: "var(--chart-3)" },
              { label: "Personnes touchées", value: t.reach, color: "var(--chart-4)" },
              { label: "Clics", value: t.clicks, color: "var(--chart-2)" },
              { label: "Résultats", value: t.results, color: "var(--chart-1)" },
            ]}
          />
          <p className="mt-4 text-[12.5px] text-ink-3">Les longueurs sont compressées pour que les petites étapes restent visibles : fie-toi aux chiffres.</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Où part le budget">
          {share.length === 0 ? (
            <Empty title="Aucune campagne sur la période" />
          ) : (
            <>
              <div className="flex h-4 overflow-hidden rounded-full" role="img" aria-label="Répartition du budget par campagne">
                {share.map((c, i) => (
                  <span key={c.id} style={{ width: `${(c.spend / Math.max(1, t.spend)) * 100}%`, background: COLORS[i % 5] }} className="border-r-2 border-[var(--glass-strong)] last:border-r-0" />
                ))}
              </div>
              <ul className="mt-4 space-y-2.5">
                {share.map((c, i) => (
                  <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-[13.5px]">
                    <span className="size-2.5 rounded-[3px]" style={{ background: COLORS[i % 5] }} />
                    <span className="truncate">{c.name}</span>
                    <span className="tnum text-right">
                      <span className="font-semibold">{eur(c.spend)}</span>
                      <span className="ml-2 text-ink-3">{pct(c.spend / Math.max(1, t.spend), 0)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>

        <Card title="À surveiller" action={all.length > 0 && <Badge tone="coral">{all.length}</Badge>}>
          {all.length === 0 ? (
            <Empty icon={<CircleCheck className="size-5" />} title="Rien d'inquiétant">Aucune campagne ne dépasse les seuils d&apos;alerte sur la période.</Empty>
          ) : (
            <ul className="space-y-3">
              {all.slice(0, 5).map((a, i) => (
                <li key={i} className={cx("rounded-2xl border p-3", a.level === "danger" ? "border-coral/30 bg-coral-soft" : "border-honey/30 bg-honey-soft")}>
                  <p className={cx("flex items-start gap-2 text-[13.5px] font-semibold", a.level === "danger" ? "text-coral" : "text-honey")}>
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <span>
                      {a.campaign} : {a.text}
                    </span>
                  </p>
                  <p className="mt-1 pl-6 text-[13px] text-ink-2">{a.fix}</p>
                </li>
              ))}
            </ul>
          )}
          {all.length > 0 && (
            <Button size="sm" variant="ghost" className="mt-3" onClick={() => onTab("campagnes")}>
              Voir les campagnes
            </Button>
          )}
        </Card>
      </div>

      <Card title="Est-ce rentable ?">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-[13px] text-ink-2">Coût pour obtenir un résultat</p>
            <p className="font-display tnum mt-1 text-[24px] font-bold">{eur(t.cpr, true)}</p>
          </div>
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-[13px] text-ink-2">Un abonné mensuel rapporte</p>
            <p className="font-display tnum mt-1 text-[24px] font-bold">{eur(PRICE_MONTH, true)} / mois</p>
          </div>
          <div className="glass-soft rounded-2xl p-4">
            <p className="text-[13px] text-ink-2">Résultats nécessaires pour 1 abonné rentable en 1 mois</p>
            <p className="font-display tnum mt-1 text-[24px] font-bold">{t.cpr ? `${Math.max(1, Math.floor(PRICE_MONTH / t.cpr))} max` : "-"}</p>
          </div>
        </div>
        <p className="mt-4 max-w-[70ch] text-[13.5px] text-ink-2">
          Si moins d&apos;un résultat sur {t.cpr ? Math.max(1, Math.floor(PRICE_MONTH / t.cpr)) : "?"} devient abonné, la pub coûte plus que le premier mois ne rapporte. Ça peut rester rentable si les clients restent plusieurs mois : le simulateur fait le calcul complet.
        </p>
        <Button size="sm" variant="primary" className="mt-3" onClick={() => onTab("simulateur")}>
          Ouvrir le simulateur
        </Button>
      </Card>

      <p className="text-[12.5px] text-ink-3">
        {compact(t.impressions)} affichages, {compact(t.reach)} personnes touchées sur la période.
      </p>
    </div>
  );
}
