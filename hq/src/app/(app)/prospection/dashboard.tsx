"use client";
import { AtSign, Mail, MapPin, MessageCircle, Phone, Smartphone, Store, Target } from "lucide-react";
import { Badge, Card, Empty, cx } from "@/components/ui";
import { mobile } from "@/lib/channels";
import { flag, relative } from "@/lib/format";
import type { Prospect } from "@/lib/types";
import { ContactActions } from "./contact";

const CONTACTED = ["contacte", "envoye", "relance1", "relance2", "repondu", "interesse", "refus", "client"];
const ORDER = { chaud: 0, tiede: 1, froid: 2, ecarte: 3 };

export function Dashboard({
  all,
  android,
  types,
  onOpen,
  onChange,
  onTab,
}: {
  all: Prospect[];
  android: { email: string; type: string; city: string; at: string }[];
  types: Record<string, string>;
  onOpen: (id: string) => void;
  onChange: () => void;
  onTab: (t: string) => void;
}) {
  const live = all.filter((p) => p.status !== "exclu" && p.score !== "ecarte");
  const todayIso = new Date().toISOString();
  const kpi = [
    { l: "Établissements", v: live.length, icon: <Target className="size-4" /> },
    { l: "WhatsApp possible", v: live.filter((p) => p.phone && mobile(p)).length, icon: <MessageCircle className="size-4" /> },
    { l: "Par mail", v: live.filter((p) => p.email).length, icon: <Mail className="size-4" /> },
    { l: "Par téléphone", v: live.filter((p) => p.phone).length, icon: <Phone className="size-4" /> },
    { l: "Sur Instagram", v: live.filter((p) => p.instagram).length, icon: <AtSign className="size-4" /> },
    { l: "À visiter (Maroc)", v: live.filter((p) => p.country === "MA" && (p.address || p.lat)).length, icon: <Store className="size-4" /> },
  ];
  const funnel = [
    { l: "À contacter", v: live.filter((p) => p.status === "nouveau" || p.status === "pret" || p.status === "approuve").length },
    { l: "Contactés", v: live.filter((p) => CONTACTED.includes(p.status)).length },
    { l: "Ont répondu", v: live.filter((p) => ["repondu", "interesse", "client"].includes(p.status)).length },
    { l: "Intéressés", v: live.filter((p) => ["interesse", "client"].includes(p.status)).length },
    { l: "Clients", v: live.filter((p) => p.status === "client").length },
  ];
  const max = Math.max(1, funnel[0].v + funnel[1].v);

  // Les meilleurs à contacter aujourd'hui : chauds d'abord, avec un canal direct.
  const next = live
    .filter((p) => p.status === "nouveau" && (p.phone || p.email || p.instagram))
    .sort((a, b) => ORDER[a.score] - ORDER[b.score] || Number(!!(b.phone && mobile(b))) - Number(!!(a.phone && mobile(a))))
    .slice(0, 8);
  const followUps = live.filter((p) => p.nextAction && p.nextAction.at <= todayIso && !["client", "refus"].includes(p.status)).slice(0, 8);

  const byCity = Object.values(
    live.reduce<Record<string, { city: string; country: string; n: number; reach: number; done: number }>>((acc, p) => {
      const k = p.country + p.city;
      acc[k] ??= { city: p.city, country: p.country, n: 0, reach: 0, done: 0 };
      acc[k].n++;
      if (p.phone || p.email || p.instagram) acc[k].reach++;
      if (CONTACTED.includes(p.status)) acc[k].done++;
      return acc;
    }, {}),
  ).sort((a, b) => b.n - a.n);

  if (!all.length)
    return (
      <Card>
        <Empty icon={<Target className="size-5" />} title="Aucun établissement pour l'instant">
          Lance une recherche (onglet Recherche) ou importe une liste.
        </Empty>
      </Card>
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {kpi.map((k) => (
          <div key={k.l} className="glass rounded-[20px] p-4">
            <p className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
              <span className="text-violet">{k.icon}</span>
              {k.l}
            </p>
            <p className="font-display tnum mt-1.5 text-[26px] leading-none font-bold">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="À contacter aujourd'hui" action={<button onClick={() => onTab("liste")} className="text-[13px] font-semibold text-violet hover:underline">Toute la liste</button>} pad={false}>
          {next.length ? (
            <ul className="divide-y divide-line">
              {next.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(p.id)}>
                    <p className="truncate text-[14px] font-semibold">{p.name}</p>
                    <p className="truncate text-[12.5px] text-ink-3">
                      {types[p.type] ?? p.type} · {flag(p.country)} {p.city}
                    </p>
                  </button>
                  <Badge tone={p.score === "chaud" ? "coral" : p.score === "tiede" ? "honey" : "sky"}>{p.score === "chaud" ? "Chaud" : p.score === "tiede" ? "Tiède" : "Froid"}</Badge>
                  <ContactActions p={p} onChange={onChange} size="sm" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-[14px] text-ink-2">Tout le monde a été contacté. Lance une nouvelle recherche.</p>
          )}
          <p className="border-t border-line px-5 py-3 text-[12.5px] text-ink-3">
            Rythme conseillé : 10 WhatsApp + 10 mails par jour, 5 visites par semaine à Agadir. Chaque clic sur un bouton est noté, et une relance est proposée 3 jours après.
          </p>
        </Card>

        <div className="space-y-5">
          <Card title="L'entonnoir">
            <div className="space-y-2.5">
              {funnel.map((f) => (
                <div key={f.l}>
                  <div className="flex justify-between text-[13px]">
                    <span>{f.l}</span>
                    <span className="tnum font-semibold">{f.v}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-2">
                    <div className="h-full rounded-full bg-violet" style={{ width: `${Math.max(f.v ? 2 : 0, (f.v / max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Relances du jour" pad={false}>
            {followUps.length ? (
              <ul className="divide-y divide-line">
                {followUps.map((p) => (
                  <li key={p.id} className="flex items-center gap-2 px-5 py-2.5">
                    <button className="min-w-0 flex-1 text-left" onClick={() => onOpen(p.id)}>
                      <p className="truncate text-[13.5px] font-semibold">{p.name}</p>
                      <p className="text-[12px] text-ink-3">
                        {p.nextAction!.label} · {relative(p.nextAction!.at)}
                      </p>
                    </button>
                    <ContactActions p={p} onChange={onChange} size="sm" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-5 text-[13.5px] text-ink-2">Aucune relance due.</p>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Par ville" pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-[13.5px]">
              <thead className="text-left text-ink-3">
                <tr className="border-b border-line">
                  <th className="px-5 py-2 font-semibold">Ville</th>
                  <th className="px-3 py-2 text-right font-semibold">Établissements</th>
                  <th className="px-3 py-2 text-right font-semibold">Joignables</th>
                  <th className="px-5 py-2 font-semibold">Contactés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {byCity.map((c) => (
                  <tr key={c.country + c.city}>
                    <td className="px-5 py-2.5 font-semibold">
                      {flag(c.country)} {c.city}
                    </td>
                    <td className="tnum px-3 py-2.5 text-right">{c.n}</td>
                    <td className="tnum px-3 py-2.5 text-right">{c.reach}</td>
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-bg-2">
                          <div className={cx("h-full rounded-full", c.done ? "bg-mint" : "bg-transparent")} style={{ width: `${(c.done / c.n) * 100}%` }} />
                        </div>
                        <span className="tnum text-[12.5px] text-ink-3">{c.done}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-5">
          <Card title="Tournée terrain" action={<MapPin className="size-4 text-violet" />}>
            <p className="text-[14px] text-ink-2">Les commerces d&apos;Agadir et des autres villes du Maroc, rangés dans l&apos;ordre de passage, avec l&apos;itinéraire à pied et le pitch de visite.</p>
            <button onClick={() => onTab("terrain")} className="mt-3 text-[13.5px] font-semibold text-violet hover:underline">
              Préparer ma tournée
            </button>
          </Card>
          <Card title={`Liste Android · ${android.length}`} action={<Smartphone className="size-4 text-violet" />}>
            {android.length ? (
              <ul className="space-y-1.5 text-[13px]">
                {android.slice(0, 5).map((a) => (
                  <li key={a.email} className="flex justify-between gap-2">
                    <span className="truncate">{a.email}</span>
                    <span className="shrink-0 text-ink-3">
                      {a.type}
                      {a.city ? ` · ${a.city}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13.5px] text-ink-2">Les commerçants sur Android qui laissent leur adresse sur keeplyfidelity.app/android apparaissent ici. Ils recevront le mail « Keeply est disponible sur Android ».</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
