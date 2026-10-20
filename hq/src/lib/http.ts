import "server-only";
import { NextResponse } from "next/server";

/** Enveloppe une route d'API : JSON en sortie, erreurs lisibles. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<unknown>) {
  return async (...args: A) => {
    try {
      const data = await fn(...args);
      if (data instanceof Response) return data;
      return NextResponse.json(data ?? { ok: true });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur inconnue";
      console.error("[hq]", message);
      const status = (e as { status?: number }).status ?? 500;
      return NextResponse.json({ error: message }, { status });
    }
  };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** fetch avec délai maximum et message d'erreur explicite. */
export async function fetchJson<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const { timeoutMs = 20000, ...rest } = init;
  const res = await fetch(url, { ...rest, cache: "no-store", signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {}
  if (!res.ok) {
    const msg =
      (body as { error?: { message?: string } })?.error?.message ||
      (body as { errors?: { detail?: string }[] })?.errors?.[0]?.detail ||
      (typeof body === "string" ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200));
    throw new HttpError(res.status, `${new URL(url).host} a répondu ${res.status} : ${msg}`);
  }
  return body as T;
}

export const UA = "KeeplyHQ/1.0 (+https://keeply.app)";
