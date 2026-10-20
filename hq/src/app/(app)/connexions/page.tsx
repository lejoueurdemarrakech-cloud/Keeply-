"use client";
import { CircleCheck, CircleDashed, CircleX, ExternalLink, KeyRound, Plug, Play } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CopyButton, Field, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { CONNECTORS, type ConnectorDef, type ConnectorGroup } from "@/lib/connectors/registry";
import { relative } from "@/lib/format";

interface Status {
  id: string;
  configured: boolean;
  updatedAt: string | null;
  lastTest: { ok: boolean; message: string; at: string } | null;
  fields: { key: string; fromEnv: boolean; filled: boolean; value: string; hint: string }[];
}
interface Data {
  connectors: Status[];
  store: string;
  cronSecret: boolean;
  ingestToken: boolean;
  password: boolean;
  cron: { at: number; results?: Record<string, string> } | null;
}

const GROUPS: ConnectorGroup[] = ["Ventes", "Instagram & Meta", "Mails", "Prospection", "Santé de l'app", "Intelligence"];

export default function ConnectionsPage() {
  const { data, mutate, isLoading } = useApi<Data>("/api/connectors");
  const [open, setOpen] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const connected = data?.connectors.filter((c) => c.configured).length ?? 0;

  return (
    <div>
      <PageHeader
        title="Connexions"
        subtitle={`Relie tes comptes pour remplacer les données d'exemple par tes vrais chiffres. ${data ? `${connected}/${CONNECTORS.length} connectés.` : ""} Les clés sont chiffrées avant d'être enregistrées.`}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SysItem ok={!!data?.password} label="Mot de passe" detail={data?.password ? "Accès protégé" : "ADMIN_PASSWORD non défini : accès libre en local uniquement"} />
        <SysItem ok={data?.store === "upstash"} warn={data?.store === "fichier"} label="Stockage" detail={data?.store === "upstash" ? "Upstash Redis (en ligne)" : "Fichier local (data/hq-db.json)"} />
        <SysItem ok={!!data?.cronSecret} warn label="Tâche planifiée" detail={data?.cron ? `Dernier passage ${relative(new Date(data.cron.at).toISOString())}` : "Jamais lancée"} />
        <SysItem ok={!!data?.ingestToken} warn label="Jeton d'envoi" detail={data?.ingestToken ? "INGEST_TOKEN défini" : "INGEST_TOKEN manquant (webhooks et tests GitHub)"} />
      </div>

      {isLoading || !data ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="space-y-8">
          {GROUPS.map((g) => (
            <section key={g}>
              <h2 className="mb-3 font-display text-[18px] font-semibold">{g}</h2>
              <div className="grid gap-3 lg:grid-cols-2">
                {CONNECTORS.filter((c) => c.group === g).map((def) => (
                  <ConnectorCard key={def.id} def={def} status={data.connectors.find((s) => s.id === def.id)!} open={open === def.id} onToggle={() => setOpen(open === def.id ? null : def.id)} onChange={() => mutate()} />
                ))}
              </div>
            </section>
          ))}

          <Card title="Faire tourner les automatisations 24 h/24">
            <p className="text-[14px] text-ink-2">
              Quand le tableau de bord est ouvert, il lance lui-même la tâche planifiée toutes les 3 minutes (publication des posts, réponses automatiques, test de santé quotidien, envois de prospection). Pour que tout tourne même navigateur fermé, fais appeler cette adresse toutes les 5 à 10 minutes par un service gratuit comme cron-job.org :
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-bg-2 px-3 py-2 font-mono text-[12.5px]">
              <span className="min-w-0 flex-1 truncate">{origin}/api/cron?secret=CRON_SECRET</span>
              <CopyButton text={`${origin}/api/cron?secret=`} />
            </div>
            <p className="mt-2 text-[12.5px] text-ink-3">Remplace CRON_SECRET par la valeur définie sur ton serveur (ou envoie-la dans l&apos;en-tête Authorization: Bearer).</p>
            {data.cron?.results && (
              <ul className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
                {Object.entries(data.cron.results).map(([k, v]) => (
                  <li key={k} className="rounded-xl bg-surface-2 px-3 py-2">
                    <span className="font-semibold">{{ instagram: "Instagram", reponseAuto: "Réponse auto", sante: "Santé", prospection: "Prospection" }[k] ?? k}</span> : <span className="text-ink-2">{Array.isArray(v) ? (v.length ? v.join(", ") : "rien à publier") : String(v)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Button
              className="mt-4"
              icon={<Play className="size-4" />}
              onClick={async () => {
                const r = await fetch("/api/cron?force=1");
                if (r.ok) toast.success("Tâche planifiée lancée");
                mutate();
              }}
            >
              Lancer maintenant
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function SysItem({ ok, warn, label, detail }: { ok: boolean; warn?: boolean; label: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card">
      <span className={cx("mt-0.5", ok ? "text-mint" : warn ? "text-honey" : "text-coral")}>{ok ? <CircleCheck className="size-5" /> : warn ? <CircleDashed className="size-5" /> : <CircleX className="size-5" />}</span>
      <div className="min-w-0">
        <p className="font-semibold">{label}</p>
        <p className="text-[12.5px] text-ink-3">{detail}</p>
      </div>
    </div>
  );
}

function ConnectorCard({ def, status, open, onToggle, onChange }: { def: ConnectorDef; status: Status; open: boolean; onToggle: () => void; onChange: () => void }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(status.fields.map((f) => [f.key, f.value])));
  const [busy, setBusy] = useState<string | null>(null);
  const tone = status.configured ? (status.lastTest && !status.lastTest.ok ? "coral" : "mint") : "neutral";

  async function save() {
    setBusy("save");
    const ok = await api("PUT", `/api/connectors/${def.id}`, values);
    if (ok) {
      const t = await api<{ ok: boolean; message: string }>("POST", `/api/connectors/${def.id}/test`);
      if (t) toast[t.ok ? "success" : "error"](`${def.name} : ${t.message}`);
    }
    setBusy(null);
    onChange();
  }

  return (
    <div className={cx("rounded-2xl border bg-surface shadow-card transition-colors", open ? "border-violet/40" : "border-line")}>
      <button onClick={onToggle} className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={open}>
        <span className={cx("grid size-10 shrink-0 place-items-center rounded-xl", status.configured ? "bg-mint-soft text-mint" : "bg-bg-2 text-ink-3")}>
          <Plug className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{def.name}</span>
            <Badge tone={tone}>{status.configured ? (status.lastTest && !status.lastTest.ok ? "Erreur" : "Connecté") : "Non connecté"}</Badge>
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-2">{def.description}</span>
          {status.lastTest && <span className={cx("mt-1 block text-[12.5px]", status.lastTest.ok ? "text-ink-3" : "text-coral")}>{status.lastTest.message} · {relative(status.lastTest.at)}</span>}
        </span>
      </button>
      {open && (
        <div className="rise border-t border-line p-4">
          <ol className="mb-4 list-decimal space-y-1 rounded-xl bg-surface-2 py-3 pr-3 pl-8 text-[13px] text-ink-2">
            {def.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <div className="space-y-3">
            {def.fields.map((f) => {
              const st = status.fields.find((x) => x.key === f.key)!;
              const secret = f.type === "password" || f.type === "textarea";
              return (
                <Field
                  key={f.key}
                  label={`${f.label}${f.optional ? " (facultatif)" : ""}`}
                  hint={st.fromEnv ? `Défini par la variable ${f.env} sur le serveur.` : st.hint ? `Enregistré (${st.hint}). Laisse vide pour garder la valeur actuelle.` : f.help}
                >
                  {f.type === "textarea" ? (
                    <textarea className="field h-24 font-mono text-[12.5px]" disabled={st.fromEnv} placeholder={f.placeholder} value={values[f.key] ?? ""} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} />
                  ) : (
                    <div className="relative">
                      {secret && <KeyRound className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />}
                      <input
                        className={cx("field", secret && "pl-9")}
                        type={f.type === "password" ? "password" : f.type === "number" ? "number" : "text"}
                        autoComplete="off"
                        disabled={st.fromEnv}
                        placeholder={f.placeholder}
                        value={values[f.key] ?? ""}
                        onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                      />
                    </div>
                  )}
                </Field>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {def.docs && (
              <a href={def.docs} target="_blank" rel="noreferrer" className="mr-auto inline-flex items-center gap-1 text-[13px] font-semibold text-violet hover:underline">
                Documentation <ExternalLink className="size-3.5" />
              </a>
            )}
            {status.configured && (
              <>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    if (!confirm(`Déconnecter ${def.name} ?`)) return;
                    await api("DELETE", `/api/connectors/${def.id}`);
                    onChange();
                  }}
                >
                  Déconnecter
                </Button>
                <Button
                  size="sm"
                  loading={busy === "test"}
                  onClick={async () => {
                    setBusy("test");
                    const t = await api<{ ok: boolean; message: string }>("POST", `/api/connectors/${def.id}/test`);
                    setBusy(null);
                    if (t) toast[t.ok ? "success" : "error"](t.message);
                    onChange();
                  }}
                >
                  Tester
                </Button>
              </>
            )}
            <Button size="sm" variant="primary" loading={busy === "save"} onClick={save}>
              Enregistrer et tester
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
