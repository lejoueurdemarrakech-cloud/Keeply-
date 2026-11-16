"use client";
import { Bot, Building2, MapPin, Radar, Target, UserRoundSearch } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Field, cx } from "@/components/ui";
import { api } from "@/lib/client";
import { flag } from "@/lib/format";
import type { Prospect } from "@/lib/types";

export interface SearchData {
  searchSource: string;
  countries: Record<string, { name: string; lang: string }>;
  priorityCountries?: string[];
  liveCountries?: string[];
  apollo?: boolean;
  types: Record<string, string>;
}

type Source = "quartier" | "apollo" | "harvey";

const CONTACTED = ["contacte", "envoye", "relance1", "relance2", "repondu", "interesse", "refus", "client"];

/** Objectif du mois (stratégie v7) : les chiffres viennent de la liste réelle. */
export function Objective({ all }: { all: Prospect[] }) {
  const live = all.filter((p) => p.status !== "exclu" && p.score !== "ecarte");
  const goals = [
    { l: "Prospects contactés", v: live.filter((p) => CONTACTED.includes(p.status)).length, goal: 300 },
    { l: "Intéressés (démo)", v: live.filter((p) => ["interesse", "client"].includes(p.status)).length, goal: 25 },
    { l: "Commerces actifs", v: live.filter((p) => p.status === "client").length, goal: 10 },
  ];
  return (
    <Card className="mb-5" title="Objectif de décembre" action={<Target className="size-4 text-violet" />}>
      <div className="grid gap-4 sm:grid-cols-3">
        {goals.map((g) => (
          <div key={g.l}>
            <div className="flex items-baseline justify-between text-[13.5px]">
              <span className="font-semibold">{g.l}</span>
              <span className="tnum text-ink-3">
                {g.v} / {g.goal}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-bg-2">
              <div className="h-full rounded-full bg-violet transition-[width] duration-500" style={{ width: `${Math.min(100, (g.v / g.goal) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[12.5px] text-ink-3">
        Rythme : 75 prospects contactés par semaine (DM, e-mails personnalisés, WhatsApp, visites), environ 6 démos par semaine. Priorité France et Maroc, puis les pays où l’app est en ligne.
      </p>
    </Card>
  );
}

export function SearchPanel({ data, onDone }: { data: SearchData; onDone: () => void }) {
  const priority = data.priorityCountries ?? ["FR", "MA"];
  const live = data.liveCountries ?? [];
  const [source, setSource] = useState<Source>("quartier");
  const [country, setCountry] = useState("FR");
  const [cities, setCities] = useState("");
  const [types, setTypes] = useState<string[]>(["fastfood", "cafe", "restaurant"]);
  const [limit, setLimit] = useState(30);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const others = Object.keys(data.countries).filter((k) => !priority.includes(k) && !live.includes(k));

  async function run() {
    const list = cities.split(/[,\n;]/).map((c) => c.trim()).filter(Boolean);
    if (source === "quartier" && !list.length) return toast.error("Indique au moins une ville.");
    if (source === "apollo" && !data.apollo) return toast.error("Connecte d’abord Apollo dans Connexions.");
    setBusy(true);
    setLog([]);
    for (const city of list.length ? list : [""]) {
      const label = city || data.countries[country]?.name;
      setLog((l) => [...l, `${label} : recherche en cours…`]);
      if (source === "apollo") {
        const r = await api<{ added: number; duplicates: number; withContact: number }>("POST", "/api/prospects/apollo", { country, city, types, limit });
        setLog((l) => [...l.slice(0, -1), r ? `${label} : ${r.added} commerces ajoutés, dont ${r.withContact} avec un gérant identifié (${r.duplicates} déjà connus)` : `${label} : échec`]);
      } else {
        const r = await api<{ added: number; duplicates: number; withEmail: number; notice?: string }>("POST", "/api/prospects/search", { country, city, types, limit });
        setLog((l) => [...l.slice(0, -1), r ? `${label} : ${r.added} ajoutés (${r.withEmail} avec mail), ${r.duplicates} déjà connus${r.notice ? `. ${r.notice}` : ""}` : `${label} : échec`]);
      }
      onDone();
    }
    setBusy(false);
  }

  const SOURCES: { v: Source; icon: React.ReactNode; t: string; d: string; badge?: React.ReactNode }[] = [
    { v: "quartier", icon: <MapPin className="size-5" />, t: "Commerces du quartier", d: `Tous les cafés, snacks et restos d’une ville (${data.searchSource}). Le site de chacun est lu pour trouver l’e-mail, l’Instagram et des indices.` },
    { v: "apollo", icon: <UserRoundSearch className="size-5" />, t: "Gérants et petites chaînes", d: "Apollo trouve le gérant, le fondateur ou le franchisé (nom, poste, LinkedIn). L’e-mail se révèle ensuite au cas par cas (1 crédit).", badge: data.apollo ? <Badge tone="mint">Connecté</Badge> : <Badge tone="coral">À connecter</Badge> },
    { v: "harvey", icon: <Bot className="size-5" />, t: "Harvey (sur le Mac)", d: "Harvey lit les sites en profondeur et prépare des mails, 40 par jour au maximum. Il remplit la même liste." },
  ];

  return (
    <Card className="rise mb-5" title="Trouver des commerces">
      <div className="grid gap-3 md:grid-cols-3">
        {SOURCES.map((s) => (
          <button
            key={s.v}
            onClick={() => setSource(s.v)}
            className={cx("rounded-2xl border p-4 text-left transition-colors", source === s.v ? "border-violet bg-violet/5" : "border-line hover:border-violet/40")}
          >
            <div className="flex items-center gap-2">
              <span className={cx("grid size-9 place-items-center rounded-xl", source === s.v ? "bg-violet text-white" : "bg-bg-2 text-ink-2")}>{s.icon}</span>
              <span className="text-[14.5px] font-semibold">{s.t}</span>
              <span className="ml-auto">{s.badge}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-ink-2">{s.d}</p>
          </button>
        ))}
      </div>

      {source === "harvey" ? (
        <div className="mt-4 rounded-xl bg-surface-2 p-4 text-[13.5px] text-ink-2">
          Harvey tourne sur ton Mac (pont HQ). Ouvre sa page pour lancer une recherche, valider ses brouillons et suivre ses envois.
          <div className="mt-3">
            <Link href="/harvey" className="inline-flex h-9 items-center gap-2 rounded-xl bg-violet px-4 text-[13.5px] font-semibold text-white">
              <Bot className="size-4" /> Ouvrir Harvey
            </Link>
          </div>
        </div>
      ) : (
        <>
          {source === "apollo" && !data.apollo && (
            <div className="mt-4 rounded-xl border border-coral/30 bg-coral/5 p-3.5 text-[13.5px]">
              Apollo n’est pas encore branché. Crée une clé API dans Apollo (Settings › Integrations › API) puis colle-la dans{" "}
              <Link href="/connexions" className="font-semibold text-violet hover:underline">
                Connexions › Apollo
              </Link>
              .
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-[230px_minmax(0,1fr)_130px]">
            <Field label="Pays">
              <select className="field" value={country} onChange={(e) => setCountry(e.target.value)}>
                <optgroup label="Priorité">
                  {priority.map((k) => (
                    <option key={k} value={k}>
                      {flag(k)} {data.countries[k]?.name ?? k}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="App disponible">
                  {live.map((k) => (
                    <option key={k} value={k}>
                      {flag(k)} {data.countries[k]?.name ?? k}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="App pas encore disponible">
                  {others.map((k) => (
                    <option key={k} value={k}>
                      {flag(k)} {data.countries[k]?.name ?? k}
                    </option>
                  ))}
                </optgroup>
              </select>
            </Field>
            <Field label="Villes" hint={source === "apollo" ? "Facultatif : vide = tout le pays. Plusieurs villes séparées par des virgules." : "Sépare plusieurs villes par des virgules."}>
              <input className="field" placeholder={country === "MA" ? "Agadir, Marrakech, Casablanca" : "Lyon, Lille, Bordeaux"} value={cities} onChange={(e) => setCities(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} />
            </Field>
            <Field label="Par ville (max)">
              <input type="number" min={5} max={source === "apollo" ? 100 : 120} className="field" value={limit} onChange={(e) => setLimit(Number(e.target.value))} />
            </Field>
          </div>
          {others.includes(country) && <p className="mt-2 text-[12.5px] text-coral">Keeply n’est pas encore sur l’App Store dans ce pays : ces commerces ne pourront pas s’abonner pour l’instant.</p>}
          <div className="mt-4">
            <p className="mb-1.5 text-[13px] font-semibold text-ink-2">Types d’établissements</p>
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
            <p className="max-w-[62ch] text-[12.5px] text-ink-3">
              {source === "apollo"
                ? "La recherche Apollo ne consomme pas de crédits. Les commerces trouvés arrivent dans « Prospects » avec le nom et le poste du décideur ; tu révèles l’e-mail seulement pour ceux que tu veux contacter."
                : "Les grandes chaînes sont écartées. Chaque domaine d’e-mail est vérifié. Rien n’est envoyé sans ta validation."}
            </p>
            <Button variant="primary" icon={source === "apollo" ? <Building2 className="size-4" /> : <Radar className="size-4" />} loading={busy} onClick={run} disabled={!types.length || (source === "apollo" && !data.apollo)}>
              Trouver
            </Button>
          </div>
        </>
      )}
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

/** Bloc décideur dans la fiche d'un prospect (Apollo). */
export function ContactBlock({ p, onChange }: { p: Prospect; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  if (!p.contact) return null;
  return (
    <div className="rounded-xl border border-violet/25 bg-violet/5 px-3.5 py-3 text-[13.5px]">
      <p className="text-[12px] font-semibold text-ink-3">Décideur (Apollo)</p>
      <p className="mt-0.5 font-semibold">
        {p.contact.name || "Nom masqué"}
        {p.contact.title && <span className="font-normal text-ink-2"> · {p.contact.title}</span>}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {p.contact.linkedin && (
          <a href={p.contact.linkedin} target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-violet hover:underline">
            LinkedIn
          </a>
        )}
        {!p.email && (
          <Button
            size="sm"
            loading={busy}
            onClick={async () => {
              if (!confirm("Révéler l’e-mail de ce décideur ? Ça consomme 1 crédit Apollo.")) return;
              setBusy(true);
              const r = await api<Prospect>("POST", `/api/prospects/${p.id}/reveal`);
              setBusy(false);
              if (r?.email) toast.success(`E-mail trouvé : ${r.email}`);
              onChange();
            }}
          >
            Révéler l’e-mail (1 crédit)
          </Button>
        )}
      </div>
    </div>
  );
}
