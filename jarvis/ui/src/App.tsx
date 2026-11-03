import { Ear as EarIcon, History, Maximize2, Mic, MicOff, Pin, Send, Settings2, Square, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ask as askApi, post } from "./api";
import { Reactor, type Mode } from "./Reactor";
import { Settings } from "./Settings";
import type { Ev, Layout, State, SystemStats, View } from "./types";
import { Ear, Mouth, afterWake, earSupported } from "./voice";
import { ViewRenderer } from "./ViewRenderer";
import { Frame, WidgetBody, ago } from "./Widgets";

interface Turn {
  id: number;
  q: string;
  a: string;
  via?: string;
  at: Date;
  done?: string[];
  error?: boolean;
}

const SUGGESTIONS = ["Briefing", "Les matchs de Ligue des champions ce soir", "Mes tâches", "Actus tech du jour", "Mets le thème rouge", "Ajoute un widget avec le cours du Bitcoin"];

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden style={{ filter: "drop-shadow(0 0 8px rgb(var(--a) / .7))" }}>
      <circle cx="32" cy="32" r="28" fill="none" stroke="rgb(var(--a))" strokeWidth="2.5" strokeDasharray="120 18" />
      <circle cx="32" cy="32" r="18" fill="none" stroke="rgb(var(--a) / .6)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="9" fill="rgb(var(--a))" />
    </svg>
  );
}

function TopClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ textAlign: "center", lineHeight: 1 }}>
      <div className="mono glow-text" style={{ fontSize: 26, fontWeight: 600, letterSpacing: ".06em" }}>
        {now.toLocaleTimeString("fr-FR")}
      </div>
      <div className="label" style={{ marginTop: 5, fontSize: 10.5 }}>
        {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>
    </div>
  );
}

function Boot({ s, error, onStart }: { s: State | null; error: string; onStart: () => void }) {
  const lines = [
    ["NOYAU", "EN LIGNE", true],
    ["KEEPLY HQ", s ? (s.hq.ok ? "CONNECTÉ" : "NON CONNECTÉ") : "…", !!s?.hq.ok],
    ["CLAUDE CODE", s ? (s.claude ? s.claude.split(" ")[0] : "INTROUVABLE") : "…", !!s?.claude],
    ["MÉTÉO", s ? (s.weather && !s.weather.error ? `${s.weather.city.toUpperCase()} ${s.weather.temp}°` : "HORS LIGNE") : "…", !!s && !s.weather?.error],
    ["RECONNAISSANCE VOCALE", earSupported() ? "PRÊTE" : "INDISPONIBLE (CHROME OU SAFARI)", earSupported()],
  ] as const;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "grid", placeItems: "center", background: "radial-gradient(50vw 50vh at 50% 45%, rgb(var(--a) / .12), transparent 70%), var(--bg)" }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 22, width: "min(520px, 92vw)" }}>
        <Reactor mode="thinking" level={() => 0.15} theme={s?.layout.theme ?? "arc"} size={220} label="Jarvis" />
        <div className="hud-font glow-text flicker" style={{ fontSize: 34, fontWeight: 700, letterSpacing: ".4em", paddingLeft: ".4em" }}>
          {(s?.config.name ?? "Jarvis").toUpperCase()}
        </div>
        <div className="mono" style={{ width: "100%", display: "grid", gap: 6, fontSize: 12.5 }}>
          {error ? (
            <div style={{ color: "rgb(var(--bad))", textAlign: "center" }}>{error}</div>
          ) : (
            lines.map(([k, v, ok], i) => (
              <div key={k} className="rise" style={{ display: "flex", justifyContent: "space-between", gap: 12, animationDelay: `${150 + i * 180}ms`, borderBottom: "1px dashed rgb(var(--a) / .15)", paddingBottom: 4 }}>
                <span style={{ color: "var(--ink-2)" }}>{k}</span>
                <span style={{ color: ok ? "rgb(var(--ok))" : "rgb(var(--warn))" }}>{v}</span>
              </div>
            ))
          )}
        </div>
        <button className="btn solid rise" style={{ height: 46, padding: "0 28px", fontSize: 16, animationDelay: "1.1s" }} onClick={onStart} disabled={!s} autoFocus>
          Activer
        </button>
        <span style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>Espace pour parler, Échap pour couper. Dis « {s?.config.name ?? "Jarvis"} » en mode mains libres.</span>
      </div>
    </div>
  );
}

export function App() {
  const [st, setSt] = useState<State | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [sys, setSys] = useState<SystemStats | null>(null);
  const [booted, setBooted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [interim, setInterim] = useState("");
  const [lastQ, setLastQ] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<{ view: View; q: string } | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [handsFree, setHandsFree] = useState(false);
  const [muted, setMuted] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const mouth = useMemo(() => new Mouth(), []);
  const ear = useMemo(() => new Ear(), []);
  const abortRef = useRef<AbortController | null>(null);
  const handsFreeRef = useRef(false);
  const awaiting = useRef(0);
  const stRef = useRef<State | null>(null);
  const prevAlert = useRef<{ mails: number; problems: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const turnId = useRef(0);
  useEffect(() => {
    stRef.current = st;
    handsFreeRef.current = handsFree;
  });

  const theme = st?.layout.theme ?? "arc";
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  /* ---------- Données ---------- */
  const load = useCallback(async (force = false) => {
    try {
      const r = await fetch(`/api/state${force ? "?force=1" : ""}`);
      if (!r.ok) throw new Error();
      const s = (await r.json()) as State;
      setSt(s);
      setLoadErr("");
      return s;
    } catch {
      setLoadErr("Le serveur Jarvis ne répond pas. Relance l'app Jarvis sur ton Mac.");
      return null;
    }
  }, []);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const t = setInterval(() => !document.hidden && void load(), 60_000);
    const t2 = setInterval(() => {
      if (document.hidden) return;
      fetch("/api/system")
        .then((r) => r.json())
        .then(setSys)
        .catch(() => undefined);
    }, 4000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
      clearInterval(t2);
    };
  }, [load]);

  /* ---------- Demande ---------- */
  const handle = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      mouth.stop();
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setInterim("");
      setLastQ(text);
      setCaption("");
      setStatus("");
      setThinking(true);
      let spoken = "";
      const id = ++turnId.current;
      setTurns((t) => [...t, { id, q: text, a: "", at: new Date() }]);
      const onEvent = (e: Ev) => {
        if (e.type === "status") setStatus(e.text);
        else if (e.type === "sentence") {
          spoken += (spoken ? " " : "") + e.text;
          setCaption(spoken);
          setStatus("");
          mouth.say(e.text);
        } else if (e.type === "view") setView({ view: e.view, q: text });
        else if (e.type === "layout") setSt((s) => (s ? { ...s, layout: e.layout as Layout } : s));
        else if (e.type === "stop") mouth.stop();
        else if (e.type === "error") {
          setCaption(e.text);
          setTurns((t) => t.map((x) => (x.id === id ? { ...x, a: e.text, error: true } : x)));
          mouth.say(/introuvable|pas installé/i.test(e.text) ? "Je ne trouve pas Claude Code sur ce Mac." : "Désolé, je n'ai pas pu répondre à ça.");
        } else if (e.type === "done") {
          if (e.say && !spoken) {
            setCaption(e.say);
            mouth.say(e.say);
          }
          const done = e.done.filter((d): d is string => typeof d === "string");
          for (const d of e.done) if (typeof d !== "string" && d.open) window.open(d.open, "_blank", "noopener");
          setTurns((t) => t.map((x) => (x.id === id ? { ...x, a: e.say || spoken, via: e.via, done } : x)));
          if (e.focus) {
            setFocus(e.focus);
            setTimeout(() => setFocus(null), 5000);
          }
          if (done.length) void load(true);
        }
      };
      try {
        await askApi(text, onEvent, ac.signal);
      } catch (e) {
        if (!ac.signal.aborted) {
          setCaption((e as Error).message);
          mouth.say("Je n'arrive pas à joindre mon serveur.");
        }
      } finally {
        if (abortRef.current === ac) {
          setThinking(false);
          setStatus("");
        }
      }
    },
    [load, mouth],
  );
  const handleRef = useRef(handle);
  useEffect(() => {
    handleRef.current = handle;
  });

  /* ---------- Voix ---------- */
  useEffect(() => {
    mouth.bind(setSpeaking);
    ear.bind({
      onState: setListening,
      onInterim: setInterim,
      onError: (m) => setCaption(m),
      onFinal: (t) => {
        if (!t) return;
        if (!handsFreeRef.current) return void handleRef.current(t);
        if (Date.now() < awaiting.current) {
          awaiting.current = 0;
          return void handleRef.current(t);
        }
        const after = afterWake(t, stRef.current?.config.name ?? "Jarvis");
        if (after === null) return;
        if (!after) {
          awaiting.current = Date.now() + 8000;
          mouth.say("Oui ?");
          return;
        }
        void handleRef.current(after);
      },
    });
    return () => {
      mouth.stop();
      ear.stop();
    };
  }, [ear, mouth]);

  // Mains libres : on coupe l'écoute pendant qu'il parle (il ne s'entend pas lui-même), puis on reprend.
  useEffect(() => {
    if (!handsFree) return;
    if (speaking) ear.stop();
    else if (!ear.listening) {
      const t = setTimeout(() => handsFreeRef.current && !mouth.speaking && ear.start(true), 250);
      return () => clearTimeout(t);
    }
  }, [speaking, handsFree, ear, mouth]);

  const talk = useCallback(() => {
    mouth.unlock();
    if (mouth.speaking) mouth.stop();
    if (handsFreeRef.current) return;
    if (ear.listening) ear.stop();
    else ear.start(false);
  }, [ear, mouth]);

  const toggleHandsFree = () => {
    mouth.unlock();
    const next = !handsFreeRef.current;
    setHandsFree(next);
    handsFreeRef.current = next;
    if (next) {
      ear.start(true);
      setCaption(`Mains libres : dis « ${st?.config.name ?? "Jarvis"} » puis ta demande.`);
    } else ear.stop();
  };

  const stopAll = useCallback(() => {
    mouth.stop();
    abortRef.current?.abort();
    void post("/api/cancel").catch(() => undefined);
    setThinking(false);
    setStatus("");
  }, [mouth]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = !!(e.target as HTMLElement)?.closest?.("input, textarea, select");
      if (e.key === "Escape") {
        stopAll();
        setShowHistory(false);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || !booted || showSettings) return;
      if (e.code === "Space") {
        e.preventDefault();
        talk();
      } else if (e.key === "/") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booted, showSettings, stopAll, talk]);

  // Alertes vocales
  useEffect(() => {
    const t = st?.hq.today;
    if (!t || !booted) return;
    const cur = { mails: t.mails?.urgentCount ?? 0, problems: t.health?.problems.length ?? 0 };
    const prev = prevAlert.current;
    prevAlert.current = cur;
    if (!prev || !st.config.alerts || mouth.speaking || thinking) return;
    if (cur.mails > prev.mails && t.mails?.urgent[0]) {
      setFocus("keeply.mails");
      mouth.say(`Nouveau mail urgent de ${t.mails.urgent[0].from.name || t.mails.urgent[0].from.email}.`);
    } else if (cur.problems > prev.problems && t.health?.problems[0]) {
      setFocus("keeply.health");
      mouth.say(`Alerte : ${t.health.problems[0].name}.`);
    }
  }, [st, booted, mouth, thinking]);

  const start = () => {
    mouth.unlock();
    setBooted(true);
    void handle("briefing");
  };

  const mode: Mode = speaking ? "speaking" : thinking ? "thinking" : listening ? "listening" : "idle";
  const level = useCallback(() => (mouth.speaking ? mouth.level() : ear.listening ? ear.level() : 0), [ear, mouth]);
  const modeLabel = { idle: handsFree ? "EN ÉCOUTE DU MOT DE RÉVEIL" : "EN VEILLE", listening: "J'ÉCOUTE", thinking: status ? status.toUpperCase() : "ANALYSE", speaking: "RÉPONSE" }[mode];

  if (!st || !booted) return <Boot s={st} error={loadErr} onStart={start} />;

  const left = st.layout.widgets.filter((w) => w.side === "left");
  const right = st.layout.widgets.filter((w) => w.side !== "left");
  const renderWidget = (w: (typeof left)[number]) => (
    <Frame
      key={w.id}
      title={w.title}
      code={`W-${String(st.layout.widgets.indexOf(w) + 1).padStart(2, "0")}`}
      highlight={focus === w.kind}
      onRemove={() => post<Layout>("/api/ui", { remove: w.id }).then((l) => setSt((s) => (s ? { ...s, layout: l } : s)))}
      onRefresh={
        w.kind === "custom"
          ? async () => {
              setRefreshing(w.id);
              try {
                const l = await post<Layout>(`/api/widget/${encodeURIComponent(w.id)}`);
                setSt((s) => (s ? { ...s, layout: l } : s));
              } catch (e) {
                setCaption((e as Error).message);
              } finally {
                setRefreshing(null);
              }
            }
          : w.kind.startsWith("keeply") || w.kind === "news" || w.kind === "weather"
            ? () => void load(true)
            : undefined
      }
      refreshing={refreshing === w.id}
      tag={w.kind === "custom" && w.updatedAt ? <span className="mono" style={{ fontSize: 9.5, color: "var(--ink-3)" }}>{ago(w.updatedAt)}</span> : w.kind.startsWith("keeply") && st.hq.today?.sales?.demo && w.kind === "keeply.kpis" ? <span className="mono" style={{ fontSize: 9.5, color: "rgb(var(--warn))" }}>EXEMPLE</span> : undefined}
    >
      <WidgetBody w={w} s={st} sys={sys} />
    </Frame>
  );

  const hqOk = st.hq.ok && !st.hq.stale;
  const x = sys ?? st.system;

  return (
    <div className="stage">
      {/* Barre du haut */}
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <Logo />
          <div>
            <div className="hud-font glow-text" style={{ fontSize: 20, fontWeight: 700, letterSpacing: ".32em" }}>{st.config.name.toUpperCase()}</div>
            <div className={`label ${mode === "thinking" ? "pulse" : ""}`} style={{ fontSize: 10.5, color: mode === "idle" ? "var(--ink-3)" : "rgb(var(--b))" }}>
              {modeLabel}
            </div>
          </div>
        </div>
        <div className="top-clock">
          <TopClock />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="chip" title={st.hq.error || "Keeply HQ connecté"}>
            <span className={`dot ${hqOk ? "" : st.hq.ok ? "warn" : "bad"}`} /> HQ
          </span>
          <span className="chip" title={st.claude || "Claude Code introuvable"}>
            <span className={`dot ${st.claude ? "" : "bad"}`} /> CLAUDE
          </span>
          {st.weather && !st.weather.error && (
            <span className="chip mono hide-narrow" style={{ fontFamily: "JetBrains Mono Variable" }}>
              {st.weather.temp}° {st.weather.city}
            </span>
          )}
          <span className="chip mono hide-narrow" style={{ fontFamily: "JetBrains Mono Variable" }} title={`${x.host} : processeur et mémoire`}>
            CPU {x.cpu}% · RAM {x.memUsed}%
          </span>
          <button className="chip" onClick={() => setShowHistory((v) => !v)} aria-label="Historique" title="Historique">
            <History size={15} />
          </button>
          <button className="chip hide-narrow" onClick={() => document.documentElement.requestFullscreen?.().catch(() => undefined)} aria-label="Plein écran" title="Plein écran">
            <Maximize2 size={15} />
          </button>
          <button className="chip" onClick={() => setShowSettings(true)} aria-label="Réglages" title="Réglages">
            <Settings2 size={15} />
          </button>
        </div>
      </header>

      {/* Colonnes */}
      <main className="cols">
        <aside className="side" aria-label="Widgets de gauche">
          {left.map(renderWidget)}
        </aside>

        <section className="center" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minHeight: 0, overflowY: "auto", padding: "4px 4px 8px" }} aria-label={st.config.name}>
          <div style={{ marginTop: view ? 0 : "auto" }} />
          <Reactor mode={mode} level={level} theme={theme} size={view ? 210 : 380} onClick={talk} label={listening ? "Arrêter d'écouter" : "Parler"} />
          <div style={{ width: "min(760px, 100%)", textAlign: "center", display: "grid", gap: 8 }} aria-live="polite">
            {(interim || lastQ) && (
              <div style={{ color: interim ? "var(--ink)" : "var(--ink-3)", fontSize: interim ? 20 : 14, fontFamily: interim ? "Rajdhani" : undefined, fontWeight: interim ? 600 : 400 }}>
                {interim ? interim : `« ${lastQ} »`}
              </div>
            )}
            {thinking && !caption ? (
              <div className="mono caret" style={{ color: "rgb(var(--a))", fontSize: 13, letterSpacing: ".1em" }}>
                {(status || "Analyse").toUpperCase()}
              </div>
            ) : caption ? (
              <div className="rise" style={{ fontSize: 18, lineHeight: 1.5, color: "var(--ink)" }}>
                {caption}
              </div>
            ) : (
              <div style={{ color: "var(--ink-3)", fontSize: 13 }}>{earSupported() ? "Touche le réacteur ou appuie sur Espace pour parler." : "Écris ta demande : la voix nécessite Chrome ou Safari."}</div>
            )}
          </div>
          {view && (
            <div className="panel corners rise" style={{ width: "min(860px, 100%)", padding: "16px 18px 18px" }}>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginBottom: -6 }}>
                <button
                  className="btn ghost"
                  style={{ height: 30 }}
                  onClick={() => post<Layout>("/api/ui", { add: { title: view.view.title || view.q, prompt: view.q, view: view.view } }).then((l) => setSt((s) => (s ? { ...s, layout: l } : s)))}
                  title="Garder ce contenu en widget, mis à jour automatiquement"
                >
                  <Pin size={14} /> Épingler
                </button>
                <button className="btn ghost" style={{ height: 30 }} onClick={() => setView(null)} aria-label="Fermer">
                  <X size={15} />
                </button>
              </div>
              <ViewRenderer view={view.view} />
            </div>
          )}
          <div style={{ marginBottom: view ? 0 : "auto" }} />
        </section>

        <aside className="side" aria-label="Widgets de droite">
          {right.map(renderWidget)}
        </aside>
      </main>

      {/* Barre de commande */}
      <footer style={{ padding: "4px 22px 16px" }}>
        <div style={{ width: "min(860px, 100%)", margin: "0 auto", display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
            {SUGGESTIONS.map((sg) => (
              <button
                key={sg}
                className="chip"
                onClick={() => {
                  mouth.unlock();
                  void handle(sg);
                }}
              >
                {sg}
              </button>
            ))}
          </div>
          <form
            className="panel corners"
            style={{ display: "flex", alignItems: "center", gap: 8, padding: 8 }}
            onSubmit={(e) => {
              e.preventDefault();
              mouth.unlock();
              const t = input;
              setInput("");
              void handle(t);
            }}
          >
            <button type="button" onClick={talk} disabled={handsFree} className="btn solid" style={{ width: 46, height: 46, padding: 0, borderRadius: 99, ...(listening && !handsFree ? { background: "rgb(var(--b))", boxShadow: "0 0 24px rgb(var(--b) / .6)" } : {}) }} aria-label={listening ? "Arrêter d'écouter" : "Parler"} title="Parler (Espace)">
              {listening && !handsFree ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Demande à ${st.config.name}… (matchs, actus, chiffres, n'importe quoi)`} aria-label="Écrire une demande" style={{ flex: 1, minWidth: 0, height: 44, background: "transparent", border: 0, outline: "none", fontSize: 15.5, padding: "0 6px" }} />
            {(speaking || thinking) && (
              <button type="button" className="btn ghost" onClick={stopAll} aria-label="Couper" title="Couper (Échap)">
                <Square size={15} />
              </button>
            )}
            <button type="submit" className="btn ghost" disabled={!input.trim()} aria-label="Envoyer">
              <Send size={16} />
            </button>
            <span style={{ width: 1, height: 26, background: "rgb(var(--a) / .2)" }} />
            <button type="button" className="btn ghost" onClick={toggleHandsFree} aria-pressed={handsFree} title={`Mains libres : dis « ${st.config.name} »`} style={handsFree ? { color: "rgb(var(--ok))", background: "rgb(var(--ok) / .1)" } : undefined}>
              <EarIcon size={16} /> <span style={{ fontSize: 12.5 }}>Mains libres</span>
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                const m = !muted;
                setMuted(m);
                mouth.muted = m;
                if (m) mouth.stop();
              }}
              aria-label={muted ? "Réactiver la voix" : "Couper la voix"}
              title={muted ? "Réactiver la voix" : "Couper la voix"}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </form>
        </div>
      </footer>

      {showHistory && (
        <div className="panel rise" style={{ position: "fixed", top: 70, right: 22, width: "min(420px, 92vw)", maxHeight: "70vh", overflowY: "auto", zIndex: 55, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="label">Historique</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn ghost" style={{ height: 28, fontSize: 11 }} onClick={() => post("/api/session", undefined, "DELETE").then(() => setTurns([]))}>
                Nouvelle conversation
              </button>
              <button className="btn ghost" style={{ height: 28 }} onClick={() => setShowHistory(false)} aria-label="Fermer">
                <X size={14} />
              </button>
            </div>
          </div>
          {turns.length === 0 && <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Rien pour l&apos;instant.</div>}
          <div style={{ display: "grid", gap: 12 }}>
            {[...turns].reverse().map((t) => (
              <div key={t.id} style={{ fontSize: 13 }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                  {t.at.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} {t.via === "claude" ? "· CLAUDE" : t.via === "instant" ? "· INSTANTANÉ" : ""}
                </div>
                <div style={{ color: "var(--ink-2)" }}>« {t.q} »</div>
                <div style={{ color: t.error ? "rgb(var(--bad))" : "var(--ink)" }}>{t.a || "…"}</div>
                {t.done?.map((d) => (
                  <div key={d} style={{ color: "rgb(var(--ok))", fontSize: 12 }}>
                    {d}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <Settings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        s={st}
        onSaved={() => void load()}
        onTestVoice={() => {
          mouth.unlock();
          mouth.stop();
          mouth.say(`Bonjour${st.config.owner ? " " + st.config.owner : ""}. Je suis ${st.config.name}, tous les systèmes sont opérationnels.`);
        }}
      />
    </div>
  );
}
