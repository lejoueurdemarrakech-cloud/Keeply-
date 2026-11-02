"use client";
import { AlertTriangle, Aperture, ArrowUpRight, CalendarClock, Calculator, Check, Clock, Megaphone, PenSquare, Share2, Target } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ComboChart, Legend, Sparkline } from "@/components/charts";
import { Badge, Card, DemoBadge, Empty, Field, PageHeader, Ring, Skeleton, cx } from "@/components/ui";
import { useApi, useNow } from "@/lib/client";
import { compact, dateTime, eur, num, pct } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import type { Post } from "@/lib/types";
import { alerts, totals, type Ads } from "../ads/shared";
import { DAY_NAMES, type IgOverview } from "../instagram/shared";

function Channel({ href, icon, name, sub, demo, children, spark }: { href: string; icon: ReactNode; name: string; sub: string; demo?: boolean; children: ReactNode; spark?: ReactNode }) {
  return (
    <Link href={href} className="glass group block min-w-0 rounded-[24px] p-4 sm:p-5 transition-transform duration-200 active:scale-[0.99]">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-violet text-white shadow-[0_8px_20px_-10px_var(--violet)] [&_svg]:size-5">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[18px] font-bold">{name}</p>
          <p className="truncate text-[13px] text-ink-3">{sub}</p>
        </div>
        {demo && <Badge tone="honey">exemple</Badge>}
        <ArrowUpRight className="size-5 text-ink-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{children}</div>
      {spark && <div className="mt-4">{spark}</div>}
    </Link>
  );
}

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "mint" | "coral" }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[12.5px] text-ink-3">{label}</p>
      <p className="font-display tnum truncate text-[19px] font-bold sm:text-[22px]">{value}</p>
      {hint && <p className={cx("truncate text-[12px]", tone === "mint" ? "text-mint" : tone === "coral" ? "text-coral" : "text-ink-3")}>{hint}</p>}
    </div>
  );
}

function Action({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="glass-soft flex items-center gap-3 rounded-2xl p-3 transition-colors hover:border-violet/40">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-soft text-violet [&_svg]:size-4">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[14px] font-semibold">{title}</span>
        <span className="block truncate text-[12.5px] text-ink-3">{text}</span>
      </span>
    </Link>
  );
}

export default function ReseauxPage() {
  const { data: o } = useApi<IgOverview>("/api/instagram/overview");
  const { data: posts } = useApi<Post[]>("/api/instagram/posts");
  const { data: ads } = useApi<Ads>("/api/ads?days=30");
  const now = useNow();
  const [goal, setGoal] = usePref<number>("ig-follower-goal", 5000);
  const [weekly] = usePref<number>("ig-weekly-goal", 4);

  const t = ads ? totals(ads.campaigns) : null;
  const adAlerts = ads ? ads.campaigns.flatMap((c) => alerts(c)) : [];
  const upcoming = (posts ?? []).filter((p) => p.status === "programme" && p.scheduledAt && new Date(p.scheduledAt).getTime() > now).sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));
  const thisWeek = upcoming.filter((p) => new Date(p.scheduledAt!).getTime() < now + 7 * 864e5).length;
  const reach30 = o ? o.growth.slice(-30).reduce((s, g) => s + g.reach, 0) : 0;

  // Rapprochement par date : dépense pub (barres) et portée Instagram (courbe).
  const reachBy = new Map((o?.growth ?? []).map((g) => [g.date, g.reach]));
  const combo = (ads?.daily ?? []).map((d) => ({ date: d.date, spend: d.spend, reach: reachBy.get(d.date) ?? 0 }));

  // Objectif d'abonnés : projection au rythme des 7 derniers jours.
  const followers = o?.account.followers ?? 0;
  const perDay = o ? o.analysis.followersGained7 / 7 : 0;
  const missing = Math.max(0, goal - followers);
  const daysToGoal = perDay > 0 ? Math.ceil(missing / perDay) : null;
  const goalDate = daysToGoal !== null ? new Date(now + daysToGoal * 864e5) : null;

  const best = o?.analysis.best[0];
  const checks = [
    { ok: thisWeek >= weekly, text: `${thisWeek} post${thisWeek > 1 ? "s" : ""} programmé${thisWeek > 1 ? "s" : ""} cette semaine (objectif ${weekly})`, href: "/instagram?tab=planning" },
    { ok: !!o && o.analysis.engagementRate >= 0.015, text: o ? `Engagement à ${pct(o.analysis.engagementRate, 2)}${o.analysis.engagementRate >= 0.035 ? ", très bon" : o.analysis.engagementRate >= 0.015 ? ", dans la moyenne" : ", à travailler"}` : "Engagement", href: "/instagram?tab=stats" },
    { ok: adAlerts.length === 0, text: adAlerts.length ? `${adAlerts.length} alerte${adAlerts.length > 1 ? "s" : ""} sur les campagnes pub` : "Aucune alerte sur les pubs", href: "/ads?tab=campagnes" },
    { ok: (o?.analysis.postsPerWeek ?? 0) >= 3, text: o ? `Rythme de ${o.analysis.postsPerWeek.toFixed(1).replace(".", ",")} posts par semaine` : "Rythme", href: "/instagram?tab=croissance" },
  ];

  return (
    <div>
      <PageHeader
        icon={<Share2 />}
        title="Réseaux"
        subtitle={
          <>
            Instagram et Meta Ads au même endroit : ce qui se passe, ce qui est prévu, ce qu&apos;il faut corriger. <DemoBadge show={(!!o && !o.live) || (!!ads && !ads.live)} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {o ? (
          <Channel
            href="/instagram"
            icon={<Aperture />}
            name="Instagram"
            sub={`@${o.account.username}`}
            demo={!o.live}
            spark={<Sparkline data={o.growth} dataKey="followers" height={48} />}
          >
            <Kpi label="Abonnés" value={num(followers)} hint={`${o.analysis.followersGained7 >= 0 ? "+" : ""}${num(o.analysis.followersGained7)} en 7 j`} tone={o.analysis.followersGained7 >= 0 ? "mint" : "coral"} />
            <Kpi label="Portée 30 j" value={compact(reach30)} hint="comptes touchés" />
            <Kpi label="Engagement" value={pct(o.analysis.engagementRate, 2)} hint="par post" />
          </Channel>
        ) : (
          <Skeleton className="h-[230px] rounded-[24px]" />
        )}
        {ads && t ? (
          <Channel
            href="/ads"
            icon={<Megaphone />}
            name="Meta Ads"
            sub={`${ads.campaigns.filter((c) => c.status === "ACTIVE").length} campagne(s) active(s), 30 derniers jours`}
            demo={!ads.live}
            spark={<Sparkline data={ads.daily} dataKey="spend" color="var(--chart-5)" height={48} />}
          >
            <Kpi label="Dépensé" value={eur(t.spend)} hint={`${num(t.results)} résultats`} />
            <Kpi label="Coût / résultat" value={eur(t.cpr, true)} hint={`CTR ${pct(t.ctr, 2)}`} />
            <Kpi label="Alertes" value={String(adAlerts.length)} hint={adAlerts.length ? "à regarder" : "tout va bien"} tone={adAlerts.length ? "coral" : "mint"} />
          </Channel>
        ) : (
          <Skeleton className="h-[230px] rounded-[24px]" />
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,5fr)_minmax(0,3fr)]">
        <Card title="Pub et portée Instagram, jour par jour" action={<Legend items={[{ label: "Dépense pub", color: "var(--chart-5)" }, { label: "Portée Instagram", color: "var(--chart-1)" }]} />}>
          {combo.length ? (
            <ComboChart data={combo} bar={{ key: "spend", label: "Dépense pub", color: "var(--chart-5)", format: (n) => eur(n, true) }} line={{ key: "reach", label: "Portée Instagram", color: "var(--chart-1)", format: num }} height={260} />
          ) : (
            <Skeleton className="h-[260px]" />
          )}
          <p className="mt-3 text-[12.5px] text-ink-3">Si la portée monte les jours où tu dépenses plus, la pub fait aussi connaître le compte.</p>
        </Card>

        <Card title="Objectif d'abonnés" action={<Target className="size-4 text-violet" />}>
          <div className="flex items-center gap-5">
            <Ring value={goal ? followers / goal : 0} size={92} stroke={9}>
              <span className="text-[15px]">{goal ? Math.min(100, Math.round((followers / goal) * 100)) : 0} %</span>
            </Ring>
            <div className="min-w-0">
              <p className="font-display tnum text-[22px] font-bold">
                {num(followers)} <span className="text-[15px] font-semibold text-ink-3">/ {num(goal)}</span>
              </p>
              <p className="mt-1 text-[13.5px] text-ink-2">
                {missing === 0
                  ? "Objectif atteint. Fixe le suivant."
                  : goalDate
                    ? `Au rythme actuel (${perDay.toFixed(1).replace(".", ",")} par jour), atteint vers le ${goalDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: goalDate.getFullYear() !== new Date(now).getFullYear() ? "numeric" : undefined })}.`
                    : "Pas de croissance sur 7 jours : impossible d'estimer une date."}
              </p>
            </div>
          </div>
          <Field label="Objectif" className="mt-5">
            <input className="field tnum" type="number" min={0} step={100} value={goal} onChange={(e) => setGoal(Math.max(0, Number(e.target.value)))} />
          </Field>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Point de la semaine">
          <ul className="space-y-1">
            {checks.map((c) => (
              <li key={c.text}>
                <Link href={c.href} className="flex items-start gap-3 rounded-xl px-2 py-2 text-[14px] hover:bg-bg-2">
                  <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full [&_svg]:size-3", c.ok ? "bg-mint text-white" : "bg-honey-soft text-honey")}>{c.ok ? <Check strokeWidth={3} /> : <AlertTriangle />}</span>
                  {c.text}
                </Link>
              </li>
            ))}
          </ul>
          {best && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-violet-soft px-3 py-2 text-[13px] text-violet">
              <Clock className="size-4 shrink-0" /> Meilleur créneau observé : le {DAY_NAMES[best.day]} vers {best.hour} h
            </p>
          )}
        </Card>

        <Card title="Prochains posts" action={<Link href="/instagram?tab=planning" className="text-[13px] font-semibold text-violet hover:underline">Planning</Link>}>
          {!posts ? (
            <Skeleton className="h-32" />
          ) : upcoming.length === 0 ? (
            <Empty icon={<CalendarClock className="size-5" />} title="Rien de programmé">Prépare au moins 3 posts pour la semaine.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {upcoming.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-3">
                  <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-bg-2">
                    { }
                    {p.media[0] && <img src={p.media[0]} alt="" className="size-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold">{p.caption.split("\n")[0] || "Sans légende"}</p>
                    <p className="text-[12.5px] text-ink-3">{dateTime(p.scheduledAt!)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Raccourcis">
          <div className="grid gap-2">
            <Action href="/instagram?tab=creer" icon={<PenSquare />} title="Nouveau post" text="Photo, carrousel, Reel ou story" />
            <Action href="/ads?tab=annonces" icon={<Megaphone />} title="Écrire une annonce" text="5 variantes rédigées par l'IA" />
            <Action href="/ads?tab=simulateur" icon={<Calculator />} title="Simuler un budget" text="Combien d'abonnés pour X € par jour" />
            <Action href="/instagram?tab=croissance" icon={<CalendarClock />} title="Préparer ma semaine" text="Planning de la semaine par l'IA" />
          </div>
        </Card>
      </div>
    </div>
  );
}
