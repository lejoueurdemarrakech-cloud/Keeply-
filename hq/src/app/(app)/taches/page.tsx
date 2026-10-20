"use client";
import { ArrowLeft, ArrowRight, CalendarDays, Plus, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Badge, Button, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateShort } from "@/lib/format";
import type { Task } from "@/lib/types";

const COLS: { id: Task["status"]; label: string }[] = [
  { id: "todo", label: "À faire" },
  { id: "doing", label: "En cours" },
  { id: "done", label: "Fait" },
];
const PRIO: Record<Task["priority"], { label: string; dot: string }> = {
  haute: { label: "Haute", dot: "bg-coral" },
  normale: { label: "Normale", dot: "bg-honey" },
  basse: { label: "Basse", dot: "bg-line-2" },
};

function TasksInner() {
  const params = useSearchParams();
  const { data, mutate, isLoading } = useApi<Task[]>("/api/tasks");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("normale");
  const [due, setDue] = useState("");
  const [tag, setTag] = useState("");
  const [drag, setDrag] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const tasks = data ?? [];

  useEffect(() => {
    if (params.has("new")) input.current?.focus();
  }, [params]);

  const save = async (next: Task[]) => {
    mutate(next, { revalidate: false });
    await api("PUT", "/api/tasks", next);
  };
  const add = async () => {
    if (!title.trim()) return;
    const t: Task = { id: "t" + Date.now().toString(36), title: title.trim(), status: "todo", priority, due: due || null, tag: tag.trim() || undefined, createdAt: new Date().toISOString() };
    setTitle("");
    setDue("");
    await save([t, ...tasks]);
  };
  const move = (id: string, status: Task["status"]) => save(tasks.map((t) => (t.id === id ? { ...t, status } : t)));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader title="Tâches" subtitle="Tout ce qu'il reste à faire pour Keeply. Les pannes détectées par la Santé de l'app arrivent ici toutes seules." />
      <div className="mb-5 flex flex-col gap-2 rounded-2xl border border-line bg-surface p-3 shadow-card sm:flex-row sm:items-center">
        <input ref={input} className="field border-0 shadow-none focus:shadow-none" placeholder="Nouvelle tâche… (Entrée pour ajouter)" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <div className="flex flex-wrap gap-2">
          <select className="field h-9 w-auto py-1 text-[13px]" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} aria-label="Priorité">
            {Object.entries(PRIO).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <input type="date" className="field h-9 w-auto py-1 text-[13px]" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Échéance" />
          <input className="field h-9 w-28 py-1 text-[13px]" placeholder="Étiquette" value={tag} onChange={(e) => setTag(e.target.value)} />
          <Button variant="primary" size="sm" className="h-9" icon={<Plus className="size-4" />} onClick={add}>
            Ajouter
          </Button>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLS.map((col, ci) => {
            const items = tasks.filter((t) => t.status === col.id).sort((a, b) => ["haute", "normale", "basse"].indexOf(a.priority) - ["haute", "normale", "basse"].indexOf(b.priority));
            return (
              <section
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drag && move(drag, col.id)}
                className={cx("min-h-40 rounded-2xl border border-dashed p-3 transition-colors", drag ? "border-violet/50 bg-violet-soft/30" : "border-line bg-bg-2/50")}
              >
                <h2 className="mb-3 flex items-center gap-2 px-1 font-display font-semibold">
                  {col.label} <span className="tnum text-[13px] font-normal text-ink-3">{items.length}</span>
                </h2>
                <ul className="space-y-2">
                  {items.map((t) => (
                    <li
                      key={t.id}
                      draggable
                      onDragStart={() => setDrag(t.id)}
                      onDragEnd={() => setDrag(null)}
                      className="group cursor-grab rounded-xl border border-line bg-surface p-3 shadow-card active:cursor-grabbing"
                    >
                      <div className="flex items-start gap-2">
                        <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", PRIO[t.priority].dot)} title={`Priorité ${PRIO[t.priority].label}`} />
                        <p className={cx("min-w-0 flex-1 text-[14px]", t.status === "done" && "text-ink-3 line-through")}>{t.title}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        {t.tag && <Badge tone="violet">{t.tag}</Badge>}
                        {t.due && (
                          <Badge tone={t.due < today && t.status !== "done" ? "coral" : "neutral"}>
                            <CalendarDays className="size-3" /> {dateShort(t.due)}
                          </Badge>
                        )}
                        <div className="ml-auto flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          {ci > 0 && (
                            <button className="rounded-md p-1 text-ink-3 hover:bg-bg-2 hover:text-ink" aria-label="Reculer" onClick={() => move(t.id, COLS[ci - 1].id)}>
                              <ArrowLeft className="size-3.5" />
                            </button>
                          )}
                          {ci < 2 && (
                            <button className="rounded-md p-1 text-ink-3 hover:bg-bg-2 hover:text-ink" aria-label="Avancer" onClick={() => move(t.id, COLS[ci + 1].id)}>
                              <ArrowRight className="size-3.5" />
                            </button>
                          )}
                          <button className="rounded-md p-1 text-ink-3 hover:bg-bg-2 hover:text-coral" aria-label="Supprimer" onClick={() => save(tasks.filter((x) => x.id !== t.id))}>
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {col.id === "done" && items.length > 0 && (
                  <button className="mt-3 px-1 text-[12.5px] font-semibold text-ink-3 hover:text-coral" onClick={() => save(tasks.filter((t) => t.status !== "done"))}>
                    Vider les tâches faites
                  </button>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<Skeleton className="h-72" />}>
      <TasksInner />
    </Suspense>
  );
}
