import { NextResponse } from "next/server";
import { aiErrorMessage } from "@/lib/ai";
import { mailTriageTool } from "@/lib/ai-tools";
import { inbox, updateMailState } from "@/lib/mail";
import type { MailCategory } from "@/lib/types";

export const maxDuration = 120;

export async function POST() {
  try {
    const { items } = await inbox();
    const todo = items.filter((m) => !m.summary && !m.isBulk && !m.done).slice(0, 30);
    if (!todo.length) return NextResponse.json({ triaged: 0 });
    const res = await mailTriageTool(todo.map((m) => ({ id: m.messageId, from: `${m.from.name} <${m.from.email}>`, subject: m.subject, text: m.text.slice(0, 1500) })));
    const known = new Set(todo.map((m) => m.messageId));
    await updateMailState((s) => {
      const ai = { ...s.ai };
      for (const it of res.items) if (known.has(it.id)) ai[it.id] = { priority: it.priority, category: it.category as MailCategory, summary: it.summary, action: it.action };
      return { ...s, ai };
    });
    return NextResponse.json({ triaged: res.items.length });
  } catch (e) {
    return NextResponse.json({ error: aiErrorMessage(e) }, { status: 400 });
  }
}
