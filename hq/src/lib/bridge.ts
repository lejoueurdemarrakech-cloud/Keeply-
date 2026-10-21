import "server-only";
import { randomUUID } from "node:crypto";
import { store } from "@/lib/store";

/**
 * Pont avec le Mac du fondateur (~/Outils/keeply-pont).
 * Le pont interroge HQ toutes les 2 s, exécute les demandes d'IA avec la CLI `claude`
 * (abonnement Claude, pas de clé API), pilote Harvey en local et renvoie les résultats.
 * HQ ne contacte jamais le Mac : tout passe par ces clés dans le stockage.
 */

const HEARTBEAT = "bridge:heartbeat";
const JOB = "bridge:job:";
const CMD = "bridge:cmd:";
const HARVEY = "bridge:harvey";
const ONLINE_MS = 180_000;
const JOB_TTL_MS = 10 * 60_000;

export interface BridgeHeartbeat {
  at: string;
  host?: string;
  claude?: string;
  harvey?: { dashboard: boolean; running: boolean };
}

export interface AiJob {
  id: string;
  kind: "ai";
  status: "pending" | "running" | "done" | "error";
  createdAt: number;
  label: string;
  model: string;
  system: string;
  prompt: string;
  schema?: Record<string, unknown>;
  effort?: string;
  result?: string;
  error?: string;
}

/** Ce que coûte un appel, tel que la CLI `claude` le rapporte (coût = équivalent API, pas facturé). */
export interface CallUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  costUsd: number;
  durationMs: number;
}

export interface UsageEntry extends CallUsage {
  id: string;
  at: string;
  label: string;
  model: string;
  source: "hq" | "harvey";
  ok: boolean;
}

export interface UsageDay {
  date: string;
  calls: number;
  costUsd: number;
  tokens: number;
  byLabel: Record<string, { calls: number; costUsd: number; tokens: number }>;
}

export interface QuotaSnapshot {
  at: string;
  /** % utilisé de la fenêtre de 5 h et de la semaine, quand la CLI le donne. */
  fiveHour?: number | null;
  sevenDay?: number | null;
  resetsAt?: string | null;
}

export interface AiBudget {
  dailyMax: number;
  roundHours: number[];
}

export const DEFAULT_BUDGET: AiBudget = { dailyMax: 40, roundHours: [8, 18] };

export type HarveyAction =
  | { action: "start" }
  | { action: "stop" }
  | { action: "approve"; id: string }
  | { action: "approve-all" }
  | { action: "reject"; id: string }
  | { action: "edit"; id: string; subject: string; body: string }
  | { action: "sending"; state: "pause" | "resume" }
  | { action: "profile" }
  | { action: "discover-estimate"; cities: string[] }
  | { action: "discover-run"; cities: string[] };

export interface HarveyCommand {
  id: string;
  status: "pending" | "running" | "done" | "error";
  createdAt: number;
  command: HarveyAction;
  result?: unknown;
  error?: string;
}

export async function heartbeat() {
  return store.get<BridgeHeartbeat>(HEARTBEAT);
}

export async function bridgeOnline() {
  const hb = await heartbeat();
  return !!hb && Date.now() - new Date(hb.at).getTime() < ONLINE_MS;
}

export async function touchHeartbeat(hb: Omit<BridgeHeartbeat, "at">) {
  await store.set(HEARTBEAT, { ...hb, at: new Date().toISOString() });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitFor<T extends { status: string }>(key: string, timeoutMs: number): Promise<T | undefined> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const v = await store.get<T>(key);
    if (!v) return undefined;
    if (v.status === "done" || v.status === "error") return v;
    await sleep(800);
  }
  return store.get<T>(key);
}

const dayKey = (d = new Date()) => d.toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

export async function getBudget() {
  return { ...DEFAULT_BUDGET, ...((await store.get<Partial<AiBudget>>("ai:budget")) ?? {}) };
}

export async function setBudget(b: Partial<AiBudget>) {
  const next = { ...(await getBudget()), ...b };
  next.dailyMax = Math.max(0, Math.min(500, Math.round(Number(next.dailyMax) || 0)));
  next.roundHours = [...new Set((next.roundHours ?? []).map(Number).filter((h) => h >= 0 && h <= 23))].sort((a, b) => a - b);
  await store.set("ai:budget", next);
  return next;
}

export async function usageDay(date = dayKey()) {
  return (await store.get<UsageDay>("usage:day:" + date)) ?? { date, calls: 0, costUsd: 0, tokens: 0, byLabel: {} };
}

/** Enregistre un appel dans le compteur (journal des 300 derniers + total du jour). */
export async function recordUsage(e: Omit<UsageEntry, "id" | "at"> & { at?: string }) {
  const entry: UsageEntry = { ...e, id: randomUUID(), at: e.at ?? new Date().toISOString() };
  const log = (await store.get<UsageEntry[]>("usage:log")) ?? [];
  await store.set("usage:log", [entry, ...log].slice(0, 300));
  const day = await usageDay(dayKey(new Date(entry.at)));
  const tokens = entry.inputTokens + entry.outputTokens + entry.cacheReadTokens + entry.cacheCreationTokens;
  const lab = day.byLabel[entry.label] ?? { calls: 0, costUsd: 0, tokens: 0 };
  day.calls += 1;
  day.costUsd += entry.costUsd;
  day.tokens += tokens;
  day.byLabel[entry.label] = { calls: lab.calls + 1, costUsd: lab.costUsd + entry.costUsd, tokens: lab.tokens + tokens };
  await store.set("usage:day:" + day.date, day);
}

export class BudgetReached extends Error {
  constructor(max: number) {
    super(`Plafond du jour atteint (${max} demandes à Claude). Il repart à zéro à minuit, ou augmente-le dans Crédits Claude.`);
  }
}

/** Envoie une demande d'IA au pont et attend la réponse (texte brut, ou JSON si schéma). */
export async function askBridge(input: { system: string; prompt: string; schema?: Record<string, unknown>; effort?: string; label: string; model: string }, timeoutMs = 270_000) {
  const [budget, today] = await Promise.all([getBudget(), usageDay()]);
  if (today.calls >= budget.dailyMax) throw new BudgetReached(budget.dailyMax);
  const job: AiJob = { id: randomUUID(), kind: "ai", status: "pending", createdAt: Date.now(), ...input };
  await store.set(JOB + job.id, job);
  try {
    const done = await waitFor<AiJob>(JOB + job.id, timeoutMs);
    if (!done || done.status === "pending" || done.status === "running") {
      throw new Error("Le pont Claude sur ton Mac n'a pas répondu à temps. Vérifie que le Mac est allumé.");
    }
    if (done.status === "error") throw new Error(done.error || "Claude a renvoyé une erreur.");
    return done.result ?? "";
  } finally {
    await store.del(JOB + job.id);
  }
}

/** Ordre pour Harvey, exécuté par le pont. Attend le résultat quelques secondes. */
export async function sendHarveyCommand(command: HarveyAction, timeoutMs = 25_000) {
  const cmd: HarveyCommand = { id: randomUUID(), status: "pending", createdAt: Date.now(), command };
  await store.set(CMD + cmd.id, cmd);
  const done = await waitFor<HarveyCommand>(CMD + cmd.id, timeoutMs);
  if (done && (done.status === "done" || done.status === "error")) await store.del(CMD + cmd.id);
  if (!done || done.status === "pending") return { queued: true as const };
  if (done.status === "error") throw new Error(done.error || "Harvey a renvoyé une erreur.");
  return { queued: false as const, result: done.result };
}

/** Ce que le pont vient chercher : demandes en attente, marquées « en cours ». */
export async function claimWork() {
  const now = Date.now();
  const jobs: AiJob[] = [];
  const commands: HarveyCommand[] = [];
  for (const key of await store.keys(JOB)) {
    const j = await store.get<AiJob>(key);
    if (!j) continue;
    if (now - j.createdAt > JOB_TTL_MS) {
      await store.del(key);
      continue;
    }
    if (j.status === "pending") {
      j.status = "running";
      await store.set(key, j);
      jobs.push(j);
    }
  }
  for (const key of await store.keys(CMD)) {
    const c = await store.get<HarveyCommand>(key);
    if (!c) continue;
    if (now - c.createdAt > JOB_TTL_MS) {
      await store.del(key);
      continue;
    }
    if (c.status === "pending") {
      c.status = "running";
      await store.set(key, c);
      commands.push(c);
    }
  }
  return { jobs, commands };
}

export async function finishJob(id: string, out: { result?: string; error?: string; usage?: Partial<CallUsage> }) {
  const j = await store.get<AiJob>(JOB + id);
  if (!j) return;
  await store.set(JOB + id, { ...j, status: out.error ? "error" : "done", result: out.result, error: out.error });
  const u = out.usage ?? {};
  await recordUsage({
    label: j.label,
    model: j.model,
    source: "hq",
    ok: !out.error,
    inputTokens: Number(u.inputTokens) || 0,
    outputTokens: Number(u.outputTokens) || 0,
    cacheReadTokens: Number(u.cacheReadTokens) || 0,
    cacheCreationTokens: Number(u.cacheCreationTokens) || 0,
    costUsd: Number(u.costUsd) || 0,
    durationMs: Number(u.durationMs) || 0,
  });
}

export async function saveQuota(q: Omit<QuotaSnapshot, "at">) {
  await store.set("usage:quota", { ...q, at: new Date().toISOString() });
}

/** Tout ce qu'affiche la page Crédits Claude. */
export async function usageOverview() {
  const days: UsageDay[] = [];
  for (let i = 0; i < 14; i++) days.push(await usageDay(dayKey(new Date(Date.now() - i * 86_400_000))));
  const [log, quota, budget, hb, harvey] = await Promise.all([
    store.get<UsageEntry[]>("usage:log"),
    store.get<QuotaSnapshot>("usage:quota"),
    getBudget(),
    heartbeat(),
    harveySnapshot(),
  ]);
  return { today: days[0], days, log: log ?? [], quota: quota ?? null, budget, bridge: hb ?? null, online: !!hb && Date.now() - new Date(hb.at).getTime() < ONLINE_MS, harveyUsage: harvey?.usage ?? null };
}

export async function finishCommand(id: string, out: { result?: unknown; error?: string }) {
  const c = await store.get<HarveyCommand>(CMD + id);
  if (!c) return;
  await store.set(CMD + id, { ...c, status: out.error ? "error" : "done", result: out.result, error: out.error });
}

export interface HarveySnapshot {
  at: string;
  status?: { running: boolean; started_at?: string | null };
  stats?: Record<string, unknown>;
  outbox?: Record<string, unknown>;
  prospects?: Record<string, unknown>[];
  activity?: Record<string, unknown>[];
  usage?: Record<string, unknown>;
  setup?: Record<string, unknown>;
  error?: string;
}

export async function saveHarveySnapshot(s: Omit<HarveySnapshot, "at">) {
  await store.set(HARVEY, { ...s, at: new Date().toISOString() });
}

export async function harveySnapshot() {
  return store.get<HarveySnapshot>(HARVEY);
}
