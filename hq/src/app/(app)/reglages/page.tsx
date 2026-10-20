"use client";
import { Save } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Card, Field, PageHeader, Skeleton, Toggle } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import type { Settings } from "@/lib/types";

function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <Card>
      <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
        <div>
          <h2 className="font-display text-[16px] font-semibold">{title}</h2>
          <p className="mt-1 text-[13px] text-ink-3">{desc}</p>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </Card>
  );
}

const list = (s: string) => s.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);

export default function SettingsPage() {
  const { data, mutate } = useApi<Settings>("/api/settings", { revalidateIfStale: false });
  if (!data) return <Skeleton className="h-[70vh]" />;
  return <SettingsForm initial={data} onSaved={(r) => mutate(r, { revalidate: false })} />;
}

function SettingsForm({ initial, onSaved }: { initial: Settings; onSaved: (s: Settings) => void }) {
  const [s, setS] = useState<Settings>(initial);
  const [base, setBase] = useState<Settings>(initial);
  const [busy, setBusy] = useState(false);
  const set = (p: Partial<Settings>) => setS({ ...s, ...p });
  const dirty = JSON.stringify(s) !== JSON.stringify(base);

  async function save() {
    setBusy(true);
    const r = await api<Settings>("PUT", "/api/settings", s);
    setBusy(false);
    if (r) {
      onSaved(r);
      setS(r);
      setBase(r);
      toast.success("Réglages enregistrés");
    }
  }

  return (
    <div>
      <PageHeader
        title="Réglages"
        subtitle="Tes informations, tes objectifs et le comportement des automatisations."
        actions={
          <Button variant="primary" icon={<Save className="size-4" />} loading={busy} disabled={!dirty} onClick={save}>
            Enregistrer
          </Button>
        }
      />
      <div className="space-y-5">
        <Section title="Toi et Keeply" desc="Utilisé pour te saluer, signer les mails et t'envoyer les alertes.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ton prénom et nom">
              <input className="field" value={s.ownerName} onChange={(e) => set({ ownerName: e.target.value })} />
            </Field>
            <Field label="Ton adresse pour les alertes">
              <input className="field" type="email" value={s.ownerEmail} onChange={(e) => set({ ownerEmail: e.target.value })} />
            </Field>
            <Field label="Nom de l'entreprise">
              <input className="field" value={s.businessName} onChange={(e) => set({ businessName: e.target.value })} />
            </Field>
            <Field label="Signature des mails">
              <input className="field" value={s.signature} onChange={(e) => set({ signature: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section title="Objectif" desc="L'objectif de chiffre d'affaires net du mois, affiché en carte à tampons sur la page Aujourd'hui.">
          <Field label="Objectif mensuel (€)">
            <input className="field max-w-48" type="number" value={s.monthlyGoal} onChange={(e) => set({ monthlyGoal: Number(e.target.value) })} />
          </Field>
        </Section>

        <Section title="Adresses à surveiller" desc="Le site et les fiches stores sont testés chaque jour dans Santé de l'app.">
          <Field label="Site web">
            <input className="field" placeholder="https://keeply.app" value={s.siteUrl} onChange={(e) => set({ siteUrl: e.target.value })} />
          </Field>
          <Field label="Fiche App Store">
            <input className="field" placeholder="https://apps.apple.com/fr/app/keeply/id…" value={s.appStoreUrl} onChange={(e) => set({ appStoreUrl: e.target.value })} />
          </Field>
          <Field label="Fiche Google Play">
            <input className="field" placeholder="https://play.google.com/store/apps/details?id=…" value={s.playStoreUrl} onChange={(e) => set({ playStoreUrl: e.target.value })} />
          </Field>
        </Section>

        <Section title="Santé de l'app" desc="Quand lancer le test quotidien et que faire en cas de panne.">
          <Field label="Heure du test quotidien (heure de Paris)">
            <input className="field max-w-32" type="number" min={0} max={23} value={s.health.dailyHour} onChange={(e) => set({ health: { ...s.health, dailyHour: Number(e.target.value) } })} />
          </Field>
          <label className="flex items-center justify-between gap-4">
            <span className="text-[14px]">M&apos;envoyer un mail d&apos;alerte en cas de panne</span>
            <Toggle checked={s.health.alertEmail} onChange={(alertEmail) => set({ health: { ...s.health, alertEmail } })} />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span className="text-[14px]">Créer une tâche pour chaque panne</span>
            <Toggle checked={s.health.createTasks} onChange={(createTasks) => set({ health: { ...s.health, createTasks } })} />
          </label>
        </Section>

        <Section title="Tri des mails" desc="Ces règles s'ajoutent au tri automatique. Les mails de tes clients (page Clients) remontent déjà.">
          <Field label="Expéditeurs importants" hint="Adresses ou domaines, séparés par des virgules (ex. @apple.com, associe@keeply.app).">
            <textarea className="field h-20" value={s.vipSenders.join(", ")} onChange={(e) => set({ vipSenders: list(e.target.value) })} />
          </Field>
          <Field label="Mots qui rendent un mail urgent">
            <textarea className="field h-20" value={s.urgentKeywords.join(", ")} onChange={(e) => set({ urgentKeywords: list(e.target.value) })} />
          </Field>
        </Section>

        <Section title="Prospection" desc="Ce que l'IA sait de ton offre, et le rythme d'envoi. Envoyer peu et régulièrement protège ta boîte du spam.">
          <Field label="Ce que fait Keeply (pour l'IA)">
            <textarea className="field h-24" value={s.prospecting.pitch} onChange={(e) => set({ prospecting: { ...s.prospecting, pitch: e.target.value } })} />
          </Field>
          <Field label="Offre proposée">
            <input className="field" value={s.prospecting.offer} onChange={(e) => set({ prospecting: { ...s.prospecting, offer: e.target.value } })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom qui signe les mails">
              <input className="field" placeholder="Yanis, fondateur de Keeply" value={s.prospecting.senderName} onChange={(e) => set({ prospecting: { ...s.prospecting, senderName: e.target.value } })} />
            </Field>
            <Field label="Lien de prise de rendez-vous (facultatif)">
              <input className="field" placeholder="https://cal.com/…" value={s.prospecting.calendarLink} onChange={(e) => set({ prospecting: { ...s.prospecting, calendarLink: e.target.value } })} />
            </Field>
            <Field label="Mails maximum par jour">
              <input className="field" type="number" min={1} max={200} value={s.prospecting.dailyLimit} onChange={(e) => set({ prospecting: { ...s.prospecting, dailyLimit: Number(e.target.value) } })} />
            </Field>
            <Field label="Relances après (jours)" hint="Ex. 3, 7 : relance à J+3 puis J+7.">
              <input className="field" value={s.prospecting.followUpDays.join(", ")} onChange={(e) => set({ prospecting: { ...s.prospecting, followUpDays: list(e.target.value).map(Number).filter((n) => n > 0).slice(0, 3) } })} />
            </Field>
            <Field label="Envoyer à partir de">
              <input className="field" type="time" value={s.prospecting.sendWindow.start} onChange={(e) => set({ prospecting: { ...s.prospecting, sendWindow: { ...s.prospecting.sendWindow, start: e.target.value } } })} />
            </Field>
            <Field label="Jusqu'à">
              <input className="field" type="time" value={s.prospecting.sendWindow.end} onChange={(e) => set({ prospecting: { ...s.prospecting, sendWindow: { ...s.prospecting.sendWindow, end: e.target.value } } })} />
            </Field>
          </div>
          <Field label="Phrase de désinscription" hint="Obligatoire en prospection B2B (RGPD) : la personne doit pouvoir refuser facilement.">
            <input className="field" value={s.prospecting.optOutLine} onChange={(e) => set({ prospecting: { ...s.prospecting, optOutLine: e.target.value } })} />
          </Field>
        </Section>

        <Section title="Instagram" desc="Tes rubriques de contenu et tes hashtags habituels.">
          <Field label="Nom du compte">
            <input className="field max-w-64" value={s.instagram.handle} onChange={(e) => set({ instagram: { ...s.instagram, handle: e.target.value.replace(/^@/, "") } })} />
          </Field>
          <Field label="Rubriques" hint="Une par ligne.">
            <textarea className="field h-28" value={s.instagram.pillars.join("\n")} onChange={(e) => set({ instagram: { ...s.instagram, pillars: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } })} />
          </Field>
          <Field label="Hashtags par défaut">
            <textarea className="field h-20" value={s.instagram.defaultHashtags} onChange={(e) => set({ instagram: { ...s.instagram, defaultHashtags: e.target.value } })} />
          </Field>
        </Section>
      </div>
      {dirty && (
        <div className="rise fixed right-4 bottom-24 z-30 lg:bottom-6">
          <Button variant="primary" icon={<Save className="size-4" />} loading={busy} onClick={save} className="shadow-2xl">
            Enregistrer les modifications
          </Button>
        </div>
      )}
    </div>
  );
}
