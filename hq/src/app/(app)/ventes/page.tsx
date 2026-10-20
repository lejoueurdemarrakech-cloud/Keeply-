"use client";
import { BarChart3, FileUp, Rows3, Webhook } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Legend, RankBars, RevenueBars, sourceColor } from "@/components/charts";
import { Badge, Button, Card, CopyButton, DemoBadge, ErrorNote, Field, Modal, PageHeader, Segmented, Skeleton, Stat, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { countryName, dateShort, eur, flag, isoDay, num, pct } from "@/lib/format";
import type { SalesSummary } from "@/lib/types";

type Range = "7" | "30" | "90" | "365" | "mois" | "perso";

function rangeDates(r: Range, custom: { from: string; to: string }) {
  const today = new Date();
  if (r === "perso") return custom;
  if (r === "mois") return { from: isoDay(new Date(today.getFullYear(), today.getMonth(), 1)), to: isoDay(today) };
  return { from: isoDay(new Date(Date.now() - (Number(r) - 1) * 864e5)), to: isoDay(today) };
}

const KIND: Record<string, string> = { achat: "Achat", abonnement: "Nouvel abonnement", renouvellement: "Renouvellement", remboursement: "Remboursement", telechargement: "Téléchargement" };

export default function SalesPage() {
  const [range, setRange] = useState<Range>("30");
  const [custom, setCustom] = useState(() => ({ from: isoDay(new Date(Date.now() - 59 * 864e5)), to: isoDay(new Date()) }));
  const [view, setView] = useState<"chart" | "table">("chart");
  const [importOpen, setImportOpen] = useState(false);
  const { from, to } = rangeDates(range, custom);
  const { data, error, isLoading, mutate } = useApi<SalesSummary>(`/api/sales?from=${from}&to=${to}`);

  const sources = useMemo(() => {
    if (!data) return [];
    const keys = new Set<string>();
    data.series.forEach((r) => Object.keys(r).forEach((k) => !["date", "total", "downloads"].includes(k) && keys.add(k)));
    return [...keys];
  }, [data]);
  const labels = Object.fromEntries((data?.bySource ?? []).map((s) => [s.source, s.label]));
  const demo = !!data && data.sources.every((s) => s.state === "demo" || s.state === "off");
  const span = data?.series.length ?? 30;

  return (
    <div>
      <PageHeader
        title="Ventes"
        subtitle={
          <>
            Tous tes revenus nets (après commission des stores), convertis en euros. <DemoBadge show={demo} />
          </>
        }
        actions={
          <>
            <Button icon={<FileUp className="size-4" />} onClick={() => setImportOpen(true)}>
              Importer / autre plateforme
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: "7", label: "7 j" },
            { value: "30", label: "30 j" },
            { value: "90", label: "90 j" },
            { value: "365", label: "12 mois" },
            { value: "mois", label: "Ce mois" },
            { value: "perso", label: "Dates" },
          ]}
        />
        {range === "perso" && (
          <div className="flex items-center gap-2">
            <input type="date" className="field h-9 w-auto py-1" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} aria-label="Du" />
            <span className="text-ink-3">→</span>
            <input type="date" className="field h-9 w-auto py-1" value={custom.to} min={custom.from} onChange={(e) => setCustom({ ...custom, to: e.target.value })} aria-label="Au" />
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {data?.sources.map((s) => (
            <span key={s.id} title={s.message} className="inline-flex">
              <Badge tone={s.state === "live" ? "mint" : s.state === "error" ? "coral" : s.state === "demo" ? "honey" : "neutral"}>
                {s.label} · {s.state === "live" ? "connecté" : s.state === "error" ? "erreur" : s.state === "demo" ? "exemple" : "non connecté"}
              </Badge>
            </span>
          ))}
        </div>
      </div>

      {error && <ErrorNote>{error.message}</ErrorNote>}
      {data?.sources
        .filter((s) => s.state === "error")
        .map((s) => (
          <div key={s.id} className="mb-4">
            <ErrorNote>
              <strong>{s.label}</strong> : {s.message} <Link href="/connexions" className="underline">Vérifier la connexion</Link>
            </ErrorNote>
          </div>
        ))}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {data ? (
          <>
            <Stat label="Revenu net" value={eur(data.totals.revenue)} current={data.totals.revenue} prev={data.previous.revenue} hint="vs période d'avant" tone="violet" />
            <Stat label="Ventes" value={num(data.totals.orders)} current={data.totals.orders} prev={data.previous.orders} hint={`panier ${eur(data.totals.orders ? data.totals.revenue / data.totals.orders : 0, true)}`} />
            <Stat label="Téléchargements" value={num(data.totals.downloads)} current={data.totals.downloads} prev={data.previous.downloads} />
            <Stat label="Remboursements" value={eur(data.totals.refunds)} current={data.totals.refunds} prev={data.previous.refunds} invert hint={data.totals.revenue ? pct(data.totals.refunds / (data.totals.revenue + data.totals.refunds)) + " du brut" : undefined} />
            <Stat
              label="MRR"
              value={eur(data.subscriptions?.mrr)}
              hint={data.subscriptions ? `${data.subscriptions.active} abonnés · ${data.subscriptions.trials} essais` : "connecte Stripe ou RevenueCat"}
              tone="honey"
            />
          </>
        ) : (
          Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[112px] rounded-2xl" />)
        )}
      </div>

      <Card
        className="mt-5"
        title={`Revenu par jour · ${dateShort(from)} → ${dateShort(to)}`}
        action={
          <Segmented
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: "chart", label: <BarChart3 className="size-4" aria-label="Graphique" /> },
              { value: "table", label: <Rows3 className="size-4" aria-label="Tableau" /> },
            ]}
          />
        }
      >
        {isLoading && !data ? (
          <Skeleton className="h-[260px]" />
        ) : data && view === "chart" ? (
          <>
            <div className="mb-3">
              <Legend items={sources.map((s, i) => ({ label: labels[s] ?? s, color: sourceColor(s, i), value: eur(data.bySource.find((b) => b.source === s)?.revenue ?? 0) }))} />
            </div>
            <RevenueBars data={span > 120 ? aggregateWeekly(data.series, sources) : data.series} sources={sources} labels={labels} height={280} />
            {span > 120 && <p className="mt-2 text-[12.5px] text-ink-3">Sur une longue période, les barres regroupent les ventes par semaine.</p>}
          </>
        ) : data ? (
          <div className="max-h-[380px] overflow-auto">
            <table className="w-full text-[13.5px]">
              <thead className="sticky top-0 bg-surface text-left text-ink-3">
                <tr>
                  <th className="py-2 font-semibold">Jour</th>
                  {sources.map((s) => (
                    <th key={s} className="py-2 text-right font-semibold">
                      {labels[s] ?? s}
                    </th>
                  ))}
                  <th className="py-2 text-right font-semibold">Total</th>
                  <th className="py-2 text-right font-semibold">Téléch.</th>
                </tr>
              </thead>
              <tbody className="tnum divide-y divide-line">
                {[...data.series].reverse().map((r) => (
                  <tr key={String(r.date)}>
                    <td className="py-1.5">{dateShort(String(r.date))}</td>
                    {sources.map((s) => (
                      <td key={s} className="py-1.5 text-right">
                        {r[s] ? eur(Number(r[s]), true) : "—"}
                      </td>
                    ))}
                    <td className="py-1.5 text-right font-semibold">{eur(Number(r.total), true)}</td>
                    <td className="py-1.5 text-right text-ink-2">{num(Number(r.downloads))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Par plateforme">
          {data ? (
            <ul className="space-y-3">
              {data.bySource.map((s, i) => {
                const share = data.totals.revenue ? s.revenue / data.totals.revenue : 0;
                return (
                  <li key={s.source}>
                    <div className="flex items-center justify-between text-[14px]">
                      <span className="flex items-center gap-2">
                        <span className="size-2.5 rounded-[3px]" style={{ background: sourceColor(s.source, i) }} />
                        {s.label}
                      </span>
                      <span className="tnum font-semibold">{eur(s.revenue)}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-bg-2">
                      <div className="h-full rounded-full" style={{ width: `${share * 100}%`, background: sourceColor(s.source, i) }} />
                    </div>
                    <p className="mt-1 text-[12.5px] text-ink-3">
                      {pct(share, 0)} du total · {num(s.units)} ventes
                    </p>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Skeleton className="h-40" />
          )}
        </Card>
        <Card title="Par pays">{data ? <RankBars rows={data.byCountry.slice(0, 8).map((c) => ({ label: `${flag(c.country)} ${countryName(c.country)}`, value: c.revenue }))} /> : <Skeleton className="h-40" />}</Card>
        <Card title="Par produit">{data ? <RankBars rows={data.byProduct.slice(0, 8).map((p) => ({ label: p.product, value: p.revenue, sub: `${num(p.units)}×` }))} color="var(--chart-2)" /> : <Skeleton className="h-40" />}</Card>
      </div>

      <Card className="mt-5" title="Dernières ventes" pad={false}>
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[620px] text-[13.5px]">
            <thead className="sticky top-0 bg-surface text-left text-ink-3">
              <tr className="border-b border-line">
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 font-semibold">Plateforme</th>
                <th className="px-3 py-2.5 font-semibold">Produit</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Pays</th>
                <th className="px-5 py-2.5 text-right font-semibold">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.recent.map((r) => (
                <tr key={r.id} className="hover:bg-surface-2">
                  <td className="px-5 py-2 text-ink-2">{dateShort(r.date)}</td>
                  <td className="px-3 py-2">{labels[r.source] ?? r.source}</td>
                  <td className="max-w-[220px] truncate px-3 py-2">{r.product}</td>
                  <td className="px-3 py-2 text-ink-2">{KIND[r.kind] ?? r.kind}</td>
                  <td className="px-3 py-2">{r.country ? `${flag(r.country)} ${r.country}` : "—"}</td>
                  <td className={cx("tnum px-5 py-2 text-right font-semibold", r.amount < 0 && "text-coral")}>{eur(r.amount, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={() => mutate()} />
    </div>
  );
}

function aggregateWeekly(series: Record<string, number | string>[], sources: string[]) {
  const out: Record<string, number | string>[] = [];
  for (let i = 0; i < series.length; i += 7) {
    const chunk = series.slice(i, i + 7);
    const row: Record<string, number | string> = { date: String(chunk[0].date), total: 0 };
    for (const s of sources) row[s] = Math.round(chunk.reduce((sum, r) => sum + Number(r[s] ?? 0), 0) * 100) / 100;
    row.total = chunk.reduce((sum, r) => sum + Number(r.total ?? 0), 0);
    out.push(row);
  }
  return out;
}

function ImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [csv, setCsv] = useState("");
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: info, mutate } = useApi<{ count: number; bySource: Record<string, number> }>(open ? "/api/sales/import" : null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function submit() {
    setBusy(true);
    const res = await api<{ imported: number; skipped: number }>("POST", "/api/sales/import", { csv, source: source.trim() || "manual" });
    setBusy(false);
    if (res) {
      toast.success(`${res.imported} ventes importées${res.skipped ? `, ${res.skipped} lignes ignorées` : ""}`);
      setCsv("");
      mutate();
      onDone();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter des ventes d'une autre plateforme" wide>
      <div className="space-y-5">
        <div>
          <p className="font-display font-semibold">1. Importer un fichier CSV</p>
          <p className="mt-1 text-[13.5px] text-ink-2">
            Export de Lemon Squeezy, Paddle, Shopify, PayPal, SumUp… Il faut au moins une colonne <strong>date</strong> et une colonne <strong>montant</strong> (net, en euros). Colonnes reconnues en plus : produit, pays, quantité.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px]">
            <Field label="Fichier">
              <input
                type="file"
                accept=".csv,text/csv"
                className="field"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setCsv(await f.text());
                }}
              />
            </Field>
            <Field label="Nom de la plateforme">
              <input className="field" placeholder="ex. paddle" value={source} onChange={(e) => setSource(e.target.value)} />
            </Field>
          </div>
          <textarea className="field mt-3 h-32 font-mono text-[12.5px]" placeholder={"date,montant,produit,pays\n2026-10-01,29,Keeply Pro,FR"} value={csv} onChange={(e) => setCsv(e.target.value)} />
          <div className="mt-3 flex justify-end">
            <Button variant="primary" loading={busy} disabled={!csv.trim()} onClick={submit}>
              Importer
            </Button>
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <p className="flex items-center gap-2 font-display font-semibold">
            <Webhook className="size-4" /> 2. Envoi automatique (Zapier, Make, n8n…)
          </p>
          <p className="mt-1 text-[13.5px] text-ink-2">À chaque vente, envoie une requête POST avec l&apos;en-tête <code>Authorization: Bearer INGEST_TOKEN</code> :</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-bg-2 px-3 py-2 font-mono text-[12.5px]">
            <span className="flex-1 truncate">{origin}/api/ingest/sales</span>
            <CopyButton text={`${origin}/api/ingest/sales`} />
          </div>
          <pre className="mt-2 overflow-x-auto rounded-xl bg-bg-2 px-3 py-2 text-[12.5px]">{`{ "date": "2026-10-20", "amount": 29, "product": "Keeply Pro", "country": "FR", "source": "paddle" }`}</pre>
        </div>

        {info && info.count > 0 && (
          <div className="border-t border-line pt-5">
            <p className="font-display font-semibold">Ventes importées</p>
            <ul className="mt-2 space-y-1.5 text-[14px]">
              {Object.entries(info.bySource).map(([s, n]) => (
                <li key={s} className="flex items-center justify-between">
                  <span>
                    {s} · {num(n)} lignes
                  </span>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      if (!confirm(`Supprimer les ventes importées de « ${s} » ?`)) return;
                      await api("DELETE", `/api/sales/import?source=${encodeURIComponent(s)}`);
                      mutate();
                      onDone();
                    }}
                  >
                    Supprimer
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
