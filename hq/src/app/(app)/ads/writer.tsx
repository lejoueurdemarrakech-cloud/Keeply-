"use client";
import { Bookmark, BookmarkCheck, Check, Megaphone, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CopyButton, Empty, Field, cx } from "@/components/ui";
import { api } from "@/lib/client";
import { usePref } from "@/lib/prefs";

type AdCopy = { primary: string; headline: string; description: string; cta: string; visual: string };

const ANGLES = ["La carte papier perdue", "Les clients qui ne reviennent pas", "Installé en 10 minutes", "Fini les cartes à tamponner", "Une offre le jour creux"];

const CHECKLIST = [
  "Le suivi des installations (SDK Meta ou App Store) est vérifié",
  "Une seule idée par publicité, visible sans le son",
  "L'accroche apparaît dans les 2 premières secondes",
  "Le visuel montre la carte dans le Wallet d'un vrai téléphone",
  "Le texte parle de remises en % ou en €, un produit offert seulement en coupon",
  "Le lien mène à la fiche App Store (ou à la page tarifs)",
  "2 à 3 variantes de visuel pour laisser Meta choisir",
  "Budget fixé et date de bilan notée dans les tâches",
];

const FORMATS = [
  { name: "Fil carré", size: "1080 × 1080", ratio: "1:1" },
  { name: "Fil vertical", size: "1080 × 1350", ratio: "4:5" },
  { name: "Stories et Reels", size: "1080 × 1920", ratio: "9:16" },
];

function AdPreview({ ad }: { ad: AdCopy }) {
  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[22px] border border-line-2 bg-[var(--glass-strong)] text-[13px] shadow-card">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-violet text-[12px] font-bold text-white">K</span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-semibold">keeplyfidelity</p>
          <p className="text-[11.5px] text-ink-3">Sponsorisé</p>
        </div>
      </div>
      <p className="line-clamp-3 px-3 pb-2 whitespace-pre-line">{ad.primary}</p>
      <div className="grid aspect-[4/5] place-items-center bg-[linear-gradient(140deg,var(--violet),#3a2a8f_60%,var(--night))] p-6 text-center">
        <p className="text-[12px] text-white/80">{ad.visual}</p>
      </div>
      <div className="flex items-center justify-between gap-3 bg-bg-2 px-3 py-2.5">
        <div className="min-w-0">
          <p className="truncate font-semibold">{ad.headline}</p>
          <p className="truncate text-[11.5px] text-ink-3">{ad.description}</p>
        </div>
        <span className="shrink-0 rounded-lg bg-ink/10 px-2.5 py-1.5 text-[12px] font-semibold">{ad.cta}</span>
      </div>
    </div>
  );
}

export function Writer() {
  const [form, setForm] = useState({ objective: "Installations de l'app par des gérants de fast-food et de café", audience: "Gérants de fast-foods, cafés et restaurants indépendants, France, 25-55 ans", angle: "" });
  const [copies, setCopies] = useState<AdCopy[]>([]);
  const [pick, setPick] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = usePref<AdCopy[]>("ads-saved", []);
  const [done, setDone] = usePref<number[]>("ads-checklist", []);
  const isSaved = (a: AdCopy) => saved.some((s) => s.primary === a.primary);

  const generate = async () => {
    setBusy(true);
    const r = await api<{ ads: AdCopy[] }>("POST", "/api/ai", { tool: "adcopy", input: form });
    setBusy(false);
    if (r) {
      setCopies(r.ads);
      setPick(0);
    }
  };

  return (
    <div className="space-y-5">
      <Card title="Écrire des annonces avec l'IA" action={<Megaphone className="size-4 text-violet" />}>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Objectif">
            <input className="field" value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} />
          </Field>
          <Field label="Audience">
            <input className="field" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
          </Field>
          <Field label="Angle (facultatif)">
            <input className="field" placeholder="ex. la carte papier perdue" value={form.angle} onChange={(e) => setForm({ ...form, angle: e.target.value })} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {ANGLES.map((a) => (
            <button key={a} onClick={() => setForm({ ...form, angle: a })} className={cx("rounded-full px-3 py-1 text-[12.5px] font-semibold transition-colors", form.angle === a ? "bg-violet text-white" : "glass-soft text-ink-2 hover:text-ink")}>
              {a}
            </button>
          ))}
        </div>
        <Button className="mt-4" variant="primary" icon={<Sparkles className="size-4" />} loading={busy} onClick={generate}>
          5 variantes d&apos;annonces
        </Button>
        <p className="mt-2 text-[12.5px] text-ink-3">Rédaction par Claude : ton Mac (le pont Claude) doit être allumé, sauf si une clé est ajoutée dans Connexions.</p>
      </Card>

      {copies.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-3 md:grid-cols-2">
            {copies.map((c, i) => (
              <button key={i} onClick={() => setPick(i)} className={cx("glass rounded-[20px] p-4 text-left text-[13.5px] transition-[box-shadow]", pick === i && "ring-2 ring-violet")}>
                <p className="line-clamp-4 whitespace-pre-line">{c.primary}</p>
                <p className="mt-3 font-display font-semibold">{c.headline}</p>
                <p className="text-ink-3">{c.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone="violet">{c.cta}</Badge>
                  {isSaved(c) && <BookmarkCheck className="size-4 text-violet" />}
                </div>
              </button>
            ))}
          </div>
          <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
            <AdPreview ad={copies[pick]} />
            <div className="flex justify-center gap-2">
              <CopyButton text={`${copies[pick].primary}\n\nTitre : ${copies[pick].headline}\nDescription : ${copies[pick].description}\nBouton : ${copies[pick].cta}`} />
              <Button size="sm" variant="secondary" icon={isSaved(copies[pick]) ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />} disabled={isSaved(copies[pick])} onClick={() => setSaved([copies[pick], ...saved].slice(0, 30))}>
                {isSaved(copies[pick]) ? "Enregistrée" : "Enregistrer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Avant de lancer une campagne" action={<span className="tnum text-[13px] font-semibold text-ink-2">{done.length}/{CHECKLIST.length}</span>}>
          <ul className="space-y-1">
            {CHECKLIST.map((item, i) => {
              const on = done.includes(i);
              return (
                <li key={item}>
                  <button onClick={() => setDone(on ? done.filter((x) => x !== i) : [...done, i])} className="flex w-full items-start gap-3 rounded-xl px-2 py-2 text-left text-[14px] hover:bg-bg-2">
                    <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-colors", on ? "border-violet bg-violet text-white" : "border-line-2")}>{on && <Check className="size-3.5" strokeWidth={3} />}</span>
                    <span className={cx(on && "text-ink-3 line-through")}>{item}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {done.length > 0 && (
            <button onClick={() => setDone([])} className="mt-2 px-2 text-[12.5px] font-semibold text-ink-3 hover:text-ink">
              Tout décocher pour la prochaine campagne
            </button>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Formats à préparer">
            <div className="grid grid-cols-3 gap-3">
              {FORMATS.map((f) => (
                <div key={f.name} className="text-center">
                  <div className="glass-soft mx-auto grid w-full max-w-[90px] place-items-center rounded-xl text-[12px] font-bold text-violet" style={{ aspectRatio: f.ratio.replace(":", " / ") }}>
                    {f.ratio}
                  </div>
                  <p className="mt-2 text-[13px] font-semibold">{f.name}</p>
                  <p className="tnum text-[12px] text-ink-3">{f.size} px</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Annonces enregistrées" action={saved.length > 0 && <Badge tone="violet">{saved.length}</Badge>}>
            {saved.length === 0 ? (
              <Empty icon={<Bookmark className="size-5" />} title="Aucune annonce enregistrée">Génère des variantes puis garde les meilleures ici. Elles restent dans ce navigateur.</Empty>
            ) : (
              <ul className="divide-y divide-line">
                {saved.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 py-3 first:pt-0">
                    <div className="min-w-0 flex-1 text-[13.5px]">
                      <p className="font-semibold">{a.headline}</p>
                      <p className="line-clamp-2 text-ink-2">{a.primary}</p>
                    </div>
                    <CopyButton text={`${a.primary}\n\nTitre : ${a.headline}\nDescription : ${a.description}\nBouton : ${a.cta}`} />
                    <button onClick={() => setSaved(saved.filter((_, j) => j !== i))} className="rounded-lg p-1.5 text-ink-3 hover:bg-bg-2 hover:text-coral" aria-label="Supprimer">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
