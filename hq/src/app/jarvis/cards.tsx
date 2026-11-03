"use client";
import { AlertTriangle, ArrowUpRight, Aperture, Brain, CalendarClock, CloudSun, HeartPulse, Inbox, ListChecks, Megaphone, Newspaper, Radar, TrendingUp, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkline } from "@/components/charts";
import { Ring, cx } from "@/components/ui";
import { compact, dateTime, eur, num, pct, relative } from "@/lib/format";
import type { Snapshot } from "@/lib/jarvis";
import type { CardKind } from "./intents";

function Shell({ icon, title, href, children, tag }: { icon: ReactNode; title: string; href?: string; children: ReactNode; tag?: ReactNode }) {
  return (
    <section className="jv-card rise">
      <header className="mb-3 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-[rgb(139_112_255/0.18)] text-[#b9a8ff] [&_svg]:size-3.5">{icon}</span>
        <h3 className="flex-1 truncate text-[13.5px] font-semibold text-white/90">{title}</h3>
        {tag}
        {href && (
          <Link href={href} className="rounded-md p-1 text-white/45 transition-colors hover:bg-white/10 hover:text-white" aria-label={`Ouvrir ${title}`}>
            <ArrowUpRight className="size-4" />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

const Demo = ({ show }: { show?: boolean }) => (show ? <span className="rounded-full bg-[rgb(243_190_114/0.15)] px-2 py-0.5 text-[11px] font-semibold text-[#f3be72]">exemple</span> : null);

function Big({ value, sub }: { value: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <p className="font-display tnum text-[30px] leading-none font-bold text-white">{value}</p>
      {sub && <p className="mt-1.5 text-[12.5px] text-white/55">{sub}</p>}
    </div>
  );
}

function Rows({ items, empty }: { items: { key: string; main: ReactNode; sub?: ReactNode; href?: string; external?: boolean }[]; empty: string }) {
  if (!items.length) return <p className="text-[13px] text-white/50">{empty}</p>;
  return (
    <ul className="space-y-1">
      {items.map((i) => {
        const body = (
          <>
            <p className="line-clamp-2 text-[13px] text-white/90">{i.main}</p>
            {i.sub && <p className="truncate text-[11.5px] text-white/45">{i.sub}</p>}
          </>
        );
        return (
          <li key={i.key}>
            {i.href ? (
              <a href={i.href} target={i.external ? "_blank" : undefined} rel={i.external ? "noreferrer" : undefined} className="block rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.06]">
                {body}
              </a>
            ) : (
              <div className="px-2 py-1.5">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Card({ kind, s, onForget }: { kind: CardKind; s: Snapshot; onForget: (id: string) => void }) {
  const t = s.today;
  switch (kind) {
    case "sales": {
      const ratio = t.goal.target ? t.goal.revenue / t.goal.target : 0;
      return (
        <Shell icon={<TrendingUp />} title="Ventes" href="/ventes" tag={<Demo show={t.sales?.demo} />}>
          <div className="flex items-center gap-4">
            <Ring value={ratio} size={64} stroke={6} color="#f3be72">
              <span className="text-white">{Math.round(ratio * 100)} %</span>
            </Ring>
            <Big value={eur(t.goal.revenue)} sub={`sur ${eur(t.goal.target)}, projection ${eur(t.goal.projection)}`} />
          </div>
          {t.sales && t.sales.series.length > 1 && (
            <div className="mt-3">
              <Sparkline data={t.sales.series} dataKey="total" color="#f3be72" height={40} />
            </div>
          )}
          <p className="mt-2 text-[12.5px] text-white/55">Hier : {eur(t.sales?.yesterday ?? 0)}. MRR : {t.sales?.mrr != null ? eur(t.sales.mrr) : "-"}.</p>
        </Shell>
      );
    }
    case "mails":
      return (
        <Shell icon={<Inbox />} title={`Mails urgents (${t.mails?.urgentCount ?? 0})`} href="/mails" tag={<Demo show={t.mails?.demo} />}>
          <Rows items={(t.mails?.urgent ?? []).map((m) => ({ key: m.id, main: m.subject, sub: `${m.from.name || m.from.email}, ${relative(m.date)}`, href: "/mails" }))} empty="Aucun mail urgent." />
        </Shell>
      );
    case "tasks":
      return (
        <Shell icon={<ListChecks />} title="Tâches" href="/taches">
          <Rows
            items={t.tasks.map((x) => ({
              key: x.id,
              main: (
                <span className="flex items-center gap-2">
                  {x.priority === "haute" && <span className="rounded bg-[rgb(255_138_110/0.18)] px-1.5 text-[10.5px] font-bold text-[#ff8a6e]">PRIORITÉ</span>}
                  {x.title}
                </span>
              ),
              sub: x.due ? `pour le ${new Date(x.due).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : undefined,
            }))}
            empty="Aucune tâche ouverte."
          />
        </Shell>
      );
    case "weather": {
      const w = s.weather;
      return (
        <Shell icon={<CloudSun />} title={w ? `Météo, ${w.city}` : "Météo"}>
          {w ? (
            <div className="flex items-end justify-between gap-4">
              <Big value={`${w.temp}°`} sub={`${w.label}, ressenti ${w.feels}°`} />
              <div className="text-right text-[12.5px] text-white/60">
                <p>
                  Aujourd&apos;hui {w.today.min}° / {w.today.max}°
                </p>
                <p>Pluie {w.today.rain} %</p>
                <p className="mt-1 text-white/45">
                  Demain {w.tomorrow.min}° / {w.tomorrow.max}°, {w.tomorrow.label}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-white/50">Météo injoignable pour l&apos;instant. Vérifie la ville dans les réglages de Jarvis.</p>
          )}
        </Shell>
      );
    }
    case "news":
      return (
        <Shell icon={<Newspaper />} title="Actualités">
          <Rows items={s.news.slice(0, 7).map((h) => ({ key: h.link, main: h.title, sub: `${h.source}, ${relative(h.date)}`, href: h.link, external: true }))} empty="Actualités indisponibles pour l'instant." />
        </Shell>
      );
    case "ads": {
      const a = s.ads;
      return (
        <Shell icon={<Megaphone />} title="Meta Ads, 7 jours" href="/ads" tag={<Demo show={a ? !a.live : false} />}>
          {a ? (
            <div className="grid grid-cols-3 gap-3">
              <Big value={eur(a.spend)} sub="dépensés" />
              <Big value={num(a.results)} sub="résultats" />
              <Big value={eur(a.cpr, true)} sub="par résultat" />
            </div>
          ) : (
            <p className="text-[13px] text-white/50">Pas de données de pub.</p>
          )}
          {a?.best && <p className="mt-3 text-[12.5px] text-white/55">La plus rentable : {a.best}</p>}
        </Shell>
      );
    }
    case "instagram": {
      const i = t.instagram;
      return (
        <Shell icon={<Aperture />} title="Instagram" href="/instagram" tag={<Demo show={i?.demo} />}>
          {i ? (
            <div className="grid grid-cols-2 gap-3">
              <Big value={compact(i.followers)} sub={`${i.gained7 >= 0 ? "+" : ""}${i.gained7} en 7 jours`} />
              <Big value={pct(i.engagement, 1)} sub="engagement" />
            </div>
          ) : (
            <p className="text-[13px] text-white/50">Instagram n&apos;est pas branché.</p>
          )}
        </Shell>
      );
    }
    case "health": {
      const h = t.health;
      return (
        <Shell icon={<HeartPulse />} title="Santé de l'app" href="/sante">
          {h ? (
            <div className="flex items-start gap-4">
              <Ring value={h.score / 100} size={60} stroke={6} color={h.score >= 80 ? "#4cd4a6" : h.score >= 50 ? "#f3be72" : "#ff8a6e"}>
                <span className="text-white">{h.score}</span>
              </Ring>
              <ul className="min-w-0 flex-1 space-y-1 text-[12.5px]">
                {h.problems.length ? (
                  h.problems.map((p) => (
                    <li key={p.checkId} className={cx("flex gap-1.5", p.severity === "panne" ? "text-[#ff8a6e]" : "text-[#f3be72]")}>
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[#4cd4a6]">Aucun problème détecté.</li>
                )}
                <li className="text-white/45">Testé {relative(h.at)}</li>
              </ul>
            </div>
          ) : (
            <p className="text-[13px] text-white/50">Pas encore de test aujourd&apos;hui.</p>
          )}
        </Shell>
      );
    }
    case "prospects":
      return (
        <Shell icon={<Radar />} title="Prospection" href="/prospection">
          <p className="mb-2 text-[12.5px] text-white/55">
            {t.prospects.toApprove} à valider, {t.prospects.sentToday}/{t.prospects.dailyLimit} envoyés aujourd&apos;hui
          </p>
          <Rows items={t.prospects.replied.map((p) => ({ key: p.id, main: `${p.name} a répondu`, sub: p.city, href: "/prospection" }))} empty="Aucune réponse à traiter." />
        </Shell>
      );
    case "agenda":
      return (
        <Shell icon={<CalendarClock />} title="Posts de la semaine" href="/instagram?tab=planning">
          <Rows items={t.posts.map((p) => ({ key: p.id, main: p.caption.split("\n")[0] || "Sans légende", sub: p.scheduledAt ? dateTime(p.scheduledAt) : undefined }))} empty="Aucun post programmé." />
        </Shell>
      );
    case "memory":
      return (
        <Shell icon={<Brain />} title={`Mémoire (${s.memory.length})`}>
          {s.memory.length ? (
            <ul className="space-y-1">
              {s.memory.slice(0, 8).map((m) => (
                <li key={m.id} className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.06]">
                  <span className="flex-1 text-[13px] text-white/85">{m.text}</span>
                  <button onClick={() => onForget(m.id)} className="rounded p-0.5 text-white/35 opacity-0 transition-opacity group-hover:opacity-100 hover:text-white focus-visible:opacity-100" aria-label="Oublier">
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-white/50">Rien de retenu. Dis « souviens-toi que… ».</p>
          )}
        </Shell>
      );
  }
}

/** Cartes à afficher pour une demande traitée par Claude, d'après ses mots-clés. */
export function cardsFor(text: string): CardKind[] {
  const n = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const out: CardKind[] = [];
  const rules: [RegExp, CardKind][] = [
    [/vent|chiffre|revenu|mrr|objectif|argent/, "sales"],
    [/mail|message|repon/, "mails"],
    [/tache|priorit|faire/, "tasks"],
    [/pub|ads|campagne|meta/, "ads"],
    [/insta|abonne|post|reel/, "instagram"],
    [/sante|bug|panne|app/, "health"],
    [/prospect|harvey|client/, "prospects"],
    [/actu|news|info/, "news"],
    [/meteo|temps|pluie/, "weather"],
  ];
  for (const [re, k] of rules) if (re.test(n) && !out.includes(k)) out.push(k);
  return out.slice(0, 3);
}
