"use client";
import { Aperture, BarChart3, CalendarDays, Grid3x3, Megaphone, PenSquare, RefreshCw, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button, DemoBadge, ErrorNote, PageHeader, Skeleton, Tabs } from "@/components/ui";
import { useApi } from "@/lib/client";
import type { Post } from "@/lib/types";
import { Composer, draftFromPost, emptyDraft, type Draft } from "./composer";
import { Growth } from "./growth";
import { Library } from "./library";
import { Planning } from "./planning";
import type { IgOverview } from "./shared";
import { Stats } from "./stats";

type Tab = "planning" | "creer" | "publications" | "stats" | "croissance";

function InstagramInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTabState] = useState<Tab>((params.get("tab") as Tab) || "planning");
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [draftKey, setDraftKey] = useState(0);
  const { data: o, mutate: refreshOverview, isValidating } = useApi<IgOverview>("/api/instagram/overview");
  const { data: posts, mutate: refreshPosts } = useApi<Post[]>("/api/instagram/posts");

  // Anciens liens « Instagram > Publicités » : les pubs ont leur propre page.
  useEffect(() => {
    if (params.get("tab") === "pubs") router.replace("/ads");
  }, [params, router]);

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
        icon={<Aperture />}
        title="Instagram"
        subtitle={
          <>
            {o ? `@${o.account.username}. ` : ""}Programme tes posts, suis tes chiffres et fais grandir le compte. <DemoBadge show={!!o && !o.live} />
          </>
        }
        actions={
          <>
            <Link href="/ads" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-ink-2 hover:bg-bg-2 hover:text-ink">
              <Megaphone className="size-4" /> Meta Ads
            </Link>
            <Button variant="secondary" icon={<RefreshCw className="size-4" />} loading={isValidating} onClick={() => fetch("/api/instagram/overview?refresh=1").then(() => refreshOverview())}>
              Actualiser
            </Button>
            <Button variant="primary" icon={<PenSquare className="size-4" />} onClick={() => setTab("creer")}>
              Nouveau post
            </Button>
          </>
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
          { value: "publications", label: "Publications", icon: <Grid3x3 className="size-4" />, count: o?.media.length },
          { value: "stats", label: "Statistiques", icon: <BarChart3 className="size-4" /> },
          { value: "croissance", label: "Croissance", icon: <Rocket className="size-4" /> },
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
      {tab === "publications" && (o ? <Library media={o.media} onCreate={edit} /> : <Skeleton className="h-96" />)}
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
