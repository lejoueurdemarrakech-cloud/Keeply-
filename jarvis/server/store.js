import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/** Dossier de Jarvis sur le Mac : réglages, disposition, mémoire, cache audio. */
export const HOME = process.env.JARVIS_HOME || path.join(os.homedir(), ".jarvis");
fs.mkdirSync(HOME, { recursive: true });

const file = (name) => path.join(HOME, name + ".json");

export function load(name, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file(name), "utf8"));
  } catch {
    return structuredClone(fallback);
  }
}

/** Écriture atomique : jamais de fichier à moitié écrit si le Mac s'éteint. */
export function save(name, value) {
  const tmp = file(name) + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, file(name));
  return value;
}

export const uid = (p = "") => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
