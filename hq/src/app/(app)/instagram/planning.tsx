"use client";
import { ChevronLeft, ChevronRight, CircleAlert, ExternalLink, Pencil, Send, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, cx } from "@/components/ui";
import { api } from "@/lib/client";
import { dateTime, relative } from "@/lib/format";
import type { Post } from "@/lib/types";
import type { IgMedia } from "./shared";

const STATUS: Record<Post["status"], { label: string; tone: "neutral" | "violet" | "honey" | "mint" | "coral" }> = {
  brouillon: { label: "Brouillon", tone: "neutral" },
  programme: { label: "Programmé", tone: "violet" },
  publication: { label: "En cours", tone: "honey" },
  publie: { label: "Publié", tone: "mint" },
  echec: { label: "Échec", tone: "coral" },
};
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function Planning({ posts, published, onEdit, onChange }: { posts: Post[]; published: IgMedia[]; onEdit: (p: Post) => void; onChange: () => void }) {
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [busy, setBusy] = useState<string | null>(null);

  const cells = useMemo(() => {
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(1 - offset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [month]);

  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const dayItems = (d: Date) => [
    ...posts.filter((p) => (p.scheduledAt || p.publishedAt) && sameDay(new Date(p.publishedAt || p.scheduledAt!), d)).map((p) => ({ kind: "post" as const, p })),
    ...published.filter((m) => sameDay(new Date(m.timestamp), d) && !posts.some((p) => p.igMediaId === m.id)).map((m) => ({ kind: "ig" as const, m })),
  ];

  const drafts = posts.filter((p) => p.status === "brouillon" || p.status === "echec");
  const upcoming = posts.filter((p) => p.status === "programme").sort((a, b) => a.scheduledAt!.localeCompare(b.scheduledAt!));

  async function publish(p: Post) {
    setBusy(p.id);
    const res = await api("POST", `/api/instagram/posts/${p.id}/publish`);
    setBusy(null);
    if (res) toast.success("Publié sur Instagram.");
    onChange();
  }
  async function remove(p: Post) {
    if (!confirm("Supprimer ce post ?")) return;
    await api("DELETE", `/api/instagram/posts/${p.id}`);
    onChange();
  }

  const today = new Date();
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card
        title={month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        action={
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" aria-label="Mois précédent" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setMonth(new Date(today.getFullYear(), today.getMonth(), 1))}>
              Aujourd&apos;hui
            </Button>
            <Button size="sm" variant="ghost" aria-label="Mois suivant" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      >
        <div className="hidden grid-cols-7 gap-1.5 sm:grid">
          {WEEKDAYS.map((w) => (
            <p key={w} className="pb-1 text-center text-[12px] font-semibold text-ink-3">
              {w}
            </p>
          ))}
          {cells.map((d) => {
            const items = dayItems(d);
            const inMonth = d.getMonth() === month.getMonth();
            return (
              <div key={d.toISOString()} className={cx("min-h-24 rounded-xl border p-1.5", sameDay(d, today) ? "border-violet" : "border-line", !inMonth && "opacity-40")}>
                <p className={cx("tnum text-[12px] font-semibold", sameDay(d, today) ? "text-violet" : "text-ink-3")}>{d.getDate()}</p>
                <div className="mt-1 space-y-1">
                  {items.slice(0, 3).map((it) =>
                    it.kind === "post" ? (
                      <button
                        key={it.p.id}
                        onClick={() => onEdit(it.p)}
                        className={cx(
                          "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11.5px] font-semibold",
                          it.p.status === "publie" ? "bg-mint-soft text-mint" : it.p.status === "echec" ? "bg-coral-soft text-coral" : "bg-violet-soft text-violet",
                        )}
                        title={it.p.caption}
                      >
                        {new Date(it.p.publishedAt || it.p.scheduledAt!).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {it.p.caption || it.p.format}
                      </button>
                    ) : (
                      <a key={it.m.id} href={it.m.permalink} target="_blank" rel="noreferrer" className="block truncate rounded-md bg-bg-2 px-1.5 py-0.5 text-[11.5px] text-ink-2" title={it.m.caption}>
                        {it.m.caption || it.m.type}
                      </a>
                    ),
                  )}
                  {items.length > 3 && <p className="text-[11px] text-ink-3">+{items.length - 3}</p>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="sm:hidden">
          {upcoming.length === 0 ? (
            <p className="text-[14px] text-ink-2">Aucun post programmé.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((p) => (
                <li key={p.id}>
                  <button onClick={() => onEdit(p)} className="w-full rounded-xl border border-line p-3 text-left">
                    <p className="text-[12.5px] font-semibold text-violet">{dateTime(p.scheduledAt!)}</p>
                    <p className="mt-0.5 line-clamp-2 text-[14px]">{p.caption || p.format}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="space-y-5">
        <Card title="À venir" pad={false}>
          {upcoming.length ? (
            <ul className="divide-y divide-line">
              {upcoming.map((p) => (
                <PostRow key={p.id} p={p} busy={busy === p.id} onEdit={onEdit} onPublish={publish} onRemove={remove} />
              ))}
            </ul>
          ) : (
            <Empty title="Rien de programmé">Crée un post et choisis une date : il partira tout seul.</Empty>
          )}
        </Card>
        {drafts.length > 0 && (
          <Card title="Brouillons et échecs" pad={false}>
            <ul className="divide-y divide-line">
              {drafts.map((p) => (
                <PostRow key={p.id} p={p} busy={busy === p.id} onEdit={onEdit} onPublish={publish} onRemove={remove} />
              ))}
            </ul>
          </Card>
        )}
        <p className="px-1 text-[12.5px] text-ink-3">
          Les posts programmés partent automatiquement dès que la tâche planifiée tourne (toutes les quelques minutes quand le tableau de bord est ouvert, ou via le service de planification configuré).
        </p>
      </div>
    </div>
  );
}

function PostRow({ p, busy, onEdit, onPublish, onRemove }: { p: Post; busy: boolean; onEdit: (p: Post) => void; onPublish: (p: Post) => void; onRemove: (p: Post) => void }) {
  return (
    <li className="flex gap-3 px-5 py-3">
      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-bg-2">{p.media[0] && !/\.(mp4|mov)/i.test(p.media[0]) && <img src={p.media[0]} alt="" className="size-full object-cover" />}</div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
          <span className="truncate text-[12.5px] text-ink-3">{p.scheduledAt ? dateTime(p.scheduledAt) : relative(p.createdAt)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-[13.5px]">{p.caption || <span className="text-ink-3">(sans légende)</span>}</p>
        {p.error && (
          <p className="mt-1 flex items-start gap-1 text-[12.5px] text-coral">
            <CircleAlert className="mt-0.5 size-3.5 shrink-0" /> {p.error}
          </p>
        )}
        <div className="mt-1.5 flex gap-1">
          <Button size="sm" variant="ghost" icon={<Pencil className="size-3.5" />} onClick={() => onEdit(p)}>
            Modifier
          </Button>
          {p.status !== "publie" && (
            <Button size="sm" variant="ghost" icon={<Send className="size-3.5" />} loading={busy} onClick={() => onPublish(p)}>
              Publier
            </Button>
          )}
          {p.permalink && (
            <a href={p.permalink} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1 px-2 text-[13px] font-semibold text-ink-2 hover:text-ink">
              <ExternalLink className="size-3.5" /> Voir
            </a>
          )}
          <Button size="sm" variant="ghost" aria-label="Supprimer" onClick={() => onRemove(p)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
