"use client";
import { Bookmark, ExternalLink, Eye, Heart, MessageCircle, Repeat2, Share2 } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, Empty, Modal, Segmented, cx } from "@/components/ui";
import { compact, dateTime, num, pct } from "@/lib/format";
import { usePref } from "@/lib/prefs";
import { emptyDraft, type Draft } from "./composer";
import { FORMAT_LABEL, type IgMedia } from "./shared";

type Sort = "recent" | "reach" | "engagement" | "saves" | "likes";

const interactions = (m: IgMedia) => m.likes + m.comments + m.saves + m.shares;
const rate = (m: IgMedia) => (m.reach ? interactions(m) / m.reach : 0);

const FORMAT_TO_DRAFT: Record<string, Draft["format"]> = { IMAGE: "image", CAROUSEL_ALBUM: "carrousel", REEL: "reel", VIDEO: "reel" };

export function Library({ media, onCreate }: { media: IgMedia[]; onCreate: (d: Draft) => void }) {
  const [sort, setSort] = usePref<Sort>("ig-lib-sort", "recent");
  const [format, setFormat] = useState<string>("tous");
  const [open, setOpen] = useState<IgMedia | null>(null);
  const avgRate = media.length ? media.reduce((s, m) => s + rate(m), 0) / media.length : 0;

  const list = media
    .filter((m) => format === "tous" || m.type === format || (format === "REEL" && m.type === "VIDEO"))
    .sort((a, b) => (sort === "recent" ? b.timestamp.localeCompare(a.timestamp) : sort === "engagement" ? rate(b) - rate(a) : b[sort] - a[sort]));

  const formats = Array.from(new Set(media.map((m) => (m.type === "VIDEO" ? "REEL" : m.type))));

  if (!media.length)
    return (
      <Card>
        <Empty title="Aucune publication pour l'instant">Dès que le compte Instagram est connecté, tes posts publiés apparaissent ici avec leurs chiffres.</Empty>
      </Card>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented value={format} onChange={setFormat} options={[{ value: "tous", label: "Tous" }, ...formats.map((f) => ({ value: f, label: FORMAT_LABEL[f] ?? f }))]} />
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          Trier par
          <select className="field w-auto py-1.5" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="recent">Plus récents</option>
            <option value="reach">Portée</option>
            <option value="engagement">Taux d&apos;engagement</option>
            <option value="saves">Enregistrements</option>
            <option value="likes">J&apos;aime</option>
          </select>
        </label>
        <span className="ml-auto text-[13px] text-ink-3">
          {list.length} publication{list.length > 1 ? "s" : ""}, engagement moyen {pct(avgRate, 1)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => {
          const r = rate(m);
          const strong = r > avgRate * 1.25;
          return (
            <button key={m.id} onClick={() => setOpen(m)} className="glass group overflow-hidden rounded-[20px] text-left">
              <div className="relative aspect-square overflow-hidden bg-bg-2">
                { }
                {m.thumbnail && <img src={m.thumbnail} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge>{FORMAT_LABEL[m.type] ?? m.type}</Badge>
                  <span className={cx("tnum text-[12.5px] font-semibold", strong ? "text-mint" : "text-ink-2")}>{pct(r, 1)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-[13px] text-ink-2">{m.caption || "Sans légende"}</p>
                <div className="tnum mt-2 flex gap-3 text-[12px] text-ink-3 [&_svg]:size-3.5">
                  <span className="flex items-center gap-1">
                    <Eye /> {compact(m.reach)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart /> {compact(m.likes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark /> {compact(m.saves)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title="Détail de la publication"
        wide
        footer={
          open && (
            <>
              {open.permalink && (
                <a href={open.permalink} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[14px] font-semibold text-ink-2 hover:bg-bg-2">
                  <ExternalLink className="size-4" /> Voir sur Instagram
                </a>
              )}
              <Button
                variant="primary"
                icon={<Repeat2 className="size-4" />}
                onClick={() => {
                  onCreate({ ...emptyDraft(), format: FORMAT_TO_DRAFT[open.type] ?? "image", caption: open.caption });
                  setOpen(null);
                }}
              >
                Refaire un post similaire
              </Button>
            </>
          )
        }
      >
        {open && (
          <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="aspect-square overflow-hidden rounded-2xl bg-bg-2">
              { }
              {open.thumbnail && <img src={open.thumbnail} alt="" className="size-full object-cover" />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] text-ink-3">
                {FORMAT_LABEL[open.type] ?? open.type}, publié le {dateTime(open.timestamp)}
              </p>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { i: <Eye />, l: "Portée", v: num(open.reach) },
                  { i: <Heart />, l: "J'aime", v: num(open.likes) },
                  { i: <MessageCircle />, l: "Commentaires", v: num(open.comments) },
                  { i: <Bookmark />, l: "Enregistrements", v: num(open.saves) },
                  { i: <Share2 />, l: "Partages", v: num(open.shares) },
                  { i: <Eye />, l: "Vues", v: num(open.views) },
                ].map((x) => (
                  <div key={x.l} className="glass-soft rounded-xl p-2.5">
                    <p className="flex items-center gap-1.5 text-[12px] text-ink-3 [&_svg]:size-3.5">
                      {x.i}
                      {x.l}
                    </p>
                    <p className="tnum font-semibold">{x.v}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[13.5px]">
                Taux d&apos;engagement <strong className="tnum">{pct(rate(open), 2)}</strong>{" "}
                <span className="text-ink-3">
                  ({rate(open) >= avgRate ? "au-dessus" : "en dessous"} de ta moyenne de {pct(avgRate, 1)})
                </span>
              </p>
              <p className="mt-3 max-h-40 overflow-y-auto rounded-xl bg-bg-2 p-3 text-[13.5px] whitespace-pre-line text-ink-2">{open.caption || "Sans légende"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
