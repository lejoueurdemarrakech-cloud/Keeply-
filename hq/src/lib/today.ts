import "server-only";
import { salesSummary } from "@/lib/sales";
import { analyze, instagramOverview, listPosts } from "@/lib/instagram";
import { inbox } from "@/lib/mail";
import { getReviews } from "@/lib/reviews";
import { listTasks } from "@/lib/tasks";
import { listProspects, sentToday } from "@/lib/prospects";
import { getSettings } from "@/lib/settings";
import { read } from "@/lib/store";
import { isoDay } from "@/lib/demo";
import type { HealthRun } from "@/lib/types";

export async function todayOverview() {
  const now = new Date();
  const monthStart = isoDay(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const today = isoDay(now);
  const settled = <T,>(p: Promise<T>) => p.then((v) => v).catch(() => null);

  const [sales, ig, mails, reviews, tasks, posts, prospects, runs, settings, sent] = await Promise.all([
    settled(salesSummary(monthStart, today)),
    settled(instagramOverview()),
    settled(inbox()),
    settled(getReviews()),
    listTasks(),
    listPosts(),
    listProspects(),
    read<HealthRun[]>("health:runs", []),
    getSettings(),
    sentToday(),
  ]);

  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const dayOfMonth = now.getUTCDate();
  const revenue = sales?.totals.revenue ?? 0;
  const projection = dayOfMonth > 0 ? (revenue / dayOfMonth) * daysInMonth : 0;
  const series = sales?.series ?? [];
  const todayRow = series.find((r) => r.date === today);
  const yesterdayRow = series.find((r) => r.date === isoDay(new Date(Date.now() - 864e5)));

  const analysis = ig ? analyze(ig) : null;
  const urgentMails = (mails?.items ?? []).filter((m) => !m.done && m.priority >= 4);
  const weekAhead = Date.now() + 7 * 864e5;

  return {
    ownerName: settings.ownerName,
    goal: { target: settings.monthlyGoal, revenue, projection: Math.round(projection), daysLeft: daysInMonth - dayOfMonth, daysInMonth, dayOfMonth },
    sales: sales
      ? {
          today: Number(todayRow?.total ?? 0),
          yesterday: Number(yesterdayRow?.total ?? 0),
          month: revenue,
          downloads: sales.totals.downloads,
          mrr: sales.subscriptions?.mrr,
          demo: sales.sources.every((s) => s.state !== "live"),
          series: series.map((r) => ({ date: r.date, total: Number(r.total) })),
        }
      : null,
    instagram: ig
      ? { followers: ig.account.followers, gained7: analysis!.followersGained7, engagement: analysis!.engagementRate, demo: !ig.live, best: analysis!.best[0] ?? null }
      : null,
    mails: mails ? { urgent: urgentMails.slice(0, 5), urgentCount: urgentMails.length, unread: mails.items.filter((m) => !m.seen && !m.isBulk).length, demo: !mails.live, autoReply: mails.autoReply } : null,
    reviews: reviews ? { recentBad: reviews.reviews.filter((r) => r.rating <= 2 && !r.reply && Date.now() - new Date(r.date).getTime() < 14 * 864e5).slice(0, 3), demo: !reviews.live } : null,
    health: runs[0] ? { score: runs[0].score, at: runs[0].at, problems: runs[0].results.filter((r) => r.severity !== "ok").slice(0, 4) } : null,
    tasks: tasks.filter((t) => t.status !== "done").sort((a, b) => (a.priority === "haute" ? -1 : 0) - (b.priority === "haute" ? -1 : 0)).slice(0, 6),
    posts: posts.filter((p) => p.status === "programme" && p.scheduledAt && new Date(p.scheduledAt).getTime() < weekAhead).slice(0, 5),
    failedPosts: posts.filter((p) => p.status === "echec").length,
    prospects: {
      replied: prospects.filter((p) => p.status === "repondu").slice(0, 4),
      toApprove: prospects.filter((p) => p.status === "pret").length,
      sentToday: sent,
      dailyLimit: settings.prospecting.dailyLimit,
    },
  };
}

export function briefContext(t: Awaited<ReturnType<typeof todayOverview>>) {
  const lines = [
    `Objectif du mois : ${t.goal.target} €. Réalisé : ${t.goal.revenue.toFixed(0)} € au jour ${t.goal.dayOfMonth}/${t.goal.daysInMonth}, projection ${t.goal.projection} €.`,
    t.sales ? `Ventes hier : ${t.sales.yesterday.toFixed(0)} €. MRR : ${t.sales.mrr ?? "inconnu"}. Téléchargements ce mois : ${t.sales.downloads}.` : "",
    t.instagram ? `Instagram : ${t.instagram.followers} abonnés, ${t.instagram.gained7} sur 7 jours, engagement ${(t.instagram.engagement * 100).toFixed(1)} %.` : "",
    t.mails ? `Mails urgents : ${t.mails.urgentCount} (${t.mails.urgent.map((m) => `« ${m.subject} » de ${m.from.name}`).join(" ; ")}). Non lus : ${t.mails.unread}.` : "",
    t.reviews?.recentBad.length ? `Avis négatifs sans réponse : ${t.reviews.recentBad.map((r) => `${r.rating}★ « ${r.body.slice(0, 80)} »`).join(" ; ")}` : "",
    t.health ? `Santé de l'app : ${t.health.score}/100. Problèmes : ${t.health.problems.map((p) => `${p.name} (${p.detail})`).join(" ; ") || "aucun"}.` : "Santé de l'app : jamais testée.",
    `Tâches ouvertes : ${t.tasks.map((x) => x.title).join(" ; ") || "aucune"}.`,
    `Posts programmés cette semaine : ${t.posts.length}. Posts en échec : ${t.failedPosts}.`,
    `Prospection : ${t.prospects.replied.length} réponses à traiter, ${t.prospects.toApprove} mails à valider, ${t.prospects.sentToday}/${t.prospects.dailyLimit} envoyés aujourd'hui.`,
  ];
  return lines.filter(Boolean).join("\n");
}
