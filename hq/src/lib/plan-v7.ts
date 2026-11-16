/*
 * Plan Instagram, TikTok et stories v8 (16/11/2026). Source : Keeply-Marketing/STRATEGIE-LANCEMENT.md.
 * Cible : les patrons (fast-foods, cafés, restaurants). Compte FR @keeplyfr, compte EN @keeplyapp, TikTok @keeplyfr.
 * Jamais d'anglais sur le compte FR ni l'inverse. Jamais de faux témoignage ni de chiffre inventé.
 * Les ids ne changent jamais : les déplacements et statuts faits dans HQ (clé ig-plan-v7) y sont accrochés.
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
  /** Pilier éditorial : Produit, Métier ou Coulisses. */
  pilier?: "Produit" | "Métier" | "Coulisses";
  /** Type éditorial : Démo, Conseil, Fondateur, Question… */
  type: string;
  titre: string;
  /** Ce qu'on entend ou lit dans les 2 premières secondes. */
  accroche: string;
  /** Texte de la couverture dans la grille (4 mots maximum). */
  couverture?: string;
  /** Pourquoi ce contenu marche, en clair. */
  angle?: string;
  /** Ce qu'il faut fabriquer : plans, slides, texte à l'écran. */
  contenu: string;
  legende?: string;
  hashtags?: string[];
  cta?: string;
  slides?: StorySlide[];
  /** Story qui republie un post : id du post. */
  repostOf?: string;
  boost?: boolean;
}

export const ACCOUNT_LABEL: Record<Account, string> = { fr: "Instagram FR · @keeplyfr", en: "Instagram EN · @keeplyapp", tiktok: "TikTok · @keeplyfr" };
export const ACCOUNT_SHORT: Record<Account, string> = { fr: "FR", en: "EN", tiktok: "TikTok" };

/* ------------------------------------------------------------ La marque */

export const BRAND = {
  idee: "Tout pour faire revenir vos clients. Dans une seule app.",
  ideeEn: "Everything you need to bring customers back. In one app.",
  pourquoi:
    "Keeply est une vraie app iPhone. Le patron y crée sa carte, scanne ses clients, envoie ses offres et voit qui revient, depuis son téléphone. Ses clients gardent la carte dans Apple Wallet ou Google Wallet. On le dit simplement, avec de vrais écrans, sans promettre ce qu'on ne peut pas prouver.",
  promesse: "Faites revenir vos clients plus souvent.",
  promesseEn: "Bring your customers back more often.",
  signature: "Keeply. La fidélité, facile.",
  signatureEn: "Keeply. Loyalty, made easy.",
  preuves: [
    "Une app native sur l'App Store : on gère tout depuis l'iPhone, rien à installer à la caisse.",
    "La carte des clients va dans Apple Wallet et dans Google Wallet.",
    "Créer la carte, scanner, envoyer une offre, voir ses habitués : tout se fait dans Keeply.",
    "Les notifications sur l'écran verrouillé sont gratuites.",
    "Une web app pour gérer aussi depuis un ordinateur.",
    "Le prix du pays, 14 jours gratuits.",
  ],
  gain: [
    { titre: "Vos clients reviennent plus souvent", texte: "Une récompense proche, et un rappel sur leur téléphone quand il ne leur manque qu'un tampon." },
    { titre: "Ceux qui ne viennent plus reçoivent une offre", texte: "Automatiquement après 30 jours d'absence, si vous l'activez." },
    { titre: "Vos heures calmes se remplissent", texte: "Double tampon ou coupon le mardi après-midi, envoyé en deux gestes." },
    { titre: "Vous ne payez plus d'impression ni de SMS", texte: "La carte est dans leur téléphone, les notifications sont gratuites." },
  ],
  gainRegle:
    "On explique comment Keeply fait gagner de l'argent, jamais combien : pas de « vous gagnerez X € », pas de « la meilleure solution ». Le chiffre vient d'un exemple marqué « exemple », ou du calcul que le patron fait avec son panier moyen.",
  interdit:
    "Jamais « la première app », « la seule », « numéro 1 » : d'autres apps natives existent (FaveCard Biz, VeeCard, Stampza, Stamp Me…). On peut dire que beaucoup de solutions passent par un site web, sans nommer de concurrent.",
  piliers: [
    { nom: "Produit", part: "50 %", texte: "Le produit en vrai, de face : démos sans coupe, vrais écrans, une fonction par post. Jamais de maquette truquée." },
    { nom: "Métier", part: "30 %", texte: "Ce qui aide un patron même s'il n'achète jamais : récompenses, coupons, mois creux, comptoir. On l'enregistre, on le partage." },
    { nom: "Coulisses", part: "20 %", texte: "Le fondateur, les démos sur le terrain, les vrais chiffres, les ratés. C'est ce qui fait confiance à un compte neuf." },
  ],
  onDit: [
    "Le vouvoiement, des phrases courtes, un verbe par phrase.",
    "Les mots du métier : comptoir, caisse, habitués, coup de feu, mois creux.",
    "Des chiffres vrais, ou écrits « exemple » sur le visuel.",
    "Une seule idée par visuel, un seul appel à l'action par post.",
    "Que chaque option s'active ou se coupe : le patron garde la main.",
  ],
  onDitPas: [
    "« Révolutionnaire », « boostez », « n'attendez plus », « game changer ».",
    "La peur (« vos clients vous quittent ») et l'urgence fabriquée.",
    "Un avis, une citation ou un logo de client qui n'existe pas.",
    "Les emojis en série, les points d'exclamation, le tiret long.",
    "Les tendances qui n'ont rien à voir avec un comptoir.",
    "Les phrases-sagesse (« janvier se prépare en décembre ») et les métaphores (« votre nouvelle vitrine ») : on dit le fait.",
  ],
  visuel: [
    "Fond blanc cassé, ou une vraie photo de comptoir. Beaucoup de vide.",
    "La carte Wallet est le seul objet coloré : entière, nette, jamais coupée.",
    "Le violet Keeply sert d'accent, pas de fond partout (10 % de l'image au plus).",
    "Grande typo, 6 mots au plus par visuel, aligné à gauche.",
    "Un seul geste par plan, des mouvements lents. Pas d'effets 3D bon marché.",
    "Le son : une musique discrète, ou le bruit réel du comptoir.",
  ],
  grille: "La grille alterne Produit, Métier, Coulisses. Chaque couverture porte 4 mots au plus, en haut, sur fond calme : vue de loin, la grille se lit comme un sommaire.",
  pays:
    "Compte FR : France, Belgique, Suisse, Luxembourg, Maroc, Tunisie, Algérie, Sénégal, Côte d'Ivoire et Québec. Compte EN : Canada anglophone, Pays-Bas, Australie, Bali (Indonésie). Tout le monde peut tomber sur les posts. Le budget pub, lui, va seulement à la France, au Maroc et un peu au Canada. Royaume-Uni : ajouté dans App Store Connect par le fondateur.",
};

/* ------------------------------------------------------------------ Profils */

export const PROFILES: Record<Account, { username: string; nom: string; categorie: string; bio: string; lien: string; lienTexte: string; boutons: string; epingles: string; photo: string }> = {
  fr: {
    username: "keeplyfr",
    nom: "Keeply | Carte de fidélité",
    categorie: "Logiciel",
    bio: "Faites revenir vos clients plus souvent.\nTout dans une app · Apple et Google Wallet\nRestaurants, cafés, fast-foods\nEssai gratuit 14 jours ↓",
    lien: "https://keeplyfidelity.app/liens?ct=ig_fr",
    lienTexte: "Une page, trois portes : l'app iPhone (le bon App Store selon le pays), la web app pour gérer depuis un ordinateur, et le site. Sur Android : la liste d'attente.",
    boutons: "Compte Entreprise, catégorie « Logiciel ». Boutons : WhatsApp Business et e-mail bonjour@keeplyfidelity.app.",
    epingles: "Épingler dans cet ordre : la démo en 20 s (la preuve), Ce que Keeply vous rapporte (l'argent), Tout dans une app (l'offre).",
    photo: "Le logo Keeply seul, blanc sur violet, bien centré dans le rond. Pas de texte.",
  },
  en: {
    username: "keeplyapp",
    nom: "Keeply | Loyalty cards",
    categorie: "App page",
    bio: "Bring your customers back more often.\nAll in one app · Apple & Google Wallet\nRestaurants, cafés, fast food\n14-day free trial ↓",
    lien: "https://keeplyfidelity.app/links?ct=ig_en",
    lienTexte: "One page, three doors: the iPhone app (right App Store for the country), the web app, and the website.",
    boutons: "Professional account, « App page ». Buttons: WhatsApp and email.",
    epingles: "Pin in this order: the 20-second demo, What Keeply earns you, All in one app.",
    photo: "Same Keeply logo, white on violet.",
  },
  tiktok: {
    username: "keeplyfr",
    nom: "Keeply | Carte de fidélité",
    categorie: "Logiciel",
    bio: "Toute votre fidélité dans une app. Apple et Google Wallet. Essai 14 jours.",
    lien: "https://keeplyfidelity.app/liens?ct=tt_fr",
    lienTexte: "Le lien cliquable en bio arrive à 1 000 abonnés. D'ici là, la bio renvoie à Instagram.",
    boutons: "Compte Entreprise, catégorie « Logiciel ».",
    epingles: "Épingler la démo en 20 s.",
    photo: "Le même logo que sur Instagram.",
  },
};

/* ------------------------------------------------------- Stories à la une */

export const HIGHLIGHTS: Record<"fr" | "en", { nom: string; question: string; contenu: string[] }[]> = {
  fr: [
    { nom: "Démo", question: "À quoi ça ressemble ?", contenu: ["La démo en 20 s, sans coupe", "Ce que voit le client : le QR, « Ajouter à Apple Wallet », la carte", "La notification sur l'écran verrouillé"] },
    { nom: "Comment", question: "C'est compliqué ?", contenu: ["Créez votre carte : 3 minutes", "Posez le QR au comptoir", "Scannez à chaque passage", "Tampons ou points, statuts, offres auto : chaque option s'active ou se coupe"] },
    { nom: "Tarifs", question: "Combien ça coûte ?", contenu: ["Le prix dans votre pays", "14 jours gratuits", "Vous arrêtez quand vous voulez, en deux gestes"] },
    { nom: "Questions", question: "Et si… ?", contenu: ["Une vraie question reçue par story, avec sa réponse", "« Ça marche sur Android ? »", "« Et s'il change de téléphone ? »"] },
    { nom: "Pays", question: "C'est dispo chez moi ?", contenu: ["Les pays où l'app est en ligne", "Android : la liste d'attente", "La web app, depuis n'importe quel ordinateur"] },
    { nom: "Fondateur", question: "Qui est derrière ?", contenu: ["Qui je suis, en 3 stories", "Pourquoi Keeply (le Reel)", "Les démos de la semaine"] },
  ],
  en: [
    { nom: "Demo", question: "What does it look like?", contenu: ["The 20-second uncut demo", "What customers see: QR, « Add to Apple Wallet », the card", "The lock-screen notification"] },
    { nom: "How", question: "Is it hard?", contenu: ["Create your card: 3 minutes", "Put the QR on your counter", "Scan at every visit", "Stamps or points, tiers, automatic offers: switch each one on or off"] },
    { nom: "Pricing", question: "How much?", contenu: ["Your country's price", "14-day free trial", "Cancel anytime, in two taps"] },
    { nom: "FAQ", question: "What if…?", contenu: ["One real question per story, with the answer"] },
    { nom: "Where", question: "Is it available here?", contenu: ["Countries where Keeply is live", "Android: waitlist", "Web app on any computer"] },
    { nom: "Founder", question: "Who's behind it?", contenu: ["Who I am, in 3 stories", "Why Keeply (the Reel)", "This week's demos"] },
  ],
};

export const HIGHLIGHT_COVERS =
  "Couvertures : rond blanc cassé, un pictogramme fin violet au centre (trait 2 px, style SF Symbols), aucun texte. Les six se ressemblent : c'est la répétition qui fait propre.";

/** Stories de tous les jours, en plus des séquences datées et des reposts. */
export const DAILY_STORIES: { jour: string; fr: string; en: string }[] = [
  { jour: "Lundi", fr: "La semaine qui commence : une photo vraie (bureau, comptoir visité, écran en cours) et une phrase.", en: "The week ahead: one real photo and one line." },
  { jour: "Mardi", fr: "Un sondage métier, une seule question (« Vous offrez quoi au 10e passage ? »).", en: "One owner poll, one question." },
  { jour: "Mercredi", fr: "Une fonction en 10 s, filmée sur l'écran, sans musique.", en: "One feature in 10 seconds, screen recording, no music." },
  { jour: "Jeudi", fr: "Boîte à questions : « Une question sur la fidélité ? »", en: "Question box: « Any question about loyalty? »" },
  { jour: "Vendredi", fr: "Une idée de récompense ou de coupon en une phrase, fond blanc, carte du Studio.", en: "One reward idea in one line, white background, Studio card." },
  { jour: "Week-end", fr: "Le post de la semaine en story, et les réponses aux questions de jeudi.", en: "The week's post in stories, and Thursday's answers." },
];

export const ENGAGEMENT = [
  "20 minutes par jour, avant de publier : 10 comptes.",
  "5 comptes du métier qui ont de l'audience (L'Hôtellerie Restauration, Néo-restauration, Atabula ; en anglais Restaurant Business). Commenter tôt, avec une vraie remarque.",
  "3 comptes voisins : petites marques et créateurs du même univers (outils pour commerces, entrepreneurs food).",
  "2 commerces des villes visées. Commenter pendant des semaines avant tout message, jamais de vente en commentaire.",
  "Compte neuf, semaines 1-2 : 10 à 15 abonnements, 30 à 50 J'aime, 5 à 10 commentaires, 0 à 5 messages par jour. Semaines 3-4 : 20 à 30 abonnements, 5 à 10 messages. Toujours en 2 ou 3 petites sessions.",
  "Messages privés : chacun écrit pour ce commerce, avec la carte démo à ses couleurs. Jamais de lien dans le premier message.",
  "« Action bloquée » : tout arrêter 48 h, puis reprendre à la moitié du rythme.",
];

/* ---------------------------------------------------------- Posts FR */

const H_FR = ["#cartedefidelite", "#restaurateur", "#fastfood", "#cafe", "#fidelisation"];
const H_EN = ["#loyaltyprogram", "#restaurantowner", "#cafeowner", "#smallbusiness", "#applewallet"];

const FR: Omit<PlanItem, "account" | "kind">[] = [
  {
    id: "fr-p01", date: "2026-11-24", heure: "15:30", format: "Reel", pilier: "Produit", type: "Présentation",
    titre: "Pour les restaurants, les cafés et les fast-foods",
    accroche: "Pour les restaurants, les cafés et les fast-foods. Et pour leurs habitués.",
    couverture: "Restaurants, cafés, fast-foods",
    angle: "Le premier post dit simplement pour qui est Keeply. Un patron se reconnaît dans la première seconde, sans slogan.",
    contenu: "Reel 10 s, fond calme, plans lents. Trois comptoirs, un par plan, avec un seul mot à l'écran : « Restaurants. » (une salle avant le service), « Cafés. » (une tasse posée sur le zinc), « Fast-foods. » (un plateau qui glisse). Dernier plan : un client tend son iPhone, la carte de fidélité apparaît dans le Wallet. Texte : « Et leurs habitués. » Logo Keeply à la fin seulement.",
    legende: "Keeply est l'app de fidélité des restaurants, des cafés et des fast-foods. Vous gérez tout depuis votre iPhone, et vos clients gardent leur carte dans Apple Wallet ou Google Wallet.\n\nSur ce compte, on vous montre Keeply en vrai et ce qui fait revenir les clients.",
    hashtags: H_FR, cta: "Suivez le compte",
  },
  {
    id: "fr-p02", date: "2026-11-26", heure: "15:30", format: "Carrousel", pilier: "Produit", type: "L'offre",
    titre: "Tout dans une app",
    accroche: "Tout pour faire revenir vos clients. Dans une seule app.",
    couverture: "Tout dans une app",
    angle: "Le post qu'on épingle : en 7 slides, un patron voit tout ce que fait Keeply, depuis son iPhone.",
    contenu: "Carrousel 7 slides 1080×1350, fond blanc cassé, une phrase par slide alignée à gauche, un vrai écran de l'app à chaque slide.\n1 « Tout pour faire revenir vos clients. Dans une seule app. »\n2 « Créez votre carte en 3 minutes. » (écran du Studio)\n3 « Vos clients l'ajoutent à Apple Wallet ou Google Wallet. »\n4 « Vous les scannez avec votre iPhone. »\n5 « Vous envoyez une offre sur leur écran verrouillé. »\n6 « Vous voyez qui revient, et quand. » (liste des clients)\n7 « 14 jours gratuits. Lien en bio. »",
    legende: "Keeply est une app iPhone. Vous y créez votre carte de fidélité, vous scannez vos clients, vous leur envoyez des offres et vous voyez qui revient.\n\nVos clients, eux, gardent la carte dans Apple Wallet ou Google Wallet. 14 jours gratuits, lien en bio.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p03", date: "2026-11-28", heure: "15:30", format: "Reel", pilier: "Coulisses", type: "Fondateur",
    titre: "Pourquoi Keeply",
    accroche: "Les grandes chaînes sont dans le téléphone de leurs clients. Le snack d'en bas, non.",
    couverture: "Pourquoi Keeply",
    angle: "Un compte neuf sans clients à montrer vend d'abord une personne. Une histoire vraie vaut plus qu'un beau montage.",
    contenu: "Reel 30 à 40 s, face caméra, lumière du jour, sous-titres mot à mot. Anas raconte LE moment vrai qui a donné l'idée [à écrire par lui, 2 phrases, sans enjoliver]. Puis : « Les grandes chaînes sont dans le téléphone de leurs clients. Le snack d'en bas, non. Keeply, c'est pour lui. » Un seul plan de coupe : le comptoir où l'idée est née, si possible.",
    legende: "[Le moment vrai qui m'a donné l'idée, en 2 phrases.]\n\nLes grandes chaînes ont leur carte de fidélité dans le téléphone de leurs clients. Je voulais que le snack d'en bas, le café du coin et le petit resto aient la même chose.\n\nC'est Keeply.",
    hashtags: [...H_FR, "#entrepreneur"], cta: "Suivez l'aventure",
  },
  {
    id: "fr-p04", date: "2026-12-01", heure: "12:30", format: "Reel", pilier: "Produit", type: "Lancement · Démo", boost: true,
    titre: "Lancement · 20 secondes",
    accroche: "20 secondes. Sans coupe.",
    couverture: "20 secondes, sans coupe",
    angle: "La preuve la plus forte, c'est un plan séquence : personne ne peut croire que c'est truqué.",
    contenu: "Reel 20 s en UN seul plan, chrono discret en haut. Un client s'approche du comptoir, scanne le QR, touche « Ajouter à Apple Wallet », tend son téléphone, le patron scanne, le tampon apparaît. Fin sur fond blanc : « Keeply est disponible. » Vrais écrans, aucun effet.",
    legende: "20 secondes, sans coupe.\nVotre client scanne, sa carte est dans son Wallet, vous le tamponnez à la caisse.\n\nKeeply est disponible. 14 jours gratuits, lien en bio.",
    hashtags: H_FR, cta: "14 jours gratuits, lien en bio",
  },
  {
    id: "fr-p05", date: "2026-12-03", heure: "15:30", format: "Carrousel", pilier: "Métier", type: "Conseil",
    titre: "5 récompenses qui font revenir",
    accroche: "5 récompenses qui font revenir. Et 2 à éviter.",
    couverture: "5 récompenses qui marchent",
    angle: "Utile même pour un patron qui n'utilisera jamais Keeply : c'est ce qu'on enregistre et ce qu'on envoie à un ami.",
    contenu: "Carrousel 8 slides, une récompense par slide avec une ligne d'explication.\n1 Couverture\n2 Le café offert au 8e passage (assez proche pour motiver)\n3 La remise au palier\n4 Le coupon d'anniversaire\n5 « Vous nous manquez » après 30 jours d'absence (part tout seul, si vous l'activez)\n6 Le double tampon les jours creux\n7 À éviter : la récompense à 20 passages, la remise sans limite\n8 « Enregistrez pour votre prochaine carte. »",
    legende: "Une récompense qu'on atteint en quelques passages donne envie de revenir dès la semaine suivante.\n\nEnregistrez ce post pour votre prochaine carte.",
    hashtags: H_FR, cta: "Enregistrez ce post",
  },
  {
    id: "fr-p06", date: "2026-12-06", heure: "18:00", format: "Reel", pilier: "Produit", type: "Démo",
    titre: "Votre iPhone suffit",
    accroche: "Pour tamponner une carte de fidélité, votre iPhone suffit.",
    couverture: "Votre iPhone suffit",
    angle: "Lève une crainte concrète (« il faut une tablette, un lecteur, un logiciel de caisse ») en montrant le geste.",
    contenu: "Reel 15 s. Gros plan à la caisse : le patron sort son iPhone, ouvre Keeply, scanne la carte du client, le tampon s'ajoute. Texte à l'écran : « Votre iPhone suffit. » puis « Keeply, sur l'App Store. »",
    legende: "Keeply s'installe depuis l'App Store. Vous scannez la carte de vos clients avec l'appareil photo de votre iPhone, en une seconde, à la caisse.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p07", date: "2026-12-07", heure: "15:30", format: "Reel", pilier: "Produit", type: "Démo",
    titre: "Créer sa carte en 3 minutes",
    accroche: "Créer sa carte de fidélité : 3 minutes.",
    couverture: "Votre carte en 3 minutes",
    angle: "Lève la peur n°1 du patron : « je n'ai pas le temps ».",
    contenu: "Enregistrement d'écran de l'app, accéléré mais sans coupe, chrono à l'écran : le logo, les couleurs, la récompense, le QR prêt à imprimer. Dernier plan : l'affiche posée sur un vrai comptoir.",
    legende: "Votre logo, vos couleurs, votre récompense, votre QR.\n3 minutes, et la carte est prête.\n\nEssayez gratuitement, lien en bio.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p08", date: "2026-12-09", heure: "15:30", format: "Reel", pilier: "Produit", type: "Question de patron",
    titre: "Rien à télécharger",
    accroche: "« Mes clients ne vont pas télécharger une appli. » Ils n'ont pas à le faire.",
    couverture: "Rien à télécharger",
    angle: "L'objection qu'on entend à chaque démo, levée en 20 secondes.",
    contenu: "Reel 20 s, côté client : l'appareil photo de l'iPhone, le QR, « Ajouter à Apple Wallet », la carte. Puis la même chose sur un Android avec Google Wallet. Fin.",
    legende: "Vos clients n'installent rien. Ils scannent le QR et la carte va dans leur Wallet, à côté de leur carte bancaire, sur iPhone comme sur Android.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p09", date: "2026-12-10", heure: "15:30", format: "Carrousel", pilier: "Métier", type: "Le calcul",
    titre: "Combien vaut un habitué ?",
    accroche: "Combien vaut un habitué sur un an ?",
    couverture: "Combien vaut un habitué ?",
    angle: "Le patron fait le calcul lui-même : rien d'inventé, et il repart avec son propre chiffre.",
    contenu: "Carrousel 6 slides, un calcul par slide, écrit « exemple » en petit sur chaque slide chiffrée. Panier de 10 €, un client qui vient une fois par semaine : 520 € par an. S'il vient une fois de plus par mois : +120 €. Puis le prix de Keeply ramené au jour. Version Maroc : prix comme sur l'App Store local. Dernière slide : « Refaites le calcul avec votre panier. »",
    legende: "Faites le calcul avec votre panier moyen.\nUn habitué qui revient un peu plus souvent, ça se voit sur un mois.\n\n(Les chiffres du post sont un exemple.)",
    hashtags: H_FR, cta: "Enregistrez · lien en bio",
  },
  {
    id: "fr-p10", date: "2026-12-13", heure: "18:00", format: "Reel", pilier: "Coulisses", type: "Terrain",
    titre: "Ce que les patrons m'ont demandé",
    accroche: "Cette semaine, j'ai montré Keeply à des patrons. Voilà ce qu'ils m'ont demandé.",
    couverture: "Ce qu'ils m'ont demandé",
    angle: "Du terrain, pas du discours : les vraies questions entendues pendant les démos.",
    contenu: "Reel 30 s : les VRAIES questions de la semaine, une par plan, avec la réponse courte. Filmé au téléphone, dans la rue ou devant les commerces. Aucune citation ni aucun nom de commerce sans accord écrit.",
    legende: "Cette semaine, des démos dans des cafés et des snacks.\nLes questions qui reviennent, et mes réponses.\n\nPosez la vôtre en commentaire.",
    hashtags: [...H_FR, "#entrepreneur"], cta: "Votre question en commentaire",
  },
  {
    id: "fr-p11", date: "2026-12-14", heure: "15:30", format: "Reel", pilier: "Métier", type: "Film de marque", boost: true,
    titre: "À travers les âges",
    accroche: "Certains clients restent toute une vie.",
    couverture: "Certains clients restent",
    angle: "Le seul film émotionnel du mois : il dit ce que Keeply veut dire, sans montrer une fonction.",
    contenu: "La pub « À travers les âges » (Julie et le pizzaiolo, de 15 à 45 ans), 60 s, plus une version 15 s pour le boost. Montage, musique et vrai logo faits dans Claude Code à partir des vidéos Higgsfield. Si elle n'est pas prête : échanger avec fr-p13.",
    legende: "Certains clients restent toute une vie.\n\nKeeply. La fidélité, facile.",
    hashtags: H_FR, cta: "Keeply. La fidélité, facile.",
  },
  {
    id: "fr-p12", date: "2026-12-16", heure: "15:30", format: "Reel", pilier: "Produit", type: "Démo",
    titre: "Apple Wallet et Google Wallet",
    accroche: "Votre carte de fidélité, dans Apple Wallet et dans Google Wallet.",
    couverture: "Apple Wallet et Google Wallet",
    angle: "L'iPhone et l'Android côte à côte : le patron voit que tous ses clients sont couverts.",
    contenu: "Reel 15 s, écran partagé : un iPhone à gauche, un Android à droite. Les deux scannent le même QR au même moment, la même carte arrive dans Apple Wallet et dans Google Wallet. Texte final : « Tous vos clients. »",
    legende: "Sur iPhone, la carte va dans Apple Wallet. Sur Android, dans Google Wallet. Vos clients scannent le même QR au comptoir.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p13", date: "2026-12-17", heure: "15:30", format: "Carrousel", pilier: "Produit", type: "Fonctions",
    titre: "Une offre sur leur écran verrouillé",
    accroche: "Envoyez une offre sur l'écran verrouillé de vos clients. Gratuitement.",
    couverture: "Une offre, gratuite",
    angle: "La fonction qui fait revenir, montrée telle quelle, avec le rappel que tout se coupe.",
    contenu: "Carrousel 7 slides, un vrai écran par slide : la notification reçue sur l'écran verrouillé · l'envoi depuis Keeply en deux gestes · l'offre d'anniversaire automatique · « vous nous manquez » après 30 jours · les statuts Bronze, Argent, Or. Sur chaque slide, un petit interrupteur et la phrase « s'active ou se coupe en un geste ».",
    legende: "Une notification sur l'écran verrouillé de vos clients, sans payer de SMS. Vous l'écrivez dans Keeply et elle part.\n\nOffres automatiques, statuts et notifications s'activent ou se coupent en un geste.",
    hashtags: H_FR, cta: "Enregistrez",
  },
  {
    id: "fr-p14", date: "2026-12-20", heure: "18:00", format: "Reel", pilier: "Produit", type: "Question de patron",
    titre: "Et s'il change de téléphone ?",
    accroche: "« Et si mon client change de téléphone ? »",
    couverture: "Nouveau téléphone ?",
    angle: "Une vraie question, une démo, terminé.",
    contenu: "Reel 20 s : la question à l'écran, puis la réponse en démo : il ouvre le lien reçu par e-mail et retrouve sa carte et ses points.",
    legende: "Il retrouve sa carte et ses points avec le lien reçu par e-mail.\nRien n'est perdu.\n\nUne autre question ? En message privé.",
    hashtags: H_FR, cta: "Vos questions en message",
  },
  {
    id: "fr-p15", date: "2026-12-21", heure: "15:30", format: "Reel", pilier: "Produit", type: "Saison",
    titre: "Relancer ceux qui ne reviennent pas",
    accroche: "En janvier, Keeply relance pour vous les clients qui ne sont pas revenus.",
    couverture: "Relance automatique",
    angle: "Une fonction précise au bon moment de l'année : après les fêtes, les habitués tardent à revenir.",
    contenu: "Reel 20 s : on active l'offre « vous nous manquez » en deux gestes (et on montre comment la couper). Puis la notification qui arrive chez un client absent depuis 30 jours.",
    legende: "Après les fêtes, beaucoup d'habitués mettent du temps à revenir. Keeply peut leur envoyer une offre tout seul au bout de 30 jours d'absence. Vous l'activez, ou pas.",
    hashtags: H_FR, cta: "14 jours gratuits, lien en bio",
  },
  {
    id: "fr-p16", date: "2026-12-23", heure: "15:30", format: "Carrousel", pilier: "Métier", type: "Conseil",
    titre: "3 coupons pour janvier",
    accroche: "3 coupons pour les semaines calmes de janvier.",
    couverture: "3 coupons pour janvier",
    angle: "Du concret à ressortir le jour venu : on l'enregistre.",
    contenu: "Carrousel 6 slides : le café offert du lundi au mercredi · « venez avec un ami » · le double tampon après 15 h. Chaque idée sur une carte du Studio. Un produit offert passe toujours par un coupon.",
    legende: "Trois idées simples pour les semaines calmes de janvier.\nEnregistrez-les, vous les ressortirez le moment venu.",
    hashtags: H_FR, cta: "Enregistrez",
  },
  {
    id: "fr-p17", date: "2026-12-26", heure: "18:00", format: "Reel", pilier: "Coulisses", type: "Bilan",
    titre: "Un mois de Keeply",
    accroche: "Un mois de Keeply. Ce qui a marché, ce qui a raté.",
    couverture: "Un mois, les vrais chiffres",
    angle: "L'honnêteté est la meilleure publicité d'un compte neuf.",
    contenu: "Reel 40 s face caméra. Uniquement les VRAIS chiffres (démos faites, essais, commerces inscrits) et une chose qui n'a pas marché. Si les chiffres sont petits, on le dit.",
    legende: "Un mois après le lancement.\n[Les vrais chiffres, ce qui a marché, ce qui a raté.]\n\nLa suite en janvier.",
    hashtags: [...H_FR, "#entrepreneur"], cta: "Suivez la suite",
  },
  {
    id: "fr-p18", date: "2026-12-28", heure: "15:30", format: "Reel", pilier: "Produit", type: "Démo",
    titre: "Vos habitués, dans votre téléphone",
    accroche: "Qui sont vos habitués ? Keeply vous le montre.",
    couverture: "Vos habitués",
    angle: "Montre ce qu'aucune carte papier ne donne : savoir qui revient.",
    contenu: "Reel 20 s, enregistrement d'écran : la liste des clients, un client avec ses passages, le palier qu'il approche, puis l'envoi d'un coupon à ceux qui ne sont pas venus depuis un mois. Données de démo uniquement, jamais de vrais clients.",
    legende: "Avec Keeply, vous voyez qui revient, combien de fois, et qui n'est pas venu depuis un mois. Tout est dans l'app, sur votre téléphone.",
    hashtags: H_FR, cta: "Lien en bio",
  },
  {
    id: "fr-p19", date: "2026-12-02", heure: "15:30", format: "Carrousel", pilier: "Produit", type: "Ce que ça rapporte",
    titre: "Ce que Keeply vous rapporte",
    accroche: "Ce que Keeply vous rapporte.",
    couverture: "Ce que ça rapporte",
    angle: "Le post qui parle argent sans rien promettre : quatre mécanismes vrais, puis le patron fait son propre calcul.",
    contenu: "Carrousel 6 slides, fond blanc cassé, un vrai écran de l'app par slide.\n1 « Ce que Keeply vous rapporte. »\n2 « Vos clients reviennent plus souvent. » Une récompense proche et un rappel quand il ne manque qu'un tampon.\n3 « Ceux qui ne viennent plus reçoivent une offre. » Automatiquement après 30 jours, si vous l'activez.\n4 « Vos heures calmes se remplissent. » Double tampon ou coupon le mardi après-midi.\n5 « Plus de cartes à imprimer, plus de SMS à payer. »\n6 « Faites le calcul avec votre panier moyen. » + lien en bio.",
    legende: "Keeply sert à une chose : que vos clients reviennent plus souvent. Ils gardent votre carte dans leur téléphone, Keeply relance ceux qui s'absentent, et vous remplissez les heures calmes avec une offre.\n\nEnregistrez ce post et refaites le calcul avec votre panier moyen.",
    hashtags: H_FR, cta: "Enregistrez · lien en bio",
  },
];

/* ---------------------------------------------------------- Posts EN */

const EN: Omit<PlanItem, "account" | "kind">[] = [
  { id: "en-p01", date: "2026-11-24", heure: "08:00", format: "Reel", pilier: "Produit", type: "Introduction", titre: "For restaurants, cafés and fast food", accroche: "For restaurants, cafés and fast food. And their regulars.", couverture: "Restaurants, cafés, fast food", contenu: "Same edit as fr-p01, English words on screen: « Restaurants. » « Cafés. » « Fast food. » then « And their regulars. »", legende: "Keeply is the loyalty card for restaurants, cafés and fast food. Customers add it to their phone by scanning a QR code at the counter, then find it again on every visit.\n\nOn this account we show Keeply for real and share what brings customers back.", hashtags: H_EN, cta: "Follow" },
  { id: "en-p02", date: "2026-11-26", heure: "08:00", format: "Carrousel", pilier: "Produit", type: "The offer", titre: "All in one app", accroche: "Everything you need to bring customers back. In one app.", couverture: "All in one app", contenu: "English version of fr-p02, app screens in English. Slide 7: « 14 days free. Link in bio. »", legende: "Keeply is an iPhone app. You create your loyalty card, scan customers, send offers and see who comes back.\n\nYour customers keep the card in Apple Wallet or Google Wallet. 14-day free trial, link in bio.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p03", date: "2026-11-29", heure: "08:00", format: "Reel", pilier: "Coulisses", type: "Founder", titre: "Why Keeply", accroche: "Big chains live on their customers' phones. The corner café doesn't.", couverture: "Why Keeply", contenu: "Anas to camera, in English with subtitles (the accent is fine, it feels real). Same true story as fr-p03.", legende: "[The real moment that sparked the idea, in 2 sentences.]\n\nBig chains have their loyalty card on their customers' phones. I wanted the corner café and the local burger place to have the same.\n\nThat's Keeply.", hashtags: [...H_EN, "#founder"], cta: "Follow the journey" },
  { id: "en-p04", date: "2026-12-01", heure: "08:00", format: "Reel", pilier: "Produit", type: "Launch · Demo", boost: true, titre: "Launch · 20 seconds", accroche: "20 seconds. One take.", couverture: "20 seconds, one take", contenu: "Same single-take 20-second demo as fr-p04, English text. End: « Keeply is live. »", legende: "20 seconds, one take.\nYour customer scans, the card is in their Wallet, you stamp it at the counter.\n\nKeeply is live. 14-day free trial, link in bio.", hashtags: H_EN, cta: "14-day free trial, link in bio" },
  { id: "en-p05", date: "2026-12-03", heure: "08:00", format: "Carrousel", pilier: "Métier", type: "Tip", titre: "5 rewards that bring them back", accroche: "5 rewards that bring customers back. And 2 to avoid.", couverture: "5 rewards that work", contenu: "English version of fr-p05.", legende: "A reward customers can reach in a few visits makes them want to come back the following week.\n\nSave this for your next card.", hashtags: H_EN, cta: "Save this post" },
  { id: "en-p06", date: "2026-12-06", heure: "08:00", format: "Reel", pilier: "Produit", type: "Demo", titre: "Your iPhone is enough", accroche: "To stamp a loyalty card, your iPhone is enough.", couverture: "Your iPhone is enough", contenu: "English version of fr-p06.", legende: "Keeply installs from the App Store. You scan your customers' cards with your iPhone camera, in a second, at the till.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p07", date: "2026-12-07", heure: "08:00", format: "Reel", pilier: "Produit", type: "Demo", titre: "Your card in 3 minutes", accroche: "Building a loyalty card: 3 minutes.", couverture: "Your card in 3 minutes", contenu: "English version of fr-p07 (app in English).", legende: "Your logo, your colours, your reward, your QR code.\n3 minutes and the card is ready.\n\nTry it free, link in bio.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p08", date: "2026-12-09", heure: "08:00", format: "Reel", pilier: "Produit", type: "Owner question", titre: "Nothing to download", accroche: "« My customers won't download an app. » They don't have to.", couverture: "Nothing to download", contenu: "English version of fr-p08.", legende: "Your customers install nothing. They scan the QR and the card goes into their Wallet, next to their bank card, on iPhone and Android alike.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p11", date: "2026-12-14", heure: "08:00", format: "Reel", pilier: "Métier", type: "Brand film", boost: true, titre: "Through the years", accroche: "Some customers stay for a lifetime.", couverture: "Some customers stay", contenu: "The « Through the years » brand film (no dialogue), English end card.", legende: "Some customers stay for a lifetime.\n\nKeeply. Loyalty, made easy.", hashtags: H_EN, cta: "Keeply. Loyalty, made easy." },
  { id: "en-p12", date: "2026-12-16", heure: "08:00", format: "Reel", pilier: "Produit", type: "Demo", titre: "Apple Wallet and Google Wallet", accroche: "Your loyalty card, in Apple Wallet and Google Wallet.", couverture: "Apple and Google Wallet", contenu: "Same split-screen edit as fr-p12, end text: « All your customers. »", legende: "On iPhone the card goes into Apple Wallet, on Android into Google Wallet. Customers scan the same QR at the counter.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p13", date: "2026-12-17", heure: "08:00", format: "Carrousel", pilier: "Produit", type: "Features", titre: "An offer on their lock screen", accroche: "Send an offer to your customers' lock screen. For free.", couverture: "An offer, for free", contenu: "English version of fr-p13, with the on/off switch on every slide.", legende: "A notification on your customers' lock screen, with no SMS to pay for. You write it in Keeply and it goes out.\n\nAutomatic offers, tiers and notifications switch on or off in one tap.", hashtags: H_EN, cta: "Save this" },
  { id: "en-p14", date: "2026-12-20", heure: "08:00", format: "Reel", pilier: "Produit", type: "Owner question", titre: "New phone?", accroche: "« What if my customer gets a new phone? »", couverture: "New phone?", contenu: "English version of fr-p14.", legende: "They get their card and points back with the link they received by email.\nNothing is lost.", hashtags: H_EN, cta: "Questions? Send us a message" },
  { id: "en-p15", date: "2026-12-21", heure: "08:00", format: "Reel", pilier: "Produit", type: "Season", titre: "Win back the ones who stopped coming", accroche: "In January, Keeply reaches out to the customers who haven't come back.", couverture: "Automatic win-back", contenu: "English version of fr-p15.", legende: "After the holidays, many regulars take a while to come back. Keeply can send them an offer on its own after 30 days away. Your call.", hashtags: H_EN, cta: "14-day free trial, link in bio" },
  { id: "en-p18", date: "2026-12-28", heure: "08:00", format: "Reel", pilier: "Produit", type: "Demo", titre: "Your regulars, on your phone", accroche: "Who are your regulars? Keeply shows you.", couverture: "Your regulars", contenu: "English version of fr-p18, demo data only.", legende: "With Keeply you see who comes back, how often, and who hasn't visited in a month. It's all in the app, on your phone.", hashtags: H_EN, cta: "Link in bio" },
  { id: "en-p19", date: "2026-12-02", heure: "08:00", format: "Carrousel", pilier: "Produit", type: "What it earns you", titre: "What Keeply earns you", accroche: "What Keeply earns you.", couverture: "What it earns you", contenu: "English version of fr-p19, app screens in English.", legende: "Keeply does one job: it brings your customers back more often. They keep your card on their phone, Keeply reaches out to the ones who stop coming, and you fill quiet hours with an offer.\n\nSave this and run the numbers with your average ticket.", hashtags: H_EN, cta: "Save · link in bio" },
];

/* ------------------------------------------------- Stories datées (hors reposts) */

const STORIES_FR: Omit<PlanItem, "account" | "kind" | "format">[] = [
  { id: "fr-s01", date: "2026-11-24", heure: "19:00", type: "Ouverture", titre: "Le compte ouvre", accroche: "Ici, on parle aux patrons.", contenu: "Faire réagir les premiers abonnés et savoir où ils en sont.", slides: [
    { texte: "Ici, on parle aux patrons.", visuel: "Fond blanc cassé, texte violet, aligné à gauche." },
    { texte: "Vous avez une carte de fidélité aujourd'hui ?", visuel: "Fond blanc", sticker: "Sondage : En carton / Dans une appli / Pas encore" },
  ] },
  { id: "fr-s02", date: "2026-11-27", heure: "19:00", type: "Coulisses", titre: "J-4", accroche: "J-4.", contenu: "Montrer le travail, créer l'attente sans en faire trop.", slides: [
    { texte: "J-4.", visuel: "Vidéo du bureau, l'écran de l'app volontairement flou." },
    { texte: "Mardi 1er décembre, 12 h 30.", visuel: "Fond blanc", sticker: "Compte à rebours « Keeply »" },
  ] },
  { id: "fr-s03", date: "2026-11-30", heure: "19:00", type: "Veille", titre: "Demain", accroche: "Demain, 12 h 30.", contenu: "Récolter les freins des patrons (ce seront des sujets de posts).", slides: [
    { texte: "Demain, 12 h 30.", visuel: "Fond blanc, la carte du Studio qui glisse.", sticker: "Compte à rebours" },
    { texte: "Qu'est-ce qui vous retient d'avoir une carte de fidélité ?", visuel: "Fond blanc", sticker: "Boîte à questions" },
  ] },
  { id: "fr-s04", date: "2026-12-01", heure: "13:00", type: "Lancement", titre: "C'est en ligne", accroche: "Keeply est disponible.", contenu: "Pousser le Reel de lancement et le lien.", slides: [
    { texte: "C'est en ligne.", visuel: "Repost du Reel fr-p04." },
    { texte: "14 jours gratuits.", visuel: "La fiche App Store, propre.", sticker: "Lien : keeplyfidelity.app/liens" },
    { texte: "Une question ? Écrivez-moi.", visuel: "Photo d'Anas, lumière naturelle.", sticker: "Bouton message" },
  ] },
  { id: "fr-s05", date: "2026-12-04", heure: "19:00", type: "Réponses", titre: "Vos questions", accroche: "Vous m'avez demandé…", contenu: "Répondre aux questions de fr-s03, une par story.", slides: [
    { texte: "Vous m'avez demandé…", visuel: "La question reçue, en sticker réponse." },
    { texte: "[La réponse en une phrase]", visuel: "Enregistrement d'écran de 5 s." },
  ] },
  { id: "fr-s06", date: "2026-12-08", heure: "19:00", type: "Mini-démo", titre: "Une récompense en 10 s", accroche: "Une récompense, 10 secondes.", contenu: "Montrer une fonction précise.", slides: [
    { texte: "Une récompense, 10 secondes.", visuel: "Enregistrement d'écran accéléré." },
    { texte: "Et vous la coupez quand vous voulez.", visuel: "Gros plan sur l'interrupteur." },
  ] },
  { id: "fr-s07", date: "2026-12-11", heure: "19:00", type: "Quiz", titre: "Le quiz du patron", accroche: "À votre avis ?", contenu: "Engagement : les quiz font monter la portée des stories suivantes.", slides: [
    { texte: "Où vos clients regardent-ils le plus souvent ?", visuel: "Fond blanc", sticker: "Quiz : Leurs e-mails / Leur écran verrouillé / Vos affiches" },
    { texte: "Leur écran verrouillé. C'est là que Keeply les prévient.", visuel: "Notification sur écran verrouillé." },
  ] },
  { id: "fr-s08", date: "2026-12-15", heure: "19:00", type: "Coulisses", titre: "Les coulisses du film", accroche: "Comment on a fait ce film.", contenu: "Le making-of de « À travers les âges ».", slides: [
    { texte: "Comment on a fait ce film.", visuel: "Animatic et image finale côte à côte." },
    { texte: "Vous l'avez vu ?", visuel: "Repost de fr-p11.", sticker: "Curseur ❤️" },
  ] },
  { id: "fr-s09", date: "2026-12-18", heure: "19:00", type: "Astuce", titre: "Où poser le QR", accroche: "Le QR, à hauteur des yeux.", contenu: "Un conseil concret de mise en place.", slides: [
    { texte: "Posez le QR à hauteur des yeux, près de la caisse.", visuel: "Photo de l'affiche Caisse A5 sur un vrai comptoir." },
    { texte: "Et dites-le : « Vous avez notre carte ? »", visuel: "Fond blanc, texte violet." },
  ] },
  { id: "fr-s10", date: "2026-12-22", heure: "19:00", type: "Sondage", titre: "Les fêtes", accroche: "Vous fermez pour les fêtes ?", contenu: "Préparer le post de janvier.", slides: [
    { texte: "Vous fermez pour les fêtes ?", visuel: "Fond blanc", sticker: "Sondage : Oui / Non" },
    { texte: "En janvier, une offre peut partir toute seule vers ceux qui ne reviennent pas.", visuel: "L'écran de l'offre auto." },
  ] },
  { id: "fr-s11", date: "2026-12-31", heure: "17:00", type: "Vœux", titre: "Bonne année", accroche: "Que vos clients reviennent.", contenu: "Des vœux simples, aucune vente.", slides: [
    { texte: "Bonne année.", visuel: "La carte du Studio avec un tampon doré." },
    { texte: "Et que vos clients reviennent.", visuel: "Fond blanc cassé, logo Keeply." },
  ] },
];

const STORIES_EN: Omit<PlanItem, "account" | "kind" | "format">[] = [
  { id: "en-s01", date: "2026-11-24", heure: "09:00", type: "Opening", titre: "We're open", accroche: "We talk to owners here.", contenu: "First poll to learn where followers stand.", slides: [
    { texte: "We talk to owners here.", visuel: "Off-white background, violet text, left-aligned." },
    { texte: "Do you run a loyalty card today?", visuel: "White background", sticker: "Poll: Paper / App / Not yet" },
  ] },
  { id: "en-s02", date: "2026-12-01", heure: "09:00", type: "Launch", titre: "We're live", accroche: "Keeply is live.", contenu: "Push the launch Reel and the link.", slides: [
    { texte: "We're live.", visuel: "Repost of en-p04." },
    { texte: "14-day free trial.", visuel: "App Store listing.", sticker: "Link: keeplyfidelity.app/links" },
  ] },
  { id: "en-s03", date: "2026-12-10", heure: "09:00", type: "Questions", titre: "Ask me anything", accroche: "Any question about loyalty?", contenu: "Collect questions for future posts.", slides: [{ texte: "Any question about loyalty cards?", visuel: "Founder photo, daylight.", sticker: "Question box" }] },
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
    type: "Repost",
    titre: `Repost : ${p.titre}`,
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
  marque: "« Tout pour faire revenir vos clients. Dans une seule app. » Trois piliers : le produit de face (50 %), le métier (30 %), les coulisses (20 %).",
  idee: "On ne parle qu'aux patrons. Chaque vidéo s'ouvre en les interpellant (« Vous avez un café ? »). Priorité France et Maroc ; les vidéos sont aussi montrées dans les autres pays où l'app est en ligne.",
  rythme: "FR : lundi, mercredi, jeudi, dimanche à 15 h 30 (Paris = Maroc en décembre). EN : 3 posts par semaine à 8 h Paris (18 h Sydney, 15 h Bali). TikTok : chaque Reel FR à 19 h. Chaque post repartagé en story 2 h après. Stories tous les jours.",
  boost: "Les posts sont visibles partout où l'app est disponible, mais l'argent va à la France et au Maroc, plus un petit test au Canada pour voir si c'est viable. Rien du 1 au 7/12, ensuite on booste le meilleur post après 48 h (Gestionnaire de publicités, « Utiliser une publication existante », iPhone uniquement). ~60 € en décembre (France 30, Maroc 20, Canada 10), ~120 € en janvier selon les résultats.",
  objectifs: "Fin décembre : 10 commerces actifs (cible haute 20), 30 essais, 25 démos, 300 prospects contactés. Fin février : 40 actifs.",
};
