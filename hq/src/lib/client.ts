"use client";
import { useState } from "react";
import useSWR, { mutate as globalMutate, type SWRConfiguration } from "swr";
import { toast } from "sonner";

export class ApiError extends Error {}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 401) {
    // Rechargement complet voulu : la session vient de changer.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login?next=" + encodeURIComponent(window.location.pathname);
    throw new ApiError("Session expirée");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Erreur ${res.status}`);
  return data as T;
}

export function useApi<T>(url: string | null, opts?: SWRConfiguration<T>) {
  return useSWR<T>(url, fetcher, { revalidateOnFocus: false, keepPreviousData: true, ...opts });
}

/** Appel d'API avec message d'erreur automatique. Renvoie null en cas d'échec. */
export async function api<T = unknown>(method: "POST" | "PUT" | "PATCH" | "DELETE", url: string, body?: unknown, opts: { silent?: boolean } = {}): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method,
      headers: body instanceof FormData ? undefined : { "Content-Type": "application/json" },
      body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(data.error || `Erreur ${res.status}`);
    return data as T;
  } catch (e) {
    if (!opts.silent) toast.error(e instanceof Error ? e.message : "Erreur");
    return null;
  }
}

export const refresh = (key: string) => globalMutate(key);

/** Heure figée au premier affichage (évite d'appeler Date.now() pendant le rendu). */
export function useNow() {
  const [now] = useState(() => Date.now());
  return now;
}
