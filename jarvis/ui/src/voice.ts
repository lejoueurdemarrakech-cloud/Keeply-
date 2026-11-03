/* ============================================================
   Voix de l'interface :
   - Mouth : lit les phrases au fur et à mesure (audio fourni par le
     serveur local : voix Edge ou voix du Mac), file d'attente + niveau.
   - Ear : reconnaissance vocale du navigateur (Chrome ou Safari).
   ============================================================ */

export class Mouth {
  private audio = new Audio();
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  private queue: Promise<string | null>[] = [];
  private urls: string[] = [];
  private gen = 0;
  private running = false;
  speaking = false;
  muted = false;
  private onChange: (v: boolean) => void = () => {};

  bind(onChange: (v: boolean) => void) {
    this.onChange = onChange;
  }

  /** À appeler sur un geste (clic) : autorise le son et l'analyse du niveau. */
  unlock() {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext();
        const src = this.ctx.createMediaElementSource(this.audio);
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.data = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
        src.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {}
  }

  level() {
    if (!this.speaking || !this.analyser || !this.data) return 0;
    this.analyser.getByteFrequencyData(this.data);
    let s = 0;
    for (let i = 2; i < 50; i++) s += this.data[i];
    return Math.min(1, s / (48 * 140));
  }

  private set(v: boolean) {
    if (v !== this.speaking) {
      this.speaking = v;
      this.onChange(v);
    }
  }

  say(text: string) {
    const t = text.trim();
    if (!t || this.muted) return;
    const gen = this.gen;
    // Préchargement immédiat : la phrase suivante est prête pendant que la précédente est lue.
    this.queue.push(
      fetch(`/api/tts?text=${encodeURIComponent(t)}`)
        .then((r) => (r.ok ? r.blob() : null))
        .then((b) => {
          if (!b || gen !== this.gen) return null;
          const u = URL.createObjectURL(b);
          this.urls.push(u);
          return u;
        })
        .catch(() => null),
    );
    if (!this.running) void this.run();
  }

  private async run() {
    this.running = true;
    const gen = this.gen;
    while (this.queue.length && gen === this.gen) {
      const url = await this.queue.shift()!;
      if (!url || gen !== this.gen) continue;
      this.set(true);
      this.audio.src = url;
      try {
        await this.audio.play();
        await new Promise<void>((res) => {
          const end = () => {
            this.audio.onended = this.audio.onerror = this.audio.onpause = null;
            res();
          };
          this.audio.onended = this.audio.onerror = this.audio.onpause = end;
        });
      } catch {}
    }
    this.running = false;
    if (gen === this.gen) this.set(false);
  }

  /** Attend la fin de tout ce qui est en file. */
  async idle() {
    while (this.running || this.queue.length) await new Promise((r) => setTimeout(r, 120));
  }

  stop() {
    this.gen++;
    this.queue = [];
    this.audio.pause();
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
    this.running = false;
    this.set(false);
  }
}

interface Rec {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type RecCtor = new () => Rec;
const Ctor = (): RecCtor | undefined => (window as unknown as { SpeechRecognition?: RecCtor }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: RecCtor }).webkitSpeechRecognition;
export const earSupported = () => typeof window !== "undefined" && !!Ctor();

export class Ear {
  private rec: Rec | null = null;
  private keep = false;
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  listening = false;
  private h = { onInterim: (_: string) => {}, onFinal: (_: string) => {}, onState: (_: boolean) => {}, onError: (_: string) => {} };

  bind(h: Ear["h"]) {
    this.h = h;
  }

  level() {
    if (!this.listening || !this.analyser || !this.data) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let peak = 0;
    for (let i = 0; i < this.data.length; i++) peak = Math.max(peak, Math.abs(this.data[i] - 128));
    return Math.min(1, peak / 55);
  }

  private async meter() {
    if (this.stream) return;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      this.ctx = new AudioContext();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 512;
      this.data = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      this.ctx.createMediaStreamSource(this.stream).connect(this.analyser);
    } catch {}
  }

  private release() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.analyser = null;
  }

  start(continuous: boolean) {
    const C = Ctor();
    if (!C) {
      this.h.onError("Reconnaissance vocale indisponible dans ce navigateur : utilise Chrome ou Safari.");
      return;
    }
    this.stop();
    this.keep = continuous;
    const rec = new C();
    rec.lang = "fr-FR";
    rec.continuous = continuous;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) this.h.onFinal(r[0].transcript.trim());
        else interim += r[0].transcript;
      }
      this.h.onInterim(interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        this.keep = false;
        this.h.onError("Micro refusé : autorise le micro pour Jarvis (Réglages Système > Confidentialité > Micro, et dans le navigateur).");
      } else if (e.error === "network") this.h.onError("La reconnaissance vocale a besoin d'Internet.");
      else if (e.error === "audio-capture") this.h.onError("Aucun micro détecté.");
    };
    rec.onend = () => {
      this.h.onInterim("");
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
        this.h.onState(false);
      }
    };
    this.rec = rec;
    try {
      rec.start();
      this.listening = true;
      this.h.onState(true);
      void this.meter();
    } catch {
      this.rec = null;
    }
  }

  stop() {
    this.keep = false;
    if (this.rec) {
      const r = this.rec;
      this.rec = null;
      r.onend = null;
      r.abort();
    }
    this.listening = false;
    this.release();
    this.h.onState(false);
  }
}

/** Repère le mot de réveil ; renvoie la suite de la phrase ("" si seul le nom), ou null. */
export function afterWake(text: string, name: string): string | null {
  const norm = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const w = norm(name) || "jarvis";
  const variants = new Set([w, ...(w === "jarvis" ? ["jarvice", "jarviss", "djarvis", "jervis", "charvis", "jarvisse", "jarvi"] : [])]);
  const words = text.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length; i++) {
    const one = norm(words[i]);
    const two = i + 1 < words.length ? one + norm(words[i + 1]) : "";
    const hit = variants.has(one) ? 1 : two && variants.has(two) ? 2 : 0;
    if (hit) return words.slice(i + hit).join(" ").replace(/^[\s,.!?:;-]+/, "").trim();
  }
  return null;
}
