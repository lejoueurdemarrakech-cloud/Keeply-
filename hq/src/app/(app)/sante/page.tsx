"use client";
import { CircleAlert, CircleCheck, CircleX, Play, Plus, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, CopyButton, Empty, Field, Markdown, Modal, PageHeader, Skeleton, Toggle, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateTime, relative } from "@/lib/format";
import type { HealthCheck, HealthResult, HealthRun } from "@/lib/types";

interface Data {
  runs: HealthRun[];
  checks: HealthCheck[];
  e2e: { at: string; passed: number; failed: number } | null;
  ingestReady: boolean;
}

const KIND: Record<HealthCheck["kind"], string> = {
  http: "Page ou API répond",
  texte: "Page contient un texte",
  json: "API renvoie du JSON",
  ssl: "Certificat HTTPS",
  liens: "Liens cassés",
  appstore: "Fiche App Store (Apple ID)",
  playstore: "Fiche Google Play",
};

const SEV = {
  ok: { icon: <CircleCheck className="size-5" />, cls: "text-mint", label: "OK" },
  attention: { icon: <TriangleAlert className="size-5" />, cls: "text-honey", label: "À surveiller" },
  panne: { icon: <CircleX className="size-5" />, cls: "text-coral", label: "Problème" },
};

export default function HealthPage() {
  const { data, mutate, isLoading } = useApi<Data>("/api/health");
  const [running, setRunning] = useState(false);
  const [editor, setEditor] = useState(false);
  const last = data?.runs[0];

  async function run() {
    setRunning(true);
    const r = await api<HealthRun>("POST", "/api/health/run");
    setRunning(false);
    if (r) {
      toast[r.score >= 90 ? "success" : "warning"](`Score de santé : ${r.score}/100`);
      mutate();
    }
  }

  return (
    <div>
      <PageHeader
        title="Santé de l'app"
        subtitle="Chaque jour, le site, les fiches App Store et Google Play, les erreurs de l'app et les avis sont passés au crible. Tu es prévenu par mail si quelque chose casse."
        actions={
          <>
            <Button onClick={() => setEditor(true)}>Contrôles</Button>
            <Button variant="primary" icon={<Play className="size-4" />} loading={running} onClick={run}>
              Tester maintenant
            </Button>
          </>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : !last ? (
        <Card>
          <Empty icon={<CircleAlert className="size-5" />} title="Aucun test lancé" action={<Button variant="primary" loading={running} onClick={run}>Lancer le premier test</Button>}>
            {data?.checks.length ? `${data.checks.length} contrôles sont prêts.` : "Ajoute l'adresse de ton site et de tes fiches stores dans Réglages pour activer les contrôles automatiques, ou crée tes propres contrôles."}
          </Empty>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Card>
              <div className="flex flex-col items-center py-2 text-center">
                <ScoreRing score={last.score} />
                <p className="mt-3 font-display text-[18px] font-semibold">{last.score >= 90 ? "Tout va bien" : last.score >= 60 ? "Quelques points à surveiller" : "Problèmes détectés"}</p>
                <p className="text-[13px] text-ink-3">
                  Test {last.trigger} · {relative(last.at)}
                </p>
              </div>
              <div className="mt-4 border-t border-line pt-4">
                <p className="mb-2 text-[12.5px] font-semibold text-ink-3">30 derniers tests</p>
                <div className="flex h-12 items-end gap-[3px]" role="img" aria-label="Historique des scores">
                  {[...data!.runs].slice(0, 30).reverse().map((r) => (
                    <span key={r.id} title={`${dateTime(r.at)} : ${r.score}/100`} className={cx("flex-1 rounded-t-[3px]", r.score >= 90 ? "bg-mint" : r.score >= 60 ? "bg-honey" : "bg-coral")} style={{ height: `${Math.max(8, r.score)}%` }} />
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-5">
              {last.summary && (
                <Card title="Diagnostic">
                  <Markdown text={last.summary} />
                </Card>
              )}
              <Card title="Résultats du dernier test" pad={false}>
                <ul className="divide-y divide-line">
                  {[...last.results].sort((a, b) => sevOrder(a) - sevOrder(b)).map((r) => (
                    <ResultRow key={r.checkId} r={r} />
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card title="Tests navigateur quotidiens">
          <p className="text-[14px] text-ink-2">
            Un robot ouvre ton site chaque matin dans Chrome, en version ordinateur et téléphone, et repère les pages en erreur, les erreurs JavaScript, les images cassées, la lenteur et les débordements sur mobile.
          </p>
          {data?.e2e ? (
            <p className="mt-3 rounded-xl bg-surface-2 px-3 py-2 text-[13.5px]">
              Dernier passage {relative(data.e2e.at)} : <strong>{data.e2e.passed}</strong> réussis, <strong className={data.e2e.failed ? "text-coral" : ""}>{data.e2e.failed}</strong> en échec.
            </p>
          ) : (
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[13.5px] text-ink-2">
              <li>Définis <code>INGEST_TOKEN</code> sur le serveur du tableau de bord{data?.ingestReady ? " (déjà fait ✓)" : ""}.</li>
              <li>
                Dans GitHub, onglet Settings &gt; Secrets and variables &gt; Actions, ajoute <code>KEEPLY_SITE_URL</code>, <code>HQ_URL</code> et <code>HQ_INGEST_TOKEN</code>.
              </li>
              <li>Le test « Keeply - tests quotidiens » tourne alors chaque jour à 7 h, et tu peux le lancer à la main depuis l&apos;onglet Actions.</li>
            </ol>
          )}
        </Card>
        <Card title="Comment ça marche">
          <ul className="space-y-2 text-[13.5px] text-ink-2">
            <li>• Le test complet tourne une fois par jour à l&apos;heure choisie dans Réglages (via la tâche planifiée).</li>
            <li>• En cas de panne : mail d&apos;alerte et tâche créée automatiquement dans Tâches.</li>
            <li>• Les avis qui parlent de bug ou de plantage sont repérés et listés ici.</li>
            <li>
              • Connecte <Link href="/connexions" className="font-semibold text-violet">Sentry</Link> pour remonter les plantages de l&apos;app iPhone / Android.
            </li>
          </ul>
        </Card>
      </div>

      {data && data.runs.length > 1 && (
        <Card className="mt-5" title="Historique" pad={false}>
          <ul className="divide-y divide-line">
            {data.runs.slice(0, 15).map((r) => {
              const bad = r.results.filter((x) => x.severity !== "ok");
              return (
                <li key={r.id} className="flex items-center gap-4 px-5 py-2.5 text-[13.5px]">
                  <span className={cx("font-display tnum w-10 text-[17px] font-bold", r.score >= 90 ? "text-mint" : r.score >= 60 ? "text-honey" : "text-coral")}>{r.score}</span>
                  <span className="w-36 shrink-0 text-ink-2">{dateTime(r.at)}</span>
                  <Badge>{r.trigger}</Badge>
                  <span className="min-w-0 flex-1 truncate text-ink-3">{bad.length ? bad.map((b) => b.name).join(", ") : "Aucun problème"}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {data && <ChecksEditor open={editor} onClose={() => setEditor(false)} checks={data.checks} onSaved={() => mutate()} />}
    </div>
  );
}

const sevOrder = (r: HealthResult) => ({ panne: 0, attention: 1, ok: 2 })[r.severity];

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score >= 90 ? "var(--mint)" : score >= 60 ? "var(--honey)" : "var(--coral)";
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--bg-2)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} style={{ transition: "stroke-dashoffset .8s var(--ease-out-quint)" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display tnum text-[38px] font-bold">{score}</span>
      </div>
    </div>
  );
}

function ResultRow({ r }: { r: HealthResult }) {
  const [open, setOpen] = useState(r.severity !== "ok" && !!r.items?.length);
  const s = SEV[r.severity];
  return (
    <li className="px-5 py-3">
      <button className="flex w-full items-start gap-3 text-left" onClick={() => r.items?.length && setOpen(!open)}>
        <span className={cx("mt-0.5 shrink-0", s.cls)}>{s.icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{r.name}</span>
          <span className="block text-[13.5px] text-ink-2">{r.detail}</span>
        </span>
        {r.ms !== undefined && <span className="tnum shrink-0 text-[12.5px] text-ink-3">{r.ms} ms</span>}
      </button>
      {open && r.items && (
        <ul className="mt-2 ml-8 space-y-1 rounded-xl bg-surface-2 p-3 text-[12.5px] break-all text-ink-2">
          {r.items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ChecksEditor({ open, onClose, checks, onSaved }: { open: boolean; onClose: () => void; checks: HealthCheck[]; onSaved: () => void }) {
  const [list, setList] = useState<HealthCheck[]>(checks);
  const [busy, setBusy] = useState<string | null>(null);
  const update = (id: string, p: Partial<HealthCheck>) => setList((l) => l.map((c) => (c.id === id ? { ...c, ...p } : c)));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contrôles"
      wide
      footer={
        <>
          <Button
            variant="ghost"
            icon={<Plus className="size-4" />}
            className="mr-auto"
            onClick={() => setList([...list, { id: "c" + Date.now().toString(36), name: "Nouveau contrôle", kind: "http", url: "https://", expectStatus: 200, maxMs: 3000, enabled: true }])}
          >
            Ajouter
          </Button>
          <Button
            variant="primary"
            loading={busy === "save"}
            onClick={async () => {
              setBusy("save");
              const r = await api("PUT", "/api/health/checks", { checks: list });
              setBusy(null);
              if (r) {
                toast.success("Contrôles enregistrés");
                onSaved();
                onClose();
              }
            }}
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <p className="mb-4 text-[13.5px] text-ink-2">Les contrôles « auto » viennent des adresses saisies dans Réglages. Ajoute les pages ou API importantes (page d&apos;inscription, API de validation des tampons…).</p>
      <ul className="space-y-3">
        {list.map((c) => (
          <li key={c.id} className="rounded-xl border border-line p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Toggle checked={c.enabled} onChange={(enabled) => update(c.id, { enabled })} label="Actif" />
              <input className="field h-9 flex-1 py-1 font-semibold" value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} aria-label="Nom" />
              {c.id.startsWith("auto-") && <Badge tone="violet">auto</Badge>}
              <Button
                size="sm"
                variant="ghost"
                loading={busy === c.id}
                onClick={async () => {
                  setBusy(c.id);
                  const r = await api<HealthResult>("POST", "/api/health/checks", c);
                  setBusy(null);
                  if (r) toast[r.ok ? "success" : "error"](`${r.name} : ${r.detail}`);
                }}
              >
                Tester
              </Button>
              <Button size="sm" variant="ghost" aria-label="Supprimer" onClick={() => setList(list.filter((x) => x.id !== c.id))}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[200px_minmax(0,1fr)]">
              <Field label="Type">
                <select className="field" value={c.kind} onChange={(e) => update(c.id, { kind: e.target.value as HealthCheck["kind"] })}>
                  {Object.entries(KIND).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={c.kind === "appstore" ? "Apple ID de l'app" : "Adresse"}>
                <input className="field" value={c.url} onChange={(e) => update(c.id, { url: e.target.value })} />
              </Field>
            </div>
            {["http", "texte", "json"].includes(c.kind) && (
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Statut attendu">
                  <input type="number" className="field" value={c.expectStatus ?? 200} onChange={(e) => update(c.id, { expectStatus: Number(e.target.value) })} />
                </Field>
                <Field label={c.kind === "json" ? "Valeur attendue" : "Texte attendu"}>
                  <input className="field" value={c.expectText ?? ""} onChange={(e) => update(c.id, { expectText: e.target.value })} />
                </Field>
                <Field label="Temps max (ms)">
                  <input type="number" className="field" value={c.maxMs ?? 3000} onChange={(e) => update(c.id, { maxMs: Number(e.target.value) })} />
                </Field>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between rounded-xl bg-surface-2 px-3 py-2 text-[12.5px] text-ink-3">
        <span>Astuce : une page « /api/health » sur ton serveur qui renvoie {"{ \"ok\": true }"} se surveille avec le type JSON et la valeur « true ».</span>
        <CopyButton text={'{ "ok": true }'} />
      </div>
    </Modal>
  );
}
