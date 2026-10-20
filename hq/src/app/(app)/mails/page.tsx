"use client";
import { Archive, ArrowLeft, Bot, Check, CheckCheck, Inbox, Mail, MailOpen, RefreshCw, Reply, Search, Send, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, DemoBadge, Empty, ErrorNote, Field, Modal, PageHeader, Segmented, Skeleton, Toggle, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateTime, relative } from "@/lib/format";
import type { AutoReplySettings, MailCategory, MailItem } from "@/lib/types";

const CATEGORIES: Record<MailCategory, string> = {
  client: "Client",
  prospect: "Prospect",
  partenariat: "Partenariat",
  support: "Support",
  facturation: "Facturation",
  presse: "Presse",
  store: "App Store / Play",
  notification: "Notification",
  newsletter: "Newsletter",
  perso: "Perso",
  autre: "Autre",
};
const PRIORITY: Record<number, { label: string; tone: "coral" | "honey" | "violet" | "neutral" }> = {
  5: { label: "Urgent", tone: "coral" },
  4: { label: "Important", tone: "honey" },
  3: { label: "Normal", tone: "violet" },
  2: { label: "Peut attendre", tone: "neutral" },
  1: { label: "Bas", tone: "neutral" },
};
const TEMPLATES = [
  { label: "Bien reçu", body: "Bonjour {prenom},\n\nMerci pour votre message, je regarde ça et je reviens vers vous très vite.\n\nBelle journée," },
  { label: "Proposer une démo", body: "Bonjour {prenom},\n\nAvec plaisir ! Je vous propose un appel de 15 minutes pour vous montrer Keeply sur votre propre carte. Quel créneau vous arrange cette semaine ?\n\nÀ bientôt," },
  { label: "Problème réglé", body: "Bonjour {prenom},\n\nLe problème est corrigé de notre côté. Pouvez-vous réessayer et me dire si tout fonctionne ?\n\nMerci pour votre patience," },
  { label: "Retenir un client", body: "Bonjour {prenom},\n\nJe suis désolé d'apprendre que Keeply ne vous convient pas. Avant de résilier, puis-je vous appeler 10 minutes ? Souvent, quelques réglages (récompense plus proche, rappels) changent beaucoup les résultats. Je peux aussi vous offrir le mois prochain.\n\nBien à vous," },
];

type Filter = "prioritaires" | "tous" | "non-lus" | "traites";

interface InboxData {
  items: MailItem[];
  live: boolean;
  error?: string;
  autoReply: boolean;
}

function MailsInner() {
  const params = useSearchParams();
  const { data, mutate, isValidating, isLoading } = useApi<InboxData>("/api/mail");
  const [filter, setFilter] = useState<Filter>("prioritaires");
  const [cat, setCat] = useState<MailCategory | "">("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(params.get("id"));
  const [busy, setBusy] = useState<string | null>(null);
  const [autoOpen, setAutoOpen] = useState(false);

  const items = useMemo(() => {
    let list = data?.items ?? [];
    if (filter === "prioritaires") list = list.filter((m) => !m.done && m.priority >= 3);
    if (filter === "non-lus") list = list.filter((m) => !m.seen && !m.done);
    if (filter === "traites") list = list.filter((m) => m.done);
    if (filter === "tous") list = list.filter((m) => !m.done);
    if (cat) list = list.filter((m) => m.category === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter((m) => `${m.subject} ${m.from.name} ${m.from.email} ${m.snippet}`.toLowerCase().includes(s));
    }
    return list;
  }, [data, filter, cat, q]);

  const current = data?.items.find((m) => m.id === selected) ?? null;
  const counts = useMemo(() => {
    const c: Partial<Record<MailCategory, number>> = {};
    for (const m of data?.items ?? []) if (!m.done) c[m.category] = (c[m.category] ?? 0) + 1;
    return c;
  }, [data]);

  async function act(m: MailItem, action: string, value?: string | number) {
    const optimistic = data && {
      ...data,
      items: data.items.map((x) =>
        x.id === m.id
          ? {
              ...x,
              ...(action === "seen" ? { seen: true } : {}),
              ...(action === "unseen" ? { seen: false } : {}),
              ...(action === "done" || action === "archive" ? { done: true } : {}),
              ...(action === "undone" ? { done: false } : {}),
              ...(action === "priority" ? { priority: Number(value) as MailItem["priority"] } : {}),
              ...(action === "category" ? { category: value as MailCategory } : {}),
            }
          : x,
      ),
    };
    if (optimistic) mutate(optimistic, { revalidate: false });
    if (m.id.startsWith("demo-") && ["seen", "unseen", "archive"].includes(action)) return;
    await api("POST", "/api/mail/action", { uid: m.id, messageId: m.messageId, action, value });
  }

  async function triage() {
    setBusy("triage");
    const r = await api<{ triaged: number }>("POST", "/api/mail/triage");
    setBusy(null);
    if (r) {
      toast.success(r.triaged ? `${r.triaged} mails analysés par l'IA` : "Tout est déjà trié.");
      mutate();
    }
  }

  useEffect(() => {
    if (current && !current.seen) act(current, "seen");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  return (
    <div>
      <PageHeader
        title="Mails"
        subtitle={
          <>
            Classés par priorité : ce qui demande une réponse rapide en premier. <DemoBadge show={!!data && !data.live} />
          </>
        }
        actions={
          <>
            <Button variant="ghost" icon={<Bot className="size-4" />} onClick={() => setAutoOpen(true)}>
              Réponse auto · <span className={data?.autoReply ? "text-mint" : "text-ink-3"}>{data?.autoReply ? "activée" : "désactivée"}</span>
            </Button>
            <Button icon={<Sparkles className="size-4" />} loading={busy === "triage"} onClick={triage}>
              Trier avec l&apos;IA
            </Button>
            <Button
              variant="primary"
              icon={<RefreshCw className="size-4" />}
              loading={isValidating && !isLoading}
              onClick={async () => {
                const res = await fetch("/api/mail?refresh=1");
                if (res.ok) mutate(await res.json(), { revalidate: false });
              }}
            >
              Relever
            </Button>
          </>
        }
      />
      {data?.error && (
        <div className="mb-4">
          <ErrorNote>Boîte mail : {data.error}</ErrorNote>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className={cx("min-w-0", current && "hidden lg:block")}>
          <div className="mb-3 space-y-2.5">
            <Segmented
              value={filter}
              onChange={setFilter}
              size="sm"
              options={[
                { value: "prioritaires", label: "Prioritaires" },
                { value: "non-lus", label: "Non lus" },
                { value: "tous", label: "Tous" },
                { value: "traites", label: "Traités" },
              ]}
            />
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
                <input className="field h-9 py-1 pl-9" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className="field h-9 w-40 py-1 text-[13px]" value={cat} onChange={(e) => setCat(e.target.value as MailCategory | "")} aria-label="Catégorie">
                <option value="">Toutes catégories</option>
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v} {counts[k as MailCategory] ? `(${counts[k as MailCategory]})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {isLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <Empty icon={<Inbox className="size-5" />} title={filter === "prioritaires" ? "Aucun mail prioritaire" : "Aucun mail"}>
                {filter === "prioritaires" ? "Tout ce qui compte a été traité." : "Rien dans cette vue."}
              </Empty>
            ) : (
              <ul className="max-h-[calc(100dvh-300px)] divide-y divide-line overflow-y-auto">
                {items.map((m) => (
                  <li key={m.id}>
                    <button
                      onClick={() => setSelected(m.id)}
                      className={cx("relative block w-full px-4 py-3 text-left transition-colors", selected === m.id ? "bg-violet-soft" : "hover:bg-surface-2")}
                    >
                      <span className={cx("absolute top-3 bottom-3 left-0 w-[3px] rounded-r", m.priority === 5 ? "bg-coral" : m.priority === 4 ? "bg-honey" : "bg-transparent")} />
                      <span className="flex items-center gap-2">
                        {!m.seen && <span className="size-2 shrink-0 rounded-full bg-violet" aria-label="Non lu" />}
                        <span className={cx("min-w-0 flex-1 truncate text-[14px]", !m.seen ? "font-bold" : "font-semibold")}>{m.from.name}</span>
                        <span className="shrink-0 text-[12px] text-ink-3">{relative(m.date)}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[13.5px]">{m.subject}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-ink-3">{m.summary ?? m.snippet}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {m.priority >= 4 && <Badge tone={PRIORITY[m.priority].tone}>{PRIORITY[m.priority].label}</Badge>}
                        <Badge>{CATEGORIES[m.category]}</Badge>
                        {m.autoReplied && (
                          <Badge tone="mint">
                            <Bot className="size-3" /> accusé envoyé
                          </Badge>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={cx("min-w-0", !current && "hidden lg:block")}>
          {current ? <Reader key={current.id} m={current} onBack={() => setSelected(null)} act={act} onSent={() => mutate()} /> : <Card><Empty icon={<MailOpen className="size-5" />} title="Choisis un mail">Les plus importants sont en haut de la liste.</Empty></Card>}
        </div>
      </div>

      <AutoReplyModal open={autoOpen} onClose={() => setAutoOpen(false)} onSaved={() => mutate()} />
    </div>
  );
}

function Reader({ m, onBack, act, onSent }: { m: MailItem; onBack: () => void; act: (m: MailItem, a: string, v?: string | number) => void; onSent: () => void }) {
  const [replying, setReplying] = useState(false);
  const [subject, setSubject] = useState(m.subject.match(/^re\s?:/i) ? m.subject : `Re : ${m.subject}`);
  const [body, setBody] = useState("");
  const [intent, setIntent] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const first = m.from.name.split(/\s+/)[0];

  async function draft() {
    setBusy("ai");
    const r = await api<{ subject: string; body: string }>("POST", "/api/ai", { tool: "mailReply", input: { from: `${m.from.name} <${m.from.email}>`, subject: m.subject, text: m.text, intent } });
    setBusy(null);
    if (r) {
      setBody(r.body);
      setSubject(r.subject || subject);
      setReplying(true);
    }
  }
  async function send() {
    setBusy("send");
    const r = await api("POST", "/api/mail/send", { to: m.from.email, subject, text: body, inReplyTo: m.messageId, references: m.references, uid: m.id });
    setBusy(null);
    if (r) {
      toast.success("Réponse envoyée.");
      setReplying(false);
      onSent();
    }
  }

  return (
    <Card pad={false}>
      <div className="border-b border-line px-5 py-4">
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="ghost" className="lg:hidden" icon={<ArrowLeft className="size-4" />} onClick={onBack}>
            Retour
          </Button>
          <Button size="sm" variant="ghost" icon={<Reply className="size-4" />} onClick={() => setReplying(true)}>
            Répondre
          </Button>
          <Button size="sm" variant="ghost" icon={m.done ? <Mail className="size-4" /> : <Check className="size-4" />} onClick={() => act(m, m.done ? "undone" : "done")}>
            {m.done ? "Remettre à traiter" : "Marquer traité"}
          </Button>
          <Button size="sm" variant="ghost" icon={<Archive className="size-4" />} onClick={() => act(m, "archive")}>
            Archiver
          </Button>
          <Button size="sm" variant="ghost" icon={<MailOpen className="size-4" />} onClick={() => act(m, m.seen ? "unseen" : "seen")}>
            {m.seen ? "Non lu" : "Lu"}
          </Button>
        </div>
        <h2 className="font-display text-[20px] leading-snug font-bold">{m.subject}</h2>
        <p className="mt-1 text-[13.5px] text-ink-2">
          <span className="font-semibold text-ink">{m.from.name}</span> &lt;{m.from.email}&gt; · {dateTime(m.date)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select className="field h-8 w-auto py-0 text-[13px]" value={m.priority} onChange={(e) => act(m, "priority", Number(e.target.value))} aria-label="Priorité">
            {[5, 4, 3, 2, 1].map((p) => (
              <option key={p} value={p}>
                {PRIORITY[p].label}
              </option>
            ))}
          </select>
          <select className="field h-8 w-auto py-0 text-[13px]" value={m.category} onChange={(e) => act(m, "category", e.target.value)} aria-label="Catégorie">
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          {m.reasons.map((r) => (
            <Badge key={r}>{r}</Badge>
          ))}
        </div>
        {(m.summary || m.action) && (
          <div className="mt-3 rounded-xl bg-violet-soft px-4 py-3 text-[13.5px] text-violet">
            {m.summary && <p>{m.summary}</p>}
            {m.action && <p className="mt-1 font-semibold">À faire : {m.action}</p>}
          </div>
        )}
      </div>
      <div className="max-h-[52dvh] overflow-y-auto px-5 py-4 text-[14.5px] leading-relaxed whitespace-pre-wrap">{m.text || m.snippet}</div>

      <div className="border-t border-line px-5 py-4">
        {!replying ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="field" placeholder="Ce que tu veux répondre (facultatif) : ex. oui pour jeudi 14 h" value={intent} onChange={(e) => setIntent(e.target.value)} onKeyDown={(e) => e.key === "Enter" && draft()} />
            <Button variant="primary" icon={<Sparkles className="size-4" />} loading={busy === "ai"} onClick={draft}>
              Rédiger la réponse
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATES.map((t) => (
                <button key={t.label} onClick={() => setBody(t.body.replace("{prenom}", first))} className="rounded-full border border-line px-2.5 py-1 text-[12.5px] text-ink-2 hover:border-violet hover:text-violet">
                  {t.label}
                </button>
              ))}
              <button onClick={draft} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[12.5px] text-violet hover:border-violet">
                <Sparkles className="size-3" /> {busy === "ai" ? "Rédaction…" : "Rédiger avec l'IA"}
              </button>
            </div>
            <Field label="Objet">
              <input className="field" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
            <textarea className="field h-56" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ta réponse…" />
            {body.includes("[À COMPLÉTER]") && <p className="text-[13px] text-honey">Complète les passages [À COMPLÉTER] avant d&apos;envoyer.</p>}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setReplying(false)}>
                Annuler
              </Button>
              <Button variant="primary" icon={<Send className="size-4" />} loading={busy === "send"} disabled={!body.trim() || body.includes("[À COMPLÉTER]")} onClick={send}>
                Envoyer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

const WEEK = [
  { v: 1, l: "L" },
  { v: 2, l: "M" },
  { v: 3, l: "M" },
  { v: 4, l: "J" },
  { v: 5, l: "V" },
  { v: 6, l: "S" },
  { v: 7, l: "D" },
];

function AutoReplyModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const { data } = useApi<{ autoReply: AutoReplySettings; signature: string }>(open ? "/api/settings" : null);
  if (!data)
    return (
      <Modal open={open} onClose={onClose} title="Réponse automatique">
        <Skeleton className="h-60" />
      </Modal>
    );
  return <AutoReplyForm key={JSON.stringify(data.autoReply)} initial={data.autoReply} signature={data.signature} open={open} onClose={onClose} onSaved={onSaved} />;
}

function AutoReplyForm({ initial, signature, open, onClose, onSaved }: { initial: AutoReplySettings; signature: string; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [ar, setAr] = useState<AutoReplySettings>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const set = (p: Partial<AutoReplySettings>) => setAr({ ...ar, ...p });
  const preview = ar.body.replace("{prenom}", "Sophie").replace("{sujet}", "Question sur mon abonnement").replace("{signature}", signature);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Réponse automatique"
      wide
      footer={
        <>
          <Button
            loading={busy === "test"}
            onClick={async () => {
              setBusy("test");
              await api("PUT", "/api/settings", { autoReply: ar });
              const r = await api<{ sentTo: string }>("POST", "/api/mail/autoreply");
              setBusy(null);
              if (r) toast.success(`Exemple envoyé à ${r.sentTo}`);
            }}
          >
            M&apos;envoyer un exemple
          </Button>
          <Button
            variant="primary"
            loading={busy === "save"}
            onClick={async () => {
              setBusy("save");
              const r = await api("PUT", "/api/settings", { autoReply: ar });
              setBusy(null);
              if (r) {
                toast.success("Réponse automatique enregistrée.");
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
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-xl bg-surface-2 p-4">
          <div>
            <p className="font-semibold">Envoyer un accusé de réception</p>
            <p className="text-[13px] text-ink-2">Chaque nouveau mail reçoit ta réponse type. Jamais aux newsletters, notifications ou envois automatiques, et une seule fois par expéditeur sur la période choisie.</p>
          </div>
          <Toggle checked={ar.enabled} onChange={(enabled) => set({ enabled })} label="Activer" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quand">
            <select className="field" value={ar.mode} onChange={(e) => set({ mode: e.target.value as AutoReplySettings["mode"] })}>
              <option value="toujours">Toujours</option>
              <option value="hors-horaires">Seulement hors horaires</option>
            </select>
          </Field>
          <Field label="Pas plus d'une fois par expéditeur tous les">
            <div className="flex items-center gap-2">
              <input type="number" min={0} max={60} className="field w-24" value={ar.cooldownDays} onChange={(e) => set({ cooldownDays: Number(e.target.value) })} />
              <span className="text-[14px] text-ink-2">jours</span>
            </div>
          </Field>
        </div>
        {ar.mode === "hors-horaires" && (
          <div className="flex flex-wrap items-end gap-4">
            <Field label="Ouvert de">
              <input type="time" className="field" value={ar.hours.start} onChange={(e) => set({ hours: { ...ar.hours, start: e.target.value } })} />
            </Field>
            <Field label="à">
              <input type="time" className="field" value={ar.hours.end} onChange={(e) => set({ hours: { ...ar.hours, end: e.target.value } })} />
            </Field>
            <div className="flex gap-1">
              {WEEK.map((d) => (
                <button
                  key={d.v}
                  onClick={() => set({ hours: { ...ar.hours, days: ar.hours.days.includes(d.v) ? ar.hours.days.filter((x) => x !== d.v) : [...ar.hours.days, d.v] } })}
                  className={cx("size-9 rounded-lg text-[13px] font-semibold", ar.hours.days.includes(d.v) ? "bg-violet text-white" : "bg-bg-2 text-ink-3")}
                >
                  {d.l}
                </button>
              ))}
            </div>
          </div>
        )}
        <Field label="Message" hint="Variables : {prenom} (prénom de l'expéditeur), {sujet} (objet du mail), {signature}.">
          <textarea className="field h-48" value={ar.body} onChange={(e) => set({ body: e.target.value })} />
        </Field>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink-2">Ne pas répondre aux catégories</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(CATEGORIES) as MailCategory[]).map((c) => {
              const on = ar.skipCategories.includes(c);
              return (
                <button key={c} onClick={() => set({ skipCategories: on ? ar.skipCategories.filter((x) => x !== c) : [...ar.skipCategories, c] })} className={cx("rounded-full px-2.5 py-1 text-[12.5px] font-semibold", on ? "bg-coral-soft text-coral" : "bg-bg-2 text-ink-2")}>
                  {on && <CheckCheck className="mr-1 inline size-3" />}
                  {CATEGORIES[c]}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-ink-2">Aperçu</p>
          <div className="rounded-xl border border-line bg-surface-2 p-4 text-[14px] whitespace-pre-line">{preview}</div>
        </div>
      </div>
    </Modal>
  );
}

export default function MailsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <MailsInner />
    </Suspense>
  );
}
