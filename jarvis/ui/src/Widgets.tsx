import { AlertTriangle, BatteryCharging, BatteryMedium, Cpu, MemoryStick, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ring, Spark, ViewRenderer } from "./ViewRenderer";
import type { State, SystemStats, Widget } from "./types";

const eur = (n?: number | null) => (n == null ? "-" : `${Math.round(n).toLocaleString("fr-FR")} €`);
const ago = (iso?: string | null) => {
  if (!iso) return "";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  return m < 1 ? "à l'instant" : m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`;
};

/** Nombre qui défile jusqu'à sa valeur (une seule fois par changement). */
export function Count({ value, format = (n: number) => Math.round(n).toLocaleString("fr-FR") }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{format(shown)}</>;
}

export function Frame({ title, code, children, onRemove, onRefresh, refreshing, highlight, tag }: { title: string; code: string; children: ReactNode; onRemove?: () => void; onRefresh?: () => void; refreshing?: boolean; highlight?: boolean; tag?: ReactNode }) {
  return (
    <section className={`panel corners rise`} style={{ padding: "12px 14px 14px", outline: highlight ? "1px solid rgb(var(--a) / 0.8)" : undefined, boxShadow: highlight ? "0 0 30px rgb(var(--a) / 0.25)" : undefined, transition: "box-shadow .4s" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span className="mono" style={{ fontSize: 9.5, color: "rgb(var(--a) / 0.55)" }}>{code}</span>
        <span className="label" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--ink)" }}>
          {title}
        </span>
        {tag}
        {onRefresh && (
          <button onClick={onRefresh} aria-label="Actualiser" title="Actualiser" style={{ color: "var(--ink-3)", display: "grid", placeItems: "center", width: 22, height: 22 }}>
            <RefreshCw size={13} style={refreshing ? { animation: "spin 1s linear infinite" } : undefined} />
          </button>
        )}
        {onRemove && (
          <button onClick={onRemove} aria-label={`Retirer ${title}`} title="Retirer" style={{ color: "var(--ink-3)", display: "grid", placeItems: "center", width: 22, height: 22 }}>
            <X size={14} />
          </button>
        )}
      </header>
      {children}
    </section>
  );
}

const Muted = ({ children }: { children: ReactNode }) => <p style={{ margin: 0, color: "var(--ink-3)", fontSize: 13 }}>{children}</p>;
const Demo = ({ show }: { show?: boolean }) => (show ? <span className="mono" style={{ fontSize: 9.5, color: "rgb(var(--warn))", border: "1px solid rgb(var(--warn) / 0.4)", padding: "1px 5px", borderRadius: 4 }}>EXEMPLE</span> : null);

function Rows({ items }: { items: { k: string; main: ReactNode; sub?: ReactNode; mark?: ReactNode; href?: string }[] }) {
  return (
    <div style={{ display: "grid", gap: 2 }}>
      {items.map((i) => {
        const body = (
          <>
            <span style={{ width: 3, alignSelf: "stretch", background: "rgb(var(--a) / 0.5)", borderRadius: 2, flexShrink: 0 }} />
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 13 }}>{i.main}</span>
              {i.sub && <span style={{ display: "block", fontSize: 11.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.sub}</span>}
            </span>
            {i.mark}
          </>
        );
        const style = { display: "flex", gap: 9, padding: "6px 6px", borderRadius: 5, alignItems: "center" } as const;
        return i.href ? (
          <a key={i.k} href={i.href} target="_blank" rel="noreferrer" style={style} className="hov">
            {body}
          </a>
        ) : (
          <div key={i.k} style={style}>
            {body}
          </div>
        );
      })}
    </div>
  );
}

function Gauge({ icon, label, value, text }: { icon: ReactNode; label: string; value: number; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <Ring value={value} size={64} stroke={4} color={value > 0.85 ? "rgb(var(--bad))" : value > 0.65 ? "rgb(var(--warn))" : "rgb(var(--a))"}>
        {text}
      </Ring>
      <span className="label" style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
        {icon}
        {label}
      </span>
    </div>
  );
}

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = now.getSeconds();
  const m = now.getMinutes() + s / 60;
  const h = (now.getHours() % 12) + m / 60;
  const hand = (deg: number, len: number, w: number, col: string) => <line x1="50" y1="50" x2={50 + Math.sin((deg * Math.PI) / 180) * len} y2={50 - Math.cos((deg * Math.PI) / 180) * len} stroke={col} strokeWidth={w} strokeLinecap="round" />;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <svg viewBox="0 0 100 100" width={96} height={96} aria-hidden>
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(var(--a) / 0.25)" />
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1="50" y1={i % 5 ? 7 : 5} x2="50" y2={i % 5 ? 9 : 12} stroke={`rgb(var(--a) / ${i % 5 ? 0.3 : 0.8})`} strokeWidth={i % 5 ? 0.6 : 1.4} transform={`rotate(${i * 6} 50 50)`} />
        ))}
        {hand(h * 30, 24, 3, "var(--ink)")}
        {hand(m * 6, 34, 2, "var(--ink)")}
        {hand(s * 6, 38, 1, "rgb(var(--b))")}
        <circle cx="50" cy="50" r="2.5" fill="rgb(var(--a))" />
      </svg>
      <div>
        <div className="mono glow-text" style={{ fontSize: 26, fontWeight: 600 }}>{now.toLocaleTimeString("fr-FR")}</div>
        <div style={{ color: "var(--ink-2)", textTransform: "capitalize" }}>{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>
    </div>
  );
}

export function WidgetBody({ w, s, sys }: { w: Widget; s: State; sys: SystemStats | null }) {
  const t = s.hq.today;
  const noHq = <Muted>{s.hq.error || "Keeply HQ non connecté : ajoute l'adresse et le jeton dans les réglages."}</Muted>;
  switch (w.kind) {
    case "keeply.kpis": {
      if (!t) return noHq;
      const ratio = t.goal.target ? t.goal.revenue / t.goal.target : 0;
      return (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Ring value={ratio} size={78} stroke={6} color="rgb(var(--b))">
              {Math.round(ratio * 100)}%
            </Ring>
            <div style={{ minWidth: 0 }}>
              <div className="label" style={{ fontSize: 10 }}>Ce mois</div>
              <div className="hud-font glow-text" style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>
                <Count value={t.goal.revenue} format={(n) => eur(n)} />
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 3 }}>
                objectif {eur(t.goal.target)}, projection {eur(t.goal.projection)}
              </div>
            </div>
          </div>
          {t.sales && t.sales.series.length > 1 && (
            <div style={{ marginTop: 10 }}>
              <Spark values={t.sales.series.map((p) => p.total)} />
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
            {[
              ["Hier", eur(t.sales?.yesterday)],
              ["MRR", eur(t.sales?.mrr)],
              ["Téléch.", String(t.sales?.downloads ?? "-")],
            ].map(([k, v]) => (
              <div key={k} style={{ borderLeft: "2px solid rgb(var(--a) / 0.5)", paddingLeft: 8 }}>
                <div className="label" style={{ fontSize: 9.5 }}>{k}</div>
                <div className="mono" style={{ fontSize: 15, fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "keeply.tasks":
      if (!t) return noHq;
      return t.tasks.length ? (
        <Rows
          items={t.tasks.slice(0, 6).map((x) => ({
            k: x.id,
            main: x.title,
            mark: x.priority === "haute" ? <span className="mono" style={{ fontSize: 9.5, color: "rgb(var(--bad))", border: "1px solid rgb(var(--bad) / 0.45)", padding: "1px 5px", borderRadius: 4, flexShrink: 0 }}>PRIO</span> : undefined,
          }))}
        />
      ) : (
        <Muted>Aucune tâche ouverte.</Muted>
      );
    case "keeply.mails":
      if (!t) return noHq;
      if (!t.mails) return <Muted>Boîte mail non branchée dans HQ.</Muted>;
      return t.mails.urgent.length ? <Rows items={t.mails.urgent.map((m) => ({ k: m.id, main: m.subject, sub: `${m.from.name || m.from.email}, ${ago(m.date)}` }))} /> : <Muted>Aucun mail urgent. {t.mails.unread} non lu(s).</Muted>;
    case "keeply.health": {
      if (!t) return noHq;
      const h = t.health;
      if (!h) return <Muted>Pas encore de test de l&apos;app.</Muted>;
      return (
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <Ring value={h.score / 100} size={66} stroke={5} color={h.score >= 80 ? "rgb(var(--ok))" : h.score >= 50 ? "rgb(var(--warn))" : "rgb(var(--bad))"}>
            {h.score}
          </Ring>
          <div style={{ minWidth: 0, display: "grid", gap: 4, fontSize: 12.5 }}>
            {h.problems.length ? (
              h.problems.slice(0, 3).map((p) => (
                <span key={p.checkId} style={{ display: "flex", gap: 6, color: p.severity === "panne" ? "rgb(var(--bad))" : "rgb(var(--warn))" }}>
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                </span>
              ))
            ) : (
              <span style={{ color: "rgb(var(--ok))" }}>Tous les systèmes sont nominaux.</span>
            )}
            <span style={{ color: "var(--ink-3)" }}>Test {ago(h.at)}</span>
          </div>
        </div>
      );
    }
    case "keeply.social": {
      if (!t) return noHq;
      const ig = t.instagram;
      const ads = s.hq.ads;
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ borderLeft: "2px solid rgb(var(--a) / 0.5)", paddingLeft: 8 }}>
            <div className="label" style={{ fontSize: 9.5 }}>Instagram</div>
            <div className="hud-font" style={{ fontSize: 24, fontWeight: 700 }}>{ig ? <Count value={ig.followers} /> : "-"}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{ig ? `${ig.gained7 >= 0 ? "+" : ""}${ig.gained7} en 7 j` : "non branché"}</div>
          </div>
          <div style={{ borderLeft: "2px solid rgb(var(--b) / 0.6)", paddingLeft: 8 }}>
            <div className="label" style={{ fontSize: 9.5, color: "rgb(var(--b) / 0.8)" }}>Meta Ads 7 j</div>
            <div className="hud-font" style={{ fontSize: 24, fontWeight: 700 }}>{ads ? eur(ads.spend) : "-"}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{ads ? `${ads.results} résultats` : "pas de données"}</div>
          </div>
        </div>
      );
    }
    case "weather": {
      const wx = s.weather;
      if (!wx || wx.error) return <Muted>{/introuvable/.test(wx?.error ?? "") ? "Ville introuvable : change-la dans les réglages." : "Météo injoignable pour l'instant (connexion Internet ?)."}</Muted>;
      const maxT = Math.max(...wx.hours.map((h) => h.temp));
      const minT = Math.min(...wx.hours.map((h) => h.temp));
      return (
        <div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div>
              <div className="hud-font glow-text" style={{ fontSize: 44, fontWeight: 700, lineHeight: 0.9 }}>{wx.temp}°</div>
              <div style={{ color: "var(--ink-2)", fontSize: 13, marginTop: 4 }}>
                {wx.city}, {wx.label}
              </div>
            </div>
            <div className="mono" style={{ textAlign: "right", fontSize: 11.5, color: "var(--ink-3)" }}>
              <div>ressenti {wx.feels}°</div>
              <div>vent {wx.wind} km/h</div>
              <div>humidité {wx.humidity} %</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 46, marginTop: 10 }}>
            {wx.hours.map((h) => (
              <div key={h.h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }} title={`${h.h} h : ${h.temp}°, pluie ${h.rain} %`}>
                <div style={{ width: "100%", height: 6 + ((h.temp - minT) / (maxT - minT || 1)) * 24, background: h.rain > 50 ? "rgb(var(--b) / 0.7)" : "rgb(var(--a) / 0.55)", borderRadius: 2 }} />
                <span className="mono" style={{ fontSize: 8.5, color: "var(--ink-3)" }}>{h.h}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 8 }}>
            {wx.days.map((d, i) => (
              <div key={d.date} style={{ fontSize: 11.5, color: "var(--ink-2)" }}>
                <div className="label" style={{ fontSize: 9.5 }}>{i === 0 ? "Auj." : new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short" })}</div>
                <span className="mono">
                  {d.min}° / {d.max}°
                </span>
                <div style={{ color: "var(--ink-3)", fontSize: 10.5 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "news":
      return s.news.length ? <Rows items={s.news.slice(0, 7).map((n) => ({ k: n.link, main: n.title, sub: `${n.source}, ${ago(n.date)}`, href: n.link }))} /> : <Muted>Actualités indisponibles pour l&apos;instant.</Muted>;
    case "system": {
      const x = sys ?? s.system;
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <Gauge icon={<Cpu size={11} />} label="CPU" value={x.cpu / 100} text={`${x.cpu}%`} />
            <Gauge icon={<MemoryStick size={11} />} label="RAM" value={x.memUsed / 100} text={`${x.memUsed}%`} />
            {x.battery && <Gauge icon={x.battery.charging ? <BatteryCharging size={11} /> : <BatteryMedium size={11} />} label="Batt." value={x.battery.level / 100} text={`${x.battery.level}%`} />}
          </div>
          <div className="mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--ink-3)" }}>
            <span>{x.host}</span>
            <span>{x.memTotalGb} Go</span>
            <span>Jarvis {x.jarvisMb} Mo</span>
          </div>
        </div>
      );
    }
    case "clock":
      return <Clock />;
    case "custom":
      return w.view ? <ViewRenderer view={w.view} compact /> : <Muted>En attente de données…</Muted>;
    default:
      return <Muted>Widget inconnu.</Muted>;
  }
}

export { Demo, ago };
