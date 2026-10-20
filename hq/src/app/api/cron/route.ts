import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE, authDisabled, verifySession } from "@/lib/session";
import { safeEqual } from "@/lib/secret";
import { publishDuePosts } from "@/lib/instagram";
import { autoReplyTick } from "@/lib/mail";
import { dailyHealthTick } from "@/lib/health";
import { outreachTick } from "@/lib/prospects";
import { store } from "@/lib/store";

export const maxDuration = 300;

/**
 * Tâche planifiée (à appeler toutes les 5 à 15 minutes) :
 * publie les posts programmés, envoie les réponses automatiques,
 * lance le test de santé quotidien et la prospection.
 * Appel externe : Authorization: Bearer <CRON_SECRET>. Depuis l'app ouverte : cookie de session.
 */
async function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? new URL(req.url).searchParams.get("secret") ?? "";
  if (secret && header && safeEqual(header, secret)) return true;
  if (authDisabled()) return true;
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

async function step(name: string, fn: () => Promise<unknown>) {
  try {
    return [name, await fn()] as const;
  } catch (e) {
    return [name, `erreur : ${e instanceof Error ? e.message : e}`] as const;
  }
}

async function run(req: Request) {
  if (!(await authorized(req))) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const last = (await store.get<{ at: number }>("cron:last")) ?? { at: 0 };
  // Évite les passages en double quand plusieurs onglets sont ouverts.
  if (Date.now() - last.at < 50_000 && !new URL(req.url).searchParams.has("force")) return NextResponse.json({ skipped: true });
  await store.set("cron:last", { at: Date.now() });
  const results = Object.fromEntries(
    await Promise.all([step("instagram", publishDuePosts), step("reponseAuto", autoReplyTick), step("sante", dailyHealthTick), step("prospection", outreachTick)]),
  );
  await store.set("cron:last", { at: Date.now(), results });
  return NextResponse.json({ at: new Date().toISOString(), results });
}

export const GET = run;
export const POST = run;
