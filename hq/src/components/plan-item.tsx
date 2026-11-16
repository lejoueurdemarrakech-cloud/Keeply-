"use client";
import { Check, Clapperboard, Copy, Images, Music2, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Field, Modal, Segmented, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { applyOverrides, longDate, promptFor, type LivePlanItem, type PlanOverride, type PlanOverrides, type PlanStatus } from "@/lib/launch-calendar";
import { ACCOUNT_SHORT } from "@/lib/plan-v7";

/** Le plan v7 avec les déplacements et statuts gardés sur le serveur (mêmes données dans l'app Mac et le navigateur). */
export function usePlan() {
  const { data, mutate } = useApi<PlanOverrides>("/api/instagram/plan");
  const items = useMemo(() => applyOverrides(data ?? {}), [data]);
  async function patch(id: string, p: PlanOverride) {
    const next = { ...(data ?? {}), [id]: { ...(data?.[id] ?? {}), ...p } };
    mutate(next, false); // affichage immédiat, le serveur confirme ensuite
    const res = await api<PlanOverrides>("PATCH", "/api/instagram/plan", { id, ...p });
    mutate(res ?? undefined);
  }
  async function reset(id: string) {
    const res = await api<PlanOverrides>("DELETE", `/api/instagram/plan?id=${encodeURIComponent(id)}`);
    mutate(res ?? undefined);
  }
  return { items, loaded: !!data, patch, reset, move: (id: string, date: string) => patch(id, { date }), setStatus: (id: string, status: PlanStatus) => patch(id, { status }) };
}

export const STATUS_LABEL: Record<PlanStatus, string> = { afaire: "À faire", pret: "Prêt", publie: "Publié" };
export const STATUS_TONE: Record<PlanStatus, "neutral" | "mint" | "violet"> = { afaire: "neutral", pret: "mint", publie: "violet" };

export function PromptButton({ item, size = "sm", label = "Copier le prompt" }: { item: LivePlanItem; size?: "sm" | "md"; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size={size}
      variant="primary"
      icon={ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(promptFor(item));
        setOk(true);
        toast.success("Prompt copié : colle-le dans Claude Code.");
        setTimeout(() => setOk(false), 2000);
      }}
    >
      {ok ? "Copié" : label}
    </Button>
  );
}

export function KindBadge({ item }: { item: LivePlanItem }) {
  const icon = item.account === "tiktok" ? <Music2 className="mr-1 inline size-3" /> : item.kind === "post" ? <Images className="mr-1 inline size-3" /> : <Clapperboard className="mr-1 inline size-3" />;
  return (
    <Badge tone={item.account === "tiktok" ? "coral" : item.kind === "post" ? "honey" : "sky"}>
      {icon}
      {ACCOUNT_SHORT[item.account]} · {item.format}
    </Badge>
  );
}

export function PlanItemModal({ item, onClose }: { item: LivePlanItem | null; onClose: () => void }) {
  const plan = usePlan();
  const live = item ? plan.items.find((i) => i.id === item.id) ?? item : null;
  if (!live) return null;
  return <ItemModal key={live.id} live={live} plan={plan} onClose={onClose} />;
}

function ItemModal({ live, plan, onClose }: { live: LivePlanItem; plan: ReturnType<typeof usePlan>; onClose: () => void }) {
  const [date, setDate] = useState(live.date);
  const [heure, setHeure] = useState(live.heure);
  const [note, setNote] = useState(live.note ?? "");
  const dirty = date !== live.date || heure !== live.heure || note !== (live.note ?? "");
  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`${live.id} · ${live.titre}`}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <PromptButton item={live} size="md" />
          <Segmented size="sm" value={live.status} onChange={(s) => plan.setStatus(live.id, s)} options={(["afaire", "pret", "publie"] as const).map((s) => ({ value: s, label: STATUS_LABEL[s] }))} />
          {dirty && (
            <Button variant="secondary" onClick={() => plan.patch(live.id, { date, heure, note }).then(() => toast.success("Enregistré."))}>
              Enregistrer
            </Button>
          )}
          {live.moved && (
            <Button variant="ghost" icon={<RotateCcw className="size-3.5" />} onClick={() => plan.reset(live.id)}>
              Remettre à sa date
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
        <KindBadge item={live} />
        <Badge tone={STATUS_TONE[live.status]}>{STATUS_LABEL[live.status]}</Badge>
        <span>{live.type}</span>
        {live.hook && <span>· accroche {live.hook}</span>}
        {live.boost && <Badge tone="violet">À booster si ça marche</Badge>}
        {live.moved && <Badge tone="honey">Déplacé</Badge>}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[160px_120px_1fr]">
        <Field label="Date">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[14px]" />
        </Field>
        <Field label="Heure (Paris)">
          <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[14px]" />
        </Field>
        <Field label="Note perso">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. filmer chez Tacos Yasmeen" className="h-10 w-full rounded-xl border border-line bg-surface px-3 text-[14px]" />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3 text-[13.5px] text-ink-2">
          <p className="font-display text-[17px] font-semibold text-ink">« {live.accroche} »</p>
          <Block title={live.kind === "story" && !live.repostOf ? "Objectif" : "À fabriquer"}>{live.contenu}</Block>
          {live.cta && <Block title="Appel à l'action">{live.cta}</Block>}
        </div>
        {live.slides?.length ? (
          <ol className="grid gap-2">
            {live.slides.map((s, n) => (
              <li key={n} className="rounded-xl bg-surface-2 p-3 text-[13px]">
                <p className="text-[11.5px] font-semibold text-ink-3">Story {n + 1}</p>
                <p className="mt-1 font-semibold">{s.texte}</p>
                <p className="mt-1 text-ink-2">{s.visuel}</p>
                {s.sticker && <p className="mt-1 text-[12.5px] text-violet">Sticker : {s.sticker}</p>}
              </li>
            ))}
          </ol>
        ) : live.legende ? (
          <div className="rounded-xl bg-surface-2 p-3.5 text-[13.5px]">
            <p className="mb-1 text-[12.5px] font-semibold text-ink-3">Légende</p>
            <p className="whitespace-pre-line">{live.legende}</p>
            {live.hashtags && <p className="mt-2 text-[12.5px] text-violet">{live.hashtags.join(" ")}</p>}
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-[12.5px] text-ink-3">
        Prévu le {longDate(live.date)} à {live.heure}. Le prompt copié contient tout ce qu’il faut : colle-le dans Claude Code.
      </p>
    </Modal>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-3">{title}</p>
      <p className={cx("mt-0.5 whitespace-pre-line")}>{children}</p>
    </div>
  );
}
