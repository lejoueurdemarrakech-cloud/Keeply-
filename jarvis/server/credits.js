import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/* ============================================================
   Compteur Claude en direct : lit les journaux de Claude Code
   (~/.claude/projects/**.jsonl) au fil de l'eau (seulement les
   octets nouveaux), compte les jetons de chaque réponse une seule
   fois (par identifiant de message) et les convertit en dollars
   avec les tarifs publics (mêmes que le suivi de coûts du Mac).
   C'est l'équivalent en tarif API de ce que tu consommes.
   ============================================================ */

const ROOT = path.join(os.homedir(), ".claude", "projects");
// $ par million de jetons. Écriture en cache : ×1,25 (5 min) ou ×2 (1 h). Lecture : ×0,1.
const RATES = {
  fable: { in: 10, out: 50 },
  haiku: { in: 1, out: 5 },
  sonnet5: { in: 2, out: 10 },
  sonnet: { in: 3, out: 15 },
  opus: { in: 5, out: 25 },
  opusLegacy: { in: 15, out: 75 },
};
function rates(model = "") {
  const m = model.toLowerCase();
  if (/fable|mythos/.test(m)) return RATES.fable;
  if (m.includes("haiku")) return RATES.haiku;
  if (/sonnet-5/.test(m)) return RATES.sonnet5;
  if (/3-opus|opus-4-0(?!\d)|opus-4-1(?!\d)/.test(m)) return RATES.opusLegacy;
  if (m.includes("opus")) return RATES.opus;
  return RATES.sonnet;
}
function cost(model, u) {
  const r = rates(model);
  const w5 = u.cache_creation?.ephemeral_5m_input_tokens;
  const w1h = u.cache_creation?.ephemeral_1h_input_tokens;
  const write = w5 !== undefined || w1h !== undefined ? (w5 || 0) * 1.25 + (w1h || 0) * 2 : (u.cache_creation_input_tokens || 0) * 1.25;
  return ((u.input_tokens || 0) * r.in + write * r.in + (u.cache_read_input_tokens || 0) * r.in * 0.1 + (u.output_tokens || 0) * r.out) / 1e6;
}

const offsets = new Map(); // fichier → octets déjà lus
const seen = new Map(); // id du message → { day, usd, tokens, model, ts }
let lastScan = 0;
let scanning = null;

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function listFiles(dir, since, out = []) {
  let entries = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, since, out);
    else if (e.name.endsWith(".jsonl")) {
      try {
        if (fs.statSync(p).mtimeMs >= since) out.push(p);
      } catch {}
    }
  }
  return out;
}

function readNew(file) {
  // Les gros journaux se lisent par morceaux de 64 Mo jusqu'au bout.
  for (let k = 0; k < 64; k++) if (!readChunk(file)) break;
}

function readChunk(file) {
  let size;
  try {
    size = fs.statSync(file).size;
  } catch {
    return false;
  }
  const from = offsets.get(file) ?? 0;
  if (size <= from) return false;
  const fd = fs.openSync(file, "r");
  try {
    const len = Math.min(size - from, 64 * 1024 * 1024);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, from);
    const text = buf.toString("utf8");
    const end = text.lastIndexOf("\n");
    if (end < 0) return false;
    offsets.set(file, from + Buffer.byteLength(text.slice(0, end + 1)));
    for (const line of text.slice(0, end).split("\n")) {
      if (!line.includes('"usage"')) continue;
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      const m = e.message;
      if (!m?.usage || !m.id) continue;
      const ts = new Date(e.timestamp || Date.now());
      const u = m.usage;
      // Une réponse s'écrit en plusieurs lignes : on garde la dernière (jetons complets).
      seen.set(m.id, { day: dayKey(ts), ts: ts.getTime(), model: m.model || "", usd: cost(m.model, u), tokens: (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0) });
    }
  } finally {
    fs.closeSync(fd);
  }
  return true;
}

function scan() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  for (const f of listFiles(ROOT, Math.max(monthStart, lastScan - 60_000))) readNew(f);
  lastScan = Date.now();
}

export async function credits() {
  if (Date.now() - lastScan > 2500) {
    scanning ??= new Promise((r) => setImmediate(() => { try { scan(); } finally { scanning = null; r(); } }));
    await scanning;
  }
  const now = new Date();
  const today = dayKey(now);
  const month = today.slice(0, 7);
  let t = 0, m = 0, h = 0, tokToday = 0, last = 0;
  const byModel = {};
  for (const v of seen.values()) {
    if (!v.day.startsWith(month)) continue;
    m += v.usd;
    if (v.day === today) {
      t += v.usd;
      tokToday += v.tokens;
      const k = /opus/.test(v.model) ? "Opus" : /sonnet/.test(v.model) ? "Sonnet" : /haiku/.test(v.model) ? "Haiku" : /fable/.test(v.model) ? "Fable" : "Autre";
      byModel[k] = (byModel[k] || 0) + v.usd;
    }
    if (now - v.ts < 3_600_000) h += v.usd;
    last = Math.max(last, v.ts);
  }
  return { today: t, month: m, lastHour: h, tokensToday: tokToday, byModel, lastActivity: last ? new Date(last).toISOString() : null, at: now.toISOString() };
}
