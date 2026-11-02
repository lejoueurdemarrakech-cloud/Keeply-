import type { Task } from "@/lib/types";

/** Version de la liste : quand elle change, les tâches « launch-* » encore à faire sont réécrites. */
export const LAUNCH_TASKS_VERSION = "v2-ils-reviennent";

/** Tâches avant le lancement officiel, posées une seule fois au passage aux vraies données (02/11/2026). */
const LIST: [Task["priority"], string, string, string?][] = [
  ["haute", "Envoyer à Claude les nouvelles cartes (plusieurs styles) pour les posts, les pubs et le site", "Lancement"],
  ["haute", "Relancer Apple pour la vérification DSA (France, Belgique, Luxembourg, Monaco)", "App Store"],
  ["haute", "Review complète de l'app iOS, Android et web : lister et corriger tous les bugs", "App"],
  ["haute", "Sortir la 1.1 : commit, tests, build, déploiement serveur", "App"],
  ["haute", "Valider le prix au Maroc (399 DH/mois) avant les pubs", "Lancement"],
  ["haute", "Passer Instagram en compte professionnel et le relier à une Page Facebook Keeply", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Copier la bio et créer les stories à la une (HQ > Instagram > Lancement)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Remplir les crochets des légendes avec du vrai vécu (p03, p11, p14)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Tourner le Reel fondateur « Fait à Agadir » (p03)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Faire les visuels de la semaine 0 (p01 à p03) avec les nouvelles cartes, et choisir le snack d'Agadir de la série « Ils reviennent »", "Instagram", "/instagram?tab=lancement"],
  ["haute", "Créer le portefeuille Meta Business, le compte pub en dirhams et ajouter la carte de paiement", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Relier un numéro WhatsApp Business à la Page Facebook (phase 2 des pubs)", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Créer la page keeplyfidelity.app/maroc avec le pixel Meta et l'événement clic App Store", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Remplacer les vidéos du site vitrine", "Site"],
  ["normale", "Ajouter la section « extra » au site vitrine", "Site"],
  ["normale", "Trouver un vrai commerce partenaire (accord écrit) pour la première affiche (p14) et le micro-trottoir (p11)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Publier l'app Android sur Google Play", "App"],
  ["normale", "Brancher les connexions de HQ une par une", "HQ", "/connexions"],
];

export const launchTasks = (): Task[] =>
  LIST.map(([priority, title, tag, link], i) => ({ id: `launch-${i + 1}`, title, priority, tag, link, status: "todo", createdAt: new Date().toISOString() }));
