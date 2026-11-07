"use client";
// Cadrage du bandeau comme dans l'app (StripFramingEditor.swift) : la photo entière, la fenêtre du bandeau
// par-dessus, qu'on glisse, qu'on zoome, ou qu'on guide au joystick pour les derniers pixels.
import { Minus, Plus, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Button } from "@/components/ui";
import { useImageSize } from "@/components/wallet-card";
import { MAX_ZOOM, stripWindow, type StudioCard } from "@/lib/card-studio";

export function FramingEditor({ card, set }: { card: StudioCard; set: (p: Partial<StudioCard>) => void }) {
  const nat = useImageSize(card.photo);
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef(card);
  useEffect(() => {
    latest.current = card;
  }, [card]);

  // Déplace la fenêtre d'une fraction de sa propre taille, en partant de la carte la plus récente.
  function nudge(fx: number, fy: number, zoom?: number) {
    const c = latest.current;
    if (!nat) return;
    const z = zoom ?? c.zoom;
    const w = stripWindow(nat.w, nat.h, z, c.posX, c.posY);
    const next = stripWindow(nat.w, nat.h, z, ((w.cx + fx * w.vw) / nat.w) * 100, ((w.cy + fy * w.vh) / nat.h) * 100);
    latest.current = { ...c, zoom: z, posX: next.posX, posY: next.posY };
    set({ zoom: z, posX: next.posX, posY: next.posY });
  }

  function dragWindow(e: ReactPointerEvent<HTMLDivElement>) {
    if (!nat || !box.current) return;
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const scale = box.current.clientWidth / nat.w;
    const c = latest.current;
    const start = { x: e.clientX, y: e.clientY, w: stripWindow(nat.w, nat.h, c.zoom, c.posX, c.posY) };
    const move = (ev: PointerEvent) => {
      const next = stripWindow(nat.w, nat.h, latest.current.zoom, ((start.w.cx + (ev.clientX - start.x) / scale) / nat.w) * 100, ((start.w.cy + (ev.clientY - start.y) / scale) / nat.h) * 100);
      set({ posX: next.posX, posY: next.posY });
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  }

  const setZoom = (z: number) => nudge(0, 0, Math.min(Math.max(z, 1), MAX_ZOOM));

  if (!nat) return <div className="aspect-[3/2] animate-pulse rounded-xl bg-bg-2" />;
  const win = stripWindow(nat.w, nat.h, card.zoom, card.posX, card.posY);
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return (
    <div className="space-y-3">
      <div ref={box} className="relative overflow-hidden rounded-xl bg-black select-none" style={{ aspectRatio: `${nat.w} / ${nat.h}` }}>
        <img src={card.photo!} alt="" draggable={false} className="absolute inset-0 size-full" />
        <div
          onPointerDown={dragWindow}
          className="absolute cursor-grab rounded-[6px] border-2 border-white active:cursor-grabbing"
          style={{ left: pct(win.x, nat.w), top: pct(win.y, nat.h), width: pct(win.vw, nat.w), height: pct(win.vh, nat.h), boxShadow: "0 0 0 9999px rgba(0,0,0,0.62)", touchAction: "none" }}
        >
          <span className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="border-[0.5px] border-white/25" />
            ))}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Joystick onMove={(x, y) => nudge(x * 0.7, y * 0.7)} />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Dézoomer" onClick={() => setZoom(card.zoom - 0.1)} className="rounded-lg p-1 text-ink-2 hover:bg-bg-2">
              <Minus className="size-4" />
            </button>
            <input type="range" aria-label="Zoom" min={1} max={MAX_ZOOM} step={0.01} value={card.zoom} onChange={(e) => setZoom(Number(e.target.value))} className="min-w-0 flex-1 accent-[var(--violet)]" />
            <button type="button" aria-label="Zoomer" onClick={() => setZoom(card.zoom + 0.1)} className="rounded-lg p-1 text-ink-2 hover:bg-bg-2">
              <Plus className="size-4" />
            </button>
            <span className="tnum w-11 text-right text-[12.5px] text-ink-3">{Math.round(card.zoom * 100)} %</span>
          </div>
          <Button size="sm" icon={<RotateCcw className="size-4" />} onClick={() => set({ zoom: 1, posX: 50, posY: 50 })}>
            Recentrer
          </Button>
          <p className="text-[12px] leading-snug text-ink-3">Glisse le cadre, zoome, ou guide-le au joystick. Tu peux aussi glisser la photo sur la carte.</p>
        </div>
      </div>
    </div>
  );
}

/** Joystick : on tire le bouton, il revient au centre au relâchement. Plus on penche, plus ça va vite. */
function Joystick({ onMove }: { onMove: (x: number, y: number) => void }) {
  const SIZE = 96;
  const KNOB = 44;
  const [value, setValue] = useState({ x: 0, y: 0 });
  const live = useRef({ x: 0, y: 0 });
  const handler = useRef(onMove);
  useEffect(() => {
    handler.current = onMove;
  }, [onMove]);

  const active = value.x !== 0 || value.y !== 0;
  useEffect(() => {
    if (!active) return;
    // Vitesse en fonction du temps écoulé, pas du nombre d'images : même allure sur tous les écrans.
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now) {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      handler.current(live.current.x * dt, live.current.y * dt);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch {}
    const travel = (SIZE - KNOB) / 2;
    const start = { x: e.clientX, y: e.clientY };
    const move = (ev: PointerEvent) => {
      let dx = (ev.clientX - start.x) / travel;
      let dy = (ev.clientY - start.y) / travel;
      const len = Math.hypot(dx, dy);
      if (len > 1) {
        dx /= len;
        dy /= len;
      }
      live.current = { x: dx, y: dy };
      setValue(live.current);
    };
    const up = () => {
      live.current = { x: 0, y: 0 };
      setValue(live.current);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  }

  const travel = (SIZE - KNOB) / 2;
  return (
    <div onPointerDown={down} className="relative shrink-0 cursor-grab touch-none rounded-full border border-line bg-bg-2 active:cursor-grabbing" style={{ width: SIZE, height: SIZE }} aria-label="Joystick de cadrage" role="presentation">
      {[0, 90, 180, 270].map((r) => (
        <span key={r} className="absolute inset-0 grid place-items-start justify-center pt-1.5 text-[10px] text-ink-3" style={{ transform: `rotate(${r}deg)` }}>
          ▲
        </span>
      ))}
      <span
        className="absolute rounded-full bg-violet shadow-[0_4px_12px_-2px_var(--violet)]"
        style={{ width: KNOB, height: KNOB, left: (SIZE - KNOB) / 2, top: (SIZE - KNOB) / 2, transform: `translate(${value.x * travel}px, ${value.y * travel}px)`, transition: !active ? "transform 0.25s cubic-bezier(.2,1.4,.4,1)" : "none" }}
      />
    </div>
  );
}
