"use client";
import { AlertTriangle, Megaphone, Sparkles } from "lucide-react";
import { useState } from "react";
import { SimpleBars } from "@/components/charts";
import { Badge, Button, Card, CopyButton, DemoBadge, ErrorNote, Field, Segmented, Skeleton, Stat } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { compact, eur, num, pct } from "@/lib/format";

interface Campaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  results: number;
  costPerResult: number;
  frequency: number;
  revenue: number;
}
interface Ads {
  live: boolean;
  error?: string;
  campaigns: Campaign[];
  daily: { date: string; spend: number; clicks: number; results: number }[];
}
type AdCopy = { primary: string; headline: string; description: string; cta: string; visual: string };

function alerts(c: Campaign) {
  const out: string[] = [];
  if (c.frequency > 3) out.push(`Fréquence ${c.frequency.toFixed(1)} : le public voit trop souvent la pub, change le visuel ou élargis l'audience.`);
  if (c.ctr < 0.008 && c.impressions > 2000) out.push(`Taux de clic faible (${pct(c.ctr)}) : l'accroche ou le visuel n'arrête pas le pouce.`);
  if (c.results === 0 && c.spend > 30) out.push(`${eur(c.spend)} dépensés sans résultat : vérifie le suivi des conversions ou coupe la campagne.`);
  return out;
}

export function AdsPanel() {
  const [days, setDays] = useState<"7" | "14" | "30" | "90">("30");
  const { data, isLoading } = useApi<Ads>(`/api/ads?days=${days}`);
  const [form, setForm] = useState({ objective: "Installations de l'app par des gérants de café", audience: "Gérants de cafés et restaurants indépendants, France, 25-55 ans", angle: "" });
  const [copies, setCopies] = useState<AdCopy[]>([]);
  const [busy, setBusy] = useState(false);

  const t = (data?.campaigns ?? []).reduce(
    (s, c) => ({ spend: s.spend + c.spend, results: s.results + c.results, clicks: s.clicks + c.clicks, impressions: s.impressions + c.impressions, revenue: s.revenue + c.revenue }),
    { spend: 0, results: 0, clicks: 0, impressions: 0, revenue: 0 },
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7 j" }, { value: "14", label: "14 j" }, { value: "30", label: "30 j" }, { value: "90", label: "90 j" }]} />
        <DemoBadge show={!!data && !data.live} />
      </div>
      {data?.error && <ErrorNote>Meta Ads : {data.error}</ErrorNote>}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {data ? (
          <>
            <Stat label="Dépensé" value={eur(t.spend)} tone="coral" />
            <Stat label="Résultats" value={num(t.results)} hint="installations, prospects…" tone="violet" />
            <Stat label="Coût par résultat" value={eur(t.results ? t.spend / t.results : 0, true)} />
            <Stat label="Taux de clic" value={pct(t.impressions ? t.clicks / t.impressions : 0, 2)} hint={`CPM ${eur(t.impressions ? (t.spend / t.impressions) * 1000 : 0, true)}`} />
            <Stat label="Retour sur dépense" value={t.spend && t.revenue ? `${(t.revenue / t.spend).toFixed(2).replace(".", ",")}×` : "—"} hint={t.revenue ? `${eur(t.revenue)} attribués` : "pas de valeur suivie"} tone="mint" />
          </>
        ) : (
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[112px] rounded-2xl" />)
        )}
      </div>

      <Card title="Dépense par jour">{data ? <SimpleBars data={data.daily} dataKey="spend" label="Dépense" format={(n) => eur(n, true)} color="var(--chart-5)" height={220} /> : <Skeleton className="h-[220px]" />}</Card>

      <Card title="Campagnes" pad={false}>
        {isLoading && !data ? (
          <Skeleton className="m-5 h-32" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-[13.5px]">
              <thead className="text-left text-ink-3">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-semibold">Campagne</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Dépensé</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Impressions</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Clics</th>
                  <th className="px-3 py-2.5 text-right font-semibold">CTR</th>
                  <th className="px-3 py-2.5 text-right font-semibold">CPC</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Résultats</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Coût / résultat</th>
                </tr>
              </thead>
              <tbody className="tnum divide-y divide-line">
                {data?.campaigns.map((c) => {
                  const warn = alerts(c);
                  return (
                    <tr key={c.id} className="align-top hover:bg-surface-2">
                      <td className="max-w-[300px] px-5 py-2.5">
                        <p className="font-semibold">{c.name}</p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-3">
                          <Badge tone={c.status === "ACTIVE" ? "mint" : "neutral"}>{c.status === "ACTIVE" ? "Active" : "En pause"}</Badge>
                          {c.objective}
                        </p>
                        {warn.map((w) => (
                          <p key={w} className="mt-1.5 flex gap-1.5 text-[12.5px] text-honey">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                            {w}
                          </p>
                        ))}
                      </td>
                      <td className="px-3 py-2.5 text-right">{eur(c.spend)}</td>
                      <td className="px-3 py-2.5 text-right">{compact(c.impressions)}</td>
                      <td className="px-3 py-2.5 text-right">{num(c.clicks)}</td>
                      <td className="px-3 py-2.5 text-right">{pct(c.ctr, 2)}</td>
                      <td className="px-3 py-2.5 text-right">{eur(c.cpc, true)}</td>
                      <td className="px-3 py-2.5 text-right">{num(c.results)}</td>
                      <td className="px-5 py-2.5 text-right font-semibold">{eur(c.costPerResult, true)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Écrire des annonces" action={<Megaphone className="size-4 text-violet" />}>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Objectif">
            <input className="field" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </Field>
          <Field label="Audience">
            <input className="field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          </Field>
          <Field label="Angle (facultatif)">
            <input className="field" placeholder="ex. la carte papier perdue" value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} />
          </Field>
        </div>
        <Button
          className="mt-3"
          variant="primary"
          icon={<Sparkles className="size-4" />}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            const r = await api<{ ads: AdCopy[] }>("POST", "/api/ai", { tool: "adcopy", input: form });
            setBusy(false);
            if (r) setCopies(r.ads);
          }}
        >
          5 variantes d&apos;annonces
        </Button>
        {copies.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {copies.map((c, i) => (
              <div key={i} className="rounded-xl border border-line bg-surface-2 p-4 text-[13.5px]">
                <p className="whitespace-pre-line">{c.primary}</p>
                <p className="mt-3 font-display font-semibold">{c.headline}</p>
                <p className="text-ink-3">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone="violet">{c.cta}</Badge>
                  <CopyButton text={`${c.primary}\n\nTitre : ${c.headline}\nDescription : ${c.description}\nBouton : ${c.cta}`} />
                </div>
                <p className="mt-3 border-t border-line pt-2 text-[12.5px] text-ink-3">Visuel : {c.visual}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
