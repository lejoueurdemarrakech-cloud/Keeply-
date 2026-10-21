"use client";
import { Gauge, Laptop, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SimpleBars } from "@/components/charts";
import { Badge, Button, Card, Empty, Field, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateShort, dateTime, num, relative } from "@/lib/format";

interface Entry {
  id: string;
  at: string;
  label: string;
  model: string;
  source: "hq" | "harvey";
  ok: boolean;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
  durationMs: number;
}
interface Day {
  date: string;
  calls: number;
  costUsd: number;
  tokens: number;
  byLabel: Record<string, { calls: number; costUsd: number; tokens: number }>;
}
interface Data {
  today: Day;
  days: Day[];
  log: Entry[];
  quota: { at: string; fiveHour?: number | null; sevenDay?: number | null; resetsAt?: string | null } | null;
  budget: { dailyMax: number; roundHours: number[] };
  bridge: { at: string; host?: string; claude?: string; harvey?: { dashboard: boolean; running: boolean } } | null;
  online: boolean;
}

const usd = (n: number) => (n < 0.01 && n > 0 ? "< 0,01 $" : `${n.toFixed(2).replace(".", ",")} $`);
const tokensOf = (e: Entry) => e.inputTokens + e.outputTokens + e.cacheReadTokens + e.cacheCreationTokens;

const ROUND_INFO: { name: string; label: string; when: string }[] = [
  { name: "mails", label: "Mails : tri + réponses", when: "à chaque tournée" },
  { name: "brief", label: "Briefing du matin", when: "1re tournée du jour" },
  { name: "avis", label: "Avis App Store / Play", when: "1re tournée du jour" },
  { name: "instagram", label: "Semaine Instagram", when: "dimanche, dernière tournée" },
  { name: "ads", label: "Meta Ads", when: "lundi et jeudi, 1re tournée" },
];

function Meter({ label, value, hint }: { label: string; value: number | null | undefined; hint?: string }) {
  const v = value == null ? null : Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-ink-2">{label}</span>
        <span className="font-display tnum font-semibold">{v == null ? "—" : `${Math.round(v)} %`}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-2">
        <div className={cx("h-full rounded-full transition-[width] duration-500", v != null && v >= 85 ? "bg-coral" : v != null && v >= 60 ? "bg-honey" : "bg-violet")} style={{ width: `${v ?? 0}%` }} />
      </div>
      {hint && <p className="mt-1 text-[12px] text-ink-3">{hint}</p>}
    </div>
  );
}

export default function ClaudePage() {
  const { data, mutate, isLoading } = useApi<Data>("/api/usage", { refreshInterval: 60_000 });
  const { data: rounds, mutate: mutateRounds } = useApi<Record<string, { at: string; ms: number; error?: string } | null>>("/api/rounds");
  const [max, setMax] = useState<string | null>(null);
  const [hours, setHours] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Crédits Claude" />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  const t = data.today;
  const left = Math.max(0, data.budget.dailyMax - t.calls);
  const avgCost = t.calls ? t.costUsd / t.calls : 0;
  const labels = Object.entries(t.byLabel).sort((a, b) => b[1].calls - a[1].calls);
  const week = data.days.slice(0, 7);
  const weekCalls = week.reduce((s, d) => s + d.calls, 0);
  const weekByLabel: Record<string, { calls: number; costUsd: number; tokens: number }> = {};
  for (const d of week)
    for (const [k, v] of Object.entries(d.byLabel)) {
      const w = (weekByLabel[k] ??= { calls: 0, costUsd: 0, tokens: 0 });
      w.calls += v.calls;
      w.costUsd += v.costUsd;
      w.tokens += v.tokens;
    }
  const chart = [...data.days].reverse().map((d) => ({ day: dateShort(d.date), calls: d.calls }));

  async function saveBudget() {
    const body: Record<string, unknown> = {};
    if (max != null) body.dailyMax = Number(max);
    if (hours != null) body.roundHours = hours.split(/[,\s]+/).filter(Boolean).map(Number);
    if (await api("PUT", "/api/usage", body)) {
      toast.success("Réglages enregistrés");
      setMax(null);
      setHours(null);
      mutate();
    }
  }

  async function runNow(name: string) {
    setRunning(name);
    const r = await api<{ result: unknown }>("POST", "/api/rounds", { name });
    setRunning(null);
    if (r) toast.success("Tournée terminée");
    mutateRounds();
    mutate();
  }

  return (
    <div>
      <PageHeader
        title="Crédits Claude"
        subtitle="Tout ce que Claude fait pour HQ passe par ton abonnement, via le pont installé sur ton Mac. Ici tu vois chaque demande, ce qu'elle a consommé, et ce qu'il te reste."
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card title="Aujourd'hui">
          <p className="font-display tnum text-[34px] leading-none font-bold">
            {t.calls}
            <span className="text-[18px] text-ink-3"> / {data.budget.dailyMax}</span>
          </p>
          <p className="mt-1 text-[13px] text-ink-2">demandes à Claude · il en reste {left}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg-2">
            <div className={cx("h-full rounded-full", t.calls / Math.max(1, data.budget.dailyMax) >= 0.85 ? "bg-coral" : "bg-violet")} style={{ width: `${Math.min(100, (t.calls / Math.max(1, data.budget.dailyMax)) * 100)}%` }} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <dt className="text-ink-3">Volume traité</dt>
              <dd className="font-display tnum font-semibold">{num(t.tokens)} jetons</dd>
            </div>
            <div>
              <dt className="text-ink-3">Valeur équivalente API</dt>
              <dd className="font-display tnum font-semibold">{usd(t.costUsd)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[12px] text-ink-3">La « valeur API » est ce que ces demandes auraient coûté avec une clé payante. Avec l&apos;abonnement, tu ne paies rien de plus : elle sert à comparer les tâches entre elles.</p>
        </Card>

        <Card title="Ton abonnement">
          <div className="space-y-4">
            <Meter label="Fenêtre de 5 heures" value={data.quota?.fiveHour} />
            <Meter label="Semaine" value={data.quota?.sevenDay} hint={data.quota?.resetsAt ? `Remise à zéro ${relative(data.quota.resetsAt)}` : undefined} />
          </div>
          <p className="mt-4 text-[12px] text-ink-3">
            {data.quota ? `Lu sur ton Mac ${relative(data.quota.at)}. Comprend aussi ce que tu utilises toi-même dans Claude.` : "Le pont n'a pas encore pu lire le quota de ton abonnement."}
          </p>
        </Card>

        <Card title="Le pont sur ton Mac">
          <div className="flex items-center gap-3">
            <div className={cx("grid size-10 place-items-center rounded-xl", data.online ? "bg-mint-soft text-mint" : "bg-coral-soft text-coral")}>
              <Laptop className="size-5" />
            </div>
            <div>
              <p className="font-semibold">{data.online ? "En ligne" : "Hors ligne"}</p>
              <p className="text-[13px] text-ink-2">{data.bridge ? `Vu ${relative(data.bridge.at)}${data.bridge.host ? ` · ${data.bridge.host}` : ""}` : "Jamais connecté"}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-1.5 text-[13px] text-ink-2">
            <li>Claude : {data.bridge?.claude ?? "—"}</li>
            <li>Harvey : {data.bridge?.harvey ? (data.bridge.harvey.running ? "en marche" : data.bridge.harvey.dashboard ? "prêt, à l'arrêt" : "non lancé") : "—"}</li>
          </ul>
          {!data.online && <p className="mt-3 text-[12.5px] text-coral">Mac éteint ou en veille : les demandes à Claude attendront son retour.</p>}
        </Card>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Demandes par jour (14 jours)">
          {data.days.some((d) => d.calls) ? <SimpleBars data={chart} dataKey="calls" label="Demandes" height={210} /> : <Empty icon={<Gauge />} title="Encore aucune demande">Les tournées et tes clics sur les boutons IA apparaîtront ici.</Empty>}
          <p className="mt-2 text-[13px] text-ink-2">
            7 derniers jours : <strong className="tnum">{weekCalls}</strong> demandes · moyenne {(weekCalls / 7).toFixed(1).replace(".", ",")} par jour
            {avgCost ? ` · une demande vaut en moyenne ${usd(avgCost)} en équivalent API` : ""}
          </p>
        </Card>

        <Card title="Réglages d'économie">
          <div className="space-y-4">
            <Field label="Plafond de demandes par jour" hint="Au-delà, HQ attend le lendemain (Harvey a son propre plafond).">
              <input className="field tnum" inputMode="numeric" value={max ?? String(data.budget.dailyMax)} onChange={(e) => setMax(e.target.value)} />
            </Field>
            <Field label="Heures des tournées" hint="Ex. 8, 18. Claude lit les mails et prépare les réponses à ces heures-là seulement.">
              <input className="field tnum" value={hours ?? data.budget.roundHours.join(", ")} onChange={(e) => setHours(e.target.value)} />
            </Field>
            <Button variant="primary" disabled={max == null && hours == null} onClick={saveBudget}>
              Enregistrer
            </Button>
          </div>
        </Card>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <Card title="Ce qui consomme (7 jours)" pad={false}>
          {Object.keys(weekByLabel).length ? (
            <table className="w-full text-[13.5px]">
              <thead className="text-left text-[12px] text-ink-3">
                <tr>
                  <th className="px-5 py-2 font-semibold">Tâche</th>
                  <th className="px-3 py-2 text-right font-semibold">Demandes</th>
                  <th className="px-3 py-2 text-right font-semibold">Jetons</th>
                  <th className="px-5 py-2 text-right font-semibold">Valeur API</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(weekByLabel)
                  .sort((a, b) => b[1].tokens - a[1].tokens)
                  .map(([k, v]) => (
                    <tr key={k} className="border-t border-line">
                      <td className="px-5 py-2">{k}</td>
                      <td className="tnum px-3 py-2 text-right">{v.calls}</td>
                      <td className="tnum px-3 py-2 text-right">{num(v.tokens)}</td>
                      <td className="tnum px-5 py-2 text-right">{usd(v.costUsd)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="p-5 text-[14px] text-ink-2">Rien cette semaine.</p>
          )}
          {labels.length > 0 && <p className="border-t border-line px-5 py-3 text-[12.5px] text-ink-3">Aujourd&apos;hui : {labels.map(([k, v]) => `${k} (${v.calls})`).join(" · ")}</p>}
        </Card>

        <Card title="Tournées automatiques">
          <ul className="divide-y divide-line">
            {ROUND_INFO.map((r) => {
              const last = rounds?.[r.name];
              return (
                <li key={r.name} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold">{r.label}</p>
                    <p className="text-[12.5px] text-ink-3">
                      {r.when}
                      {last ? ` · dernière ${relative(last.at)}${last.error ? " (erreur)" : ""}` : " · jamais lancée"}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" icon={<Play className="size-3.5" />} loading={running === r.name} disabled={!data.online} onClick={() => runNow(r.name)}>
                    Lancer
                  </Button>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 text-[12px] text-ink-3">Publier un post programmé, tester la santé de l&apos;app ou envoyer les relances ne consomme rien : HQ le fait sans Claude.</p>
        </Card>
      </div>

      <Card title="Chaque demande" pad={false}>
        {data.log.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead className="text-left text-[12px] text-ink-3">
                <tr>
                  <th className="px-5 py-2 font-semibold">Quand</th>
                  <th className="px-3 py-2 font-semibold">Tâche</th>
                  <th className="px-3 py-2 font-semibold">Modèle</th>
                  <th className="px-3 py-2 text-right font-semibold">Jetons</th>
                  <th className="px-3 py-2 text-right font-semibold">Durée</th>
                  <th className="px-5 py-2 text-right font-semibold">Valeur API</th>
                </tr>
              </thead>
              <tbody>
                {data.log.slice(0, 100).map((e) => (
                  <tr key={e.id} className="border-t border-line">
                    <td className="px-5 py-2 whitespace-nowrap text-ink-2">{dateTime(e.at)}</td>
                    <td className="px-3 py-2">
                      {e.label} {!e.ok && <Badge tone="coral">échec</Badge>}
                    </td>
                    <td className="px-3 py-2 text-ink-2">{e.model}</td>
                    <td className="tnum px-3 py-2 text-right">{num(tokensOf(e))}</td>
                    <td className="tnum px-3 py-2 text-right text-ink-2">{e.durationMs ? `${Math.round(e.durationMs / 1000)} s` : "—"}</td>
                    <td className="tnum px-5 py-2 text-right">{usd(e.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={<Gauge />} title="Aucune demande pour l'instant" />
        )}
      </Card>
    </div>
  );
}
