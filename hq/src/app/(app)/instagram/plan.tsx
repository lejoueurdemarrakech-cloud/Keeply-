"use client";
import { CalendarDays, Copy, GripVertical, List } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CopyButton, Segmented, Skeleton, Toggle, cx } from "@/components/ui";
import { KindBadge, PlanItemModal, PromptButton, STATUS_LABEL, STATUS_TONE, usePlan } from "@/components/plan-item";
import { isoLocal, longDate, promptFor, type LivePlanItem } from "@/lib/launch-calendar";
import { BRAND, DAILY_STORIES, ENGAGEMENT, HIGHLIGHT_COVERS, HIGHLIGHTS, PROFILES, STRATEGY, type Account } from "@/lib/plan-v7";

type Filter = "tout" | Account;
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const CHIP: Record<Account, string> = {
  fr: "border-violet/30 bg-violet/10 text-ink",
  en: "border-sky/40 bg-sky/10 text-ink",
  tiktok: "border-coral/30 bg-coral/10 text-ink",
};

type Section = "calendrier" | "profil" | "marque" | "routine";

const PILIER_CHIP: Record<string, string> = {
  Produit: "border-violet/30 bg-violet/10 text-ink",
  Métier: "border-sky/40 bg-sky/10 text-ink",
  Coulisses: "border-honey/40 bg-honey/10 text-ink",
};
const PILIER_DOT: Record<string, string> = { Produit: "bg-violet", Métier: "bg-sky", Coulisses: "bg-honey" };

export function PlanV7() {
  const plan = usePlan();
  const [filter, setFilter] = useState<Filter>("fr");
  const [section, setSection] = useState<Section>("calendrier");
  const [view, setView] = useState<"calendrier" | "liste">("calendrier");
  const [stories, setStories] = useState(true);
  const [reposts, setReposts] = useState(false);
  const [open, setOpen] = useState<LivePlanItem | null>(null);
  const [over, setOver] = useState<string | null>(null);

  const items = plan.items.filter((i) => (filter === "tout" || i.account === filter) && (stories || i.kind === "post") && (reposts || !i.repostOf));
  const posts = plan.items.filter((i) => i.kind === "post" && (filter === "tout" || i.account === filter));
  const published = posts.filter((i) => i.status === "publie").length;
  const ready = posts.filter((i) => i.status === "pret").length;
  const today = isoLocal(new Date());
  const next = plan.items.filter((i) => (filter === "tout" || i.account === filter) && !i.repostOf && i.status === "afaire" && i.date >= today).slice(0, 4);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          value={section}
          onChange={setSection}
          options={[
            { value: "calendrier", label: "Calendrier" },
            { value: "profil", label: "Profil" },
            { value: "marque", label: "Marque" },
            { value: "routine", label: "Routine" },
          ]}
        />
        {section !== "marque" && (
          <Segmented
            size="sm"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "fr", label: "Insta FR" },
              { value: "en", label: "Insta EN" },
              { value: "tiktok", label: "TikTok" },
              ...(section === "calendrier" ? [{ value: "tout" as const, label: "Tout" }] : []),
            ]}
          />
        )}
        <div className="ml-auto flex items-center gap-3 text-[13px] text-ink-3 tnum">
          <span>{published} publiés</span>
          <span className="text-line">·</span>
          <span>{ready} prêts</span>
          <span className="text-line">·</span>
          <span>{posts.length} posts</span>
        </div>
      </div>

      {section === "calendrier" && (
        <>
          {next.length > 0 && (
            <Card title="À préparer ensuite" action={<CopyAll items={next} />}>
              <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {next.map((i) => (
                  <li key={i.id} className="flex flex-col rounded-xl bg-surface-2 p-3.5">
                    <p className="text-[12px] font-semibold text-ink-3 first-letter:uppercase">
                      {longDate(i.date)} · {i.heure}
                    </p>
                    <button onClick={() => setOpen(i)} className="mt-1 text-left text-[14px] font-semibold leading-snug hover:text-violet">
                      {i.titre}
                    </button>
                    <p className="mt-1 line-clamp-2 text-[12.5px] text-ink-2">« {i.accroche} »</p>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <KindBadge item={i} />
                      <span className="ml-auto">
                        <PromptButton item={i} label="Prompt" />
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <div className="flex flex-wrap items-center gap-4">
            <Segmented
              size="sm"
              value={view}
              onChange={setView}
              options={[
                { value: "calendrier", label: <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" /> Mois</span> },
                { value: "liste", label: <span className="inline-flex items-center gap-1"><List className="size-3.5" /> Liste</span> },
              ]}
            />
            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2">
              <Toggle checked={stories} onChange={setStories} label="Stories" /> Stories
            </label>
            <label className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-2">
              <Toggle checked={reposts} onChange={setReposts} label="Reposts en story" /> Reposts en story
            </label>
            <span className="ml-auto flex items-center gap-3 text-[12.5px] text-ink-3">
              {filter === "tout" ? (
                <>
                  <Legend dot="bg-violet" label="FR" />
                  <Legend dot="bg-sky" label="EN" />
                  <Legend dot="bg-coral" label="TikTok" />
                </>
              ) : (
                <>
                  <Legend dot="bg-violet" label="Produit" />
                  <Legend dot="bg-sky" label="Métier" />
                  <Legend dot="bg-honey" label="Coulisses" />
                </>
              )}
              <span>· pointillés = story</span>
            </span>
          </div>
          {!plan.loaded ? (
            <Skeleton className="h-96" />
          ) : view === "calendrier" ? (
            <Calendar
              items={items}
              byPilier={filter !== "tout"}
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
        </>
      )}

      {section === "profil" && <ProfileView account={filter === "tout" ? "fr" : filter} />}
      {section === "marque" && <BrandView />}
      {section === "routine" && <RoutineView en={filter === "en"} />}

      <PlanItemModal item={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cx("size-2 rounded-full", dot)} />
      {label}
    </span>
  );
}

/* ---------------------------------------------------------------- Profil */

function ProfileView({ account }: { account: Account }) {
  const p = PROFILES[account];
  const hl = account === "tiktok" ? null : HIGHLIGHTS[account];
  const bioLen = [...p.bio].length;
  return (
    <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="mx-auto w-full max-w-[360px] rounded-[44px] border border-line bg-surface p-3 shadow-[0_24px_60px_-30px_rgba(20,10,60,0.35)]">
          <div className="overflow-hidden rounded-[34px] bg-white px-4 pt-5 pb-6 text-[#0f0f14]">
            <p className="text-center text-[15px] font-semibold">{p.username}</p>
            <div className="mt-4 flex items-center gap-5">
              <div className="grid size-[78px] shrink-0 place-items-center rounded-full bg-violet text-[30px] font-bold text-white">K</div>
              <div className="grid flex-1 grid-cols-3 text-center">
                {["publications", "followers", "suivi(e)s"].map((l) => (
                  <div key={l}>
                    <p className="text-[15px] font-semibold">0</p>
                    <p className="text-[11.5px] text-[#555]">{l}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[13.5px] font-semibold">{p.nom}</p>
            <p className="text-[12.5px] text-[#737373]">{p.categorie}</p>
            <p className="mt-0.5 whitespace-pre-line text-[13.5px] leading-snug">{p.bio}</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-[#00376b]">🔗 {p.lien.replace("https://", "").split("?")[0]}</p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {["Contacter", "WhatsApp"].map((b) => (
                <span key={b} className="rounded-lg bg-[#efefef] py-1.5 text-center text-[12.5px] font-semibold">
                  {b}
                </span>
              ))}
            </div>
            {hl && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {hl.map((h) => (
                  <div key={h.nom} className="flex w-[58px] shrink-0 flex-col items-center gap-1">
                    <span className="grid size-[56px] place-items-center rounded-full border border-[#dbdbdb] bg-[#faf9f7]">
                      <span className="size-5 rounded-full border-2 border-violet" />
                    </span>
                    <span className="w-full truncate text-center text-[11px]">{h.nom}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-0.5">
              {Array.from({ length: 6 }).map((_, n) => (
                <div key={n} className="aspect-[4/5] bg-[#f3f1ee]" />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[12.5px] text-ink-3">Aperçu. Les vraies couvertures arrivent avec les posts.</p>
      </div>

      <div className="space-y-5">
        <Card title="À copier dans Instagram">
          <dl className="divide-y divide-line">
            <Field label="Nom d’utilisateur" value={`@${p.username}`} copy={p.username} />
            <Field label="Nom affiché (c'est ce qu'Instagram cherche)" value={p.nom} copy={p.nom} hint={`${[...p.nom].length} / 30`} />
            <Field label="Bio" value={p.bio} copy={p.bio} hint={`${bioLen} / ${account === "tiktok" ? 80 : 150}`} multiline />
            <Field label="Lien" value={p.lien} copy={p.lien} hint={p.lienTexte} />
            <Field label="Photo de profil" value={p.photo} />
            <Field label="Boutons et catégorie" value={p.boutons} />
            <Field label="Posts épinglés" value={p.epingles} />
          </dl>
        </Card>
        {hl ? (
          <Card title="Stories à la une" action={<span className="text-[12.5px] text-ink-3">{hl.length} au total, une par question</span>}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {hl.map((h) => (
                <li key={h.nom} className="rounded-xl bg-surface-2 p-3.5">
                  <p className="text-[14px] font-semibold">{h.nom}</p>
                  <p className="text-[12.5px] text-ink-3">« {h.question} »</p>
                  <ul className="mt-2 space-y-1 text-[13px] text-ink-2">
                    {h.contenu.map((c) => (
                      <li key={c} className="flex gap-2">
                        <span className="mt-[7px] size-1 shrink-0 rounded-full bg-ink-3" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12.5px] text-ink-3">{HIGHLIGHT_COVERS}</p>
          </Card>
        ) : (
          <Card title="TikTok">
            <p className="text-[13.5px] text-ink-2">Chaque Reel FR repart sur TikTok le même jour à 19 h, en natif (sans le logo Instagram). Pas de pub TikTok au début : le minimum dépasse le budget.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, copy, hint, multiline }: { label: string; value: string; copy?: string; hint?: string; multiline?: boolean }) {
  return (
    <div className="flex gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <dt className="text-[12.5px] font-semibold text-ink-3">{label}</dt>
        <dd className={cx("mt-0.5 text-[14px] text-ink", multiline && "whitespace-pre-line")}>{value}</dd>
        {hint && <p className="mt-1 text-[12.5px] text-ink-3 tnum">{hint}</p>}
      </div>
      {copy && (
        <div className="shrink-0 pt-1">
          <CopyButton text={copy} />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Marque */

function BrandView() {
  return (
    <div className="space-y-5">
      <Card>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-end">
          <div>
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-violet">L’idée</p>
            <p className="mt-2 font-display text-[40px] font-semibold leading-[1.05] tracking-tight">{BRAND.idee}</p>
            <p className="mt-1 text-[15px] text-ink-3">{BRAND.ideeEn}</p>
            <p className="mt-4 max-w-[60ch] text-[14.5px] text-ink-2">{BRAND.pourquoi}</p>
          </div>
          <dl className="space-y-3 text-[14px]">
            <div>
              <dt className="text-[12.5px] font-semibold text-ink-3">La promesse (bio, couvertures, pubs)</dt>
              <dd className="mt-0.5 font-semibold">{BRAND.promesse}</dd>
              <dd className="text-ink-3">{BRAND.promesseEn}</dd>
            </div>
            <div>
              <dt className="text-[12.5px] font-semibold text-ink-3">La signature (fin des films)</dt>
              <dd className="mt-0.5 font-semibold">{BRAND.signature}</dd>
              <dd className="text-ink-3">{BRAND.signatureEn}</dd>
            </div>
          </dl>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        {BRAND.piliers.map((p) => (
          <Card key={p.nom}>
            <p className="flex items-center gap-2 text-[14px] font-semibold">
              <span className={cx("size-2.5 rounded-full", PILIER_DOT[p.nom])} />
              {p.nom}
              <span className="ml-auto text-[13px] font-normal text-ink-3 tnum">{p.part}</span>
            </p>
            <p className="mt-2 text-[13.5px] text-ink-2">{p.texte}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="On dit">
          <Lines items={BRAND.onDit} />
        </Card>
        <Card title="On ne dit jamais">
          <Lines items={BRAND.onDitPas} muted />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <Card title="Le style visuel">
          <Lines items={BRAND.visuel} />
          <p className="mt-4 border-t border-line pt-3 text-[13.5px] text-ink-2">{BRAND.grille}</p>
        </Card>
        <Card title="Rythme, budget, objectifs">
          <dl className="space-y-3 text-[13.5px]">
            {(
              [
                ["Le rythme", STRATEGY.rythme],
                ["Les boosts", STRATEGY.boost],
                ["Les objectifs", STRATEGY.objectifs],
                ["Pays et langues", BRAND.pays],
              ] as const
            ).map(([t, v]) => (
              <div key={t}>
                <dt className="text-[12.5px] font-semibold text-ink-3">{t}</dt>
                <dd className="mt-0.5 text-ink-2">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Lines({ items, muted }: { items: string[]; muted?: boolean }) {
  return (
    <ul className="space-y-2 text-[13.5px]">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <span className={cx("mt-[7px] size-1.5 shrink-0 rounded-full", muted ? "bg-coral" : "bg-violet")} />
          <span className="text-ink-2">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------- Routine */

function RoutineView({ en }: { en: boolean }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card title="Les stories de chaque jour">
        <ul className="divide-y divide-line text-[13.5px]">
          {DAILY_STORIES.map((d) => (
            <li key={d.jour} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
              <span className="w-20 shrink-0 font-semibold">{d.jour}</span>
              <span className="text-ink-2">{en ? d.en : d.fr}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-3">En plus : chaque post repart en story 2 h après sa sortie, et les séquences datées sont dans le calendrier.</p>
      </Card>
      <Card title="20 minutes d’engagement, avant de publier">
        <Lines items={ENGAGEMENT} />
      </Card>
    </div>
  );
}

function Calendar({ items, byPilier, over, setOver, onOpen, onDrop }: { items: LivePlanItem[]; byPilier: boolean; over: string | null; setOver: (d: string | null) => void; onOpen: (i: LivePlanItem) => void; onDrop: (id: string, date: string) => void }) {
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
    <Card pad={false} title="Glisse un post sur un autre jour pour le déplacer">
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
                      byPilier && i.pilier ? PILIER_CHIP[i.pilier] : byPilier && i.kind === "story" ? "border-line bg-surface-2 text-ink" : CHIP[i.account],
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
      <p className="px-5 py-3 text-[12.5px] text-ink-3">Clique sur un post pour le détail, l’heure, le statut et le prompt à donner à Claude.</p>
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
      Copier ces prompts
    </Button>
  );
}
