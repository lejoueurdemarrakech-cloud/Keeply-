"use client";
import { useCallback, useSyncExternalStore } from "react";

/*
 * Petites préférences gardées dans ce navigateur uniquement (objectifs,
 * filtres). Rien d'important : si le stockage est bloqué, on retombe sur
 * la valeur par défaut.
 */
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export function usePref<T>(key: string, fallback: T): [T, (v: T) => void] {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem("hq-pref:" + key);
      } catch {
        return null;
      }
    },
    () => null,
  );
  let value = fallback;
  if (raw != null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {}
  }
  const set = useCallback(
    (v: T) => {
      try {
        localStorage.setItem("hq-pref:" + key, JSON.stringify(v));
      } catch {}
      listeners.forEach((l) => l());
    },
    [key],
  );
  return [value, set];
}
