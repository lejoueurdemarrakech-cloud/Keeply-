"use client";
import { Aperture, Check, ClipboardCheck, Mail, Megaphone, Star, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, refresh, useApi } from "@/lib/client";
import { relative } from "@/lib/format";

type Kind = "mail" | "avis" | "instagram" | "ads" | "note";
interface Item {
  id: string;
  kind: Kind;
  title: string;
  body: string;
  subject?: string;
  context?: string;
  createdAt: string;
  status: "a-valider" | "valide" | "refuse" | "echec";
  error?: string;
}

const KINDS: Record<Kind, { label: string; icon: React.ReactNode; action: string }> = {
  mail: { label: "Mails", icon: <Mail className="size-4" />, action: "Envoyer" },
  avis: { label: "Avis", icon: <Star className="size-4" />, action: "Publier la réponse" },
  instagram: { label: "Instagram", icon: <Aperture className="size-4" />, action: "Programmer" },
  ads: { label: "Meta Ads", icon: <Megaphone className="size-4" />, action: "C'est noté" },
  note: { label: "Notes", icon: <ClipboardCheck className="size-4" />, action: "OK" },
};

function ReviewCard({ item, onDone }: { item: Item; onDone: () => void }) {
  const [body, setBody] = useState(item.body);
  const [subject, setSubject] = useState(item.subject ?? "");
  const [busy, setBusy] = useState<"valider" | "refuser" | null>(null);
  const k = KINDS[item.kind];

  async function decide(decision: "valider" | "refuser") {
    setBusy(decision);
    const r = await api<{ note?: string }>("POST", "/api/review", { id: item.id, decision, body, subject: item.subject !== undefined ? subject : undefined });
    setBusy(null);
    if (r) toast.success(r.note ?? (decision === "valider" ? "Validé" : "Écarté"));
    onDone();
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-violet-soft text-violet">{k.icon}</span>
        <p className="min-w-0 flex-1 font-semibold">{item.title}</p>
        <span className="text-[12.5px] text-ink-3">{relative(item.createdAt)}</span>
      </div>
      {item.context && <p className="mb-3 rounded-xl bg-bg-2 px-3.5 py-2.5 text-[13px] whitespace-pre-line text-ink-2">{item.context}</p>}
      {item.subject !== undefined && <input className="field mb-2" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Objet" />}
      <textarea className="field min-h-36 text-[14px] leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Texte proposé" />
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" icon={<X className="size-4" />} loading={busy === "refuser"} onClick={() => decide("refuser")}>
          Écarter
        </Button>
        <Button variant="primary" icon={<Check className="size-4" />} loading={busy === "valider"} onClick={() => decide("valider")}>
          {k.action}
        </Button>
      </div>
    </Card>
  );
}

export default function ValiderPage() {
  const { data, mutate, isLoading } = useApi<{ items: Item[] }>("/api/review");
  const [tab, setTab] = useState<Kind | "tout">("tout");
  const pending = useMemo(() => (data?.items ?? []).filter((x) => x.status === "a-valider"), [data]);
  const done = useMemo(() => (data?.items ?? []).filter((x) => x.status !== "a-valider").slice(0, 20), [data]);
  const shown = tab === "tout" ? pending : pending.filter((x) => x.kind === tab);
  const counts = (Object.keys(KINDS) as Kind[]).map((k) => [k, pending.filter((x) => x.kind === k).length] as const).filter(([, n]) => n);

  const after = () => {
    mutate();
    refresh("/api/review?count=1");
  };

  return (
    <div>
      <PageHeader title="À valider" subtitle="Ce que Claude a préparé pendant ses tournées. Relis, corrige si besoin, valide : HQ envoie, publie ou programme. Rien ne part sans ton clic." />

      <div className="mb-4 flex flex-wrap gap-1">
        {[["tout", pending.length] as const, ...counts].map(([k, n]) => (
          <button key={k} onClick={() => setTab(k)} className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold", tab === k ? "bg-violet text-white" : "bg-surface text-ink-2 ring-1 ring-line hover:text-ink")}>
            {k === "tout" ? "Tout" : KINDS[k].label} <span className="tnum opacity-70">{n}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      ) : shown.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((it) => (
            <ReviewCard key={it.id} item={it} onDone={after} />
          ))}
        </div>
      ) : (
        <Card>
          <Empty icon={<ClipboardCheck />} title="Rien à valider">
            La prochaine tournée de Claude remplira cette page. Tu peux en lancer une dans Crédits Claude.
          </Empty>
        </Card>
      )}

      {done.length > 0 && (
        <Card title="Derniers traités" className="mt-6" pad={false}>
          <ul className="divide-y divide-line">
            {done.map((x) => (
              <li key={x.id} className="flex items-center gap-3 px-5 py-2.5 text-[13.5px]">
                <span className="text-ink-3">{KINDS[x.kind].icon}</span>
                <span className="min-w-0 flex-1 truncate">{x.title}</span>
                {x.status === "valide" && <Badge tone="mint">validé</Badge>}
                {x.status === "refuse" && <Badge>écarté</Badge>}
                {x.status === "echec" && <Badge tone="coral">{x.error ?? "échec"}</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
