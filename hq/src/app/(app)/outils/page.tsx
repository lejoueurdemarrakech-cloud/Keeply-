"use client";
import { Calculator, Link2, NotebookPen, Sparkles } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { TrendLine } from "@/components/charts";
import { Button, Card, CopyButton, Field, Markdown, PageHeader, Skeleton, Stat, Tabs } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { eur, num } from "@/lib/format";

type Tab = "calculs" | "utm" | "atelier" | "notes";

export default function ToolsPage() {
  const [tab, setTab] = useState<Tab>("calculs");
  return (
    <div>
      <PageHeader title="Outils" subtitle="Calculs de croissance, liens de suivi, atelier d'écriture et bloc-notes." />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "calculs", label: "Calculateurs", icon: <Calculator className="size-4" /> },
          { value: "utm", label: "Liens de suivi", icon: <Link2 className="size-4" /> },
          { value: "atelier", label: "Atelier d'écriture", icon: <Sparkles className="size-4" /> },
          { value: "notes", label: "Bloc-notes", icon: <NotebookPen className="size-4" /> },
        ]}
      />
      {tab === "calculs" && <Calculators />}
      {tab === "utm" && <Utm />}
      {tab === "atelier" && <Atelier />}
      {tab === "notes" && <Notes />}
    </div>
  );
}

function NumField({ label, value, onChange, suffix, step = 1 }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; step?: number }) {
  return (
    <Field label={label}>
      <div className="relative">
        <input type="number" step={step} className="field pr-10" value={value} onChange={(e) => onChange(Number(e.target.value))} />
        {suffix && <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[13px] text-ink-3">{suffix}</span>}
      </div>
    </Field>
  );
}

function Calculators() {
  const [p, setP] = useState({ mrr: 2400, newClients: 12, price: 29, churn: 3, months: 12, cac: 60, margin: 85 });
  const set = (k: keyof typeof p) => (v: number) => setP({ ...p, [k]: v });

  const projection = useMemo(() => {
    const rows = [];
    let customers = p.mrr / Math.max(1, p.price);
    for (let m = 0; m <= p.months; m++) {
      const d = new Date();
      d.setMonth(d.getMonth() + m);
      rows.push({ date: d.toISOString().slice(0, 10), mrr: Math.round(customers * p.price), clients: Math.round(customers) });
      customers = customers * (1 - p.churn / 100) + p.newClients;
    }
    return rows;
  }, [p]);
  const ltv = p.churn > 0 ? (p.price * (p.margin / 100)) / (p.churn / 100) : Infinity;
  const payback = p.cac / Math.max(0.01, p.price * (p.margin / 100));
  const ceiling = p.churn > 0 ? (p.newClients / (p.churn / 100)) * p.price : Infinity;
  const end = projection[projection.length - 1];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      <Card title="Hypothèses">
        <div className="space-y-3">
          <NumField label="MRR actuel" value={p.mrr} onChange={set("mrr")} suffix="€" />
          <NumField label="Nouveaux clients par mois" value={p.newClients} onChange={set("newClients")} />
          <NumField label="Prix moyen par client" value={p.price} onChange={set("price")} suffix="€/mois" />
          <NumField label="Départs par mois" value={p.churn} onChange={set("churn")} suffix="%" step={0.1} />
          <NumField label="Horizon" value={p.months} onChange={set("months")} suffix="mois" />
          <NumField label="Coût d'acquisition d'un client" value={p.cac} onChange={set("cac")} suffix="€" />
          <NumField label="Marge brute" value={p.margin} onChange={set("margin")} suffix="%" />
        </div>
      </Card>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Stat label={`MRR dans ${p.months} mois`} value={eur(end.mrr)} hint={`${num(end.clients)} clients`} tone="violet" />
          <Stat label="Valeur d'un client (LTV)" value={isFinite(ltv) ? eur(ltv) : "∞"} hint={`ratio LTV/CAC ${isFinite(ltv) ? (ltv / Math.max(1, p.cac)).toFixed(1).replace(".", ",") : "∞"}`} tone="honey" />
          <Stat label="Rentabilisé en" value={`${payback.toFixed(1).replace(".", ",")} mois`} hint="pour récupérer le coût d'acquisition" />
          <Stat label="Plafond de MRR" value={isFinite(ceiling) ? eur(ceiling) : "∞"} hint="là où les départs égalent les arrivées" tone="coral" />
        </div>
        <Card title="Projection du MRR">
          <TrendLine data={projection} dataKey="mrr" label="MRR" format={(n) => eur(n)} height={260} />
          <p className="mt-2 text-[13px] text-ink-2">
            Pour doubler ton plafond, il faut soit doubler les nouveaux clients, soit diviser les départs par deux. Les départs coûtent souvent moins cher à réduire.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Utm() {
  const [v, setV] = useState({ url: "https://keeply.app", source: "instagram", medium: "social", campaign: "lancement-rappels", content: "" });
  const link = useMemo(() => {
    try {
      const u = new URL(v.url);
      if (v.source) u.searchParams.set("utm_source", v.source);
      if (v.medium) u.searchParams.set("utm_medium", v.medium);
      if (v.campaign) u.searchParams.set("utm_campaign", v.campaign);
      if (v.content) u.searchParams.set("utm_content", v.content);
      return u.toString();
    } catch {
      return "";
    }
  }, [v]);
  const presets = [
    { l: "Bio Instagram", s: "instagram", m: "social", c: "bio" },
    { l: "Story", s: "instagram", m: "story", c: "story" },
    { l: "Pub Meta", s: "facebook", m: "paid", c: "meta-ads" },
    { l: "Mail de prospection", s: "prospection", m: "email", c: "cold-email" },
    { l: "Flyer QR code", s: "flyer", m: "print", c: "flyer" },
  ];
  return (
    <Card title="Créer un lien de suivi">
      <p className="mb-4 text-[13.5px] text-ink-2">Ajoute ces paramètres à tes liens pour savoir d&apos;où viennent les visites et les inscriptions dans tes statistiques web.</p>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button key={p.l} onClick={() => setV({ ...v, source: p.s, medium: p.m, campaign: p.c })} className="rounded-full bg-bg-2 px-3 py-1.5 text-[13px] font-semibold text-ink-2 hover:text-violet">
            {p.l}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Adresse de destination" className="md:col-span-2">
          <input className="field" value={v.url} onChange={(e) => setV({ ...v, url: e.target.value })} />
        </Field>
        <Field label="Source (utm_source)">
          <input className="field" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} />
        </Field>
        <Field label="Support (utm_medium)">
          <input className="field" value={v.medium} onChange={(e) => setV({ ...v, medium: e.target.value })} />
        </Field>
        <Field label="Campagne (utm_campaign)">
          <input className="field" value={v.campaign} onChange={(e) => setV({ ...v, campaign: e.target.value })} />
        </Field>
        <Field label="Variante (utm_content, facultatif)">
          <input className="field" value={v.content} onChange={(e) => setV({ ...v, content: e.target.value })} />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl bg-violet-soft px-4 py-3">
        <span className="min-w-0 flex-1 font-mono text-[13px] break-all text-violet">{link || "Adresse invalide"}</span>
        {link && <CopyButton text={link} />}
      </div>
    </Card>
  );
}

const PRESETS: { value: string; label: string; placeholder: string }[] = [
  { value: "aso", label: "Fiche App Store / Play", placeholder: "Points forts à mettre en avant (facultatif)" },
  { value: "nouveautes", label: "Notes de version", placeholder: "Liste des changements de la version" },
  { value: "linkedin", label: "Post LinkedIn", placeholder: "Sujet ou anecdote" },
  { value: "newsletter", label: "Newsletter clients", placeholder: "Sujet de la newsletter" },
  { value: "faq", label: "Réponse de FAQ", placeholder: "La question" },
  { value: "sms", label: "SMS pour un café client", placeholder: "Occasion : happy hour, nouveau menu…" },
  { value: "pitch", label: "Pitch oral + objections", placeholder: "Contexte : salon, porte-à-porte…" },
  { value: "libre", label: "Demande libre", placeholder: "Ce que tu veux écrire" },
];

function Atelier() {
  const [preset, setPreset] = useState("aso");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const cur = PRESETS.find((p) => p.value === preset)!;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <Card title="Que veux-tu écrire ?">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.value} onClick={() => setPreset(p.value)} className={`rounded-full px-3 py-1.5 text-[13px] font-semibold ${preset === p.value ? "bg-violet text-white" : "bg-bg-2 text-ink-2 hover:text-ink"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <textarea className="field mt-4 h-40" placeholder={cur.placeholder} value={text} onChange={(e) => setText(e.target.value)} />
        <Button
          className="mt-3"
          variant="primary"
          icon={<Sparkles className="size-4" />}
          loading={busy}
          onClick={async () => {
            setBusy(true);
            const r = await api<{ text: string }>("POST", "/api/ai", { tool: "atelier", input: { preset, text } });
            setBusy(false);
            if (r) setOut(r.text);
          }}
        >
          Écrire
        </Button>
      </Card>
      <Card title="Résultat" action={out ? <CopyButton text={out} /> : undefined}>
        {busy ? <Skeleton className="h-48" /> : out ? <Markdown text={out} /> : <p className="text-[14px] text-ink-3">Le texte apparaîtra ici.</p>}
      </Card>
    </div>
  );
}

function Notes() {
  const { data } = useApi<{ text: string }>("/api/notes", { revalidateIfStale: false });
  if (!data)
    return (
      <Card title="Bloc-notes">
        <Skeleton className="h-96" />
      </Card>
    );
  return <NotesEditor initial={data.text} />;
}

function NotesEditor({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(true);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const change = (v: string) => {
    setText(v);
    setSaved(false);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await api("PUT", "/api/notes", { text: v }, { silent: true });
      setSaved(true);
    }, 700);
  };
  return (
    <Card title="Bloc-notes" action={<span className="text-[12.5px] text-ink-3">{saved ? "Enregistré" : "Enregistrement…"}</span>}>
      <textarea className="field h-[60dvh] font-[450]" placeholder="Idées, numéros, choses à ne pas oublier…" value={text} onChange={(e) => change(e.target.value)} />
    </Card>
  );
}
