"use client";
import { Ban, Check, ChevronDown, Clapperboard, Copy, Eye, Flag, Music2, Target } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CopyButton, PageHeader, cx } from "@/components/ui";
import { BRAND } from "@/lib/brand";
import { longDate } from "@/lib/launch-calendar";
import { TIKTOK_PLAN, type TikTokVideo } from "@/lib/launch-plan";
import { usePref } from "@/lib/prefs";

const TONE: Record<string, "violet" | "honey" | "mint" | "sky" | undefined> = {
  "Depuis Agadir": "honey",
  Chrono: "violet",
  "Écran verrouillé": "sky",
  "Questions de patrons": "mint",
};

function promptFor(v: TikTokVideo) {
  return `Claudinho, crée la vidéo TikTok ${v.id} « ${v.titre} » du plan de lancement de Keeply HQ (série ${v.serie}, ${v.duree}, publication le ${longDate(v.date)} à ${v.heure}).

Accroche (première seconde, dite et écrite) : ${v.accroche}

Déroulé : ${v.script}

Texte à l'écran : ${v.texte_ecran}
Légende : ${v.legende}
Mots-clés à dire et à écrire : ${v.mots_cles.join(", ")}
${v.reprise_instagram ? `Reprise du post Instagram ${v.reprise_instagram} : repars du même fichier, recadre en 9:16 sans filigrane.\n` : ""}Pourquoi : ${v.pourquoi}

Format : 1080×1920, textes hors des zones couvertes par l'interface de TikTok (droite 140 px, bas 420 px). Plateforme de marque « ${BRAND.idee} », règles Keeply (aucun faux témoignage, produit offert = coupon, options activables). Passe les textes au skill unslop. Range les fichiers dans Keeply-Pub/tiktok/lancement/${v.id}/ et montre-moi le résultat avant de publier.`;
}

export default function TikTokPage() {
  const plan = TIKTOK_PLAN;
  const [done, setDone] = usePref<string[]>("tt-launch-done", []);
  const toggle = (id: string) => setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);

  return (
    <div className="space-y-5">
      <PageHeader icon={<Music2 />} title="TikTok" subtitle="Plan de lancement : des vues réelles, sans pub ni achat de vues." />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Le rôle de TikTok" action={<Target className="size-4 text-violet" />}>
          <p className="font-display text-[17px] font-semibold">{plan.role}</p>
          <p className="mt-2 text-[14px] text-ink-2">{plan.objectif}</p>
          <p className="mt-2 text-[14px] text-ink-2">
            <strong>Rythme :</strong> {plan.rythme}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {plan.series.map((s) => (
              <div key={s.nom} className="rounded-xl bg-surface-2 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold">{s.nom}</p>
                  <span className="text-[12px] text-ink-3">{s.frequence}</span>
                </div>
                <p className="mt-1 text-[13px] text-ink-2">{s.promesse}</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="space-y-5">
          <Card title="Avancement">
            <p className="font-display text-[28px] font-semibold tnum">
              {done.length}
              <span className="text-[16px] text-ink-3"> / {plan.videos.length} vidéos publiées</span>
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-2">
              <div className="h-full rounded-full bg-mint transition-[width] duration-500" style={{ width: `${(done.length / plan.videos.length) * 100}%` }} />
            </div>
          </Card>
          <Card title="Profil" action={<CopyButton text={plan.compte} label="Copier" />}>
            <p className="whitespace-pre-line text-[14px]">{plan.compte}</p>
          </Card>
          <Card title="La pub sur TikTok">
            <p className="text-[13.5px] text-ink-2">{plan.pub}</p>
          </Card>
        </div>
      </div>

      <Card title={`Les ${plan.videos.length} vidéos`} pad={false}>
        <ul className="divide-y divide-line">
          {plan.videos.map((v) => (
            <VideoRow key={v.id} v={v} done={done.includes(v.id)} onToggle={() => toggle(v.id)} />
          ))}
        </ul>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Avoir des vues sans payer" action={<Eye className="size-4 text-violet" />}>
          <Dots items={plan.regles_vues} tone="bg-violet" />
        </Card>
        <Card title="Interdit" action={<Ban className="size-4 text-coral" />}>
          <Dots items={plan.interdits} tone="bg-coral" />
        </Card>
      </div>

      <Card title="Ce qu'on mesure" action={<Flag className="size-4 text-violet" />}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plan.kpi.map((k) => (
            <div key={k.nom} className="rounded-xl bg-surface-2 p-3.5">
              <p className="text-[13px] text-ink-3">{k.nom}</p>
              <p className="font-display text-[18px] font-semibold">{k.cible}</p>
              <p className="mt-1 text-[12.5px] text-ink-2">{k.lecture}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function VideoRow({ v, done, onToggle }: { v: TikTokVideo; done: boolean; onToggle: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <li className={cx("px-5 py-4", done && "opacity-60")}>
      <div className="flex items-start gap-3">
        <button onClick={onToggle} aria-label={done ? "Marquer à faire" : "Marquer publiée"} className={cx("mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border", done ? "border-mint bg-mint text-white" : "border-line")}>
          {done && <Check className="size-3.5" />}
        </button>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <div className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-ink-3">
            <Badge tone={TONE[v.serie]}>{v.serie}</Badge>
            <span>
              {v.id} · {longDate(v.date)} · {v.heure} · {v.duree}
            </span>
            {v.reprise_instagram && <Badge>reprise {v.reprise_instagram}</Badge>}
          </div>
          <p className="mt-1 font-display text-[15.5px] font-semibold">{v.titre}</p>
          <p className="text-[13.5px] text-ink-2">« {v.accroche} »</p>
        </button>
        <ChevronDown className={cx("mt-1 size-4 shrink-0 text-ink-3 transition-transform", open && "rotate-180")} />
      </div>
      {open && (
        <div className="mt-3 ml-9 grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <Block title="Déroulé">{v.script}</Block>
            <Block title="Pourquoi">{v.pourquoi}</Block>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-surface-2 p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12.5px] font-semibold text-ink-3">Légende</span>
                <CopyButton text={v.legende} />
              </div>
              <p className="whitespace-pre-line text-[13.5px]">{v.legende}</p>
              <p className="mt-2 text-[12.5px] text-ink-3">Texte à l&apos;écran : {v.texte_ecran}</p>
              <p className="mt-1 text-[12.5px] text-violet">Mots-clés : {v.mots_cles.join(" · ")}</p>
            </div>
            <Button
              size="sm"
              icon={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              onClick={async () => {
                await navigator.clipboard.writeText(promptFor(v));
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              <Clapperboard className="size-3.5" /> Copier le prompt
            </Button>
          </div>
        </div>
      )}
    </li>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-3">{title}</p>
      <p className="mt-0.5 whitespace-pre-line text-[13.5px] text-ink-2">{children}</p>
    </div>
  );
}

function Dots({ items, tone }: { items: string[]; tone: string }) {
  return (
    <ul className="space-y-2">
      {items.map((x) => (
        <li key={x} className="flex gap-2 text-[13.5px] text-ink-2">
          <span className={cx("mt-2 size-1.5 shrink-0 rounded-full", tone)} />
          {x}
        </li>
      ))}
    </ul>
  );
}
