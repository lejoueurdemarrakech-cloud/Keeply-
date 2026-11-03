import { useEffect, useRef } from "react";

export type Mode = "idle" | "listening" | "thinking" | "speaking";

const rgbVar = (name: string): [number, number, number] => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || getComputedStyle(document.body).getPropertyValue(name).trim();
  const p = v.split(/\s+/).map(Number);
  return p.length >= 3 && p.every((x) => !isNaN(x)) ? [p[0], p[1], p[2]] : [94, 231, 255];
};
const c = (rgb: [number, number, number], a: number) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;

/**
 * Réacteur central (canvas 2D) : graduations, anneaux qui tournent,
 * balayage radar, barres audio circulaires, cœur à segments.
 */
export function Reactor({ mode, level, theme, size = 380, onClick, label }: { mode: Mode; level: () => number; theme: string; size?: number; onClick?: () => void; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef(mode);
  const levelRef = useRef(level);
  useEffect(() => {
    modeRef.current = mode;
    levelRef.current = level;
  });

  useEffect(() => {
    const el = ref.current!;
    const ctx = el.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let A = rgbVar("--a");
    let B = rgbVar("--b");
    // Les couleurs du thème sont relues après la transition CSS.
    const recolor = setTimeout(() => {
      A = rgbVar("--a");
      B = rgbVar("--b");
    }, 50);
    let raf = 0;
    let spin = 0;
    let sweep = 0;
    let smooth = 0;
    let ignite = 0;
    const bars = new Float32Array(120);
    const parts = Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, r: 1.05 + Math.random() * 0.75, s: 0.0008 + Math.random() * 0.003, z: Math.random() }));

    const resize = () => {
      const r = el.getBoundingClientRect();
      el.width = Math.round(r.width * dpr);
      el.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const draw = (t: number) => {
      const w = el.width / dpr;
      const h = el.height / dpr;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.3;
      const m = modeRef.current;
      const lv = reduce ? 0 : Math.max(0, Math.min(1, levelRef.current() || 0));
      smooth += (lv - smooth) * (lv > smooth ? 0.4 : 0.1);
      ignite = Math.min(1, ignite + 0.012);
      const e = 1 - Math.pow(1 - ignite, 3);
      const speed = m === "thinking" ? 3.2 : m === "speaking" ? 1.4 : m === "listening" ? 1.2 : 0.6;
      if (!reduce) {
        spin += 0.0035 * speed;
        sweep += 0.02 * speed;
      }
      ctx.clearRect(0, 0, w, h);

      // Halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.6);
      halo.addColorStop(0, c(A, (0.28 + smooth * 0.25) * e));
      halo.addColorStop(0.5, c(A, 0.07 * e));
      halo.addColorStop(1, c(A, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Graduations extérieures (cadran)
      const rT = R * 1.55 * e;
      for (let i = 0; i < 180; i++) {
        const a = (i / 180) * Math.PI * 2 + spin * 0.35;
        const long = i % 15 === 0;
        const len = long ? 9 : i % 5 === 0 ? 5 : 2.5;
        ctx.strokeStyle = c(A, long ? 0.55 : 0.18);
        ctx.lineWidth = long ? 1.4 : 1;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * rT, cy + Math.sin(a) * rT);
        ctx.lineTo(cx + Math.cos(a) * (rT - len), cy + Math.sin(a) * (rT - len));
        ctx.stroke();
      }

      // Anneaux d'arcs qui tournent en sens contraires
      const rings: [number, number, number, number, number, [number, number, number]][] = [
        [1.4, 3, 0.62, 1.6, 1, A],
        [1.28, 8, 0.32, 3, -1.7, A],
        [1.19, 2, 0.18, 1.2, 2.4, B],
        [1.1, 40, 0.5, 1, -0.6, A],
      ];
      for (const [rr, segs, len, lw, dir, col] of rings) {
        const step = (Math.PI * 2) / segs;
        ctx.strokeStyle = c(col, rr === 1.1 ? 0.22 : 0.6);
        ctx.lineWidth = lw;
        for (let i = 0; i < segs; i++) {
          const s = spin * dir + i * step;
          ctx.beginPath();
          ctx.arc(cx, cy, R * rr * e, s, s + step * len);
          ctx.stroke();
        }
      }

      // Balayage radar (pendant la réflexion et l'écoute)
      if (!reduce && (m === "thinking" || m === "listening") && "createConicGradient" in ctx) {
        const g = ctx.createConicGradient(sweep, cx, cy);
        g.addColorStop(0, c(m === "listening" ? B : A, 0.32));
        g.addColorStop(0.1, c(A, 0));
        g.addColorStop(1, c(A, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.38, 0, Math.PI * 2);
        ctx.arc(cx, cy, R * 0.82, 0, Math.PI * 2, true);
        ctx.fill();
      }

      // Barres audio circulaires
      const n = bars.length;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const target = reduce ? 0.05 : smooth * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.37 + t / 140) * Math.cos(i * 0.11 - t / 260))) + 0.03;
        bars[i] += (target - bars[i]) * 0.3;
        const r1 = R * 0.9;
        const r2 = r1 + R * 0.22 * bars[i];
        ctx.strokeStyle = c(m === "listening" ? B : A, 0.35 + bars[i] * 0.65);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.stroke();
      }

      // Particules
      for (const p of parts) {
        if (!reduce) p.a += p.s * speed;
        const r = R * p.r * e;
        ctx.fillStyle = c(p.z > 0.75 ? B : A, 0.15 + p.z * 0.45);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(p.a) * r, cy + Math.sin(p.a) * r, 0.5 + p.z * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cœur : bobines en segments
      const coils = 10;
      const rIn = R * 0.5;
      const rOut = R * 0.74;
      for (let i = 0; i < coils; i++) {
        const a0 = (i / coils) * Math.PI * 2 + spin * 0.6 + 0.05;
        const a1 = a0 + (Math.PI * 2) / coils - 0.1;
        const glow = 0.45 + smooth * 0.5 + (m === "thinking" ? 0.25 * Math.max(0, Math.sin(t / 120 - i * 0.7)) : 0);
        ctx.fillStyle = c(A, glow * 0.55 * e);
        ctx.beginPath();
        ctx.arc(cx, cy, rOut, a0, a1);
        ctx.arc(cx, cy, rIn, a1, a0, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = c(A, 0.8 * e);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.strokeStyle = c(A, 0.9 * e);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rOut + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Noyau lumineux
      const cr = R * (0.42 + smooth * 0.06 + (reduce ? 0 : Math.sin(t / 900) * 0.01)) * e;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      core.addColorStop(0, "rgba(255,255,255,1)");
      core.addColorStop(0.35, c(A, 0.95));
      core.addColorStop(0.75, c(A, 0.35));
      core.addColorStop(1, c(A, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
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
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(recolor);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      ro.disconnect();
    };
  }, [theme]);

  return (
    <button type="button" onClick={onClick} aria-label={label} style={{ width: size, height: size, maxWidth: "78vw", maxHeight: "78vw", borderRadius: "50%", position: "relative", flexShrink: 0, transition: "width .6s cubic-bezier(.22,1,.36,1), height .6s cubic-bezier(.22,1,.36,1)" }}>
      <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden />
    </button>
  );
}
