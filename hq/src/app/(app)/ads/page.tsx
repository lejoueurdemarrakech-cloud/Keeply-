"use client";
import { BookOpen, Calculator, Flag, LayoutDashboard, ListFilter, Megaphone, PenLine } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Card, DemoBadge, ErrorNote, PageHeader, Segmented, Skeleton, Tabs } from "@/components/ui";
import { useApi } from "@/lib/client";
import { usePref } from "@/lib/prefs";
import { Campaigns } from "./campaigns";
import { Launch } from "./launch";
import { Overview } from "./overview";
import { totals, type Ads } from "./shared";
import { Simulator } from "./simulator";
import { Writer } from "./writer";

type Tab = "lancement" | "apercu" | "campagnes" | "simulateur" | "annonces" | "lexique";
type Days = "7" | "14" | "30" | "90";

const GLOSSARY: [string, string][] = [
  ["Affichages (impressions)", "Nombre de fois où la pub a été vue à l'écran. Une même personne peut compter plusieurs fois."],
  ["Personnes touchées (portée)", "Nombre de personnes différentes qui ont vu la pub au moins une fois."],
  ["Fréquence", "Affichages divisés par personnes touchées. Au-delà de 3, le public se lasse."],
  ["CTR (taux de clic)", "Part des affichages qui donnent un clic. Autour de 1 % c'est correct, 1,5 % et plus c'est bon."],
  ["CPC", "Coût moyen d'un clic."],
  ["CPM", "Coût pour 1 000 affichages. Il monte quand l'audience est petite ou très demandée."],
  ["Résultat", "L'action que la campagne cherche à obtenir : installation de l'app, prospect, visite…"],
  ["Coût par résultat", "Dépense divisée par le nombre de résultats. C'est le chiffre à surveiller en premier."],
  ["Retour sur dépense (ROAS)", "Revenu attribué divisé par la dépense. 2× veut dire 2 € rapportés pour 1 € dépensé."],
  ["Phase d'apprentissage", "Les premiers jours d'une campagne, Meta teste. Évite de la modifier avant environ 50 résultats."],
  ["Reciblage", "Montrer la pub aux personnes qui connaissent déjà Keeply (visite du site, vidéo vue)."],
  ["Advantage+", "Réglages automatiques de Meta pour l'audience et les placements. Souvent moins cher pour démarrer."],
];

function AdsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>((params.get("tab") as Tab) || "lancement");
  const [days, setDays] = usePref<Days>("ads-days", "30");
  const { data } = useApi<Ads>(`/api/ads?days=${days}`);

  const setTab = (t: Tab) => {
    setTabState(t);
    router.replace(`/ads?tab=${t}`, { scroll: false });
  };

  return (
    <div>
      <PageHeader
        icon={<Megaphone />}
        title="Meta Ads"
        subtitle={
          <>
            Tes publicités Facebook et Instagram : ce qu&apos;elles coûtent, ce qu&apos;elles rapportent, quoi corriger. <DemoBadge show={!!data && !data.live} />
          </>
        }
        actions={<Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7 j" }, { value: "14", label: "14 j" }, { value: "30", label: "30 j" }, { value: "90", label: "90 j" }]} />}
      />
      {data?.error && (
        <div className="mb-4">
          <ErrorNote>Meta Ads : {data.error}</ErrorNote>
        </div>
      )}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "lancement", label: "Plan de lancement", icon: <Flag /> },
          { value: "apercu", label: "Vue d'ensemble", icon: <LayoutDashboard /> },
          { value: "campagnes", label: "Campagnes", icon: <ListFilter />, count: data?.campaigns.length },
          { value: "simulateur", label: "Simulateur", icon: <Calculator /> },
          { value: "annonces", label: "Annonces", icon: <PenLine /> },
          { value: "lexique", label: "Lexique", icon: <BookOpen /> },
        ]}
      />
      {tab === "lancement" && <Launch />}
      {tab === "apercu" && (data ? <Overview data={data} onTab={setTab} /> : <Skeleton className="h-96 rounded-[22px]" />)}
      {tab === "campagnes" && (data ? <Campaigns campaigns={data.campaigns} /> : <Skeleton className="h-96 rounded-[22px]" />)}
      {tab === "simulateur" && <Simulator currentCpr={data ? totals(data.campaigns).cpr : 0} />}
      {tab === "annonces" && <Writer />}
      {tab === "lexique" && (
        <Card title="Les mots de la pub, en clair">
          <dl className="grid gap-x-8 gap-y-4 md:grid-cols-2">
            {GLOSSARY.map(([t, d]) => (
              <div key={t}>
                <dt className="font-display text-[15px] font-semibold">{t}</dt>
                <dd className="mt-0.5 text-[14px] text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <AdsInner />
    </Suspense>
  );
}
