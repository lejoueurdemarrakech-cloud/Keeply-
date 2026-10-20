"use client";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReactNode } from "react";
import { compact, dateShort, eur, num } from "@/lib/format";
import { cx } from "@/components/ui";

/** Couleur fixe par source : la couleur suit l'entité, jamais son rang. */
export const SOURCE_COLORS: Record<string, string> = {
  appstore: "var(--chart-1)",
  stripe: "var(--chart-2)",
  manual: "var(--chart-3)",
  googleplay: "var(--chart-4)",
  revenuecat: "var(--chart-5)",
};
export const sourceColor = (s: string, i = 0) => SOURCE_COLORS[s] ?? `var(--chart-${(i % 5) + 1})`;

function TooltipBox({ title, rows }: { title: string; rows: { label: string; value: string; color?: string }[] }) {
  return (
    <div className="min-w-40 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] shadow-xl">
      <p className="mb-1 font-semibold text-ink">{title}</p>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between gap-4 text-ink-2">
          <span className="flex items-center gap-1.5">
            {r.color && <span className="size-2 rounded-full" style={{ background: r.color }} />}
            {r.label}
          </span>
          <span className="tnum font-semibold text-ink">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

const axis = { tickLine: false, axisLine: false, tick: { fontSize: 12 } } as const;

export function Legend({ items }: { items: { label: string; color: string; value?: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: i.color }} />
          {i.label}
          {i.value && <span className="tnum font-semibold text-ink">{i.value}</span>}
        </span>
      ))}
    </div>
  );
}

/** Revenus par jour, empilés par source. */
export function RevenueBars({ data, sources, labels, height = 260 }: { data: Record<string, number | string>[]; sources: string[]; labels: Record<string, string>; height?: number }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} strokeDasharray="0" />
          <XAxis dataKey="date" {...axis} tickFormatter={dateShort} minTickGap={24} />
          <YAxis {...axis} width={52} tickFormatter={(v) => compact(v) + " €"} />
          <Tooltip
            cursor={{ className: "recharts-tooltip-cursor" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <TooltipBox
                  title={dateShort(String(label))}
                  rows={[
                    ...payload.filter((p) => Number(p.value)).map((p) => ({ label: labels[String(p.dataKey)] ?? String(p.dataKey), value: eur(Number(p.value), true), color: String(p.color) })),
                    { label: "Total", value: eur(payload.reduce((s, p) => s + Number(p.value || 0), 0), true) },
                  ]}
                />
              ) : null
            }
          />
          {sources.map((s, i) => (
            <Bar key={s} dataKey={s} stackId="a" fill={sourceColor(s, i)} stroke="var(--surface)" strokeWidth={1} radius={i === sources.length - 1 ? [4, 4, 0, 0] : 0} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendLine({ data, dataKey, height = 220, color = "var(--chart-1)", format = num, label }: { data: Record<string, number | string>[]; dataKey: string; height?: number; color?: string; format?: (n: number) => string; label: string }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`g-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" {...axis} tickFormatter={dateShort} minTickGap={28} />
          <YAxis {...axis} width={52} tickFormatter={(v) => compact(v)} domain={["auto", "auto"]} />
          <Tooltip content={({ active, payload, label: l }) => (active && payload?.length ? <TooltipBox title={dateShort(String(l))} rows={[{ label, value: format(Number(payload[0].value)), color }]} /> : null)} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#g-${dataKey})`} isAnimationActive={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SimpleBars({ data, dataKey, height = 200, color = "var(--chart-1)", format = num, label }: { data: Record<string, number | string>[]; dataKey: string; height?: number; color?: string; format?: (n: number) => string; label: string }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barCategoryGap="25%">
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" {...axis} tickFormatter={dateShort} minTickGap={24} />
          <YAxis {...axis} width={52} tickFormatter={(v) => compact(v)} />
          <Tooltip cursor={{ className: "recharts-tooltip-cursor" }} content={({ active, payload, label: l }) => (active && payload?.length ? <TooltipBox title={dateShort(String(l))} rows={[{ label, value: format(Number(payload[0].value)), color }]} /> : null)} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, dataKey, color = "var(--violet)", height = 44 }: { data: Record<string, number | string>[]; dataKey: string; color?: string; height?: number }) {
  return (
    <div style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Classement horizontal en HTML (pays, produits…). */
export function RankBars({ rows, format = eur, color = "var(--chart-1)" }: { rows: { label: ReactNode; value: number; sub?: string }[]; format?: (n: number) => string; color?: string }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
  return (
    <ul className="space-y-2.5">
      {rows.map((r, i) => (
        <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-[13.5px]">
          <span className="truncate text-ink-2">{r.label}</span>
          <span className="tnum text-right font-semibold">
            {format(r.value)}
            {r.sub && <span className="ml-1.5 font-normal text-ink-3">{r.sub}</span>}
          </span>
          <span className="col-span-2 h-1.5 overflow-hidden rounded-full bg-bg-2">
            <span className="block h-full rounded-full" style={{ width: `${(Math.abs(r.value) / max) * 100}%`, background: color }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Carte de chaleur jour × heure (meilleurs créneaux de publication). */
export function Heatmap({ grid }: { grid: (number | null)[][] }) {
  const max = Math.max(0.0001, ...grid.flat().filter((v): v is number => v != null));
  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 h → 23 h
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-separate border-spacing-[3px] text-[11px] text-ink-3">
        <thead>
          <tr>
            <th />
            {hours.map((h) => (
              <th key={h} className="font-normal">
                {h % 3 === 0 ? `${h}h` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, d) => (
            <tr key={d}>
              <th className="pr-1 text-left font-semibold">{DAYS[d]}</th>
              {hours.map((h) => {
                const v = row[h];
                return (
                  <td
                    key={h}
                    title={v == null ? `${DAYS[d]} ${h}h : pas de post` : `${DAYS[d]} ${h}h : engagement ${v.toFixed(1)} %`}
                    className={cx("h-6 rounded-[5px]", v == null && "bg-bg-2")}
                    style={v == null ? undefined : { background: `color-mix(in srgb, var(--violet) ${Math.round(18 + (v / max) * 82)}%, var(--surface))` }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-[12px] text-ink-3">Plus la case est foncée, plus les posts publiés à ce moment ont été engageants. Les cases grises : aucun post.</p>
    </div>
  );
}
