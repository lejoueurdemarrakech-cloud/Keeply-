import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getConfig } from "./config.js";
import { HOME } from "./store.js";

/* ============================================================
   Claude Code (CLI `claude`, abonnement du Mac), en deux modes :

   1. Assistant (voix) : UN processus gardé chaud en permanence
      (--input-format stream-json). On ne paie pas le démarrage à
      chaque question : premier mot en ~1,4 s au lieu de ~7 s.
      Sans plugins ni serveurs MCP (--setting-sources local
      --strict-mcp-config) : 5× moins de contexte, donc plus rapide
      et moins cher. Outils : recherche web et lecture de pages.

   2. Agent (« comme dans le terminal ») : un processus par tâche,
      avec les vrais outils de Claude Code dans tes dossiers.
      Lecture et recherche libres ; écrire un fichier ou lancer une
      commande non listée demande ton accord (bouton ou « oui »),
      puis la tâche reprend là où elle s'était arrêtée.
   ============================================================ */

const WORKSPACE = path.join(HOME, "workspace");
fs.mkdirSync(WORKSPACE, { recursive: true });
const FAST_FLAGS = ["--setting-sources", "local", "--strict-mcp-config"];
/** Limite d'usage de l'abonnement Claude (ex. « 5-hour limit · resets 7:40am »). */
/** Claude Code connecté sur ce Mac ? (vérifié au démarrage du serveur) */
export const claudeAuth = { ok: null };
export const LOGIN_HELP = "Claude n'est pas connecté sur ce Mac. Ouvre le Terminal, tape claude, puis /login, et je serai prêt.";
export function checkAuth() {
  return new Promise((resolve) => {
    const c = spawn(bin(), ["-p", "Réponds juste ok", "--model", "haiku", "--output-format", "json", ...FAST_FLAGS], { cwd: WORKSPACE, env: process.env });
    let out = "";
    c.stdout.on("data", (d) => (out += d));
    c.on("error", () => resolve((claudeAuth.ok = false)));
    c.on("close", () => {
      try {
        const r = JSON.parse(out);
        claudeAuth.ok = !(r.is_error && /^not logged in/i.test(String(r.result).trim()));
      } catch {
        claudeAuth.ok = false;
      }
      resolve(claudeAuth.ok);
    });
    setTimeout(() => c.kill(), 30_000);
  });
}
export const usageLimit = { message: "", resets: "", at: 0 };
export function noteLimit(text) {
  const t = String(text || "");
  if (!/^(you'?ve hit your|claude (ai )?usage limit|.{0,40}(5-hour|weekly) limit)/i.test(t.trim())) return false;
  usageLimit.message = t.slice(0, 200);
  usageLimit.resets = (t.match(/resets? (?:at )?([0-9:apm ]+(?:\([^)]+\))?)/i) || [])[1]?.trim() || "";
  usageLimit.at = Date.now();
  return true;
}
const bin = () => process.env.JARVIS_CLAUDE_BIN || getConfig().claudeBin || "claude";

function lines(stream, onLine) {
  let buf = "";
  stream.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const l = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (l) {
        try {
          onLine(JSON.parse(l));
        } catch {}
      }
    }
  });
}

/** Branche les événements de flux de Claude sur des rappels simples. */
function route(ev, h) {
  if (ev.type === "stream_event") {
    const e = ev.event || {};
    if (e.type === "message_start") h.onMessage?.();
    else if (e.type === "content_block_start" && /tool_use/.test(e.content_block?.type || "")) h.onTool?.(e.content_block.name);
    else if (e.type === "content_block_delta" && e.delta?.type === "text_delta") h.onText?.(e.delta.text);
  } else if (ev.type === "assistant") {
    for (const b of ev.message?.content || []) if (/tool_use/.test(b.type)) h.onToolInput?.(b.name, b.input);
  } else if (ev.type === "user") {
    for (const b of ev.message?.content || []) if (b.type === "tool_result") h.onToolResult?.(typeof b.content === "string" ? b.content : JSON.stringify(b.content), !!b.is_error);
  }
}

/* ---------------- 1. Assistant gardé chaud ---------------- */

const ASSIST_TOOLS = "WebSearch,WebFetch";
const ASSIST_DENY = "Bash,Edit,Write,MultiEdit,NotebookEdit,Read,Glob,Grep,Task,TodoWrite,KillShell,BashOutput";

class Warm {
  child = null;
  sessionId = null;
  turns = 0;
  usedAt = 0;
  system = "";
  model = "";
  current = null; // { resolve, reject, h, text, timer }
  ready = false;

  configure(system, model) {
    if (system !== this.system || model !== this.model) {
      this.system = system;
      this.model = model;
      this.restart(false);
    }
  }

  spawn(resume) {
    const args = ["-p", "--input-format", "stream-json", "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--model", this.model, ...FAST_FLAGS,
      "--append-system-prompt", this.system, "--allowedTools", ASSIST_TOOLS, "--disallowedTools", ASSIST_DENY];
    if (resume) args.push("--resume", resume);
    const child = spawn(bin(), args, { cwd: WORKSPACE, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
    this.child = child;
    this.turns = 0;
    let stderr = "";
    child.stderr.on("data", (d) => (stderr = (stderr + d).slice(-3000)));
    lines(child.stdout, (ev) => {
      if (child !== this.child) return;
      // Pas connecté : Claude répond tout de suite par une erreur, on la remonte sans attendre.
      // Seulement une vraie erreur de Claude (jamais le texte d'une réponse, qui peut venir du web).
      if (ev.type === "result" && ev.is_error && /^not logged in/i.test(String(ev.result).trim())) claudeAuth.ok = false;
      if (ev.session_id) this.sessionId = ev.session_id;
      const c = this.current;
      if (!c) return;
      route(ev, { ...c.h, onText: (t) => ((c.text += t), c.h.onText?.(t)) });
      if (ev.type === "result") {
        this.current = null;
        clearTimeout(c.timer);
        this.turns++;
        if (ev.is_error) (noteLimit(ev.result), c.reject(new Error(ev.result || "Erreur de Claude")));
        else c.resolve({ text: String(ev.result ?? c.text), sessionId: this.sessionId, costUsd: Number(ev.total_cost_usd) || 0 });
      }
    });
    child.on("error", (e) => {
      if (child !== this.child) return;
      this.child = null;
      this.current?.reject(e.code === "ENOENT" ? new Error("Claude Code est introuvable (commande « claude »).") : e);
      this.current = null;
    });
    child.on("close", (code) => {
      if (child !== this.child) return;
      this.child = null;
      if (this.current) {
        const c = this.current;
        this.current = null;
        clearTimeout(c.timer);
        c.reject(new Error(stderr.trim().split("\n").slice(-2).join(" ") || `Claude s'est arrêté (code ${code}).`));
      }
    });
  }

  /** Démarre le processus à l'avance pour que la première question soit rapide. */
  warm() {
    if (!this.child && this.system) this.spawn(null);
  }

  restart(keep = true) {
    const old = this.child;
    this.child = null;
    old?.kill("SIGTERM");
    if (!keep) this.sessionId = null;
    this.current = null;
  }

  ask(prompt, h, signal) {
    // Conversation trop longue ou trop ancienne : on repart frais (plus rapide, moins cher).
    if (this.turns >= 30 || (this.usedAt && Date.now() - this.usedAt > 40 * 60_000)) this.restart(false);
    if (!this.child) this.spawn(null);
    this.usedAt = Date.now();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.restart(true);
        reject(new Error("Claude met trop de temps à répondre."));
      }, 150_000);
      this.current = { resolve, reject, h, text: "", timer };
      signal?.addEventListener("abort", () => {
        if (this.current?.timer === timer) {
          clearTimeout(timer);
          this.current = null;
          // On coupe la réponse en cours et on relance un processus qui reprend la conversation.
          const sid = this.sessionId;
          this.restart(true);
          this.spawn(sid);
          reject(new Error("annulé"));
        }
      }, { once: true });
      this.child.stdin.write(JSON.stringify({ type: "user", message: { role: "user", content: prompt } }) + "\n");
    });
  }
}

export const assistant = new Warm();

/** Question ponctuelle (widgets) : processus court, sans conversation. */
export function runOnce({ prompt, system, model }) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin(), ["-p", "--output-format", "json", "--model", model || getConfig().model, ...FAST_FLAGS, "--append-system-prompt", system, "--allowedTools", ASSIST_TOOLS, "--disallowedTools", ASSIST_DENY], { cwd: WORKSPACE, env: process.env });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.on("error", reject);
    child.on("close", () => {
      try {
        const r = JSON.parse(out);
        r.is_error ? reject(new Error(r.result)) : resolve({ text: String(r.result), costUsd: r.total_cost_usd });
      } catch {
        reject(new Error("Réponse illisible de Claude."));
      }
    });
    child.stdin.end(prompt);
    setTimeout(() => child.kill(), 120_000);
  });
}

/* ---------------- 2. Agent (terminal) ---------------- */

const H = os.homedir();
// ~/Jarvis : dossier de travail de l'agent (les fichiers qu'il crée). Documents et Téléchargements
// sont protégés par macOS : l'agent y accède seulement si Claude Code a reçu l'autorisation du Mac.
export const JARVIS_DIR = path.join(H, "Jarvis");
fs.mkdirSync(JARVIS_DIR, { recursive: true });
export const AGENT_DIRS = [JARVIS_DIR, path.join(H, "Projet App"), path.join(H, "Outils"), path.join(H, "Documents"), path.join(H, "Downloads")].filter((d) => fs.existsSync(d));
// Sans demander : lire, chercher, et quelques commandes sans danger.
// Seulement des commandes qui ne peuvent ni écrire, ni exécuter autre chose, ni sortir du Mac.
// L'agent n'a PAS accès au web : rien de ce qu'il lit ne peut partir sur Internet.
const AGENT_ALLOW = [
  "Read", "Glob", "Grep", "LS", "TodoWrite",
  "Bash(ls:*)", "Bash(pwd)", "Bash(date)", "Bash(whoami)", "Bash(sw_vers)", "Bash(df -h)", "Bash(du -sh:*)", "Bash(wc -l:*)",
  "Bash(git status)", "Bash(git branch)", "Bash(git log --oneline -20)",
  "Bash(node -v)", "Bash(uptime)",
];
// Jamais, même avec accord.
const SECRET_READS = [".ssh/**", ".jarvis/**", ".claude/**", "Outils/keeply-pont/**", "Library/**"].map((p) => `Read(/${path.join(H, p)})`).concat(["Read(**/.env)", "Read(**/.env.*)", "Read(**/*.pem)", "Read(**/*.p8)", "Read(**/*.key)"]);
const AGENT_DENY = [...SECRET_READS, "WebSearch", "WebFetch", "Bash(env:*)", "Bash(printenv:*)", "Bash(python:*)", "Bash(python3:*)", "Bash(node -e:*)", "Bash(bash -c:*)", "Bash(sh -c:*)", "Bash(zsh -c:*)", "Bash(eval:*)", "Bash(launchctl:*)", "Bash(crontab:*)", "Bash(rm -rf:*)", "Bash(sudo:*)", "Bash(git push --force:*)", "Bash(curl:*)", "Bash(wget:*)", "Bash(nc:*)", "Bash(scp:*)", "Bash(ssh:*)", "Bash(shutdown:*)", "Bash(reboot:*)", "Bash(diskutil:*)", "Bash(security:*)", "Bash(osascript:*)"];

/**
 * Lance une tâche d'agent. `extraAllow` : règles accordées pour cette reprise
 * (ex. "Bash(npm run build)" ou "Write"). Renvoie le texte final et les refus éventuels.
 */
export function runAgent({ prompt, system, resume, extraAllow = [], h = {}, signal }) {
  const cfg = getConfig();
  return new Promise((resolve, reject) => {
    const args = ["-p", "--output-format", "stream-json", "--verbose", "--include-partial-messages", "--model", cfg.agentModel || "sonnet", ...FAST_FLAGS,
      "--append-system-prompt", system, "--allowedTools", [...AGENT_ALLOW, `Edit(/${JARVIS_DIR}/**)`, ...extraAllow].join(","), "--disallowedTools", AGENT_DENY.join(","), "--max-turns", "40"];
    for (const d of AGENT_DIRS) args.push("--add-dir", d);
    if (resume) args.push("--resume", resume);
    const child = spawn(bin(), args, { cwd: AGENT_DIRS[0] || H, env: process.env, stdio: ["pipe", "pipe", "pipe"] });
    let text = "";
    let sessionId = resume || null;
    let final = null;
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), 15 * 60_000);
    signal?.addEventListener("abort", () => child.kill("SIGTERM"), { once: true });
    child.stderr.on("data", (d) => (stderr = (stderr + d).slice(-3000)));
    lines(child.stdout, (ev) => {
      if (ev.session_id) sessionId = ev.session_id;
      route(ev, { ...h, onText: (t) => ((text += t), h.onText?.(t)), onMessage: () => ((text = ""), h.onMessage?.()) });
      if (ev.type === "result") final = ev;
    });
    child.on("error", (e) => (clearTimeout(timer), reject(e)));
    child.on("close", (code) => {
      clearTimeout(timer);
      if (signal?.aborted) return reject(new Error("annulé"));
      if (!final) return reject(new Error(stderr.trim().split("\n").slice(-2).join(" ") || `L'agent s'est arrêté (code ${code}).`));
      if (final.is_error) {
        noteLimit(final.result);
        return reject(new Error(String(final.result || "L'agent a échoué.")));
      }
      const denials = (final.permission_denials || []).map((d) => ({ tool: d.tool_name, input: d.tool_input }));
      resolve({ text: String(final.result ?? text), sessionId, costUsd: Number(final.total_cost_usd) || 0, denials, isError: !!final.is_error });
    });
    child.stdin.end(prompt);
  });
}

/** Règle d'autorisation la plus étroite possible pour un refus donné. */
// Caractères qui changeraient le sens d'une règle (« , » sépare les règles, « * » et « : » font des jokers,
// les parenthèses ferment la règle) : une commande qui en contient n'est jamais accordée en règle.
const UNSAFE_RULE = /[,()*\n\r`]|:\s*$/;
export function ruleFor(d) {
  if (d.tool === "Bash" && d.input?.command) {
    const cmd = String(d.input.command).trim();
    return cmd.length <= 400 && !UNSAFE_RULE.test(cmd) ? `Bash(${cmd})` : null;
  }
  // Écriture : seulement le fichier montré dans la demande d'accord (chemin absolu → « // »).
  if (/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(d.tool) && d.input?.file_path) {
    const f = path.normalize(String(d.input.file_path));
    // Le Mac ne distingue pas les majuscules et suit les liens : on compare le vrai chemin, en minuscules.
    let real = f;
    try {
      real = path.join(fs.realpathSync(path.dirname(f)), path.basename(f));
    } catch {
      return null; // dossier inexistant ou illisible : pas d'accord en bloc
    }
    // Le fichier lui-même ne doit pas être un raccourci vers ailleurs.
    try {
      if (fs.lstatSync(f).isSymbolicLink()) return null;
    } catch {} // fichier pas encore créé : normal
    // Caractères simples seulement : rien que Claude Code puisse lire comme un motif (#, !, \, *, ?, [ ]…).
    if (!/^[\p{L}\p{N} ._@+\/-]+$/u.test(f)) return null;
    const low = real.toLowerCase();
    // Seulement un fichier précis (aucun joker), dans les dossiers de l'agent, jamais un fichier caché
    // ni un secret : impossible d'écrire un fichier de démarrage (~/Library, .zshrc, LaunchAgents…).
    const inside = AGENT_DIRS.some((dir) => low.startsWith(fs.realpathSync(dir).toLowerCase() + path.sep));
    const safe = real === f && inside && !/[,()*?[\]{}\n\r`!]/.test(f) && !/(^|\/)\.[^/]/.test(low.slice(H.length)) && !/keeply-pont|\.env|\.pem$|\.key$|launchagents|\/library\//.test(low);
    return safe ? `Edit(/${f})` : null; // « Edit(//chemin) » couvre aussi Write (vérifié avec Claude Code 2.1)
  }
  return null; // autre outil : on ne l'accorde pas en bloc
}

/** Vérifie que la CLI répond (au démarrage, pour le HUD). */
export function claudeVersion() {
  return new Promise((resolve) => {
    const c = spawn(bin(), ["--version"], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    c.stdout.on("data", (d) => (out += d));
    c.on("error", () => resolve(null));
    c.on("close", () => resolve(out.trim() || null));
    setTimeout(() => c.kill(), 8000);
  });
}
