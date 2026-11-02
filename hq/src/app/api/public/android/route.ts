import { NextResponse } from "next/server";
import { ANDROID_KEY, type AndroidSignup } from "@/lib/android";
import { update } from "@/lib/store";

/** Formulaire public de keeplyfidelity.app/android. */

const ORIGIN = "https://keeplyfidelity.app";
const cors = { "access-control-allow-origin": ORIGIN, "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors });
}

// Formulaire ouvert à tous : 5 envois par heure et par adresse IP (suivi limité à 2 000 adresses à la fois).
const PER_IP = 5;
const MAX_IPS = 2000;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "inconnue";
  const now = Date.now();
  let blocked = false;
  await update<Record<string, number[]>>("android:rate", {}, (m) => {
    const out: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(m)) {
      const recent = v.filter((t) => now - t < 3_600_000);
      if (recent.length) out[k] = recent;
    }
    blocked = (out[ip]?.length ?? 0) >= PER_IP || (!out[ip] && Object.keys(out).length >= MAX_IPS);
    if (!blocked) out[ip] = [...(out[ip] ?? []), now];
    return out;
  });
  if (blocked) return NextResponse.json({ error: "Trop d'envois, réessayez plus tard." }, { status: 429, headers: cors });

  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  // Champ piège invisible sur la page : un humain le laisse vide.
  if (clip(b.website, 200)) return NextResponse.json({ ok: true }, { headers: cors });
  const email = clip(b.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || b.consent !== true) {
    return NextResponse.json({ error: "Adresse ou consentement manquant." }, { status: 400, headers: cors });
  }
  await update<AndroidSignup[]>(ANDROID_KEY, [], (list) =>
    list.some((x) => x.email === email) || list.length >= 20000 ? list : [{ email, type: clip(b.type, 40), city: clip(b.city, 80), at: new Date().toISOString() }, ...list],
  );
  return NextResponse.json({ ok: true }, { headers: cors });
}
