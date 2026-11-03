import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getConfig } from "./config.js";
import { HOME } from "./store.js";

/*
 * Appelle Claude Code (CLI `claude`, abonnement du Mac) en mode non interactif.
 * - Outils autorisés : recherche web et lecture de pages, rien d'autre
 *   (pas de commandes, pas d'accès aux fichiers du Mac).
 * - Dossier de travail vide (~/.jarvis/workspace) : Claude ne voit aucun projet.
 * - Sortie en flux : le texte arrive au fil de l'eau pour parler plus tôt.
 */

const WORKSPACE = path.join(HOME, "workspace");
fs.mkdirSync(WORKSPACE, { recursive: true });

const ALLOWED = "WebSearch,WebFetch";
const DENIED = "Bash,Edit,Write,MultiEdit,NotebookEdit,Read,Glob,Grep,Task,TodoWrite,KillShell,BashOutput";
let partialSupported = true;

function args({ system, model, resume, partial }) {
  const a = ["-p", "--output-format", "stream-json", "--verbose", "--model", model, "--append-system-prompt", system, "--allowedTools", ALLOWED, "--disallowedTools", DENIED, "--max-turns", "12"];
  if (partial) a.push("--include-partial-messages");
  if (resume) a.push("--resume", resume);
  return a;
}

/**
 * @param {{prompt:string, system:string, model?:string, resume?:string|null,
 *   onText?:(t:string)=>void, onMessage?:()=>void, onTool?:(name:string, input?:any)=>void,
 *   signal?:AbortSignal, timeoutMs?:number}} o
 * @returns {Promise<{text:string, sessionId:string|null, costUsd:number, durationMs:number}>}
 */
export function runClaude(o) {
  const cfg = getConfig();
  const bin = process.env.JARVIS_CLAUDE_BIN || cfg.claudeBin || "claude";
  const once = (partial) =>
    new Promise((resolve, reject) => {
      const child = spawn(bin, args({ system: o.system, model: o.model || cfg.model, resume: o.resume, partial }), { cwd: WORKSPACE, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
      let buf = "";
      let stderr = "";
      let sessionId = null;
      let final = null;
      let streamed = "";
      const timer = setTimeout(() => child.kill("SIGTERM"), o.timeoutMs ?? 180_000);
      const abort = () => child.kill("SIGTERM");
      o.signal?.addEventListener("abort", abort, { once: true });

      const onLine = (line) => {
        let ev;
        try {
          ev = JSON.parse(line);
        } catch {
          return;
        }
        if (ev.session_id) sessionId = ev.session_id;
        if (ev.type === "stream_event") {
          const e = ev.event || {};
          if (e.type === "message_start") o.onMessage?.();
          else if (e.type === "content_block_start" && /tool_use/.test(e.content_block?.type || "")) o.onTool?.(e.content_block.name);
          else if (e.type === "content_block_delta" && e.delta?.type === "text_delta") {
            streamed += e.delta.text;
            o.onText?.(e.delta.text);
          }
        } else if (ev.type === "assistant" && !partial) {
          // Sans flux partiel : on reçoit chaque message entier.
          o.onMessage?.();
          for (const b of ev.message?.content || []) {
            if (b.type === "text") o.onText?.(b.text);
            else if (/tool_use/.test(b.type)) o.onTool?.(b.name, b.input);
          }
        } else if (ev.type === "result") {
          final = ev;
        }
      };

      child.stdout.on("data", (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (line) onLine(line);
        }
      });
      child.stderr.on("data", (d) => {
        stderr = (stderr + d).slice(-4000);
      });
      child.on("error", (e) => {
        clearTimeout(timer);
        reject(e.code === "ENOENT" ? new Error("Claude Code n'est pas installé ou introuvable (commande « claude »).") : e);
      });
      child.on("close", (code) => {
        clearTimeout(timer);
        o.signal?.removeEventListener("abort", abort);
        if (buf.trim()) onLine(buf.trim());
        if (o.signal?.aborted) return reject(new Error("annulé"));
        if (final && !final.is_error) return resolve({ text: String(final.result ?? streamed), sessionId, costUsd: Number(final.total_cost_usd) || 0, durationMs: Number(final.duration_ms) || 0 });
        const err = new Error(final?.result || stderr.trim().split("\n").slice(-3).join(" ") || `Claude s'est arrêté (code ${code}).`);
        err.stderr = stderr;
        reject(err);
      });
      child.stdin.end(o.prompt);
    });

  return once(partialSupported).catch((e) => {
    // Ancienne version de Claude Code : pas de flux partiel, on réessaie sans.
    if (partialSupported && /include-partial-messages|unknown option/i.test(String(e.stderr || e.message))) {
      partialSupported = false;
      return once(false);
    }
    // Session expirée : on repart sans reprise.
    if (o.resume && /session|resume|conversation/i.test(String(e.message))) return runClaude({ ...o, resume: null });
    throw e;
  });
}

/** Vérifie que la CLI répond (au démarrage, pour le HUD). */
export function claudeVersion() {
  const bin = process.env.JARVIS_CLAUDE_BIN || getConfig().claudeBin || "claude";
  return new Promise((resolve) => {
    const c = spawn(bin, ["--version"], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    c.stdout.on("data", (d) => (out += d));
    c.on("error", () => resolve(null));
    c.on("close", () => resolve(out.trim() || null));
    setTimeout(() => c.kill(), 8000);
  });
}
