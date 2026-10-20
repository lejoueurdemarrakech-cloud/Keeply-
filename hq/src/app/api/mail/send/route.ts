import { route, HttpError } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { imapAction, sendMail, updateMailState } from "@/lib/mail";
import { logActivity } from "@/lib/settings";

export const POST = route(async (req: Request) => {
  const b = (await req.json()) as { to: string; subject: string; text: string; inReplyTo?: string; references?: string; uid?: string };
  if (!b.to || !b.subject || !b.text) throw new HttpError(400, "Destinataire, objet et message sont nécessaires.");
  const cfg = await configOrNull("mail");
  if (!cfg) throw new HttpError(400, "Connecte ta boîte mail (page Connexions) pour envoyer.");
  await sendMail(cfg, b);
  if (b.inReplyTo) {
    await updateMailState((s) => ({ ...s, overrides: { ...s.overrides, [b.inReplyTo!]: { ...s.overrides[b.inReplyTo!], done: true } }, lastReplyTo: { ...s.lastReplyTo, [b.to.toLowerCase()]: new Date().toISOString() } }));
  }
  if (b.uid) await imapAction(cfg, b.uid, "seen").catch(() => undefined);
  await logActivity("mails", `Réponse envoyée à ${b.to}`, "succes");
  return { ok: true };
});
