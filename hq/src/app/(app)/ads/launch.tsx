"use client";
import { AlertTriangle, Check, ListChecks, Target } from "lucide-react";
import { Badge, Card, CopyButton, cx } from "@/components/ui";
import { usePref } from "@/lib/prefs";
import { META_ADS_PLAN } from "@/lib/launch-plan";

export function Launch() {
  const plan = META_ADS_PLAN;
  const [done, setDone] = usePref<number[]>("ads-launch-prereq", []);
  const toggle = (i: number) => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card title="Le plan en bref" action={<Target className="size-4 text-violet" />}>
          <p className="whitespace-pre-line text-[14.5px] text-ink-2">{plan.resume}</p>
        </Card>
        <Card title="Avant de dépenser 1 €" action={<ListChecks className="size-4 text-violet" />}>
          <ul className="space-y-2">
            {plan.prerequis.map((x, i) => (
              <li key={i}>
                <button onClick={() => toggle(i)} className="flex w-full gap-2.5 text-left text-[13.5px]">
                  <span className={cx("mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border", done.includes(i) ? "border-mint bg-mint text-white" : "border-line")}>{done.includes(i) && <Check className="size-3" />}</span>
                  <span className={cx(done.includes(i) ? "text-ink-3 line-through" : "text-ink-2")}>{x}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {plan.phases.map((p, i) => (
          <Card key={p.nom} title={`${i + 1}. ${p.nom}`} action={<Badge tone="violet">{p.semaines}</Badge>}>
            <div className="flex flex-wrap gap-2 text-[13px]">
              <Badge tone="sky">{p.objectif_meta}</Badge>
            </div>
            <Row label="Budget par jour">{p.budget_jour}</Row>
            <Row label="Budget de la phase">{p.budget_total}</Row>
            <p className="mt-3 text-[14px] text-ink-2">{p.pourquoi}</p>
            <Row label="Ciblage">{p.ciblage}</Row>
            <Row label="Placements">{p.placements}</Row>
            <Row label="Pubs">{p.creas.join(" · ")}</Row>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {Object.entries(p.kpi_cible).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 px-3 py-2">
                  <p className="text-[11.5px] font-semibold text-ink-3 uppercase">{k.replaceAll("_", " ")}</p>
                  <p className="text-[13.5px] font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl border border-line px-3 py-2 text-[13px] text-ink-2">
              <strong>Couper ou augmenter :</strong> {p.regle_stop_ou_scale}
            </p>
          </Card>
        ))}
      </div>

      <Card title="Les pubs prêtes à copier" pad={false}>
        <ul className="divide-y divide-line">
          {plan.textes_pubs.map((a) => (
            <li key={a.nom} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div>
                <p className="font-display text-[15.5px] font-semibold">{a.nom}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge tone="violet">{a.format}</Badge>
                  <Badge>Bouton : {a.cta_bouton}</Badge>
                </div>
                <p className="mt-2 text-[13px] text-ink-3">{a.visuel}</p>
              </div>
              <div className="rounded-xl bg-surface-2 p-3.5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[12.5px] font-semibold text-ink-3">Texte principal</span>
                  <CopyButton text={`${a.texte_principal}\n\nTitre : ${a.titre}\nDescription : ${a.description}`} />
                </div>
                <p className="whitespace-pre-line text-[13.5px]">{a.texte_principal}</p>
                <p className="mt-2 text-[13.5px]">
                  <strong>{a.titre}</strong> <span className="text-ink-3">· {a.description}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Tests à faire">
          <ul className="space-y-3">
            {plan.tests_creatifs.map((t) => (
              <li key={t.hypothese} className="text-[13.5px]">
                <p className="font-semibold">{t.hypothese}</p>
                <p className="text-ink-2">
                  A : {t.variante_a} · B : {t.variante_b}
                </p>
                <p className="text-[12.5px] text-ink-3">On regarde : {t.indicateur}</p>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-5">
          <Card title="Formulaire ou App Store ?">
            <p className="whitespace-pre-line text-[14px] text-ink-2">{plan.alternative_prospects}</p>
          </Card>
          <Card title="Reciblage">
            <p className="whitespace-pre-line text-[14px] text-ink-2">{plan.retargeting}</p>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Estimation prudente">
          <p className="text-[13px] text-ink-3">{plan.estimation.hypotheses}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                ["Clics", plan.estimation.clics_estimes],
                ["Installations", plan.estimation.installations_estimees],
                ["Essais lancés", plan.estimation.essais_estimes],
                ["Coût par essai", plan.estimation.cout_par_essai_estime],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-surface-2 px-3 py-2">
                <p className="text-[12px] text-ink-3">{k}</p>
                <p className="font-display text-[16px] font-semibold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Ce sont des estimations, pas des promesses : les vrais chiffres arrivent dès la 1re semaine.</p>
        </Card>
        <Card title="Erreurs à éviter" action={<AlertTriangle className="size-4 text-coral" />}>
          <ul className="space-y-2">
            {plan.erreurs_a_eviter.map((x) => (
              <li key={x} className="flex gap-2 text-[13.5px] text-ink-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-coral" />
                {x}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[13.5px] text-ink-2">
      <strong className="text-ink">{label} :</strong> {children}
    </p>
  );
}
