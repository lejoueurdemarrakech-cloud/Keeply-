import { getConfig } from "./config.js";

/* Connexion à Keeply HQ (même jeton que le pont du Mac). */

let cache = { at: 0, v: null, error: null };

export const hqConfigured = () => {
  const c = getConfig();
  return !!(c.hqUrl && c.hqToken);
};

export async function hqSnapshot(force = false) {
  const c = getConfig();
  if (!c.hqUrl || !c.hqToken) return { ok: false, error: "HQ n'est pas configuré (adresse et jeton dans les réglages)." };
  if (!force && cache.v && Date.now() - cache.at < 60_000) return { ok: true, data: cache.v };
  try {
    const r = await fetch(`${c.hqUrl}/api/ingest/jarvis`, { headers: { Authorization: `Bearer ${c.hqToken}` }, signal: AbortSignal.timeout(12000) });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(body.error || `HQ a répondu ${r.status}`);
    cache = { at: Date.now(), v: body, error: null };
    return { ok: true, data: body };
  } catch (e) {
    cache.error = String(e.message || e);
    // On garde les dernières données connues plutôt qu'un écran vide.
    return cache.v ? { ok: true, stale: true, data: cache.v, error: cache.error } : { ok: false, error: cache.error };
  }
}

export async function hqAction(type, text) {
  const c = getConfig();
  if (!c.hqUrl || !c.hqToken) throw new Error("HQ n'est pas configuré.");
  const r = await fetch(`${c.hqUrl}/api/ingest/jarvis`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.hqToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ type, text }),
    signal: AbortSignal.timeout(12000),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(body.error || `HQ a répondu ${r.status}`);
  cache.at = 0;
  return body;
}
