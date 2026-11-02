import type { Task } from "@/lib/types";

/** Version de la liste : quand elle change, les tâches « launch-* » encore à faire sont réécrites. */
export const LAUNCH_TASKS_VERSION = "v4-lancement-15-nov";

/** Tâches avant le lancement officiel, posées une seule fois au passage aux vraies données (02/11/2026). */
const LIST: [Task["priority"], string, string, string?][] = [
  ["haute", "Envoyer à Claude les nouvelles cartes (plusieurs styles) pour les posts, les pubs et le site", "Lancement"],
  ["haute", "Relancer Apple pour la vérification DSA (France, Belgique, Luxembourg, Monaco)", "App Store"],
  ["haute", "Review complète de l'app iOS, Android et web : lister et corriger tous les bugs", "App"],
  ["haute", "Sortir la 1.1 : commit, tests, build, déploiement serveur", "App"],
  ["normale", "Valider les prix hors France (Maroc, Suisse, Canada) affichés sur le site", "Lancement"],
  ["haute", "Passer Instagram en compte professionnel et le relier à une Page Facebook Keeply", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Copier la bio et créer les stories à la une (HQ > Instagram > Lancement)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Remplir les crochets des légendes avec du vrai vécu (p03, p11, p14)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Tourner le Reel fondateur « Fait à Agadir » (p03)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Faire les visuels de la semaine 0 (p01 à p03) avec les nouvelles cartes, et choisir le snack d'Agadir de la série « Ils reviennent »", "Instagram", "/instagram?tab=lancement"],
  ["haute", "Créer le portefeuille Meta Business, un compte pub en euros (limite 100 € par mois) et ajouter la carte de paiement", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Relier WhatsApp Business à la Page et préparer les réponses rapides (test Messages)", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Créer la page keeplyfidelity.app/maroc avec le pixel Meta et l'événement clic App Store", "Meta Ads", "/ads?tab=lancement"],
  ["haute", "Lancer le compte Instagram le dimanche 15 novembre (3 posts avant les pubs du 23 novembre)", "Lancement", "/instagram?tab=lancement"],
  ["haute", "Pixel Meta + événement clic App Store sur keeplyfidelity.app, et bloc « Sur Android ? Prévenez-moi »", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Préparer le mail « Keeply est disponible sur Android » pour la liste Android", "Lancement"],
  ["normale", "Importer la liste de prospects Harvey dans Meta (audience personnalisée, sans les désinscrits)", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Se déclarer auto-entrepreneur, puis prendre le badge bleu Meta Verified pour les entreprises", "Lancement"],
  ["normale", "Remplacer les vidéos du site vitrine", "Site"],
  ["normale", "Ajouter la section « extra » au site vitrine", "Site"],
  ["normale", "Trouver un vrai commerce partenaire (accord écrit) pour la première affiche (p14) et le micro-trottoir (p11)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Publier l'app Android sur Google Play", "App"],
  ["normale", "Brancher les connexions de HQ une par une", "HQ", "/connexions"],
];

export const launchTasks = (): Task[] =>
  LIST.map(([priority, title, tag, link], i) => ({ id: `launch-${i + 1}`, title, priority, tag, link, status: "todo", createdAt: new Date().toISOString() }));
