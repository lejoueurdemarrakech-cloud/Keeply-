/*
 * Plan de lancement v6 « Fidéliser, c'est devenu facile » (08/11/2026).
 * Compte ouvert le 24 novembre, lancement le 1er décembre 2026, Instagram + TikTok + Meta Ads (100 € par mois max).
 * Vague 1 : Maroc, Canada, Suisse (l'app y est en ligne). Vague 2 : France, Belgique, Luxembourg, Monaco, le jour où
 * Apple ouvre l'App Store chez eux (vérification DSA). Plateforme de marque dans brand.ts, stories dans stories-plan.ts.
 * Crochets [ ] = vrai vécu ou vrais chiffres à remplir. Généré depuis le scratchpad de la session du 08/11.
 */
export type LaunchPost = (typeof INSTAGRAM_PLAN)["posts"][number];
export type TikTokVideo = (typeof TIKTOK_PLAN)["videos"][number];

export const INSTAGRAM_PLAN = {
  "objectif": "Ouvrir le compte le mardi 24 novembre, lancer Keeply le mardi 1er décembre et, d'ici début janvier, faire de Keeply le nom auquel un patron de snack, de café ou de restaurant francophone pense quand il entend « carte de fidélité ». Le compte a deux rôles : la vitrine (un patron venu d'une pub, de TikTok ou d'un mail de Harvey regarde le profil avant de télécharger) et la conversion (lien en bio, stories, messages). Indicateur roi : les essais gratuits démarrés depuis Instagram (lien en bio avec UTM, messages). Indicateurs de croissance : vues des Reels chez les non-abonnés, sauvegardes, partages.",
  "positionnement": "Fidéliser, c'est devenu facile. La carte de fidélité des grandes chaînes, dans le Wallet des clients de n'importe quel commerce, prête en quelques minutes, pour 1,33 € par jour.",
  "piliers": [
    {
      "nom": "Facile",
      "part_pourcent": 30,
      "pourquoi": "La série « Chrono » (création réelle chronométrée) et le geste du scan. On prouve la simplicité par l'écran et le chronomètre."
    },
    {
      "nom": "Peu coûteux",
      "part_pourcent": 20,
      "pourquoi": "La série « Le calcul » : prix clair, calcul que le patron refait avec son propre panier, iPhone suffit. Deux posts prix en tout, jamais de promo criarde."
    },
    {
      "nom": "Le résultat",
      "part_pourcent": 20,
      "pourquoi": "« Ils reviennent », mini-série en trois épisodes, et l'écran verrouillé. On montre pourquoi fidéliser vaut le coup."
    },
    {
      "nom": "Fondateur et questions de patrons",
      "part_pourcent": 20,
      "pourquoi": "Le fondateur filmé vrai et les réponses vidéo aux vraies objections. Sans témoignages clients pour l'instant, c'est notre preuve de confiance."
    },
    {
      "nom": "La vitrine",
      "part_pourcent": 10,
      "pourquoi": "Les cartes du Studio comme une collection : la fierté d'avoir une belle carte à son nom."
    }
  ],
  "rythme": "Trois posts par semaine, mardi, jeudi et dimanche : 13 h (pause avant le rush du soir) ou 21 h (fin de service), heure de Paris, soit une heure plus tôt au Maroc et six heures plus tôt au Québec. Chaque Reel est d'abord publié en « Reel d'essai » quand l'option est proposée (montré aux non-abonnés, publié sur le profil s'il marche). Les mêmes vidéos partent sur TikTok et YouTube Shorts, sans filigrane. Stories tous les jours. Pas de post du 24 au 26 décembre.",
  "bio": "Votre carte de fidélité, dans le Wallet de vos clients.\nFast-foods · Cafés · Restaurants\nEssai gratuit 14 jours ↓",
  "lien_bio": "Nom du profil : Keeply · Carte de fidélité\nLien 1 · « Télécharger Keeply · essai 14 jours » → keeplyfidelity.app/app (ouvre l'App Store sur iPhone ; ailleurs, la page de liste d'attente)\nLien 2 · « France, Belgique : liste d'attente » → keeplyfidelity.app/bientot (à retirer le jour de l'ouverture française)\nTant que le domaine n'a pas ces pages : lien direct App Store avec suivi de campagne (ct=instagram-bio).",
  "highlights": [
    "Comment ça marche",
    "Chrono",
    "Le calcul",
    "Cartes",
    "Questions",
    "Fondateur"
  ],
  "posts": [
    {
      "id": "p01",
      "semaine": 0,
      "jour": "mardi 24 nov.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Écran verrouillé",
      "titre": "Ouverture · la carte qui glisse",
      "accroche": "Le 1er décembre.",
      "visuel": "Reel 7 s en boucle, sans voix, son « clic » du Wallet. Fond blanc. Une carte du Studio (Le Comptoir d'Anna, café) glisse du bas et se range dans un Wallet, carte entière, aucun bord coupé. Texte unique au centre, police du site : « Fidéliser, c'est devenu facile. » puis « Le 1er décembre. ». Dernière image = première image pour que la boucle soit invisible.",
      "legende": "Fidéliser, c'est devenu facile.\n\nLe 1er décembre.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#applewallet"
      ],
      "pourquoi": "Le premier post donne le ton de toute la marque : une phrase, un geste, beaucoup de blanc. La boucle de 7 s fait monter le taux de revisionnage, le premier signal que l'algorithme regarde sur un compte neuf. À publier en « Reel d'essai » (montré d'abord aux non-abonnés).",
      "cta": "Activez les notifications du compte.",
      "asset_existant": "Studio cartes HQ (Le Comptoir d'Anna) + teaser HyperFrames (plan carte)",
      "boost": false
    },
    {
      "id": "p02",
      "semaine": 0,
      "jour": "jeudi 26 nov.",
      "heure": "13:00",
      "format": "Reel",
      "pilier": "Facile",
      "titre": "Ouverture · un scan",
      "accroche": "Un scan. Elle est dans son Wallet.",
      "visuel": "Reel 9 s, filmé à la main au-dessus d'un comptoir réel (Agadir, aucun pays nommé). Plan 1 : un client tend son iPhone vers l'affiche Keeply (format Caisse A5). Plan 2 : la carte apparaît, « Ajouter à Apple Wallet », tap. Plan 3 : la carte rangée dans le Wallet, gros plan. Texte en haut : « Un scan. » puis « Elle est dans son Wallet. ». Fin : « 1er décembre. »",
      "legende": "Votre client scanne.\nSa carte est dans son Wallet, à côté de sa carte bancaire.\nIl n'installe rien, il ne crée aucun compte.\n\nLe 1er décembre.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#fastfood",
        "#snack"
      ],
      "pourquoi": "Avant même d'annoncer quoi que ce soit, on montre le geste le plus simple du produit. C'est la preuve n°1 de « facile », vue du côté client, et c'est un plan que tout patron comprend sans son.",
      "cta": "Le 1er décembre.",
      "asset_existant": "Scènes Activation du site (affiche Caisse A5)",
      "boost": false
    },
    {
      "id": "p03",
      "semaine": 0,
      "jour": "dimanche 29 nov.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Fondateur",
      "titre": "Ouverture · pourquoi j'ai fait Keeply",
      "accroche": "Mardi, je lance mon app. Voilà pourquoi.",
      "visuel": "Reel 30 à 40 s, face caméra, le fondateur assis dans un vrai commerce (lumière du soir), sous-titres mot à mot. Trois temps : 1) [le déclic vécu, avec un vrai commerce et une vraie scène]. 2) « Les grandes chaînes ont leur carte dans le téléphone de leurs clients. Le snack d'en bas, non. » 3) « Mardi, ça change. » Plan final : la carte dans le Wallet.",
      "legende": "Je m'appelle [prénom]. Mardi, je lance Keeply.\n\n[Deux phrases vraies : la scène qui t'a donné l'idée.]\n\nLes grandes chaînes ont leur carte de fidélité dans le téléphone de leurs clients. Je voulais que le snack d'en bas, le café du coin et le petit resto aient la même chose, sans payer une fortune.\n\nRendez-vous mardi.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#entrepreneur",
        "#startup"
      ],
      "pourquoi": "Un compte de marque sans visage ne crée pas la confiance dont un commerçant a besoin pour payer un abonnement. Le fondateur, filmé vrai, fait ce travail. Les crochets se remplissent avec du vécu, rien n'est inventé.",
      "cta": "Rendez-vous mardi.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p04",
      "semaine": 1,
      "jour": "mardi 1er déc.",
      "heure": "12:30",
      "format": "Reel",
      "pilier": "Lancement",
      "titre": "Lancement · le teaser",
      "accroche": "Créez votre carte.",
      "visuel": "Le teaser de lancement HyperFrames (18 s, 9:16) tel quel : cartes qui se retournent, scan, tampons, écran verrouillé, mur de cartes, logo. Ajouter un son de la bibliothèque Instagram (instrumental, montée douce) au moment de publier.",
      "legende": "Keeply est disponible.\n\nVotre carte de fidélité à votre nom, dans le Wallet de vos clients. Prête en quelques minutes, depuis votre iPhone.\n\nEssai gratuit 14 jours sur l'App Store.\nDisponible au Maroc, au Canada et en Suisse. La France, la Belgique, le Luxembourg et Monaco arrivent : liste d'attente en bio.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#lancement",
        "#applewallet",
        "#fastfood",
        "#cafe"
      ],
      "pourquoi": "Le jour J s'ouvre sur le film le plus soigné qu'on ait. Publié à 12 h 30 pour toucher le Maroc et l'Europe à la pause, et rester en tête du fil quand le Québec se réveille. À épingler en premier. Boosté dès qu'il dépasse la médiane des vues du compte.",
      "cta": "Essai gratuit 14 jours. Lien en bio.",
      "asset_existant": "videos/teaser-lancement/keeply-teaser-lancement.mp4",
      "boost": true
    },
    {
      "id": "p05",
      "semaine": 1,
      "jour": "jeudi 3 déc.",
      "heure": "13:00",
      "format": "Carrousel",
      "pilier": "Facile",
      "titre": "Comment ça marche, en trois gestes",
      "accroche": "Trois gestes. C'est tout.",
      "visuel": "Carrousel 6 slides 1080×1350, fond blanc, une capture d'app par slide. 1 « Trois gestes. C'est tout. » 2 « Vous créez votre carte. » (écran Studio de l'app) 3 « Votre client scanne. » (affiche + iPhone) 4 « Elle vit dans son Wallet. » (Wallet) 5 « Vous choisissez ce qui part tout seul. » (interrupteurs des offres auto, deux allumés, un éteint) 6 « Essai gratuit 14 jours. » + badges App Store.",
      "legende": "1. Vous créez votre carte : couleurs, logo, récompenses.\n2. Votre client scanne l'affiche au comptoir.\n3. Sa carte vit dans son Wallet, et ses remises aussi.\n\nLes offres automatiques (anniversaire, retour après une absence) s'allument ou s'éteignent en un geste. Vous gardez la main.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#restaurant",
        "#commercelocal"
      ],
      "pourquoi": "Le carrousel explicatif est celui qu'on sauvegarde et qu'on envoie à un associé. C'est aussi la page que les visiteurs venus d'une pub ouvrent en premier. La slide 5 glisse la règle « vous gardez la main ».",
      "cta": "Enregistrez-le pour votre associé.",
      "asset_existant": "",
      "boost": true
    },
    {
      "id": "p06",
      "semaine": 1,
      "jour": "dimanche 6 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Facile",
      "titre": "Chrono n°1 · un fast-food",
      "accroche": "Carte de fidélité pour un fast-food. Chrono lancé.",
      "visuel": "Reel 25 s : enregistrement d'écran réel de l'app, chrono visible en haut, la main du fondateur en incrustation. On crée la carte d'un fast-food (carte Studio « Smash Burger » ou équivalent) : nom, couleurs, logo, récompenses −10 % / −15 % / −25 %. Le chrono s'arrête quand la carte est dans le Wallet de test. Accélérer les temps morts, jamais le chrono.",
      "legende": "Une carte de fidélité pour un fast-food, du premier écran au Wallet.\n\nTemps réel : [temps chronométré].\n\nC'est le premier épisode de « Chrono ». Prochain commerce : un café.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#fastfood",
        "#burger",
        "#chrono"
      ],
      "pourquoi": "« Facile » se prouve avec un chronomètre, pas avec un adjectif. Le temps affiché est le vrai temps mesuré au tournage : on n'annonce jamais un chiffre qu'on n'a pas filmé. Format série = rendez-vous et abonnements.",
      "cta": "Abonnez-vous pour le prochain chrono.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p07",
      "semaine": 2,
      "jour": "mardi 8 déc.",
      "heure": "13:00",
      "format": "Reel",
      "pilier": "Peu coûteux",
      "titre": "Le calcul n°1 · combien de clients pour payer Keeply",
      "accroche": "Combien de clients doivent revenir pour payer Keeply ?",
      "visuel": "Reel 20 s, plan fixe sur un comptoir, la main du fondateur écrit sur un carnet ou dans l'app Notes, voix off posée. « Keeply : 39,99 € par mois. Panier moyen : 10 €. Quatre passages de plus par mois. » Gros chiffre final « 4 » au centre, mention discrète « exemple : panier moyen 10 € ».",
      "legende": "Keeply coûte 39,99 € par mois en France.\nPrenez un panier moyen de 10 € (exemple).\n\nQuatre passages de plus par mois, et l'abonnement est couvert. Sur un mois entier. Pour tout votre commerce.\n\nÀ l'année, c'est moins d'1 € par jour.\n\nPrix adaptés dans chaque pays. Essai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#gestionrestaurant",
        "#chiffredaffaires"
      ],
      "pourquoi": "« Peu coûteux » est la moitié de notre base. Un calcul simple, que le patron refait de tête avec son propre panier moyen, vaut mieux que n'importe quelle promesse. Le chiffre est marqué « exemple » : aucun résultat n'est promis.",
      "cta": "Refaites le calcul avec votre panier moyen.",
      "asset_existant": "",
      "boost": true
    },
    {
      "id": "p08",
      "semaine": 2,
      "jour": "jeudi 10 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Le résultat",
      "titre": "Ils reviennent · épisode 1",
      "accroche": "Il ne vous connaît pas. Encore.",
      "visuel": "Reel 15 s, POV client à hauteur d'yeux, sans voix, sous-titres. Un café (carte Studio café). Il entre, commande, scanne l'affiche, la carte entre dans son Wallet, 1 tampon sur 10. Il sort. Écran noir : « Épisode 1. Reviendra-t-il ? »",
      "legende": "Premier passage. Un scan, sa carte est dans son Wallet.\n\nReviendra-t-il ? Épisode 2 dimanche 20.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#ilsreviennent",
        "#cafe"
      ],
      "pourquoi": "La mini-série garde ce qui marchait dans « Ils reviennent » (le fondateur l'aimait) en trois épisodes au lieu de cinq. Elle montre le résultat, là où Chrono et Le calcul montrent la facilité et le prix.",
      "cta": "Épisode 2 dimanche 20.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p09",
      "semaine": 2,
      "jour": "dimanche 13 déc.",
      "heure": "21:00",
      "format": "Carrousel",
      "pilier": "La vitrine",
      "titre": "La collection · choisissez votre style",
      "accroche": "Choisissez votre style.",
      "visuel": "Carrousel 8 slides : les cartes du Studio HQ, une par slide, entières et centrées sur un fond de la couleur de la carte. Mélange : fast-food, café, resto de quartier, resto chic, ramen, crêperie, boulangerie, cave. Slide 1 : grille de 6 cartes + « Choisissez votre style. » Dernière slide : « La vôtre est prête en quelques minutes. »",
      "legende": "Burger, café, tajine, ramen, cave à vin.\nChaque carte est faite pour son commerce : couleurs, logo, photo, récompenses.\n\nLaquelle ressemble à la vôtre ?\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#design",
        "#branding"
      ],
      "pourquoi": "La fierté d'avoir une belle carte à son nom fait vendre autant que le prix. Les 32 cartes du Studio sont prêtes : aucun tournage. La question en légende appelle des commentaires, que l'algorithme valorise.",
      "cta": "Dites-nous laquelle en commentaire.",
      "asset_existant": "Studio cartes HQ (32 cartes)",
      "boost": false
    },
    {
      "id": "p10",
      "semaine": 3,
      "jour": "mardi 15 déc.",
      "heure": "13:00",
      "format": "Reel",
      "pilier": "Questions de patrons",
      "titre": "Questions de patrons n°1 · et mes clients sur Android ?",
      "accroche": "« Et mes clients qui ont un Android ? »",
      "visuel": "Reel 20 s, réponse en vidéo à un vrai commentaire ou à un vrai message (capture du commentaire en haut, avec accord ou anonymisé). Le fondateur montre deux téléphones : un iPhone (Apple Wallet) et un Android (Google Wallet), la même carte sur les deux.",
      "legende": "La question qu'on nous pose le plus.\n\nVos clients sur iPhone ont leur carte dans Apple Wallet, ceux sur Android dans Google Wallet. Même carte, même scan.\n\nL'app pour vous, le commerçant, est sur iPhone. Android arrive bientôt.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#android",
        "#googlewallet"
      ],
      "pourquoi": "Les objections tuent l'essai plus que le prix. On y répond une par une, en vidéo, à partir de vraies questions : c'est aussi le format qui pousse l'algorithme à reproposer nos vidéos à ceux qui ont commenté.",
      "cta": "Posez votre question en commentaire.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p11",
      "semaine": 3,
      "jour": "jeudi 17 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Facile",
      "titre": "Chrono n°2 · un café",
      "accroche": "Carte de fidélité pour un café. Chrono lancé.",
      "visuel": "Même grammaire que p06 : écran réel, chrono en haut, main en incrustation. Commerce : café (carte Studio). Récompenses en tampons 10 / 20 / 30 pour −10 % / −15 % / −25 %. Fin : la carte dans le Wallet, puis notification test « Votre café vous attend ».",
      "legende": "Une carte pour un café, du premier écran au Wallet.\n\nTemps réel : [temps chronométré].\n\nProchain Chrono : un restaurant gastronomique.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#cafe",
        "#coffeeshop",
        "#chrono"
      ],
      "pourquoi": "Le deuxième épisode installe la série et change de commerce : on montre que ça marche pour tous.",
      "cta": "Abonnez-vous pour le prochain chrono.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p12",
      "semaine": 3,
      "jour": "dimanche 20 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Le résultat",
      "titre": "Ils reviennent · épisode 2 (spécial fêtes)",
      "accroche": "Il pleut. Votre offre part toute seule.",
      "visuel": "Reel 15 s, suite de p08. Le client est chez lui, soir de pluie. Son iPhone s'allume sur l'écran verrouillé : notification de la carte du café « Ce soir, −10 % sur votre boisson chaude. ». Il regarde par la fenêtre, attrape sa veste. Écran noir : « Épisode 2. » Mention discrète en bas : « Offre automatique, activable ou non. »",
      "legende": "Une offre qui part toute seule, au bon moment, sur l'écran verrouillé de vos clients.\n\nVous choisissez lesquelles s'activent. Vous pouvez tout couper.\n\nÉpisode 3 mardi 29.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#ilsreviennent",
        "#noel"
      ],
      "pourquoi": "L'écran verrouillé est l'image la plus désirable du produit. La mention « activable ou non » respecte la règle : on ne donne jamais l'impression d'imposer une mécanique.",
      "cta": "Épisode 3 mardi 29.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p13",
      "semaine": 4,
      "jour": "mardi 22 déc.",
      "heure": "13:00",
      "format": "Carrousel",
      "pilier": "Peu coûteux",
      "titre": "Le calcul, version complète",
      "accroche": "Ce que coûte vraiment une carte de fidélité.",
      "visuel": "Carrousel 6 slides, fond blanc, gros chiffres façon relevé bancaire. 1 « Ce que coûte vraiment une carte de fidélité. » 2 « 39,99 € par mois. » 3 « Moins d'1 € par jour à l'année (359,99 €). » 4 « Votre iPhone suffit. » 5 « Quatre passages de plus par mois. » (exemple : panier moyen 10 €) 6 « 14 jours pour essayer. » + badges.",
      "legende": "Le prix, sans astérisque.\n\n39,99 € par mois en France, ou 359,99 € à l'année (moins d'1 € par jour). Votre iPhone suffit pour scanner. Les prix sont adaptés dans chaque pays.\n\nAvec un panier moyen de 10 € (exemple), quatre passages de plus par mois couvrent l'abonnement.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#gestionrestaurant",
        "#prix"
      ],
      "pourquoi": "La version à sauvegarder du calcul. Un patron compare des prix : on lui donne les chiffres sans détour, comme une banque en ligne le ferait. Seul post prix du plan avec p07.",
      "cta": "Enregistrez pour comparer.",
      "asset_existant": "",
      "boost": true
    },
    {
      "id": "p14",
      "semaine": 4,
      "jour": "dimanche 27 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Fondateur",
      "titre": "Le premier mois, en vrai",
      "accroche": "Le premier mois de Keeply, en vrais chiffres.",
      "visuel": "Reel 30 s face caméra, le fondateur chez lui ou au comptoir. Il montre à l'écran les vrais chiffres du mois : téléchargements, commerces inscrits, pays [à remplir depuis HQ > Ventes]. Une leçon apprise, une chose ratée, la suite.",
      "legende": "Un mois après le lancement, les chiffres sans maquillage.\n\n[Chiffres réels du mois, depuis HQ.]\n[Une leçon, une erreur, la suite.]\n\nMerci aux premiers commerces.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#entrepreneur",
        "#buildinpublic"
      ],
      "pourquoi": "La transparence fait plus pour la confiance qu'un faux avis. Si les chiffres sont petits, on le dit : c'est précisément ce qui rend le compte crédible. À remplir uniquement avec les vrais chiffres.",
      "cta": "Suivez la suite.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p15",
      "semaine": 4,
      "jour": "mardi 29 déc.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Le résultat",
      "titre": "Ils reviennent · épisode 3, le final",
      "accroche": "Il est revenu.",
      "visuel": "Reel 18 s. Le client repasse la porte du café. Scan en caisse : la carte passe à 10 tampons, « Remise débloquée · −10 % ». Le gérant sourit. Il ressort. Carton final blanc : « Ils reviennent. » puis « Keeply. La fidélité, facile. »",
      "legende": "Il est revenu. Puis encore. Sa dixième visite lui a débloqué −10 %.\n\nC'est tout ce qu'on fait : donner à vos clients une raison de repasser la porte.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#ilsreviennent",
        "#restaurant"
      ],
      "pourquoi": "La fin de la série donne la créa de pub la plus émotionnelle pour janvier. La récompense est une remise, jamais un produit offert.",
      "cta": "Essai gratuit 14 jours. Lien en bio.",
      "asset_existant": "",
      "boost": true
    },
    {
      "id": "p16",
      "semaine": 5,
      "jour": "jeudi 31 déc.",
      "heure": "13:00",
      "format": "Photo",
      "pilier": "La vitrine",
      "titre": "2027",
      "accroche": "En 2027, ils reviennent.",
      "visuel": "Image 1080×1350 : une seule carte Studio (resto chic) au centre, fond profond de la couleur de la carte, une ligne de texte « En 2027, ils reviennent. » en bas, logo minuscule.",
      "legende": "Bonne année à tous les commerces qui ouvrent leurs portes le 2 janvier.\n\nEn 2027, ils reviennent.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#bonneannee"
      ],
      "pourquoi": "Un post calme et beau entre deux fêtes, quand personne ne veut être démarché. Il garde le compte vivant sans rien vendre.",
      "cta": "Bonne année.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p17",
      "semaine": 5,
      "jour": "dimanche 3 janv.",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Peu coûteux",
      "titre": "Le calcul n°2 · le mois où les clients disparaissent",
      "accroche": "Janvier : le mois où vos clients disparaissent.",
      "visuel": "Reel 20 s, voix off, plans de rues calmes en janvier puis écran verrouillé : notification d'offre automatique « Vous nous manquez : −10 % cette semaine ». Texte : « Janvier. » / « Ils dépensent moins. » / « Faites-les revenir. » Mention : « Relance automatique, activable ou non. »",
      "legende": "Après les fêtes, beaucoup de commerces voient leurs clients réguliers disparaître quelques semaines.\n\nAvec Keeply, une relance part toute seule quand un client n'est pas revenu depuis un moment. Vous fixez la remise et le délai, ou vous la coupez.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#janvier",
        "#gestionrestaurant"
      ],
      "pourquoi": "Le creux de janvier est un vrai souci de patron : on lui parle de son problème du moment, avec la fonction qui y répond (relance automatique « retour après absence »). C'est aussi le mois où la pub coûte le moins cher : ce Reel devient la créa principale de janvier.",
      "cta": "Essai gratuit 14 jours. Lien en bio.",
      "asset_existant": "",
      "boost": true
    },
    {
      "id": "p18",
      "semaine": 5,
      "jour": "mardi 5 janv.",
      "heure": "13:00",
      "format": "Reel",
      "pilier": "Questions de patrons",
      "titre": "Questions de patrons n°2 · je peux tout couper ?",
      "accroche": "« Et si je ne veux pas envoyer de notifications ? »",
      "visuel": "Reel 18 s, réponse vidéo à un vrai commentaire. Écran de l'app : le fondateur éteint une à une les offres automatiques, les statuts, les notifications. Il reste la carte et les tampons. « Vous gardez seulement ce que vous voulez. »",
      "legende": "Vous pouvez tout couper : offres automatiques, statuts Bronze, Argent, Or, notifications. Il vous reste une carte de fidélité simple, dans le Wallet de vos clients.\n\nVous allumez le reste quand vous voulez.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#restaurant"
      ],
      "pourquoi": "Beaucoup de patrons ont peur de « harceler » leurs clients. Montrer qu'on peut tout éteindre lève l'objection et applique la règle de la marque.",
      "cta": "Posez votre question en commentaire.",
      "asset_existant": "",
      "boost": false
    },
    {
      "id": "p19",
      "semaine": 9,
      "jour": "le jour où la France ouvre",
      "heure": "12:30",
      "format": "Reel",
      "pilier": "Lancement",
      "titre": "Vague 2 · la France, la Belgique, le Luxembourg et Monaco ouvrent",
      "accroche": "La France ouvre.",
      "visuel": "Reprise du teaser p04 avec un dernier plan changé : la carte se range dans un Wallet et le texte devient « Maintenant en France, en Belgique, au Luxembourg et à Monaco. ». Publier le jour où l'app apparaît sur l'App Store français (vérifier itunes.apple.com/lookup?id=6816728580&country=fr).",
      "legende": "Keeply est maintenant disponible en France, en Belgique, au Luxembourg et à Monaco.\n\nVotre carte de fidélité dans le Wallet de vos clients, prête en quelques minutes.\n\nEssai gratuit 14 jours sur l'App Store.",
      "hashtags": [
        "#keeply",
        "#cartedefidelite",
        "#fideliteclient",
        "#restaurateur",
        "#france",
        "#belgique",
        "#lancement"
      ],
      "pourquoi": "Le blocage Apple (vérification DSA) devient un deuxième moment de lancement, comme les grandes marques qui ouvrent pays par pays. La liste d'attente reçoit le mail le même jour.",
      "cta": "Essai gratuit 14 jours. Lien en bio.",
      "asset_existant": "videos/teaser-lancement",
      "boost": true
    }
  ],
  "stories_quotidiennes": [
    "Lundi · « La question de la semaine » : sticker question, on y répond en Reel le mardi (Questions de patrons).",
    "Mardi et dimanche · partage du post du jour + sticker lien vers l'App Store, une phrase de contexte.",
    "Mercredi · coulisses : le fondateur au travail (prospection, tournage, une nouvelle carte), 2 à 3 stories sans montage.",
    "Jeudi · sondage d'une question pour un patron (« Vos clients réguliers, vous les connaissez par leur prénom ? Oui / Pas tous »).",
    "Vendredi · une carte du Studio en plein écran + sticker « Ajoutez la vôtre » (lien).",
    "Samedi · repos ou une story calme (une notification, une carte), jamais de vente.",
    "Chaque fois qu'un vrai commerce installe Keeply et accepte : une story avec sa carte, en le mentionnant. Jamais d'avis inventé."
  ],
  "regles_engagement": [
    "La première heure après chaque post : répondre à chaque commentaire avec une vraie phrase, pas un emoji.",
    "Chaque jour, 15 minutes chez les autres : commenter 10 posts de restaurants, snacks et cafés des pays ouverts (des commentaires utiles, jamais de pub).",
    "Message de bienvenue automatique et réponses rapides (prix, comment ça marche, Android) réglés dans Meta Business Suite : c'est gratuit.",
    "Mot-clé en commentaire : « Écrivez CARTE » sous les posts boostés, puis réponse manuelle en message avec le lien de l'essai. Pas d'outil payant au début.",
    "Collab : chaque commerce réel qui utilise Keeply est invité à une publication en collaboration (le post apparaît sur les deux comptes).",
    "Interdit : acheter des abonnés, des vues ou des likes, les groupes d'engagement, le follow puis unfollow. Ça tue la portée des vrais posts."
  ],
  "kpi": [
    {
      "nom": "Essais démarrés depuis Instagram",
      "cible_6_semaines": "10 à 30",
      "comment_lire": "Lien en bio avec UTM + messages qui finissent en essai. Le seul chiffre qui paie les factures."
    },
    {
      "nom": "Vues des Reels chez les non-abonnés",
      "cible_6_semaines": "plus de 60 % des vues",
      "comment_lire": "Statistiques du Reel. En dessous, l'accroche des 2 premières secondes est à revoir."
    },
    {
      "nom": "Sauvegardes + partages par post",
      "cible_6_semaines": "plus de 3 % de la portée",
      "comment_lire": "Le signal le plus fort pour l'algorithme d'Instagram. Les carrousels Le calcul et Comment ça marche doivent le dépasser."
    },
    {
      "nom": "Visites du profil → clics sur le lien",
      "cible_6_semaines": "plus de 8 %",
      "comment_lire": "Si ça baisse : la bio ou le post épinglé ne font pas leur travail."
    },
    {
      "nom": "Messages reçus",
      "cible_6_semaines": "30 et plus",
      "comment_lire": "Chaque message est un patron intéressé : réponse sous 2 heures."
    },
    {
      "nom": "Inscrits liste d'attente France",
      "cible_6_semaines": "100 et plus",
      "comment_lire": "Le public du deuxième lancement. Mail le jour de l'ouverture."
    }
  ],
  "bio_alternatives": [
    "Fidéliser, c'est devenu facile.\nLa carte de fidélité dans le Wallet de vos clients.\nEssai gratuit 14 jours ↓",
    "La carte de fidélité des grandes chaînes, pour votre commerce.\nFast-foods · Cafés · Restaurants\nEssai gratuit 14 jours ↓"
  ]
};

export const TIKTOK_PLAN = {
  "role": "TikTok fait connaître Keeply. Instagram le fait choisir. Sur TikTok, le compte est porté par le fondateur (« je lance une app depuis Agadir ») et par des vidéos produit très courtes et satisfaisantes. Les patrons y sont, et leurs clients aussi : un client qui voit qu'un snack peut avoir sa carte dans le Wallet en parle à son snack.",
  "objectif": "Des vues réelles, gagnées sans payer : 20 vidéos du 24 novembre au 3 janvier, une série par jour de la semaine, et un compte qui dépasse 1 000 abonnés (le seuil qui débloque le lien cliquable dans la bio sur un compte pro, selon les règles du moment : à vérifier dans l'app).",
  "compte": "Nom : Keeply · [prénom du fondateur]\nBio : « Je lance une app pour les restaurants. Carte de fidélité dans le Wallet de tes clients. »\nCompte Entreprise (statistiques, lien en bio quand il est disponible). Photo : le logo Keeply violet.",
  "rythme": "5 vidéos par semaine au début (du mardi au dimanche, une pause), 19 h heure de Paris (le soir après le service du midi) et 12 h à 12 h 30 le week-end. Chaque vidéo Instagram repart sur TikTok sans filigrane, et l'inverse. Les vidéos « Depuis Agadir » sont propres à TikTok.",
  "series": [
    {
      "nom": "Depuis Agadir",
      "promesse": "Le journal du fondateur : lancer une app seul, avec les vrais chiffres.",
      "frequence": "1 à 2 par semaine"
    },
    {
      "nom": "Chrono",
      "promesse": "Une carte de fidélité créée en temps réel, un commerce différent à chaque fois.",
      "frequence": "1 par semaine"
    },
    {
      "nom": "Écran verrouillé",
      "promesse": "Des vidéos de 6 à 10 s, scan, Wallet, notification, en boucle parfaite.",
      "frequence": "1 par semaine"
    },
    {
      "nom": "Questions de patrons",
      "promesse": "Réponses vidéo aux vraies questions des commentaires et des messages.",
      "frequence": "1 par semaine"
    },
    {
      "nom": "Ils reviennent",
      "promesse": "La mini-série POV en trois épisodes, reprise d'Instagram.",
      "frequence": "3 épisodes en décembre"
    }
  ],
  "regles_vues": [
    "La première seconde fait tout : image qui bouge, phrase écrite à l'écran et phrase dite en même temps. Jamais de logo ni d'introduction.",
    "Court : 7 à 25 s. Une vidéo qui boucle bien se revoit, et le revisionnage est le signal le plus fort.",
    "Mots-clés dits et écrits (« carte de fidélité », « fidéliser ses clients », « restaurant ») : TikTok est devenu un moteur de recherche, on y apparaît quand un patron cherche.",
    "Répondre à chaque commentaire, et répondre en vidéo aux meilleurs : ces réponses repartent dans les fils.",
    "Sons : la voix du fondateur en priorité. Pour les vidéos sans voix, un son tendance de la bibliothèque commerciale de TikTok (le compte entreprise n'a pas droit à tous les sons).",
    "Régularité plutôt que perfection : 5 vidéos honnêtes valent mieux qu'une vidéo parfaite par semaine.",
    "Ne jamais supprimer une vidéo qui marche mal : la passer en privé si besoin. Les vieilles vidéos repartent parfois des semaines plus tard.",
    "Commenter 10 minutes par jour sous les vidéos de restaurateurs et de snacks des pays ouverts, avec de vrais commentaires."
  ],
  "interdits": [
    "Acheter des vues, des abonnés ou des likes, utiliser des robots ou des groupes d'engagement : TikTok les détecte et coupe la portée du compte.",
    "Republier la vidéo d'un autre ou utiliser un son protégé sur un compte entreprise.",
    "Faux clients, faux avis, fausses réactions de commerçants.",
    "Publier des liens dans les commentaires des autres."
  ],
  "pub": "Pas de pub TikTok au lancement : le gestionnaire de pubs de TikTok demande au moins 50 $ par jour par campagne et 20 $ par jour par groupe d'annonces, impossible avec 100 € par mois. Le petit outil « Promouvoir » de l'app accepte des budgets plus faibles, mais sa disponibilité au Maroc n'est pas confirmée : à regarder dans l'app. On ne l'utilisera, éventuellement, que sur une vidéo qui marche déjà seule, et jamais pour « acheter des vues pour faire joli ».",
  "kpi": [
    {
      "nom": "Vues moyennes par vidéo",
      "cible": "500 à 2 000 au début",
      "lecture": "En dessous de 300 pendant deux semaines : revoir les accroches, pas le rythme."
    },
    {
      "nom": "Durée moyenne regardée",
      "cible": "plus de 60 % de la vidéo",
      "lecture": "Le chiffre qui décide de la diffusion. Couper tout ce qui traîne."
    },
    {
      "nom": "Abonnés",
      "cible": "1 000 début janvier",
      "lecture": "Le seuil du lien cliquable en bio sur la plupart des comptes."
    },
    {
      "nom": "Visites du profil → App Store",
      "cible": "à mesurer dès que le lien existe",
      "lecture": "Lien avec suivi de campagne (ct=tiktok)."
    }
  ],
  "videos": [
    {
      "id": "t01",
      "date": "2026-11-24",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Jour 1 · je lance une app",
      "accroche": "J'ai codé une app pour les restaurants. Je la lance dans 7 jours.",
      "script": "Face caméra, téléphone tenu à la main, en marchant ou au comptoir. 0-2 s : la phrase d'accroche. 2-15 s : ce que fait l'app en une phrase (« une carte de fidélité dans le téléphone des clients, sans app à installer ») et montre la carte dans ton Wallet. 15-25 s : « Je documente tout ici jusqu'au lancement. Jour 1. »",
      "texte_ecran": "Jour 1 / 7",
      "legende": "Je lance Keeply le 1er décembre. Je raconte tout ici, jour après jour.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "startup",
        "entrepreneur"
      ],
      "pourquoi": "Le format journal de fondateur est un des plus regardés de TikTok : il crée une raison de revenir chaque jour. Il démarre une semaine avant le lancement pour que le compte ait déjà un public le jour J.",
      "reprise_instagram": null,
      "duree": "25 s"
    },
    {
      "id": "t02",
      "date": "2026-11-25",
      "heure": "19:00",
      "serie": "Écran verrouillé",
      "titre": "Le son du Wallet",
      "accroche": "Le bruit le plus satisfaisant pour un patron.",
      "script": "Gros plan, iPhone posé sur un comptoir, son réel. Scan de l'affiche, la carte glisse dans le Wallet, puis notification « Remise débloquée · −10 % » sur l'écran verrouillé. Aucun texte superflu. Boucle parfaite.",
      "texte_ecran": "Le bruit le plus satisfaisant pour un patron.",
      "legende": "Un scan, et votre client a votre carte dans son Wallet.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "asmr",
        "satisfying"
      ],
      "pourquoi": "Les vidéos « satisfaisantes » de 7 à 9 s sont regardées plusieurs fois de suite : c'est le signal qui fait monter une vidéo sur un compte neuf.",
      "reprise_instagram": "p01",
      "duree": "8 s"
    },
    {
      "id": "t03",
      "date": "2026-11-26",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Jour 3 · ce que ça coûte",
      "accroche": "Combien coûte une carte de fidélité comme celle des grandes chaînes ?",
      "script": "Face caméra. Tu montres la carte d'une grande enseigne dans ton Wallet (sans logo lisible), puis la carte d'un snack faite avec Keeply. « Eux paient une équipe entière pour ça. Toi, 39,99 € par mois. »",
      "texte_ecran": "Jour 3 / 7",
      "legende": "Prix en France. Adapté dans chaque pays.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "prix",
        "gestion restaurant"
      ],
      "pourquoi": "Annonce l'argument « peu coûteux » sous forme d'histoire de fondateur, avant le lancement.",
      "reprise_instagram": null,
      "duree": "20 s"
    },
    {
      "id": "t04",
      "date": "2026-11-28",
      "heure": "12:00",
      "serie": "Écran verrouillé",
      "titre": "Six cartes, six commerces",
      "accroche": "Laquelle tu mettrais dans ton snack ?",
      "script": "Défilement rapide de 6 cartes du Studio (burger, café, tacos, ramen, resto chic, boulangerie) qui se rangent une à une dans un Wallet, rythmées sur le son. Fin : le Wallet plein.",
      "texte_ecran": "Laquelle tu mettrais dans ton commerce ?",
      "legende": "Chaque commerce a sa carte. La tienne est prête en quelques minutes.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "design",
        "branding"
      ],
      "pourquoi": "La question appelle des commentaires (« la 3 ! ») : chaque commentaire relance la diffusion.",
      "reprise_instagram": "p09",
      "duree": "10 s"
    },
    {
      "id": "t05",
      "date": "2026-11-29",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Jour 6 · la veille",
      "accroche": "Demain je lance. Voilà ce qui m'empêche de dormir.",
      "script": "Face caméra, le soir. Une vraie inquiétude (Apple, le premier client, [ton vécu]). Ce qui est prêt. « Rendez-vous demain midi. »",
      "texte_ecran": "Demain.",
      "legende": "Lancement de Keeply demain, mardi 1er décembre.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "startup"
      ],
      "pourquoi": "La vulnérabilité réelle (pas jouée) fait revenir le lendemain. Crochets à remplir avec du vrai.",
      "reprise_instagram": null,
      "duree": "25 s"
    },
    {
      "id": "t06",
      "date": "2026-12-01",
      "heure": "12:30",
      "serie": "Lancement",
      "titre": "C'est en ligne",
      "accroche": "Keeply est disponible.",
      "script": "Le teaser HyperFrames 18 s, puis 5 s ajoutées face caméra : « C'est en ligne. Le lien est sur mon profil. Dis-moi ce que tu en penses. »",
      "texte_ecran": "C'est en ligne.",
      "legende": "Keeply est disponible sur l'App Store au Maroc, au Canada et en Suisse. La France arrive.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "lancement",
        "app"
      ],
      "pourquoi": "Le jour J sur TikTok mêle le film soigné et la voix du fondateur : la marque et la personne.",
      "reprise_instagram": "p04",
      "duree": "23 s"
    },
    {
      "id": "t07",
      "date": "2026-12-02",
      "heure": "19:00",
      "serie": "Chrono",
      "titre": "Une carte pour un fast-food en temps réel",
      "accroche": "Carte de fidélité pour un fast-food. Chrono lancé.",
      "script": "Version TikTok de p06 : écran de l'app plein cadre, chrono en haut, voix off du fondateur qui commente comme un défi.",
      "texte_ecran": "Chrono lancé.",
      "legende": "Du premier écran au Wallet, en temps réel.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "fast food",
        "chrono"
      ],
      "pourquoi": "Le défi chronométré est un format natif TikTok : on reste pour voir le temps final.",
      "reprise_instagram": "p06",
      "duree": "25 s"
    },
    {
      "id": "t08",
      "date": "2026-12-04",
      "heure": "19:00",
      "serie": "Questions de patrons",
      "titre": "Le calcul en 15 secondes",
      "accroche": "Combien de clients doivent revenir pour payer cette app ?",
      "script": "Format écran vert : le fondateur devant la capture « 39,99 € », écrit le calcul (panier moyen 10 €, exemple) et entoure « 4 ».",
      "texte_ecran": "4 passages par mois.",
      "legende": "Exemple avec un panier moyen de 10 €. Refais-le avec le tien en commentaire.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "chiffre d'affaires"
      ],
      "pourquoi": "Les patrons refont le calcul avec leurs chiffres en commentaire : engagement fort et public parfaitement ciblé.",
      "reprise_instagram": "p07",
      "duree": "15 s"
    },
    {
      "id": "t09",
      "date": "2026-12-06",
      "heure": "19:00",
      "serie": "Questions de patrons",
      "titre": "La carte en carton",
      "accroche": "Ta carte en carton finit où ?",
      "script": "Une main pose une carte en carton tamponnée sur un comptoir, un tiroir s'ouvre : il est plein de cartes oubliées. Coupe : l'iPhone, la carte dans le Wallet. 6 s en tout. Aucun discours.",
      "texte_ecran": "Celle-ci reste dans leur téléphone.",
      "legende": "La seule fois qu'on en parle.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet"
      ],
      "pourquoi": "Le seul clin d'œil au carton de tout le plan : rapide, visuel, sans en faire notre argument.",
      "reprise_instagram": null,
      "duree": "6 s"
    },
    {
      "id": "t10",
      "date": "2026-12-08",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Une semaine après",
      "accroche": "Une semaine après le lancement. Les vrais chiffres.",
      "script": "Face caméra. Les vrais chiffres de la semaine (téléchargements, commerces, pays) [depuis HQ > Ventes]. Une chose apprise.",
      "texte_ecran": "Semaine 1.",
      "legende": "Les chiffres réels, sans maquillage.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "buildinpublic"
      ],
      "pourquoi": "Les chiffres honnêtes, même petits, sont ce qui rend un fondateur crédible sur TikTok.",
      "reprise_instagram": null,
      "duree": "25 s"
    },
    {
      "id": "t11",
      "date": "2026-12-10",
      "heure": "19:00",
      "serie": "Ils reviennent",
      "titre": "Épisode 1",
      "accroche": "Il ne vous connaît pas. Encore.",
      "script": "Reprise de p08 (POV client, café).",
      "texte_ecran": "Épisode 1",
      "legende": "Reviendra-t-il ?",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "pov"
      ],
      "pourquoi": "La série en POV, reprise telle quelle depuis Instagram.",
      "reprise_instagram": "p08",
      "duree": "15 s"
    },
    {
      "id": "t12",
      "date": "2026-12-12",
      "heure": "12:00",
      "serie": "Questions de patrons",
      "titre": "Réponse à un commentaire",
      "accroche": "Réponse à @[pseudo] : « Ça marche sans internet ? »",
      "script": "Fonction « répondre en vidéo » sur un vrai commentaire. Réponse courte à l'écran de l'app. Si aucune question n'est arrivée, choisir une vraie question reçue par Harvey ou en message.",
      "texte_ecran": "Réponse à ta question.",
      "legende": "Pose ta question, je réponds en vidéo.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet"
      ],
      "pourquoi": "Les réponses vidéo aux commentaires sont reproposées à ceux qui ont commenté et à leurs abonnés. Ne jamais inventer la question.",
      "reprise_instagram": null,
      "duree": "20 s"
    },
    {
      "id": "t13",
      "date": "2026-12-14",
      "heure": "19:00",
      "serie": "Chrono",
      "titre": "Une carte pour un café",
      "accroche": "Carte de fidélité pour un café. Chrono lancé.",
      "script": "Reprise de p11 avec voix off.",
      "texte_ecran": "Chrono lancé.",
      "legende": "Prochain : un resto gastronomique.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "café",
        "coffee shop"
      ],
      "pourquoi": "Deuxième épisode de la série, autre commerce.",
      "reprise_instagram": "p11",
      "duree": "25 s"
    },
    {
      "id": "t14",
      "date": "2026-12-16",
      "heure": "19:00",
      "serie": "Questions de patrons",
      "titre": "Android ?",
      "accroche": "Et mes clients qui ont un Android ?",
      "script": "Reprise de p10 : deux téléphones, même carte.",
      "texte_ecran": "Apple Wallet + Google Wallet.",
      "legende": "Même carte, même scan.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "android",
        "google wallet"
      ],
      "pourquoi": "L'objection la plus fréquente, réglée en 20 secondes.",
      "reprise_instagram": "p10",
      "duree": "20 s"
    },
    {
      "id": "t15",
      "date": "2026-12-18",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Démarcher un commerce en vrai",
      "accroche": "Je suis entré dans un snack pour lui proposer mon app.",
      "script": "Vlog réel, avec l'accord du gérant (sinon flouter et ne rien nommer). La porte, la discussion (sous-titrée), la réaction vraie, oui ou non. Aucun faux client.",
      "texte_ecran": "Il a dit…",
      "legende": "[Ce qui s'est vraiment passé.]",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "vlog",
        "prospection"
      ],
      "pourquoi": "Le démarchage filmé est un format très regardé et montre le produit dans un vrai commerce. Uniquement avec un vrai gérant d'accord pour être filmé.",
      "reprise_instagram": null,
      "duree": "40 s"
    },
    {
      "id": "t16",
      "date": "2026-12-20",
      "heure": "19:00",
      "serie": "Ils reviennent",
      "titre": "Épisode 2",
      "accroche": "Il pleut. Votre offre part toute seule.",
      "script": "Reprise de p12.",
      "texte_ecran": "Épisode 2",
      "legende": "Offre automatique, que vous pouvez couper.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "pov"
      ],
      "pourquoi": "Montre les offres automatiques et rappelle qu'elles sont optionnelles.",
      "reprise_instagram": "p12",
      "duree": "15 s"
    },
    {
      "id": "t17",
      "date": "2026-12-22",
      "heure": "19:00",
      "serie": "Chrono",
      "titre": "Une carte pour un resto chic",
      "accroche": "Carte de fidélité pour un restaurant gastronomique. Chrono lancé.",
      "script": "Même grammaire que Chrono, carte Studio sombre et élégante (cave ou gastronomique), récompenses −10 % / −15 % / −25 %.",
      "texte_ecran": "Chrono lancé.",
      "legende": "Même pour une belle table, c'est l'affaire de quelques minutes.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "gastronomie"
      ],
      "pourquoi": "Troisième commerce de la série : on montre que Keeply n'est pas qu'un outil de snack.",
      "reprise_instagram": null,
      "duree": "25 s"
    },
    {
      "id": "t18",
      "date": "2026-12-27",
      "heure": "19:00",
      "serie": "Depuis Agadir",
      "titre": "Un mois",
      "accroche": "Un mois de Keeply. Ce qui a marché, ce qui a raté.",
      "script": "Reprise de p14, version plus personnelle.",
      "texte_ecran": "1 mois.",
      "legende": "[Les vrais chiffres.]",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "buildinpublic"
      ],
      "pourquoi": "Bilan honnête du premier mois.",
      "reprise_instagram": "p14",
      "duree": "30 s"
    },
    {
      "id": "t19",
      "date": "2026-12-29",
      "heure": "19:00",
      "serie": "Ils reviennent",
      "titre": "Le final",
      "accroche": "Il est revenu.",
      "script": "Reprise de p15.",
      "texte_ecran": "Il est revenu.",
      "legende": "Sa dixième visite lui a débloqué −10 %.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "pov"
      ],
      "pourquoi": "Fin de la série.",
      "reprise_instagram": "p15",
      "duree": "18 s"
    },
    {
      "id": "t20",
      "date": "2027-01-03",
      "heure": "19:00",
      "serie": "Questions de patrons",
      "titre": "Janvier",
      "accroche": "Janvier : le mois où tes clients disparaissent.",
      "script": "Reprise de p17 avec voix off du fondateur.",
      "texte_ecran": "Janvier.",
      "legende": "Une relance part toute seule quand un client ne revient pas. Tu peux la couper.",
      "mots_cles": [
        "carte de fidélité",
        "fidéliser ses clients",
        "restaurant",
        "Apple Wallet",
        "janvier"
      ],
      "pourquoi": "Le problème du moment de tous les patrons, avec la fonction qui y répond.",
      "reprise_instagram": "p17",
      "duree": "20 s"
    }
  ]
};

export const META_ADS_PLAN = {
  "resume": "Budget : 100 € par mois maximum. On ne paie que pour montrer ce qui a déjà marché gratuitement : chaque pub est un Reel organique qui a dépassé la moyenne du compte.\nDécembre : 50 € seulement, à partir du mardi 8. Le prix de la pub est au plus haut de l'année en fin d'année, et les restaurateurs sont en plein rush des fêtes.\nJanvier : 100 €, le mois où la pub coûte le moins cher et où les patrons cherchent à faire revenir leurs clients.\nPays : seulement ceux où l'app est vraiment disponible (Maroc, Canada francophone, Suisse romande). La France, la Belgique, le Luxembourg et Monaco recevront de la pub le jour où Apple ouvre l'app chez eux. D'ici là : liste d'attente et contenus gratuits.\nCiblage : large, le tri se fait par la première phrase de la pub (« Vous avez un snack ? »). Depuis la mise à jour Andromeda de Meta, ce sont des créas vraiment différentes qui trouvent le bon public, pas les centres d'intérêt.",
  "prerequis": [
    "1. Compte Instagram pro et Page Facebook Keeply reliés, au moins 6 posts publiés : un patron qui clique regarde le profil.",
    "2. Portefeuille Meta Business, un compte publicitaire en euros, limite de dépense du compte réglée à 100 € par mois.",
    "3. Carte bancaire avec paiements internationaux activés.",
    "4. Liens App Store avec suivi de campagne (App Store Connect > Analytics > Générateur de liens de campagne) : ct=meta-ma, ct=meta-ca, ct=meta-ch. On lit les téléchargements par pub sans SDK dans l'app.",
    "5. Plus tard, quand keeplyfidelity.app/app est en ligne : pixel Meta + événement « ClicAppStore », pour des audiences de relance plus fines.",
    "6. Réponses rapides et message de bienvenue réglés dans Meta Business Suite (prix, Android, comment ça marche).",
    "7. Liste d'attente France/Belgique sur keeplyfidelity.app/bientot (mail + consentement + lien vers la politique de confidentialité), protégée par Cloudflare Turnstile.",
    "8. Audience personnalisée « liste Harvey » (prospects des pays ouverts, au format Meta, après retrait des personnes qui ont refusé ou se sont désinscrites), mise à jour chaque mois."
  ],
  "phases": [
    {
      "nom": "Avant la pub · on laisse parler l'organique",
      "semaines": "24 nov. au 7 déc.",
      "budget_jour": "0 €",
      "budget_total": "0 €",
      "objectif_meta": "Aucune campagne",
      "pourquoi": "Deux semaines pour savoir quels Reels marchent vraiment, et pour remplir les audiences d'engagement (personnes qui ont regardé, aimé, enregistré) qui serviront de relance.",
      "ciblage": "Aucun.",
      "placements": "Aucun.",
      "creas": [
        "On observe : vues chez les non-abonnés, durée regardée, sauvegardes."
      ],
      "kpi_cible": {
        "reels_au_dessus_de_la_moyenne": "au moins 2"
      },
      "regle_stop_ou_scale": "Le 7 décembre, on retient les 2 ou 3 Reels qui ont le plus de vues non-abonnés et de durée regardée : ce seront les pubs."
    },
    {
      "nom": "Décembre · amplifier les gagnants",
      "semaines": "8 au 31 déc.",
      "budget_jour": "environ 2,10 €",
      "budget_total": "50 €",
      "objectif_meta": "Trafic vers l'App Store (clics sur le lien)",
      "pourquoi": "Petit budget, fin d'année chère : on vérifie seulement quelles créas font cliquer des patrons, pays par pays, sans chercher à gagner des volumes.",
      "ciblage": "Une campagne, deux ensembles de pubs (budget fixé par ensemble pour que Meta ne mette pas tout sur le pays le moins cher).\nEnsemble A · Maroc (20 €) : 25 à 60 ans, français et arabe, audience Advantage+ avec en suggestion la liste Harvey, les audiences d'engagement Instagram, et les centres d'intérêt restauration (« Administrateurs de pages restaurants », « Petites entreprises », « Restauration »).\nEnsemble B · Québec + Suisse romande (30 €) : mêmes réglages, langue française.\nAppareils : iPhone uniquement (l'app commerçant n'existe pas encore sur Android).\nExclusions : les personnes qui ont déjà cliqué vers l'App Store depuis une pub (30 jours).",
      "placements": "Reels et Stories Instagram et Facebook (Advantage+ en limitant aux formats verticaux).",
      "creas": [
        "Les 2 ou 3 meilleurs Reels organiques, publiés comme pubs depuis le post existant (on garde les vues et les commentaires).",
        "Une pub « Le calcul » (P2) si le Reel p07 n'est pas parmi les gagnants : c'est l'argument prix."
      ],
      "kpi_cible": {
        "cout_par_clic_maroc": "moins de 0,20 €",
        "cout_par_clic_ca_ch": "moins de 1 €",
        "taux_de_clic": "plus de 1 %",
        "frequence": "moins de 2,5"
      },
      "regle_stop_ou_scale": "Après 7 € dépensés sur une pub : la couper si elle a moins de 0,7 % de taux de clic. Une pub qui donne des téléchargements (lus dans App Store Connect) garde tout le budget."
    },
    {
      "nom": "Janvier · le mois de la relance",
      "semaines": "1er au 31 janv.",
      "budget_jour": "environ 3,30 €",
      "budget_total": "100 €",
      "objectif_meta": "Trafic vers l'App Store + relance",
      "pourquoi": "La pub coûte moins cher en janvier, et le message colle au problème du moment : les clients disparaissent après les fêtes. Créa principale : p17 « Janvier : le mois où vos clients disparaissent ».",
      "ciblage": "70 € · découverte : les deux ensembles de décembre avec la meilleure créa de décembre + p17.\n20 € · relance : personnes qui ont vu au moins 50 % d'une vidéo Keeply, ont interagi avec le compte ou cliqué sans télécharger (60 jours), tous pays ouverts. Message : « 14 jours gratuits, et vous coupez quand vous voulez. »\n10 € · test : une nouvelle créa, idée différente (voir Tests).",
      "placements": "Reels et Stories.",
      "creas": [
        "P1 « Le calcul »",
        "P3 « Janvier »",
        "P4 « Ils reviennent » (relance)",
        "La meilleure de décembre"
      ],
      "kpi_cible": {
        "cout_par_telechargement": "moins de 8 €",
        "cout_par_essai": "moins de 25 €",
        "frequence": "moins de 3"
      },
      "regle_stop_ou_scale": "Monter au-delà de 100 € seulement si un abonné payant coûte moins de 80 € de pub deux mois de suite, et jamais plus de 20 % de hausse par semaine."
    },
    {
      "nom": "Vague 2 · la France ouvre",
      "semaines": "Le jour où Apple ouvre l'App Store français",
      "budget_jour": "même enveloppe",
      "budget_total": "100 € ce mois-là, moitié pour la France et la Belgique",
      "objectif_meta": "Trafic vers l'App Store",
      "pourquoi": "Le premier jour est gratuit : mail à la liste d'attente, post p19, stories. Ensuite, 50 € passent sur la France et la Belgique avec les pubs déjà éprouvées au Maroc et au Canada.",
      "ciblage": "France, Belgique, Luxembourg, Monaco, mêmes réglages que l'ensemble B. Suggestion prioritaire : les prospects français et belges de la prospection HQ et les inscrits de la liste d'attente (en suggestion, ils reçoivent aussi le mail).",
      "placements": "Reels et Stories.",
      "creas": [
        "« La France ouvre. » (teaser p19)",
        "La meilleure pub du moment"
      ],
      "kpi_cible": {
        "cout_par_essai": "moins de 25 €"
      },
      "regle_stop_ou_scale": "Mêmes règles que janvier."
    }
  ],
  "textes_pubs": [
    {
      "nom": "P1 · Le calcul",
      "format": "Reel 20 s (p07)",
      "cta_bouton": "Télécharger",
      "visuel": "Le carnet, le calcul écrit à la main, gros « 4 » final, mention « exemple : panier moyen 10 € ».",
      "texte_principal": "Vous avez un snack, un café ou un restaurant ?\n\nKeeply coûte 39,99 € par mois. Avec un panier moyen de 10 € (exemple), quatre passages de plus par mois couvrent l'abonnement.\n\nVotre carte de fidélité vit dans le Wallet de vos clients. Ils n'installent rien.\n\n14 jours gratuits sur l'App Store.",
      "titre": "Fidéliser, c'est devenu facile",
      "description": "Essai gratuit 14 jours"
    },
    {
      "nom": "P2 · Chrono",
      "format": "Reel 25 s (p06 ou p11)",
      "cta_bouton": "Télécharger",
      "visuel": "L'écran de l'app en temps réel, chrono en haut, la carte qui finit dans le Wallet.",
      "texte_principal": "Vous gérez un fast-food ?\n\nVotre carte de fidélité à votre nom, créée depuis votre iPhone, du premier écran au Wallet de vos clients. Regardez le chrono.\n\nOffres automatiques et statuts : vous allumez ce que vous voulez.\n\n14 jours gratuits.",
      "titre": "Votre carte, prête avant le service",
      "description": "Essai gratuit 14 jours"
    },
    {
      "nom": "P3 · Janvier",
      "format": "Reel 20 s (p17)",
      "cta_bouton": "Télécharger",
      "visuel": "Rues calmes de janvier, puis notification « Vous nous manquez : −10 % cette semaine » sur un écran verrouillé.",
      "texte_principal": "Vos habitués ont disparu depuis les fêtes ?\n\nAvec Keeply, une relance part toute seule quand un client n'est pas revenu depuis un moment. Vous choisissez la remise et le délai, ou vous la coupez.\n\nVotre carte de fidélité, dans leur Wallet. 14 jours gratuits.",
      "titre": "Faites revenir vos habitués",
      "description": "Essai gratuit 14 jours"
    },
    {
      "nom": "P4 · Ils reviennent (relance)",
      "format": "Reel 18 s (p15)",
      "cta_bouton": "Télécharger",
      "visuel": "Le final de la série : dixième tampon, « Remise débloquée · −10 % », carton « Ils reviennent. »",
      "texte_principal": "Vous avez regardé Keeply, il ne manquait que l'essai.\n\n14 jours gratuits sur l'App Store. Vous créez votre carte, vous la testez dans votre commerce, et vous arrêtez quand vous voulez.",
      "titre": "14 jours pour essayer",
      "description": "Sans engagement"
    },
    {
      "nom": "P5 · Écran verrouillé",
      "format": "Reel 8 s en boucle (t02)",
      "cta_bouton": "Télécharger",
      "visuel": "Scan, la carte glisse dans le Wallet, notification de remise sur l'écran verrouillé.",
      "texte_principal": "Vous tenez un café ?\n\nVotre offre peut s'afficher sur l'écran verrouillé de vos clients, comme celle des grandes chaînes. Une carte à votre nom dans leur Wallet, pour 1,33 € par jour.\n\n14 jours gratuits.",
      "titre": "Votre offre, sur leur écran",
      "description": "Essai gratuit 14 jours"
    }
  ],
  "tests_creatifs": [
    {
      "hypothese": "Un patron clique plus pour le prix (Le calcul) que pour la facilité (Chrono).",
      "variante_a": "P1 Le calcul",
      "variante_b": "P2 Chrono",
      "indicateur": "Coût par téléchargement (App Store Connect), après 10 € chacune"
    },
    {
      "hypothese": "La première ligne qui nomme le commerce fait mieux trier que la promesse seule.",
      "variante_a": "« Vous avez un snack ? » en première ligne",
      "variante_b": "« Fidéliser, c'est devenu facile. » en première ligne",
      "indicateur": "Taux de clic et part de téléchargements"
    },
    {
      "hypothese": "Le fondateur face caméra donne plus confiance qu'une vidéo produit.",
      "variante_a": "Reel fondateur (p03)",
      "variante_b": "P5 Écran verrouillé",
      "indicateur": "Coût par téléchargement"
    }
  ],
  "alternative_prospects": "Harvey et la prospection de HQ restent le canal le moins cher : chaque mail de Harvey peut renvoyer vers le Reel « Comment ça marche » (p05) plutôt que vers une page. Les commerces qui répondent mais n'installent pas entrent dans l'audience de relance. Les messages Instagram envoyés à la main restent limités à quelques-uns par jour, personnalisés, jamais copiés-collés.",
  "retargeting": "Audiences de relance (à créer dès le 24 novembre pour qu'elles se remplissent) : personnes ayant regardé 50 % d'une vidéo Keeply (Instagram et Facebook, 60 jours), personnes ayant interagi avec le compte Instagram (90 jours), personnes ayant envoyé un message. Message unique de relance : l'essai de 14 jours et la liberté d'arrêter. Pas de relance au-delà de 3 affichages par semaine.",
  "erreurs_a_eviter": [
    "Faire de la pub en France avant que l'App Store y propose l'app : chaque clic tomberait sur « app non disponible ».",
    "Créer des pubs neuves sans les avoir testées en organique : on paie pour apprendre ce que l'organique dit gratuitement.",
    "Choisir l'objectif « Interaction » ou « Notoriété » : on paierait des vues d'étudiants et de clients de restaurants, pas des patrons.",
    "Couper une pub après 2 jours ou 2 € : attendre au moins 7 € par pub avant de juger.",
    "Booster depuis le bouton de l'app Instagram : moins de réglages (pas de filtre iPhone, pas de limite par pays). Passer par le Gestionnaire de publicités.",
    "Promettre un résultat (« +30 % de clients ») : aucun chiffre ne le prouve encore."
  ],
  "estimation": {
    "hypotheses": "Estimations prudentes, pas des promesses : aucune donnée réelle n'existe encore. Coût par clic supposé : 0,05 à 0,25 € au Maroc, 0,60 à 1,50 € au Canada et en Suisse (plus cher en décembre). 15 à 30 % des clics vers l'App Store donnent un téléchargement, 30 à 50 % des téléchargements lancent l'essai.",
    "clics_estimes": "Décembre : 100 à 300 clics. Janvier : 200 à 500 clics.",
    "installations_estimees": "Décembre : 15 à 60. Janvier : 30 à 120.",
    "essais_estimes": "Décembre : 4 à 20. Janvier : 10 à 40.",
    "cout_par_essai_estime": "3 à 12 € par essai au Maroc, 10 à 40 € au Canada et en Suisse."
  }
};
