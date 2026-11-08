import type { Task } from "@/lib/types";

/** Version de la liste : quand elle change, les tâches « launch-* » encore à faire sont réécrites. */
export const LAUNCH_TASKS_VERSION = "v6-strategie-facile";

/** Tâches avant le lancement officiel, posées une seule fois au passage aux vraies données (02/11/2026). */
const LIST: [Task["priority"], string, string, string?][] = [
  ["haute", "Envoyer à Claude les nouvelles cartes (plusieurs styles) pour les posts, les pubs et le site", "Lancement"],
  ["haute", "Relancer Apple pour la vérification DSA (France, Belgique, Luxembourg, Monaco)", "App Store"],
  ["haute", "Review complète de l'app iOS, Android et web : lister et corriger tous les bugs", "App"],
  ["haute", "Sortir la 1.1 : commit, tests, build, déploiement serveur", "App"],
  ["normale", "Valider les prix hors France (Maroc, Suisse, Canada) affichés sur le site", "Lancement"],
  ["haute", "Passer Instagram en compte professionnel et le relier à une Page Facebook Keeply", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Copier la bio et créer les stories à la une (HQ > Instagram > Lancement)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Remplir les crochets avec du vrai vécu et de vrais chiffres (p03, p14, TikTok t05, t10, t15)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Tourner le Reel fondateur (p03) et les vidéos TikTok « Depuis Agadir » (t01, t03, t05)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Faire les visuels de la semaine 0 (p01 à p03) avec les cartes du Studio, et choisir le café de la série « Ils reviennent »", "Instagram", "/instagram?tab=lancement"],
  ["haute", "Créer le portefeuille Meta Business, un compte pub en euros (limite 100 € par mois) et ajouter la carte de paiement", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Régler le message de bienvenue et les réponses rapides (prix, Android, comment ça marche) dans Meta Business Suite", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Créer les liens App Store avec suivi de campagne (meta-ma, meta-ca, meta-ch, instagram-bio, tiktok)", "Meta Ads", "/ads?tab=lancement"],
  ["haute", "Ouvrir le compte Instagram le mardi 24 novembre (3 posts avant le lancement du 1er décembre)", "Lancement", "/instagram?tab=lancement"],
  ["haute", "Page liste d'attente keeplyfidelity.app/bientot (France, Belgique) avec Cloudflare Turnstile, puis pixel Meta", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Préparer le mail « Keeply est disponible sur Android » pour la liste Android", "Lancement"],
  ["haute", "Donner le go pour mettre en ligne keeplyfidelity.app/app (bon store selon le téléphone) et /android", "Lancement"],
  ["haute", "Mettre le site vitrine en ligne sur keeplyfidelity.app avant le 24 novembre (avec les nouvelles vidéos)", "Site"],
  ["normale", "Bio Instagram : texte, nom du profil et 2 liens (Télécharger Keeply, Liste d'attente France)", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Ajouter une clé Serper gratuite à Harvey pour qu'il trouve aussi les restaurants et cafés", "Prospection", "/prospection?tab=recherche"],
  ["normale", "Première tournée terrain à Agadir (10 commerces, pitch prêt)", "Prospection", "/prospection?tab=terrain"],
  ["normale", "Importer la liste de prospects Harvey dans Meta (audience personnalisée, sans les désinscrits)", "Meta Ads", "/ads?tab=lancement"],
  ["normale", "Se déclarer auto-entrepreneur, puis prendre le badge bleu Meta Verified pour les entreprises", "Lancement"],
  ["normale", "Remplacer les vidéos du site vitrine", "Site"],
  ["normale", "Ajouter la section « extra » au site vitrine", "Site"],
  ["normale", "Trouver un vrai commerce d'accord pour être filmé (vlog TikTok t15) et pour des publications en collaboration", "Instagram", "/instagram?tab=lancement"],
  ["normale", "Publier l'app Android sur Google Play", "App"],
  ["normale", "Brancher les connexions de HQ une par une", "HQ", "/connexions"],
  ["haute", "Ouvrir le compte TikTok entreprise et publier t01 le mardi 24 novembre (HQ > TikTok)", "TikTok", "/tiktok"],
  ["normale", "Créer les audiences de relance Meta dès le 24 novembre (vidéos vues à 50 %, interactions Instagram)", "Meta Ads", "/ads?tab=lancement"],
];

export const launchTasks = (): Task[] =>
  LIST.map(([priority, title, tag, link], i) => ({ id: `launch-${i + 1}`, title, priority, tag, link, status: "todo", createdAt: new Date().toISOString() }));
