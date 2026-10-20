"use client";
import { AlertTriangle, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, DemoBadge, Empty, Field, Modal, PageHeader, Segmented, Skeleton, Stat, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import { dateShort, eur, num, relative } from "@/lib/format";
import type { Client } from "@/lib/types";

const STATUS: Record<Client["status"], { label: string; tone: "violet" | "mint" | "honey" | "neutral" }> = {
  essai: { label: "Essai", tone: "violet" },
  actif: { label: "Actif", tone: "mint" },
  pause: { label: "En pause", tone: "honey" },
  resilie: { label: "Résilié", tone: "neutral" },
};

const blank = (): Client => ({ id: "c" + Date.now().toString(36), name: "", city: "", contact: "", email: "", phone: "", plan: "Essai", mrr: 0, status: "essai", since: new Date().toISOString().slice(0, 10), cards: 0, notes: "", tags: [] });

/** Signaux de risque de départ, à partir de ce qu'on sait du client. */
function risks(c: Client) {
  const out: string[] = [];
  const age = (Date.now() - new Date(c.since).getTime()) / 864e5;
  if (c.status === "essai" && age > 10) out.push("Essai bientôt fini : appelle-le");
  if (c.status === "actif" && c.cards < 30 && age > 45) out.push("Peu de cartes clients : aide-le à mettre le QR en avant");
  if (c.lastActivity && (Date.now() - new Date(c.lastActivity).getTime()) / 864e5 > 14) out.push("Aucune activité depuis 2 semaines");
  if (c.status === "pause") out.push("En pause : propose de repartir");
  return out;
}

export default function ClientsPage() {
  const { data, mutate, isLoading } = useApi<{ clients: Client[]; demo: boolean }>("/api/clients");
  const [edit, setEdit] = useState<Client | null>(null);
  const [filter, setFilter] = useState<"tous" | Client["status"]>("tous");
  const [q, setQ] = useState("");
  const clients = useMemo(() => data?.clients ?? [], [data]);

  const list = useMemo(() => clients.filter((c) => (filter === "tous" || c.status === filter) && `${c.name} ${c.city} ${c.contact} ${c.email}`.toLowerCase().includes(q.toLowerCase())), [clients, filter, q]);
  const active = clients.filter((c) => c.status === "actif");
  const mrr = active.reduce((s, c) => s + c.mrr, 0);
  const churned = clients.filter((c) => c.status === "resilie").length;

  async function save(next: Client[]) {
    mutate({ clients: next, demo: false }, { revalidate: false });
    await api("PUT", "/api/clients", next);
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={
          <>
            Les établissements qui utilisent Keeply : abonnement, contact, et ceux à appeler avant qu&apos;ils partent. <DemoBadge show={!!data?.demo} />
          </>
        }
        actions={
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={() => setEdit(blank())}>
            Ajouter
          </Button>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="Clients actifs" value={active.length} tone="mint" />
        <Stat label="MRR des clients" value={eur(mrr)} hint={`${eur(active.length ? mrr / active.length : 0)} en moyenne`} tone="honey" />
        <Stat label="En essai" value={clients.filter((c) => c.status === "essai").length} tone="violet" />
        <Stat label="Taux de départ" value={clients.length ? `${Math.round((churned / clients.length) * 100)} %` : "—"} hint={`${churned} résilié(s)`} tone="coral" />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <Segmented value={filter} onChange={setFilter} size="sm" options={[{ value: "tous", label: "Tous" }, { value: "actif", label: "Actifs" }, { value: "essai", label: "Essais" }, { value: "pause", label: "En pause" }, { value: "resilie", label: "Résiliés" }]} />
        <div className="relative ml-auto w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
          <input className="field h-9 py-1 pl-9" placeholder="Rechercher" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <Card pad={false}>
        {isLoading ? (
          <Skeleton className="m-5 h-40" />
        ) : list.length === 0 ? (
          <Empty title="Aucun client" action={<Button onClick={() => setEdit(blank())}>Ajouter un client</Button>}>Ajoute tes établissements clients pour suivre leur abonnement et les risques de départ.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-[13.5px]">
              <thead className="text-left text-ink-3">
                <tr className="border-b border-line">
                  <th className="px-5 py-2.5 font-semibold">Établissement</th>
                  <th className="px-3 py-2.5 font-semibold">Statut</th>
                  <th className="px-3 py-2.5 font-semibold">Formule</th>
                  <th className="px-3 py-2.5 text-right font-semibold">MRR</th>
                  <th className="px-3 py-2.5 text-right font-semibold">Cartes</th>
                  <th className="px-3 py-2.5 font-semibold">Client depuis</th>
                  <th className="px-5 py-2.5 font-semibold">À surveiller</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {list.map((c) => {
                  const r = risks(c);
                  return (
                    <tr key={c.id} className="cursor-pointer align-top hover:bg-surface-2" onClick={() => setEdit(c)}>
                      <td className="px-5 py-2.5">
                        <p className="font-semibold">{c.name}</p>
                        <p className="text-[12.5px] text-ink-3">
                          {c.city}
                          {c.contact ? ` · ${c.contact}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
                      </td>
                      <td className="px-3 py-2.5">{c.plan}</td>
                      <td className="tnum px-3 py-2.5 text-right font-semibold">{eur(c.mrr, true)}</td>
                      <td className="tnum px-3 py-2.5 text-right">{num(c.cards)}</td>
                      <td className="px-3 py-2.5 text-ink-2">{dateShort(c.since)}</td>
                      <td className="px-5 py-2.5">
                        {r.map((x) => (
                          <p key={x} className="flex gap-1.5 text-[12.5px] text-honey">
                            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                            {x}
                          </p>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {edit && (
        <ClientModal
          c={edit}
          onClose={() => setEdit(null)}
          onSave={async (c) => {
            const exists = clients.some((x) => x.id === c.id);
            await save(exists ? clients.map((x) => (x.id === c.id ? c : x)) : [c, ...clients]);
            toast.success("Client enregistré");
            setEdit(null);
          }}
          onDelete={async (c) => {
            if (!confirm(`Supprimer ${c.name} ?`)) return;
            await save(clients.filter((x) => x.id !== c.id));
            setEdit(null);
          }}
        />
      )}
    </div>
  );
}

function ClientModal({ c, onClose, onSave, onDelete }: { c: Client; onClose: () => void; onSave: (c: Client) => void; onDelete: (c: Client) => void }) {
  const [v, setV] = useState(c);
  const set = (p: Partial<Client>) => setV({ ...v, ...p });
  return (
    <Modal
      open
      onClose={onClose}
      title={c.name || "Nouveau client"}
      wide
      footer={
        <>
          <Button variant="danger" className="mr-auto" icon={<Trash2 className="size-4" />} onClick={() => onDelete(v)}>
            Supprimer
          </Button>
          <Button variant="primary" disabled={!v.name.trim()} onClick={() => onSave(v)}>
            Enregistrer
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Établissement">
          <input className="field" value={v.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Ville">
          <input className="field" value={v.city} onChange={(e) => set({ city: e.target.value })} />
        </Field>
        <Field label="Contact">
          <input className="field" value={v.contact} onChange={(e) => set({ contact: e.target.value })} />
        </Field>
        <Field label="Mail" hint="Les mails de cette adresse remontent en priorité.">
          <input className="field" type="email" value={v.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Téléphone">
          <input className="field" value={v.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Statut">
          <select className="field" value={v.status} onChange={(e) => set({ status: e.target.value as Client["status"] })}>
            {Object.entries(STATUS).map(([k, s]) => (
              <option key={k} value={k}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Formule">
          <select className="field" value={v.plan} onChange={(e) => set({ plan: e.target.value as Client["plan"] })}>
            <option>Essai</option>
            <option>Mensuel</option>
            <option>Annuel</option>
          </select>
        </Field>
        <Field label="MRR (€ / mois)">
          <input className="field" type="number" step="0.01" value={v.mrr} onChange={(e) => set({ mrr: Number(e.target.value) })} />
        </Field>
        <Field label="Client depuis">
          <input className="field" type="date" value={v.since} onChange={(e) => set({ since: e.target.value })} />
        </Field>
        <Field label="Cartes clients créées">
          <input className="field" type="number" value={v.cards} onChange={(e) => set({ cards: Number(e.target.value) })} />
        </Field>
        <Field label="Dernière activité" hint={v.lastActivity ? relative(v.lastActivity) : undefined}>
          <input className="field" type="date" value={v.lastActivity ?? ""} onChange={(e) => set({ lastActivity: e.target.value })} />
        </Field>
        <Field label="Étiquettes" hint="Séparées par des virgules.">
          <input className="field" value={v.tags.join(", ")} onChange={(e) => set({ tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea className={cx("field h-24")} value={v.notes} onChange={(e) => set({ notes: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
