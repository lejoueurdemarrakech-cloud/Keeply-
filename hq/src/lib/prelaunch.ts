/**
 * Avant le lancement officiel, tous les contrôles automatiques sont coupés :
 * test de santé quotidien, tests navigateur, tournées Claude planifiées.
 * Pour les rallumer au lancement : HQ_CHECKS_PAUSED=0 sur Vercel (ou passer la valeur par défaut à false).
 */
export const CHECKS_PAUSED = (process.env.HQ_CHECKS_PAUSED ?? "1") !== "0";
export const PAUSED_MESSAGE = "Contrôles en pause jusqu'au lancement officiel.";
