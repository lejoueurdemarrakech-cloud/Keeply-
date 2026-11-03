"use client";
import { useEffect, useRef } from "react";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

/* Couleurs Keeply : violet, miel, bleu ciel. */
const PALETTE: Record<OrbState, { core: [number, number, number]; ring: [number, number, number]; accent: [number, number, number] }> = {
  idle: { core: [107, 74, 242], ring: [139, 112, 255], accent: [243, 190, 114] },
  listening: { core: [120, 90, 255], ring: [243, 190, 114], accent: [255, 214, 150] },
  thinking: { core: [80, 110, 240], ring: [120, 166, 255], accent: [139, 112, 255] },
  speaking: { core: [123, 92, 255], ring: [170, 150, 255], accent: [243, 190, 114] },
};

const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/**
 * Orbe animée sur un seul canvas 2D : anneaux HUD, cœur lumineux,
 * onde circulaire qui suit le niveau sonore, particules en orbite.
 * S'arrête quand l'onglet est caché ; image fixe si « réduire les animations ».
 */
export function Orb({ state, level, onClick, label }: { state: OrbState; level: () => number; onClick?: () => void; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const levelRef = useRef(level);
  useEffect(() => {
    stateRef.current = state;
    levelRef.current = level;
  });

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0;
    let h = 0;
    let smooth = 0;
    let spin = 0;
    let colors = PALETTE.idle;
    const particles = Array.from({ length: 54 }, (_, i) => ({ a: (i / 54) * Math.PI * 2, r: 0.62 + Math.random() * 0.5, s: 0.0015 + Math.random() * 0.004, z: Math.random() }));

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = el.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const draw = (t: number) => {
      const st = stateRef.current;
      const target = PALETTE[st];
      colors = { core: mix(colors.core, target.core, 0.06), ring: mix(colors.ring, target.ring, 0.06), accent: mix(colors.accent, target.accent, 0.06) };
      const lv = reduce ? 0 : Math.max(0, Math.min(1, levelRef.current() || 0));
      smooth += (lv - smooth) * (lv > smooth ? 0.35 : 0.08);
      spin += st === "thinking" ? 0.022 : st === "speaking" ? 0.008 : st === "listening" ? 0.006 : 0.003;
      const breathe = reduce ? 0 : Math.sin(t / 1400) * 0.015;

      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.3;
      ctx.clearRect(0, 0, w, h);

      // Halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.65);
      halo.addColorStop(0, rgba(colors.core, 0.35 + smooth * 0.25));
      halo.addColorStop(0.45, rgba(colors.core, 0.1 + smooth * 0.1));
      halo.addColorStop(1, rgba(colors.core, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      // Anneaux HUD : arcs en pointillés qui tournent en sens opposés
      const rings = [
        { r: 1.32, segs: 3, len: 0.55, wid: 1.5, dir: 1, a: 0.55 },
        { r: 1.18, segs: 24, len: 0.12, wid: 2, dir: -1.6, a: 0.35 },
        { r: 1.48, segs: 2, len: 0.22, wid: 1, dir: 0.6, a: 0.4 },
      ];
      for (const ring of rings) {
        ctx.strokeStyle = rgba(colors.ring, ring.a);
        ctx.lineWidth = ring.wid;
        const step = (Math.PI * 2) / ring.segs;
        for (let i = 0; i < ring.segs; i++) {
          const start = spin * ring.dir + i * step;
          ctx.beginPath();
          ctx.arc(cx, cy, R * ring.r, start, start + step * ring.len * (st === "thinking" ? 1.3 : 1));
          ctx.stroke();
        }
      }

      // Graduations : s'allument avec le niveau sonore
      const ticks = 72;
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2 - Math.PI / 2;
        const lit = (Math.sin(i * 0.9 + t / 160) * 0.5 + 0.5) * smooth > 0.25 || i % 18 === 0;
        const r1 = R * 1.06;
        const r2 = R * (1.06 + (lit ? 0.07 + smooth * 0.08 : 0.035));
        ctx.strokeStyle = rgba(lit ? colors.accent : colors.ring, lit ? 0.85 : 0.22);
        ctx.lineWidth = lit ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Onde circulaire
      const pts = 120;
      const amp = R * (0.02 + smooth * 0.16);
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const a = (i / pts) * Math.PI * 2;
          const n = Math.sin(a * 5 + t / (layer ? 260 : 340)) * 0.5 + Math.sin(a * 9 - t / 210 + layer) * 0.3 + Math.sin(a * 3 + t / 520) * 0.2;
          const r = R * (0.86 + breathe) + n * amp * (layer ? 0.7 : 1);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(layer ? colors.ring : colors.accent, layer ? 0.5 : 0.75);
        ctx.lineWidth = layer ? 1.2 : 1.8;
        ctx.stroke();
      }

      // Particules
      for (const p of particles) {
        if (!reduce) p.a += p.s * (st === "thinking" ? 3 : 1 + smooth * 2);
        const r = R * (p.r + smooth * 0.15 * p.z);
        const x = cx + Math.cos(p.a) * r;
        const y = cy + Math.sin(p.a) * r * 0.92;
        ctx.fillStyle = rgba(p.z > 0.7 ? colors.accent : colors.ring, 0.25 + p.z * 0.5);
        ctx.beginPath();
        ctx.arc(x, y, 0.6 + p.z * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Cœur
      const cr = R * (0.62 + breathe + smooth * 0.1);
      const core = ctx.createRadialGradient(cx - cr * 0.3, cy - cr * 0.35, cr * 0.05, cx, cy, cr);
      core.addColorStop(0, "rgba(255,255,255,0.95)");
      core.addColorStop(0.18, rgba(mix(colors.core, [255, 255, 255], 0.55), 0.95));
      core.addColorStop(0.62, rgba(colors.core, 0.92));
      core.addColorStop(1, rgba(mix(colors.core, [10, 6, 30], 0.6), 0.95));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
      // Reflet de verre
      const gloss = ctx.createLinearGradient(cx, cy - cr, cx, cy);
      gloss.addColorStop(0, "rgba(255,255,255,0.35)");
      gloss.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gloss;
      ctx.beginPath();
      ctx.ellipse(cx, cy - cr * 0.45, cr * 0.62, cr * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    };
    if (reduce) {
      // Une image par seconde suffit à suivre les changements d'état.
      draw(0);
      const iv = setInterval(() => !document.hidden && draw(0), 400);
      return () => {
        clearInterval(iv);
        ro.disconnect();
      };
    }
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, []);

  return (
    <button type="button" onClick={onClick} aria-label={label} className="group relative block aspect-square w-full max-w-[min(440px,64vw)] lg:max-w-[min(440px,38vw)] rounded-full focus-visible:outline-offset-8">
      <canvas ref={canvas} className="absolute inset-0 size-full" aria-hidden />
    </button>
  );
}
