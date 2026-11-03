import { Activity, CalendarClock, ChevronRight, Mic, MicOff, Settings2, Sparkles, Target, Terminal, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ask, post } from "./api";
import { Brain, type BrainHandle, type BrainNode, type Mode } from "./Brain";
import { Settings } from "./Settings";
import type { Credits, Ev, State } from "./types";
import { Ring } from "./ViewRenderer";
import { RichView, TimerFace, type AgentLog, type Rich } from "./Views";
import { Ear, Mouth, afterWake } from "./voice";

/* ============================================================
   Jarvis v2 : un cerveau d'étoiles au centre, l'actu de Keeply HQ
   autour, le compteur Claude en direct. Chaque demande fait plonger
   la caméra vers une étoile, qui s'ouvre sur l'info demandée ;
   « retour » ou Échap referme l'étoile.
   ============================================================ */

const mouth = new Mouth();
const ear = new Ear();
const ACCENT: Record<string, string> = { arc: "94 231 255", keeply: "150 125 255", mark: "255 82 82", nebula: "205 130 255", mono: "235 238 242" };
const SUGGEST = ["Briefing", "Mes chiffres", "Résume mes mails", "Lis-moi le plan Instagram", "Mon agenda", "Les matchs ce soir", "Météo", "Les actus", "Regarde mon écran"];

export default function App() {
  const [s, setS] = useState<State | null>(null);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [heard, setHeard] = useState("");
  const [said, setSaid] = useState("");
  const [status, setStatus] = useState("");
  const [view, setView] = useState<Rich | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [agent, setAgent] = useState<AgentLog | null>(null);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const [started, setStarted] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const [muted, setMuted] = useState(false);
  const [settings, setSettings] = useState(false);
  const [timers, setTimers] = useState<{ id: number; title: string; endsAt: number; total: number }[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const brain = useRef<BrainHandle>(null);
  const abort = useRef<AbortController | null>(null);
  const viewTimer = useRef<number>(0);

  /* ---------- données ---------- */
  const load = useCallback(async (force = false) => {
    try {
      const r = await fetch(`/api/state${force ? "?force=1" : ""}`);
      if (r.ok) setS(await r.json());
    } catch {}
  }, []);
  useEffect(() => {
    void load();
    const a = setInterval(() => void load(), 30_000);
    const tick = async () => {
      try {
        const r = await fetch("/api/credits");
        if (r.ok) setCredits(await r.json());
      } catch {}
    };
    void tick();
    const b = setInterval(tick, 3000);
    return () => (clearInterval(a), clearInterval(b));
  }, [load]);
  useEffect(() => {
    if (s) document.documentElement.dataset.theme = s.layout.theme;
  }, [s?.layout.theme]);

  /* ---------- ouverture / fermeture d'une étoile ---------- */
  const show = useCallback((v: Rich) => {
    window.clearTimeout(viewTimer.current);
    setView(v);
    if (!open) {
      const ns = nodesRef.current;
      const pick = v.kind === "keeply" || v.kind === "tasks" ? ns.find((n) => n.kind === "task") : v.kind === "plan" ? ns.find((n) => n.kind === "plan") : v.kind === "memory" ? ns.find((n) => n.kind === "memory") : v.kind === "mail" ? ns.find((n) => n.kind === "mail") : undefined;
      const o = brain.current?.focus(v.title || v.kind || "x", pick?.id) ?? { x: innerWidth / 2, y: innerHeight / 2 };
      setOrigin(o);
      // la caméra plonge d'abord, puis l'étoile s'ouvre
      viewTimer.current = window.setTimeout(() => setOpen(true), 380);
    }
  }, [open]);
  const close = useCallback(() => {
    window.clearTimeout(viewTimer.current);
    setOpen(false);
    brain.current?.unfocus();
    viewTimer.current = window.setTimeout(() => setView(null), 420);
  }, []);

  /* ---------- une demande ---------- */
  const run = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q) return;
    mouth.unlock();
    mouth.stop();
    abort.current?.abort();
    const ac = new AbortController();
    abort.current = ac;
    setHeard(q);
    setSaid("");
    setStatus("");
    setMode("think");
    let acc = "";
    try {
      await ask(q, (e: Ev) => {
        if (ac.signal.aborted) return;
        if (e.type === "status") setStatus(e.text);
        else if (e.type === "sentence") {
          acc = (acc + " " + e.text).trim();
          setSaid(acc);
          setMode("speak");
          mouth.say(e.text);
        } else if (e.type === "view") {
          const v = e.view as Rich;
          if (v.kind === "timer") setTimers((t) => [...t, { id: Date.now(), title: v.title || "Minuteur", endsAt: v.endsAt as number, total: v.total as number }]);
          show(v);
        } else if (e.type === "home") close();
        else if (e.type === "layout") setS((x) => (x ? { ...x, layout: e.layout } : x));
        else if (e.type === "agent") {
          setAgent((a) => (e.phase === "resume" && a ? { ...a, approval: null, done: false } : { task: e.task, steps: [], approval: null, done: false }));
          show({ kind: "agent", title: "Agent", subtitle: e.task, blocks: [] });
        } else if (e.type === "step") setAgent((a) => (a ? { ...a, steps: [...a.steps, { tool: e.tool, detail: e.detail }] } : a));
        else if (e.type === "stepResult")
          setAgent((a) => {
            if (!a || !a.steps.length) return a;
            const steps = [...a.steps];
            steps[steps.length - 1] = { ...steps[steps.length - 1], ok: e.ok, out: e.text.split("\n").slice(0, 6).join("\n") };
            return { ...a, steps };
          });
        else if (e.type === "approval") {
          setAgent((a) => (a ? { ...a, approval: e.items } : { task: e.items[0]?.detail || "Mode terminal", steps: [], approval: e.items, done: false }));
          show({ kind: "agent", title: "Mode terminal", subtitle: "En attente de ton accord", blocks: [] });
        }
        else if (e.type === "error") {
          setSaid(e.text);
          mouth.say(e.text);
        } else if (e.type === "done") {
          setLastMs(e.ms ?? null);
          setStatus("");
          if (e.via === "agent") setAgent((a) => (a ? { ...a, done: !e.approval } : a));
          for (const d of e.done) {
            if (typeof d === "object" && "open" in d && d.open) window.open(d.open, "_blank");
            if (typeof d === "object" && "draft" in d) show({ kind: "draft", title: "Mail préparé", subtitle: "Ouvert dans l'app Mail : relis-le, puis envoie-le toi-même", blocks: [], draft: d.draft });
          }
          if (e.done.some((d) => typeof d === "string" && /^Tâche|^Ajouté|^Retenu/.test(d))) void load(true);
        } else if (e.type === "stop") mouth.stop();
      }, ac.signal);
    } catch (err) {
      if (!ac.signal.aborted) setSaid(err instanceof Error ? err.message : "Erreur");
    }
    await mouth.idle();
    convoUntil.current = Date.now() + 25_000;
    if (abort.current === ac) setMode(ear.listening ? "listen" : "idle");
  }, [show, close, load]);

  const approve = useCallback((ok: boolean, all?: boolean) => void run(!ok ? "non" : all ? "oui pour toute la tâche" : "oui"), [run]);

  /* ---------- voix ---------- */
  useEffect(() => {
    mouth.bind((v) => {
      ear.paused = v; // il ne s'entend pas lui-même
      // Micro coupé pendant qu'il parle ? On l'ouvre juste pour entendre « stop », puis on le referme.
      if (v && !ear.listening) {
        watchOnly.current = true;
        void ear.start(true).then(() => (ear.paused = true));
      } else if (!v && watchOnly.current) {
        watchOnly.current = false;
        if (!handsFreeRef.current) ear.stop();
      }
      setMode((m) => (v ? "speak" : m === "speak" ? (ear.listening && !watchOnly.current ? "listen" : "idle") : m));
    });
    ear.bind({
      onInterim: (t) => t && setHeard(t),
      onFinal: (t, duringSpeech) => {
        const n = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z ]/g, " ").trim();
        // Pendant qu'il parle : seul un ordre d'arrêt compte (le reste est sans doute sa propre voix).
        if (duringSpeech) {
          if (/(^| )(stop|arrete|arret|tais toi|silence|chut|ca suffit|c est bon|merci jarvis|attends)( |$)/.test(n)) {
            mouth.stop();
            abort.current?.abort();
            void post("/api/cancel");
            setMode(ear.listening ? "listen" : "idle");
            setHeard("« stop »");
            convoUntil.current = Date.now() + 25_000;
          }
          return;
        }
        if (handsFreeRef.current) {
          const rest = afterWake(t, s?.config.name || "Jarvis");
          // Conversation en cours : plus besoin de redire « Jarvis » pendant 25 s après sa dernière réponse.
          const inConvo = Date.now() < convoUntil.current;
          if (rest === null && !inConvo) return;
          const q = rest === null ? t : rest;
          convoUntil.current = Date.now() + 25_000;
          if (!q) {
            mouth.stop();
            setHeard("Oui ?");
            return;
          }
          void run(q);
        } else {
          void run(t);
        }
      },
      onState: (on) => setMode((m) => (on ? "listen" : m === "listen" ? "idle" : m)),
      onError: (msg) => setSaid(msg),
    });
  }, [run, s?.config.name]);
  const handsFreeRef = useRef(handsFree);
  const convoUntil = useRef(0);
  const watchOnly = useRef(false); // micro ouvert seulement pour entendre « stop » pendant qu'il parle
  handsFreeRef.current = handsFree;

  const listen = useCallback(() => {
    mouth.unlock();
    setStarted(true);
    if (ear.listening && !handsFreeRef.current && !watchOnly.current) return ear.stop();
    watchOnly.current = false;
    mouth.stop();
    void ear.start(handsFreeRef.current);
  }, []);
  const toggleHandsFree = () => {
    const v = !handsFree;
    setHandsFree(v);
    handsFreeRef.current = v;
    ear.stop();
    if (v) void ear.start(true);
  };

  /* ---------- clavier ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA";
      if (e.key === "Escape") {
        if (typing) return setTyping(false);
        if (settings) return setSettings(false);
        abort.current?.abort();
        void post("/api/cancel");
        mouth.stop();
        if (view) close();
        setMode(ear.listening ? "listen" : "idle");
      } else if (!inField && e.code === "Space") {
        e.preventDefault();
        listen();
      } else if (!inField && e.key === "/") {
        e.preventDefault();
        setTyping(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [typing, settings, view, close, listen]);

  // l'étoile se referme toute seule si on ne parle plus (sauf agent et minuteur)
  useEffect(() => {
    if (!open || !view || view.kind === "agent" || view.kind === "timer" || mode !== "idle") return;
    const id = window.setTimeout(close, 45_000);
    return () => window.clearTimeout(id);
  }, [open, view, mode, close]);

  const level = useCallback(() => Math.max(mouth.level(), ear.level()), []);
  // Un point du cerveau par tâche, souvenir, contenu à venir et mail urgent.
  const nodes = useMemo<BrainNode[]>(() => {
    if (!s) return [];
    const t = s.hq.today;
    return [
      ...(t?.tasks ?? []).slice(0, 8).map((x) => ({ id: "t:" + x.id, label: x.title, kind: "task" as const })),
      ...(s.memory ?? []).slice(0, 10).map((m) => ({ id: "m:" + m.id, label: m.text, kind: "memory" as const })),
      ...(s.hq.extra?.plan ?? []).slice(0, 5).map((p) => ({ id: "p:" + p.id, label: p.titre, kind: "plan" as const })),
      ...(t?.mails?.urgent ?? []).slice(0, 4).map((m) => ({ id: "e:" + m.id, label: m.subject, kind: "mail" as const })),
    ];
  }, [s]);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const accent = ACCENT[s?.layout.theme || "arc"] || ACCENT.arc;

  return (
    <div className={`app ${open ? "is-open" : ""}`}>
      <Brain ref={brain} mode={mode} level={level} accent={accent} nodes={nodes} />
      <div className="legend">
        <span><i style={{ color: "#FFC15E", background: "#FFC15E" }} />Tâches</span>
        <span><i style={{ color: "#5EE7FF", background: "#5EE7FF" }} />Mémoire</span>
        <span><i style={{ color: "#FF7AC8", background: "#FF7AC8" }} />Lancement</span>
        <span><i style={{ color: "#6CF0A8", background: "#6CF0A8" }} />Mails</span>
      </div>
      <div className="vignette" />

      {/* ---------- en-tête ---------- */}
      <header className="top">
        <div className="brand">
          <span className={`dot ${s?.claude && s.claudeLogin !== false ? "on" : ""}`} />
          <b>{(s?.config.name || "Jarvis").toUpperCase()}</b>
          <span className="muted">{s?.hq.ok ? "HQ connecté" : "HQ hors ligne"} · {!s?.claude ? "Claude absent" : s.claudeLogin === false ? "Claude non connecté (Terminal : claude puis /login)" : "Claude prêt"}</span>
        </div>
        <Clock weather={s?.weather} />
        <CreditMeter c={credits} />
      </header>

      {/* ---------- accueil : l'actu Keeply HQ ---------- */}
      <aside className={`side left ${open ? "hide" : ""}`}>
        <KeeplyCard s={s} onOpen={() => void run("mes chiffres")} />
        <LaunchCard s={s} onOpen={() => void run("le lancement")} />
        {timers.filter((t) => t.endsAt > Date.now() - 60_000).map((t) => (
          <div key={t.id} className="glass card timer-card">
            <TimerFace endsAt={t.endsAt} total={t.total} small />
            <span>{t.title}</span>
          </div>
        ))}
      </aside>
      <aside className={`side right ${open ? "hide" : ""}`}>
        <FeedCard s={s} />
        <TodoCard s={s} onOpen={() => void run("prospection")} />
      </aside>

      {/* ---------- l'étoile ouverte ---------- */}
      {view && s && (
        <section className={`portal ${open ? "open" : ""}`} style={{ "--ox": `${origin.x}px`, "--oy": `${origin.y}px` } as React.CSSProperties}>
          <div className="portal-head">
            <div>
              <span className="label">{view.kind === "agent" ? "Mode terminal" : view.kind ? KIND[view.kind] ?? "Jarvis" : "Jarvis"}</span>
              <h2>{view.title}</h2>
              {view.subtitle && <p className="muted">{view.subtitle}</p>}
            </div>
            <button className="icon-btn" onClick={close} aria-label="Fermer"><X size={18} /></button>
          </div>
          <div className="portal-body">
            <RichView v={view} s={s} agent={agent} onApprove={approve} />
          </div>
        </section>
      )}

      {/* ---------- la conversation ---------- */}
      <footer className="dock">
        <div className="transcript">
          {heard && <p className="heard">« {heard} »</p>}
          {status && !said && <p className="status"><span className="pulse-dot" /> {status}…</p>}
          {said && <p className="said">{said}</p>}
          {!heard && !said && (
            <p className="hint">{started ? "Je vous écoute." : "Cliquez sur le micro ou appuyez sur Espace pour parler. / pour écrire."}</p>
          )}
        </div>
        {typing ? (
          <form className="cmd glass" onSubmit={(e) => (e.preventDefault(), setTyping(false), void run(draft), setDraft(""))}>
            <Terminal size={16} />
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Demandez n'importe quoi… (« mode terminal … » pour agir sur le Mac)" onBlur={() => !draft && setTyping(false)} />
          </form>
        ) : (
          <div className="controls">
            <button className="icon-btn" onClick={toggleHandsFree} title="Mains libres : dites « Jarvis, … »" data-on={handsFree}><Sparkles size={17} /></button>
            <button className={`mic ${mode === "listen" ? "on" : ""}`} onClick={listen} aria-label="Parler">
              <MicLevel on={mode === "listen"} />
              {mode === "listen" ? <MicOff size={26} /> : <Mic size={26} />}
            </button>
            <button className="icon-btn" onClick={() => { mouth.unlock(); const m = !muted; setMuted(m); mouth.muted = m; if (m) mouth.stop(); }} title="Voix">{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          </div>
        )}
        <div className="chips">
          {SUGGEST.map((t) => <button key={t} className="chip" onClick={() => void run(t)}>{t}</button>)}
          <button className="chip ghost" onClick={() => setSettings(true)}><Settings2 size={13} /> Réglages</button>
          {lastMs !== null && <span className="latency">{lastMs < 1000 ? `${lastMs} ms` : `${(lastMs / 1000).toFixed(1)} s`}</span>}
        </div>
      </footer>

      {s && <Settings open={settings} onClose={() => setSettings(false)} s={s} onSaved={() => void load(true)} onTestVoice={() => (mouth.unlock(), mouth.say("Bonjour. Tout est prêt."))} />}
    </div>
  );
}

const KIND: Record<string, string> = { draft: "Mail", screen: "Écran", mail: "Mails", agenda: "Agenda", weather: "Météo", matches: "Football", news: "Actualités", crypto: "Marchés", fx: "Change", timer: "Minuteur", music: "Musique", keeply: "Keeply HQ", prospection: "Keeply HQ", plan: "Keeply HQ" };

/* ---------- petits composants de l'accueil ---------- */

/** Anneau autour du micro qui suit le volume de ta voix : tu vois tout de suite s'il t'entend. */
function MicLevel({ on }: { on: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const tick = () => {
      const l = ear.level();
      if (ref.current) ref.current.style.transform = `scale(${1 + l * 0.55})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return <span ref={ref} className="mic-level" style={{ opacity: on ? 1 : 0 }} />;
}

function Clock({ weather }: { weather?: State["weather"] }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clock">
      <b>{now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}<i>{String(now.getSeconds()).padStart(2, "0")}</i></b>
      <span className="muted">
        {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        {weather && !weather.error ? ` · ${weather.city} ${weather.temp}° ${weather.label}` : ""}
      </span>
    </div>
  );
}

/** Compteur qui glisse d'une valeur à l'autre (chiffres qui défilent). */
function Odometer({ value, decimals = 2, prefix = "" }: { value: number; decimals?: number; prefix?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(a + (b - a) * e);
      if (k < 1) raf = requestAnimationFrame(step);
      else from.current = b;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className="odo">{prefix}{shown.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

function CreditMeter({ c }: { c: Credits | null }) {
  const live = c?.lastActivity && Date.now() - new Date(c.lastActivity).getTime() < 90_000;
  return (
    <div className="credits glass" title="Équivalent en tarif API de ta consommation Claude (journaux de Claude Code sur ce Mac)">
      <span className="label">Claude · aujourd'hui {live && <i className="live">● en direct</i>}</span>
      <b><Odometer value={c?.today ?? 0} /> $</b>
      <span className="muted">
        <Odometer value={c?.month ?? 0} /> $ ce mois · <Odometer value={c?.lastHour ?? 0} /> $ / h
      </span>
      <span className="muted tiny">{c ? `${(c.tokensToday / 1e6).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M jetons · ${Object.entries(c.byModel).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v.toFixed(0)} $`).join(" · ")}` : "…"}</span>
    </div>
  );
}

function KeeplyCard({ s, onOpen }: { s: State | null; onOpen: () => void }) {
  const t = s?.hq.today;
  const pct = t ? t.goal.revenue / Math.max(1, t.goal.target) : 0;
  return (
    <button className="glass card keeply" onClick={onOpen}>
      <div className="card-head"><span className="label"><Target size={12} /> Keeply</span><ChevronRight size={14} /></div>
      {t ? (
        <>
          <div className="k-row">
            <Ring value={pct} size={66} stroke={5}><b className="k-small">{Math.round(pct * 100)}%</b></Ring>
            <div>
              <b className="k-num">{Math.round(t.goal.revenue).toLocaleString("fr-FR")} €</b>
              <span className="muted">ce mois · objectif {t.goal.target.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
          <div className="k-grid">
            <span><i>MRR</i>{t.sales?.mrr != null ? `${Math.round(t.sales.mrr)} €` : "—"}</span>
            <span><i>Hier</i>{Math.round(t.sales?.yesterday ?? 0)} €</span>
            <span><i>Télécharg.</i>{t.sales?.downloads ?? "—"}</span>
            <span><i>Insta</i>{t.instagram?.followers ?? "—"}</span>
          </div>
        </>
      ) : (
        <p className="muted">{s?.hq.error || "Connexion à HQ…"}</p>
      )}
    </button>
  );
}

function LaunchCard({ s, onOpen }: { s: State | null; onOpen: () => void }) {
  const x = s?.hq.extra;
  if (!x) return null;
  const days = Math.ceil((new Date(x.launchDate + "T00:00:00").getTime() - Date.now()) / 864e5);
  const soon = x.plan.filter((i) => (new Date(i.date + "T12:00:00").getTime() - Date.now()) / 864e5 <= 2);
  return (
    <button className="glass card" onClick={onOpen}>
      <div className="card-head"><span className="label"><CalendarClock size={12} /> Lancement</span><ChevronRight size={14} /></div>
      <b className="k-num">{days > 0 ? `J-${days}` : "Lancé"}</b>
      <span className="muted">{soon.length ? `${soon.length} contenu${soon.length > 1 ? "s" : ""} à préparer` : x.plan[0] ? `Prochain : ${x.plan[0].titre}` : "Rien de prévu"}</span>
      <span className="muted tiny">Liste Android : {x.android}</span>
    </button>
  );
}

function FeedCard({ s }: { s: State | null }) {
  // Le journal de HQ, complété par ce qui compte en ce moment (vraies données, rien d'inventé).
  const items = useMemo(() => {
    const x = s?.hq.extra;
    const t = s?.hq.today;
    const now = ""; // infos du moment : affichées « maintenant »
    const live: { id: string; at: string; area: string; message: string; level?: string }[] = [];
    if (x) {
      const days = Math.ceil((new Date(x.launchDate + "T00:00:00").getTime() - Date.now()) / 864e5);
      if (days > 0) live.push({ id: "l", at: now, area: "lancement", message: `Lancement Instagram dans ${days} jour${days > 1 ? "s" : ""}` });
      for (const i of x.plan.filter((i) => (new Date(i.date + "T12:00:00").getTime() - Date.now()) / 864e5 <= 2))
        live.push({ id: "p" + i.id, at: now, area: "à préparer", message: `${i.kind === "post" ? "Post" : "Stories"} : ${i.titre}`, level: "succes" });
      live.push({ id: "pr", at: now, area: "prospection", message: `${x.prospection.total} établissements, ${x.prospection.contacted} contactés${x.prospection.followUps ? `, ${x.prospection.followUps} relances dues` : ""}` });
      if (x.android) live.push({ id: "a", at: now, area: "android", message: `${x.android} commerçant${x.android > 1 ? "s" : ""} sur la liste Android` });
    }
    if (t?.mails?.urgentCount) live.push({ id: "m", at: now, area: "mails", message: `${t.mails.urgentCount} mail${t.mails.urgentCount > 1 ? "s" : ""} urgent${t.mails.urgentCount > 1 ? "s" : ""}`, level: "erreur" });
    if (t?.failedPosts) live.push({ id: "f", at: now, area: "instagram", message: `${t.failedPosts} post(s) en échec`, level: "erreur" });
    return [...live, ...(x?.activity ?? [])];
  }, [s]);
  return (
    <div className="glass card feed">
      <div className="card-head"><span className="label"><Activity size={12} /> Actu Keeply HQ</span></div>
      {items.length ? (
        <ul>
          {items.slice(0, 7).map((a) => (
            <li key={a.id} className={a.level}>
              <span className="muted tiny">{!a.at ? "maintenant" : new Date(a.at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {a.area}</span>
              <span>{a.message}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">Aucune activité récente.</p>
      )}
    </div>
  );
}

function TodoCard({ s, onOpen }: { s: State | null; onOpen: () => void }) {
  const t = s?.hq.today;
  const p = s?.hq.extra?.prospection;
  const tasks = useMemo(() => (t?.tasks ?? []).slice(0, 4), [t]);
  return (
    <button className="glass card" onClick={onOpen}>
      <div className="card-head"><span className="label">Aujourd'hui</span><ChevronRight size={14} /></div>
      {tasks.map((x) => <span key={x.id} className={`todo ${x.priority === "haute" ? "hot" : ""}`}>{x.title}</span>)}
      <div className="k-grid">
        <span><i>Mails urgents</i>{t?.mails?.urgentCount ?? 0}</span>
        <span><i>Prospects</i>{p?.total ?? "—"}</span>
        <span><i>Contactés</i>{p?.contacted ?? 0}</span>
        <span><i>Relances</i>{p?.followUps ?? 0}</span>
      </div>
    </button>
  );
}
