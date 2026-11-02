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

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const email = clip(b.email, 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || b.consent !== true) {
    return NextResponse.json({ error: "Adresse ou consentement manquant." }, { status: 400, headers: cors });
  }
  await update<AndroidSignup[]>(ANDROID_KEY, [], (list) =>
    list.some((x) => x.email === email) || list.length >= 5000 ? list : [{ email, type: clip(b.type, 40), city: clip(b.city, 80), at: new Date().toISOString() }, ...list],
  );
  return NextResponse.json({ ok: true }, { headers: cors });
}
