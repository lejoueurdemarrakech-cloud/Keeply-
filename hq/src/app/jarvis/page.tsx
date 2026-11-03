"use client";
import { ArrowLeft, Ear, Maximize2, Mic, MicOff, Send, Settings2, Sparkles, Square, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Markdown, cx } from "@/components/ui";
import { api, useApi } from "@/lib/client";
import type { Snapshot, Turn } from "@/lib/jarvis";
import { usePref } from "@/lib/prefs";
import { Card, cardsFor } from "./cards";
import { localAnswer, type Action, type CardKind } from "./intents";
import { Orb, type OrbState } from "./orb";
import { Settings, type JarvisSettings, DEFAULT_SETTINGS } from "./settings";
import { Listener, Speaker, afterWakeWord, speechSupported } from "./voice";

interface Msg {
  id: string;
  role: "user" | "jarvis";
  text: string;
  detail?: string;
  at: string;
  pending?: boolean;
  error?: boolean;
  via?: "instant" | "claude";
  done?: string[];
}

const SUGGESTIONS = ["Briefing du jour", "Mes mails urgents", "Où en sont les ventes ?", "Les actus tech", "Quel temps demain ?", "Comment améliorer mes pubs ?"];
const ACKS = ["Un instant.", "Je regarde ça.", "Je vérifie.", "Je m'en occupe."];
const DEFAULT_CARDS: CardKind[] = ["sales", "mails", "tasks", "weather"];
const mid = () => Math.random().toString(36).slice(2, 10);

function Clock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 15_000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);
  if (!now) return <span className="tnum">--:--</span>;
  return (
    <span className="tnum">
      {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      <span className="ml-2 hidden text-white/45 sm:inline">{now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span>
    </span>
  );
}

export default function JarvisPage() {
  const router = useRouter();
  const [settings, setSettings] = usePref<JarvisSettings>("jarvis-settings", DEFAULT_SETTINGS);
  const cfg = { ...DEFAULT_SETTINGS, ...settings, voice: { ...DEFAULT_SETTINGS.voice, ...settings.voice } };
  const stateUrl = `/api/jarvis/state?${new URLSearchParams({ city: cfg.city, feeds: cfg.feeds.join(",") })}`;
  const { data: snap, mutate: refresh } = useApi<Snapshot>(stateUrl, { refreshInterval: 120_000 });
  const { data: history } = useApi<Turn[]>("/api/jarvis/history");

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [interim, setInterim] = useState("");
  const [caption, setCaption] = useState("");
  const [cards, setCards] = useState<CardKind[]>(DEFAULT_CARDS);
  const [input, setInput] = useState("");
  const [handsFree, setHandsFree] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [supported, setSupported] = useState(true);

  const speaker = useMemo(() => new Speaker(), []);
  const listener = useMemo(() => new Listener(), []);
  const awaiting = useRef(0);
  const askAbort = useRef<AbortController | null>(null);
  const handsFreeRef = useRef(false);
  const cfgRef = useRef(cfg);
  const snapRef = useRef(snap);
  const prevAlerts = useRef<{ mails: number; problems: number } | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    cfgRef.current = cfg;
    snapRef.current = snap;
    handsFreeRef.current = handsFree;
  });

  // Historique enregistré : on reprend la conversation là où elle s'était arrêtée.
  const loadedHistory = useRef(false);
  useEffect(() => {
    if (!history || loadedHistory.current) return;
    loadedHistory.current = true;
    setMsgs((cur) => [...history.slice(-20).map((h) => ({ id: mid(), role: h.role, text: h.text, at: h.at })), ...cur]);
  }, [history]);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  /* ---------- Parole ---------- */

  const say = useCallback(
    async (text: string) => {
      setCaption(text);
      if (!text || cfgRef.current.muted) return;
      const resume = handsFreeRef.current;
      if (resume) listener.pause();
      await speaker.speak(text, cfgRef.current.voice);
      if (resume && handsFreeRef.current && !speaker.speaking) listener.start(true);
    },
    [listener, speaker],
  );

  /* ---------- Actions (tâche, note, mémoire, page) ---------- */

  const runActions = useCallback(
    async (actions: Action[]) => {
      const done: string[] = [];
      let nav: string | null = null;
      for (const a of actions) {
        if (a.type === "task" && a.text) {
          const task = await api<{ id: string }>("POST", "/api/tasks", { title: a.text.slice(0, 200), status: "todo", priority: "normale", tag: "Jarvis" });
          if (task) {
            done.push(`Tâche créée : ${a.text}`);
            toast.success("Tâche ajoutée", {
              description: a.text,
              action: {
                label: "Annuler",
                onClick: async () => {
                  const r = await fetch("/api/tasks").then((x) => x.json() as Promise<{ id: string }[]>);
                  await api("PUT", "/api/tasks", r.filter((t) => t.id !== task.id));
                  void refresh();
                },
              },
            });
          }
        } else if (a.type === "note" && a.text) {
          const cur = await fetch("/api/notes").then((r) => r.json() as Promise<{ text: string }>).catch(() => ({ text: "" }));
          const stamp = new Date().toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
          const ok = await api("PUT", "/api/notes", { text: `${cur.text ? cur.text.trimEnd() + "\n\n" : ""}${stamp} (Jarvis) : ${a.text}` });
          if (ok) done.push("Ajouté au bloc-notes");
        } else if (a.type === "remember" && a.text) {
          const ok = await api("POST", "/api/jarvis/memory", { text: a.text });
          if (ok) done.push(`Retenu : ${a.text}`);
        } else if (a.type === "open" && a.href?.startsWith("/")) {
          nav = a.href;
          done.push(`Ouverture de ${a.text || a.href}`);
        }
      }
      if (done.length) void refresh();
      return { done, nav };
    },
    [refresh],
  );

  /* ---------- Traitement d'une demande ---------- */

  const handle = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text) return;
      speaker.stop();
      askAbort.current?.abort();
      setInterim("");
      setMsgs((m) => [...m, { id: mid(), role: "user", text, at: new Date().toISOString() }]);
      const c = cfgRef.current;
      const local = c.alwaysClaude ? null : localAnswer(text, snapRef.current, snapRef.current?.today.ownerName);

      if (local) {
        if (local.special === "stop") {
          setCaption("");
          setMsgs((m) => m.slice(0, -1));
          return;
        }
        if (local.special === "clear") {
          await api("DELETE", "/api/jarvis/history");
          setMsgs([]);
        }
        if (local.special === "settings") setOpenSettings(true);
        const { done, nav } = await runActions(local.actions ?? []);
        if (local.cards?.length) setCards(local.cards);
        if (local.say) setMsgs((m) => [...m, { id: mid(), role: "jarvis", text: local.say, detail: local.detail, at: new Date().toISOString(), via: "instant", done }]);
        if (!local.silent) void api("POST", "/api/jarvis/history", { turns: [{ role: "user", text }, { role: "jarvis", text: local.say }] }, { silent: true });
        await say(local.say);
        if (nav) router.push(nav);
        return;
      }

      // Question ouverte : Claude.
      const id = mid();
      setThinking(true);
      setMsgs((m) => [...m, { id, role: "jarvis", text: "", at: new Date().toISOString(), pending: true, via: "claude" }]);
      const guess = cardsFor(text);
      if (guess.length) setCards(guess);
      if (!c.muted && c.acks) void say(ACKS[Math.floor(Math.random() * ACKS.length)]);
      const ac = new AbortController();
      askAbort.current = ac;
      try {
        const res = await fetch("/api/jarvis/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, personality: c.personality, city: c.city, feeds: c.feeds }),
          signal: ac.signal,
        });
        const data = (await res.json()) as { say?: string; detail?: string; actions?: Action[]; error?: string };
        if (!res.ok || !data.say) throw new Error(data.error || "Claude n'a pas répondu.");
        const { done, nav } = await runActions(data.actions ?? []);
        setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: data.say!, detail: data.detail || undefined, pending: false, done } : x)));
        setThinking(false);
        await say(data.say);
        if (nav) router.push(nav);
      } catch (e) {
        if (ac.signal.aborted) {
          setMsgs((m) => m.filter((x) => x.id !== id));
          return;
        }
        const msg = e instanceof Error ? e.message : "Erreur";
        setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: msg, pending: false, error: true } : x)));
        setThinking(false);
        await say("Je n'arrive pas à joindre Claude pour cette question. " + (snapRef.current?.bridge.online ? "" : "Ton Mac semble éteint."));
      } finally {
        if (askAbort.current === ac) askAbort.current = null;
        setThinking(false);
      }
    },
    [runActions, router, say, speaker],
  );

  const handleRef = useRef(handle);
  useEffect(() => {
    handleRef.current = handle;
  });

  /* ---------- Branchements voix ---------- */

  useEffect(() => {
    // Lecture initiale de compatibilité (navigateur uniquement).
    const timer = setTimeout(() => setSupported(speechSupported()), 0);
    speaker.bind({ onChange: setSpeaking, onFallback: () => toast("Voix réaliste indisponible", { description: "Jarvis utilise la voix du Mac pour l'instant." }) });
    const onFinal = (t: string) => {
      if (!t) return;
      if (!handsFreeRef.current) {
        void handleRef.current(t);
        return;
      }
      if (Date.now() < awaiting.current) {
        awaiting.current = 0;
        void handleRef.current(t);
        return;
      }
      const after = afterWakeWord(t, cfgRef.current.name);
      if (after === null) return;
      if (!after) {
        awaiting.current = Date.now() + 8000;
        void say("Oui ?");
        return;
      }
      void handleRef.current(after);
    };
    listener.bind({ onState: setListening, onInterim: setInterim, onError: (m) => toast.error(m), onFinal });
    // Charge la liste des voix du système (asynchrone sur Chrome).
    if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices();
    return () => {
      clearTimeout(timer);
      speaker.stop();
      listener.stopNow();
      askAbort.current?.abort();
    };
  }, [listener, say, speaker]);

  const talk = useCallback(() => {
    speaker.unlock();
    if (speaker.speaking) speaker.stop();
    if (listener.listening && !handsFreeRef.current) {
      listener.stopNow();
      return;
    }
    if (!handsFreeRef.current) listener.start(false);
  }, [listener, speaker]);

  const toggleHandsFree = useCallback(() => {
    speaker.unlock();
    const next = !handsFreeRef.current;
    handsFreeRef.current = next;
    setHandsFree(next);
    if (next) {
      listener.start(true);
      toast(`Mains libres activé`, { description: `Dis « ${cfgRef.current.name} » suivi de ta demande.` });
    } else listener.stopNow();
  }, [listener, speaker]);

  const stopAll = useCallback(() => {
    speaker.stop();
    askAbort.current?.abort();
    setCaption("");
  }, [speaker]);

  // Clavier : Espace pour parler, Échap pour couper, / pour écrire.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = !!el?.closest("input, textarea, select, [contenteditable=true], dialog[open]");
      if (e.key === "Escape") {
        stopAll();
        if (!handsFreeRef.current) listener.stopNow();
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
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
  }, [listener, stopAll, talk]);

  // Alertes vocales : nouveau mail urgent ou nouveau problème sur l'app.
  useEffect(() => {
    if (!snap) return;
    const cur = { mails: snap.today.mails?.urgentCount ?? 0, problems: snap.today.health?.problems.length ?? 0 };
    const prev = prevAlerts.current;
    prevAlerts.current = cur;
    if (!prev || !cfgRef.current.alerts || speaker.speaking || thinking) return;
    if (cur.mails > prev.mails && snap.today.mails?.urgent[0]) {
      const m = snap.today.mails.urgent[0];
      setCards(["mails"]);
      void say(`Nouveau mail urgent de ${m.from.name || m.from.email} : ${m.subject}.`);
    } else if (cur.problems > prev.problems && snap.today.health?.problems[0]) {
      setCards(["health"]);
      void say(`Alerte : ${snap.today.health.problems[0].name}.`);
    }
  }, [snap, say, speaker, thinking]);

  const orbState: OrbState = speaking ? "speaking" : thinking ? "thinking" : listening ? "listening" : "idle";
  const level = useCallback(() => (speaker.speaking ? speaker.level() : listener.listening ? listener.level() : 0), [listener, speaker]);
  const status = { idle: handsFree ? `En attente de « ${cfg.name} »` : "En veille", listening: "J'écoute", thinking: "Je réfléchis", speaking: "Je parle" }[orbState];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    speaker.unlock();
    const t = input;
    setInput("");
    void handle(t);
  };

  return (
    <div className="jarvis-root fixed inset-0 flex flex-col overflow-hidden">
      {/* Barre du haut */}
      <header className="flex shrink-0 items-center gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))] pb-2 sm:px-6">
        <Link href="/" className="jv-bar flex h-10 items-center gap-2 rounded-xl px-3 text-[13.5px] font-semibold text-white/80 transition-colors hover:text-white">
          <ArrowLeft className="size-4" /> <span className="hidden sm:inline">HQ</span>
        </Link>
        <div className="jv-bar flex h-10 min-w-0 items-center gap-3 rounded-xl px-3.5 text-[13.5px]">
          <span className="font-display font-bold tracking-[0.2em] text-white">{cfg.name.toUpperCase()}</span>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <span className={cx("hidden items-center gap-1.5 font-medium sm:flex", orbState === "idle" ? "text-white/55" : "text-[#f3be72]")}>{status}</span>
        </div>
        <div className="flex-1" />
        <div className="jv-bar hidden h-10 items-center gap-3 rounded-xl px-3.5 text-[13.5px] text-white/80 md:flex">
          <Clock />
          {snap?.weather && (
            <>
              <span className="h-4 w-px bg-white/15" />
              <span className="tnum">
                {snap.weather.temp}° <span className="text-white/45">{snap.weather.city}</span>
              </span>
            </>
          )}
        </div>
        <span
          className={cx("jv-bar flex h-10 items-center gap-2 rounded-xl px-3 text-[12.5px] font-semibold", snap?.bridge.online ? "text-[#4cd4a6]" : "text-[#f3be72]")}
          title={snap?.bridge.online ? `Claude Code répond depuis ${snap.bridge.host ?? "ton Mac"}` : "Mac éteint : seules les réponses instantanées marchent"}
        >
          <span className={cx("size-2 rounded-full", snap?.bridge.online ? "bg-[#4cd4a6]" : "bg-[#f3be72]")} />
          <span className="hidden sm:inline">{snap ? (snap.bridge.online ? "Claude en ligne" : "Claude hors ligne") : "Connexion"}</span>
        </span>
        <button onClick={() => document.documentElement.requestFullscreen?.().catch(() => undefined)} className="jv-bar hidden size-10 place-items-center rounded-xl text-white/70 hover:text-white lg:grid" aria-label="Plein écran" title="Plein écran">
          <Maximize2 className="size-4" />
        </button>
        <button onClick={() => setOpenSettings(true)} className="jv-bar grid size-10 place-items-center rounded-xl text-white/70 hover:text-white" aria-label="Réglages de Jarvis">
          <Settings2 className="size-4" />
        </button>
      </header>

      {/* Corps : conversation, orbe, cartes */}
      <main className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-4 pb-4 sm:px-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_minmax(0,360px)] lg:overflow-hidden">
        <section className="order-3 flex flex-col lg:order-1 lg:min-h-0" aria-label="Conversation">
          <div ref={feedRef} className="jv-card flex min-h-[240px] flex-1 flex-col gap-3 overflow-y-auto lg:min-h-0">
            {msgs.length === 0 && (
              <div className="m-auto max-w-[30ch] py-6 text-center text-[13.5px] text-white/55">
                Touche l&apos;orbe ou appuie sur <kbd className="rounded border border-white/20 px-1.5 text-[12px]">Espace</kbd> pour parler. Commence par « briefing ».
              </div>
            )}
            {msgs.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="ml-8 self-end rounded-2xl rounded-br-md bg-[rgb(139_112_255/0.28)] px-3.5 py-2 text-[14px] text-white">
                  {m.text}
                </div>
              ) : (
                <div key={m.id} className="mr-4 text-[14px]">
                  <p className="mb-1 flex items-center gap-1.5 text-[11.5px] font-semibold text-white/40">
                    {cfg.name}
                    {m.via === "claude" && <span className="rounded bg-white/10 px-1 text-[10px] text-white/55">Claude</span>}
                    {m.via === "instant" && <span className="rounded bg-white/10 px-1 text-[10px] text-white/55">instantané</span>}
                  </p>
                  {m.pending ? (
                    <p className="jv-caret text-white/60">Je réfléchis</p>
                  ) : (
                    <p className={cx("leading-relaxed", m.error ? "text-[#ff8a6e]" : "text-white/90")}>{m.text}</p>
                  )}
                  {m.detail && (
                    <div className="mt-2 rounded-xl bg-white/[0.04] p-3 [&_.prose-hq]:text-white/75 [&_strong]:text-white">
                      <Markdown text={m.detail} />
                    </div>
                  )}
                  {m.done?.map((d) => (
                    <p key={d} className="mt-1.5 text-[12px] font-semibold text-[#4cd4a6]">
                      {d}
                    </p>
                  ))}
                </div>
              ),
            )}
          </div>
        </section>

        <section className="order-1 flex flex-col items-center gap-3 pt-2 lg:order-2 lg:min-h-0 lg:justify-center lg:gap-4 lg:pt-0" aria-label="Jarvis">
          <Orb state={orbState} level={level} onClick={talk} label={listening ? "Arrêter d'écouter" : "Parler à Jarvis"} />
          <div className="min-h-[56px] w-full max-w-[640px] text-center lg:min-h-[72px]" aria-live="polite">
            {interim ? (
              <p className="font-display text-[20px] leading-snug text-white/70 sm:text-[22px]">{interim}</p>
            ) : caption ? (
              <p className="line-clamp-3 text-[16px] leading-relaxed text-white/85 sm:text-[17px]">{caption}</p>
            ) : (
              <p className="text-[14px] text-white/40">{supported ? "Espace pour parler, / pour écrire, Échap pour couper." : "Ce navigateur n'a pas la reconnaissance vocale : écris ta demande."}</p>
            )}
          </div>
        </section>

        <section className="order-2 flex flex-col gap-3 lg:order-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1 [&>*]:shrink-0" aria-label="Informations">
          {snap ? cards.map((k) => <Card key={k} kind={k} s={snap} onForget={async (id) => { await api("DELETE", `/api/jarvis/memory?id=${id}`); void refresh(); }} />) : Array.from({ length: 3 }, (_, i) => <div key={i} className="jv-card h-36 animate-pulse" />)}
        </section>
      </main>

      {/* Barre de commande */}
      <footer className="shrink-0 px-4 pt-1 pb-[max(14px,env(safe-area-inset-bottom))] sm:px-6">
        <div className="mx-auto max-w-[760px]">
          <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {SUGGESTIONS.map((sg) => (
              <button
                key={sg}
                onClick={() => {
                  speaker.unlock();
                  void handle(sg);
                }}
                className="jv-bar shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:text-white"
              >
                {sg}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="jv-bar flex items-center gap-2 rounded-[22px] p-2">
            <button
              type="button"
              onClick={talk}
              disabled={handsFree}
              className={cx(
                "grid size-11 shrink-0 place-items-center rounded-2xl transition-[background-color,transform] active:scale-95 disabled:opacity-40",
                listening && !handsFree ? "bg-[#f3be72] text-[#1a1530]" : "bg-[#6b4af2] text-white shadow-[0_8px_24px_-10px_#6b4af2]",
              )}
              aria-label={listening ? "Arrêter d'écouter" : "Parler"}
              title="Parler (Espace)"
            >
              {listening && !handsFree ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Demande à ${cfg.name}…`}
              className="h-11 min-w-0 flex-1 bg-transparent px-2 text-[15px] text-white outline-none placeholder:text-white/40"
              aria-label="Écrire une demande"
            />
            {(speaking || thinking) && (
              <button type="button" onClick={stopAll} className="grid size-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white" aria-label="Couper" title="Couper (Échap)">
                <Square className="size-4" />
              </button>
            )}
            <button type="submit" disabled={!input.trim()} className="grid size-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-30" aria-label="Envoyer">
              <Send className="size-4" />
            </button>
            <span className="h-6 w-px bg-white/10" />
            <button
              type="button"
              onClick={toggleHandsFree}
              className={cx("flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 text-[12.5px] font-semibold transition-colors", handsFree ? "bg-[rgb(76_212_166/0.18)] text-[#4cd4a6]" : "text-white/60 hover:bg-white/10 hover:text-white")}
              aria-pressed={handsFree}
              title={`Mains libres : dis « ${cfg.name} » pour l'appeler`}
            >
              <Ear className="size-4" /> <span className="hidden sm:inline">Mains libres</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const muted = !cfg.muted;
                setSettings({ ...cfg, muted });
                if (muted) speaker.stop();
              }}
              className="grid size-10 shrink-0 place-items-center rounded-xl text-white/60 hover:bg-white/10 hover:text-white"
              aria-label={cfg.muted ? "Réactiver la voix" : "Couper la voix"}
              title={cfg.muted ? "Réactiver la voix" : "Couper la voix"}
            >
              {cfg.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>
          </form>
          {cfg.alwaysClaude && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[12px] text-white/40">
              <Sparkles className="size-3.5" /> Toutes les demandes passent par Claude (réglage).
            </p>
          )}
        </div>
      </footer>

      <Settings open={openSettings} onClose={() => setOpenSettings(false)} cfg={cfg} setCfg={setSettings} speaker={speaker} memory={snap?.memory ?? []} onChanged={() => void refresh()} />
    </div>
  );
}
