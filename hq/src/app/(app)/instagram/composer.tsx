"use client";
import { Bookmark, Heart, ImagePlus, Link2, MessageCircle, Send, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge, Button, Card, Field, Segmented, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import type { Post, PostFormat } from "@/lib/types";
import { nextSlots, toLocalInput, type IgOverview } from "./shared";

interface Settings {
  instagram: { handle: string; pillars: string[]; defaultHashtags: string };
}
type Variant = { hook: string; caption: string; hashtags: string; cta: string };

export interface Draft {
  id?: string;
  format: PostFormat;
  caption: string;
  media: string[];
  firstComment: string;
  pillar: string;
  scheduledAt: string; // valeur d'input datetime-local
}

export const emptyDraft = (): Draft => ({ format: "image", caption: "", media: [], firstComment: "", pillar: "", scheduledAt: "" });

export function draftFromPost(p: Post): Draft {
  return {
    id: p.id,
    format: p.format,
    caption: p.caption,
    media: p.media,
    firstComment: p.firstComment ?? "",
    pillar: p.pillar ?? "",
    scheduledAt: p.scheduledAt ? toLocalInput(new Date(p.scheduledAt)) : "",
  };
}

export function Composer({ initial, overview, onSaved }: { initial: Draft; overview?: IgOverview; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: settings } = useApi<Settings>("/api/settings");
  const { data: library } = useApi<{ hashtagSets: { id: string; name: string; tags: string }[] }>("/api/instagram/library");

  const set = (patch: Partial<Draft>) => setD((cur) => ({ ...cur, ...patch }));
  const tags = (d.caption.match(/#[\p{L}\d_]+/gu) ?? []).length;
  const slots = nextSlots(overview?.analysis.best ?? []);
  const maxMedia = d.format === "carrousel" ? 10 : 1;

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy("upload");
    for (const f of [...files].slice(0, maxMedia - d.media.length)) {
      const fd = new FormData();
      fd.append("file", f);
      const res = await api<{ url: string; public: boolean }>("POST", "/api/upload", fd);
      if (res) {
        setD((cur) => ({ ...cur, media: [...cur.media, res.url].slice(0, maxMedia) }));
        if (!res.public) toast.warning("Image enregistrée sur cet ordinateur seulement : Instagram ne pourra pas la lire. Configure « Stockage des images » dans Connexions.");
      }
    }
    setBusy(null);
  }

  async function generate() {
    if (!topic.trim()) return toast.error("Dis en quelques mots de quoi parle le post.");
    setBusy("ai");
    const res = await api<{ variants: Variant[]; demo?: boolean }>("POST", "/api/ai", { tool: "caption", input: { topic, format: d.format, pillar: d.pillar } });
    setBusy(null);
    if (res) {
      setVariants(res.variants);
      if (res.demo) toast.info("Exemples sans IA. Connecte Claude pour des légendes écrites sur mesure.");
    }
  }

  async function save(mode: "brouillon" | "programme" | "publier") {
    if (mode === "programme" && !d.scheduledAt) return toast.error("Choisis une date de publication.");
    if (mode !== "brouillon" && !d.media.length) return toast.error("Ajoute au moins une image ou une vidéo.");
    setBusy(mode);
    const body = {
      format: d.format,
      caption: d.caption,
      media: d.media,
      firstComment: d.firstComment || undefined,
      pillar: d.pillar || undefined,
      scheduledAt: mode === "programme" ? new Date(d.scheduledAt).toISOString() : null,
    };
    const saved = d.id ? await api<Post>("PATCH", `/api/instagram/posts/${d.id}`, body) : await api<Post>("POST", "/api/instagram/posts", body);
    if (saved && mode === "publier") {
      const pub = await api<Post>("POST", `/api/instagram/posts/${saved.id}/publish`);
      if (pub) toast.success("Publié sur Instagram.");
    } else if (saved) toast.success(mode === "programme" ? "Post programmé." : "Brouillon enregistré.");
    setBusy(null);
    if (saved) {
      setD(emptyDraft());
      setVariants([]);
      setTopic("");
      onSaved();
    }
  }

  const preview = d.media[0];
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        <Card title={d.id ? "Modifier le post" : "Nouveau post"}>
          <div className="space-y-4">
            <Segmented
              value={d.format}
              onChange={(format) => set({ format, media: format === "carrousel" ? d.media : d.media.slice(0, 1) })}
              options={[
                { value: "image", label: "Photo" },
                { value: "carrousel", label: "Carrousel" },
                { value: "reel", label: "Reel" },
                { value: "story", label: "Story" },
              ]}
            />

            <div>
              <p className="mb-1.5 text-[13px] font-semibold text-ink-2">
                Médias {d.format === "carrousel" ? `(${d.media.length}/10)` : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                {d.media.map((m, i) => (
                  <div key={m + i} className="group relative size-24 overflow-hidden rounded-xl border border-line bg-bg-2">
                    {/\.(mp4|mov)(\?|$)/i.test(m) ? <video src={m} className="size-full object-cover" muted /> : <img src={m} alt="" className="size-full object-cover" />}
                    <button
                      onClick={() => set({ media: d.media.filter((_, j) => j !== i) })}
                      className="absolute top-1 right-1 grid size-7 place-items-center rounded-lg bg-night/70 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      aria-label="Retirer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    {d.format === "carrousel" && <span className="absolute bottom-1 left-1 rounded-md bg-night/70 px-1.5 text-[11px] font-semibold text-white">{i + 1}</span>}
                  </div>
                ))}
                {d.media.length < maxMedia && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="grid size-24 place-items-center rounded-xl border-2 border-dashed border-line-2 text-ink-3 transition-colors hover:border-violet hover:text-violet"
                    disabled={busy === "upload"}
                  >
                    <span className="flex flex-col items-center gap-1 text-[12px] font-semibold">
                      <ImagePlus className="size-5" />
                      {busy === "upload" ? "Envoi…" : "Ajouter"}
                    </span>
                  </button>
                )}
                <input ref={fileRef} type="file" accept={d.format === "reel" ? "video/mp4,video/quicktime" : "image/jpeg,image/png,video/mp4"} multiple={d.format === "carrousel"} hidden onChange={(e) => upload(e.target.files)} />
              </div>
              {d.media.length < maxMedia && (
                <div className="mt-2 flex gap-2">
                  <input className="field h-9 py-1 text-[13px]" placeholder="… ou colle l'adresse https d'une image / vidéo" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                  <Button
                    size="sm"
                    className="h-9"
                    icon={<Link2 className="size-3.5" />}
                    disabled={!/^https?:\/\//.test(urlInput)}
                    onClick={() => {
                      set({ media: [...d.media, urlInput.trim()].slice(0, maxMedia) });
                      setUrlInput("");
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              )}
              <p className="mt-1.5 text-[12.5px] text-ink-3">Photo en JPEG, idéalement 1080 × 1350 (4:5). Reel : vidéo verticale MP4, 3 s à 15 min.</p>
            </div>

            {d.format !== "story" && (
              <Field
                label="Légende"
                hint={
                  <span className={cx(d.caption.length > 2200 || tags > 30 ? "text-coral" : "")}>
                    {d.caption.length}/2200 caractères · {tags}/30 hashtags
                  </span>
                }
              >
                <textarea className="field h-44" value={d.caption} onChange={(e) => set({ caption: e.target.value })} placeholder="La première ligne doit donner envie de lire la suite…" />
              </Field>
            )}

            {d.format !== "story" && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-ink-2">Ajouter des hashtags :</span>
                {settings && (
                  <Button size="sm" variant="ghost" onClick={() => set({ caption: `${d.caption.trim()}\n\n${settings.instagram.defaultHashtags}` })}>
                    Mes hashtags par défaut
                  </Button>
                )}
                {library?.hashtagSets.map((s) => (
                  <Button key={s.id} size="sm" variant="ghost" onClick={() => set({ caption: `${d.caption.trim()}\n\n${s.tags}` })}>
                    {s.name}
                  </Button>
                ))}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Rubrique">
                <select className="field" value={d.pillar} onChange={(e) => set({ pillar: e.target.value })}>
                  <option value="">—</option>
                  {settings?.instagram.pillars.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>
              {d.format !== "story" && (
                <Field label="Premier commentaire (facultatif)" hint="Publié juste après le post, pratique pour les hashtags.">
                  <input className="field" value={d.firstComment} onChange={(e) => set({ firstComment: e.target.value })} />
                </Field>
              )}
            </div>

            <div>
              <Field label="Date de publication">
                <input type="datetime-local" className="field sm:max-w-xs" value={d.scheduledAt} onChange={(e) => set({ scheduledAt: e.target.value })} />
              </Field>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[12.5px] text-ink-3">Tes meilleurs créneaux :</span>
                {slots.map((s) => (
                  <button key={s.toISOString()} onClick={() => set({ scheduledAt: toLocalInput(s) })} className="rounded-full bg-violet-soft px-2.5 py-1 text-[12.5px] font-semibold text-violet transition-colors hover:bg-violet hover:text-white">
                    {s.toLocaleString("fr-FR", { weekday: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
              {d.id && (
                <Button variant="ghost" onClick={() => setD(emptyDraft())}>
                  Annuler
                </Button>
              )}
              <Button loading={busy === "brouillon"} onClick={() => save("brouillon")}>
                Enregistrer le brouillon
              </Button>
              <Button loading={busy === "publier"} onClick={() => save("publier")} icon={<Send className="size-4" />}>
                Publier maintenant
              </Button>
              <Button variant="primary" loading={busy === "programme"} onClick={() => save("programme")}>
                Programmer
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Écrire avec l'IA" action={<Wand2 className="size-4 text-violet" />}>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input className="field" placeholder="Sujet : ex. les rappels automatiques d'anniversaire" value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
            <Button variant="primary" icon={<Sparkles className="size-4" />} loading={busy === "ai"} onClick={generate}>
              3 propositions
            </Button>
          </div>
          {variants.length > 0 && (
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {variants.map((v, i) => (
                <div key={i} className="flex flex-col rounded-xl border border-line bg-surface-2 p-3.5">
                  <p className="font-semibold">{v.hook}</p>
                  <p className="mt-2 line-clamp-6 flex-1 text-[13.5px] whitespace-pre-line text-ink-2">{v.caption}</p>
                  <p className="mt-2 text-[12.5px] text-violet">{v.cta}</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => set({ caption: `${v.hook}\n\n${v.caption}\n\n${v.cta}\n\n${v.hashtags}`.trim() })}
                  >
                    Utiliser
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-[13px] font-semibold text-ink-3">Aperçu</p>
        <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-[28px] border-[6px] border-night bg-white text-[#111] shadow-2xl">
          <div className="flex items-center gap-2 px-3 py-2.5">
            <span className="size-7 rounded-full bg-gradient-to-tr from-[#f3be72] to-[#6b4af2] p-[2px]">
              <span className="block size-full rounded-full border-2 border-white bg-[#6b4af2]" />
            </span>
            <span className="text-[13px] font-semibold">{settings?.instagram.handle ?? "keeply.app"}</span>
            {d.format !== "image" && (
              <Badge className="ml-auto" tone="violet">
                {d.format}
              </Badge>
            )}
          </div>
          <div className={cx("relative bg-[#efefef]", d.format === "reel" || d.format === "story" ? "aspect-[9/16]" : "aspect-[4/5]")}>
            {preview ? (
              /\.(mp4|mov)(\?|$)/i.test(preview) ? <video src={preview} className="size-full object-cover" muted autoPlay loop playsInline /> : <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-[13px] text-[#888]">Ton visuel apparaîtra ici</div>
            )}
            {d.format === "carrousel" && d.media.length > 1 && <span className="absolute top-2 right-2 rounded-full bg-black/60 px-2 text-[11px] font-semibold text-white">1/{d.media.length}</span>}
          </div>
          {d.format !== "story" && (
            <div className="px-3 pt-2.5 pb-4">
              <div className="flex gap-3.5">
                <Heart className="size-5" />
                <MessageCircle className="size-5" />
                <Send className="size-5" />
                <Bookmark className="ml-auto size-5" />
              </div>
              <p className="mt-2 line-clamp-3 text-[13px] whitespace-pre-line">
                <span className="font-semibold">{settings?.instagram.handle ?? "keeply.app"}</span> {d.caption || <span className="text-[#999]">Ta légende…</span>}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
