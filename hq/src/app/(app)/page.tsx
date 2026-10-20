"use client";
import { AlertTriangle, CalendarClock, Check, HeartPulse, Inbox, MessageCircleReply, RefreshCw, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Sparkline } from "@/components/charts";
import { Badge, Button, Card, DemoBadge, Empty, Markdown, Skeleton, Stat, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateLong, dateTime, eur, num, pct, relative } from "@/lib/format";
import type { HealthResult, MailItem, Post, Prospect, Review, Task } from "@/lib/types";

interface Today {
  ownerName: string;
  goal: { target: number; revenue: number; projection: number; daysLeft: number; daysInMonth: number; dayOfMonth: number };
  sales: { today: number; yesterday: number; month: number; downloads: number; mrr?: number; demo: boolean; series: { date: string; total: number }[] } | null;
  instagram: { followers: number; gained7: number; engagement: number; demo: boolean; best: { day: number; hour: number } | null } | null;
  mails: { urgent: MailItem[]; urgentCount: number; unread: number; demo: boolean; autoReply: boolean } | null;
  reviews: { recentBad: Review[]; demo: boolean } | null;
  health: { score: number; at: string; problems: HealthResult[] } | null;
  tasks: Task[];
  posts: Post[];
  failedPosts: number;
  prospects: { replied: Prospect[]; toApprove: number; sentToday: number; dailyLimit: number };
}

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Bonne nuit" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
}

/** L'objectif du mois, présenté comme une carte de fidélité Keeply : 10 tampons. */
function StampCard({ goal, demo }: { goal: Today["goal"]; demo?: boolean }) {
  const STAMPS = 10;
  const ratio = goal.target ? goal.revenue / goal.target : 0;
  const filled = Math.min(STAMPS, Math.floor(ratio * STAMPS));
  const partial = Math.min(1, ratio * STAMPS - filled);
  const projected = Math.min(STAMPS, Math.floor((goal.projection / Math.max(1, goal.target)) * STAMPS));
  const perDay = goal.daysLeft > 0 ? Math.max(0, goal.target - goal.revenue) / goal.daysLeft : 0;
  const reached = ratio >= 1;

  return (
    <div className="relative isolate overflow-hidden rounded-[22px] bg-night p-5 text-[#f2eef8] shadow-[0_24px_60px_-30px_rgb(48_25_90/0.9)] sm:p-6">
      <div className="absolute -top-24 -right-20 -z-10 size-72 rounded-full bg-[#6b4af2] opacity-40 blur-3xl" />
      <div className="absolute -bottom-28 -left-10 -z-10 size-60 rounded-full bg-[#f3be72] opacity-[0.12] blur-3xl" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-[#b9b1cc]">Objectif de {MONTHS[new Date().getMonth()]}</p>
          <p className="font-display tnum mt-1 text-[40px] leading-none font-extrabold sm:text-[48px]">{eur(goal.revenue)}</p>
          <p className="mt-1.5 text-[14px] text-[#b9b1cc]">
            sur <span className="tnum font-semibold text-white">{eur(goal.target)}</span> · {pct(ratio, 0)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[12px] font-semibold text-[#f3be72]">
            Jour {goal.dayOfMonth}/{goal.daysInMonth}
          </span>
          {demo && <span className="rounded-full bg-[#f3be72]/15 px-2.5 py-1 text-[12px] font-semibold text-[#f3be72]">exemple</span>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-5 gap-3 sm:gap-4" role="img" aria-label={`${filled} tampons sur ${STAMPS}`}>
        {Array.from({ length: STAMPS }, (_, i) => {
          const isFilled = i < filled;
          const isPartial = i === filled && partial > 0.02 && !reached;
          const isProjected = !isFilled && !isPartial && i < projected;
          return (
            <div key={i} className="relative aspect-square">
              {isFilled ? (
                <div className="stamp-in grid size-full place-items-center rounded-full bg-[#f3be72] text-night shadow-[inset_0_-3px_0_rgb(0_0_0/0.12)]" style={{ animationDelay: `${120 + i * 70}ms` }}>
                  <Check className="size-[42%]" strokeWidth={3} />
                </div>
              ) : isPartial ? (
                <div className="grid size-full place-items-center rounded-full" style={{ background: `conic-gradient(#f3be72 ${partial * 360}deg, rgb(255 255 255 / 0.08) 0)` }}>
                  <div className="tnum grid size-[78%] place-items-center rounded-full bg-night text-[12px] font-bold text-[#f3be72]">{Math.round(partial * 100)}%</div>
                </div>
              ) : (
                <div className={cx("size-full rounded-full border-2", isProjected ? "border-dashed border-[#f3be72]/60" : "border-white/12")} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-white/10 pt-4 text-[13.5px] text-[#b9b1cc]">
        {reached ? (
          <span className="font-semibold text-[#f3be72]">Objectif atteint. Beau mois.</span>
        ) : (
          <>
            <span>
              Projection fin de mois <span className="tnum font-semibold text-white">{eur(goal.projection)}</span>
            </span>
            <span>
              Il faut <span className="tnum font-semibold text-white">{eur(perDay)}</span> / jour sur {goal.daysLeft} jours
            </span>
          </>
        )}
        <span className="flex items-center gap-1.5 text-[12.5px]">
          <span className="size-3 rounded-full border-2 border-dashed border-[#f3be72]/60" /> tampons prévus d&apos;ici la fin du mois
        </span>
      </div>
    </div>
  );
}

type Item = { key: string; icon: React.ReactNode; tone: "coral" | "honey" | "violet" | "mint"; title: string; meta: string; href: string };

function buildQueue(t: Today): Item[] {
  const items: Item[] = [];
  for (const p of t.health?.problems ?? []) items.push({ key: "h" + p.checkId, icon: <HeartPulse />, tone: p.severity === "panne" ? "coral" : "honey", title: p.name, meta: p.detail, href: "/sante" });
  for (const m of t.mails?.urgent ?? []) items.push({ key: "m" + m.id, icon: <Inbox />, tone: m.priority === 5 ? "coral" : "honey", title: m.subject, meta: `${m.from.name} · ${relative(m.date)}`, href: `/mails?id=${encodeURIComponent(m.id)}` });
  for (const p of t.prospects.replied) items.push({ key: "p" + p.id, icon: <MessageCircleReply />, tone: "mint", title: `${p.name} a répondu`, meta: `${p.city} · prospection`, href: "/prospection?status=repondu" });
  for (const r of t.reviews?.recentBad ?? []) items.push({ key: "r" + r.id, icon: <Star />, tone: "honey", title: `Avis ${r.rating}★ sans réponse`, meta: r.body.slice(0, 90), href: "/avis" });
  if (t.failedPosts) items.push({ key: "fp", icon: <AlertTriangle />, tone: "coral", title: `${t.failedPosts} post(s) Instagram en échec`, meta: "Voir la raison et republier", href: "/instagram" });
  if (t.prospects.toApprove) items.push({ key: "pa", icon: <Check />, tone: "violet", title: `${t.prospects.toApprove} mail(s) de prospection à valider`, meta: "Relis-les puis approuve l'envoi", href: "/prospection?status=pret" });
  return items;
}

const TONE = { coral: "bg-coral-soft text-coral", honey: "bg-honey-soft text-honey", violet: "bg-violet-soft text-violet", mint: "bg-mint-soft text-mint" };

export default function TodayPage() {
  const { data: t, isLoading, mutate } = useApi<Today>("/api/today", { refreshInterval: 5 * 60_000 });
  const { data: brief, mutate: setBrief } = useApi<{ brief: string; at: string } | null>("/api/brief");
  const [briefLoading, setBriefLoading] = useState(false);

  async function makeBrief() {
    setBriefLoading(true);
    const res = await api<{ brief: string; at: string }>("POST", "/api/brief");
    setBriefLoading(false);
    if (res) setBrief(res, { revalidate: false });
  }

  const queue = t ? buildQueue(t) : [];
  const name = t?.ownerName?.split(" ")[0];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-ink-3 first-letter:uppercase">{dateLong(new Date().toISOString())}</p>
          <h1 className="font-display text-[30px] leading-tight font-bold sm:text-[36px]">
            {greeting()}
            {name ? `, ${name}` : ""}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" icon={<RefreshCw className="size-4" />} onClick={() => mutate()}>
            Actualiser
          </Button>
          <Button variant="primary" icon={<Sparkles className="size-4" />} loading={briefLoading} onClick={makeBrief}>
            Briefing du jour
          </Button>
        </div>
      </header>

      {brief?.brief && (
        <Card className="mb-5" title="Briefing" action={<span className="text-[12.5px] text-ink-3">{relative(brief.at)}</span>}>
          <Markdown text={brief.brief} />
        </Card>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {t ? <StampCard goal={t.goal} demo={t.sales?.demo} /> : <Skeleton className="h-[330px] rounded-[22px]" />}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {t ? (
            <>
              <Stat label="Ventes hier" value={eur(t.sales?.yesterday)} hint={t.sales?.demo ? "exemple" : undefined} tone="violet" />
              <Stat label="Revenu récurrent (MRR)" value={eur(t.sales?.mrr)} hint="abonnements actifs" tone="honey" />
              <Stat
                label="Abonnés Instagram"
                value={num(t.instagram?.followers)}
                hint={t.instagram ? `${t.instagram.gained7 >= 0 ? "+" : ""}${t.instagram.gained7} en 7 jours` : undefined}
                tone="mint"
              />
              <Stat label="Mails à traiter" value={num(t.mails?.urgentCount)} hint={t.mails ? `${t.mails.unread} non lus` : undefined} tone="coral" />
              <div className="col-span-2 rounded-2xl border border-line bg-surface p-4 shadow-card">
                <div className="flex items-center justify-between text-[13px] text-ink-2">
                  <span>Ventes du mois, jour par jour</span>
                  <Link href="/ventes" className="font-semibold text-violet hover:underline">
                    Détails
                  </Link>
                </div>
                <Sparkline data={t.sales?.series ?? []} dataKey="total" height={64} />
              </div>
            </>
          ) : (
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className={cx("h-[110px] rounded-2xl", i === 4 && "col-span-2")} />)
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card title="À traiter" action={queue.length ? <Badge tone="coral">{queue.length}</Badge> : undefined} pad={false}>
          {isLoading && !t ? (
            <div className="space-y-2 p-5">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : queue.length ? (
            <ul className="divide-y divide-line">
              {queue.map((i) => (
                <li key={i.key}>
                  <Link href={i.href} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2">
                    <span className={cx("grid size-9 shrink-0 place-items-center rounded-xl [&_svg]:size-4", TONE[i.tone])}>{i.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{i.title}</span>
                      <span className="block truncate text-[13px] text-ink-3">{i.meta}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon={<Check className="size-5" />} title="Rien d'urgent">
              Pas de mail prioritaire, pas de panne, pas d&apos;avis négatif en attente.
            </Empty>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Santé de l'app" action={<Link href="/sante" className="text-[13px] font-semibold text-violet hover:underline">Ouvrir</Link>}>
            {t?.health ? (
              <div className="flex items-center gap-4">
                <div className={cx("font-display tnum grid size-16 shrink-0 place-items-center rounded-2xl text-[24px] font-bold", t.health.score >= 90 ? "bg-mint-soft text-mint" : t.health.score >= 60 ? "bg-honey-soft text-honey" : "bg-coral-soft text-coral")}>
                  {t.health.score}
                </div>
                <div className="min-w-0 text-[14px]">
                  <p className="font-semibold">{t.health.problems.length ? `${t.health.problems.length} point(s) à surveiller` : "Tout fonctionne"}</p>
                  <p className="text-ink-3">Dernier test {relative(t.health.at)}</p>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-ink-2">
                Aucun test pour l&apos;instant. Renseigne l&apos;adresse du site dans <Link className="font-semibold text-violet" href="/reglages">Réglages</Link> puis lance un test.
              </p>
            )}
          </Card>

          <Card title="Instagram cette semaine" action={<DemoBadge show={!!t?.instagram?.demo} what="exemple" />}>
            {t?.posts.length ? (
              <ul className="space-y-2.5">
                {t.posts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 text-[14px]">
                    <CalendarClock className="size-4 shrink-0 text-violet" />
                    <span className="min-w-0 flex-1 truncate">{p.caption || "(sans légende)"}</span>
                    <span className="shrink-0 text-[12.5px] text-ink-3">{dateTime(p.scheduledAt!)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-ink-2">Aucun post programmé dans les 7 prochains jours.</p>
            )}
            {t?.instagram?.best && (
              <p className="mt-3 rounded-xl bg-violet-soft px-3 py-2 text-[13px] text-violet">
                Ton meilleur créneau observé : le {DAYS[t.instagram.best.day]} vers {t.instagram.best.hour} h.
              </p>
            )}
            <Link href="/instagram?tab=creer" className="mt-3 inline-block text-[13.5px] font-semibold text-violet hover:underline">
              Programmer un post
            </Link>
          </Card>

          <Card title="Tâches" action={<Link href="/taches" className="text-[13px] font-semibold text-violet hover:underline">Tout voir</Link>}>
            {t?.tasks.length ? (
              <ul className="space-y-2">
                {t.tasks.map((x) => (
                  <li key={x.id} className="flex items-center gap-2.5 text-[14px]">
                    <span className={cx("size-2 shrink-0 rounded-full", x.priority === "haute" ? "bg-coral" : x.priority === "normale" ? "bg-honey" : "bg-line-2")} />
                    <span className="truncate">{x.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-ink-2">Aucune tâche ouverte.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
