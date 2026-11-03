import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import type { Block, View } from "./types";

const safeUrl = (u?: string) => (u && /^https?:\/\//.test(u) ? u : undefined);

/** Markdown minimal et sûr (gras, listes, paragraphes) sans injection HTML. */
export function Md({ text }: { text: string }) {
  const blocks = String(text).split(/\n{2,}/);
  const inline = (s: string) => s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => (p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>));
  return (
    <div className="md">
      {blocks.map((b, i) => {
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-•*] /.test(l)))
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-•*] /, ""))}</li>
              ))}
            </ul>
          );
        return <p key={i}>{lines.map((l, j) => [j > 0 && <br key={"b" + j} />, ...inline(l)])}</p>;
      })}
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 5, color = "rgb(var(--a))", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--a) / 0.12)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - v)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)", filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: size > 70 ? 15 : 12, fontWeight: 600 }}>
        {children}
      </div>
    </div>
  );
}

export function Spark({ values, height = 38, color = "rgb(var(--a))" }: { values: number[]; height?: number; color?: string }) {
  if (values.length < 2) return null;
  const hi = Math.max(...values);
  const lo = Math.min(...values);
  const pad = (hi - lo) * 0.15 || 1;
  const max = hi + pad;
  const min = lo >= 0 && lo - pad < 0 ? 0 : lo - pad;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / (max - min || 1)) * 90 - 5}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height }} aria-hidden>
      <polyline points={`0,100 ${pts} 100,100`} fill="rgb(var(--a) / 0.08)" stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function statusTone(s?: string) {
  const n = (s || "").toLowerCase();
  if (/cours|live|direct|mi-temps/.test(n)) return "live";
  if (/termin|fin|ft/.test(n)) return "done";
  return "soon";
}

function Chart({ b }: { b: Extract<Block, { type: "chart" }> }) {
  const pts = (b.points || []).slice(0, 24);
  if (!pts.length) return null;
  const max = Math.max(...pts.map((p) => Number(p.value) || 0), 1);
  if (b.kind === "line")
    return (
      <div>
        <Spark values={pts.map((p) => Number(p.value) || 0)} height={110} />
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--ink-3)" }}>
          <span>{pts[0].label}</span>
          <span>{pts[pts.length - 1].label}</span>
        </div>
      </div>
    );
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 130 }}>
      {pts.map((p, i) => (
        <div key={i} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }} title={`${p.label} : ${p.value}${b.unit ? " " + b.unit : ""}`}>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-2)" }}>{p.value}</span>
          <div className="rise" style={{ width: "100%", height: `${(Math.max(0, Number(p.value) || 0) / max) * 80}%`, background: "linear-gradient(to top, rgb(var(--a) / 0.25), rgb(var(--a)))", boxShadow: "0 0 12px rgb(var(--a) / 0.4)", borderRadius: "3px 3px 0 0", animationDelay: `${i * 30}ms` }} />
          <span style={{ fontSize: 10.5, color: "var(--ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{p.label}</span>
        </div>
      ))}
    </div>
  );
}

export function BlockView({ b, compact }: { b: Block; compact?: boolean }) {
  switch (b.type) {
    case "stats":
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(compact ? 2 : 4, b.items?.length || 1)}, minmax(0,1fr))`, gap: 10 }}>
          {(b.items || []).map((s, i) => (
            <div key={i} style={{ padding: "10px 12px", border: "1px solid rgb(var(--a) / 0.14)", background: "rgb(var(--a) / 0.04)", borderRadius: 6 }}>
              <div className="label" style={{ fontSize: 10.5 }}>{s.label}</div>
              <div className="hud-font glow-text" style={{ fontSize: compact ? 22 : 28, fontWeight: 700, lineHeight: 1.1, marginTop: 4 }}>{s.value}</div>
              {s.sub && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>}
            </div>
          ))}
        </div>
      );
    case "matches":
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {(b.items || []).map((m, i) => {
            const tone = statusTone(m.status);
            return (
              <div key={i} className="rise" style={{ animationDelay: `${i * 40}ms`, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 10, padding: "9px 12px", border: "1px solid rgb(var(--a) / 0.14)", background: tone === "live" ? "rgb(var(--bad) / 0.07)" : "rgb(var(--a) / 0.035)", borderRadius: 6 }}>
                <span className="hud-font" style={{ fontWeight: 700, fontSize: 15.5, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.home}</span>
                <span style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 76 }}>
                  <span className="mono glow-text" style={{ fontSize: 17, fontWeight: 700 }}>{m.score || m.time || "vs"}</span>
                  <span className={tone === "live" ? "pulse" : ""} style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", fontFamily: "Rajdhani", fontWeight: 700, color: tone === "live" ? "rgb(var(--bad))" : tone === "done" ? "var(--ink-3)" : "rgb(var(--b))" }}>
                    {m.status || (m.score ? "" : "à venir")}
                    {m.score && m.time && tone !== "done" ? ` · ${m.time}` : ""}
                  </span>
                </span>
                <span className="hud-font" style={{ fontWeight: 700, fontSize: 15.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.away}</span>
                {m.league && !compact && <span style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: 10.5, color: "var(--ink-3)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: -2 }}>{m.league}</span>}
              </div>
            );
          })}
        </div>
      );
    case "list":
      return (
        <div style={{ display: "grid", gap: 2 }}>
          {(b.items || []).map((it, i) => {
            const url = safeUrl(it.url);
            const inner = (
              <>
                <span style={{ width: 3, alignSelf: "stretch", background: "rgb(var(--a) / 0.6)", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: "block", fontSize: 13.5, color: "var(--ink)" }}>{it.title}</span>
                  {it.sub && <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)" }}>{it.sub}</span>}
                </span>
                {it.meta && <span className="mono" style={{ fontSize: 11.5, color: "rgb(var(--a))", flexShrink: 0 }}>{it.meta}</span>}
              </>
            );
            const style = { display: "flex", gap: 10, padding: "7px 8px", borderRadius: 5, alignItems: "center" } as const;
            return url ? (
              <a key={i} href={url} target="_blank" rel="noreferrer" style={style} className="hov">
                {inner}
              </a>
            ) : (
              <div key={i} style={style}>
                {inner}
              </div>
            );
          })}
        </div>
      );
    case "table":
      return (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                {(b.columns || []).map((c, i) => (
                  <th key={i} className="label" style={{ textAlign: i ? "right" : "left", padding: "6px 8px", borderBottom: "1px solid rgb(var(--a) / 0.25)", fontSize: 10.5 }}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(b.rows || []).map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? "rgb(var(--a) / 0.03)" : "transparent" }}>
                  {r.map((cell, j) => (
                    <td key={j} className={j ? "mono" : ""} style={{ textAlign: j ? "right" : "left", padding: "6px 8px", color: j ? "var(--ink)" : "var(--ink-2)" }}>
                      {String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "chart":
      return <Chart b={b} />;
    case "timeline":
      return (
        <div style={{ display: "grid", gap: 0, paddingLeft: 6 }}>
          {(b.items || []).map((it, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "64px 14px 1fr", gap: 8, minHeight: 38 }}>
              <span className="mono" style={{ fontSize: 12, color: "rgb(var(--a))", paddingTop: 1 }}>{it.time}</span>
              <span style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 5, top: 4, width: 7, height: 7, borderRadius: 9, background: "rgb(var(--a))", boxShadow: "0 0 8px rgb(var(--a))" }} />
                {i < (b.items?.length || 0) - 1 && <span style={{ position: "absolute", left: 8, top: 14, bottom: -4, width: 1, background: "rgb(var(--a) / 0.3)" }} />}
              </span>
              <span>
                <span style={{ display: "block", fontSize: 13.5 }}>{it.title}</span>
                {it.sub && <span style={{ display: "block", fontSize: 12, color: "var(--ink-3)" }}>{it.sub}</span>}
              </span>
            </div>
          ))}
        </div>
      );
    case "progress":
      return (
        <div style={{ display: "grid", gap: 10 }}>
          {(b.items || []).map((p, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                <span style={{ color: "var(--ink-2)" }}>{p.label}</span>
                <span className="mono" style={{ color: "rgb(var(--a))" }}>{p.text ?? `${Math.round((p.value || 0) * 100)} %`}</span>
              </div>
              <div style={{ height: 4, background: "rgb(var(--a) / 0.12)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${Math.max(0, Math.min(1, p.value || 0)) * 100}%`, background: "rgb(var(--a))", boxShadow: "0 0 10px rgb(var(--a))", borderRadius: 4, transition: "width .8s" }} />
              </div>
            </div>
          ))}
        </div>
      );
    case "text":
      return (
        <div style={{ fontSize: 14, color: "var(--ink-2)" }}>
          <Md text={b.text || ""} />
        </div>
      );
    case "links":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(b.items || []).map((l, i) =>
            safeUrl(l.url) ? (
              <a key={i} className="chip" href={l.url} target="_blank" rel="noreferrer">
                <ExternalLink size={13} /> {l.title}
              </a>
            ) : null,
          )}
        </div>
      );
    case "image":
      return safeUrl(b.url) ? (
        <figure style={{ margin: 0 }}>
          <img src={b.url} alt={b.caption || ""} style={{ width: "100%", maxHeight: compact ? 140 : 300, objectFit: "cover", borderRadius: 6, border: "1px solid rgb(var(--a) / 0.2)" }} loading="lazy" referrerPolicy="no-referrer" />
          {b.caption && <figcaption style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{b.caption}</figcaption>}
        </figure>
      ) : null;
    default:
      return null;
  }
}

export function ViewRenderer({ view, compact }: { view: View; compact?: boolean }) {
  return (
    <div style={{ display: "grid", gap: compact ? 10 : 14 }}>
      {!compact && (view.title || view.subtitle) && (
        <div>
          {view.title && (
            <div className="hud-font glow-text" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>
              {view.title}
            </div>
          )}
          {view.subtitle && <div style={{ color: "var(--ink-2)", fontSize: 13.5 }}>{view.subtitle}</div>}
        </div>
      )}
      {(view.blocks || []).slice(0, 8).map((b, i) => (
        <BlockView key={i} b={b} compact={compact} />
      ))}
      {!compact && view.sources?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <span className="label" style={{ fontSize: 10 }}>Sources</span>
          {view.sources.slice(0, 5).map((s, i) =>
            safeUrl(s.url) ? (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--ink-3)", textDecoration: "underline", textUnderlineOffset: 3 }}>
                {s.title || new URL(s.url).host}
              </a>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
