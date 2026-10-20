"use client";
import { Ban, Check, CircleCheck, CircleHelp, CircleX, Download, ExternalLink, FileUp, Globe, Mail, MapPin, MessageCircleReply, Phone, Radar, Send, Sparkles, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, Field, Modal, PageHeader, Skeleton, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateTime, flag, relative } from "@/lib/format";
import type { Prospect, ProspectStatus } from "@/lib/types";

interface Data {
  prospects: Prospect[];
  sentToday: number;
  dailyLimit: number;
  sender: string | null;
  searchSource: string;
  countries: Record<string, { name: string; lang: string }>;
  types: Record<string, string>;
}

const STATUS: Record<ProspectStatus, { label: string; tone: "neutral" | "violet" | "honey" | "mint" | "coral" | "sky" }> = {
  nouveau: { label: "Nouveau", tone: "neutral" },
  pret: { label: "Mail prêt", tone: "sky" },
  approuve: { label: "Approuvé", tone: "violet" },
  envoye: { label: "Envoyé", tone: "violet" },
  relance1: { label: "Relance 1", tone: "violet" },
  relance2: { label: "Relance 2", tone: "violet" },
  repondu: { label: "A répondu", tone: "mint" },
  interesse: { label: "Intéressé", tone: "mint" },
  refus: { label: "Pas intéressé", tone: "neutral" },
  client: { label: "Client", tone: "honey" },
  exclu: { label: "Exclu", tone: "coral" },
};
const SCORE: Record<Prospect["score"], { label: string; tone: "coral" | "honey" | "sky" | "neutral" }> = {
  chaud: { label: "Chaud", tone: "coral" },
  tiede: { label: "Tiède", tone: "honey" },
  froid: { label: "Froid", tone: "sky" },
  ecarte: { label: "Écarté", tone: "neutral" },
};
const VIEWS: { value: string; label: string; match: (p: Prospect) => boolean }[] = [
  { value: "tous", label: "Tous", match: (p) => p.status !== "exclu" },
  { value: "nouveau", label: "À préparer", match: (p) => p.status === "nouveau" && p.score !== "ecarte" },
  { value: "pret", label: "À valider", match: (p) => p.status === "pret" },
  { value: "approuve", label: "En file d'envoi", match: (p) => p.status === "approuve" },
  { value: "envoye", label: "Contactés", match: (p) => ["envoye", "relance1", "relance2"].includes(p.status) },
  { value: "repondu", label: "Réponses", match: (p) => ["repondu", "interesse"].includes(p.status) },
  { value: "client", label: "Clients", match: (p) => p.status === "client" },
  { value: "ecarte", label: "Écartés", match: (p) => p.score === "ecarte" || ["exclu", "refus"].includes(p.status) },
];

function ProspectionInner() {
  const params = useSearchParams();
  const { data, mutate, isLoading } = useApi<Data>("/api/prospects");
  const [view, setViewState] = useState(params.get("status") ?? "tous");
  const [showSearch, setShowSearch] = useState(params.has("search"));
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const all = useMemo(() => data?.prospects ?? [], [data]);
  const setView = (v: string) => {
    setViewState(v);
    setSel(new Set());
  };
  const list = useMemo(() => {
    const v = VIEWS.find((x) => x.value === view) ?? VIEWS[0];
    const s = q.toLowerCase();
    const order = { chaud: 0, tiede: 1, froid: 2, ecarte: 3 };
    return all.filter((p) => v.match(p) && (!s || `${p.name} ${p.city} ${p.email ?? ""}`.toLowerCase().includes(s))).sort((a, b) => order[a.score] - order[b.score]);
  }, [all, view, q]);
  const current = all.find((p) => p.id === open) ?? null;
  const hasDemo = all.some((p) => p.source === "demo");

  const toggle = (id: string) => setSel((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id);
    else n.add(id);
    return n;
  });

  async function bulk(kind: "draft" | "approve" | "exclude" | "delete") {
    const ids = [...sel];
    if (!ids.length) return;
    setBusy(kind);
    if (kind === "draft") {
      const r = await api<{ drafted: number; errors: string[] }>("POST", "/api/prospects/draft", { ids });
      if (r) toast.success(`${r.drafted} mail(s) préparé(s)${r.errors.length ? `, ${r.errors.length} erreur(s)` : ""}`);
    }
    if (kind === "approve") {
      const r = await api<{ updated: number }>("POST", "/api/prospects/approve", { ids });
      if (r) toast.success(r.updated ? `${r.updated} mail(s) en file d'envoi` : "Rien à approuver : il faut un mail préparé et une adresse.");
    }
    if (kind === "exclude") for (const id of ids) await api("PATCH", `/api/prospects/${id}`, { status: "exclu" });
    if (kind === "delete" && confirm(`Supprimer ${ids.length} établissement(s) ?`)) for (const id of ids) await api("DELETE", `/api/prospects/${id}`);
    setBusy(null);
    setSel(new Set());
    mutate();
  }

  const counts = Object.fromEntries(VIEWS.map((v) => [v.value, all.filter(v.match).length]));
  const funnel = {
    found: all.length,
    contacted: all.filter((p) => ["envoye", "relance1", "relance2", "repondu", "interesse", "refus", "client"].includes(p.status)).length,
    replied: all.filter((p) => ["repondu", "interesse", "refus", "client"].includes(p.status)).length,
    won: all.filter((p) => p.status === "client").length,
  };

  return (
    <div>
      <PageHeader
        title="Prospection"
        subtitle="Trouve des cafés et restaurants, prépare des mails personnalisés, et laisse partir les envois et relances tout seuls."
        actions={
          <>
            <a href="/api/prospects/export" download className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-ink-2 hover:bg-bg-2 hover:text-ink">
              <Download className="size-4" /> Exporter
            </a>
            <Button icon={<FileUp className="size-4" />} onClick={() => setImportOpen(true)}>
              Importer
            </Button>
            <Button variant="primary" icon={<Radar className="size-4" />} onClick={() => setShowSearch((v) => !v)}>
              Chercher des établissements
            </Button>
          </>
        }
      />

      {showSearch && data && <SearchPanel data={data} onDone={() => mutate()} />}

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[
          { l: "Établissements trouvés", v: funnel.found },
          { l: "Contactés", v: funnel.contacted },
          { l: "Ont répondu", v: funnel.replied, sub: funnel.contacted ? `${Math.round((funnel.replied / funnel.contacted) * 100)} % de réponse` : undefined },
          { l: "Devenus clients", v: funnel.won },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-line bg-surface p-4 shadow-card">
            <p className="text-[13px] text-ink-2">{s.l}</p>
            <p className="font-display tnum mt-1 text-[26px] leading-none font-bold">{s.v}</p>
            <p className="mt-2 min-h-5 text-[12.5px] text-ink-3">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-2xl border border-line bg-surface-2 px-4 py-3 text-[13.5px] text-ink-2">
        {data?.sender ? (
          <>
            Envoi depuis <strong className="text-ink">{data.sender}</strong> · <span className="tnum">{data.sentToday}/{data.dailyLimit}</span> mails aujourd&apos;hui · en semaine, dans le créneau choisi en Réglages, relances automatiques, arrêt dès qu&apos;un prospect répond.
          </>
        ) : (
          <>
            Aucune boîte d&apos;envoi connectée : tu peux chercher et préparer les mails, l&apos;envoi démarrera quand tu auras connecté une boîte dans <a className="font-semibold text-violet" href="/connexions">Connexions</a>.
          </>
        )}
        {hasDemo && (
          <button className="ml-2 font-semibold text-coral underline" onClick={async () => { await api("DELETE", "/api/prospects"); mutate(); }}>
            Supprimer les exemples
          </button>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
          {VIEWS.map((v) => (
            <button key={v.value} onClick={() => setView(v.value)} className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap", view === v.value ? "bg-violet text-white" : "bg-surface text-ink-2 ring-1 ring-line hover:text-ink")}>
              {v.label} <span className="tnum opacity-70">{counts[v.value]}</span>
            </button>
          ))}
        </div>
        <input className="field ml-auto h-9 w-full py-1 sm:w-56" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {sel.size > 0 && (
        <div className="rise sticky top-16 z-20 mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-violet/30 bg-violet-soft px-4 py-2.5 lg:top-4">
          <span className="text-[14px] font-semibold text-violet">{sel.size} sélectionné(s)</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            <Button size="sm" variant="primary" icon={<Sparkles className="size-3.5" />} loading={busy === "draft"} onClick={() => bulk("draft")}>
              Préparer les mails
            </Button>
            <Button size="sm" icon={<Check className="size-3.5" />} loading={busy === "approve"} onClick={() => bulk("approve")}>
              Approuver l&apos;envoi
            </Button>
            <Button size="sm" variant="ghost" icon={<Ban className="size-3.5" />} onClick={() => bulk("exclude")}>
              Exclure
            </Button>
            <Button size="sm" variant="ghost" icon={<Trash2 className="size-3.5" />} onClick={() => bulk("delete")}>
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <Card pad={false}>
        {isLoading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <Empty icon={<Radar className="size-5" />} title={all.length ? "Rien dans cette vue" : "Aucun établissement pour l'instant"} action={!all.length && <Button variant="primary" onClick={() => setShowSearch(true)}>Lancer une recherche</Button>}>
            {!all.length && "Choisis un pays, une ville et le type d'établissement : la liste se remplit avec leurs coordonnées, leur site et leur adresse mail quand elle est trouvable."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-[13.5px]">
              <thead className="text-left text-ink-3">
                <tr className="border-b border-line">
                  <th className="w-10 py-2.5 pl-5">
                    <input type="checkbox" aria-label="Tout sélectionner" checked={sel.size === list.length && list.length > 0} onChange={(e) => setSel(e.target.checked ? new Set(list.map((p) => p.id)) : new Set())} className="size-4 accent-[var(--violet)]" />
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Établissement</th>
                  <th className="px-3 py-2.5 font-semibold">Score</th>
                  <th className="px-3 py-2.5 font-semibold">Contact</th>
                  <th className="px-3 py-2.5 font-semibold">Signaux</th>
                  <th className="px-5 py-2.5 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((p) => (
                  <tr key={p.id} className={cx("cursor-pointer align-top hover:bg-surface-2", sel.has(p.id) && "bg-violet-soft/50")} onClick={() => setOpen(p.id)}>
                    <td className="py-3 pl-5" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" aria-label={`Sélectionner ${p.name}`} checked={sel.has(p.id)} onChange={() => toggle(p.id)} className="size-4 accent-[var(--violet)]" />
                    </td>
                    <td className="max-w-[260px] px-3 py-3">
                      <p className="truncate font-semibold">
                        {p.name} {p.source === "demo" && <Badge tone="honey">exemple</Badge>}
                      </p>
                      <p className="truncate text-[12.5px] text-ink-3">
                        {data?.types[p.type] ?? p.type} · {flag(p.country)} {p.city}
                        {p.rating ? ` · ${p.rating}★ (${p.reviews})` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={SCORE[p.score].tone}>{SCORE[p.score].label}</Badge>
                    </td>
                    <td className="max-w-[230px] px-3 py-3">
                      {p.email ? (
                        <span className="flex items-center gap-1.5 truncate">
                          {p.emailCheck === "ok" ? <CircleCheck className="size-3.5 shrink-0 text-mint" aria-label="Domaine vérifié" /> : p.emailCheck === "sans-mx" ? <CircleX className="size-3.5 shrink-0 text-coral" aria-label="Domaine sans serveur mail" /> : <CircleHelp className="size-3.5 shrink-0 text-ink-3" aria-label="Non vérifié" />}
                          <span className="truncate">{p.email}</span>
                        </span>
                      ) : (
                        <span className="text-ink-3">{p.phone ? `Pas de mail · ${p.phone}` : "Pas de mail"}</span>
                      )}
                    </td>
                    <td className="max-w-[240px] px-3 py-3 text-[12.5px] text-ink-2">
                      <span className="line-clamp-2">{p.signals.join(" · ") || "—"}</span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                      {p.nextSendAt && <p className="mt-1 text-[12px] text-ink-3">relance {relative(p.nextSendAt)}</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {current && <ProspectModal key={JSON.stringify([current.id, current.draft, current.email, current.notes])} p={current} types={data?.types ?? {}} onClose={() => setOpen(null)} onChange={() => mutate()} />}
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onDone={() => mutate()} />
    </div>
  );
}

function SearchPanel({ data, onDone }: { data: Data; onDone: () => void }) {
  const [country, setCountry] = useState("FR");
  const [cities, setCities] = useState("");
  const [types, setTypes] = useState<string[]>(["cafe", "boulangerie"]);
  const [limit, setLimit] = useState(30);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  async function run() {
    const list = cities.split(/[,\n;]/).map((c) => c.trim()).filter(Boolean);
    if (!list.length) return toast.error("Indique au moins une ville.");
    setBusy(true);
    setLog([]);
    for (const city of list) {
      setLog((l) => [...l, `${city} : recherche en cours…`]);
      const r = await api<{ added: number; duplicates: number; withEmail: number; source: string; notice?: string }>("POST", "/api/prospects/search", { country, city, types, limit });
      setLog((l) => [...l.slice(0, -1), r ? `${city} : ${r.added} ajoutés (${r.withEmail} avec mail), ${r.duplicates} déjà connus${r.notice ? `. ${r.notice}` : ""}` : `${city} : échec`]);
      onDone();
    }
    setBusy(false);
  }

  return (
    <Card className="rise mb-5" title="Nouvelle recherche" action={<span className="text-[12.5px] text-ink-3">Source : {data.searchSource}</span>}>
      <div className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)_140px]">
        <Field label="Pays">
          <select className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
            {Object.entries(data.countries).map(([k, v]) => (
              <option key={k} value={k}>
                {flag(k)} {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Villes" hint="Sépare plusieurs villes par des virgules.">
          <input className="field" placeholder="Lyon, Villeurbanne, Annecy" value={cities} onChange={(e) => setCities(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} />
        </Field>
        <Field label="Par ville (max)">
          <input type="number" min={5} max={120} className="field" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
        </Field>
      </div>
      <div className="mt-4">
        <p className="mb-1.5 text-[13px] font-semibold text-ink-2">Types d&apos;établissements</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(data.types).map(([k, v]) => {
            const on = types.includes(k);
            return (
              <button key={k} onClick={() => setTypes(on ? types.filter((x) => x !== k) : [...types, k])} className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold", on ? "bg-violet text-white" : "bg-bg-2 text-ink-2 hover:text-ink")}>
                {v}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="max-w-[60ch] text-[12.5px] text-ink-3">
          Les chaînes et franchises sont écartées. Pour chaque établissement, son site est visité pour trouver l&apos;adresse de contact, son Instagram et des indices (fidélité, livraison). Le domaine de chaque adresse est vérifié.
        </p>
        <Button variant="primary" icon={<Radar className="size-4" />} loading={busy} onClick={run} disabled={!types.length}>
          Trouver
        </Button>
      </div>
      {log.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
          {log.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function ProspectModal({ p, types, onClose, onChange }: { p: Prospect; types: Record<string, string>; onClose: () => void; onChange: () => void }) {
  const [draft, setDraft] = useState(p.draft);
  const [email, setEmail] = useState(p.email ?? "");
  const [notes, setNotes] = useState(p.notes ?? "");
  const [busy, setBusy] = useState<string | null>(null);

  const patch = async (body: Partial<Prospect>, msg?: string) => {
    const r = await api("PATCH", `/api/prospects/${p.id}`, body);
    if (r && msg) toast.success(msg);
    onChange();
  };
  const dirty = JSON.stringify(draft) !== JSON.stringify(p.draft) || email !== (p.email ?? "") || notes !== (p.notes ?? "");

  return (
    <Modal
      open
      onClose={onClose}
      title={p.name}
      wide
      footer={
        <>
          <select className="field mr-auto h-10 w-auto" value={p.status} onChange={(e) => patch({ status: e.target.value as ProspectStatus }, "Statut mis à jour")} aria-label="Statut">
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          {dirty && (
            <Button loading={busy === "save"} onClick={async () => { setBusy("save"); await patch({ draft, email: email || undefined, notes }, "Enregistré"); setBusy(null); }}>
              Enregistrer
            </Button>
          )}
          {p.draft && p.email && ["pret", "nouveau"].includes(p.status) && (
            <Button icon={<Check className="size-4" />} onClick={async () => { await api("POST", "/api/prospects/approve", { ids: [p.id] }); toast.success("Ajouté à la file d'envoi"); onChange(); }}>
              Approuver
            </Button>
          )}
          {p.draft && p.email && p.source !== "demo" && (p.step ?? -1) < (p.draft.followUps.length) && !["repondu", "interesse", "refus", "client", "exclu"].includes(p.status) && (
            <Button
              variant="primary"
              icon={<Send className="size-4" />}
              loading={busy === "send"}
              onClick={async () => {
                if (!confirm(`Envoyer maintenant à ${p.email} ?`)) return;
                setBusy("send");
                const r = await api("POST", "/api/prospects/send", { id: p.id });
                setBusy(null);
                if (r) toast.success("Mail envoyé.");
                onChange();
              }}
            >
              {(p.step ?? -1) < 0 ? "Envoyer maintenant" : `Envoyer la relance ${(p.step ?? 0) + 1}`}
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge tone={SCORE[p.score].tone}>{SCORE[p.score].label}</Badge>
            <Badge>{types[p.type] ?? p.type}</Badge>
            {p.signals.map((s) => (
              <Badge key={s} tone="violet">
                {s}
              </Badge>
            ))}
          </div>
          <Field label="Adresse mail" hint={p.emails && p.emails.length > 1 ? `Autres adresses trouvées : ${p.emails.filter((e) => e !== email).join(", ")}` : undefined}>
            <input className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@…" />
          </Field>
          {draft ? (
            <div className="space-y-3">
              <Field label="Objet">
                <input className="field" value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} />
              </Field>
              <Field label="Premier mail">
                <textarea className="field h-56" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
              </Field>
              {draft.followUps.map((f, i) => (
                <Field key={i} label={`Relance ${i + 1} · J+${f.delayDays}`}>
                  <input className="field mb-1.5" value={f.subject} onChange={(e) => setDraft({ ...draft, followUps: draft.followUps.map((x, j) => (j === i ? { ...x, subject: e.target.value } : x)) })} />
                  <textarea className="field h-28" value={f.body} onChange={(e) => setDraft({ ...draft, followUps: draft.followUps.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })} />
                </Field>
              ))}
            </div>
          ) : (
            <Empty icon={<Mail className="size-5" />} title="Pas encore de mail">
              Claude écrit un mail court et personnalisé à partir de ce qu&apos;il sait de l&apos;établissement, avec ses relances.
            </Empty>
          )}
          <Button
            icon={<Sparkles className="size-4" />}
            loading={busy === "draft"}
            onClick={async () => {
              setBusy("draft");
              const r = await api<{ drafted: number; errors: string[] }>("POST", "/api/prospects/draft", { ids: [p.id] });
              setBusy(null);
              if (r?.errors.length) toast.error(r.errors[0]);
              onChange();
            }}
          >
            {draft ? "Réécrire le mail" : "Préparer le mail"}
          </Button>
        </div>
        <aside className="space-y-4 text-[13.5px]">
          <div className="space-y-2 rounded-xl bg-surface-2 p-4">
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-ink-3" />
              {p.address || `${p.city}, ${p.country}`}
            </p>
            {p.website && (
              <a href={p.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 break-all text-violet hover:underline">
                <Globe className="size-4 shrink-0" /> {p.website.replace(/^https?:\/\/(www\.)?/, "")}
              </a>
            )}
            {p.phone && (
              <a href={`tel:${p.phone}`} className="flex items-center gap-2 hover:text-violet">
                <Phone className="size-4 shrink-0 text-ink-3" /> {p.phone}
              </a>
            )}
            {p.instagram && (
              <a href={`https://instagram.com/${p.instagram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-violet">
                <ExternalLink className="size-4 shrink-0 text-ink-3" /> @{p.instagram}
              </a>
            )}
            {p.rating && <p className="text-ink-2">Note Google : {p.rating}★ ({p.reviews} avis)</p>}
          </div>
          <Field label="Notes">
            <textarea className="field h-24" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nom du gérant, appel prévu…" />
          </Field>
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-2">Historique</p>
            <ol className="space-y-2 border-l-2 border-line pl-3">
              {[...p.history].reverse().map((h, i) => (
                <li key={i}>
                  <p className="text-ink">{h.event}</p>
                  <p className="text-[12px] text-ink-3">{dateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          </div>
          {["repondu", "interesse"].includes(p.status) && (
            <a href="/mails" className="flex items-center gap-2 font-semibold text-mint">
              <MessageCircleReply className="size-4" /> Lire sa réponse dans Mails
            </a>
          )}
        </aside>
      </div>
    </Modal>
  );
}

function ImportModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importer une liste"
      footer={
        <Button
          variant="primary"
          loading={busy}
          disabled={!csv.trim()}
          onClick={async () => {
            setBusy(true);
            const r = await api<{ imported: number }>("POST", "/api/prospects/import", { csv });
            setBusy(false);
            if (r) {
              toast.success(`${r.imported} établissements importés`);
              setCsv("");
              onDone();
              onClose();
            }
          }}
        >
          Importer
        </Button>
      }
    >
      <p className="text-[13.5px] text-ink-2">Fichier CSV avec les colonnes : nom, ville, pays, email, site, téléphone, type. Seul le nom est obligatoire.</p>
      <input type="file" accept=".csv" className="field mt-3" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setCsv(await f.text()); }} />
      <textarea className="field mt-3 h-36 font-mono text-[12.5px]" placeholder={"nom,ville,pays,email\nCafé Tribu,Lyon,FR,bonjour@cafetribu.fr"} value={csv} onChange={(e) => setCsv(e.target.value)} />
    </Modal>
  );
}

export default function ProspectionPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <ProspectionInner />
    </Suspense>
  );
}
