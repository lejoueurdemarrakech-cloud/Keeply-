import { NextResponse } from "next/server";
import { EDGE_VOICES, synthesize, type EdgeVoice } from "@/lib/jarvis";

export const maxDuration = 30;

/** Voix réaliste (Microsoft Edge). En cas d'échec, l'interface bascule sur la voix du Mac. */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const text = (p.get("text") ?? "").trim();
  const voice = (p.get("voice") ?? "") as EdgeVoice;
  if (!text) return NextResponse.json({ error: "Texte vide." }, { status: 400 });
  if (!(voice in EDGE_VOICES)) return NextResponse.json({ error: "Voix inconnue." }, { status: 400 });
  try {
    const audio = await synthesize(text, voice, Math.max(-30, Math.min(40, Number(p.get("rate") || 0))));
    return new NextResponse(new Uint8Array(audio), { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=86400" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Voix indisponible." }, { status: 502 });
  }
}
