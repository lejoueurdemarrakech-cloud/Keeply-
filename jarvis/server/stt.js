import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { HOME } from "./store.js";

/* ============================================================
   Reconnaissance vocale locale (Whisper sur le Mac).
   L'interface envoie l'audio déjà en PCM 16 kHz mono : pas de
   conversion, pas d'Internet. Un processus Python garde le modèle
   en mémoire ; chaque phrase est transcrite en une fraction de seconde.
   ============================================================ */

const WORKER = path.join(path.dirname(fileURLToPath(import.meta.url)), "stt_worker.py");
const TMP = path.join(HOME, "audio-in");
fs.mkdirSync(TMP, { recursive: true });

function uvx() {
  for (const p of [process.env.JARVIS_UVX, path.join(os.homedir(), ".local", "bin", "uvx"), "/opt/homebrew/bin/uvx", "/usr/local/bin/uvx"]) if (p && fs.existsSync(p)) return p;
  return "uvx";
}

let child = null;
let ready = false;
let seq = 0;
const waiting = new Map();
export const sttState = { ready: false, error: "", model: "" };

export function startStt() {
  if (child) return;
  const model = process.env.JARVIS_STT_MODEL || "small"; // rapide pour les phrases courtes
  child = spawn(uvx(), ["--with", "faster-whisper", "--with", "numpy", "python", "-I", WORKER, model], { env: { ...process.env, HF_HUB_DISABLE_TELEMETRY: "1" }, stdio: ["pipe", "pipe", "pipe"] });
  let buf = "";
  child.stdout.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      let m;
      try {
        m = JSON.parse(line);
      } catch {
        continue;
      }
      if (m.ready) {
        ready = sttState.ready = true;
        sttState.model = m.model;
        continue;
      }
      const w = waiting.get(m.id);
      if (!w) continue;
      waiting.delete(m.id);
      fs.rm(w.file, () => {});
      m.error ? w.reject(new Error(m.error)) : w.resolve({ text: m.text, ms: m.ms });
    }
  });
  child.stderr.on("data", (d) => (sttState.error = String(d).slice(-300)));
  child.on("close", () => {
    child = null;
    ready = sttState.ready = false;
    for (const w of waiting.values()) w.reject(new Error("La reconnaissance vocale s'est arrêtée."));
    waiting.clear();
    setTimeout(startStt, 3000); // on relance tout seul
  });
  child.on("error", (e) => (sttState.error = String(e.message)));
}

/** Transcrit un extrait PCM 16 kHz mono int16. */
export async function transcribe(pcm) {
  if (!child) startStt();
  for (let k = 0; k < 200 && !ready; k++) await new Promise((r) => setTimeout(r, 100));
  if (!ready) throw new Error("La reconnaissance vocale démarre encore, réessaie dans quelques secondes.");
  const id = ++seq;
  const file = path.join(TMP, `${id}.pcm`);
  fs.writeFileSync(file, pcm);
  return new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject, file });
    // Plus de 10 s de parole : une dictée, on prend le modèle plus précis.
    const long = pcm.length / 32000 > 10;
    child.stdin.write(JSON.stringify({ id, path: file, model: long ? process.env.JARVIS_STT_LONG || "medium" : undefined }) + "\n");
    setTimeout(() => {
      if (waiting.has(id)) {
        waiting.delete(id);
        fs.rm(file, () => {});
        reject(new Error("Transcription trop longue."));
      }
    }, 60_000);
  });
}
