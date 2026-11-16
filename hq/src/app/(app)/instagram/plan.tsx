"use client";
import { CalendarDays, Copy, GripVertical, List, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CopyButton, Segmented, Skeleton, Toggle, cx } from "@/components/ui";
import { KindBadge, PlanItemModal, PromptButton, STATUS_LABEL, STATUS_TONE, usePlan } from "@/components/plan-item";
import { isoLocal, longDate, promptFor, type LivePlanItem } from "@/lib/launch-calendar";
import { ACCOUNT_LABEL, DAILY_STORIES, ENGAGEMENT, HIGHLIGHTS, PROFILES, STRATEGY, type Account } from "@/lib/plan-v7";

type Filter = "tout" | Account;
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const CHIP: Record<Account, string> = {
  fr: "border-violet/30 bg-violet/10 text-ink",
  en: "border-sky/40 bg-sky/10 text-ink",
  tiktok: "border-coral/30 bg-coral/10 text-ink",
};

export function PlanV7() {
  const plan = usePlan();
  const [filter, setFilter] = useState<Filter>("fr");
  const [view, setView] = useState<"calendrier" | "liste">("calendrier");
  const [stories, setStories] = useState(true);
  const [reposts, setReposts] = useState(false);
  const [open, setOpen] = useState<LivePlanItem | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const items = plan.items.filter((i) => (filter === "tout" || i.account === filter) && (stories || i.kind === "post") && (reposts || !i.repostOf));
  const profile = filter === "tout" ? null : PROFILES[filter];
  const highlights = filter === "en" ? HIGHLIGHTS.en : filter === "fr" ? HIGHLIGHTS.fr : null;
  const posts = plan.items.filter((i) => i.kind === "post" && (filter === "tout" || i.account === filter));
  const published = posts.filter((i) => i.status === "publie").length;

  return (
    <div className="space-y-5">
      <Card title="La stratégie en clair" action={<Target className="size-4 text-violet" />}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(
            [
              ["L'idée", STRATEGY.idee],
              ["Le rythme", STRATEGY.rythme],
              ["Les boosts", STRATEGY.boost],
              ["Les objectifs", STRATEGY.objectifs],
            ] as const
          ).map(([t, v]) => (
            <div key={t} className="rounded-xl bg-surface-2 p-3.5">
              <p className="text-[12.5px] font-semibold text-ink-3">{t}</p>
              <p className="mt-1 text-[13.5px] text-ink-2">{v}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: "fr", label: "Insta FR" },
            { value: "en", label: "Insta EN" },
            { value: "tiktok", label: "TikTok" },
            { value: "tout", label: "Tout" },
          ]}
        />
        <Segmented
          size="sm"
          value={view}
          onChange={setView}
          options={[
            { value: "calendrier", label: <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> Calendrier</span> },
            { value: "liste", label: <span className="inline-flex items-center gap-1"><List className="size-3.5" /> Liste</span> },
          ]}
        />
        <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2">
          <Toggle checked={stories} onChange={setStories} label="Stories" /> Stories
        </label>
        <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2">
          <Toggle checked={reposts} onChange={setReposts} label="Reposts en story" /> Reposts en story
        </label>
        <span className="ml-auto text-[13px] text-ink-3 tnum">
          {published} / {posts.length} posts publiés
        </span>
      </div>

      {profile && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card title={`Profil · ${ACCOUNT_LABEL[filter as Account]}`} action={<CopyButton text={profile.bio} label="Copier la bio" />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[12.5px] font-semibold text-ink-3">Nom d’utilisateur · nom affiché</p>
                <p className="mt-0.5 text-[14px] font-semibold">
                  {profile.username} · {profile.nom}
                </p>
                <p className="mt-3 text-[12.5px] font-semibold text-ink-3">Bio</p>
                <p className="mt-0.5 whitespace-pre-line rounded-xl bg-surface-2 p-3 text-[14px]">{profile.bio}</p>
              </div>
              <div className="space-y-3 text-[13.5px] text-ink-2">
                <div>
                  <p className="text-[12.5px] font-semibold text-ink-3">Lien en bio</p>
                  <p className="mt-0.5 flex items-center gap-2">
                    <a href={profile.lien} target="_blank" rel="noreferrer" className="truncate font-semibold text-violet hover:underline">
                      {profile.lien.replace("https://", "")}
                    </a>
                    <CopyButton text={profile.lien} label="Copier" />
                  </p>
                  <p className="mt-1">{profile.lienTexte}</p>
                </div>
                <p>{profile.boutons}</p>
                <p>{profile.epingles}</p>
              </div>
            </div>
          </Card>
          {highlights ? (
            <Card title="Stories à la une">
              <ul className="grid grid-cols-2 gap-2.5">
                {highlights.map((h) => (
                  <li key={h.nom} className="rounded-xl bg-surface-2 p-3">
                    <p className="flex items-center gap-2 text-[13.5px] font-semibold">
                      <span className="grid size-7 place-items-center rounded-full bg-violet text-[11px] font-bold text-white">{h.nom.slice(0, 1)}</span>
                      {h.nom}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12.5px] text-ink-2">
                      {h.contenu.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <Card title="TikTok">
              <p className="text-[13.5px] text-ink-2">Chaque Reel FR repart sur TikTok le même jour à 19 h, en natif (sans le logo Instagram). Pas de pub TikTok au début : le minimum dépasse le budget.</p>
            </Card>
          )}
        </div>
      )}

      {!plan.loaded ? (
        <Skeleton className="h-96" />
      ) : view === "calendrier" ? (
        <Calendar
          items={items}
          over={over}
          setOver={setOver}
          onOpen={setOpen}
          onDrop={(id, date) => {
            const it = plan.items.find((i) => i.id === id);
            if (!it || it.date === date) return;
            plan.move(id, date);
            toast.success(`${it.titre} → ${longDate(date)}`);
          }}
        />
      ) : (
        <ListView items={items} onOpen={setOpen} />
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Stories de tous les jours (en plus des posts)">
          <ul className="divide-y divide-line text-[13.5px]">
            {DAILY_STORIES.map((d) => (
              <li key={d.jour} className="flex gap-3 py-2">
                <span className="w-20 shrink-0 font-semibold">{d.jour}</span>
                <span className="text-ink-2">{filter === "en" ? d.en : d.fr}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Routine engagement (20 min avant de publier)">
          <ul className="list-disc space-y-1.5 pl-4 text-[13.5px] text-ink-2">
            {ENGAGEMENT.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </Card>
      </div>
      <PlanItemModal item={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Calendar({ items, over, setOver, onOpen, onDrop }: { items: LivePlanItem[]; over: string | null; setOver: (d: string | null) => void; onOpen: (i: LivePlanItem) => void; onDrop: (id: string, date: string) => void }) {
  const days = useMemo(() => {
    const dates = items.map((i) => i.date).sort();
    const first = new Date((dates[0] ?? isoLocal(new Date())) + "T12:00:00");
    const last = new Date((dates[dates.length - 1] ?? isoLocal(new Date())) + "T12:00:00");
    const start = new Date(first);
    start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - ((last.getDay() + 6) % 7)));
    const out: string[] = [];
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) out.push(isoLocal(d));
    return out;
  }, [items]);
  const today = isoLocal(new Date());
  const byDay = useMemo(() => {
    const m = new Map<string, LivePlanItem[]>();
    for (const i of items) m.set(i.date, [...(m.get(i.date) ?? []), i]);
    return m;
  }, [items]);

  return (
    <Card pad={false} title="Calendrier · glisse un post sur un autre jour pour le déplacer">
      <div className="grid grid-cols-7 border-b border-line text-center text-[12px] font-semibold text-ink-3">
        {DOW.map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((d) => {
          const list = byDay.get(d) ?? [];
          const date = new Date(d + "T12:00:00");
          return (
            <div
              key={d}
              onDragOver={(e) => {
                e.preventDefault();
                if (over !== d) setOver(d);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(e) => {
                e.preventDefault();
                setOver(null);
                const id = e.dataTransfer.getData("text/plain");
                if (id) onDrop(id, d);
              }}
              className={cx("min-h-[118px] border-b border-r border-line p-1.5 transition-colors", over === d && "bg-violet/10", d < today && "bg-bg-2/40")}
            >
              <p className={cx("mb-1 px-1 text-[11.5px] font-semibold tnum", d === today ? "text-violet" : "text-ink-3")}>
                {date.getDate() === 1 || d === days[0] ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : date.getDate()}
              </p>
              <div className="space-y-1">
                {list.map((i) => (
                  <button
                    key={i.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", i.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onClick={() => onOpen(i)}
                    title={`${i.titre} · ${i.heure}`}
                    className={cx(
                      "group flex w-full cursor-grab items-start gap-1 rounded-lg border px-1.5 py-1 text-left text-[11.5px] leading-tight active:cursor-grabbing",
                      CHIP[i.account],
                      i.kind === "story" && "border-dashed",
                      i.status === "publie" && "opacity-50",
                    )}
                  >
                    <GripVertical className="mt-px size-3 shrink-0 text-ink-3 opacity-0 group-hover:opacity-100" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {i.status === "pret" && "✓ "}
                        {i.titre}
                      </span>
                      <span className="text-ink-3 tnum">
                        {i.heure} · {i.account === "tiktok" ? "TikTok" : i.format}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="px-5 py-3 text-[12.5px] text-ink-3">
        Violet = Insta FR, bleu = Insta EN, rouge = TikTok. Pointillés = stories. Clique pour voir le détail, changer l’heure, marquer « Prêt » ou « Publié » et copier le prompt.
      </p>
    </Card>
  );
}

function ListView({ items, onOpen }: { items: LivePlanItem[]; onOpen: (i: LivePlanItem) => void }) {
  const today = isoLocal(new Date());
  const upcoming = items.filter((i) => i.date >= today || i.status !== "publie");
  return (
    <Card pad={false} title={`À venir · ${upcoming.length}`} action={<CopyAll items={upcoming.filter((i) => i.status === "afaire").slice(0, 5)} />}>
      <ul className="divide-y divide-line">
        {upcoming.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <button onClick={() => onOpen(i)} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-1.5">
                <KindBadge item={i} />
                <Badge tone={STATUS_TONE[i.status]}>{STATUS_LABEL[i.status]}</Badge>
                {i.moved && <Badge tone="honey">Déplacé</Badge>}
              </div>
              <p className="mt-1 text-[14px] font-semibold">{i.titre}</p>
              <p className="text-[12.5px] text-ink-3">
                {longDate(i.date)} · {i.heure} · « {i.accroche} »
              </p>
            </button>
            <PromptButton item={i} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Copie d'un coup les prompts des 5 prochains contenus à faire. */
function CopyAll({ items }: { items: LivePlanItem[] }) {
  if (!items.length) return null;
  return (
    <Button
      size="sm"
      icon={<Copy className="size-3.5" />}
      onClick={async () => {
        await navigator.clipboard.writeText(items.map((i) => promptFor(i)).join("\n\n----------\n\n"));
        toast.success(`${items.length} prompts copiés : colle-les dans Claude Code.`);
      }}
    >
      Copier les 5 prochains
    </Button>
  );
}
