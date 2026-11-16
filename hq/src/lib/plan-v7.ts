/*
 * Plan Instagram, TikTok et stories v7 (16/11/2026). Source : Keeply-Marketing/STRATEGIE-LANCEMENT.md.
 * Cible : les patrons (fast-foods, cafés, restaurants). Compte FR @keeplyfr, compte EN @keeplyapp, TikTok @keeplyfr.
 * Jamais d'anglais sur le compte FR ni l'inverse. Jamais de faux témoignage ni de chiffre inventé.
 * Les dates ci-dessous sont celles de départ : le fondateur les déplace dans HQ (glisser-déposer),
 * les déplacements sont gardés dans le store (clé ig-plan-v7), voir plan-state.ts.
 */

export type Account = "fr" | "en" | "tiktok";
export type ItemFormat = "Reel" | "Carrousel" | "Photo" | "Stories" | "TikTok";

export interface StorySlide {
  texte: string;
  visuel: string;
  sticker?: string;
}

export interface PlanItem {
  id: string;
  account: Account;
  kind: "post" | "story";
  date: string; // AAAA-MM-JJ
  heure: string; // HH:MM, heure de Paris
  format: ItemFormat;
  /** Type éditorial : Démo, Conseil, Avis, Fondateur, Objection, Offre… */
  type: string;
  titre: string;
  accroche: string;
  /** Ce qu'il faut fabriquer : plans, slides, texte à l'écran. */
  contenu: string;
  legende?: string;
  hashtags?: string[];
  cta?: string;
  /** Formule d'accroche du skill ig-reel (ex. « #14 Interpellation »). */
  hook?: string;
  slides?: StorySlide[];
  /** Story qui republie un post : id du post. */
  repostOf?: string;
  boost?: boolean;
}

export const ACCOUNT_LABEL: Record<Account, string> = { fr: "Instagram FR · @keeplyfr", en: "Instagram EN · @keeplyapp", tiktok: "TikTok · @keeplyfr" };
export const ACCOUNT_SHORT: Record<Account, string> = { fr: "FR", en: "EN", tiktok: "TikTok" };

/* ------------------------------------------------------------------ Profils */

export const PROFILES: Record<Account, { username: string; nom: string; bio: string; lien: string; lienTexte: string; boutons: string; epingles: string }> = {
  fr: {
    username: "@keeplyfr",
    nom: "Keeply · Carte de fidélité",
    bio: "La carte de fidélité dans le Wallet de vos clients.\nRestaurants · cafés · fast-foods\nAucune appli à télécharger pour eux\n14 jours gratuits ↓",
    lien: "https://keeplyfidelity.app/liens?ct=ig_fr",
    lienTexte: "keeplyfidelity.app/liens : une page avec 4 boutons (Télécharger l'app iPhone · Ouvrir la web app · Découvrir Keeply · Écrire un e-mail). Le bouton App Store ouvre directement le bon pays ; sur Android, il mène à la liste d'attente.",
    boutons: "Catégorie « Application / logiciel ». Boutons Contact : WhatsApp Business + e-mail bonjour@keeplyfidelity.app.",
    epingles: "Épingler : la démo en 20 s (fr-p04), Keeply en 7 slides (fr-p02), le fondateur (fr-p03).",
  },
  en: {
    username: "@keeplyapp",
    nom: "Keeply · Loyalty cards",
    bio: "Loyalty cards that live in your customers' Wallet.\nRestaurants · cafés · fast food\nNo app for them to download\n14-day free trial ↓",
    lien: "https://keeplyfidelity.app/links?ct=ig_en",
    lienTexte: "keeplyfidelity.app/links: the same page in English (Get the app · Open the web app · Discover Keeply).",
    boutons: "Category « App page ». Contact buttons: WhatsApp + email.",
    epingles: "Pin: the 20-second demo (en-p04), Keeply in 7 slides (en-p02), the founder (en-p03).",
  },
  tiktok: {
    username: "@keeplyfr",
    nom: "Keeply · Carte de fidélité",
    bio: "Carte de fidélité Wallet pour restos, cafés, fast-foods. 14 jours gratuits.",
    lien: "https://keeplyfidelity.app/liens?ct=tt_fr",
    lienTexte: "Même page de liens que sur Instagram (lien en bio disponible après 1 000 abonnés sur TikTok : en attendant, « lien sur Instagram »).",
    boutons: "Compte Entreprise, catégorie « Logiciel ».",
    epingles: "Épingler la démo en 20 s.",
  },
};

/* ------------------------------------------------------- Stories à la une */

export const HIGHLIGHTS: Record<"fr" | "en", { nom: string; contenu: string[] }[]> = {
  fr: [
    { nom: "Démo", contenu: ["La démo en 20 s (repost de fr-p04)", "Le scan à la caisse, filmé de près", "La carte qui s'ajoute dans Wallet"] },
    { nom: "Comment ?", contenu: ["1. Créez votre carte (3 min)", "2. Posez le QR au comptoir", "3. Scannez à chaque passage", "Lien : télécharger l'app"] },
    { nom: "Vos clients", contenu: ["Ce que voit le client : QR → « Ajouter à Apple Wallet / Google Wallet »", "Aucune appli, aucun compte à créer", "La notification sur l'écran verrouillé"] },
    { nom: "Prix", contenu: ["Le prix de votre pays", "14 jours gratuits", "Sans engagement : vous arrêtez quand vous voulez"] },
    { nom: "Options", contenu: ["Tampons ou points", "Statuts Bronze, Argent, Or", "Offres auto (anniversaire, client absent)", "Notifications", "Sur chaque écran : « s'active ou se coupe en un geste »"] },
    { nom: "FAQ", contenu: ["Une vraie question reçue en DM par story, avec la réponse", "« Et si le client change de téléphone ? »", "« Ça marche sur Android ? »"] },
    { nom: "Pays", contenu: ["Où Keeply est disponible (drapeaux)", "Android bientôt : lien liste d'attente", "La web app, depuis n'importe quel ordinateur"] },
    { nom: "Fondateur", contenu: ["Qui est derrière Keeply", "Pourquoi Keeply (repost de fr-p03)", "Les coulisses de la semaine"] },
  ],
  en: [
    { nom: "Demo", contenu: ["The 20-second demo (repost of en-p04)", "Scanning at the counter, close up", "The card landing in Wallet"] },
    { nom: "How", contenu: ["1. Create your card (3 min)", "2. Put the QR on your counter", "3. Scan at every visit", "Link: get the app"] },
    { nom: "Customers", contenu: ["What customers see: QR → « Add to Apple Wallet / Google Wallet »", "No app, no account", "The lock-screen notification"] },
    { nom: "Pricing", contenu: ["Your country's price", "14-day free trial", "No commitment, cancel anytime"] },
    { nom: "Features", contenu: ["Stamps or points", "Bronze, Silver, Gold tiers", "Automatic offers (birthday, lapsed customer)", "Notifications", "On every screen: « switch it on or off anytime »"] },
    { nom: "FAQ", contenu: ["One real DM question per story, with the answer"] },
    { nom: "Where", contenu: ["Countries where Keeply is live", "Android coming soon: waitlist link", "Web app on any computer"] },
    { nom: "Founder", contenu: ["Who is behind Keeply", "Why Keeply (repost of en-p03)", "Behind the scenes"] },
  ],
};

/** Stories de tous les jours, en plus des séquences datées et des reposts. */
export const DAILY_STORIES: { jour: string; fr: string; en: string }[] = [
  { jour: "Lundi", fr: "Coulisses : ce qu'on construit cette semaine (écran, croquis, bureau).", en: "Behind the scenes: what we're building this week." },
  { jour: "Mardi", fr: "Sondage métier (« Vous avez une carte de fidélité ? Carton / Appli / Rien »).", en: "Owner poll (« Do you run a loyalty card? Paper / App / None »)." },
  { jour: "Mercredi", fr: "Mini-démo d'une fonction en 10 s (enregistrement d'écran).", en: "10-second feature demo (screen recording)." },
  { jour: "Jeudi", fr: "Boîte à questions : « Posez-moi vos questions de patron ».", en: "Question box: « Ask me anything about loyalty »." },
  { jour: "Vendredi", fr: "Astuce fidélisation en une phrase, sur fond violet.", en: "One-line loyalty tip on a violet background." },
  { jour: "Week-end", fr: "Repost du post de la semaine + réponses aux questions reçues.", en: "Repost of the week's post + answers to questions." },
];

export const ENGAGEMENT = [
  "20 min par jour AVANT de publier : 10 comptes.",
  "5 comptes « portée » : médias et gros comptes du métier (L'Hôtellerie Restauration, Néo-restauration, Atabula ; en anglais Restaurant Business). Commenter tôt et utilement.",
  "3 comptes « pairs » : petites marques et créateurs du même univers (outils pour commerces, entrepreneurs food).",
  "2 comptes « acheteurs » : des commerces des villes visées. Commenter des semaines avant tout DM, jamais de vente en commentaire.",
  "10 DM personnalisés par jour au maximum (compte neuf), avec la carte démo aux couleurs du commerce.",
];

/* ---------------------------------------------------------- Posts FR */

const H_FR = ["#cartedefidelite", "#restaurateur", "#fastfood", "#cafe", "#fidelisation"];
const H_EN = ["#loyaltyprogram", "#restaurantowner", "#cafeowner", "#smallbusiness", "#applewallet"];

const FR: Omit<PlanItem, "account" | "kind">[] = [
  {
    id: "fr-p01", date: "2026-11-24", heure: "15:30", format: "Reel", type: "Manifeste", hook: "#14 Interpellation",
    titre: "Ce compte est pour vous",
    accroche: "Si vous avez un comptoir, ce compte est pour vous.",
    contenu: "Reel 12 s. Enchaînement rapide de comptoirs : snack, café, resto chic (banque d'images Higgsfield). Dernier plan : un iPhone où une carte de fidélité s'allume dans Wallet. Texte à l'écran : « Si vous avez un comptoir, ce compte est pour vous. » puis « Ici, on parle de ceux qui reviennent. »",
    legende: "Fast-food, café, resto de quartier ou resto chic.\nSi vous avez un comptoir, ce compte est pour vous.\n\nIci, on parle de ceux qui reviennent.",
    hashtags: H_FR, cta: "Suivez le compte",
  },
  {
    id: "fr-p02", date: "2026-11-26", heure: "15:30", format: "Carrousel", type: "Offre",
    titre: "Keeply en 7 slides",
    accroche: "Votre carte de fidélité. Dans leur iPhone.",
    contenu: "Carrousel 7 slides 1080×1350, fond blanc, une idée par slide.\n1 Couverture : « Votre carte de fidélité. Dans leur iPhone. » + carte du Studio\n2 Le client scanne un QR, la carte va dans son Wallet. Sans appli.\n3 Vous scannez à la caisse avec votre iPhone.\n4 Tampons ou points : vous choisissez.\n5 Notifications gratuites sur l'écran verrouillé (si vous voulez).\n6 Le prix de votre pays + 14 jours gratuits.\n7 « Lien en bio. »",
    legende: "Keeply en 7 slides.\n\nVotre client scanne, sa carte est dans son Wallet.\nVous scannez à chaque passage.\nVous gardez la main sur tout : chaque option s'active ou se coupe.\n\n14 jours gratuits, lien en bio.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p03", date: "2026-11-28", heure: "15:30", format: "Reel", type: "Fondateur", hook: "#21 Début en pleine phrase",
    titre: "Pourquoi j'ai créé Keeply",
    accroche: "…et c'est là que j'ai compris que les cartes en carton finissent toutes à la poubelle.",
    contenu: "Reel 30 s face caméra, sous-titres mot à mot. Le fondateur, à Agadir, raconte LE moment vécu qui lui a donné l'idée [à écrire par lui, 2 phrases vraies]. Puis : « Les grandes chaînes ont leur carte dans le téléphone de leurs clients. Le snack d'en bas, non. » 1re des 2 mentions du carton.",
    legende: "[Le moment vrai qui m'a donné l'idée, en 2 phrases.]\n\nLes grandes chaînes ont leur carte de fidélité dans le téléphone de leurs clients. Je voulais que le snack d'en bas, le café du coin et le petit resto aient la même chose.\n\nC'est Keeply.",
    hashtags: [...H_FR, "#entrepreneur"], cta: "Suivez l'aventure",
  },
  {
    id: "fr-p04", date: "2026-12-01", heure: "12:30", format: "Reel", type: "Lancement · Démo", hook: "#18 Démo à froid", boost: true,
    titre: "LANCEMENT · 20 secondes",
    accroche: "20 secondes. Un client fidélisé.",
    contenu: "Reel 20 s, démo chronométrée SANS coupe, chrono à l'écran : QR au comptoir → « Ajouter à Apple Wallet » → scan à la caisse → tampon. Fin : « Keeply est disponible. » Vrais écrans, jamais truqués.",
    legende: "20 secondes.\nVotre client scanne, sa carte est dans son Wallet, vous le tamponnez à la caisse.\n\nKeeply est disponible.\n14 jours gratuits, lien en bio.",
    hashtags: H_FR, cta: "14 jours gratuits, lien en bio",
  },
  {
    id: "fr-p05", date: "2026-12-03", heure: "15:30", format: "Carrousel", type: "Conseil",
    titre: "5 récompenses qui font revenir",
    accroche: "5 récompenses qui font vraiment revenir. Et 2 à éviter.",
    contenu: "Carrousel 8 slides. 1 couverture · 2 café offert au 10e passage · 3 une remise au palier · 4 le coupon d'anniversaire · 5 « vous nous manquez » après 30 jours (automatique, à activer si vous voulez) · 6 double tampon les jours creux · 7 À éviter : une récompense trop lointaine, une remise illimitée · 8 « Enregistrez ce post ».",
    legende: "Une bonne récompense donne envie de revenir la semaine prochaine, pas dans 6 mois.\n\nEnregistrez ce post pour votre prochaine carte.",
    hashtags: H_FR, cta: "Enregistrez ce post",
  },
  {
    id: "fr-p06", date: "2026-12-06", heure: "18:00", format: "Reel", type: "Avis tranché", hook: "#22 Contre-pied",
    titre: "Vos habitués, pas Instagram",
    accroche: "Instagram ne remplit pas votre resto. Vos habitués, si.",
    contenu: "Reel 25 s face caméra + images de comptoir. On dépense pour attirer des nouveaux clients, rien pour faire revenir ceux qui sont déjà venus. Une carte de fidélité bien faite, c'est l'inverse. Pas de chiffre inventé.",
    legende: "On dépense tout pour attirer de nouveaux clients.\nEt presque rien pour faire revenir ceux qui sont déjà venus.\n\nVous en pensez quoi ?",
    hashtags: H_FR, cta: "Votre avis en commentaire",
  },
  {
    id: "fr-p07", date: "2026-12-07", heure: "15:30", format: "Reel", type: "Démo", hook: "#5 Temps compressé",
    titre: "Créer sa carte en 3 minutes",
    accroche: "Créer sa carte de fidélité : 3 minutes.",
    contenu: "Enregistrement d'écran accéléré de l'app : logo, couleurs, récompense, QR prêt à imprimer. Chrono à l'écran du début à la fin.",
    legende: "Logo, couleurs, récompense, QR.\n3 minutes, et votre carte est prête.\n\nEssayez gratuitement, lien en bio.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p08", date: "2026-12-09", heure: "15:30", format: "Reel", type: "Objection", hook: "#12 Objection",
    titre: "Ils n'ont rien à télécharger",
    accroche: "« Mes clients ne vont pas télécharger une appli. » Ils n'ont pas à le faire.",
    contenu: "Reel 20 s côté client : l'appareil photo de l'iPhone, le QR, « Ajouter à Apple Wallet », puis la même chose sur Android avec Google Wallet. Fini.",
    legende: "Vos clients n'installent rien.\nIls scannent, la carte va dans leur Wallet, à côté de leur carte bancaire.\niPhone et Android.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p09", date: "2026-12-10", heure: "15:30", format: "Carrousel", type: "Le calcul",
    titre: "Combien coûte un client perdu ?",
    accroche: "Combien vous coûte un client qui ne revient pas ?",
    contenu: "Carrousel 6 slides. Un EXEMPLE chiffré, écrit « exemple » sur la slide : panier de 10 €, un habitué qui revient 2 fois de plus par mois… Puis le prix de Keeply ramené au jour (1,33 €/jour, moins d'1 €/jour à l'année). Version Maroc : prix en dollars, comme sur l'App Store. « Refaites le calcul avec votre panier. »",
    legende: "Faites le calcul avec votre panier moyen.\nUn habitué qui revient un peu plus souvent, ça change un mois.\n\n(Les chiffres du post sont un exemple.)",
    hashtags: H_FR, cta: "Enregistrez · lien en bio",
  },
  {
    id: "fr-p10", date: "2026-12-13", heure: "18:00", format: "Reel", type: "Coulisses", hook: "#16 Question entendue",
    titre: "Depuis Agadir #1 · les questions des patrons",
    accroche: "J'ai montré Keeply à des patrons cette semaine. Voilà ce qu'ils m'ont demandé.",
    contenu: "Reel 30 s : les VRAIES questions entendues pendant les démos terrain de la semaine, filmées au téléphone. Pas de citation sans accord, pas de nom de commerce sans accord.",
    legende: "Cette semaine, des démos dans des cafés et des snacks.\nLes questions qui reviennent, et mes réponses.\n\nPosez la vôtre en commentaire.",
    hashtags: [...H_FR, "#agadir"], cta: "Votre question en commentaire",
  },
  {
    id: "fr-p11", date: "2026-12-14", heure: "15:30", format: "Reel", type: "Film de marque", boost: true,
    titre: "À travers les âges",
    accroche: "Certains clients restent toute une vie.",
    contenu: "La pub « À travers les âges » (Julie et le pizzaiolo, de 15 à 45 ans), 60 s + une version 15 s pour le boost. Montage, musique et vrai logo faits dans Claude Code à partir des vidéos Higgsfield. Si elle n'est pas prête : échanger avec fr-p13.",
    legende: "Certains clients restent toute une vie.\n\nKeeply. La fidélité, facile.",
    hashtags: H_FR, cta: "Keeply. La fidélité, facile.",
  },
  {
    id: "fr-p12", date: "2026-12-16", heure: "15:30", format: "Reel", type: "Avant / après", hook: "#7 Mauvaise façon, bonne façon",
    titre: "Carton ou Wallet ?",
    accroche: "Carte en carton ou carte dans le Wallet ?",
    contenu: "Reel 15 s en écran partagé : à gauche le carton oublié, froissé, perdu ; à droite la carte qui s'allume sur l'écran verrouillé. 2e et DERNIÈRE mention du carton.",
    legende: "L'une se perd au fond d'une poche.\nL'autre s'allume sur l'écran verrouillé.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p13", date: "2026-12-17", heure: "15:30", format: "Carrousel", type: "Fonctions",
    titre: "L'écran verrouillé, votre vitrine",
    accroche: "L'écran verrouillé, c'est votre nouvelle vitrine.",
    contenu: "Carrousel 7 slides : notifications gratuites · offres automatiques (anniversaire, client absent depuis 30 jours, jour de pluie) · statuts Bronze/Argent/Or. Petit interrupteur dessiné sur chaque slide + « s'active ou se coupe en un geste ».",
    legende: "Une notification gratuite, là où vos clients regardent 100 fois par jour.\nOffres auto, statuts, notifications : tout s'active ou se coupe en un geste.",
    hashtags: H_FR, cta: "Enregistrez",
  },
  {
    id: "fr-p14", date: "2026-12-20", heure: "18:00", format: "Reel", type: "Question de patron", hook: "#16 Question entendue",
    titre: "Et s'il change de téléphone ?",
    accroche: "« Et si mon client change de téléphone ? »",
    contenu: "Reel 20 s : la question à l'écran, puis la réponse en démo : il retrouve sa carte et ses points grâce au lien reçu par e-mail.",
    legende: "Il retrouve sa carte et ses points avec le lien reçu par e-mail.\nRien n'est perdu.\n\nD'autres questions ? En DM.",
    hashtags: H_FR, cta: "Vos questions en DM",
  },
  {
    id: "fr-p15", date: "2026-12-21", heure: "15:30", format: "Reel", type: "Urgence", hook: "#19 L'échéance",
    titre: "Janvier, le mois où ils disparaissent",
    accroche: "Janvier : le mois où vos clients disparaissent. Préparez-le maintenant.",
    contenu: "Reel 20 s : l'offre « vous nous manquez » qui part toute seule aux clients absents depuis 30 jours (à activer si vous voulez). Démo de l'activation en 2 gestes.",
    legende: "Après les fêtes, beaucoup de clients ne reviennent pas tout de suite.\nUne offre peut partir toute seule à ceux qui ne sont pas revenus. Vous l'activez, ou pas.",
    hashtags: H_FR, cta: "14 jours gratuits, lien en bio",
  },
  {
    id: "fr-p16", date: "2026-12-23", heure: "15:30", format: "Carrousel", type: "Conseil",
    titre: "3 coupons pour remplir janvier",
    accroche: "3 idées de coupons pour remplir janvier.",
    contenu: "Carrousel 6 slides : café offert du lundi au mercredi · « ramenez un ami » · double tampon après 15 h. Rappel : un produit offert passe par un coupon.",
    legende: "Trois idées simples pour les semaines calmes de janvier.\nEnregistrez, vous les ressortirez le moment venu.",
    hashtags: H_FR, cta: "Enregistrez",
  },
  {
    id: "fr-p17", date: "2026-12-26", heure: "18:00", format: "Reel", type: "Bilan", hook: "#15 Le carnet des ratés",
    titre: "Un mois de Keeply",
    accroche: "Un mois de Keeply. Ce qui a marché, ce qui a raté.",
    contenu: "Reel 40 s face caméra. VRAIS chiffres seulement (démos faites, commerces inscrits, ce qui n'a pas marché). L'honnêteté crée la confiance.",
    legende: "Un mois après le lancement.\n[Les vrais chiffres, ce qui a marché, ce qui a raté.]\n\nLa suite en janvier.",
    hashtags: [...H_FR, "#entrepreneur"], cta: "Suivez la suite",
  },
  {
    id: "fr-p18", date: "2026-12-28", heure: "15:30", format: "Reel", type: "Côté client", hook: "#24 La révélation",
    titre: "Ce que voit votre client",
    accroche: "Ce que voit votre client quand il ouvre son Wallet.",
    contenu: "Reel 20 s : la carte, le solde, la notification, le coupon. Si un commerce fondateur est d'accord : filmer chez lui et publier en post Collab.",
    legende: "Sa carte, ses points, son coupon.\nToujours dans sa poche.",
    hashtags: H_FR, cta: "Lien en bio",
  },
];

/* ---------------------------------------------------------- Posts EN */

const EN: Omit<PlanItem, "account" | "kind">[] = [
  { id: "en-p01", date: "2026-11-24", heure: "08:00", format: "Reel", type: "Manifesto", hook: "#14 Callout", titre: "This account is for you", accroche: "If you run a counter, this account is for you.", contenu: "Same edit as fr-p01, English on-screen text: « If you run a counter, this account is for you. » then « We talk about the customers who come back. »", legende: "Fast food, café, neighbourhood spot or fine dining.\nIf you run a counter, this account is for you.\n\nWe talk about the customers who come back.", hashtags: H_EN, cta: "Follow" },
  { id: "en-p02", date: "2026-11-26", heure: "08:00", format: "Carrousel", type: "Offer", titre: "Keeply in 7 slides", accroche: "Your loyalty card. On their iPhone.", contenu: "English version of fr-p02. Slide 6: 14-day free trial (no euro price, local price shown in ads).", legende: "Keeply in 7 slides.\n\nCustomers scan, the card lands in their Wallet.\nYou scan at every visit.\nEvery feature can be switched on or off.\n\n14-day free trial, link in bio.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p03", date: "2026-11-29", heure: "08:00", format: "Reel", type: "Founder", hook: "#21 Mid-sentence", titre: "Why I built Keeply", accroche: "…and that's when I realised every paper loyalty card ends up in the bin.", contenu: "The founder to camera, in English with subtitles (the accent is fine, it feels real). Same true story as fr-p03.", legende: "[The real moment that sparked the idea, in 2 sentences.]\n\nBig chains have their loyalty card on their customers' phones. I wanted the corner café and the local burger place to have the same.\n\nThat's Keeply.", hashtags: [...H_EN, "#founder"], cta: "Follow the journey" },
  { id: "en-p04", date: "2026-12-01", heure: "08:00", format: "Reel", type: "Launch · Demo", hook: "#18 Cold open demo", boost: true, titre: "LAUNCH · 20 seconds", accroche: "20 seconds. One loyal customer.", contenu: "Same uncut 20-second demo as fr-p04, English text. End: « Keeply is live. »", legende: "20 seconds.\nYour customer scans, the card is in their Wallet, you stamp it at the counter.\n\nKeeply is live. 14-day free trial, link in bio.", hashtags: H_EN, cta: "14-day free trial, link in bio" },
  { id: "en-p05", date: "2026-12-03", heure: "08:00", format: "Carrousel", type: "Tip", titre: "5 rewards that bring them back", accroche: "5 rewards that actually bring customers back. And 2 to avoid.", contenu: "English version of fr-p05.", legende: "A good reward makes them want to come back next week, not in six months.\n\nSave this for your next card.", hashtags: H_EN, cta: "Save this post" },
  { id: "en-p07", date: "2026-12-07", heure: "08:00", format: "Reel", type: "Demo", hook: "#5 Time collapse", titre: "Your card in 3 minutes", accroche: "Building a loyalty card: 3 minutes.", contenu: "English version of fr-p07 (app in English).", legende: "Logo, colours, reward, QR code.\n3 minutes and your card is ready.\n\nTry it free, link in bio.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p08", date: "2026-12-09", heure: "08:00", format: "Reel", type: "Objection", hook: "#12 Objection", titre: "Nothing to download", accroche: "« My customers won't download an app. » They don't have to.", contenu: "English version of fr-p08.", legende: "Your customers install nothing.\nThey scan, the card goes into their Wallet, right next to their bank card.\niPhone and Android.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p11", date: "2026-12-14", heure: "08:00", format: "Reel", type: "Brand film", boost: true, titre: "Through the years", accroche: "Some customers stay for a lifetime.", contenu: "The « Through the years » brand film (no dialogue), English end card.", legende: "Some customers stay for a lifetime.\n\nKeeply. Loyalty, made easy.", hashtags: H_EN, cta: "Keeply. Loyalty, made easy." },
  { id: "en-p13", date: "2026-12-17", heure: "08:00", format: "Carrousel", type: "Features", titre: "The lock screen is your shop window", accroche: "The lock screen is your new shop window.", contenu: "English version of fr-p13, with the on/off switch drawn on every slide.", legende: "A free notification where your customers look 100 times a day.\nAutomatic offers, tiers, notifications: switch each one on or off anytime.", hashtags: H_EN, cta: "Save this" },
  { id: "en-p14", date: "2026-12-20", heure: "08:00", format: "Reel", type: "Owner question", hook: "#16 Verbatim question", titre: "New phone?", accroche: "« What if my customer gets a new phone? »", contenu: "English version of fr-p14.", legende: "They get their card and points back with the link they received by email.\nNothing is lost.", hashtags: H_EN, cta: "Questions? DM us" },
  { id: "en-p15", date: "2026-12-21", heure: "08:00", format: "Reel", type: "Deadline", hook: "#19 Deadline", titre: "January, when customers vanish", accroche: "January is when your customers disappear. Get ready now.", contenu: "English version of fr-p15.", legende: "After the holidays, many customers take a while to come back.\nAn offer can go out on its own to those who haven't. Your call.", hashtags: H_EN, cta: "14-day free trial, link in bio" },
  { id: "en-p18", date: "2026-12-28", heure: "08:00", format: "Reel", type: "Customer view", hook: "#24 Reveal", titre: "What your customer sees", accroche: "What your customer sees when they open their Wallet.", contenu: "English version of fr-p18.", legende: "Their card, their points, their coupon.\nAlways in their pocket.", hashtags: H_EN, cta: "Link in bio" },
];

/* ------------------------------------------------- Stories datées (hors reposts) */

const STORIES_FR: Omit<PlanItem, "account" | "kind" | "format">[] = [
  { id: "fr-s01", date: "2026-11-24", heure: "19:00", type: "Ouverture", titre: "Le compte ouvre", accroche: "Ce compte est pour les patrons.", contenu: "Faire réagir les premiers abonnés et savoir où ils en sont.", slides: [
    { texte: "Ici, on parle aux patrons.", visuel: "Fond violet Keeply, texte blanc centré." },
    { texte: "Vous avez une carte de fidélité aujourd'hui ?", visuel: "Fond blanc", sticker: "Sondage : Carton / Appli / Rien" },
  ] },
  { id: "fr-s02", date: "2026-11-27", heure: "19:00", type: "Coulisses", titre: "J-4", accroche: "On prépare le lancement.", contenu: "Montrer le fondateur au travail, créer l'attente.", slides: [
    { texte: "J-4.", visuel: "Vidéo du bureau, écran de l'app floutée." },
    { texte: "Mardi 1er décembre, 12 h 30.", visuel: "Fond violet", sticker: "Compte à rebours « Lancement de Keeply »" },
  ] },
  { id: "fr-s03", date: "2026-11-30", heure: "19:00", type: "Veille", titre: "Demain", accroche: "Demain.", contenu: "Récolter les freins des patrons (sujets de posts).", slides: [
    { texte: "Demain, 12 h 30.", visuel: "Fond blanc, carte du Studio qui glisse.", sticker: "Compte à rebours" },
    { texte: "Qu'est-ce qui vous empêche d'avoir une carte de fidélité ?", visuel: "Fond violet", sticker: "Boîte à questions" },
  ] },
  { id: "fr-s04", date: "2026-12-01", heure: "13:00", type: "Lancement", titre: "C'est en ligne", accroche: "Keeply est disponible.", contenu: "Pousser le Reel de lancement et le lien.", slides: [
    { texte: "C'est en ligne.", visuel: "Repost du Reel fr-p04." },
    { texte: "14 jours gratuits.", visuel: "Capture de l'App Store.", sticker: "Lien : keeplyfidelity.app/liens" },
    { texte: "Une question ? Écrivez-moi.", visuel: "Photo du fondateur.", sticker: "Bouton DM" },
  ] },
  { id: "fr-s05", date: "2026-12-04", heure: "19:00", type: "Réponses", titre: "Vos questions", accroche: "Vous m'avez demandé…", contenu: "Répondre aux questions de fr-s03 (une par story).", slides: [
    { texte: "Vous m'avez demandé…", visuel: "Réponse de la boîte à questions." },
    { texte: "[Réponse en 1 phrase + démo]", visuel: "Enregistrement d'écran 5 s." },
  ] },
  { id: "fr-s06", date: "2026-12-08", heure: "19:00", type: "Mini-démo", titre: "Créer une récompense", accroche: "Une récompense en 10 secondes.", contenu: "Montrer une fonction précise.", slides: [
    { texte: "Une récompense, 10 secondes.", visuel: "Enregistrement d'écran accéléré." },
    { texte: "Et vous la coupez quand vous voulez.", visuel: "Gros plan sur l'interrupteur." },
  ] },
  { id: "fr-s07", date: "2026-12-11", heure: "19:00", type: "Quiz", titre: "Quiz du patron", accroche: "À votre avis ?", contenu: "Engagement (les quiz font monter la portée des stories).", slides: [
    { texte: "Où vos clients regardent-ils le plus souvent ?", visuel: "Fond blanc", sticker: "Quiz : Leurs mails / Leur écran verrouillé / Vos affiches" },
    { texte: "Leur écran verrouillé. C'est là que Keeply les prévient.", visuel: "Notification sur écran verrouillé." },
  ] },
  { id: "fr-s08", date: "2026-12-15", heure: "19:00", type: "Coulisses", titre: "Les coulisses de la pub", accroche: "Comment on a fait la pub.", contenu: "Montrer le making-of de « À travers les âges ».", slides: [
    { texte: "Comment on a fait cette pub.", visuel: "Images-clés côte à côte (animatic → final)." },
    { texte: "Vous l'avez vue ?", visuel: "Repost de fr-p11.", sticker: "Curseur emoji ❤️" },
  ] },
  { id: "fr-s09", date: "2026-12-18", heure: "19:00", type: "Astuce", titre: "Où poser le QR", accroche: "Le QR, à hauteur des yeux.", contenu: "Conseil concret de mise en place.", slides: [
    { texte: "Posez le QR à hauteur des yeux, près de la caisse.", visuel: "Photo de l'affiche Caisse A5 sur un comptoir." },
    { texte: "Et dites-le à voix haute : « Vous avez notre carte ? »", visuel: "Fond violet" },
  ] },
  { id: "fr-s10", date: "2026-12-22", heure: "19:00", type: "Sondage", titre: "Les fêtes", accroche: "Vous fermez pour les fêtes ?", contenu: "Préparer le post janvier.", slides: [
    { texte: "Vous fermez pour les fêtes ?", visuel: "Fond blanc", sticker: "Sondage : Oui / Non" },
    { texte: "En janvier, une offre peut partir toute seule à ceux qui ne reviennent pas.", visuel: "Écran de l'offre auto." },
  ] },
  { id: "fr-s11", date: "2026-12-31", heure: "17:00", type: "Vœux", titre: "Bonne année", accroche: "Que vos clients reviennent.", contenu: "Vœux simples, pas de vente.", slides: [
    { texte: "Bonne année.", visuel: "Carte du Studio avec un tampon doré." },
    { texte: "Et que vos clients reviennent.", visuel: "Fond violet, logo Keeply." },
  ] },
];

const STORIES_EN: Omit<PlanItem, "account" | "kind" | "format">[] = [
  { id: "en-s01", date: "2026-11-24", heure: "09:00", type: "Opening", titre: "We're open", accroche: "This account is for owners.", contenu: "First poll to learn where followers stand.", slides: [
    { texte: "We talk to owners here.", visuel: "Violet background, white text." },
    { texte: "Do you run a loyalty card today?", visuel: "White background", sticker: "Poll: Paper / App / None" },
  ] },
  { id: "en-s02", date: "2026-12-01", heure: "09:00", type: "Launch", titre: "We're live", accroche: "Keeply is live.", contenu: "Push the launch Reel and the link.", slides: [
    { texte: "We're live.", visuel: "Repost of en-p04." },
    { texte: "14-day free trial.", visuel: "App Store screenshot.", sticker: "Link: keeplyfidelity.app/links" },
  ] },
  { id: "en-s03", date: "2026-12-10", heure: "09:00", type: "Questions", titre: "Ask me anything", accroche: "Ask me anything about loyalty.", contenu: "Collect questions for future posts.", slides: [{ texte: "Ask me anything about loyalty cards.", visuel: "Founder photo", sticker: "Question box" }] },
  { id: "en-s04", date: "2026-12-18", heure: "09:00", type: "Tip", titre: "Where to put the QR", accroche: "QR code at eye level.", contenu: "Practical set-up tip.", slides: [{ texte: "Put the QR at eye level, next to the till.", visuel: "Counter poster photo." }] },
  { id: "en-s05", date: "2026-12-31", heure: "09:00", type: "Wishes", titre: "Happy new year", accroche: "May your customers come back.", contenu: "Simple wishes, no selling.", slides: [{ texte: "Happy new year. May your customers come back.", visuel: "Studio card with a gold stamp, Keeply logo." }] },
];

/* ------------------------------------------------- Assemblage */

const addHours = (heure: string, h: number) => {
  const [hh, mm] = heure.split(":").map(Number);
  return `${String(Math.min(23, hh + h)).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

const posts = (list: typeof FR, account: "fr" | "en"): PlanItem[] => list.map((p) => ({ ...p, account, kind: "post" }));

/** Chaque post est repartagé en story 2 h après (la story renvoie vers le post). */
const reposts = (list: PlanItem[]): PlanItem[] =>
  list.map((p) => ({
    id: `${p.id}-story`,
    account: p.account,
    kind: "story",
    date: p.date,
    heure: addHours(p.heure, 2),
    format: "Stories",
    type: p.account === "en" ? "Repost" : "Repost",
    titre: `${p.account === "en" ? "Repost" : "Repost"} : ${p.titre}`,
    accroche: p.accroche,
    contenu: p.account === "en" ? "Share the post to stories with a short line on top and a « new post » sticker." : "Partager le post en story, une phrase courte par-dessus et un sticker « nouveau post ».",
    repostOf: p.id,
  }));

/** TikTok : chaque Reel FR repart en natif (sans logo Instagram) le même jour à 19 h. */
const tiktok = (list: PlanItem[]): PlanItem[] =>
  list
    .filter((p) => p.format === "Reel")
    .map((p) => ({
      ...p,
      id: p.id.replace("fr-", "tt-"),
      account: "tiktok" as const,
      heure: "19:00",
      format: "TikTok" as const,
      hashtags: ["#restaurateur", "#fastfood", "#cafe", "#entrepreneur", "#fidelisation"],
      contenu: `${p.contenu}\n\nTikTok : republier la vidéo SANS filigrane Instagram, texte à l'écran un peu plus gros, son tendance discret si ça colle.`,
      boost: false,
    }));

const frPosts = posts(FR, "fr");
const enPosts = posts(EN, "en");

export const BASE_ITEMS: PlanItem[] = [
  ...frPosts,
  ...enPosts,
  ...tiktok(frPosts),
  ...reposts(frPosts),
  ...reposts(enPosts),
  ...STORIES_FR.map((s) => ({ ...s, account: "fr" as const, kind: "story" as const, format: "Stories" as const })),
  ...STORIES_EN.map((s) => ({ ...s, account: "en" as const, kind: "story" as const, format: "Stories" as const })),
].sort((a, b) => (a.date + a.heure).localeCompare(b.date + b.heure));

export const STRATEGY = {
  idee: "On ne parle qu'aux patrons. Chaque vidéo s'ouvre en les interpellant (« Vous avez un café ? »). Priorité France et Maroc ; les vidéos sont aussi montrées dans les autres pays où l'app est en ligne.",
  rythme: "FR : lundi, mercredi, jeudi, dimanche à 15 h 30 (Paris = Maroc en décembre). EN : 3 posts par semaine à 8 h Paris (18 h Sydney, 15 h Bali). TikTok : chaque Reel FR à 19 h. Chaque post repartagé en story 2 h après. Stories tous les jours.",
  boost: "Rien du 1 au 7/12. Ensuite on booste le meilleur post après 48 h (depuis le Gestionnaire de publicités, « Utiliser une publication existante », iPhone uniquement). ~60 € en décembre, ~120 € en janvier.",
  objectifs: "Fin décembre : 10 commerces actifs (cible haute 20), 30 essais, 25 démos, 300 prospects contactés. Fin février : 40 actifs.",
};
