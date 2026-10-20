import { route, HttpError } from "@/lib/http";
import { configOrNull } from "@/lib/connectors/config";
import { renderTemplate, sendMail } from "@/lib/mail";
import { getSettings } from "@/lib/settings";

/** Envoie la réponse automatique à ta propre adresse pour la vérifier. */
export const POST = route(async () => {
  const cfg = await configOrNull("mail");
  if (!cfg) throw new HttpError(400, "Connecte ta boîte mail d'abord.");
  const s = await getSettings();
  const to = s.ownerEmail || cfg.user;
  await sendMail(cfg, {
    to,
    subject: s.autoReply.subjectPrefix + "Exemple de demande client",
    text: renderTemplate(s.autoReply.body, { prenom: s.ownerName.split(" ")[0] || "Sophie", sujet: "Exemple de demande client", signature: s.signature }),
  });
  return { sentTo: to };
});
