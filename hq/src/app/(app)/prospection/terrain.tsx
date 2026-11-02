"use client";
import { Check, Copy, Map as MapIcon, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Empty, Segmented, cx } from "@/components/ui";
import { SCRIPTS, fill, kindOf, routeLink, walkingOrder } from "@/lib/channels";
import { flag } from "@/lib/format";
import type { Prospect } from "@/lib/types";
import { ContactActions } from "./contact";

const PAGE = 10;

/** Tournée à pied : les commerces d'une ville dans l'ordre de passage, 10 par tournée. */
export function Terrain({ all, onOpen, onChange }: { all: Prospect[]; onOpen: (id: string) => void; onChange: () => void }) {
  const cities = useMemo(() => {
    const m = new Map<string, { city: string; country: string; n: number }>();
    for (const p of all) {
      if (p.status === "exclu" || p.score === "ecarte" || !(p.lat || p.address)) continue;
      const k = p.country + "|" + p.city;
      m.set(k, { city: p.city, country: p.country, n: (m.get(k)?.n ?? 0) + 1 });
    }
    return [...m.values()].sort((a, b) => Number(b.country === "MA") - Number(a.country === "MA") || Number(b.city === "Agadir") - Number(a.city === "Agadir") || b.n - a.n);
  }, [all]);
  const [city, setCity] = useState(cities[0] ? `${cities[0].country}|${cities[0].city}` : "");
  const [filter, setFilter] = useState<"todo" | "all">("todo");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    const [cc, name] = city.split("|");
    const here = all.filter((p) => p.country === cc && p.city === name && p.status !== "exclu" && p.score !== "ecarte");
    const todo = filter === "todo" ? here.filter((p) => !p.touches?.some((t) => t.channel === "visite") && !["client", "refus"].includes(p.status)) : here;
    return walkingOrder(todo);
  }, [all, city, filter]);
  const round = list.slice(page * PAGE, page * PAGE + PAGE);
  const pitch = SCRIPTS.find((s) => s.id === "visit-1")!;

  if (!cities.length)
    return (
      <Card>
        <Empty title="Aucun commerce avec une adresse">Lance une recherche OpenStreetMap : les fiches arrivent avec leur position.</Empty>
      </Card>
    );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] print:block">
      <Card
        title={`Tournée ${page + 1} sur ${Math.max(1, Math.ceil(list.length / PAGE))} · ${round.length} arrêts`}
        action={
          <div className="flex gap-1.5 print:hidden">
            {round.length > 1 && (
              <a href={routeLink(round)} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-violet px-3 text-[13px] font-semibold text-white">
                <MapIcon className="size-3.5" /> Itinéraire
              </a>
            )}
            <Button size="sm" icon={<Printer className="size-3.5" />} onClick={() => window.print()}>
              Imprimer
            </Button>
          </div>
        }
        pad={false}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 py-3 print:hidden">
          <select className="field h-9 w-auto py-1" value={city} onChange={(e) => (setCity(e.target.value), setPage(0))}>
            {cities.map((c) => (
              <option key={c.country + c.city} value={`${c.country}|${c.city}`}>
                {flag(c.country)} {c.city} ({c.n})
              </option>
            ))}
          </select>
          <Segmented size="sm" value={filter} onChange={(v) => (setFilter(v), setPage(0))} options={[{ value: "todo", label: "Pas encore visités" }, { value: "all", label: "Tous" }]} />
          <div className="ml-auto flex gap-1">
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
              Précédente
            </Button>
            <Button size="sm" variant="ghost" disabled={(page + 1) * PAGE >= list.length} onClick={() => setPage(page + 1)}>
              Suivante
            </Button>
          </div>
        </div>
        <ol className="divide-y divide-line">
          {round.map((p, i) => {
            const visited = p.touches?.some((t) => t.channel === "visite");
            return (
              <li key={p.id} className={cx("flex gap-3 px-5 py-3", visited && "opacity-60")}>
                <span className={cx("grid size-7 shrink-0 place-items-center rounded-full text-[12.5px] font-bold", visited ? "bg-mint text-white" : "bg-violet-soft text-violet")}>{visited ? <Check className="size-3.5" /> : i + 1 + page * PAGE}</span>
                <div className="min-w-0 flex-1">
                  <button className="text-left" onClick={() => onOpen(p.id)}>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-[12.5px] text-ink-3">
                      {kindOf(p.type)}
                      {p.address ? ` · ${p.address}` : ""}
                      {p.hours ? ` · ${p.hours}` : ""}
                    </p>
                  </button>
                  {p.phone && <p className="text-[12.5px] text-ink-2">{p.phone}</p>}
                </div>
                <div className="print:hidden">
                  <ContactActions p={p} onChange={onChange} size="sm" />
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <div className="space-y-5 print:mt-6">
        <Card title="Le pitch en boutique" action={<Copier text={pitch.body} />}>
          <p className="mb-2 text-[12.5px] text-ink-3">{pitch.when}</p>
          <p className="text-[13.5px] whitespace-pre-line text-ink-2">{pitch.body}</p>
        </Card>
        <Card title="Dans le sac" action={<Badge tone="honey">Checklist</Badge>}>
          <ul className="space-y-1.5 text-[13.5px] text-ink-2">
            <li>iPhone chargé, carte de démo prête dans le Wallet et l&apos;app ouverte sur le scan.</li>
            <li>5 affiches de démo imprimées (QR de test) à laisser aux hésitants.</li>
            <li>Une notification de démo prête à envoyer devant le gérant.</li>
            <li>Le message WhatsApp de suivi : {fill(SCRIPTS[1].body, round[0] ?? { name: "votre commerce", city: "", type: "" }).slice(0, 60)}…</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

export function Copier({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      icon={ok ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        toast.success("Copié");
        setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? "Copié" : "Copier"}
    </Button>
  );
}

export function Scripts() {
  const TONE = { whatsapp: "mint", mail: "violet", instagram: "coral", appel: "sky", visite: "honey" } as const;
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {SCRIPTS.map((s) => (
        <Card key={s.id} title={s.title} action={<Copier text={(s.subject ? `Objet : ${s.subject}\n\n` : "") + s.body} />}>
          <Badge tone={TONE[s.channel]}>{s.channel}</Badge>
          <p className="mt-2 text-[12.5px] text-ink-3">{s.when}</p>
          {s.subject && <p className="mt-3 text-[13.5px] font-semibold">Objet : {s.subject}</p>}
          <p className="mt-2 text-[13.5px] whitespace-pre-line text-ink-2">{s.body}</p>
        </Card>
      ))}
      <p className="px-1 text-[12.5px] text-ink-3 lg:col-span-2">
        {"{nom}"}, {"{ville}"} et {"{type}"} sont remplacés automatiquement quand tu passes par les boutons WhatsApp ou mail d&apos;un commerce. Règle : un seul message, une seule relance, et on arrête dès qu&apos;on nous dit non.
      </p>
    </div>
  );
}
