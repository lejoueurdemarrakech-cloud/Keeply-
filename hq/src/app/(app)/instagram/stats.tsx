"use client";
import { Bookmark, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { Heatmap, RankBars, SimpleBars, TrendLine } from "@/components/charts";
import { Card, Stat } from "@/components/ui";
import { compact, dateShort, num, pct } from "@/lib/format";
import { DAY_NAMES, FORMAT_LABEL, type IgOverview } from "./shared";

export function Stats({ o }: { o: IgOverview }) {
  const a = o.analysis;
  const avgReach = o.media.length ? o.media.reduce((s, m) => s + m.reach, 0) / o.media.length : 0;
  const reach30 = o.growth.slice(-30).reduce((s, g) => s + g.reach, 0);
  const reachPrev = o.growth.slice(-60, -30).reduce((s, g) => s + g.reach, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Stat label="Abonnés" value={num(o.account.followers)} tone="violet" hint={`${o.account.mediaCount} publications`} />
        <Stat label="Nouveaux abonnés (7 j)" value={(a.followersGained7 >= 0 ? "+" : "") + num(a.followersGained7)} current={a.followersGained7} prev={a.followersGainedPrev7} hint="vs semaine d'avant" />
        <Stat label="Taux d'engagement" value={pct(a.engagementRate, 2)} hint={a.engagementRate > 0.035 ? "très bon" : a.engagementRate > 0.015 ? "dans la moyenne" : "à travailler"} tone="mint" />
        <Stat label="Portée (30 j)" value={compact(reach30)} current={reach30} prev={reachPrev || undefined} hint={`${compact(avgReach)} par post`} />
        <Stat label="Rythme" value={`${a.postsPerWeek.toFixed(1).replace(".", ",")} / sem.`} hint={a.postsPerWeek < 3 ? "vise 3 à 5 posts" : "bon rythme"} tone="honey" />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Évolution des abonnés">
          <TrendLine data={o.growth} dataKey="followers" label="Abonnés" height={240} />
        </Card>
        <Card title="Portée par jour">
          <SimpleBars data={o.growth.slice(-30)} dataKey="reach" label="Comptes touchés" color="var(--chart-3)" height={240} />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Quand publier">
          <Heatmap grid={a.heat} />
          {a.best.length > 0 && (
            <p className="mt-3 text-[14px]">
              Tes posts marchent le mieux le <strong>{a.best.map((b) => `${DAY_NAMES[b.day]} à ${b.hour} h`).join(", ")}</strong>.
            </p>
          )}
        </Card>
        <Card title="Formats">
          <table className="w-full text-[13.5px]">
            <thead className="text-left text-ink-3">
              <tr>
                <th className="pb-2 font-semibold">Format</th>
                <th className="pb-2 text-right font-semibold">Posts</th>
                <th className="pb-2 text-right font-semibold">Portée moy.</th>
                <th className="pb-2 text-right font-semibold">Interactions</th>
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-line">
              {[...a.formats].sort((x, y) => y.avgReach - x.avgReach).map((f) => (
                <tr key={f.type}>
                  <td className="py-2 font-semibold">{FORMAT_LABEL[f.type] ?? f.type}</td>
                  <td className="py-2 text-right">{f.posts}</td>
                  <td className="py-2 text-right">{num(f.avgReach)}</td>
                  <td className="py-2 text-right">{num(f.avgEngagement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {a.formats.length > 1 && (
            <p className="mt-3 rounded-xl bg-violet-soft px-3 py-2 text-[13px] text-violet">
              {FORMAT_LABEL[[...a.formats].sort((x, y) => y.avgReach - x.avgReach)[0].type] ?? "Ce format"} touche le plus de monde : publies-en davantage.
            </p>
          )}
        </Card>
      </div>

      <Card title="Tes meilleurs posts" pad={false}>
        <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3 lg:grid-cols-5">
          {a.top.map((m) => (
            <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="group bg-surface p-3 transition-colors hover:bg-surface-2">
              <div className="aspect-square overflow-hidden rounded-xl bg-bg-2">{m.thumbnail && <img src={m.thumbnail} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />}</div>
              <p className="mt-2 line-clamp-2 text-[13px]">{m.caption}</p>
              <div className="tnum mt-2 grid grid-cols-3 gap-1 text-[12px] text-ink-3">
                <span className="flex items-center gap-1">
                  <Eye className="size-3" />
                  {compact(m.reach)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="size-3" />
                  {compact(m.likes)}
                </span>
                <span className="flex items-center gap-1">
                  <Bookmark className="size-3" />
                  {compact(m.saves)}
                </span>
              </div>
            </a>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Hashtags qui portent">
          {a.hashtags.length ? (
            <RankBars rows={a.hashtags.slice(0, 8).map((h) => ({ label: h.tag, value: h.avgReach, sub: `${h.posts} posts` }))} format={(n) => compact(n)} color="var(--chart-3)" />
          ) : (
            <p className="text-[14px] text-ink-2">Pas encore de hashtags dans tes légendes.</p>
          )}
        </Card>
        <Card title="Villes de ton audience">
          {o.audience.cities.length ? <RankBars rows={o.audience.cities.map((c) => ({ label: c.name, value: c.value }))} format={(n) => `${n} %`} /> : <p className="text-[14px] text-ink-2">Disponible à partir de 100 abonnés.</p>}
        </Card>
        <Card title="Âge de ton audience">
          {o.audience.ages.length ? <RankBars rows={o.audience.ages.map((c) => ({ label: c.name + " ans", value: c.value }))} format={(n) => `${n} %`} color="var(--chart-4)" /> : <p className="text-[14px] text-ink-2">Disponible à partir de 100 abonnés.</p>}
        </Card>
      </div>

      <Card title="Toutes les publications récentes" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-[13.5px]">
            <thead className="text-left text-ink-3">
              <tr className="border-b border-line">
                <th className="px-5 py-2.5 font-semibold">Post</th>
                <th className="px-3 py-2.5 font-semibold">Date</th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  <Eye className="ml-auto size-4" aria-label="Portée" />
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  <Heart className="ml-auto size-4" aria-label="J'aime" />
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  <MessageCircle className="ml-auto size-4" aria-label="Commentaires" />
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">
                  <Bookmark className="ml-auto size-4" aria-label="Enregistrements" />
                </th>
                <th className="px-5 py-2.5 text-right font-semibold">
                  <Share2 className="ml-auto size-4" aria-label="Partages" />
                </th>
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-line">
              {o.media.map((m) => (
                <tr key={m.id} className="hover:bg-surface-2">
                  <td className="max-w-[320px] px-5 py-2">
                    <a href={m.permalink} target="_blank" rel="noreferrer" className="block truncate hover:text-violet">
                      <span className="mr-2 text-[12px] font-semibold text-ink-3">{FORMAT_LABEL[m.type] ?? m.type}</span>
                      {m.caption}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-ink-2">{dateShort(m.timestamp)}</td>
                  <td className="px-3 py-2 text-right">{num(m.reach)}</td>
                  <td className="px-3 py-2 text-right">{num(m.likes)}</td>
                  <td className="px-3 py-2 text-right">{num(m.comments)}</td>
                  <td className="px-3 py-2 text-right">{num(m.saves)}</td>
                  <td className="px-5 py-2 text-right">{num(m.shares)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
