import { NextResponse } from "next/server";
import { aiErrorMessage } from "@/lib/ai";
import { DEFAULT_FEEDS, askJarvis, type Personality } from "@/lib/jarvis";
import { getSettings } from "@/lib/settings";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as { text?: string; personality?: Personality; city?: string; feeds?: string[] };
    const text = String(b.text ?? "").trim().slice(0, 2000);
    if (!text) return NextResponse.json({ error: "Demande vide." }, { status: 400 });
    const settings = await getSettings();
    const reply = await askJarvis({
      text,
      personality: (["sobre", "chaleureux", "concis"] as const).includes(b.personality as Personality) ? (b.personality as Personality) : "sobre",
      city: String(b.city || "Paris"),
      feeds: Array.isArray(b.feeds) ? b.feeds.map(String) : DEFAULT_FEEDS,
      owner: settings.ownerName,
    });
    return NextResponse.json(reply);
  } catch (e) {
    return NextResponse.json({ error: aiErrorMessage(e) }, { status: 502 });
  }
}
