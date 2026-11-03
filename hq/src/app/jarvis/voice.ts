"use client";

/* ============================================================
   Moteur vocal de Jarvis, sans dépendance et léger en mémoire :
   - Speaker : voix réaliste (Edge, via /api/jarvis/tts) phrase par
     phrase, avec repli automatique sur la voix du Mac.
   - Listener : reconnaissance vocale du navigateur (Chrome, Safari),
     mode « appuyer pour parler » ou « mains libres » avec mot de réveil.
   Les niveaux sonores alimentent l'animation de l'orbe.
   ============================================================ */

export type VoiceMode = "edge" | "systeme";

export interface VoiceSettings {
  mode: VoiceMode;
  edgeVoice: string;
  systemVoice: string; // nom de la voix du système, "" = automatique
  rate: number; // -30 à +40 (%)
}

/** Découpe en phrases courtes : la première est prête plus vite. */
export function chunks(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").replace(/[*_#`]/g, "").trim();
  const out: string[] = [];
  for (const s of clean.split(/(?<=[.!?…])\s+/)) {
    if (s.length <= 220) {
      if (s) out.push(s);
      continue;
    }
    let cur = "";
    for (const part of s.split(/(?<=[,;:])\s+/)) {
      if ((cur + " " + part).length > 220 && cur) {
        out.push(cur);
        cur = part;
      } else cur = cur ? cur + " " + part : part;
    }
    if (cur) out.push(cur);
  }
  return out;
}

/** Meilleure voix française du système (les voix « Premium » ou « Améliorée » du Mac d'abord). */
export function bestSystemVoice(voices: SpeechSynthesisVoice[], preferred = ""): SpeechSynthesisVoice | null {
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith("fr"));
  if (preferred) {
    const p = fr.find((v) => v.name === preferred);
    if (p) return p;
  }
  const score = (v: SpeechSynthesisVoice) =>
    (/premium|enhanced|améliorée|natural|neural/i.test(v.name) ? 6 : 0) +
    (/google/i.test(v.name) ? 3 : 0) +
    (/thomas|amélie|audrey|aurélie|marie|daniel/i.test(v.name) ? 2 : 0) +
    (v.lang === "fr-FR" ? 1 : 0) +
    (v.localService ? 0 : 1);
  return [...fr].sort((a, b) => score(b) - score(a))[0] ?? null;
}

export class Speaker {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Uint8Array<ArrayBuffer> | null = null;
  private token = 0;
  private aborts: AbortController[] = [];
  private urls: string[] = [];
  private synthActive = false;
  private primed = false;
  edgeBroken = false;
  speaking = false;
  onChange: (speaking: boolean) => void = () => {};
  onFallback: () => void = () => {};

  /** Branche les rappels de l'interface. */
  bind(h: { onChange: (speaking: boolean) => void; onFallback: () => void }) {
    this.onChange = h.onChange;
    this.onFallback = h.onFallback;
  }

  /** Redonne une chance à la voix réaliste (après un échec). */
  retryEdge() {
    this.edgeBroken = false;
  }

  /** À appeler lors d'un geste de l'utilisateur (clic, touche) : débloque le son. */
  unlock() {
    if (typeof window === "undefined") return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = "auto";
    }
    try {
      if (!this.ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AC();
        const src = this.ctx.createMediaElementSource(this.audio);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.buf = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
        src.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
      // Safari et Chrome n'autorisent la voix du système qu'après un geste : on l'amorce ici.
      if (typeof speechSynthesis !== "undefined" && !this.primed) {
        this.primed = true;
        const u = new SpeechSynthesisUtterance(" ");
        u.volume = 0;
        speechSynthesis.speak(u);
      }
    } catch {
      // Sans Web Audio, le son passe quand même ; seule l'animation est simulée.
    }
  }

  /** Niveau sonore actuel, de 0 à 1. */
  level() {
    if (!this.speaking) return 0;
    if (this.synthActive || !this.analyser || !this.buf) return 0.35 + Math.sin(performance.now() / 110) * 0.18 + Math.random() * 0.12;
    this.analyser.getByteFrequencyData(this.buf);
    let sum = 0;
    for (let i = 2; i < 48; i++) sum += this.buf[i];
    return Math.min(1, sum / (46 * 150));
  }

  private set(v: boolean) {
    if (this.speaking === v) return;
    this.speaking = v;
    this.onChange(v);
  }

  stop() {
    this.token++;
    this.aborts.forEach((a) => a.abort());
    this.aborts = [];
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
    }
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    this.synthActive = false;
    this.set(false);
  }

  async speak(text: string, s: VoiceSettings) {
    this.stop();
    const parts = chunks(text);
    if (!parts.length) return;
    const my = this.token;
    this.set(true);
    try {
      if (s.mode === "edge" && !this.edgeBroken) {
        const ok = await this.speakEdge(parts, s, my);
        if (ok === "done" || my !== this.token) return;
        // Échec : on continue avec la voix du système à partir de la phrase en cours.
        this.edgeBroken = true;
        this.onFallback();
        await this.speakSystem(parts.slice(ok), s, my);
      } else {
        await this.speakSystem(parts, s, my);
      }
    } finally {
      if (my === this.token) this.set(false);
    }
  }

  private fetchChunk(text: string, s: VoiceSettings) {
    const ac = new AbortController();
    this.aborts.push(ac);
    const q = new URLSearchParams({ text, voice: s.edgeVoice, rate: String(s.rate) });
    return fetch(`/api/jarvis/tts?${q}`, { signal: ac.signal }).then(async (r) => {
      if (!r.ok) throw new Error("tts " + r.status);
      const url = URL.createObjectURL(await r.blob());
      this.urls.push(url);
      return url;
    });
  }

  /** Renvoie "done", ou l'index de la phrase où la voix réaliste a échoué. */
  private async speakEdge(parts: string[], s: VoiceSettings, my: number): Promise<"done" | number> {
    if (!this.audio) this.unlock();
    const audio = this.audio!;
    let next: Promise<string> | null = this.fetchChunk(parts[0], s);
    for (let i = 0; i < parts.length; i++) {
      let url: string;
      try {
        url = await next!;
      } catch {
        return my === this.token ? i : "done";
      }
      if (my !== this.token) return "done";
      next = i + 1 < parts.length ? this.fetchChunk(parts[i + 1], s) : null;
      next?.catch(() => undefined);
      audio.src = url;
      try {
        await audio.play();
      } catch {
        return i;
      }
      await new Promise<void>((resolve) => {
        const end = () => {
          audio.removeEventListener("ended", end);
          audio.removeEventListener("error", end);
          audio.removeEventListener("pause", end);
          resolve();
        };
        audio.addEventListener("ended", end);
        audio.addEventListener("error", end);
        audio.addEventListener("pause", end);
      });
      if (my !== this.token) return "done";
    }
    return "done";
  }

  private async speakSystem(parts: string[], s: VoiceSettings, my: number) {
    if (typeof speechSynthesis === "undefined") return;
    const voice = bestSystemVoice(speechSynthesis.getVoices(), s.systemVoice);
    this.synthActive = true;
    for (const p of parts) {
      if (my !== this.token) return;
      await new Promise<void>((resolve) => {
        const u = new SpeechSynthesisUtterance(p);
        u.lang = voice?.lang ?? "fr-FR";
        if (voice) u.voice = voice;
        u.rate = Math.max(0.6, Math.min(1.6, 1 + s.rate / 100));
        u.onend = () => resolve();
        u.onerror = () => resolve();
        speechSynthesis.speak(u);
      });
    }
    this.synthActive = false;
  }
}

/* ---------- Écoute ---------- */

interface Rec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}

export const speechSupported = () => typeof window !== "undefined" && !!((window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition);

export class Listener {
  private rec: Rec | null = null;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buf: Uint8Array<ArrayBuffer> | null = null;
  private keep = false;
  listening = false;
  onInterim: (t: string) => void = () => {};
  onFinal: (t: string) => void = () => {};
  onState: (listening: boolean) => void = () => {};
  onError: (msg: string) => void = () => {};

  bind(h: { onInterim: (t: string) => void; onFinal: (t: string) => void; onState: (listening: boolean) => void; onError: (msg: string) => void }) {
    Object.assign(this, h);
  }

  level() {
    if (!this.listening || !this.analyser || !this.buf) return 0;
    this.analyser.getByteTimeDomainData(this.buf);
    let peak = 0;
    for (let i = 0; i < this.buf.length; i++) peak = Math.max(peak, Math.abs(this.buf[i] - 128));
    return Math.min(1, peak / 60);
  }

  private async meter() {
    if (this.stream) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.buf = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      this.ctx.createMediaStreamSource(this.stream).connect(this.analyser);
    } catch {
      // Le niveau du micro n'est qu'un plus pour l'animation.
    }
  }

  private release() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.analyser = null;
  }

  /** continuous = mains libres (relance automatique). */
  start(continuous: boolean) {
    const W = window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
    const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!Ctor) {
      this.onError("La reconnaissance vocale n'est pas disponible dans ce navigateur. Utilise Chrome ou Safari, ou écris ta demande.");
      return;
    }
    this.stopNow();
    this.keep = continuous;
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) this.onFinal(r[0].transcript.trim());
        else interim += r[0].transcript;
      }
      this.onInterim(interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this.keep = false;
        this.onError("Micro refusé. Autorise le micro pour HQ dans les réglages du navigateur.");
      } else if (e.error === "network") {
        this.onError("La reconnaissance vocale a besoin d'Internet.");
      }
    };
    rec.onend = () => {
      this.onInterim("");
      if (this.keep && this.rec === rec) {
        try {
          rec.start();
          return;
        } catch {}
      }
      if (this.rec === rec) {
        this.rec = null;
        this.listening = false;
        this.release();
        this.onState(false);
      }
    };
    this.rec = rec;
    try {
      rec.start();
      this.listening = true;
      this.onState(true);
      void this.meter();
    } catch {
      this.rec = null;
    }
  }

  /** Pause pendant que Jarvis parle (évite qu'il s'entende lui-même). */
  pause() {
    if (!this.rec) return;
    const r = this.rec;
    this.rec = null;
    r.onend = null;
    r.abort();
    this.listening = false;
    this.release();
    this.onState(false);
  }

  stopNow() {
    this.keep = false;
    if (this.rec) {
      const r = this.rec;
      this.rec = null;
      r.onend = null;
      r.abort();
    }
    this.listening = false;
    this.release();
    this.onInterim("");
    this.onState(false);
  }
}

/** Repère le mot de réveil et renvoie ce qui suit (ou "" si seul le nom a été dit). */
export function afterWakeWord(text: string, name: string): string | null {
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const w = norm(name || "jarvis") || "jarvis";
  const variants = new Set([w, ...(w === "jarvis" ? ["jarvice", "jarviss", "djarvis", "jervis", "charvis", "jarvisse"] : [])]);
  const words = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const one = norm(words[i]);
    const two = i + 1 < words.length ? one + norm(words[i + 1]) : "";
    const hit = variants.has(one) ? 1 : two && variants.has(two) ? 2 : 0;
    if (hit) return words.slice(i + hit).join(" ").replace(/^[\s,.!?:;-]+/, "").trim();
  }
  return null;
}
