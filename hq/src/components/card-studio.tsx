"use client";
import { Copy, CopyPlus, Crop, Dices, Download, ImagePlus, RotateCcw, Trash2, WalletCards, Wand2 } from "lucide-react";
import { toBlob, toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button, Card, Field, PageHeader, Segmented, Toggle, cx } from "@/components/ui";
import { CARD_WIDTH, LucideByName, WalletCard } from "@/components/wallet-card";
import { LOGO_ICONS, PALETTE, PHOTOS, PRESETS, autoColors, fromPreset, newId, photoUrl, randomCard, shade, type StudioCard } from "@/lib/card-studio";

const STORE_KEY = "hq-studio-cartes";

type Format = "card" | "square" | "portrait" | "story" | "landscape";
type Backdrop = "transparent" | "light" | "dark" | "brand" | "keeply" | "blur";

const FORMATS: { value: Format; label: string; w: number; h: number; hint: string }[] = [
  { value: "card", label: "Carte seule", w: 0, h: 0, hint: "PNG détouré, ~1500 px" },
  { value: "square", label: "Carré", w: 1080, h: 1080, hint: "Post 1080 × 1080" },
  { value: "portrait", label: "4:5", w: 1080, h: 1350, hint: "Post 1080 × 1350" },
  { value: "story", label: "Story", w: 1080, h: 1920, hint: "Story / Reel 1080 × 1920" },
  { value: "landscape", label: "Site", w: 1920, h: 1080, hint: "Bannière 1920 × 1080" },
];

const BACKDROPS: { value: Backdrop; label: string }[] = [
  { value: "transparent", label: "Transparent" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
  { value: "brand", label: "Couleur carte" },
  { value: "keeply", label: "Violet Keeply" },
  { value: "blur", label: "Photo floutée" },
];

/** Réduit une image importée pour qu'elle tienne dans le stockage du navigateur. */
function shrink(file: File, max: number, type: "image/jpeg" | "image/png"): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * k);
      canvas.height = Math.round(img.height * k);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL(type, 0.86));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

const slug = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "carte";

function loadCards(): StudioCard[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as StudioCard[];
    if (saved.length) return saved;
  } catch {}
  return [fromPreset(PRESETS[0])];
}

/** Chargé seulement dans le navigateur (les cartes vivent dans le stockage local). */
export default function CardStudio() {
  const [cards, setCards] = useState<StudioCard[]>(loadCards);
  const [currentId, setCurrentId] = useState<string | null>(() => cards[0]?.id ?? null);
  const [format, setFormat] = useState<Format>("portrait");
  const [backdrop, setBackdrop] = useState<Backdrop>("brand");
  const [size, setSize] = useState(86);
  const [tilt, setTilt] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Sauvegarde automatique dans le navigateur.
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(cards));
      } catch {
        toast.error("Stockage plein : supprime quelques cartes ou utilise des images plus légères.");
      }
    }, 300);
    return () => clearTimeout(t);
  }, [cards]);

  const card = cards.find((c) => c.id === currentId) ?? cards[0];
  const set = (patch: Partial<StudioCard>) => setCards((all) => all.map((c) => (c.id === card.id ? { ...c, ...patch, updatedAt: Date.now() } : c)));

  function add(c: StudioCard) {
    setCards((all) => [c, ...all]);
    setCurrentId(c.id);
  }

  async function exportPng(mode: "download" | "copy") {
    const node = sceneRef.current;
    if (!node) return;
    setBusy(mode);
    try {
      const f = FORMATS.find((x) => x.value === format)!;
      const ratio = f.w ? f.w / node.offsetWidth : 4;
      const opts = { pixelRatio: ratio, cacheBust: false };
      if (mode === "download") {
        const url = await toPng(node, opts);
        const a = document.createElement("a");
        a.href = url;
        a.download = `keeply-${slug(card.name)}-${format}.png`;
        a.click();
        toast.success("Image téléchargée");
      } else {
        const blob = await toBlob(node, opts);
        if (!blob) throw new Error("Image vide");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success("Image copiée : colle-la où tu veux");
      }
    } catch (e) {
      toast.error(`Export impossible : ${e instanceof Error ? e.message : String(e)}`);
    }
    setBusy(null);
  }

  if (!card) return null;

  return (
    <div>
      <PageHeader
        icon={<WalletCards />}
        title="Studio cartes"
        subtitle="Crée des cartes Wallet comme dans l'app, pour le site et les pubs. Tout est enregistré dans ce navigateur."
        actions={
          <>
            <Button icon={<Dices className="size-4" />} onClick={() => add(randomCard())}>
              Au hasard
            </Button>
            <Button variant="primary" icon={<CopyPlus className="size-4" />} onClick={() => add({ ...card, id: newId(), name: `${card.name} (copie)`, updatedAt: Date.now() })}>
              Dupliquer
            </Button>
          </>
        }
      />

      <Card title="Modèles de restaurants" className="mb-5" action={<span className="text-[12.5px] text-ink-3">Clique pour créer une carte à partir d&apos;un modèle</span>}>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {PRESETS.map((p) => {
            const c = fromPreset(p);
            return (
              <button key={p.name} onClick={() => add(fromPreset(p))} className="group shrink-0 text-left">
                <div className="overflow-hidden rounded-[10px] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-[0.98]" style={{ width: CARD_WIDTH * 0.5, height: 116 }}>
                  <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
                    <WalletCard c={{ ...c, showQr: false }} shadow={false} />
                  </div>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold">{p.name}</p>
                <p className="text-[12px] text-ink-3">{p.type}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-5">
          <Card
            title="Aperçu et export"
            action={
              <div className="flex gap-2">
                <Button size="sm" icon={<Copy className="size-4" />} loading={busy === "copy"} onClick={() => exportPng("copy")}>
                  Copier
                </Button>
                <Button size="sm" variant="primary" icon={<Download className="size-4" />} loading={busy === "download"} onClick={() => exportPng("download")}>
                  Télécharger le PNG
                </Button>
              </div>
            }
          >
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Segmented size="sm" value={format} onChange={setFormat} options={FORMATS.map((f) => ({ value: f.value, label: f.label }))} />
              {format !== "card" && <Segmented size="sm" value={backdrop} onChange={setBackdrop} options={BACKDROPS.map((b) => ({ value: b.value, label: b.label }))} />}
            </div>
            {format !== "card" && (
              <div className="mb-4 flex flex-wrap items-center gap-5 text-[13px] text-ink-2">
                <label className="flex items-center gap-2">
                  Taille de la carte
                  <input type="range" min={40} max={95} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-36 accent-[var(--violet)]" />
                </label>
                <label className="flex items-center gap-2">
                  <Toggle checked={tilt} onChange={setTilt} label="Inclinée" /> Inclinée
                </label>
              </div>
            )}
            <Stage format={format}>
              <Scene ref={sceneRef} card={card} format={format} backdrop={backdrop} size={size} tilt={tilt} onPan={(dx, dy, scale) => set({ posX: clamp(card.posX - (dx * 100) / (CARD_WIDTH * scale * card.zoom)), posY: clamp(card.posY - (dy * 300) / (CARD_WIDTH * scale * card.zoom)) })} />
            </Stage>
            <p className="mt-3 flex items-center gap-1.5 text-[12.5px] text-ink-3">
              <Crop className="size-3.5" /> Glisse la photo sur la carte pour la recadrer. {FORMATS.find((f) => f.value === format)!.hint}.
            </p>
          </Card>

          <Card title={`Mes cartes (${cards.length})`}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(176px,1fr))] gap-4">
              {cards.map((c) => (
                <div key={c.id} className={cx("group relative rounded-xl p-2 transition-colors", c.id === card.id ? "bg-violet-soft ring-2 ring-violet/50" : "hover:bg-bg-2")}>
                  <button onClick={() => setCurrentId(c.id)} className="block w-full text-left">
                    <div className="overflow-hidden rounded-[8px]" style={{ width: CARD_WIDTH * 0.5, height: 116 }}>
                      <div style={{ transform: "scale(0.5)", transformOrigin: "top left" }}>
                        <WalletCard c={{ ...c, showQr: false }} shadow={false} />
                      </div>
                    </div>
                    <p className="mt-1.5 truncate text-[13px] font-semibold">{c.name}</p>
                  </button>
                  {cards.length > 1 && (
                    <button
                      aria-label={`Supprimer ${c.name}`}
                      onClick={() => {
                        const rest = cards.filter((x) => x.id !== c.id);
                        setCards(rest);
                        if (c.id === card.id) setCurrentId(rest[0].id);
                      }}
                      className="absolute top-3 right-3 rounded-lg bg-black/55 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Editor card={card} set={set} />
      </div>
    </div>
  );
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/** Fait tenir la scène dans la colonne, sans changer sa taille réelle (celle de l'export). */
function Stage({ format, children }: { format: Format; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const f = FORMATS.find((x) => x.value === format)!;
  const sw = f.w ? f.w / 3 : CARD_WIDTH + 56;
  const maxH = 560;
  const scale = f.w ? Math.min(width / sw, maxH / (f.h / 3)) : Math.min(width / sw, 1.5);
  return (
    <div ref={box} className="grid place-items-center overflow-hidden rounded-2xl bg-bg-2 py-4" style={{ backgroundImage: "conic-gradient(var(--line) 25%, transparent 0 50%, var(--line) 0 75%, transparent 0)", backgroundSize: "18px 18px" }}>
      <div style={{ zoom: scale }}>{children}</div>
    </div>
  );
}

function backdropStyle(b: Backdrop, c: StudioCard) {
  switch (b) {
    case "light":
      return { background: "radial-gradient(120% 90% at 50% 0%, #FFFFFF, #ECE9F3)" };
    case "dark":
      return { background: "radial-gradient(120% 90% at 50% 0%, #2A2D38, #0C0D11)" };
    case "brand":
      return { background: `radial-gradient(120% 90% at 30% 0%, ${shade(c.bg, 0.22)}, ${c.bg} 55%, ${shade(c.bg, -0.35)})` };
    case "keeply":
      return { background: "radial-gradient(120% 90% at 30% 0%, #9B84FF, #6B4AF2 55%, #3B1FB8)" };
    default:
      return {};
  }
}

function Scene({ card, format, backdrop, size, tilt, onPan, ref }: { card: StudioCard; format: Format; backdrop: Backdrop; size: number; tilt: boolean; onPan: (dx: number, dy: number, scale: number) => void; ref: React.Ref<HTMLDivElement> }) {
  const f = FORMATS.find((x) => x.value === format)!;
  if (!f.w) {
    return (
      <div ref={ref} style={{ padding: 28 }}>
        <WalletCard c={card} onPan={(dx, dy) => onPan(dx, dy, 1)} />
      </div>
    );
  }
  const w = f.w / 3;
  const h = f.h / 3;
  const scale = (Math.min(w, h * 0.72) * size) / 100 / CARD_WIDTH;
  return (
    <div ref={ref} style={{ width: w, height: h, position: "relative", overflow: "hidden", display: "grid", placeItems: "center", ...backdropStyle(backdrop, card) }}>
      {backdrop === "blur" && card.photo && (
        <>
          <img src={card.photo} alt="" style={{ position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", filter: "blur(18px) saturate(1.1)" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)" }} />
        </>
      )}
      <div style={{ transform: `scale(${scale}) rotate(${tilt ? -6 : 0}deg)`, filter: backdrop === "transparent" ? undefined : "drop-shadow(0 18px 30px rgba(0,0,0,0.28))" }}>
        <WalletCard c={card} shadow={backdrop === "transparent"} onPan={(dx, dy) => onPan(dx, dy, scale)} />
      </div>
    </div>
  );
}

// ——— Éditeur ———

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-4 first:pt-0 last:border-0 last:pb-0">
      <h3 className="mb-3 font-display text-[15px] font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Range({ label, value, min, max, step = 1, onChange, format }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-[13px] font-semibold text-ink-2">
        {label}
        <span className="tnum font-normal text-ink-3">{format ? format(value) : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-[var(--violet)]" />
    </label>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-[12.5px] font-semibold text-ink-2">
      {label}
      <span className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-2 py-1.5">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} className="size-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0" />
        <input value={value} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && onChange(e.target.value.toUpperCase())} className="tnum w-full min-w-0 bg-transparent font-mono text-[12px] font-normal outline-none" maxLength={7} />
      </span>
    </label>
  );
}

function UploadButton({ label, onFile }: { label: string; onFile: (f: File) => void }) {
  return (
    <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-xl border border-line-2 bg-glass-strong px-3 text-[13px] font-semibold text-ink backdrop-blur-md transition-[border-color,transform] duration-150 hover:border-violet/40 active:scale-[0.97]">
      <ImagePlus className="size-4" />
      {label}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function Editor({ card, set }: { card: StudioCard; set: (p: Partial<StudioCard>) => void }) {
  const themes = useMemo(() => [...new Set(PHOTOS.map((p) => p.theme))], []);
  const [theme, setTheme] = useState(themes[0]);

  return (
    <Card className="xl:sticky xl:top-4 xl:max-h-[calc(100dvh-32px)] xl:overflow-y-auto">
      <Section title="Restaurant">
        <Field label="Nom affiché sur la carte">
          <input className="field" value={card.name} maxLength={32} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented size="sm" value={card.logoKind} onChange={(v) => set({ logoKind: v })} options={[{ value: "icon", label: "Icône" }, { value: "monogram", label: "Initiales" }, { value: "emoji", label: "Emoji" }, { value: "image", label: "Mon logo" }]} />
          <Segmented size="sm" value={card.logoShape} onChange={(v) => set({ logoShape: v })} options={[{ value: "square", label: "Carré" }, { value: "circle", label: "Rond" }, { value: "none", label: "Sans cadre" }]} />
        </div>
        {card.logoKind === "icon" && (
          <div className="grid grid-cols-9 gap-1">
            {LOGO_ICONS.map((n) => (
              <button key={n} title={n} onClick={() => set({ logoIcon: n })} className={cx("grid aspect-square place-items-center rounded-lg transition-colors", card.logoIcon === n ? "bg-violet text-white" : "text-ink-2 hover:bg-bg-2")}>
                <LucideByName name={n} size={17} color="currentColor" />
              </button>
            ))}
          </div>
        )}
        {card.logoKind === "monogram" && (
          <Field label="Initiales (3 lettres max)">
            <input className="field" value={card.logoText} maxLength={3} onChange={(e) => set({ logoText: e.target.value })} />
          </Field>
        )}
        {card.logoKind === "emoji" && (
          <Field label="Emoji">
            <input className="field" value={card.logoEmoji} maxLength={4} onChange={(e) => set({ logoEmoji: e.target.value })} />
          </Field>
        )}
        {card.logoKind === "image" && (
          <div className="flex items-center gap-3">
            <UploadButton label={card.logoImage ? "Changer le logo" : "Importer un logo"} onFile={async (f) => set({ logoImage: await shrink(f, 400, "image/png") })} />
            <span className="text-[12px] text-ink-3">PNG détouré conseillé</span>
          </div>
        )}
      </Section>

      <Section title="Couleurs">
        <div className="grid grid-cols-10 gap-1.5">
          {PALETTE.map((p) => (
            <button key={p.hex} title={p.name} onClick={() => set({ bg: p.hex, ...autoColors(p.hex) })} className={cx("aspect-square rounded-full border border-black/10 transition-transform hover:scale-110", card.bg === p.hex && "ring-2 ring-violet ring-offset-2 ring-offset-[var(--surface)]")} style={{ background: p.hex }} />
          ))}
        </div>
        <div className="flex gap-2">
          <ColorInput label="Fond" value={card.bg} onChange={(v) => set({ bg: v })} />
          <ColorInput label="Texte" value={card.fg} onChange={(v) => set({ fg: v })} />
          <ColorInput label="Étiquettes" value={card.label} onChange={(v) => set({ label: v })} />
        </div>
        <Button size="sm" icon={<Wand2 className="size-4" />} onClick={() => set(autoColors(card.bg))}>
          Texte lisible automatique
        </Button>
      </Section>

      <Section title="Bandeau">
        <Segmented size="sm" value={card.strip} onChange={(v) => set({ strip: v })} options={[{ value: "photo", label: "Photo" }, { value: "gradient", label: "Dégradé" }, { value: "pattern", label: "Motif" }, { value: "solid", label: "Uni" }]} />
        {card.strip === "photo" && (
          <>
            <div className="flex flex-wrap gap-1">
              {themes.map((t) => (
                <button key={t} onClick={() => setTheme(t)} className={cx("rounded-lg px-2 py-1 text-[12px] font-semibold", theme === t ? "bg-violet-soft text-violet" : "text-ink-3 hover:text-ink")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {PHOTOS.filter((p) => p.theme === theme).map((p) => (
                <button key={p.file} title={p.label} onClick={() => set({ photo: photoUrl(p.file), zoom: 1, posX: 50, posY: 50 })} className={cx("overflow-hidden rounded-lg", card.photo === photoUrl(p.file) && "ring-2 ring-violet")}>
                          <img src={photoUrl(p.file)} alt={p.label} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-200 hover:scale-105" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <UploadButton label="Ma photo" onFile={async (f) => set({ photo: await shrink(f, 1600, "image/jpeg"), zoom: 1, posX: 50, posY: 50 })} />
              <Button size="sm" icon={<RotateCcw className="size-4" />} onClick={() => set({ zoom: 1, posX: 50, posY: 50 })}>
                Recentrer
              </Button>
            </div>
            <Range label="Zoom" value={card.zoom} min={1} max={3} step={0.01} onChange={(v) => set({ zoom: v })} format={(v) => `${Math.round(v * 100)} %`} />
            <Range label="Position verticale" value={card.posY} min={0} max={100} onChange={(v) => set({ posY: v })} format={(v) => `${Math.round(v)} %`} />
            <Range label="Position horizontale" value={card.posX} min={0} max={100} onChange={(v) => set({ posX: v })} format={(v) => `${Math.round(v)} %`} />
            <Range label="Assombrir" value={card.dim} min={0} max={0.7} step={0.01} onChange={(v) => set({ dim: v })} format={(v) => `${Math.round(v * 100)} %`} />
          </>
        )}
        {card.strip === "pattern" && (
          <Field label="Emoji du motif">
            <input className="field" value={card.patternEmoji} maxLength={4} onChange={(e) => set({ patternEmoji: e.target.value })} />
          </Field>
        )}
      </Section>

      <Section title="Programme">
        <Segmented size="sm" value={card.model} onChange={(v) => set({ model: v })} options={[{ value: "stamps", label: "Tampons" }, { value: "points", label: "Points" }]} />
        {card.model === "stamps" ? (
          <>
            <Range label="Tampons pour une récompense" value={card.stampsRequired} min={1} max={10} onChange={(v) => set({ stampsRequired: v, stampsFilled: Math.min(card.stampsFilled, v) })} />
            <Range label="Tampons déjà gagnés" value={card.stampsFilled} min={0} max={card.stampsRequired} onChange={(v) => set({ stampsFilled: v })} />
            <Field label="Emoji des tampons (vide = coche)">
              <input className="field" value={card.stampEmoji} maxLength={4} onChange={(e) => set({ stampEmoji: e.target.value })} />
            </Field>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Solde">
                <input type="number" className="field" value={card.points} min={0} onChange={(e) => set({ points: Number(e.target.value) })} />
              </Field>
              <Field label="Prochain palier">
                <input type="number" className="field" value={card.pointsGoal} min={1} onChange={(e) => set({ pointsGoal: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="Récompense du palier">
              <input className="field" value={card.rewardTitle} onChange={(e) => set({ rewardTitle: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-[13px] text-ink-2">
              <Toggle checked={card.showProgress} onChange={(v) => set({ showProgress: v })} label="Barre de progression" /> Barre de progression
            </label>
          </>
        )}
        <Range label="Récompenses disponibles (en haut à droite)" value={card.rewards} min={0} max={9} onChange={(v) => set({ rewards: v })} />
      </Section>

      <Section title="Textes">
        <Field label="Étiquette en haut à droite">
          <input className="field" value={card.headerLabel} onChange={(e) => set({ headerLabel: e.target.value.toUpperCase() })} />
        </Field>
        {(
          [
            ["primaryLabel", "primaryValue"],
            ["secondaryLabel", "secondaryValue"],
            ["auxiliaryLabel", "auxiliaryValue"],
          ] as const
        ).map(([l, v]) => (
          <div key={l} className="grid grid-cols-[2fr_3fr] gap-2">
            <input className="field" aria-label="Étiquette" value={card[l]} onChange={(e) => set({ [l]: e.target.value.toUpperCase() })} />
            <input className="field" aria-label="Valeur" value={card[v]} onChange={(e) => set({ [v]: e.target.value })} />
          </div>
        ))}
        <label className="flex items-center gap-2 text-[13px] text-ink-2">
          <Toggle checked={card.showQr} onChange={(v) => set({ showQr: v })} label="QR code" /> QR code
        </label>
      </Section>
    </Card>
  );
}
