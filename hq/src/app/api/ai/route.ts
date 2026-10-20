import { NextResponse } from "next/server";
import { aiErrorMessage } from "@/lib/ai";
import * as tools from "@/lib/ai-tools";
import { analyze, instagramOverview } from "@/lib/instagram";

export const maxDuration = 120;

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

async function igContext() {
  const o = await instagramOverview();
  const a = analyze(o);
  return [
    `Abonnés : ${o.account.followers} (${a.followersGained7 >= 0 ? "+" : ""}${a.followersGained7} sur 7 jours, ${a.followersGainedPrev7} la semaine d'avant)`,
    `Rythme : ${a.postsPerWeek.toFixed(1)} posts / semaine. Taux d'engagement moyen : ${(a.engagementRate * 100).toFixed(2)} %`,
    `Formats : ${a.formats.map((f) => `${f.type} portée moy. ${f.avgReach}, engagement moy. ${f.avgEngagement}`).join(" ; ")}`,
    `Meilleurs créneaux observés : ${a.best.map((b) => `${DAYS[b.day]} ${b.hour}h`).join(", ") || "pas assez de données"}`,
    `Top posts : ${a.top.map((t) => `« ${t.caption.slice(0, 70)} » (${t.type}, portée ${t.reach}, ${t.saves} enregistrements)`).join(" | ")}`,
  ].join("\n");
}

export async function POST(req: Request) {
  try {
    const { tool, input = {} } = (await req.json()) as { tool: string; input: Record<string, unknown> };
    const i = input as never;
    switch (tool) {
      case "caption":
        return NextResponse.json(await tools.captionTool(i));
      case "ideas":
        return NextResponse.json(await tools.ideasTool({ ...(input as object), context: await igContext() }));
      case "hooks":
        return NextResponse.json(await tools.hooksTool(i));
      case "hashtags":
        return NextResponse.json(await tools.hashtagsTool(i));
      case "bio":
        return NextResponse.json(await tools.bioTool(i));
      case "weekplan":
        return NextResponse.json(await tools.weekPlanTool({ goal: String(input.goal ?? ""), context: await igContext() }));
      case "coach":
        return NextResponse.json(await tools.coachTool({ question: String(input.question ?? ""), context: await igContext() }));
      case "adcopy":
        return NextResponse.json(await tools.adCopyTool(i));
      case "reviewReply":
        return NextResponse.json(await tools.reviewReplyTool(i));
      case "mailReply":
        return NextResponse.json(await tools.mailReplyTool(i));
      case "atelier":
        return NextResponse.json(await tools.atelierTool(i));
      default:
        return NextResponse.json({ error: "Outil inconnu." }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ error: aiErrorMessage(e) }, { status: 400 });
  }
}
