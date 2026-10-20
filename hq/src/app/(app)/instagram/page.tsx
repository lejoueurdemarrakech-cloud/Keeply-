"use client";
import { BarChart3, CalendarDays, Megaphone, PenSquare, RefreshCw, Rocket } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button, DemoBadge, ErrorNote, PageHeader, Skeleton, Tabs } from "@/components/ui";
import { useApi } from "@/lib/client";
import type { Post } from "@/lib/types";
import { AdsPanel } from "./ads";
import { Composer, draftFromPost, emptyDraft, type Draft } from "./composer";
import { Growth } from "./growth";
import { Planning } from "./planning";
import type { IgOverview } from "./shared";
import { Stats } from "./stats";

type Tab = "planning" | "creer" | "stats" | "croissance" | "pubs";

function InstagramInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>((params.get("tab") as Tab) || "planning");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [draftKey, setDraftKey] = useState(0);
  const { data: o, mutate: refreshOverview, isValidating } = useApi<IgOverview>("/api/instagram/overview");
  const { data: posts, mutate: refreshPosts } = useApi<Post[]>("/api/instagram/posts");

  const setTab = (t: Tab) => {
    setTabState(t);
    router.replace(`/instagram?tab=${t}`, { scroll: false });
  };
  const edit = (d: Draft) => {
    setDraft(d);
    setDraftKey((k) => k + 1);
    setTab("creer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <PageHeader
        title="Instagram & Ads"
        subtitle={
          <>
            {o ? `@${o.account.username} · ` : ""}programme tes posts, suis tes chiffres et fais grandir le compte. <DemoBadge show={!!o && !o.live} />
          </>
        }
        actions={
          <Button variant="ghost" icon={<RefreshCw className="size-4" />} loading={isValidating} onClick={() => fetch("/api/instagram/overview?refresh=1").then(() => refreshOverview())}>
            Actualiser
          </Button>
        }
      />
      {o?.error && (
        <div className="mb-4">
          <ErrorNote>Instagram : {o.error}</ErrorNote>
        </div>
      )}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "planning", label: "Planning", icon: <CalendarDays className="size-4" />, count: posts?.filter((p) => p.status === "programme").length },
          { value: "creer", label: "Créer", icon: <PenSquare className="size-4" /> },
          { value: "stats", label: "Statistiques", icon: <BarChart3 className="size-4" /> },
          { value: "croissance", label: "Croissance", icon: <Rocket className="size-4" /> },
          { value: "pubs", label: "Publicités Meta", icon: <Megaphone className="size-4" /> },
        ]}
      />
      {tab === "planning" && (posts ? <Planning posts={posts} published={o?.media ?? []} onEdit={(p) => edit(draftFromPost(p))} onChange={() => refreshPosts()} /> : <Skeleton className="h-96" />)}
      {tab === "creer" && (
        <Composer
          key={draftKey}
          initial={draft}
          overview={o}
          onSaved={() => {
            setDraft(emptyDraft());
            setDraftKey((k) => k + 1);
            refreshPosts();
            setTab("planning");
          }}
        />
      )}
      {tab === "stats" && (o ? <Stats o={o} /> : <Skeleton className="h-96" />)}
      {tab === "croissance" && <Growth onCreate={edit} />}
      {tab === "pubs" && <AdsPanel />}
    </div>
  );
}

export default function InstagramPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <InstagramInner />
    </Suspense>
  );
}
