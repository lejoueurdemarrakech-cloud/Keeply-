import { NextResponse } from "next/server";
import { aiErrorMessage } from "@/lib/ai";
import { draftFor } from "@/lib/prospects";

export const maxDuration = 300;
export async function POST(req: Request) {
  try {
    const { ids } = (await req.json()) as { ids: string[] };
    return NextResponse.json(await draftFor(ids.slice(0, 40)));
  } catch (e) {
    return NextResponse.json({ error: aiErrorMessage(e) }, { status: 400 });
  }
}
