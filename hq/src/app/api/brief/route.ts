import { NextResponse } from "next/server";
import { aiErrorMessage } from "@/lib/ai";
import { briefTool } from "@/lib/ai-tools";
import { briefContext, todayOverview } from "@/lib/today";
import { store } from "@/lib/store";

export const maxDuration = 300;

export async function GET() {
  return NextResponse.json((await store.get("brief")) ?? null);
}

export async function POST() {
  try {
    const { brief } = await briefTool(briefContext(await todayOverview()));
    const saved = { brief, at: new Date().toISOString() };
    await store.set("brief", saved);
    return NextResponse.json(saved);
  } catch (e) {
    return NextResponse.json({ error: aiErrorMessage(e) }, { status: 400 });
  }
}
