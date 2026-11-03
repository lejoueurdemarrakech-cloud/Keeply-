import type { Ev } from "./types";

/** Jeton du serveur local (demandé une fois, envoyé avec chaque ordre). */
let token: Promise<string> | null = null;
const getToken = () => (token ??= fetch("/api/token").then((r) => r.json()).then((d: { token: string }) => d.token).catch(() => ((token = null), "")));
const headers = async () => ({ "Content-Type": "application/json", "X-Jarvis-Token": await getToken() });

export async function post<T = unknown>(url: string, body?: unknown, method = "POST"): Promise<T> {
  const r = await fetch(url, { method, headers: await headers(), body: body === undefined ? undefined : JSON.stringify(body ?? {}) });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((data as { error?: string }).error || `Erreur ${r.status}`);
  return data as T;
}

/** Envoie une demande et lit le flux d'événements au fil de l'eau. */
export async function ask(text: string, onEvent: (e: Ev) => void, signal: AbortSignal) {
  const r = await fetch("/api/ask", { method: "POST", headers: await headers(), body: JSON.stringify({ text }), signal });
  if (!r.ok || !r.body) throw new Error(`Jarvis ne répond pas (${r.status}).`);
  const reader = r.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const line = chunk.split("\n").find((l) => l.startsWith("data: "));
      if (line) {
        try {
          onEvent(JSON.parse(line.slice(6)) as Ev);
        } catch {}
      }
    }
  }
}

/** Envoie un extrait de voix (PCM 16 kHz mono) à la reconnaissance locale. */
export async function stt(pcm: Int16Array): Promise<{ text: string; ms: number }> {
  const h = await headers();
  const r = await fetch("/api/stt", { method: "POST", headers: { ...h, "Content-Type": "application/octet-stream" }, body: pcm.buffer as ArrayBuffer });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { error?: string }).error || `Erreur ${r.status}`);
  return d as { text: string; ms: number };
}
