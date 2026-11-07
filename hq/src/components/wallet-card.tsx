"use client";
// Carte Apple Wallet (storeCard) dessinée comme dans l'app iOS : mêmes positions, mêmes tailles de texte,
// même bandeau. Largeur de référence 320 px, agrandie à l'export.
import * as Icons from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { rgba, shade, type StudioCard } from "@/lib/card-studio";

export const CARD_WIDTH = 320;
const STRIP_H = (CARD_WIDTH * 144) / 375;
const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

function useQr(payload: string) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(payload, { margin: 0, width: 300, errorCorrectionLevel: "M" }).then((s) => alive && setSrc(s));
    return () => {
      alive = false;
    };
  }, [payload]);
  return src;
}

export function LucideByName({ name, size, color, strokeWidth = 2 }: { name: string; size: number; color: string; strokeWidth?: number }) {
  const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Star;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

function Logo({ c }: { c: StudioCard }) {
  const radius = c.logoShape === "circle" ? 15 : 7;
  const framed = c.logoShape !== "none";
  if (c.logoKind === "image" && c.logoImage) {
    // Logo importé : affiché tel quel, comme l'app le fait avec un logo « original ».
    return <img src={c.logoImage} alt="" style={{ maxWidth: 90, maxHeight: 30, objectFit: "contain", borderRadius: c.logoShape === "circle" ? 15 : c.logoShape === "square" ? 6 : 0 }} />;
  }
  const box = { width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: radius, background: framed ? c.fg : "transparent", flexShrink: 0 } as const;
  const ink = framed ? c.bg : c.fg;
  if (c.logoKind === "monogram") {
    return (
      <span style={box}>
        <span style={{ color: ink, fontSize: c.logoText.length > 2 ? 10 : 13, fontWeight: 800, letterSpacing: 0.3, fontFamily: '"Bricolage Grotesque", ' + FONT }}>{c.logoText.slice(0, 3).toUpperCase() || "K"}</span>
      </span>
    );
  }
  if (c.logoKind === "emoji") {
    return (
      <span style={{ ...box, background: framed ? rgba(c.fg, 0.18) : "transparent" }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>{c.logoEmoji}</span>
      </span>
    );
  }
  return (
    <span style={box}>
      <LucideByName name={c.logoIcon} size={framed ? 18 : 24} color={ink} strokeWidth={2.2} />
    </span>
  );
}

function Strip({ c, onPan }: { c: StudioCard; onPan?: (dx: number, dy: number) => void }) {
  const overPhoto = c.strip === "photo" && !!c.photo;
  const gradient = `radial-gradient(260px 260px at 15% 0%, rgba(255,255,255,0.22), transparent 70%), linear-gradient(135deg, ${shade(c.bg, 0.16)}, ${c.bg} 50%, ${shade(c.bg, -0.2)})`;

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    if (!onPan || !overPhoto) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    let last = { x: e.clientX, y: e.clientY };
    const el = e.currentTarget;
    const move = (ev: PointerEvent) => {
      onPan(ev.clientX - last.x, ev.clientY - last.y);
      last = { x: ev.clientX, y: ev.clientY };
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  }

  const slots = Math.max(1, Math.min(c.stampsRequired, 10));
  const rows = slots > 5 ? 2 : 1;
  const perRow = Math.ceil(slots / rows);
  const d = Math.min(STRIP_H * (rows === 1 ? 0.46 : 0.34), (CARD_WIDTH * 0.86) / (perRow * 1.28));
  const filled = Math.min(Math.max(c.stampsFilled, 0), slots);
  const unit = STRIP_H / 144;
  const fraction = Math.min(Math.max(c.points / Math.max(c.pointsGoal, 1), 0), 1);

  return (
    <div onPointerDown={down} style={{ position: "relative", height: STRIP_H, overflow: "hidden", background: c.strip === "solid" ? c.bg : gradient, cursor: onPan && overPhoto ? "grab" : undefined, touchAction: onPan && overPhoto ? "none" : undefined }}>
      {overPhoto && (
        <>
          <img src={c.photo!} alt="" draggable={false} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: `${c.posX}% ${c.posY}%`, transform: `scale(${c.zoom})`, transformOrigin: `${c.posX}% ${c.posY}%`, pointerEvents: "none", userSelect: "none" }} />
          <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${c.dim})` }} />
        </>
      )}
      {c.strip === "pattern" && (
        <div style={{ position: "absolute", inset: -40, display: "flex", flexWrap: "wrap", gap: 14, alignContent: "flex-start", transform: "rotate(-14deg)", opacity: 0.22, fontSize: STRIP_H / 3.2 * 0.55, lineHeight: 1 }}>
          {Array.from({ length: 70 }, (_, i) => (
            <span key={i} style={{ marginLeft: Math.floor(i / 11) % 2 ? 18 : 0 }}>{c.patternEmoji}</span>
          ))}
        </div>
      )}

      {c.model === "stamps" ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: d * 0.26, filter: `drop-shadow(0 1px ${overPhoto ? 4 : 2}px rgba(0,0,0,${overPhoto ? 0.35 : 0.12}))` }}>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: "flex", gap: d * 0.28 }}>
              {Array.from({ length: perRow }, (_, col) => {
                const i = r * perRow + col;
                if (i >= slots) return null;
                const on = i < filled;
                return (
                  <span key={col} style={{ width: d, height: d, borderRadius: "50%", display: "grid", placeItems: "center", background: on ? rgba(c.fg, 0.92) : rgba(c.fg, 0.14), boxShadow: on ? undefined : `inset 0 0 0 ${Math.max(1.2, d * 0.045)}px ${rgba(c.fg, 0.55)}` }}>
                    {on && (c.stampEmoji ? <span style={{ fontSize: d * 0.58, lineHeight: 1 }}>{c.stampEmoji}</span> : <Icons.Check size={d * 0.5} color={c.bg} strokeWidth={4} />)}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 12, top: 10, color: c.fg }}>
            <div style={{ fontSize: 38, fontWeight: 300, lineHeight: 1.05 }}>{c.points.toLocaleString("fr-FR")}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.label, whiteSpace: "nowrap" }}>
              points{c.showProgress && c.points < c.pointsGoal ? ` · encore ${(c.pointsGoal - c.points).toLocaleString("fr-FR")} pour ${c.rewardTitle}` : ""}
            </div>
          </div>
          {c.showProgress && (
            <>
              {overPhoto && <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: STRIP_H * 0.42, background: "linear-gradient(transparent, rgba(0,0,0,0.32))" }} />}
              <div style={{ position: "absolute", left: 16 * unit, right: 16 * unit, bottom: 14 * unit, height: 6 * unit, borderRadius: 99, background: rgba(c.fg, 0.28), boxShadow: `0 ${unit}px ${2 * unit}px rgba(0,0,0,${overPhoto ? 0.3 : 0.12})` }}>
                <div style={{ height: "100%", width: `max(${fraction * 100}%, ${fraction > 0 ? 6 * unit : 0}px)`, borderRadius: 99, background: c.fg }} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function Field({ label, value, align, c }: { label: string; value: string; align: "left" | "right"; c: StudioCard }) {
  return (
    <div style={{ flex: 1, minWidth: 0, textAlign: align }}>
      <div style={{ fontSize: 8.5, fontWeight: 600, color: c.label, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
      <div style={{ fontSize: 13, color: c.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{value}</div>
    </div>
  );
}

export function WalletCard({ c, onPan, shadow = true }: { c: StudioCard; onPan?: (dx: number, dy: number) => void; shadow?: boolean }) {
  const qr = useQr(`keeply://c/${c.id.toUpperCase()}`);
  return (
    <div style={{ width: CARD_WIDTH, background: c.bg, borderRadius: 12, overflow: "hidden", fontFamily: FONT, color: c.fg, boxShadow: shadow ? "0 6px 24px rgba(0,0,0,0.18)" : undefined, WebkitFontSmoothing: "antialiased" }}>
      <div style={{ height: 46, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
        <Logo c={c} />
        <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>{c.name}</div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 8.5, fontWeight: 600, color: c.label }}>{c.headerLabel}</div>
          <div style={{ fontSize: 17, lineHeight: 1.15 }}>{c.rewards}</div>
        </div>
      </div>
      <Strip c={c} onPan={onPan} />
      <div style={{ display: "flex", gap: 8, padding: "10px 12px 8px" }}>
        <Field label={c.primaryLabel} value={c.primaryValue} align="left" c={c} />
        <Field label={c.secondaryLabel} value={c.secondaryValue} align="left" c={c} />
        <Field label={c.auxiliaryLabel} value={c.auxiliaryValue} align="right" c={c} />
      </div>
      {c.showQr && (
        <div style={{ display: "flex", justifyContent: "center", padding: "4px 0 14px" }}>
          <div style={{ background: "#fff", borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {qr ? <img src={qr} alt="" style={{ width: 74, height: 74, imageRendering: "pixelated" }} /> : <div style={{ width: 74, height: 74 }} />}
          </div>
        </div>
      )}
    </div>
  );
}
