"use client";
import { Bug, RefreshCw, Send, Sparkles, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, DemoBadge, Empty, ErrorNote, PageHeader, Segmented, Skeleton, Stat, cx } from "@/components/ui";
import { api, useApi, useNow } from "@/lib/client";
import { relative } from "@/lib/format";
import type { Review } from "@/lib/types";

interface Data {
  reviews: Review[];
  live: boolean;
  errors: string[];
}

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex" aria-label={`${n} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={cx("size-3.5", i < n ? "fill-honey-bright text-honey-bright" : "text-line-2")} />
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const { data, mutate, isLoading, isValidating } = useApi<Data>("/api/reviews");
  const [filter, setFilter] = useState<"tous" | "sans-reponse" | "negatifs" | "bugs">("sans-reponse");
  const [store, setStore] = useState<"tous" | "appstore" | "googleplay">("tous");

  const list = useMemo(
    () =>
      (data?.reviews ?? []).filter(
        (r) =>
          (store === "tous" || r.store === store) &&
          (filter === "tous" || (filter === "sans-reponse" && !r.reply) || (filter === "negatifs" && r.rating <= 3) || (filter === "bugs" && r.bug)),
      ),
    [data, filter, store],
  );
  const now = useNow();
  const all = data?.reviews ?? [];
  const avg = all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0;
  const recent = all.filter((r) => now - new Date(r.date).getTime() < 30 * 864e5);

  return (
    <div>
      <PageHeader
        title="Avis"
        subtitle={
          <>
            Les avis App Store et Google Play au même endroit, avec une réponse préparée par l&apos;IA. <DemoBadge show={!!data && !data.live} />
          </>
        }
        actions={
          <Button variant="ghost" icon={<RefreshCw className="size-4" />} loading={isValidating} onClick={() => fetch("/api/reviews?refresh=1").then(() => mutate())}>
            Actualiser
          </Button>
        }
      />
      {data?.errors.map((e) => (
        <div key={e} className="mb-3">
          <ErrorNote>{e}</ErrorNote>
        </div>
      ))}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Note moyenne" value={avg ? avg.toFixed(2).replace(".", ",") : "—"} hint={`${all.length} avis`} tone="honey" />
        <Stat label="Avis ce mois-ci" value={recent.length} />
        <Stat label="Sans réponse" value={all.filter((r) => !r.reply).length} tone="violet" />
        <Stat label="Parlent d'un bug" value={all.filter((r) => r.bug).length} tone="coral" />
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <Segmented value={filter} onChange={setFilter} size="sm" options={[{ value: "sans-reponse", label: "Sans réponse" }, { value: "negatifs", label: "3★ et moins" }, { value: "bugs", label: "Bugs" }, { value: "tous", label: "Tous" }]} />
        <Segmented value={store} onChange={setStore} size="sm" options={[{ value: "tous", label: "Tous les stores" }, { value: "appstore", label: "App Store" }, { value: "googleplay", label: "Google Play" }]} />
      </div>
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : list.length === 0 ? (
        <Card>
          <Empty icon={<Star className="size-5" />} title="Rien ici">Aucun avis ne correspond à ce filtre.</Empty>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {list.map((r) => (
            <ReviewCard key={r.id} r={r} onReplied={() => mutate()} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ r, onReplied }: { r: Review; onReplied: () => void }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  return (
    <Card>
      <div className="flex items-center gap-2">
        <Stars n={r.rating} />
        <Badge>{r.store === "appstore" ? "App Store" : "Google Play"}</Badge>
        {r.bug && (
          <Badge tone="coral">
            <Bug className="size-3" /> bug
          </Badge>
        )}
        <span className="ml-auto text-[12.5px] text-ink-3">{relative(r.date)}</span>
      </div>
      {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
      <p className="mt-1 text-[14px] text-ink-2">{r.body || <span className="text-ink-3">(note sans commentaire)</span>}</p>
      <p className="mt-1 text-[12.5px] text-ink-3">
        {r.author}
        {r.version ? ` · v${r.version}` : ""}
        {r.country ? ` · ${r.country}` : ""}
      </p>
      {r.reply ? (
        <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[13.5px]">
          <p className="mb-0.5 text-[12px] font-semibold text-ink-3">Ta réponse</p>
          {r.reply}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {text && <textarea className="field h-28" value={text} onChange={(e) => setText(e.target.value)} />}
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              icon={<Sparkles className="size-3.5" />}
              loading={busy === "ai"}
              onClick={async () => {
                setBusy("ai");
                const res = await api<{ reply: string }>("POST", "/api/ai", { tool: "reviewReply", input: { rating: r.rating, body: `${r.title}\n${r.body}`, store: r.store } });
                setBusy(null);
                if (res) setText(res.reply);
              }}
            >
              {text ? "Réécrire" : "Préparer une réponse"}
            </Button>
            {!text && (
              <Button size="sm" variant="ghost" onClick={() => setText(" ")}>
                Écrire moi-même
              </Button>
            )}
            {text.trim() && (
              <Button
                size="sm"
                variant="primary"
                icon={<Send className="size-3.5" />}
                loading={busy === "send"}
                onClick={async () => {
                  setBusy("send");
                  const res = await api("POST", "/api/reviews/reply", { id: r.id, store: r.store, text });
                  setBusy(null);
                  if (res) {
                    toast.success("Réponse publiée");
                    onReplied();
                  }
                }}
              >
                Publier
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
