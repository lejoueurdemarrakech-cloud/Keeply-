/**
 * Appels automatiques de HQ : test de santé du matin, tournées Claude planifiées,
 * réponses automatiques aux mails, prospection automatique, tests navigateur.
 * Coupés pour l'instant. Pour les remettre : passer AUTO_CALLS_ON à true (ou HQ_AUTO_CALLS=1 sur Vercel).
 * Les boutons « Lancer maintenant » et la publication des posts programmés restent actifs.
 */
const AUTO_CALLS_ON = false;
export const CHECKS_PAUSED = !(AUTO_CALLS_ON || process.env.HQ_AUTO_CALLS === "1");
export const PAUSED_MESSAGE = "Appels automatiques coupés pour l'instant.";
