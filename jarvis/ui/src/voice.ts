/* ============================================================
   Voix de l'interface :
   - Mouth : lit les phrases au fur et à mesure (audio fourni par le
     serveur local : voix Edge ou voix du Mac), file d'attente + niveau.
   - Ear : micro + détection de silence, transcription par Whisper sur le Mac.
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

/* ---------- Oreille : micro + détection de silence + Whisper local ---------- */

export const earSupported = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

export class Ear {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private node: ScriptProcessorNode | null = null;
  private keep = false;
  private chunks: Float32Array[] = [];
  private speaking = false;
  private silentMs = 0;
  private spokenMs = 0;
  private waitedMs = 0;
  private noise = 0.006;
  private rms = 0;
  paused = false; // pendant que Jarvis parle (évite qu'il s'entende lui-même)
  listening = false;
  private h = { onInterim: (_: string) => {}, onFinal: (_: string) => {}, onState: (_: boolean) => {}, onError: (_: string) => {} };

  bind(h: Ear["h"]) {
    this.h = h;
  }

  level() {
    return this.listening ? Math.min(1, this.rms * 14) : 0;
  }

  async start(continuous: boolean) {
    this.stop();
    this.keep = continuous;
    const { logMic } = await import("./api");
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      const name = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
      logMic(`refus du micro : ${name}`);
      this.h.onError(/system|NotAllowed/i.test(name)
        ? "Le Mac bloque le micro pour Edge : Réglages Système > Confidentialité et sécurité > Microphone > active Microsoft Edge, puis relance Jarvis."
        : `Micro indisponible (${name}).`);
      return;
    }
    const track = this.stream.getAudioTracks()[0];
    logMic(`micro ouvert : ${track?.label || "sans nom"} · ${track?.readyState} · muet=${track?.muted}`);
    this.ctx = new AudioContext();
    if (this.ctx.state === "suspended") await this.ctx.resume();
    const src = this.ctx.createMediaStreamSource(this.stream);
    this.node = this.ctx.createScriptProcessor(2048, 1, 1);
    const frameMs = (2048 / this.ctx.sampleRate) * 1000;
    this.reset();
    this.node.onaudioprocess = (e) => {
      const x = e.inputBuffer.getChannelData(0);
      let sum = 0;
      for (let i = 0; i < x.length; i++) sum += x[i] * x[i];
      this.rms = Math.sqrt(sum / x.length);
      if (this.paused) return;
      const loud = this.rms > Math.max(0.012, this.noise * 3.2);
      if (!this.speaking) {
        // le bruit de fond s'adapte tant qu'on ne parle pas
        this.noise = this.noise * 0.97 + this.rms * 0.03;
        this.chunks.push(new Float32Array(x)); // garde 0,3 s avant le début de la phrase
        if (this.chunks.length > Math.ceil(300 / frameMs)) this.chunks.shift();
        this.waitedMs += frameMs;
        if (loud) {
          this.speaking = true;
          this.h.onInterim("Je t'écoute…");
        } else if (!this.keep && this.waitedMs > 9000) {
          this.h.onInterim("");
          this.stop();
        }
        return;
      }
      this.chunks.push(new Float32Array(x));
      this.spokenMs += frameMs;
      this.silentMs = loud ? 0 : this.silentMs + frameMs;
      // fin de phrase : 0,8 s de silence, ou 25 s maximum
      if ((this.silentMs > 800 && this.spokenMs > 350) || this.spokenMs > 25_000) void this.flush();
    };
    src.connect(this.node);
    this.node.connect(this.ctx.destination);
    this.listening = true;
    this.h.onState(true);
    logMic(`écoute : ${this.ctx.sampleRate} Hz, état ${this.ctx.state}, mode ${this.keep ? "mains libres" : "une phrase"}`);
    // Si rien ne bouge au bout de 3 s, le Mac donne sans doute un micro muet à Edge.
    let peak = 0;
    const probe = setInterval(() => (peak = Math.max(peak, this.rms)), 100);
    setTimeout(() => {
      clearInterval(probe);
      if (!this.listening) return;
      logMic(`niveau max sur 3 s : ${peak.toFixed(4)}`);
      if (peak < 0.0005) this.h.onError("Je n'entends rien : le micro est muet. Vérifie Réglages Système > Confidentialité > Microphone (Microsoft Edge) et le micro choisi dans Son > Entrée.");
    }, 3000);
  }

  private reset() {
    this.chunks = [];
    this.speaking = false;
    this.silentMs = this.spokenMs = this.waitedMs = 0;
  }

  /** Envoie la phrase à Whisper (en 16 kHz) et passe la main. */
  private async flush() {
    const rate = this.ctx?.sampleRate || 48000;
    const parts = this.chunks;
    this.reset();
    if (!this.keep) this.stop();
    const len = parts.reduce((a, c) => a + c.length, 0);
    const all = new Float32Array(len);
    let o = 0;
    for (const c of parts) (all.set(c, o), (o += c.length));
    const ratio = rate / 16000;
    const out = new Int16Array(Math.floor(len / ratio));
    for (let i = 0; i < out.length; i++) {
      // moyenne sur la fenêtre : rééchantillonnage simple sans repliement audible
      const a = Math.floor(i * ratio), b = Math.min(len, Math.floor((i + 1) * ratio));
      let s = 0;
      for (let k = a; k < b; k++) s += all[k];
      out[i] = Math.max(-1, Math.min(1, s / Math.max(1, b - a))) * 32767;
    }
    this.h.onInterim("Transcription…");
    try {
      const { stt, logMic } = await import("./api");
      const r = await stt(out);
      this.h.onInterim("");
      if (r.text) this.h.onFinal(r.text);
      else {
        logMic(`phrase de ${(out.length / 16000).toFixed(1)} s sans texte compris`);
        this.h.onError("Je n'ai pas compris, tu peux répéter ?");
      }
    } catch (e) {
      this.h.onInterim("");
      this.h.onError(e instanceof Error ? e.message : "Reconnaissance vocale indisponible.");
    }
  }

  stop() {
    this.keep = false;
    this.node?.disconnect();
    this.node = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    if (this.listening) {
      this.listening = false;
      this.h.onState(false);
    }
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
