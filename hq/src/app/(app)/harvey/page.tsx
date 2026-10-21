"use client";
import { Bot, Check, ExternalLink, Pause, Play, Radar, Square, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { relative } from "@/lib/format";

interface OutboxItem {
  id: string;
  to_email: string;
  subject: string;
  body: string;
  step: number;
  status: string;
  sent_at?: string;
  error?: string;
  context?: { company?: string; website?: string; contact?: string; score?: number; notes?: string; signals?: Record<string, string> };
}
interface Snapshot {
  at: string;
  status?: { running: boolean; started_at?: string | null };
  stats?: {
    prospects?: { total: number; by_status: Record<string, number> };
    campaigns?: { total: number };
    conversations?: { total: number; by_status: Record<string, number> };
    claude_calls_today?: number;
  };
  outbox?: { paused?: string | null; pending?: OutboxItem[]; approved?: OutboxItem[]; sent?: OutboxItem[]; failed?: OutboxItem[] };
  prospects?: { id: string; first_name?: string; last_name?: string; email?: string; company?: string; status?: string; score?: number; personalization_notes?: string }[];
  setup?: { checks?: { id: string; label: string; done: boolean; required: boolean; help?: string }[] };
  error?: string;
}
interface Data {
  online: boolean;
  bridge: { at: string; harvey?: { dashboard: boolean; running: boolean } } | null;
  snapshot: Snapshot | null;
}

function Draft({ item, onAct }: { item: OutboxItem; onAct: () => void }) {
  const [subject, setSubject] = useState(item.subject);
  const [body, setBody] = useState(item.body);
  const [busy, setBusy] = useState<string | null>(null);
  const edited = subject !== item.subject || body !== item.body;

  async function act(action: "approve" | "reject") {
    setBusy(action);
    if (action === "approve" && edited) {
      const ok = await api("POST", "/api/harvey", { action: "edit", id: item.id, subject, body });
      if (!ok) return setBusy(null);
    }
    const r = await api("POST", "/api/harvey", { action, id: item.id });
    setBusy(null);
    if (r) toast.success(action === "approve" ? "Approuvé : Harvey l'enverra dans son créneau" : "Écarté");
    onAct();
  }

  const c = item.context ?? {};
  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 font-semibold">{c.company || item.to_email}</p>
        {c.score != null && <Badge tone={c.score >= 8 ? "coral" : c.score >= 5 ? "honey" : "sky"}>intérêt {c.score}/10</Badge>}
        <Badge>mail {item.step}</Badge>
      </div>
      <p className="mb-2 text-[12.5px] text-ink-3">
        {item.to_email}
        {c.website && (
          <a className="ml-2 inline-flex items-center gap-1 text-violet" href={c.website} target="_blank" rel="noreferrer">
            site <ExternalLink className="size-3" />
          </a>
        )}
      </p>
      {c.signals && Object.keys(c.signals).length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {Object.entries(c.signals).map(([k, v]) => (
            <Badge key={k} tone="violet">
              {k}
              {v && v !== "yes" ? ` : ${v}` : ""}
            </Badge>
          ))}
        </div>
      )}
      <input className="field mb-2" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Objet" />
      <textarea className="field min-h-40 text-[14px] leading-relaxed" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Message" />
      <div className="mt-3 flex justify-end gap-2">
        <Button variant="ghost" icon={<X className="size-4" />} loading={busy === "reject"} onClick={() => act("reject")}>
          Écarter
        </Button>
        <Button variant="primary" icon={<Check className="size-4" />} loading={busy === "approve"} onClick={() => act("approve")}>
          {edited ? "Enregistrer et approuver" : "Approuver"}
        </Button>
      </div>
    </Card>
  );
}

export default function HarveyPage() {
  const { data, mutate, isLoading } = useApi<Data>("/api/harvey", { refreshInterval: 60_000 });
  const [busy, setBusy] = useState<string | null>(null);
  const [cities, setCities] = useState("");

  async function run(action: string, extra: Record<string, unknown> = {}, ok = "C'est parti") {
    setBusy(action);
    const r = await api<{ queued?: boolean; result?: { error?: string; estimated_cost?: number; query_count?: number; free?: boolean; message?: string } }>("POST", "/api/harvey", { action, ...extra });
    setBusy(null);
    if (!r) return;
    if (r.queued) toast("Demande transmise au Mac, elle sera faite au prochain passage du pont.");
    else if (r.result?.error) toast.error(r.result.error);
    else if (action === "discover-estimate" && r.result) toast.success(`${r.result.query_count} recherches · ${r.result.free ? "gratuit (OpenStreetMap)" : `environ ${r.result.estimated_cost} $`}`);
    else toast.success(r.result?.message ?? ok);
    mutate();
  }

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Harvey" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const s = data.snapshot;
  const running = s?.status?.running ?? data.bridge?.harvey?.running ?? false;
  const pending = s?.outbox?.pending ?? [];
  const p = s?.stats?.prospects;
  const todo = (s?.setup?.checks ?? []).filter((c) => c.required && !c.done);

  return (
    <div>
      <PageHeader
        title="Harvey"
        subtitle="L'agent de prospection qui tourne sur ton Mac avec ton abonnement Claude : il trouve des commerces, lit leurs sites, repère les signaux d'intérêt et écrit des mails qu'il n'envoie qu'après ton accord."
        actions={
          <>
            <a href="http://127.0.0.1:5560" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-ink-2 hover:bg-bg-2 hover:text-ink">
              Tableau complet <ExternalLink className="size-4" />
            </a>
            {running ? (
              <Button icon={<Square className="size-4" />} loading={busy === "stop"} disabled={!data.online} onClick={() => run("stop", {}, "Harvey arrêté")}>
                Arrêter
              </Button>
            ) : (
              <Button variant="primary" icon={<Play className="size-4" />} loading={busy === "start"} disabled={!data.online} onClick={() => run("start", {}, "Harvey démarré")}>
                Démarrer
              </Button>
            )}
          </>
        }
      />

      {!data.online && (
        <div className="mb-4 rounded-2xl border border-coral/30 bg-coral-soft px-4 py-3 text-[13.5px] text-coral">
          Le Mac est éteint ou le pont est arrêté. Les infos ci-dessous datent {s ? relative(s.at) : "de jamais"}.
        </div>
      )}
      {s?.error && <div className="mb-4 rounded-2xl border border-honey/30 bg-honey-soft px-4 py-3 text-[13.5px] text-honey">Harvey : {s.error}</div>}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { l: "État", v: running ? "En marche" : "À l'arrêt", tone: running ? "text-mint" : "text-ink-2" },
          { l: "Prospects trouvés", v: p?.total ?? 0 },
          { l: "Mails à approuver", v: pending.length },
          { l: "Appels Claude aujourd'hui", v: s?.stats?.claude_calls_today ?? 0 },
        ].map((x) => (
          <div key={x.l} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <p className="text-[13px] text-ink-2">{x.l}</p>
            <p className={cx("font-display tnum mt-1 text-[24px] leading-none font-bold", (x as { tone?: string }).tone)}>{x.v}</p>
          </div>
        ))}
      </div>

      {todo.length > 0 && (
        <Card title="Pour que Harvey puisse envoyer" className="mb-5">
          <ul className="space-y-2 text-[14px]">
            {todo.map((c) => (
              <li key={c.id} className="flex gap-2">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-honey" />
                <span>
                  <strong>{c.label}</strong>
                  {c.help ? <span className="text-ink-2"> · {c.help}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Trouver des commerces" className="mb-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input className="field flex-1" placeholder="Villes, séparées par des virgules (ex. Lyon, Villeurbanne)" value={cities} onChange={(e) => setCities(e.target.value)} />
          <Button loading={busy === "discover-estimate"} disabled={!data.online || !cities.trim()} onClick={() => run("discover-estimate", { cities: cities.split(",").map((c) => c.trim()).filter(Boolean) })}>
            Estimer
          </Button>
          <Button variant="primary" icon={<Radar className="size-4" />} loading={busy === "discover-run"} disabled={!data.online || !cities.trim()} onClick={() => run("discover-run", { cities: cities.split(",").map((c) => c.trim()).filter(Boolean) }, "Recherche lancée sur le Mac")}>
            Lancer (gratuit)
          </Button>
        </div>
        <p className="mt-2 text-[12.5px] text-ink-3">
          Source OpenStreetMap, gratuite. Ensuite Harvey lit les sites (gratuit, sans Claude) et ne dépense des crédits que pour écrire les mails des commerces qui ont de vrais signaux.
          <button className="ml-1 font-semibold text-violet" disabled={!data.online} onClick={() => run("profile", {}, "Lecture des sites lancée")}>
            Lire les sites maintenant
          </button>
        </p>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-[17px] font-semibold">Mails à approuver</h2>
        <div className="flex gap-2">
          {s?.outbox?.paused ? (
            <Button size="sm" icon={<Play className="size-3.5" />} disabled={!data.online} onClick={() => run("sending", { state: "resume" }, "Envois repris")}>
              Reprendre les envois
            </Button>
          ) : (
            <Button size="sm" variant="ghost" icon={<Pause className="size-3.5" />} disabled={!data.online} onClick={() => run("sending", { state: "pause" }, "Envois en pause")}>
              Tout mettre en pause
            </Button>
          )}
          {pending.length > 1 && (
            <Button size="sm" variant="primary" disabled={!data.online} loading={busy === "approve-all"} onClick={() => confirm(`Approuver les ${pending.length} mails ?`) && run("approve-all", {}, "Tous approuvés")}>
              Tout approuver
            </Button>
          )}
        </div>
      </div>
      {pending.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {pending.map((it) => (
            <Draft key={it.id} item={it} onAct={mutate} />
          ))}
        </div>
      ) : (
        <Card>
          <Empty icon={<Bot />} title="Aucun mail en attente">
            Harvey en préparera après avoir trouvé et lu des commerces.
          </Empty>
        </Card>
      )}

      {(s?.outbox?.sent?.length ?? 0) > 0 && (
        <Card title="Derniers envoyés" className="mt-6" pad={false}>
          <ul className="divide-y divide-line">
            {s!.outbox!.sent!.slice(0, 15).map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-2.5 text-[13.5px]">
                <span className="min-w-0 flex-1 truncate">{m.subject}</span>
                <span className="text-ink-3">{m.to_email}</span>
                {m.sent_at && <span className="text-ink-3">{relative(m.sent_at)}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
