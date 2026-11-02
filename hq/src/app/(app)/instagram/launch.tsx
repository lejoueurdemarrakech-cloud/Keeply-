"use client";
import { Check, ChevronDown, Flag, Megaphone, PenSquare, Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, CopyButton, cx } from "@/components/ui";
import { usePref } from "@/lib/prefs";
import { KindBadge, PlanItemModal, PromptButton } from "@/components/plan-item";
import { BRAND } from "@/lib/brand";
import { PLAN_ITEMS, longDate, type PlanItem } from "@/lib/launch-calendar";
import { INSTAGRAM_PLAN, type LaunchPost } from "@/lib/launch-plan";
import type { PostFormat } from "@/lib/types";
import type { Draft } from "./composer";
import { emptyDraft } from "./composer";

const FORMAT: Record<string, PostFormat> = { Reel: "reel", Carrousel: "carrousel", Photo: "image", Story: "story" };
const WEEKS: Record<number, string> = {
  0: "Semaine 0 · lancement, du 15 au 21 nov. (avant les pubs du 23)",
  1: "Semaine 1 · du 22 au 28 nov.",
  2: "Semaine 2 · du 29 nov. au 5 déc.",
  3: "Semaine 3 · du 6 au 12 déc.",
  4: "Semaine 4 · du 13 au 19 déc.",
  5: "Semaine 5 · du 20 au 26 déc.",
};
const TONE: Record<string, "violet" | "honey" | "mint" | "sky"> = { Reel: "violet", Carrousel: "honey", Photo: "mint", Story: "sky" };

export function Launch({ onCreate }: { onCreate: (d: Draft) => void }) {
  const plan = INSTAGRAM_PLAN;
  const [done, setDone] = usePref<string[]>("ig-launch-done", []);
  const weeks = [...new Set(plan.posts.map((p) => p.semaine))].sort((a, b) => a - b);
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);
  const prepare = (p: LaunchPost) =>
    onCreate({ ...emptyDraft(), format: FORMAT[p.format] ?? "image", caption: `${p.legende}\n\n${p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`, pillar: p.pilier });

  return (
    <div className="space-y-5">
      <Brand />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="La stratégie en clair" action={<Target className="size-4 text-violet" />}>
          <p className="font-display text-[17px] font-semibold">{plan.positionnement}</p>
          <p className="mt-2 text-[14px] text-ink-2">{plan.objectif}</p>
          <p className="mt-2 text-[14px] text-ink-2">
            <strong>Rythme :</strong> {plan.rythme}
          </p>
          <div className="mt-4 space-y-2.5">
            {plan.piliers.map((p) => (
              <div key={p.nom}>
                <div className="flex items-center justify-between text-[13.5px]">
                  <span className="font-semibold">{p.nom}</span>
                  <span className="tnum text-ink-3">{p.part_pourcent} %</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-2">
                  <div className="h-full rounded-full bg-violet" style={{ width: `${p.part_pourcent}%` }} />
                </div>
                <p className="mt-1 text-[12.5px] text-ink-3">{p.pourquoi}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card title="Avancement">
            <p className="font-display text-[28px] font-semibold tnum">
              {done.length}
              <span className="text-[16px] text-ink-3"> / {plan.posts.length} posts publiés</span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-2">
              <div className="h-full rounded-full bg-mint transition-[width] duration-500" style={{ width: `${(done.length / plan.posts.length) * 100}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-ink-3">Les visuels se font avec tes nouvelles cartes : chaque post indique quel commerce et quelle carte montrer.</p>
            <Link href="/ads?tab=lancement" className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-violet hover:underline">
              <Megaphone className="size-4" /> Voir le plan Meta Ads qui va avec
            </Link>
          </Card>
          <Card title="Profil" action={<CopyButton text={plan.bio} label="Copier la bio" />}>
            <p className="whitespace-pre-line text-[14px]">{plan.bio}</p>
            <p className="mt-2 whitespace-pre-line text-[13px] text-ink-3">{plan.lien_bio}</p>
            <details className="mt-2 text-[13px] text-ink-3">
              <summary className="cursor-pointer font-semibold">Autres bios possibles</summary>
              {plan.bio_alternatives.map((b) => (
                <p key={b} className="mt-2 whitespace-pre-line rounded-lg bg-surface-2 p-2 text-ink-2">
                  {b}
                </p>
              ))}
            </details>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {plan.highlights.map((h) => (
                <Badge key={h}>{h}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {weeks.map((w) => (
        <Card key={w} title={WEEKS[w] ?? `Semaine ${w}`} pad={false}>
          <ul className="divide-y divide-line">
            {plan.posts
              .filter((p) => p.semaine === w)
              .map((p) => (
                <PostRow key={p.id} p={p} done={done.includes(p.id)} onToggle={() => toggle(p.id)} onPrepare={() => prepare(p)} />
              ))}
          </ul>
        </Card>
      ))}

      <StoriesPlan />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Routine engagement (20 min par jour)">
          <List items={plan.regles_engagement} />
        </Card>
        <Card title="Stories récurrentes">
          <List items={plan.stories_quotidiennes} />
        </Card>
      </div>
      <Card title="Ce qu'on mesure" action={<Flag className="size-4 text-violet" />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plan.kpi.map((k) => (
            <div key={k.nom} className="rounded-xl bg-surface-2 p-3.5">
              <p className="text-[13px] text-ink-3">{k.nom}</p>
              <p className="font-display text-[18px] font-semibold">{k.cible_6_semaines}</p>
              <p className="mt-1 text-[12.5px] text-ink-2">{k.comment_lire}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PostRow({ p, done, onToggle, onPrepare }: { p: LaunchPost; done: boolean; onToggle: () => void; onPrepare: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={cx("px-5 py-4", done && "opacity-60")}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          aria-label={done ? "Marquer comme non publié" : "Marquer comme publié"}
          className={cx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border transition-colors", done ? "border-mint bg-mint text-white" : "border-line hover:border-violet")}
        >
          {done && <Check className="size-3.5" />}
        </button>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold whitespace-nowrap text-ink-3">
              {p.jour} {p.heure}
            </span>
            <Badge tone={TONE[p.format] ?? "neutral"}>{p.format}</Badge>
            {p.boost && <Badge tone="coral">À booster</Badge>}
            <span className="text-[12.5px] text-ink-3">{p.pilier}</span>
          </div>
          <p className="mt-1 font-display text-[15.5px] font-semibold">{p.titre}</p>
          <p className="text-[13.5px] text-ink-2">« {p.accroche} »</p>
        </button>
        <ChevronDown className={cx("mt-1 size-4 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </div>
      {open && (
        <div className="mt-3 ml-9 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Block title="Pourquoi ce post">{p.pourquoi}</Block>
            <Block title="Visuel">{p.visuel}</Block>
            {p.asset_existant && <Block title="Base existante">{p.asset_existant}</Block>}
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface-2 p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-ink-3">Légende</span>
                <CopyButton text={`${p.legende}\n\n${p.hashtags.join(" ")}`} />
              </div>
              <p className="whitespace-pre-line text-[13.5px]">{p.legende}</p>
              <p className="mt-2 text-[12.5px] text-violet">{p.hashtags.join(" ")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {PLAN_ITEMS.find((i) => i.kind === "post" && i.id === p.id) && <PromptButton item={PLAN_ITEMS.find((i) => i.kind === "post" && i.id === p.id)!} />}
              <Button size="sm" icon={<PenSquare className="size-3.5" />} onClick={onPrepare}>
                Programmer
              </Button>
              <span className="text-[12.5px] text-ink-3">Appel à l&apos;action : {p.cta}</span>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-3">{title}</p>
      <p className="mt-0.5 whitespace-pre-line text-[13.5px] text-ink-2">{children}</p>
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2 text-[14px] text-ink-2">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet" />
          {x}
        </li>
      ))}
    </ul>
  );
}

function Brand() {
  return (
    <Card title="Plateforme de marque" action={<Sparkles className="size-4 text-violet" />}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div>
          <p className="font-display text-[40px] leading-none font-semibold tracking-tight">{BRAND.idee}</p>
          <p className="mt-3 text-[14.5px] text-ink-2">{BRAND.promesse}</p>
          <p className="mt-3 text-[13px] text-ink-3">
            Signature de fin : <strong className="text-ink">{BRAND.signature}</strong>
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[12.5px] font-semibold text-ink-3">Le ton</p>
              <List items={BRAND.ton} />
            </div>
            <div>
              <p className="text-[12.5px] font-semibold text-ink-3">Les règles</p>
              <List items={BRAND.regles} />
            </div>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {BRAND.territoires.map((t) => (
            <div key={t.nom} className="rounded-xl bg-surface-2 p-3.5">
              <p className="text-[12px] font-semibold text-ink-3">{t.nom}</p>
              <p className="mt-1 font-display text-[15px] leading-snug font-semibold">{t.accroche}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function StoriesPlan() {
  const [open, setOpen] = useState<PlanItem | null>(null);
  const stories = PLAN_ITEMS.filter((i) => i.kind === "story");
  if (!stories.length) return null;
  const slides = stories.reduce((n, i) => n + (i.kind === "story" ? i.story.slides.length : 0), 0);
  return (
    <Card title={`Stories · ${stories.length} séquences, ${slides} stories`} pad={false}>
      <ul className="grid divide-y divide-line md:grid-cols-2 md:divide-y-0">
        {stories.map((i) => (
          <li key={i.id} className="flex items-start gap-3 border-line px-5 py-3 md:border-b">
            <button onClick={() => setOpen(i)} className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3">
                <KindBadge item={i} />
                {longDate(i.date)} · {i.heure}
              </div>
              <p className="mt-1 truncate text-[14px] font-semibold">{i.titre}</p>
            </button>
            <PromptButton item={i} label="Prompt" />
          </li>
        ))}
      </ul>
      <PlanItemModal item={open} onClose={() => setOpen(null)} />
    </Card>
  );
}
