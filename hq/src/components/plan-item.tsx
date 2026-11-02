"use client";
import { Check, Clapperboard, Copy, Images } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Modal, cx } from "@/components/ui";
import { longDate, promptFor, type PlanItem } from "@/lib/launch-calendar";
import { usePref } from "@/lib/prefs";

/** États gardés dans ce navigateur : prêt (contenu fait) ou publié. */
export function usePlanState() {
  const [ready, setReady] = usePref<string[]>("plan-ready", []);
  const [done, setDone] = usePref<string[]>("ig-launch-done", []);
  const toggle = (list: string[], set: (v: string[]) => void, id: string) => set(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  return {
    isReady: (id: string) => ready.includes(id),
    isDone: (id: string) => done.includes(id),
    toggleReady: (id: string) => toggle(ready, setReady, id),
    toggleDone: (id: string) => toggle(done, setDone, id),
  };
}

export function PromptButton({ item, size = "sm", label = "Copier le prompt" }: { item: PlanItem; size?: "sm" | "md"; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size={size}
      variant="primary"
      icon={ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      onClick={async () => {
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

export function KindBadge({ item }: { item: PlanItem }) {
  return item.kind === "post" ? (
    <Badge tone="honey">
      <Images className="mr-1 inline size-3" />
      {item.format}
    </Badge>
  ) : (
    <Badge tone="sky">
      <Clapperboard className="mr-1 inline size-3" />
      {item.format}
    </Badge>
  );
}

export function PlanItemModal({ item, onClose }: { item: PlanItem | null; onClose: () => void }) {
  const st = usePlanState();
  if (!item) return null;
  return (
    <Modal
      open={!!item}
      onClose={onClose}
      wide
      title={`${item.id} · ${item.titre}`}
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <PromptButton item={item} size="md" />
          <Button onClick={() => st.toggleReady(item.id)}>{st.isReady(item.id) ? "Pas encore prêt" : "Contenu prêt"}</Button>
          <Button onClick={() => st.toggleDone(item.id)}>{st.isDone(item.id) ? "Pas publié" : "Publié"}</Button>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
        <KindBadge item={item} />
        <span>
          {longDate(item.date)} · {item.heure}
        </span>
        {st.isReady(item.id) && <Badge tone="mint">Prêt</Badge>}
        {st.isDone(item.id) && <Badge tone="violet">Publié</Badge>}
      </div>
      {item.kind === "post" ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-3 text-[13.5px] text-ink-2">
            <p className="font-display text-[17px] font-semibold text-ink">« {item.post.accroche} »</p>
            <Block title="Pourquoi">{item.post.pourquoi}</Block>
            <Block title="Visuel">{item.post.visuel}</Block>
          </div>
          <div className="rounded-xl bg-surface-2 p-3.5 text-[13.5px]">
            <p className="mb-1 text-[12.5px] font-semibold text-ink-3">Légende</p>
            <p className="whitespace-pre-line">{item.post.legende}</p>
            <p className="mt-2 text-[12.5px] text-violet">{item.post.hashtags.join(" ")}</p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-[13.5px] text-ink-2">{item.story.objectif}</p>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {item.story.slides.map((s, n) => (
              <li key={n} className="rounded-xl bg-surface-2 p-3 text-[13px]">
                <p className="text-[11.5px] font-semibold text-ink-3">Story {n + 1}</p>
                <p className="mt-1 font-semibold">{s.texte}</p>
                <p className="mt-1 text-ink-2">{s.visuel}</p>
                {s.sticker && <p className="mt-1 text-[12.5px] text-violet">Sticker : {s.sticker}</p>}
              </li>
            ))}
          </ol>
        </div>
      )}
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
