"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error || "Connexion impossible.");
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    window.location.href = next.startsWith("/") ? next : "/";
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-night px-4 text-[#f2eef8]">
      <form onSubmit={submit} className="rise w-full max-w-sm">
        <svg viewBox="0 0 64 64" className="mb-6 size-12" aria-hidden>
          <rect width="64" height="64" rx="16" fill="#6B4AF2" />
          <circle cx="22" cy="24" r="6" fill="#F3BE72" />
          <circle cx="42" cy="24" r="6" fill="#F3BE72" />
          <circle cx="22" cy="42" r="6" fill="#F3BE72" />
          <circle cx="42" cy="42" r="6" fill="none" stroke="#F3BE72" strokeWidth="2.5" strokeDasharray="3 3" />
        </svg>
        <h1 className="font-display text-[30px] leading-tight font-bold">Keeply HQ</h1>
        <p className="mt-1 text-[#b9b1cc]">Ton poste de pilotage. Entre ton mot de passe pour continuer.</p>
        <label className="mt-7 block">
          <span className="sr-only">Mot de passe</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="h-12 w-full rounded-xl border border-[#3a3354] bg-[#1c1730] px-4 text-[15px] text-white outline-none placeholder:text-[#8f88a6] focus:border-[#8b70ff] focus:ring-4 focus:ring-[#8b70ff]/20"
          />
        </label>
        {error && <p className="mt-2 text-[13.5px] text-[#ff8a6e]">{error}</p>}
        <button disabled={loading || !password} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#6B4AF2] font-semibold text-white transition hover:bg-[#7c5dff] active:scale-[0.98] disabled:opacity-50">
          {loading && <Loader2 className="size-4 animate-spin" />}
          Se connecter
        </button>
      </form>
    </main>
  );
}
