import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { EDGE_VOICES } from "./config.js";
import { HOME } from "./store.js";

/*
 * Voix : d'abord la voix neuronale gratuite de Microsoft Edge,
 * sinon la voix intégrée du Mac (commande `say`), convertie en AAC.
 * Les phrases déjà prononcées sont gardées en cache (dossier ~/.jarvis/audio).
 */

const DIR = path.join(HOME, "audio");
fs.mkdirSync(DIR, { recursive: true });
let edgeDownUntil = 0;

const xml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function edge(text, voice, rate) {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  const tts = new MsEdgeTTS({ connectionTimeoutMs: 5000, synthesisTimeoutMs: 15000 });
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(xml(text), { rate: `${rate >= 0 ? "+" : ""}${Math.round(rate)}%` });
    const chunks = [];
    await new Promise((resolve, reject) => {
      audioStream.on("data", (c) => chunks.push(c));
      audioStream.on("end", resolve);
      audioStream.on("close", resolve);
      audioStream.on("error", reject);
    });
    const buf = Buffer.concat(chunks);
    if (buf.length < 500) throw new Error("aucun son");
    return { buf, type: "audio/mpeg" };
  } finally {
    tts.close();
  }
}

const run = (cmd, args) => new Promise((resolve, reject) => execFile(cmd, args, { timeout: 20000 }, (e) => (e ? reject(e) : resolve())));

async function mac(text, voice, rate) {
  if (process.platform !== "darwin") throw new Error("voix du Mac indisponible sur ce système");
  const base = path.join(DIR, "tmp-" + crypto.randomUUID());
  const wpm = Math.round(185 * (1 + rate / 100));
  await run("say", [...(voice ? ["-v", voice] : []), "-r", String(wpm), "-o", base + ".aiff", text]);
  await run("afconvert", ["-f", "m4af", "-d", "aac", base + ".aiff", base + ".m4a"]);
  const buf = fs.readFileSync(base + ".m4a");
  fs.rmSync(base + ".aiff", { force: true });
  fs.rmSync(base + ".m4a", { force: true });
  return { buf, type: "audio/mp4" };
}

export async function speak(text, v) {
  const clean = String(text).replace(/\s+/g, " ").trim().slice(0, 600);
  if (!clean) throw new Error("texte vide");
  const useEdge = v.mode === "edge" && EDGE_VOICES[v.edgeVoice] && Date.now() > edgeDownUntil;
  const key = crypto.createHash("sha1").update([useEdge ? v.edgeVoice : "mac:" + v.macVoice, v.rate, clean].join("|")).digest("hex");
  for (const [ext, type] of [["mp3", "audio/mpeg"], ["m4a", "audio/mp4"]]) {
    const f = path.join(DIR, `${key}.${ext}`);
    if (fs.existsSync(f)) return { buf: fs.readFileSync(f), type };
  }
  let out;
  if (useEdge) {
    try {
      out = await edge(clean, v.edgeVoice, v.rate);
    } catch {
      edgeDownUntil = Date.now() + 10 * 60_000; // on réessaiera dans 10 minutes
    }
  }
  out ??= await mac(clean, v.macVoice, v.rate);
  fs.writeFileSync(path.join(DIR, `${key}.${out.type === "audio/mpeg" ? "mp3" : "m4a"}`), out.buf);
  return out;
}

/** Garde le cache audio sous 300 fichiers. */
export function pruneAudio() {
  try {
    const files = fs
      .readdirSync(DIR)
      .map((f) => ({ f, t: fs.statSync(path.join(DIR, f)).mtimeMs }))
      .sort((a, b) => b.t - a.t);
    for (const { f } of files.slice(300)) fs.rmSync(path.join(DIR, f), { force: true });
  } catch {}
}

/** Voix françaises installées sur le Mac (pour le menu des réglages). */
export function macVoices() {
  if (process.platform !== "darwin") return Promise.resolve([]);
  return new Promise((resolve) =>
    execFile("say", ["-v", "?"], { timeout: 4000 }, (e, out) => {
      if (e) return resolve([]);
      resolve(
        out
          .split("\n")
          .map((l) => l.match(/^(.+?)\s{2,}(fr[_-]\w+)/))
          .filter(Boolean)
          .map((m) => m[1].trim()),
      );
    }),
  );
}
