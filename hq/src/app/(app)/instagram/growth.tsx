"use client";
import { Bookmark, Check, Flame, Lightbulb, MessageSquareText, Plus, RefreshCw, Sparkles, Trash2, UserSearch } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CopyButton, Empty, Markdown, Skeleton, cx } from "@/components/ui";
import { api, useApi, useNow } from "@/lib/client";
import { compact, isoDay, num, relative } from "@/lib/format";
import type { Draft } from "./composer";
import { emptyDraft } from "./composer";

interface Library {
  hashtagSets: { id: string; name: string; tags: string }[];
  ideas: { id: string; title: string; format: string; hook: string; outline: string; done?: boolean }[];
  checklist: Record<string, string[]>;
}
type Idea = { title: string; format: string; hook: string; outline: string; why: string };

const CHECKLIST = [
  { id: "comments", label: "Répondre à tous les commentaires et messages" },
  { id: "engage", label: "Commenter 10 posts de restaurateurs ou cafés (vrais commentaires)" },
  { id: "story", label: "Publier 2 à 3 stories (sondage, question, coulisses)" },
  { id: "reel", label: "Tourner ou monter un Reel" },
  { id: "collab", label: "Proposer un post en collaboration à un client ou un compte local" },
  { id: "share", label: "Repartager une story où un client mentionne Keeply" },
  { id: "bio", label: "Vérifier que le lien en bio mène à la bonne page" },
];

const QUICK = ["Que dois-je publier cette semaine pour gagner des abonnés ?", "Pourquoi mes posts touchent peu de monde ?", "Comment transformer mes abonnés en clients Keeply ?", "Quels comptes contacter pour des collaborations ?"];

function slug() {
  return Math.random().toString(36).slice(2, 9);
}

export function Growth({ onCreate }: { onCreate: (d: Draft) => void }) {
  const { data: lib, mutate } = useApi<Library>("/api/instagram/library");
  const saveLib = async (patch: Partial<Library>) => {
    const next = { ...(lib ?? { hashtagSets: [], ideas: [], checklist: {} }), ...patch };
    mutate(next, { revalidate: false });
    await api("PUT", "/api/instagram/library", patch);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Coach />
        <Checklist lib={lib} save={saveLib} />
      </div>
      <WeekPlan onCreate={onCreate} />
      <Ideas lib={lib} save={saveLib} onCreate={onCreate} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Hooks />
        <Bio />
      </div>
      <Hashtags lib={lib} save={saveLib} />
      <Watch />
    </div>
  );
}

function Coach() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  async function ask(question = q) {
    if (!question.trim()) return;
    setQ(question);
    setBusy(true);
    const res = await api<{ answer: string }>("POST", "/api/ai", { tool: "coach", input: { question } });
    setBusy(false);
    if (res) setAnswer(res.answer);
  }
  return (
    <Card title="Coach Instagram" action={<MessageSquareText className="size-4 text-violet" />}>
      <p className="text-[13.5px] text-ink-2">Il connaît tes chiffres (abonnés, formats, créneaux, meilleurs posts) et te répond avec des actions concrètes.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input className="field" placeholder="Pose ta question…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()} />
        <Button variant="primary" loading={busy} onClick={() => ask()}>
          Demander
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK.map((x) => (
          <button key={x} onClick={() => ask(x)} className="rounded-full border border-line px-2.5 py-1 text-[12.5px] text-ink-2 transition-colors hover:border-violet hover:text-violet">
            {x}
          </button>
        ))}
      </div>
      {busy && <Skeleton className="mt-4 h-24" />}
      {answer && !busy && (
        <div className="mt-4 rounded-xl bg-surface-2 p-4">
          <Markdown text={answer} />
        </div>
      )}
    </Card>
  );
}

function Checklist({ lib, save }: { lib?: Library; save: (p: Partial<Library>) => void }) {
  const now = useNow();
  const today = isoDay(new Date(now));
  const done = lib?.checklist[today] ?? [];
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const day = isoDay(new Date(now - i * 864e5));
    const n = lib?.checklist[day]?.length ?? 0;
    if (n >= 4) streak++;
    else if (i > 0) break;
  }
  const toggle = (id: string) => {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id];
    const recent = Object.fromEntries(Object.entries(lib?.checklist ?? {}).filter(([d]) => d >= isoDay(new Date(now - 120 * 864e5))));
    save({ checklist: { ...recent, [today]: next } });
  };
  return (
    <Card
      title="Routine du jour"
      action={
        <Badge tone={streak ? "honey" : "neutral"}>
          <Flame className="size-3" /> {streak} jour{streak > 1 ? "s" : ""} d&apos;affilée
        </Badge>
      }
    >
      <ul className="space-y-1">
        {CHECKLIST.map((c) => {
          const on = done.includes(c.id);
          return (
            <li key={c.id}>
              <button onClick={() => toggle(c.id)} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left text-[14px] transition-colors hover:bg-surface-2">
                <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors", on ? "border-violet bg-violet text-white" : "border-line-2")}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
                <span className={cx(on && "text-ink-3 line-through")}>{c.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[12.5px] text-ink-3">Une journée compte dans la série à partir de 4 actions faites.</p>
    </Card>
  );
}

function WeekPlan({ onCreate }: { onCreate: (d: Draft) => void }) {
  const [plan, setPlan] = useState<{ days: { day: string; time: string; format: string; pillar: string; idea: string; caption_start: string }[]; tips: string[] } | null>(null);
  const [busy, setBusy] = useState(false);
  async function build() {
    setBusy(true);
    const res = await api<typeof plan>("POST", "/api/ai", { tool: "weekplan", input: {} });
    setBusy(false);
    if (res) setPlan(res);
  }
  return (
    <Card title="Planning de la semaine" action={<Button size="sm" variant="primary" icon={<Sparkles className="size-3.5" />} loading={busy} onClick={build}>{plan ? "Refaire" : "Préparer ma semaine"}</Button>}>
      {!plan && !busy && <p className="text-[14px] text-ink-2">Claude construit 5 à 7 publications calées sur tes meilleurs créneaux et tes rubriques. Un clic pour créer chaque post.</p>}
      {busy && <Skeleton className="h-40" />}
      {plan && !busy && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-[13.5px]">
              <thead className="text-left text-ink-3">
                <tr>
                  <th className="pb-2 font-semibold">Quand</th>
                  <th className="pb-2 font-semibold">Format</th>
                  <th className="pb-2 font-semibold">Idée</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plan.days.map((d, i) => (
                  <tr key={i}>
                    <td className="py-2.5 pr-3 align-top font-semibold whitespace-nowrap">
                      {d.day} <span className="font-normal text-ink-3">{d.time}</span>
                    </td>
                    <td className="py-2.5 pr-3 align-top">
                      <Badge tone="violet">{d.format}</Badge>
                    </td>
                    <td className="py-2.5 pr-3 align-top">
                      <p className="font-semibold">{d.idea}</p>
                      <p className="text-ink-3">{d.pillar}</p>
                    </td>
                    <td className="py-2.5 text-right align-top">
                      <Button size="sm" onClick={() => onCreate({ ...emptyDraft(), caption: d.caption_start, pillar: d.pillar, format: /reel/i.test(d.format) ? "reel" : /carrou/i.test(d.format) ? "carrousel" : /story/i.test(d.format) ? "story" : "image" })}>
                        Créer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {plan.tips.length > 0 && (
            <ul className="mt-4 space-y-1.5 rounded-xl bg-violet-soft p-4 text-[13.5px] text-violet">
              {plan.tips.map((t) => (
                <li key={t} className="flex gap-2">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
}

function Ideas({ lib, save, onCreate }: { lib?: Library; save: (p: Partial<Library>) => void; onCreate: (d: Draft) => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [busy, setBusy] = useState(false);
  async function gen() {
    setBusy(true);
    const res = await api<{ ideas: Idea[] }>("POST", "/api/ai", { tool: "ideas", input: { count: 8 } });
    setBusy(false);
    if (res) setIdeas(res.ideas);
  }
  const create = (i: { title: string; hook: string; format: string }) => onCreate({ ...emptyDraft(), caption: i.hook, format: /reel/i.test(i.format) ? "reel" : /carrou/i.test(i.format) ? "carrousel" : "image" });
  const saved = lib?.ideas ?? [];
  return (
    <Card title="Idées de posts" action={<Button size="sm" icon={<Lightbulb className="size-3.5" />} loading={busy} onClick={gen}>Trouver des idées</Button>}>
      {busy && <Skeleton className="h-32" />}
      {ideas.length > 0 && !busy && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ideas.map((i) => (
            <div key={i.title} className="flex flex-col rounded-xl border border-line bg-surface-2 p-3.5">
              <Badge tone="violet" className="self-start">
                {i.format}
              </Badge>
              <p className="mt-2 font-semibold">{i.title}</p>
              <p className="mt-1 text-[13px] text-ink-2">« {i.hook} »</p>
              <p className="mt-2 flex-1 text-[12.5px] text-ink-3">{i.why}</p>
              <div className="mt-3 flex gap-1.5">
                <Button size="sm" onClick={() => create(i)}>
                  Créer
                </Button>
                <Button size="sm" variant="ghost" icon={<Bookmark className="size-3.5" />} onClick={() => save({ ideas: [{ id: slug(), title: i.title, format: i.format, hook: i.hook, outline: i.outline }, ...saved] })}>
                  Garder
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {saved.length > 0 && (
        <div className={cx(ideas.length > 0 && "mt-5 border-t border-line pt-4")}>
          <p className="mb-2 text-[13px] font-semibold text-ink-2">Idées gardées</p>
          <ul className="divide-y divide-line">
            {saved.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-2 text-[14px]">
                <button onClick={() => save({ ideas: saved.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)) })} className={cx("grid size-5 shrink-0 place-items-center rounded-md border-2", i.done ? "border-mint bg-mint text-white" : "border-line-2")} aria-label="Fait">
                  {i.done && <Check className="size-3.5" strokeWidth={3} />}
                </button>
                <span className={cx("min-w-0 flex-1 truncate", i.done && "text-ink-3 line-through")}>
                  <span className="font-semibold">{i.title}</span> <span className="text-ink-3">· {i.format}</span>
                </span>
                <Button size="sm" variant="ghost" onClick={() => create(i)}>
                  Créer
                </Button>
                <Button size="sm" variant="ghost" aria-label="Supprimer" onClick={() => save({ ideas: saved.filter((x) => x.id !== i.id) })}>
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!ideas.length && !saved.length && !busy && <p className="text-[14px] text-ink-2">Des idées adaptées à ce qui marche déjà sur ton compte, avec l&apos;accroche et le plan.</p>}
    </Card>
  );
}

function Hooks() {
  const [topic, setTopic] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Card title="Accroches pour Reels">
      <div className="flex gap-2">
        <input className="field" placeholder="Sujet du Reel" value={topic} onChange={(e) => setTopic(e.target.value)} />
        <Button
          loading={busy}
          onClick={async () => {
            setBusy(true);
            const r = await api<{ hooks: string[] }>("POST", "/api/ai", { tool: "hooks", input: { topic: topic || "la fidélité client en café" } });
            setBusy(false);
            if (r) setHooks(r.hooks);
          }}
        >
          Générer
        </Button>
      </div>
      <ul className="mt-3 space-y-1">
        {hooks.map((h) => (
          <li key={h} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[14px] hover:bg-surface-2">
            <span>{h}</span>
            <CopyButton text={h} />
          </li>
        ))}
      </ul>
      {!hooks.length && <p className="mt-3 text-[13.5px] text-ink-3">Les 2 premières secondes décident si on regarde ton Reel. Teste plusieurs accroches.</p>}
    </Card>
  );
}

function Bio() {
  const [current, setCurrent] = useState("");
  const [bios, setBios] = useState<{ text: string; why: string }[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Card title="Optimiser ma bio">
      <textarea className="field h-20" placeholder="Colle ta bio actuelle" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <Button
        className="mt-2"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          const r = await api<{ bios: { text: string; why: string }[] }>("POST", "/api/ai", { tool: "bio", input: { current } });
          setBusy(false);
          if (r) setBios(r.bios);
        }}
      >
        Proposer des bios
      </Button>
      <ul className="mt-3 space-y-2">
        {bios.map((b) => (
          <li key={b.text} className="rounded-xl border border-line p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] whitespace-pre-line">{b.text}</p>
              <CopyButton text={b.text} />
            </div>
            <p className="mt-1 text-[12.5px] text-ink-3">{b.why}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Hashtags({ lib, save }: { lib?: Library; save: (p: Partial<Library>) => void }) {
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const sets = lib?.hashtagSets ?? [];
  const add = (n: string, t: string) => save({ hashtagSets: [...sets, { id: slug(), name: n, tags: t }] });
  return (
    <Card title="Mes jeux de hashtags">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          {sets.length ? (
            <ul className="space-y-2">
              {sets.map((s) => (
                <li key={s.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{s.name}</p>
                    <div className="flex">
                      <CopyButton text={s.tags} />
                      <Button size="sm" variant="ghost" aria-label="Supprimer" onClick={() => save({ hashtagSets: sets.filter((x) => x.id !== s.id) })}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                  <p className="mt-1 text-[13px] break-words text-violet">{s.tags}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Aucun jeu enregistré">Prépare des groupes de hashtags par sujet pour les ajouter en un clic dans tes posts.</Empty>
          )}
        </div>
        <div className="space-y-4">
          <div className="space-y-2 rounded-xl bg-surface-2 p-4">
            <p className="text-[13px] font-semibold text-ink-2">Nouveau jeu</p>
            <input className="field" placeholder="Nom (ex. Cafés Lyon)" value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="field h-20" placeholder="#cafe #lyon …" value={tags} onChange={(e) => setTags(e.target.value)} />
            <Button
              size="sm"
              icon={<Plus className="size-3.5" />}
              disabled={!name || !tags}
              onClick={() => {
                add(name, tags);
                setName("");
                setTags("");
              }}
            >
              Enregistrer
            </Button>
          </div>
          <div className="space-y-2 rounded-xl bg-surface-2 p-4">
            <p className="text-[13px] font-semibold text-ink-2">Générer avec l&apos;IA</p>
            <div className="flex gap-2">
              <input className="field" placeholder="Sujet du post" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <Button
                size="sm"
                className="h-[38px]"
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  const r = await api<{ sets: { name: string; tags: string[] }[] }>("POST", "/api/ai", { tool: "hashtags", input: { topic: topic || "fidélité client restaurant" } });
                  setBusy(false);
                  if (r) save({ hashtagSets: [...sets, ...r.sets.map((s) => ({ id: slug(), name: `${s.name}${topic ? ` · ${topic}` : ""}`, tags: s.tags.map((t) => "#" + t.replace(/^#/, "")).join(" ") }))] });
                }}
              >
                Générer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface WatchRow {
  username: string;
  followers?: number;
  avgLikes?: number;
  avgComments?: number;
  postsPerWeek?: number;
  bio?: string;
  checkedAt?: string;
  history?: { date: string; followers: number }[];
  topPosts?: { caption: string; likes: number; comments: number; permalink: string }[];
}

function Watch() {
  const { data, mutate } = useApi<WatchRow[]>("/api/instagram/discover");
  const [u, setU] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Card
      title="Veille : concurrents et inspirations"
      action={
        data?.length ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<RefreshCw className="size-3.5" />}
            loading={busy === "all"}
            onClick={async () => {
              setBusy("all");
              const r = await api<WatchRow[]>("POST", "/api/instagram/discover", { refreshAll: true });
              setBusy(null);
              if (r) mutate(r, { revalidate: false });
            }}
          >
            Tout actualiser
          </Button>
        ) : undefined
      }
    >
      <p className="text-[13.5px] text-ink-2">Suis des comptes pros (concurrents, cafés inspirants, comptes de restaurateurs) : abonnés, rythme, engagement et leurs posts qui marchent.</p>
      <div className="mt-3 flex gap-2">
        <input className="field" placeholder="@nom_du_compte" value={u} onChange={(e) => setU(e.target.value)} onKeyDown={(e) => e.key === "Enter" && u && document.getElementById("watch-add")?.click()} />
        <Button
          id="watch-add"
          icon={<UserSearch className="size-4" />}
          loading={busy === "add"}
          disabled={!u.trim()}
          onClick={async () => {
            setBusy("add");
            const r = await api<WatchRow[]>("POST", "/api/instagram/discover", { username: u });
            setBusy(null);
            if (r) {
              mutate(r, { revalidate: false });
              setU("");
            }
          }}
        >
          Suivre
        </Button>
      </div>
      {data && data.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-[13.5px]">
            <thead className="text-left text-ink-3">
              <tr className="border-b border-line">
                <th className="py-2 font-semibold">Compte</th>
                <th className="py-2 text-right font-semibold">Abonnés</th>
                <th className="py-2 text-right font-semibold">Évolution</th>
                <th className="py-2 text-right font-semibold">J&apos;aime moy.</th>
                <th className="py-2 text-right font-semibold">Engagement</th>
                <th className="py-2 text-right font-semibold">Posts/sem.</th>
                <th />
              </tr>
            </thead>
            <tbody className="tnum divide-y divide-line">
              {data.map((w) => {
                const h = w.history ?? [];
                const diff = h.length > 1 ? h[h.length - 1].followers - h[0].followers : 0;
                const eng = w.followers ? ((w.avgLikes ?? 0) + (w.avgComments ?? 0)) / w.followers : 0;
                return [
                  <tr key={w.username} className="cursor-pointer hover:bg-surface-2" onClick={() => setOpen(open === w.username ? null : w.username)}>
                    <td className="py-2 font-semibold">
                      @{w.username}
                      <span className="block text-[12px] font-normal text-ink-3">{w.checkedAt ? relative(w.checkedAt) : ""}</span>
                    </td>
                    <td className="py-2 text-right">{compact(w.followers)}</td>
                    <td className={cx("py-2 text-right", diff > 0 ? "text-mint" : diff < 0 ? "text-coral" : "text-ink-3")}>{h.length > 1 ? `${diff > 0 ? "+" : ""}${num(diff)}` : "—"}</td>
                    <td className="py-2 text-right">{num(w.avgLikes)}</td>
                    <td className="py-2 text-right">{(eng * 100).toFixed(1).replace(".", ",")} %</td>
                    <td className="py-2 text-right">{w.postsPerWeek ?? "—"}</td>
                    <td className="py-2 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Ne plus suivre"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const r = await api<WatchRow[]>("DELETE", `/api/instagram/discover?username=${encodeURIComponent(w.username)}`);
                          if (r) mutate(r, { revalidate: false });
                        }}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>,
                  open === w.username && (
                    <tr key={w.username + "-top"}>
                      <td colSpan={7} className="bg-surface-2 px-3 py-3">
                        {w.bio && <p className="mb-2 text-[13px] text-ink-2">{w.bio}</p>}
                        <p className="mb-1 text-[12.5px] font-semibold text-ink-3">Leurs posts qui marchent</p>
                        <ul className="space-y-1">
                          {w.topPosts?.map((p) => (
                            <li key={p.permalink} className="text-[13px]">
                              <a href={p.permalink} target="_blank" rel="noreferrer" className="hover:text-violet">
                                <span className="tnum font-semibold">{num(p.likes)} ♥</span> {p.caption || "(sans légende)"}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
