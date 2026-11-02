"use client";
import { AlertTriangle, ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Badge, Card, Empty, Field, Ring, Segmented, cx } from "@/components/ui";
import { compact, eur, num, pct } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { alerts, objectiveLabel, score, scoreLabel, scoreTone, totals, type Campaign } from "./shared";

type Sort = "spend" | "results" | "cpr" | "ctr" | "score";
type Filter = "toutes" | "actives" | "pause";

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[12px] text-ink-3">{label}</p>
      <p className="tnum truncate text-[15px] font-semibold">{value}</p>
      {sub && <p className="truncate text-[11.5px] text-ink-3">{sub}</p>}
    </div>
  );
}

function advice(c: Campaign, target: number): string[] {
  const out: string[] = [];
  if (c.results > 0 && c.costPerResult <= target * 0.8) out.push("Coût sous ton objectif : augmente le budget de 20 % maximum tous les 3-4 jours pour ne pas relancer l'apprentissage.");
  if (c.results > 0 && c.costPerResult > target * 1.3) out.push("Coût au-dessus de ton objectif : coupe les publicités les moins bonnes de cette campagne et garde les 2 meilleures.");
  if (c.ctr >= 0.015) out.push("Bon taux de clic : l'accroche fonctionne, réutilise-la dans tes posts Instagram.");
  if (c.status !== "ACTIVE" && c.results > 0 && c.costPerResult <= target) out.push("Campagne en pause alors qu'elle était rentable : pense à la relancer.");
  return out;
}

export function Campaigns({ campaigns }: { campaigns: Campaign[] }) {
  const [sort, setSort] = usePref<Sort>("ads-sort", "spend");
  const [filter, setFilter] = useState<Filter>("toutes");
  const [open, setOpen] = useState<string | null>(null);
  const [target, setTarget] = usePref<number>("ads-target-cpr", 6);
  const avg = totals(campaigns).cpr;

  const rows = campaigns
    .filter((c) => (filter === "toutes" ? true : filter === "actives" ? c.status === "ACTIVE" : c.status !== "ACTIVE"))
    .map((c) => ({ c, s: score(c, avg) }))
    .sort((a, b) => {
      if (sort === "score") return (b.s ?? -1) - (a.s ?? -1);
      if (sort === "cpr") return (a.c.costPerResult || Infinity) - (b.c.costPerResult || Infinity);
      return b.c[sort] - a.c[sort];
    });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "toutes", label: `Toutes (${campaigns.length})` },
            { value: "actives", label: "Actives" },
            { value: "pause", label: "En pause" },
          ]}
        />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          Trier par
          <select className="field w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="spend">Dépense</option>
            <option value="results">Résultats</option>
            <option value="cpr">Coût par résultat</option>
            <option value="ctr">Taux de clic</option>
            <option value="score">Score de santé</option>
          </select>
        </label>
        <Field label="Mon objectif de coût par résultat (€)" className="ml-auto w-56">
          <input className="field tnum py-1.5" type="number" min={0.5} step={0.5} value={target} onChange={(e) => setTarget(Math.max(0, Number(e.target.value)))} />
        </Field>
      </div>

      {rows.length === 0 && (
        <Card>
          <Empty title="Aucune campagne ici">Change le filtre ou la période.</Empty>
        </Card>
      )}

      <div className="space-y-3">
        {rows.map(({ c, s }) => {
          const warn = alerts(c);
          const tips = advice(c, target);
          const isOpen = open === c.id;
          return (
            <section key={c.id} className="glass rounded-[22px]">
              <button className="flex w-full items-center gap-4 p-4 text-left sm:p-5" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
                {s === null ? (
                  <div className="grid size-14 shrink-0 place-items-center rounded-full bg-bg-2 text-[12px] text-ink-3">-</div>
                ) : (
                  <Ring value={s / 100} color={scoreTone(s)} size={56}>
                    {s}
                  </Ring>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[16px] font-semibold">{c.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3">
                    <Badge tone={c.status === "ACTIVE" ? "mint" : "neutral"}>{c.status === "ACTIVE" ? "Active" : "En pause"}</Badge>
                    <Badge>{objectiveLabel(c.objective)}</Badge>
                    {s !== null && <span style={{ color: scoreTone(s) }} className="font-semibold">{scoreLabel(s)}</span>}
                    {warn.length > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-honey">
                        <AlertTriangle className="size-3.5" /> {warn.length} alerte{warn.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </p>
                </div>
                <div className="hidden grid-cols-3 gap-6 text-right md:grid">
                  <Metric label="Dépensé" value={eur(c.spend)} />
                  <Metric label="Résultats" value={num(c.results)} />
                  <Metric label="Coût / résultat" value={eur(c.costPerResult, true)} />
                </div>
                <ChevronDown className={cx("size-5 shrink-0 text-ink-3 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
              {isOpen && (
                <div className="rise border-t border-line px-4 pt-4 pb-5 sm:px-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
                    <Metric label="Dépensé" value={eur(c.spend)} />
                    <Metric label="Affichages" value={compact(c.impressions)} />
                    <Metric label="Personnes touchées" value={compact(c.reach)} />
                    <Metric label="Fréquence" value={c.frequency.toFixed(1).replace(".", ",")} sub="vues par personne" />
                    <Metric label="Clics" value={num(c.clicks)} sub={`CTR ${pct(c.ctr, 2)}`} />
                    <Metric label="Coût par clic" value={eur(c.cpc, true)} />
                    <Metric label="CPM" value={eur(c.cpm, true)} />
                    <Metric label="Coût / résultat" value={eur(c.costPerResult, true)} sub={c.costPerResult && c.costPerResult <= target ? "dans l'objectif" : "au-dessus de l'objectif"} />
                  </div>
                  {(warn.length > 0 || tips.length > 0) && (
                    <div className="mt-5 grid gap-3 lg:grid-cols-2">
                      {warn.map((w) => (
                        <div key={w.text} className={cx("rounded-2xl border p-3 text-[13.5px]", w.level === "danger" ? "border-coral/30 bg-coral-soft" : "border-honey/30 bg-honey-soft")}>
                          <p className={cx("flex items-start gap-2 font-semibold", w.level === "danger" ? "text-coral" : "text-honey")}>
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            {w.text}
                          </p>
                          <p className="mt-1 pl-6 text-ink-2">{w.fix}</p>
                        </div>
                      ))}
                      {tips.map((t) => (
                        <div key={t} className="flex items-start gap-2 rounded-2xl border border-violet/25 bg-violet-soft p-3 text-[13.5px] text-ink">
                          <Lightbulb className="mt-0.5 size-4 shrink-0 text-violet" />
                          {t}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
      <p className="text-[12.5px] text-ink-3">Le score sur 100 est indicatif : il combine le taux de clic, la fréquence, la présence de résultats et le coût par résultat comparé à la moyenne de ton compte.</p>
    </div>
  );
}
