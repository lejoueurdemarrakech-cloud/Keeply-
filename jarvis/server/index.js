import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FEEDS, applyUi, askAgent, askClaude, forget, getMemory, instant, isAgentTask, news, pendingApproval, proposeAgent, refreshWidget, remember, resetSession, resolveApproval, runActions, warmUp, weather } from "./brain.js";
import { credits } from "./credits.js";
import { startStt, sttState, transcribe } from "./stt.js";
import { checkAuth, claudeAuth, usageLimit } from "./claude.js";
import { claudeVersion } from "./claude.js";
import { getConfig, publicConfig, updateConfig } from "./config.js";
import { hqConfigured, hqSnapshot } from "./hq.js";
import { getLayout, saveLayout } from "./layout.js";
import { HOME } from "./store.js";
import { systemStats } from "./system.js";
import { macVoices, pruneAudio, speak } from "./tts.js";

/* ============================================================
   Serveur local de Jarvis : http://127.0.0.1:4777
   N'écoute que sur le Mac lui-même (pas sur le réseau).
   ============================================================ */

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "ui", "dist");
const cfg = getConfig();
const PORT = Number(process.env.JARVIS_PORT || cfg.port || 4777);
let claudeInfo = null;
let lastSeen = 0;
let busy = null; // demande en cours (une seule à la fois)
// Jeton tiré au hasard à chaque démarrage : seule l'interface de Jarvis (même origine) peut le lire,
// et chaque ordre (POST, DELETE) doit le présenter. Une page web d'un autre site ne peut ni le lire
// (pas de CORS) ni envoyer l'en-tête sans pré-vérification (refusée).
const TOKEN = crypto.randomBytes(24).toString("hex");

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2", ".woff": "font/woff", ".json": "application/json", ".ico": "image/x-icon" };

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
}

async function body(req) {
  let raw = "";
  for await (const c of req) {
    raw += c;
    if (raw.length > 1_000_000) throw new Error("Requête trop grande");
  }
  return raw ? JSON.parse(raw) : {};
}

function serveStatic(req, res) {
  const url = new URL(req.url, "http://x");
  let file = path.normalize(path.join(DIST, decodeURIComponent(url.pathname)));
  if (!file.startsWith(DIST)) return send(res, 403, { error: "interdit" });
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, "index.html");
  if (!fs.existsSync(file)) return send(res, 503, "Interface non compilée : lance « npm run build » dans le dossier jarvis.", "text/plain; charset=utf-8");
  const ext = path.extname(file);
  res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream", "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=31536000, immutable" });
  fs.createReadStream(file).pipe(res);
}

/** Flux d'événements (SSE) pour une demande. */
async function ask(req, res) {
  const { text } = await body(req);
  const q = String(text || "").trim().slice(0, 2000);
  if (!q) return send(res, 400, { error: "Demande vide." });
  res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
  const emit = (ev) => res.write(`data: ${JSON.stringify(ev)}\n\n`);
  busy?.abort();
  const ac = new AbortController();
  busy = ac;
  req.on("close", () => {
    if (!res.writableEnded) ac.abort();
  });
  const t0 = Date.now();
  const n = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const finish = async (r, via) => {
    if (r.view) emit({ type: "view", view: r.view });
    if (r.ui) {
      const l = applyUi(r.ui);
      if (l) emit({ type: "layout", layout: l });
    }
    const done = await runActions(r.actions);
    const agentTask = done.find((d) => d && typeof d === "object" && d.agent)?.agent;
    emit({ type: "done", say: r.say, done: done.filter((d) => !(d && d.agent)), via, focus: r.focus ?? null, costUsd: r.costUsd, ms: Date.now() - t0, approval: !!r.approval });
    return agentTask;
  };
  try {
    // Réponse à une demande d'accord de l'agent
    // Seuls un « oui » ou un « non » courts et clairs comptent (« ok merci » n'autorise rien).
    if (pendingApproval() && /^(oui|oui vas y|vas y|autorise|j autorise|d accord|confirme|oui confirme|non|non merci|annule|refuse|stop)$/.test(n)) {
      const yes = !/^(non|annule|refuse|stop)/.test(n);
      await finish(await resolveApproval(yes, emit, ac.signal), "agent");
      return res.end();
    }
    const fast = await instant(q);
    if (fast) {
      if (fast.stop) emit({ type: "stop" });
      if (fast.home) emit({ type: "home" });
      if (fast.say) emit({ type: "sentence", text: fast.say });
      await finish(fast, "instant");
      return res.end();
    }
    if (isAgentTask(n)) {
      await finish(await askAgent(q.replace(/^(agent|mode agent|en mode terminal)[ ,:]*/i, ""), emit, ac.signal), "agent");
      return res.end();
    }
    const r = await askClaude(q, emit, ac.signal);
    const delegated = await finish(r, "claude");
    // L'assistant lit des pages web : il ne lance jamais l'agent lui-même, il demande.
    if (delegated) await finish(proposeAgent(delegated, emit), "agent");
  } catch (e) {
    const msg = String(e.message || "Erreur");
    if (!ac.signal.aborted) {
      if (usageLimit.at && Date.now() - usageLimit.at < 5000) {
        const when = usageLimit.resets ? ` Ça repart à ${usageLimit.resets.replace(/\s*\(.*\)/, "").replace(/(\d+):(\d+)\s*am/i, "$1 h $2").replace(/(\d+):(\d+)\s*pm/i, (_, h, m) => `${Number(h) + 12} h ${m}`)}.` : "";
        emit({ type: "error", text: `J'ai atteint la limite de Claude pour l'instant.${when} Les réponses instantanées, Keeply, la météo et les matchs marchent toujours.` });
      } else emit({ type: "error", text: msg });
    }
  } finally {
    if (busy === ac) busy = null;
    res.end();
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const p = url.pathname;
  // Protection simple : refuse les requêtes venues d'un autre site (le serveur n'écoute déjà que sur le Mac).
  // Refuse aussi un nom d'hôte détourné (DNS rebinding) : seul 127.0.0.1 / localhost est accepté.
  if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(req.headers.host || "")) return send(res, 403, { error: "hôte refusé" });
  const origin = req.headers.origin;
  if (origin && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin)) return send(res, 403, { error: "origine refusée" });
  try {
    if (!p.startsWith("/api/")) return serveStatic(req, res);
    if (req.method === "OPTIONS") return send(res, 403, { error: "interdit" });
    if (p === "/api/token" && req.method === "GET") {
      // Lisible seulement depuis la même origine (navigateur) : la page de Jarvis.
      if (req.headers["sec-fetch-site"] && req.headers["sec-fetch-site"] !== "same-origin") return send(res, 403, { error: "interdit" });
      return send(res, 200, { token: TOKEN });
    }
    if (req.method !== "GET") {
      const t = String(req.headers["x-jarvis-token"] || "");
      const okToken = t.length === TOKEN.length && crypto.timingSafeEqual(Buffer.from(t), Buffer.from(TOKEN));
      const ct = String(req.headers["content-type"] || "");
      const okType = p === "/api/stt" ? /application\/octet-stream/.test(ct) : /application\/json/.test(ct);
      if (!okToken || !okType) return send(res, 403, { error: "jeton manquant" });
    }
    lastSeen = Date.now();
    if (p === "/api/state" && req.method === "GET") {
      const c = getConfig();
      const [hq, w, n, sys] = await Promise.all([hqSnapshot(url.searchParams.has("force")), weather(c.city), news(c.feeds), systemStats()]);
      return send(res, 200, {
        at: new Date().toISOString(),
        config: publicConfig(),
        layout: getLayout(),
        hq: hq.ok ? { ok: true, stale: !!hq.stale, ...hq.data, error: hq.error } : { ok: false, error: hq.error },
        weather: w,
        news: n,
        system: sys,
        memory: getMemory(),
        claude: claudeInfo,
        claudeLogin: claudeAuth.ok,
        stt: sttState,
        feeds: Object.fromEntries(Object.entries(FEEDS).map(([k, v]) => [k, v.label])),
      });
    }
    if (p === "/api/system") return send(res, 200, await systemStats());
    if (p === "/api/credits") return send(res, 200, { ...(await credits()), limit: usageLimit.at && Date.now() - usageLimit.at < 5 * 3600_000 ? usageLimit : null });
    if (p === "/api/approval") return send(res, 200, { pending: pendingApproval()?.items || null });
    if (p === "/api/ask" && req.method === "POST") return ask(req, res);
    if (p === "/api/stt" && req.method === "POST") {
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > 16000 * 2 * 40) return send(res, 413, { error: "Extrait trop long (40 s maximum)." });
        chunks.push(c);
      }
      return send(res, 200, await transcribe(Buffer.concat(chunks)));
    }
    if (p === "/api/cancel" && req.method === "POST") {
      busy?.abort();
      return send(res, 200, { ok: true });
    }
    if (p === "/api/tts" && req.method === "GET") {
      const out = await speak(url.searchParams.get("text") || "", getConfig().voice);
      res.writeHead(200, { "Content-Type": out.type, "Cache-Control": "no-store", "Content-Length": out.buf.length });
      return res.end(out.buf);
    }
    if (p === "/api/config" && req.method === "POST") return send(res, 200, (updateConfig(await body(req)), publicConfig()));
    if (p === "/api/voices") return send(res, 200, { mac: await macVoices() });
    if (p === "/api/layout" && req.method === "POST") return send(res, 200, saveLayout(await body(req)));
    if (p === "/api/ui" && req.method === "POST") return send(res, 200, applyUi(await body(req)) ?? getLayout());
    if (p.startsWith("/api/widget/") && req.method === "POST") return send(res, 200, await refreshWidget(decodeURIComponent(p.split("/")[3])));
    if (p === "/api/memory" && req.method === "POST") return send(res, 200, remember((await body(req)).text));
    if (p === "/api/memory" && req.method === "DELETE") return send(res, 200, forget(url.searchParams.get("id")));
    if (p === "/api/session" && req.method === "DELETE") return send(res, 200, (resetSession(), { ok: true }));
    return send(res, 404, { error: "introuvable" });
  } catch (e) {
    return send(res, 500, { error: e.message || "Erreur" });
  }
});

/* Widgets générés : rafraîchis en arrière-plan, seulement si l'écran est ouvert. */
setInterval(async () => {
  if (busy || Date.now() - lastSeen > 3 * 60_000) return;
  const every = getConfig().widgetRefreshMin * 60_000;
  const stale = getLayout().widgets.find((w) => w.kind === "custom" && w.prompt && (!w.updatedAt || Date.now() - new Date(w.updatedAt).getTime() > every));
  if (stale) await refreshWidget(stale.id).catch(() => undefined);
}, 5 * 60_000).unref();
setInterval(pruneAudio, 60 * 60_000).unref();

server.listen(PORT, "127.0.0.1", async () => {
  claudeInfo = await claudeVersion();
  console.log(`Jarvis prêt sur http://127.0.0.1:${PORT}  (données : ${HOME})`);
  console.log(claudeInfo ? `Claude Code : ${claudeInfo}` : "Claude Code introuvable : les questions libres ne marcheront pas.");
  if (!hqConfigured()) console.log("Keeply HQ n'est pas configuré : ouvre les réglages de Jarvis.");
  // Tout est prêt avant la première question : Claude démarré, chiffres HQ et météo en cache.
  startStt();
  // Connecté ? (sinon Jarvis explique quoi faire au lieu d'attendre)
  if (claudeInfo && (await checkAuth())) warmUp();
  void hqSnapshot(true).catch(() => undefined);
  void weather(getConfig().city).catch(() => undefined);
  void credits().catch(() => undefined);
});
// Garde les chiffres HQ frais en mémoire : les questions Keeply répondent sans attendre le réseau.
setInterval(() => void hqSnapshot(true).catch(() => undefined), 60_000).unref();
