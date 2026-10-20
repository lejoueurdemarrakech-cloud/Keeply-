import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Petit stockage clé → valeur JSON.
 * - En local : un fichier `data/hq-db.json` (ignoré par git).
 * - En ligne (Vercel…) : Upstash Redis via son API REST si
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (ou KV_REST_API_URL / KV_REST_API_TOKEN) sont définis.
 */

type Json = unknown;

interface Backend {
  get<T = Json>(key: string): Promise<T | undefined>;
  set(key: string, value: Json): Promise<void>;
  del(key: string): Promise<void>;
  keys(prefix: string): Promise<string[]>;
}

const DB_FILE = process.env.HQ_DATA_FILE || path.join(process.cwd(), "data", "hq-db.json");

class FileBackend implements Backend {
  private cache: Record<string, Json> | null = null;
  private chain: Promise<void> = Promise.resolve();

  private async load() {
    if (this.cache) return this.cache;
    try {
      this.cache = JSON.parse(await fs.readFile(DB_FILE, "utf8"));
    } catch {
      this.cache = {};
    }
    return this.cache!;
  }

  private persist() {
    const snapshot = JSON.stringify(this.cache);
    this.chain = this.chain.then(async () => {
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      const tmp = DB_FILE + ".tmp";
      await fs.writeFile(tmp, snapshot);
      await fs.rename(tmp, DB_FILE);
    });
    return this.chain;
  }

  async get<T>(key: string) {
    const db = await this.load();
    return structuredClone(db[key]) as T | undefined;
  }
  async set(key: string, value: Json) {
    const db = await this.load();
    db[key] = structuredClone(value);
    await this.persist();
  }
  async del(key: string) {
    const db = await this.load();
    delete db[key];
    await this.persist();
  }
  async keys(prefix: string) {
    const db = await this.load();
    return Object.keys(db).filter((k) => k.startsWith(prefix));
  }
}

class UpstashBackend implements Backend {
  constructor(private url: string, private token: string) {}
  private async cmd<T>(...args: (string | number)[]): Promise<T> {
    const res = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as { result: T; error?: string };
    if (data.error) throw new Error(data.error);
    return data.result;
  }
  async get<T>(key: string) {
    const raw = await this.cmd<string | null>("GET", "hq:" + key);
    return raw == null ? undefined : (JSON.parse(raw) as T);
  }
  async set(key: string, value: Json) {
    await this.cmd("SET", "hq:" + key, JSON.stringify(value));
  }
  async del(key: string) {
    await this.cmd("DEL", "hq:" + key);
  }
  async keys(prefix: string) {
    const out: string[] = [];
    let cursor = "0";
    do {
      const [next, batch] = await this.cmd<[string, string[]]>("SCAN", cursor, "MATCH", `hq:${prefix}*`, "COUNT", 200);
      cursor = next;
      out.push(...batch.map((k) => k.slice(3)));
    } while (cursor !== "0");
    return out;
  }
}

function pickBackend(): Backend {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return new UpstashBackend(url, token);
  return new FileBackend();
}

const g = globalThis as unknown as { __hqStore?: Backend };
export const store: Backend = (g.__hqStore ??= pickBackend());

export const storeKind = () =>
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? "upstash" : "fichier";

/** Lit une valeur, avec valeur par défaut. */
export async function read<T>(key: string, fallback: T): Promise<T> {
  const v = await store.get<T>(key);
  return v === undefined ? fallback : v;
}

const locks = new Map<string, Promise<unknown>>();
/** Met à jour une valeur de façon sérialisée (évite les écritures concurrentes dans le même processus). */
export async function update<T>(key: string, fallback: T, fn: (current: T) => T | Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(async () => {
    const current = await read<T>(key, fallback);
    const value = await fn(current);
    await store.set(key, value);
    return value;
  });
  locks.set(key, next.catch(() => undefined));
  return next as Promise<T>;
}

export const uid = (prefix = "") =>
  prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
