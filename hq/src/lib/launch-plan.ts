/*
 * Plan de lancement Instagram + Meta Ads (préparé le 02/11/2026 avec les agents
 * Instagram Curator et Paid Social Strategist). Les visuels se font avec les
 * nouvelles cartes du fondateur. Les crochets [ ] sont à remplir avec du vrai vécu.
 */
export type LaunchPost = (typeof INSTAGRAM_PLAN)["posts"][number];

export const INSTAGRAM_PLAN = {
  "objectif": "En 6 semaines, faire passer le compte Instagram @keeply de 0 à une base de commerçants de la restauration marocaine qui comprennent Keeply en 10 secondes, et transformer cette attention en essais gratuits de 14 jours démarrés depuis keeplyfidelity.app. Priorité au marché de lancement (Casablanca, Marrakech, Rabat, Agadir, Tanger), en français. Indicateur roi : nombre d'essais gratuits démarrés depuis Instagram (lien bio avec UTM + DM). Indicateurs de croissance : portée des Reels auprès des non-abonnés, sauvegardes des carrousels, DM qualifiés de restaurateurs.",
  "positionnement": "Keeply remplace la carte de fidélité en carton par une carte à vos couleurs qui vit dans le Wallet de vos clients, sans application à installer, et qui fait revenir vos clients pendant que vous servez.",
  "piliers": [
    {
      "nom": "Démonstration produit",
      "part_pourcent": 35,
      "pourquoi": "Un compte neuf doit d'abord prouver que c'est simple : QR au comptoir, carte dans le Wallet, scan en caisse. Les Reels de démo sont le meilleur levier de portée organique auprès des non-abonnés, et ils servent ensuite de créas pour les publicités."
    },
    {
      "nom": "Éducation fidélisation",
      "part_pourcent": 30,
      "pourquoi": "Les carrousels pédagogiques (erreurs à éviter, paliers, avis Google, calcul du client perdu) génèrent des sauvegardes et des partages entre restaurateurs. Ils installent Keeply comme la référence qui s'y connaît en fidélité, pas seulement comme une app de plus."
    },
    {
      "nom": "Fondateur et coulisses",
      "part_pourcent": 20,
      "pourquoi": "Sans témoignages clients pour l'instant, la confiance passe par un visage réel : un fondateur qui construit l'app seul depuis le Maroc et qui répond lui-même. C'est vrai, vérifiable et différenciant face aux solutions étrangères anonymes."
    },
    {
      "nom": "Offre et conversion",
      "part_pourcent": 15,
      "pourquoi": "Rappeler clairement l'essai gratuit de 14 jours, le prix (399 DH/mois au Maroc) et le chemin vers l'App Store. Peu de posts, mais tous boostables, pour convertir l'attention gagnée par les trois autres piliers."
    }
  ],
  "rythme": "Semaine 0 : 3 posts de mise en place (lundi, mercredi, vendredi) pour que le profil soit rempli avant toute publicité. Semaines 1 à 5 : 3 posts par semaine (mardi, jeudi, samedi), avec 2 Reels minimum sur 3 quand c'est possible. Stories tous les jours (3 à 5 par jour). Horaires calés sur les creux de service des restaurateurs marocains : 15:30 (après le rush du déjeuner) et 23:00 (après la fermeture). Le fondateur reste disponible 60 minutes après chaque publication pour répondre aux commentaires (heure dorée). Boost : uniquement les posts marqués boost, à partir de la semaine 1, petit budget ciblé commerçants restauration au Maroc (centres d'intérêt restauration, gestion de restaurant, propriétaires de petites entreprises, villes de lancement).",
  "bio": "Votre carte de fidélité dans Apple Wallet et Google Wallet. Sans app pour vos clients. Fast-foods, cafés, restaurants. Essai gratuit 14 jours",
  "lien_bio": "https://keeplyfidelity.app/?utm_source=instagram&utm_medium=bio&utm_campaign=lancement_maroc (page d'accueil avec bouton App Store en premier, mention de l'essai gratuit 14 jours et du prix 399 DH/mois au Maroc ; changer utm_content selon le post mis en avant)",
  "highlights": [
    "Comment ça marche",
    "Vos cartes",
    "Offres auto",
    "Prix et essai",
    "Le fondateur",
    "Questions"
  ],
  "posts": [
    {
      "id": "p01",
      "semaine": 0,
      "jour": "lundi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "Le carton est mort",
      "accroche": "Votre carte de fidélité en carton finit à la poubelle.",
      "visuel": "Reel vertical 12 à 15 s. Plan 1 (0-2 s) : gros plan sur une carte en carton tamponnée et cornée, posée sur un comptoir de fast-food tacos à Casablanca, une main la froisse. Plan 2 (2-5 s) : un client approche son iPhone d'une affiche QR Keeply posée près de la caisse. Plan 3 (5-9 s) : reprise de la vidéo 46 s « carte » (téléphone 3D), la NOUVELLE carte du tacos (style fast-food, couleurs vives, logo bien visible) sort de l'écran puis se range dans Apple Wallet, carte entière cadrée, aucun bord coupé. Plan 4 (9-12 s) : le commerçant scanne la carte du client avec son propre téléphone en caisse, un tampon s'ajoute. Plan 5 (12-15 s) : texte final « Sans app à installer. keeplyfidelity.app ». Sous-titres incrustés tout du long.",
      "legende": "Le carton se perd, se plie, s'oublie au fond d'une poche. Et le jour où votre client revient, il n'a plus rien sur lui.\n\nAvec Keeply, votre carte de fidélité arrive directement dans Apple Wallet ou Google Wallet. Votre client scanne un QR code au comptoir, c'est tout. Pas d'application à télécharger, pas de compte à créer.\n\nEn caisse, vous scannez avec votre téléphone. Tampons ou points, c'est vous qui choisissez.\n\nLe compte démarre aujourd'hui. Abonnez-vous si vous tenez un fast-food, un café ou un restaurant au Maroc : on va parler fidélité, simplement.",
      "hashtags": [
        "#cartedefidelite",
        "#fidelisationclient",
        "#fastfoodmaroc",
        "#casablanca",
        "#restaurationmaroc",
        "#applewallet",
        "#googlewallet",
        "#commercantmaroc",
        "#tacosmaroc",
        "#keeply"
      ],
      "pourquoi": "Premier contact : un problème que tout restaurateur connaît (le carton perdu) et la solution montrée en moins de 15 secondes. Il doit provoquer le réflexe « c'est exactement mon cas » et un abonnement. Regarder le taux de visionnage complet et la part de vues non-abonnés.",
      "cta": "Abonnez-vous pour la suite",
      "asset_existant": "Vidéo verticale 46 s « carte » (à recouper en 12-15 s ; remplacer l'ancienne carte photo plein écran par la nouvelle carte style fast-food) + pub photo « Le carton est mort » pour le plan d'ouverture",
      "boost": false
    },
    {
      "id": "p02",
      "semaine": 0,
      "jour": "mercredi",
      "heure": "15:30",
      "format": "Carrousel",
      "pilier": "Éducation fidélisation",
      "titre": "Pourquoi le carton ne marche plus",
      "accroche": "Le carton est mort. Voici pourquoi.",
      "visuel": "Carrousel A « Le carton est mort », 7 slides, fond papier crème, typo éditoriale. Slide 1 : titre « Le carton est mort » avec une carte carton déchirée. Slide 2 : « Il se perd » (carte carton oubliée sur une table de café). Slide 3 : « Il ne vous dit rien » (aucune idée de qui revient, ni quand). Slide 4 : « Il ne rappelle jamais votre client ». Slide 5 : transition, la NOUVELLE carte d'un café de quartier à Marrakech (style chaleureux, tons bois et crème, logo du café) affichée dans un iPhone, carte entière bien cadrée. Slide 6 : trois bénéfices courts : dans le Wallet, notifications sur l'écran verrouillé, tableau de bord. Slide 7 : « Essai gratuit 14 jours, lien en bio » + logo Keeply.",
      "legende": "Le carton de fidélité a rendu service pendant des années. Mais il a trois défauts que vous connaissez sûrement :\n\n1. Il se perd (et votre client recommence à zéro, ou ne recommence pas).\n2. Il ne vous dit rien : qui revient, à quelle fréquence, qui a disparu.\n3. Il ne peut pas rappeler votre client quand il ne passe plus.\n\nUne carte dans le Wallet du téléphone règle les trois. Elle est toujours dans la poche de votre client, elle peut lui envoyer une notification sur son écran verrouillé, et vous voyez tout dans votre tableau de bord.\n\nEnregistrez ce post pour le relire au calme après le service.",
      "hashtags": [
        "#cartedefidelite",
        "#fidelisationclient",
        "#cafemaroc",
        "#marrakech",
        "#restaurationmaroc",
        "#marketingrestaurant",
        "#commercantmaroc",
        "#applewallet",
        "#keeply"
      ],
      "pourquoi": "Poser le diagnostic avant de vendre : un carrousel éducatif que le restaurateur sauvegarde et partage à un associé. Il doit provoquer des sauvegardes et des commentaires « nous aussi ». Indicateur : taux de sauvegarde (sauvegardes / portée).",
      "cta": "Enregistrez ce post",
      "asset_existant": "Carrousel A « Le carton est mort » (garder les slides 1 à 4 ; refaire les slides 5 à 7 avec la nouvelle carte café, l'ancienne carte photo plein écran est à retirer)",
      "boost": false
    },
    {
      "id": "p03",
      "semaine": 0,
      "jour": "vendredi",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Fondateur et coulisses",
      "titre": "Qui est derrière Keeply",
      "accroche": "Je construis Keeply seul, depuis le Maroc.",
      "visuel": "Reel face caméra 30 à 40 s, filmé au téléphone, lumière naturelle, à son bureau ou en terrasse. Plan 1 : visage du fondateur, phrase d'accroche. Plan 2 : écran de Mac avec Xcode ou l'app ouverte (vraie capture, pas de mise en scène). Plan 3 : il montre sur son iPhone deux ou trois des NOUVELLES cartes (une fast-food, une café, une restaurant), chaque carte entière à l'écran. Plan 4 : retour visage, il explique pourquoi il a construit l'app et ce qu'il veut pour les commerçants marocains. Plan 5 : « Écrivez-moi en DM, je réponds moi-même ». Sous-titres obligatoires.",
      "legende": "Je m'appelle [prénom], et je construis Keeply seul, depuis le Maroc.\n\nPas d'équipe marketing, pas de bureau à l'étranger. Une app que j'ai dessinée et développée moi-même, pour que les fast-foods, les cafés et les restaurants d'ici aient une carte de fidélité moderne, à leurs couleurs, sans demander à leurs clients d'installer quoi que ce soit.\n\nL'app est disponible sur l'App Store au Maroc depuis le 1er novembre. Je cherche maintenant les premiers commerçants qui veulent l'essayer, et je les accompagne personnellement pour la mise en place.\n\nVous avez une question ? Écrivez-moi en message privé, c'est moi qui réponds.",
      "hashtags": [
        "#entrepreneurmaroc",
        "#startupmaroc",
        "#madeinmorocco",
        "#fondateur",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#cartedefidelite",
        "#appiphone",
        "#keeply"
      ],
      "pourquoi": "Sans avis clients, la confiance vient d'un visage et d'une histoire vraie. Ce post doit provoquer des DM et des commentaires d'encouragement, et rassurer avant les premières publicités. Indicateurs : DM reçus, visites du profil, abonnés gagnés sur ce Reel. Le fondateur remplace [prénom] par son vrai prénom, rien n'est inventé.",
      "cta": "Écrivez-moi en DM",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p04",
      "semaine": 1,
      "jour": "mardi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "Keeply en 15 secondes",
      "accroche": "Votre client scanne. C'est tout.",
      "visuel": "Reel 15 s, rythme rapide, une action par seconde. Plan 1 : affiche d'activation Keeply posée sur le comptoir d'un burger à Agadir. Plan 2 : main d'un client qui scanne avec un iPhone. Plan 3 : la NOUVELLE carte du burger (style street food, couleur forte, photo du burger en bandeau) apparaît et s'ajoute au Wallet, carte entière cadrée. Plan 4 : même scène avec un téléphone Android et Google Wallet. Plan 5 : le commerçant scanne en caisse, compteur qui monte. Plan 6 : écran final « Essai gratuit 14 jours ». Compteur 1, 2, 3 incrusté en haut.",
      "legende": "Trois étapes, pas une de plus :\n\n1. Votre client scanne le QR code au comptoir.\n2. Sa carte arrive dans Apple Wallet ou Google Wallet, sans application à installer.\n3. Vous scannez sa carte en caisse avec votre téléphone.\n\nVotre logo, vos couleurs, votre photo. Tampons ou points, à vous de voir.\n\nEssai gratuit de 14 jours, lien en bio.",
      "hashtags": [
        "#cartedefidelite",
        "#fastfoodmaroc",
        "#burgermaroc",
        "#agadir",
        "#applewallet",
        "#googlewallet",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#fidelisationclient",
        "#keeply"
      ],
      "pourquoi": "C'est le Reel pivot du lancement : il explique tout le produit en 15 secondes et sert de créa principale pour la pub. Il doit provoquer des clics vers le lien en bio. Indicateurs : taux de rétention à 3 s, clics sur le lien, coût par visite du site en boost.",
      "cta": "Essai gratuit 14 jours, lien en bio",
      "asset_existant": "Vidéo verticale 46 s « carte » (extraire le plan téléphone 3D ; remplacer l'ancienne carte photo plein écran par la nouvelle carte burger)",
      "boost": true
    },
    {
      "id": "p05",
      "semaine": 1,
      "jour": "jeudi",
      "heure": "21:00",
      "format": "Carrousel",
      "pilier": "Démonstration produit",
      "titre": "Votre carte, votre marque",
      "accroche": "Quatre commerces. Quatre cartes. Aucune ne se ressemble.",
      "visuel": "Carrousel C « Votre carte, votre marque », 6 slides. Slide 1 : titre + les 4 cartes en éventail. Slide 2 : snack tacos à Casablanca, NOUVELLE carte style fast-food (couleurs vives, tampons). Slide 3 : café de spécialité à Rabat, NOUVELLE carte style minimal (crème, typo fine, points). Slide 4 : restaurant de quartier à Tanger (cuisine marocaine), NOUVELLE carte style chaleureux avec photo du plat. Slide 5 : restaurant gastronomique à Marrakech, NOUVELLE carte style haut de gamme (noir et or, logo discret). Chaque carte entière, centrée, dans un iPhone, sans recadrage. Slide 6 : « Logo, couleurs, photo : la vôtre en quelques minutes. Essai gratuit 14 jours ».",
      "legende": "Une carte de fidélité, c'est un petit bout de votre enseigne dans la poche de vos clients. Elle doit vous ressembler.\n\nAvec Keeply, vous choisissez votre logo, vos couleurs, votre photo et votre système : tampons ou points. Un snack de quartier et une table gastronomique n'auront jamais la même carte, et c'est très bien comme ça.\n\nLaquelle ressemble le plus à votre commerce ? Dites-le en commentaire : 1, 2, 3 ou 4.",
      "hashtags": [
        "#cartedefidelite",
        "#brandingrestaurant",
        "#restaurationmaroc",
        "#casablanca",
        "#rabat",
        "#tanger",
        "#marrakech",
        "#applewallet",
        "#commercantmaroc",
        "#keeply"
      ],
      "pourquoi": "Montre que Keeply convient à tous les styles, du fast-food au haut de gamme, et pousse le restaurateur à se projeter. La question 1, 2, 3 ou 4 provoque des commentaires faciles, ce qui nourrit l'algorithme. Indicateurs : commentaires, sauvegardes, partages.",
      "cta": "Commentez 1, 2, 3 ou 4",
      "asset_existant": "Carrousel C « Votre carte, votre marque » (remplacer les 4 cartes par les nouvelles cartes du fondateur, une par style)",
      "boost": true
    },
    {
      "id": "p06",
      "semaine": 1,
      "jour": "samedi",
      "heure": "15:30",
      "format": "Photo",
      "pilier": "Offre et conversion",
      "titre": "Essai gratuit 14 jours",
      "accroche": "Le carton est mort. Essayez la suite pendant 14 jours.",
      "visuel": "Pub photo « Le carton est mort » refaite au format 4:5. À gauche, une carte carton froissée. À droite, un iPhone avec la NOUVELLE carte d'une pizzeria à Tanger (style italien, rouge et crème, photo de pizza), carte entière bien cadrée. En bas : « Essai gratuit 14 jours. Puis 399 DH/mois ». Logo Keeply en petit.",
      "legende": "Vous pouvez tester Keeply pendant 14 jours, gratuitement.\n\nCréez votre carte à vos couleurs, imprimez votre affiche QR, posez-la au comptoir et regardez vos premiers clients l'ajouter à leur Wallet.\n\nEnsuite, c'est 399 DH par mois au Maroc. Les remises, les paliers, les offres automatiques : tout s'active ou se coupe depuis l'app, vous gardez la main.\n\nTéléchargement sur l'App Store, lien en bio.",
      "hashtags": [
        "#cartedefidelite",
        "#pizzeriamaroc",
        "#tanger",
        "#restaurationmaroc",
        "#fidelisationclient",
        "#commercantmaroc",
        "#applewallet",
        "#essaigratuit",
        "#keeply"
      ],
      "pourquoi": "Premier post 100 % conversion, avec le prix affiché pour filtrer les curieux et attirer les vrais décideurs. Il doit provoquer des clics vers l'App Store. Indicateurs : clics sur le lien, essais démarrés avec utm_content=p06.",
      "cta": "Téléchargez Keeply, lien en bio",
      "asset_existant": "Pub photo « Le carton est mort » (remplacer l'ancienne carte photo plein écran par la nouvelle carte pizzeria)",
      "boost": true
    },
    {
      "id": "p07",
      "semaine": 2,
      "jour": "mardi",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "Pendant que vous servez",
      "accroche": "Il est 14h. Vous servez. Keeply travaille.",
      "visuel": "Reel 20 s adapté du carrousel B « Pendant que vous servez » (ambiance nuit, frise horaire). Une frise horaire défile, avec à chaque heure une notification qui apparaît sur un écran verrouillé d'iPhone. 9h : « Joyeux anniversaire, une remise vous attend ». 13h : il pleut, « Jour de pluie : -15 % sur votre commande aujourd'hui ». 17h : « Cela fait 3 semaines, on vous a gardé une place ». 22h : le commerçant ferme, tableau de bord avec les passages du jour. Commerce : restaurant de quartier à Rabat, NOUVELLE carte style familial visible entière en ouverture et en fin. Petit interrupteur animé à côté de chaque offre pour montrer qu'on l'allume ou l'éteint.",
      "legende": "Pendant que vous êtes en cuisine, votre carte de fidélité peut travailler pour vous.\n\nAnniversaire d'un client, client qui ne revient plus depuis quelques semaines, jour de pluie où la salle est vide : Keeply peut envoyer automatiquement une offre sur l'écran verrouillé de vos clients. Sans frais d'envoi, contrairement aux SMS.\n\nChaque offre automatique s'active ou se coupe d'un geste. Vous décidez lesquelles tournent, et quand.\n\nQuelle offre vous serait la plus utile ? Anniversaire, pluie ou client absent ?",
      "hashtags": [
        "#fidelisationclient",
        "#marketingrestaurant",
        "#restaurantmaroc",
        "#rabat",
        "#restaurationmaroc",
        "#notifications",
        "#cartedefidelite",
        "#commercantmaroc",
        "#applewallet",
        "#keeply"
      ],
      "pourquoi": "Montre la fonction la plus différenciante (offres automatiques) de façon concrète et rassure sur le contrôle. Il doit provoquer des commentaires (choix de l'offre) et des partages. Indicateurs : rétention moyenne, commentaires, partages en DM.",
      "cta": "Dites-nous quelle offre vous choisiriez",
      "asset_existant": "Carrousel B « Pendant que vous servez » (reprendre la frise horaire et l'ambiance nuit en version animée ; refaire les cartes avec la nouvelle carte restaurant de quartier)",
      "boost": true
    },
    {
      "id": "p08",
      "semaine": 2,
      "jour": "jeudi",
      "heure": "15:30",
      "format": "Carrousel",
      "pilier": "Éducation fidélisation",
      "titre": "5 erreurs de carte de fidélité",
      "accroche": "5 erreurs qui font échouer une carte de fidélité.",
      "visuel": "Carrousel 7 slides, fond crème cohérent avec le carrousel A, une erreur par slide avec un pictogramme simple. Slide 1 : titre. Slide 2 : « Une récompense trop lointaine ». Slide 3 : « Une carte qu'on peut perdre ». Slide 4 : « Une récompense floue » (préférer une remise claire en % ou en €). Slide 5 : « Ne jamais rappeler le client ». Slide 6 : « Ne pas savoir qui revient ». Slide 7 : la NOUVELLE carte d'un coffee shop à Casablanca (style moderne, couleur pastel), carte entière, avec « Keeply corrige les 5. Essai gratuit 14 jours ».",
      "legende": "Une carte de fidélité qui ne marche pas, ce n'est presque jamais la faute des clients. C'est souvent l'une de ces 5 erreurs :\n\n1. La récompense est trop loin : personne ne vise 20 passages.\n2. La carte se perd : le carton disparaît avant d'être rempli.\n3. La récompense est floue : une remise claire, en % ou en €, se comprend tout de suite.\n4. Vous ne rappelez jamais le client qui a disparu.\n5. Vous ne savez pas qui revient vraiment.\n\nAvec Keeply, la carte reste dans le Wallet, les récompenses sont des remises que vous fixez, et vous voyez vos clients fidèles dans le tableau de bord.\n\nEnregistrez ce post, et envoyez-le à un ami restaurateur.",
      "hashtags": [
        "#fidelisationclient",
        "#cartedefidelite",
        "#conseilsrestaurant",
        "#coffeeshop",
        "#casablanca",
        "#marketingrestaurant",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#entrepreneurmaroc",
        "#keeply"
      ],
      "pourquoi": "Contenu utile même pour qui n'achète pas tout de suite : c'est ce qui crée des sauvegardes et des partages entre restaurateurs. Il doit installer l'expertise de Keeply. Indicateurs : taux de sauvegarde et partages.",
      "cta": "Enregistrez et partagez à un ami restaurateur",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p09",
      "semaine": 2,
      "jour": "samedi",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "La notification qui ne coûte rien",
      "accroche": "Un SMS coûte. Celle-ci, non.",
      "visuel": "Reel 15 s en écran partagé. À gauche : une facture de SMS qui s'allonge (illustration générique, aucun montant inventé présenté comme réel). À droite : un écran verrouillé d'iPhone qui reçoit une notification de la carte d'un glacier-salon de thé à Marrakech (NOUVELLE carte style gourmand, couleurs douces, photo de glace). Plan suivant : le client ouvre la notification, la carte s'affiche entière. Plan final : dans l'app Keeply, le commerçant tape son message et l'envoie, avec l'interrupteur des notifications visible.",
      "legende": "Envoyer un SMS à tous vos clients, ça se paie à chaque message.\n\nAvec Keeply, vos messages arrivent directement sur l'écran verrouillé de vos clients, via leur carte dans le Wallet. Aucun frais d'envoi, quel que soit le nombre de clients.\n\nUne nouveauté à la carte, un horaire spécial pendant le Ramadan, un coupon pour un dessert offert : vous écrivez, vous envoyez. Et si vous préférez rester discret, les notifications se coupent, vous gardez la main.\n\nVous envoyez déjà des messages à vos clients ? Racontez-nous comment en commentaire.",
      "hashtags": [
        "#marketingrestaurant",
        "#notifications",
        "#glacier",
        "#salondethe",
        "#marrakech",
        "#restaurationmaroc",
        "#cartedefidelite",
        "#applewallet",
        "#commercantmaroc",
        "#keeply"
      ],
      "pourquoi": "Argument économique simple, très parlant pour un commerçant qui a déjà payé des SMS. Il doit provoquer des questions en commentaire et en DM. Indicateurs : commentaires, DM, taux de visionnage complet.",
      "cta": "Racontez-nous comment vous contactez vos clients",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p10",
      "semaine": 3,
      "jour": "mardi",
      "heure": "15:30",
      "format": "Carrousel",
      "pilier": "Éducation fidélisation",
      "titre": "Bronze, Argent, Or",
      "accroche": "Vos meilleurs clients méritent un statut.",
      "visuel": "Carrousel 6 slides, fond sombre élégant. Slide 1 : titre et trois cartes empilées. Slide 2 : le principe des paliers en une phrase. Slide 3 : la NOUVELLE carte d'un restaurant haut de gamme à Marrakech en version Bronze (carte entière). Slide 4 : même carte en version Argent. Slide 5 : même carte en version Or. Sous chaque carte, un exemple de remise attachée au palier (exemple à personnaliser, ex. -5 %, -10 %, -15 %). Slide 6 : « Les paliers s'activent ou se coupent. Essai gratuit 14 jours ».",
      "legende": "Tous les clients ne sont pas pareils. Celui qui vient chaque semaine depuis un an mérite d'être reconnu.\n\nAvec les paliers Keeply, vos clients montent de Bronze à Argent puis Or au fil de leurs visites. À chaque palier, vous associez une remise en % ou en € que vous choisissez vous-même.\n\nC'est particulièrement efficace dans la restauration haut de gamme : un statut se remarque, il se montre à table, il donne envie de revenir.\n\nLes paliers sont une option : vous les activez si vous en avez envie, vous les coupez quand vous voulez.\n\nEnregistrez ce post pour préparer vos paliers.",
      "hashtags": [
        "#fidelisationclient",
        "#restaurantgastronomique",
        "#marrakech",
        "#finedining",
        "#programmefidelite",
        "#restaurationmaroc",
        "#cartedefidelite",
        "#applewallet",
        "#commercantmaroc",
        "#keeply"
      ],
      "pourquoi": "Élargit la cible vers le haut de gamme et explique une fonction premium de manière visuelle. Les exemples de remises sont présentés comme des exemples, pas comme des résultats. Il doit provoquer des sauvegardes. Indicateurs : taux de sauvegarde et visites du profil.",
      "cta": "Enregistrez pour préparer vos paliers",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p11",
      "semaine": 3,
      "jour": "jeudi",
      "heure": "21:00",
      "format": "Reel",
      "pilier": "Fondateur et coulisses",
      "titre": "Une journée à construire Keeply",
      "accroche": "Ce que personne ne voit derrière une app.",
      "visuel": "Reel coulisses 25 à 30 s, format journal filmé. Plan 1 : café du matin, ordinateur ouvert. Plan 2 : écran de code ou de design (vrai travail du jour). Plan 3 : le fondateur teste une NOUVELLE carte (style fast-food) sur son iPhone, l'ajoute au Wallet, carte entière à l'écran. Plan 4 : il imprime une affiche d'activation QR et la regarde. Plan 5 : il lit et répond à un DM (contenu flouté). Plan 6 : face caméra, une phrase sur ce qu'il a amélioré cette semaine grâce aux questions reçues. Musique tendance douce, sous-titres.",
      "legende": "Une journée normale chez Keeply : du code le matin, des tests de cartes l'après-midi, et vos messages le soir.\n\nCette semaine, j'ai travaillé sur [vraie amélioration de la semaine]. C'est une question reçue ici même en DM qui m'a donné l'idée.\n\nC'est l'avantage d'une app construite par une seule personne : je lis tout, et ce que vous me dites change vraiment le produit.\n\nQu'est-ce qui vous manque dans votre carte de fidélité actuelle ? Je lis toutes les réponses.",
      "hashtags": [
        "#entrepreneurmaroc",
        "#startupmaroc",
        "#coulisses",
        "#buildinpublic",
        "#madeinmorocco",
        "#appiphone",
        "#restaurationmaroc",
        "#cartedefidelite",
        "#keeply"
      ],
      "pourquoi": "Entretient la confiance créée par p03 et montre que le produit évolue grâce aux commerçants. Il doit provoquer des réponses en commentaire qui servent de recherche utilisateur. Indicateurs : commentaires, DM, abonnés gagnés. Le fondateur remplace la mention entre crochets par une amélioration réelle.",
      "cta": "Dites-moi ce qui vous manque",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p12",
      "semaine": 3,
      "jour": "samedi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "Créer sa carte en direct",
      "accroche": "Je crée la carte d'un snack en temps réel.",
      "visuel": "Reel 25 s, enregistrement d'écran de l'app Keeply en accéléré, avec le téléphone tenu en main en incrustation. Étape 1 : choix du nom et du logo d'un snack tacos fictif clairement présenté comme exemple. Étape 2 : choix des couleurs, la carte change en direct. Étape 3 : ajout de la photo. Étape 4 : choix tampons ou points et de la remise (en % ou en €). Étape 5 : la NOUVELLE carte terminée, entière, ajoutée au Wallet. Déclinaison de la pub « extras » version fast-food en dernier plan avec les options (offres auto, paliers, notifications) qui s'allument une à une avec leurs interrupteurs.",
      "legende": "De zéro à une carte prête à scanner, en direct.\n\nNom, logo, couleurs, photo, tampons ou points, remise en % ou en € : tout se règle depuis votre téléphone. Ensuite, vous imprimez votre affiche QR et vos clients peuvent commencer.\n\nEt les extras ? Offres automatiques, paliers, notifications, demande d'avis Google : chacun s'allume ou s'éteint quand vous voulez. Vous commencez simple, vous ajoutez le reste plus tard.\n\nEssai gratuit 14 jours, lien en bio.",
      "hashtags": [
        "#cartedefidelite",
        "#fastfoodmaroc",
        "#snack",
        "#tacos",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#tutoriel",
        "#applewallet",
        "#googlewallet",
        "#keeply"
      ],
      "pourquoi": "Lève la principale objection d'un restaurateur débordé : « je n'ai pas le temps de configurer ça ». Il doit provoquer des clics vers l'essai gratuit. Indicateurs : clics sur le lien, rétention jusqu'à la carte finale, essais démarrés avec utm_content=p12.",
      "cta": "Créez la vôtre, essai gratuit 14 jours",
      "asset_existant": "Pub « extras » (déclinaison fast-food pour le plan final ; refaire avec la nouvelle carte)",
      "boost": true
    },
    {
      "id": "p13",
      "semaine": 4,
      "jour": "mardi",
      "heure": "21:00",
      "format": "Carrousel",
      "pilier": "Éducation fidélisation",
      "titre": "Plus d'avis Google, au bon moment",
      "accroche": "Le meilleur moment pour demander un avis Google.",
      "visuel": "Carrousel 6 slides. Slide 1 : titre avec des étoiles Google stylisées (aucune note réelle inventée). Slide 2 : « Demander à la caisse, c'est gênant ». Slide 3 : « Demander par écrit sur le ticket, personne ne le fait ». Slide 4 : « Demander juste après une visite réussie, depuis la carte du client ». Slide 5 : la NOUVELLE carte d'un restaurant de quartier à Casablanca (cuisine marocaine, style chaleureux, carte entière) avec la notification de demande d'avis sur écran verrouillé. Slide 6 : « La demande d'avis s'active ou se coupe. Essai gratuit 14 jours ».",
      "legende": "Les avis Google font venir de nouveaux clients. Le problème, c'est de les demander sans gêner personne.\n\nLe bon moment, c'est juste après une visite, quand le repas est encore frais dans la tête de votre client. Keeply peut lui envoyer une demande d'avis directement via sa carte de fidélité, avec le lien vers votre fiche Google.\n\nPas d'insistance au comptoir, pas de papier. Et si vous ne voulez pas de demande d'avis pendant une période, vous la coupez.\n\nEnregistrez ce post pour vos prochaines semaines.",
      "hashtags": [
        "#avisgoogle",
        "#googlemaps",
        "#restaurantmaroc",
        "#casablanca",
        "#marketingrestaurant",
        "#ereputation",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#fidelisationclient",
        "#keeply"
      ],
      "pourquoi": "Les avis Google sont une douleur forte et universelle chez les restaurateurs, ce sujet attire même ceux qui ne cherchent pas de carte de fidélité. Il doit provoquer des sauvegardes et des partages. Indicateurs : sauvegardes, partages, nouveaux abonnés venus de ce post.",
      "cta": "Enregistrez ce post",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p14",
      "semaine": 4,
      "jour": "jeudi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "L'affiche qui fait tout",
      "accroche": "Une feuille A4. C'est tout votre lancement.",
      "visuel": "Reel 15 à 20 s. Plan 1 : une imprimante sort l'affiche d'activation Keeply (QR code, logo et couleurs d'un café de spécialité à Agadir). Plan 2 : le gérant la pose dans un cadre sur le comptoir, à côté de la machine à espresso. Plan 3 : un client attend son café et scanne l'affiche. Plan 4 : la NOUVELLE carte du café (style artisanal, kraft et vert, carte entière) arrive dans Google Wallet sur un Android. Plan 5 : même geste sur un iPhone, Apple Wallet. Plan final : « Imprimez, posez, c'est lancé ».",
      "legende": "Pour lancer votre carte de fidélité, vous n'avez besoin que d'une chose : votre affiche d'activation.\n\nKeeply la génère à vos couleurs, avec votre QR code. Vous l'imprimez, vous la posez près de la caisse ou sur les tables, et vos clients ajoutent leur carte pendant qu'ils attendent leur commande.\n\nAucune formation pour votre équipe, aucune application pour vos clients.\n\nVotre affiche, vous la mettriez où : comptoir, tables ou vitrine ?",
      "hashtags": [
        "#cartedefidelite",
        "#coffeeshop",
        "#cafemaroc",
        "#agadir",
        "#qrcode",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#googlewallet",
        "#applewallet",
        "#keeply"
      ],
      "pourquoi": "Rend la mise en place tangible et ridiculement simple, et montre Google Wallet pour rassurer les clients Android. Il doit provoquer des commentaires et des clics. Indicateurs : rétention, commentaires, clics sur le lien.",
      "cta": "Dites-nous où vous la poseriez",
      "asset_existant": null,
      "boost": true
    },
    {
      "id": "p15",
      "semaine": 4,
      "jour": "samedi",
      "heure": "21:00",
      "format": "Carrousel",
      "pilier": "Éducation fidélisation",
      "titre": "Ce que coûte un client qui ne revient pas",
      "accroche": "Faites le calcul avec vos propres chiffres.",
      "visuel": "Carrousel 7 slides style fiche de calcul, fond crème, chiffres manuscrits. Slide 1 : titre. Slide 2 : « Votre panier moyen : ____ DH ». Slide 3 : « Combien de fois par mois revient un client fidèle : ____ ». Slide 4 : « Multipliez par 12 : c'est ce que vaut un fidèle sur un an ». Slide 5 : « Combien de clients ne reviennent jamais après une première visite ? ». Slide 6 : « Faire revenir quelques clients de plus par mois change déjà l'année ». Slide 7 : la NOUVELLE carte d'un fast-food burger à Casablanca (carte entière) + « 399 DH/mois. Essai gratuit 14 jours ». Aucun chiffre de résultat présenté comme réel : le lecteur remplit avec ses propres chiffres.",
      "legende": "Un client fidèle ne vaut pas un repas. Il vaut tous les repas qu'il prendra chez vous dans l'année.\n\nFaites le calcul avec vos propres chiffres :\nvotre panier moyen x le nombre de visites par mois x 12.\n\nRegardez ensuite combien de clients ne passent qu'une fois. Les faire revenir, même quelques-uns, c'est souvent plus rentable que d'en chercher de nouveaux.\n\nKeeply coûte 399 DH par mois au Maroc, avec 14 jours d'essai gratuit pour voir si ça marche chez vous.\n\nEnregistrez ce post et faites le calcul ce soir après la fermeture.",
      "hashtags": [
        "#gestionrestaurant",
        "#rentabilite",
        "#fastfoodmaroc",
        "#casablanca",
        "#fidelisationclient",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#entrepreneurmaroc",
        "#cartedefidelite",
        "#keeply"
      ],
      "pourquoi": "Parle argent sans inventer aucun chiffre : c'est le restaurateur qui calcule, ce qui rend la conclusion plus convaincante. Il doit provoquer des sauvegardes et des DM sur le prix. Indicateurs : sauvegardes, DM « prix », clics sur le lien.",
      "cta": "Faites le calcul et enregistrez",
      "asset_existant": null,
      "boost": false
    },
    {
      "id": "p16",
      "semaine": 5,
      "jour": "mardi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Démonstration produit",
      "titre": "Le tableau de bord",
      "accroche": "Qui revient chez vous ? Maintenant, vous le savez.",
      "visuel": "Reel 15 à 20 s. Plan 1 : un gérant de pizzeria à Rabat, tablier, fin de service, s'assoit avec son iPhone. Plan 2 : enregistrement d'écran du tableau de bord Keeply avec des données de démonstration clairement fictives (compte de démo) : passages, clients fidèles, clients absents. Plan 3 : il touche « clients absents » et voit l'offre automatique correspondante avec son interrupteur. Plan 4 : la NOUVELLE carte de la pizzeria (style rouge et crème, carte entière) en fin de vidéo. Mention discrète à l'écran : « données de démonstration ».",
      "legende": "Avec une carte en carton, vous ne savez pas qui revient. Avec Keeply, vous le voyez.\n\nLe tableau de bord vous montre vos passages, vos clients les plus fidèles et ceux qui ne sont pas revenus depuis un moment. De là, vous décidez : leur envoyer une offre, activer une relance automatique, ou ne rien faire. C'est vous qui gardez la main.\n\nVous regardez vos chiffres chaque soir ou seulement en fin de mois ?",
      "hashtags": [
        "#gestionrestaurant",
        "#tableaudebord",
        "#pizzeriamaroc",
        "#rabat",
        "#restaurationmaroc",
        "#fidelisationclient",
        "#commercantmaroc",
        "#cartedefidelite",
        "#keeply"
      ],
      "pourquoi": "Montre la valeur cachée de Keeply : la connaissance de ses clients, que le carton ne donne jamais. Les données affichées sont explicitement des données de démo pour ne rien inventer. Il doit provoquer des commentaires et des clics. Indicateurs : rétention, commentaires, clics.",
      "cta": "Dites-nous quand vous regardez vos chiffres",
      "asset_existant": null,
      "boost": true
    },
    {
      "id": "p17",
      "semaine": 5,
      "jour": "jeudi",
      "heure": "21:00",
      "format": "Carrousel",
      "pilier": "Offre et conversion",
      "titre": "Vos questions, nos réponses",
      "accroche": "Les questions que vous me posez le plus.",
      "visuel": "Carrousel 7 slides, une question par slide, design épuré sur fond sombre avec une carte en filigrane. Slide 1 : titre. Slides 2 à 6 : les vraies questions reçues en DM et en commentaires pendant les semaines 0 à 4 (à reprendre telles qu'elles sont arrivées, sans en inventer), par exemple sur Android, l'installation côté client, le prix, la résiliation, le nombre de clients. Slide 7 : la NOUVELLE carte d'un restaurant gastronomique à Tanger (style sobre, carte entière) + « Une autre question ? DM ».",
      "legende": "Depuis le lancement du compte, vous m'avez posé beaucoup de questions. Voici les plus fréquentes, avec des réponses courtes.\n\n[Reprendre ici les 5 vraies questions reçues et leurs réponses.]\n\nRappel utile : essai gratuit de 14 jours, puis 399 DH par mois au Maroc. Chaque option, des paliers aux offres automatiques, s'active ou se coupe à tout moment.\n\nVotre question n'est pas dans la liste ? Posez-la en commentaire, je réponds à tout le monde.",
      "hashtags": [
        "#faq",
        "#cartedefidelite",
        "#restaurantgastronomique",
        "#tanger",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#applewallet",
        "#googlewallet",
        "#fidelisationclient",
        "#keeply"
      ],
      "pourquoi": "Lève les dernières objections avant l'achat en utilisant uniquement les vraies questions de la communauté, ce qui prouve qu'on écoute sans inventer de témoignage. Il doit provoquer de nouvelles questions et des clics vers l'essai. Indicateurs : commentaires, sauvegardes, clics sur le lien.",
      "cta": "Posez votre question en commentaire",
      "asset_existant": null,
      "boost": true
    },
    {
      "id": "p18",
      "semaine": 5,
      "jour": "samedi",
      "heure": "15:30",
      "format": "Reel",
      "pilier": "Fondateur et coulisses",
      "titre": "Six semaines plus tard",
      "accroche": "Six semaines de Keeply. Ce que j'ai appris.",
      "visuel": "Reel face caméra 30 à 45 s, même décor que p03 pour créer un effet avant et après. Plan 1 : visage du fondateur, accroche. Plan 2 : trois apprentissages réels des six dernières semaines, en texte incrusté. Plan 3 : il montre sur son iPhone les NOUVELLES cartes de chaque style (fast-food, café, restaurant de quartier, haut de gamme), chacune entière. Plan 4 : appel direct aux commerçants qui hésitent encore. Plan 5 : écran final « Essai gratuit 14 jours, lien en bio ».",
      "legende": "Il y a six semaines, ce compte avait zéro abonné. Je me suis présenté, je vous ai montré l'app, et vous m'avez répondu.\n\nTrois choses que j'ai apprises :\n1. [apprentissage réel n°1]\n2. [apprentissage réel n°2]\n3. [apprentissage réel n°3]\n\nSi vous tenez un fast-food, un café ou un restaurant au Maroc et que vous hésitez encore, l'essai de 14 jours est gratuit, et je vous aide moi-même à poser votre première affiche.\n\nMerci à tous ceux qui suivent l'aventure depuis le début.",
      "hashtags": [
        "#entrepreneurmaroc",
        "#startupmaroc",
        "#madeinmorocco",
        "#buildinpublic",
        "#restaurationmaroc",
        "#commercantmaroc",
        "#cartedefidelite",
        "#fidelisationclient",
        "#keeply"
      ],
      "pourquoi": "Clôt la séquence par le visage du fondateur, avec des apprentissages réels au lieu de faux résultats. Il doit convertir les abonnés qui suivent depuis le début mais n'ont pas encore essayé. Indicateurs : clics sur le lien, essais démarrés avec utm_content=p18, DM. Les crochets sont à remplir uniquement avec du vécu réel ; si le fondateur veut citer un chiffre, ce doit être un chiffre réel du compte.",
      "cta": "Essai gratuit 14 jours, lien en bio",
      "asset_existant": null,
      "boost": true
    }
  ],
  "stories_quotidiennes": [
    "Sondage du jour à deux choix pour les restaurateurs (ex. « Vos clients paient plutôt en espèces ou par carte ? », « Carte à tampons ou à points ? ») : nourrit l'algorithme et donne de vraies informations sur la cible.",
    "Partage en Story de chaque nouveau post avec un sticker « Nouveau post » ou une question, dans l'heure qui suit la publication.",
    "« Une carte par jour » : une NOUVELLE carte d'un type de commerce différent chaque jour (snack, café, pizzeria, restaurant de quartier, table gastronomique), carte entière, avec le sticker lien vers keeplyfidelity.app.",
    "Coulisses du fondateur en 1 à 3 Stories : ce qu'il construit aujourd'hui, un bug corrigé, une affiche imprimée, sans mise en scène.",
    "Boîte à questions « Posez-moi vos questions sur la fidélité » une fois par semaine, réponses en vidéo face caméra les jours suivants (alimente le highlight « Questions » et le carrousel p17).",
    "Rappel d'option, une fois par semaine : « Le saviez-vous ? Les offres automatiques s'activent ou se coupent d'un geste » avec capture de l'interrupteur dans l'app.",
    "Quiz rapide sur la fidélisation (ex. « Combien de vos clients reviennent dans le mois ? Vous le savez ? ») qui renvoie vers le carrousel du moment.",
    "Le vendredi : rappel de l'essai gratuit 14 jours avec sticker lien et compte à rebours si un live ou une nouveauté arrive.",
    "Republier en Story (avec accord) toute mention réelle d'un commerçant qui utilise Keeply ; tant qu'il n'y en a pas, ne rien simuler."
  ],
  "regles_engagement": [
    "Routine quotidienne de 20 minutes, idéalement entre 15:00 et 16:00 (creux de service des restaurateurs).",
    "Minutes 0 à 5 : répondre à tous les commentaires et DM reçus, en vouvoyant, avec une vraie phrase (pas un simple merci), et terminer par une question pour relancer la conversation.",
    "Minutes 5 à 12 : commenter 10 posts récents de restaurants, cafés et fast-foods des villes de lancement (rechercher les lieux Casablanca, Marrakech, Rabat, Agadir, Tanger et les hashtags #casablancafood, #marrakechfood, #rabatfood). Commentaire sincère sur le plat ou la déco, jamais de lien, jamais de pitch.",
    "Minutes 12 à 17 : envoyer 3 DM personnalisés à des commerçants avec qui un échange a déjà eu lieu (ils ont aimé, commenté ou répondu à une Story). Message type : « Bonjour, je suis le fondateur de Keeply, une carte de fidélité dans le Wallet pour les restaurants. J'ai vu votre [plat ou détail réel], c'est superbe. Est-ce que vous utilisez déjà une carte de fidélité ? » Jamais de DM à froid en masse.",
    "Minutes 17 à 20 : interagir avec 5 comptes de l'écosystème (food bloggers marocains, comptes d'entrepreneurs, fournisseurs de la restauration) et noter dans un tableau les commerçants intéressés pour le suivi.",
    "Heure dorée : rester disponible 60 minutes après chaque publication et répondre à chaque commentaire dans les 15 minutes.",
    "Délai de réponse aux DM : moins de 2 heures pendant la journée ; si un commerçant demande une démo, proposer un appel vidéo ou un passage en personne dans les villes accessibles.",
    "Ne jamais acheter d'abonnés, de likes ni utiliser de groupes d'engagement : le compte doit rester crédible auprès des restaurateurs et de l'algorithme.",
    "Toujours vouvoyer, ne jamais inventer d'avis ou de client, et rappeler dès que c'est pertinent que chaque option s'active ou se coupe.",
    "Une fois par semaine : relire les statistiques des 3 posts, noter le meilleur format et ajuster le thème des posts suivants."
  ],
  "kpi": [
    {
      "nom": "Abonnés",
      "cible_6_semaines": "400 à 700 abonnés, dont une majorité de comptes de commerces ou de professionnels basés au Maroc",
      "comment_lire": "Regarder la qualité plus que le volume : ouvrir la liste des nouveaux abonnés chaque semaine et vérifier qu'il s'agit bien de restaurateurs ou d'entrepreneurs locaux. Une hausse liée aux boosts sans hausse de DM signale un mauvais ciblage."
    },
    {
      "nom": "Portée des Reels auprès des non-abonnés",
      "cible_6_semaines": "Au moins 60 % des vues des Reels venant de non-abonnés, et au moins un Reel organique au-delà de 5 000 vues",
      "comment_lire": "C'est le signe que l'algorithme distribue le compte. Si la part de non-abonnés baisse, retravailler la première seconde (accroche) et la durée."
    },
    {
      "nom": "Taux de rétention à 3 secondes des Reels",
      "cible_6_semaines": "Au moins 50 %",
      "comment_lire": "Mesure la force de l'accroche. Sous 40 %, changer le premier plan et le texte à l'écran avant de modifier le reste."
    },
    {
      "nom": "Taux de sauvegarde des carrousels",
      "cible_6_semaines": "Au moins 3 % des comptes touchés",
      "comment_lire": "Sauvegardes divisées par la portée. Un carrousel sauvegardé est un carrousel jugé utile : reproduire ses sujets (erreurs, calcul, avis Google)."
    },
    {
      "nom": "Taux d'engagement par post",
      "cible_6_semaines": "3,5 % ou plus",
      "comment_lire": "(J'aime + commentaires + partages + sauvegardes) divisé par la portée. Sur un petit compte, il doit rester élevé ; s'il baisse, revenir aux questions directes en fin de légende."
    },
    {
      "nom": "DM qualifiés de commerçants",
      "cible_6_semaines": "30 conversations avec des restaurateurs, cafés ou fast-foods",
      "comment_lire": "Compter seulement les conversations avec un vrai commerce. C'est l'indicateur le plus proche de la vente pour un fondateur solo."
    },
    {
      "nom": "Clics sur le lien en bio et le sticker lien",
      "cible_6_semaines": "300 clics",
      "comment_lire": "Lire dans les statistiques du site via utm_source=instagram ; comparer les utm_content pour savoir quels posts envoient vraiment du trafic."
    },
    {
      "nom": "Essais gratuits démarrés depuis Instagram",
      "cible_6_semaines": "10 à 20 essais de 14 jours",
      "comment_lire": "L'indicateur roi. Croiser les UTM, les DM et une question simple à l'inscription (« Comment avez-vous connu Keeply ? »). Puis suivre combien passent à l'abonnement à 399 DH/mois à la fin de l'essai."
    },
    {
      "nom": "Taux de complétion des Stories",
      "cible_6_semaines": "Au moins 70 % sur les séquences de 3 à 5 Stories",
      "comment_lire": "Si les abonnés quittent avant la fin, raccourcir les séquences et mettre le sondage ou la question plus tôt."
    },
    {
      "nom": "Coût par clic des boosts",
      "cible_6_semaines": "Suivi chaque semaine, à comparer entre les posts boostés",
      "comment_lire": "Garder le budget sur les deux posts au coût par clic le plus bas et couper les autres ; un boost qui rapporte des vues sans clics ni DM n'est pas rentable."
    }
  ]
};

export const META_ADS_PLAN = {
  "resume": "Lancement Meta Ads (Instagram + Facebook) au Maroc, en français, sur 6 semaines, pour environ 130 € (palier minimal à 3 €/jour) à 250 € (palier « si ça marche »). Phase 1 : trafic vers une page d'atterrissage équipée du pixel pour tester les messages à bas coût. Phase 2 : conversations WhatsApp (démo de 10 minutes), qui convertissent mieux qu'un envoi direct vers l'App Store pour un public B2B marocain. Phase 3 : on garde la meilleure pub et on relance les visiteurs. Les coûts indiqués viennent de sources publiques peu fiables (CPC Facebook Maroc annoncé entre 0,5 et 5 DH) et ne sont que des estimations : le vrai test, ce sont les 7 premiers jours dans le Gestionnaire de publicités.",
  "prerequis": [
    "1. Créer une Page Facebook « Keeply » (logo, couverture, description, lien keeplyfidelity.app, bouton WhatsApp). Meta exige une Page pour diffuser, même si vous ne visez qu'Instagram.",
    "2. Passer le compte Instagram en compte professionnel (catégorie Logiciel ou Application), puis le relier à la Page Facebook depuis l'Espace Comptes. Publier 6 à 9 posts avant la première pub (démo du scan, carte dans le Wallet, présentation du fondateur) : un commerçant qui clique sur une pub regarde d'abord le profil.",
    "3. Créer un portefeuille Meta Business (business.facebook.com) au nom du fondateur, puis y rattacher la Page et le compte Instagram. La vérification de l'entreprise n'est pas obligatoire pour faire de la pub à ce stade.",
    "4. Créer UN compte publicitaire en devise MAD (dirham) et fuseau Africa/Casablanca. Attention : on ne peut quasiment plus changer la devise ensuite. Le MAD évite les frais de change sur une carte marocaine.",
    "5. Ajouter un moyen de paiement : carte bancaire marocaine avec les paiements en ligne internationaux activés auprès de la banque (plafond e-commerce suffisant, au moins 1 000 DH/mois). Faire un premier test avec un petit prélèvement. Fixer une limite de dépenses du compte (par ex. 2 800 DH) comme garde-fou.",
    "6. Relier un numéro WhatsApp Business à la Page (Paramètres de la Page > WhatsApp), indispensable pour la phase 2 « Messages ». Préparer un message d'accueil automatique et 3 réponses rapides (prix, comment ça marche, prise de rendez-vous démo).",
    "7. Créer une page d'atterrissage dédiée sur le site, par ex. keeplyfidelity.app/maroc : promesse en une phrase, vidéo du scan de 15 s, 3 étapes, prix 399 DH/mois après 14 jours d'essai gratuit, bouton principal « Télécharger sur l'App Store », bouton secondaire « Démo WhatsApp », mention que chaque fonction (offres automatiques, paliers, avis Google) s'active ou se désactive. Pas de témoignages tant qu'il n'y en a pas de vrais. Chargement rapide sur mobile.",
    "8. Installer le pixel Meta sur keeplyfidelity.app (Gestionnaire d'événements > Connecter des données > Web). Si le site est sur Vercel ou Next.js : script du pixel dans le layout + PageView automatique.",
    "9. Configurer l'API Conversions (CAPI) : le plus simple est la passerelle CAPI, ou une route serveur (/api/meta-event) qui renvoie les mêmes événements avec un event_id identique pour la déduplication. Bandeau cookies avec consentement (loi marocaine 09-08) avant le déclenchement du pixel.",
    "10. Créer les événements personnalisés : « ClicAppStore » (clic sur le bouton App Store, déclenché côté navigateur ET serveur, avec event_id) et « ClicWhatsApp » (clic sur le bouton WhatsApp). Dans le Gestionnaire d'événements, les marquer comme conversions personnalisées. Vérifier avec l'outil Tester les événements et l'extension Meta Pixel Helper.",
    "11. Créer des liens de campagne App Store Connect pour mesurer les installations par source, sans SDK : https://apps.apple.com/ma/app/keeply-loyalty-card/id6816728580?pt=VOTRE_PROVIDER_TOKEN&ct=meta_p1_trafic (un ct différent par phase ou par pub). Le provider token se trouve dans App Store Connect > Analytics > Sources > Liens de campagne. Ces liens se placent sur la page d'atterrissage, pas dans la pub.",
    "12. Mettre des UTM sur toutes les pubs, dans le champ Paramètres d'URL : utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_content={{ad.name}}&utm_term={{placement}}. Côté site, faire suivre utm_content dans le paramètre ct du lien App Store pour savoir quelle pub a amené l'installation.",
    "13. Préparer un tableur de suivi quotidien : dépense, impressions, CPM, CTR lien, CPC, vues de page, ClicAppStore, ClicWhatsApp, conversations, démos réalisées, installations (App Store Connect), essais démarrés, abonnés payants. C'est votre vraie source de vérité, pas le seul chiffre de Meta.",
    "14. Lire les règles publicitaires Meta (pas d'avant/après trompeur, pas de chiffres non prouvés, pas de mentions d'Apple suggérant un partenariat). Ne pas utiliser le logo Apple Wallet de façon détournée : respecter le badge officiel « Add to Apple Wallet » et le badge « Télécharger dans l'App Store » selon les règles d'Apple."
  ],
  "phases": [
    {
      "nom": "Phase 1 : Test des messages (trafic qualifié vers la page d'atterrissage)",
      "semaines": "S1 et S2 (14 jours)",
      "budget_jour": "Palier minimal 3 €/jour (environ 33 DH). Palier standard 5 €/jour (environ 55 DH).",
      "budget_total": "42 € (minimal) à 70 € (standard)",
      "objectif_meta": "Trafic, optimisation « Vues de page de destination » (pas « Clics sur le lien », qui ramène beaucoup de clics accidentels).",
      "pourquoi": "Le compte et le pixel sont neufs, sans aucune donnée de conversion. Avec quelques euros par jour, Meta ne peut pas apprendre sur un objectif Ventes ou Prospects (il faut environ 50 conversions par semaine pour sortir de l'apprentissage). L'objectif Trafic est le moins cher par visite, remplit le pixel (audiences de reciblage) et indique très vite quel message accroche les commerçants grâce au CTR et au taux de ClicAppStore sur la page.",
      "ciblage": "Lieux : Casablanca (+25 km), Rabat (+20 km, inclut Salé et Témara), Marrakech (+15 km), Agadir (+15 km, inclut Inezgane), Tanger (+15 km), Fès (+15 km), option « Personnes qui vivent dans ce lieu ». Âge 23 à 55 ans, tous genres. Pas de restriction de langue (beaucoup de gérants ont l'interface en arabe ou en anglais), les pubs restent en français. Ciblage détaillé (à saisir et vérifier dans le Gestionnaire, certains centres d'intérêt ont été regroupés par Meta début 2026) : comportement « Propriétaires de petites entreprises » (Small business owners) OU centres d'intérêt « Restaurant management », « Restaurant », « Fast food restaurant », « Café », « Foodservice », « Food truck », « Coffeehouse », « Entrepreneuriat », « Marketing » ; intitulés de poste si disponibles : « Gérant de restaurant », « Propriétaire », « Restaurateur ». Une seule campagne, un seul ensemble de publicités, budget au niveau de l'ensemble. Advantage+ Audience DÉSACTIVÉ en phase 1 (sinon, à ce budget, l'algorithme part vers un grand public bon marché qui clique mais n'a pas de commerce). Taille d'audience visée : 150 000 à 600 000 personnes.",
      "creas": [
        "Pub 1 « Scan au comptoir » : Reel vertical 9:16, 12 à 15 s, tourné au téléphone dans un vrai fast-food ou café (avec accord) : le client scanne le QR, la carte arrive dans le Wallet, le tampon s'ajoute. Message : vos clients reviennent, sans carte en carton ni app à installer.",
        "Pub 2 « 3 étapes » : carrousel 1:1 ou 4:5 de 4 cartes (créez votre carte à vos couleurs / vos clients scannent le QR / la carte vit dans leur Wallet / notifications écran verrouillé gratuites). Message : simplicité et rapidité de mise en place.",
        "Pub 3 « Fini le carton » : image fixe 4:5, à gauche une carte en carton froissée, à droite l'iPhone avec la carte Keeply dans le Wallet. Message : la carte ne se perd plus, et vous pouvez écrire à vos clients."
      ],
      "placements": "Placements manuels : Instagram Fil, Stories, Reels, Explorer ; Facebook Fil, Stories, Reels. EXCLURE l'Audience Network et Messenger (clics de mauvaise qualité sur un objectif Trafic). Fournir chaque pub en 9:16 ET 4:5 pour que Meta ne recadre pas.",
      "kpi_cible": {
        "cpm": "20 à 60 DH (environ 2 à 5,5 €) ; au-delà de 80 DH, audience trop étroite ou pub mal notée",
        "ctr": "CTR lien de 0,8 % à 1,5 % ; en dessous de 0,5 %, le message n'accroche pas",
        "cpc": "CPC lien de 1,5 à 5 DH (0,15 à 0,45 €) ; coût par vue de page de destination de 2 à 7 DH",
        "cout_par_resultat": "Coût par ClicAppStore visé : 15 à 50 DH (1,5 à 4,5 €), soit 10 % à 20 % des visiteurs qui cliquent sur le bouton App Store"
      },
      "regle_stop_ou_scale": "Ne rien toucher pendant les 3 premiers jours (phase d'apprentissage). Couper une pub si, après 2 000 impressions OU 40 DH dépensés sur elle : CTR lien < 0,5 % ou coût par vue de page > 8 DH. Si après 7 jours le coût par ClicAppStore dépasse 80 DH, retravailler la page d'atterrissage avant la pub (problème de conversion, pas de clic). Passer de 3 à 5 €/jour si, à J7, le coût par vue de page est < 5 DH et qu'il y a au moins 5 ClicAppStore. Fin de phase : garder les 2 meilleures pubs pour la phase 2."
    },
    {
      "nom": "Phase 2 : Conversations WhatsApp (démo de 10 minutes)",
      "semaines": "S3 et S4 (14 jours)",
      "budget_jour": "Palier minimal 3 €/jour (environ 33 DH). Palier standard 5 €/jour. Palier « si ça marche » 7 €/jour.",
      "budget_total": "42 € (minimal) à 70 € (standard), jusqu'à 98 € si les conversations sont qualifiées",
      "objectif_meta": "Engagement, lieu de conversion « Applications de messagerie » > WhatsApp, optimisation « Conversations ».",
      "pourquoi": "Au Maroc, WhatsApp est le canal naturel entre commerçants et fournisseurs. Un gérant de fast-food décide rarement de s'abonner à un logiciel à 399 DH/mois en voyant une seule pub, mais il pose volontiers une question sur WhatsApp. La démo de 10 minutes (par message vocal, vidéo ou appel) lève les objections (est-ce compliqué, est-ce que ça marche sur Android pour mes clients, combien ça coûte) et vous permet d'installer l'app avec lui. Le coût par conversation est souvent plus bas qu'un coût par prospect via formulaire, et chaque conversation est un contact réel. Le pixel de la phase 1 sert ensuite au reciblage.",
      "ciblage": "Mêmes villes et mêmes âges que la phase 1. Deux options selon les résultats de la phase 1 : (a) garder le ciblage détaillé gagnant, Advantage+ Audience désactivé, si les conversations sont qualifiées ; (b) tester Advantage+ Audience en donnant le ciblage détaillé comme suggestion, uniquement si l'option (a) donne plus de 60 DH par conversation. Exclure les personnes qui vous ont déjà écrit sur WhatsApp (audience personnalisée « Personnes qui vous ont envoyé un message »).",
      "creas": [
        "Pub 4 « Le fondateur » : Reel 9:16 de 20 à 30 s, face caméra, le fondateur présente Keeply en 3 phrases depuis Agadir et propose une démo de 10 minutes sur WhatsApp. Pas de chiffres de résultats, uniquement ce que fait l'app. L'authenticité d'un fondateur local inspire confiance aux petits commerçants.",
        "Pub 5 « Démo WhatsApp » : reprise du meilleur visuel de la phase 1 (souvent le Reel du scan) avec un texte et un bouton orientés conversation.",
        "Message d'accueil WhatsApp prérempli : « Bonjour, je voudrais voir comment Keeply marche pour mon commerce. » + question automatique : « Quel type de commerce avez-vous (fast-food, café, restaurant) et dans quelle ville ? »"
      ],
      "placements": "Advantage+ placements acceptable ici (l'objectif Messages limite déjà la diffusion aux placements compatibles), en excluant l'Audience Network. Priorité visuelle : Instagram Reels et Stories, Facebook Fil.",
      "kpi_cible": {
        "cpm": "20 à 60 DH",
        "ctr": "CTR (tous) de 1 % à 2,5 %",
        "cpc": "3 à 8 DH",
        "cout_par_resultat": "Coût par conversation démarrée : 10 à 40 DH (1 à 3,7 €). Objectif interne : au moins 1 conversation sur 3 avec un vrai commerçant, et au moins 1 démo sur 4 qui aboutit à un essai démarré."
      },
      "regle_stop_ou_scale": "Couper si, après 100 DH dépensés, le coût par conversation dépasse 60 DH, ou si moins d'1 conversation sur 4 vient d'un vrai commerçant (dans ce cas, resserrer le ciblage et rendre le texte plus explicitement B2B : « Vous gérez un fast-food ? »). Augmenter de 20 % tous les 3 jours (jamais plus d'un coup, pour ne pas relancer l'apprentissage) si le coût par conversation est < 30 DH ET qu'au moins 2 essais ont démarré via WhatsApp sur la période. Plafond : 7 €/jour en phase 2, au-delà vous n'aurez pas le temps de répondre à tout le monde dans l'heure."
    },
    {
      "nom": "Phase 3 : Consolidation, reciblage et palier « si ça marche »",
      "semaines": "S5 et S6 (14 jours)",
      "budget_jour": "Palier minimal 3 €/jour au total (2 € prospection gagnante + 1 € reciblage). Palier standard 6 €/jour (4,5 € + 1,5 €). Palier « si ça marche » 8 €/jour (6 € + 2 €).",
      "budget_total": "42 € (minimal) à 84 € (standard), jusqu'à 112 € si le coût par essai reste sous le seuil",
      "objectif_meta": "Prospection : on garde l'objectif qui a donné le meilleur coût par essai démarré (Engagement > Messages WhatsApp le plus souvent). Reciblage : Trafic vers la page d'atterrissage, ou Ventes optimisé sur l'événement ClicAppStore seulement si le pixel a déjà enregistré au moins 30 à 50 ClicAppStore.",
      "pourquoi": "On concentre l'argent sur ce qui a marché et on relance les commerçants déjà intéressés, qui coûtent moins cher à convertir. Les audiences de reciblage seront petites (quelques centaines de personnes) : un budget de 1 à 2 €/jour suffit, au-delà la répétition devient lassante.",
      "ciblage": "Prospection : ciblage gagnant des phases 1 et 2, en excluant les visiteurs du site sur 30 jours et les personnes ayant écrit sur WhatsApp. Reciblage : voir la section retargeting (visiteurs 30 jours sans ClicAppStore, personnes ayant vu 50 % des Reels, interactions avec le compte Instagram sur 60 jours). Option : audience similaire (Lookalike) 1 % Maroc à partir de la liste des commerçants inscrits, uniquement si vous avez au moins 100 contacts, sinon inutile.",
      "creas": [
        "La meilleure pub de prospection des phases 1 et 2, plus une variante (nouvelle accroche ou nouvelle scène tournée dans un café ou un restaurant haut de gamme pour varier les exemples).",
        "Pub 6 « Reciblage 14 jours » : image ou Reel court rappelant l'essai gratuit de 14 jours, le prix clair (399 DH/mois) et le fait que tout s'active ou se désactive à votre rythme.",
        "Si un commerçant réel utilise Keeply et accepte, un Reel tourné chez lui montrant son usage (pas de citation inventée, pas de chiffres non mesurés ; uniquement ce qu'il dit lui-même, avec son accord écrit)."
      ],
      "placements": "Prospection : comme en phase 2. Reciblage : Advantage+ placements sans l'Audience Network ; les Stories et Reels Instagram sont prioritaires.",
      "kpi_cible": {
        "cpm": "Prospection 20 à 60 DH ; reciblage 40 à 120 DH (audience petite, CPM plus élevé, c'est normal)",
        "ctr": "Reciblage : CTR lien de 1,5 % à 3 %",
        "cpc": "Reciblage : 2 à 8 DH",
        "cout_par_resultat": "Coût par essai démarré (calculé dans votre tableur, pas dans Meta) visé sous 250 DH (environ 23 €). Repère : un abonné payant à 399 DH/mois est rentabilisé dès le premier mois si le coût par abonné reste sous 399 DH."
      },
      "regle_stop_ou_scale": "Reciblage : fréquence 7 jours entre 3 et 5 ; au-dessus de 6, changer de visuel ou baisser le budget. Prospection : couper si le coût par essai démarré dépasse 400 DH sur 7 jours. Passer au palier « si ça marche » (8 €/jour) si le coût par essai est < 250 DH ET qu'au moins 1 essai est devenu abonné payant ou montre une vraie utilisation (carte créée, premiers scans). Au-delà de 250 € au total, ne continuer qu'avec des données d'abonnement réelles en main."
    }
  ],
  "tests_creatifs": [
    {
      "hypothese": "Montrer le geste réel (scan au comptoir) accroche mieux un gérant qu'une explication en étapes.",
      "variante_a": "Reel 9:16 « Scan au comptoir » tourné dans un vrai commerce",
      "variante_b": "Carrousel « 3 étapes » avec captures de l'app",
      "indicateur": "CTR lien et coût par vue de page de destination après 2 000 impressions chacune"
    },
    {
      "hypothese": "L'accroche « problème » (cartes en carton perdues, clients qui ne reviennent pas) fait mieux que l'accroche « nouveauté » (la carte dans le Wallet).",
      "variante_a": "« Vos cartes de fidélité en carton finissent à la poubelle ? »",
      "variante_b": "« Votre carte de fidélité, directement dans le Wallet de vos clients. »",
      "indicateur": "Taux d'arrêt (lecture 3 s / impressions) puis CTR lien"
    },
    {
      "hypothese": "Afficher le prix dès la pub filtre les curieux et améliore la qualité des conversations, même si le coût par clic monte.",
      "variante_a": "Texte avec « 14 jours gratuits, puis 399 DH/mois »",
      "variante_b": "Texte avec seulement « Essai gratuit de 14 jours »",
      "indicateur": "Coût par conversation WhatsApp ET part des conversations qui aboutissent à un essai démarré"
    },
    {
      "hypothese": "Le fondateur face caméra inspire plus confiance qu'une vidéo produit sans visage.",
      "variante_a": "Reel « Le fondateur » face caméra",
      "variante_b": "Reel « Scan au comptoir » sans visage, avec sous-titres",
      "indicateur": "Coût par conversation WhatsApp démarrée"
    },
    {
      "hypothese": "Un exemple de fast-food parle mieux à la cible principale qu'un exemple de café.",
      "variante_a": "Visuel avec une carte « 10 tampons = 15 % de remise » d'un fast-food",
      "variante_b": "Visuel avec une carte « palier Argent = -10 % sur l'addition » d'un café",
      "indicateur": "CTR lien et type de commerce déclaré dans les conversations WhatsApp"
    }
  ],
  "textes_pubs": [
    {
      "nom": "P1 - Scan au comptoir",
      "format": "Reel vertical 9:16, 12 à 15 s, sous-titré (et version 4:5 pour le fil)",
      "texte_principal": "Vos clients scannent un QR code au comptoir. Leur carte de fidélité arrive dans Apple Wallet ou Google Wallet. Aucune application à installer pour eux, aucune carte en carton à imprimer pour vous.\n\nAvec Keeply, vous créez votre carte à vos couleurs, en tampons ou en points, en quelques minutes depuis votre iPhone. Essai gratuit de 14 jours.",
      "titre": "Votre carte de fidélité dans le Wallet",
      "description": "14 jours d'essai gratuit",
      "cta_bouton": "En savoir plus",
      "visuel": "Plan serré sur un comptoir de fast-food : un client approche son téléphone du QR code, la carte apparaît dans le Wallet, un tampon s'ajoute. Texte à l'écran : « Scan. Tampon. Il revient. » Fin sur le logo Keeply et keeplyfidelity.app. Musique entraînante libre de droits, sous-titres en français."
    },
    {
      "nom": "P2 - 3 étapes",
      "format": "Carrousel 4 cartes, 4:5 (1080 x 1350)",
      "texte_principal": "Lancer votre programme de fidélité ne prend que quelques minutes :\n1. Vous créez votre carte à vos couleurs.\n2. Vos clients scannent le QR code au comptoir.\n3. La carte reste dans leur téléphone, et vous pouvez leur envoyer des notifications gratuites sur l'écran verrouillé.\n\nOffres automatiques, paliers Bronze, Argent, Or, demande d'avis Google : vous activez seulement ce qui vous sert.",
      "titre": "Fidélité en 3 étapes",
      "description": "Pour fast-foods, cafés et restaurants",
      "cta_bouton": "En savoir plus",
      "visuel": "Carte 1 : l'écran de création de la carte avec les couleurs d'un fast-food. Carte 2 : le QR code posé sur un comptoir de café. Carte 3 : la carte dans Apple Wallet. Carte 4 : une notification écran verrouillé « Votre coupon boisson offerte vous attend » + logo Keeply. Captures réelles de l'app, fond uni aux couleurs de la marque."
    },
    {
      "nom": "P3 - Fini le carton",
      "format": "Image fixe 4:5 (1080 x 1350) + version 9:16 pour les Stories",
      "texte_principal": "Les cartes en carton se perdent, s'oublient dans un portefeuille ou finissent à la poubelle. Une carte dans le Wallet reste dans la poche de vos clients, et vous pouvez leur rappeler de revenir.\n\nKeeply, la carte de fidélité numérique pour les fast-foods, cafés et restaurants. Essai gratuit de 14 jours, puis 399 DH par mois, sans engagement.",
      "titre": "Une carte qu'on ne perd plus",
      "description": "Essai gratuit, sans engagement",
      "cta_bouton": "En savoir plus",
      "visuel": "Image coupée en deux : à gauche une carte de fidélité en carton froissée avec 3 tampons effacés, à droite un iPhone affichant une carte Keeply nette aux couleurs d'un restaurant. Texte superposé court : « Avant / Maintenant ». Pas de chiffres."
    },
    {
      "nom": "P4 - Le fondateur",
      "format": "Reel vertical 9:16, 20 à 30 s, face caméra, sous-titré",
      "texte_principal": "Bonjour, je suis le créateur de Keeply, une application pensée au Maroc pour les fast-foods, cafés et restaurants.\n\nL'idée est simple : vos clients ont votre carte de fidélité dans leur téléphone, sans rien installer, et vous les faites revenir avec des offres et des notifications gratuites.\n\nVous voulez voir comment ça marche pour votre commerce ? Écrivez-moi sur WhatsApp, je vous montre en 10 minutes.",
      "titre": "Une démo de 10 minutes sur WhatsApp",
      "description": "Réponse directe du fondateur",
      "cta_bouton": "Envoyer un message WhatsApp",
      "visuel": "Le fondateur filmé au téléphone, lumière naturelle, dans un café ou devant un comptoir à Agadir. Il montre l'iPhone avec la carte dans le Wallet à 0:10. Sous-titres gros et lisibles. Dernier plan : « Démo gratuite sur WhatsApp »."
    },
    {
      "nom": "P5 - Démo WhatsApp (fast-food)",
      "format": "Reel 9:16 réutilisant le meilleur visuel de la phase 1, ou image 4:5",
      "texte_principal": "Vous gérez un fast-food, un café ou un restaurant ?\n\nKeeply vous permet de créer une carte de fidélité à vos couleurs : par exemple, 10 tampons donnent 15 % de remise, et vous pouvez envoyer un coupon « dessert offert » quand vous le décidez. Vos clients la gardent dans Apple Wallet ou Google Wallet.\n\nPosez vos questions sur WhatsApp, on vous montre tout en 10 minutes, puis vous testez gratuitement pendant 14 jours.",
      "titre": "Une question ? Écrivez-nous",
      "description": "Démo gratuite, sans engagement",
      "cta_bouton": "Envoyer un message WhatsApp",
      "visuel": "Écran de téléphone avec une carte Keeply d'un fast-food (10 cases tampons, 7 remplies), en dessous une bulle WhatsApp « Bonjour, je voudrais voir comment Keeply marche pour mon commerce ». Couleurs vives, logo discret."
    },
    {
      "nom": "P6 - Reciblage essai 14 jours",
      "format": "Image 9:16 pour les Stories et Reels + version 1:1 pour le fil",
      "texte_principal": "Vous avez découvert Keeply ? Votre essai gratuit de 14 jours vous attend.\n\nCréez votre carte en quelques minutes, imprimez votre QR code, et vos premiers clients l'ont dans leur Wallet le jour même. Offres automatiques, paliers et avis Google s'activent ou se désactivent quand vous voulez.\n\nEnsuite, 399 DH par mois, résiliable à tout moment depuis l'App Store.",
      "titre": "Essai gratuit de 14 jours",
      "description": "Disponible sur iPhone",
      "cta_bouton": "Télécharger",
      "visuel": "Fond aux couleurs Keeply, iPhone au centre avec l'écran d'accueil de l'app, gros texte « 14 jours gratuits », badge officiel « Télécharger dans l'App Store » en bas. Le lien mène à la page d'atterrissage (qui contient le lien App Store avec le jeton de campagne), pas directement à l'App Store."
    }
  ],
  "alternative_prospects": "Recommandation : PAS d'envoi direct vers l'App Store depuis la pub, et PAS de formulaire Lead Ads en premier choix. Ordre conseillé : (1) phase 1 vers la page d'atterrissage avec pixel, (2) phase 2 en conversations WhatsApp, (3) Lead Ads seulement en solution de secours. Justification. Envoi direct App Store : sans SDK Meta dans l'app ni outil d'attribution, Meta ne voit rien après le clic ; il optimise à l'aveugle sur les clics, vous ne pouvez pas créer d'audience de reciblage, et un gérant qui découvre une app à 399 DH/mois sans explication installe rarement. La page d'atterrissage, elle, remplit le pixel et mesure le ClicAppStore. Formulaire Lead Ads (« Réserver un essai accompagné ») : coût par prospect souvent bas mais qualité souvent faible (formulaires préremplis envoyés sans vraie intention), et il faut rappeler chaque contact, ce qui prend beaucoup de temps à un fondateur seul. Si vous l'utilisez, choisissez le type « Plus d'intention » (écran de vérification), ajoutez 2 questions qualifiantes (type de commerce, ville) et une question « Avez-vous un iPhone ? », puis rappelez dans l'heure. WhatsApp (Click-to-WhatsApp) : c'est le canal par défaut des commerçants marocains, la conversation démarre tout de suite, vous qualifiez en 2 messages et vous accompagnez l'installation en direct, ce qui augmente fortement les chances qu'un essai devienne un vrai usage. Limite : votre temps de réponse. Répondez en moins d'une heure entre 9 h et 22 h, sinon le coût par essai explose. Si vous ne pouvez pas tenir ce rythme une semaine donnée, basculez cette semaine-là sur Trafic vers la page d'atterrissage.",
  "retargeting": "Audiences à créer dès J1 (elles se remplissent pendant la phase 1) : (A) visiteurs de keeplyfidelity.app/maroc sur 30 jours SANS événement ClicAppStore ; (B) personnes ayant vu au moins 50 % d'un Reel Keeply sur 30 jours ; (C) personnes ayant interagi avec le compte Instagram ou la Page sur 60 jours ; (D) personnes ayant cliqué sur le bouton WhatsApp ou ouvert une conversation sans démarrer d'essai (à gérer d'abord par une relance WhatsApp personnelle, gratuite, avant de payer). Exclusions : personnes ayant déclenché ClicAppStore depuis moins de 7 jours, et liste des commerçants déjà inscrits (import client en CSV) dès que vous en avez. Diffusion : un seul ensemble de publicités regroupant A + B + C, 1 à 2 €/jour à partir de la semaine 3 ou 4 (pas avant : l'audience doit dépasser environ 300 à 500 personnes, sinon Meta ne diffuse presque pas). Messages : rappel de l'essai gratuit de 14 jours, prix clair, réponse aux objections (pas d'app à installer pour les clients, Android bientôt pour le commerçant, Google Wallet déjà pris en charge côté clients, chaque fonction activable ou désactivable). Faire tourner 2 visuels, fréquence 7 jours entre 3 et 5, changer de visuel si la fréquence dépasse 6 ou si le CTR baisse de moitié. Le reciblage par e-mail ou WhatsApp des personnes déjà en contact reste plus efficace et gratuit : prioritaire sur la pub.",
  "erreurs_a_eviter": [
    "Lancer la pub avant que le pixel, l'API Conversions et l'événement ClicAppStore ne soient vérifiés : chaque dirham dépensé sans mesure est perdu pour l'apprentissage et le reciblage.",
    "Utiliser le bouton « Booster la publication » d'Instagram : peu de contrôle sur le ciblage, pas d'optimisation sur la page d'atterrissage, et les placements ne sont pas maîtrisés.",
    "Choisir l'objectif Ventes ou Promotion d'application dès le départ : sans SDK et avec moins de 50 conversions par semaine, la campagne reste bloquée en apprentissage et coûte cher.",
    "Multiplier les ensembles de publicités : avec 3 à 5 €/jour, un seul ensemble et 2 à 3 pubs maximum, sinon aucune pub ne reçoit assez d'impressions pour être jugée.",
    "Activer Advantage+ Audience sans garde-fou en phase 1 : pour une cible B2B de niche, l'algorithme part vers un grand public qui clique pour rien.",
    "Laisser l'Audience Network actif sur un objectif Trafic : beaucoup de clics accidentels dans des applications de jeux.",
    "Modifier la campagne tous les jours : chaque gros changement (budget de plus de 20 %, ciblage, nouvelle pub) relance l'apprentissage. Attendre 3 jours minimum.",
    "Juger sur le CPC seul : un clic à 1 DH venant d'un étudiant vaut moins qu'une conversation à 30 DH avec un gérant de fast-food. Le vrai indicateur est le coût par essai démarré.",
    "Inventer des chiffres (« +30 % de clients »), des avis ou des témoignages de commerçants : interdit par vos règles, risqué au regard des règles publicitaires Meta et destructeur de confiance.",
    "Promettre un « produit gratuit » direct : le produit offert passe toujours par un coupon (« un coupon café offert au 10e tampon ») ; les récompenses de palier sont des remises en % ou en €/DH.",
    "Cibler la France ou la Belgique : l'app n'y est pas encore disponible (vérification DSA en cours), chaque clic serait perdu.",
    "Oublier que l'app est uniquement sur iPhone pour le commerçant : le dire clairement (« Disponible sur iPhone, Android bientôt ») évite des conversations et des clics perdus.",
    "Ne pas répondre vite sur WhatsApp : au-delà de quelques heures, la plupart des prospects ne répondent plus.",
    "Créer le compte publicitaire en EUR avec une carte marocaine : frais de change et risque de refus de paiement. Choisir le MAD dès le départ.",
    "Utiliser les logos Apple ou Google de façon non conforme (faux badges, logo Apple seul) : risque de refus de la pub et de problème avec Apple."
  ],
  "estimation": {
    "hypotheses": "ATTENTION : ce sont des estimations prudentes, pas des résultats promis. Aucune donnée réelle du compte n'existe encore. Bases : budget standard d'environ 210 € (environ 2 300 DH, à 1 € = environ 10,8 DH) réparti en 70 € phase 1, 70 € phase 2, 70 € phase 3 ; CPM de 20 à 60 DH et CPC lien de 1,5 à 5 DH au Maroc selon des sources publiques non officielles, plus cher pour une cible B2B étroite ; 10 % à 20 % des visiteurs de la page cliquent sur le bouton App Store ; 20 % à 40 % de ces clics aboutissent à une installation (l'utilisateur doit avoir un iPhone et aller au bout) ; 30 % à 50 % des installations démarrent l'essai de 14 jours ; en phase 2, 10 à 40 DH par conversation WhatsApp, 1 conversation sur 3 avec un vrai commerçant, 1 sur 4 de ces commerçants démarre un essai après la démo. Les installations sont mesurées dans App Store Connect via les liens de campagne, avec un délai et sans attribution parfaite.",
    "clics_estimes": "Environ 400 à 1 100 clics sur le lien au total sur 6 semaines (phases 1 et 3), plus 20 à 70 conversations WhatsApp démarrées en phase 2",
    "installations_estimees": "Environ 10 à 45 installations attribuables (page d'atterrissage + démos WhatsApp), dont une partie seulement viendra de vrais commerçants",
    "essais_estimes": "Environ 4 à 18 essais gratuits de 14 jours démarrés",
    "cout_par_essai_estime": "Environ 12 € à 50 € par essai démarré (130 à 540 DH). Au palier minimal (environ 126 €), compter plutôt 2 à 10 essais. Le nombre d'abonnés payants après l'essai est impossible à estimer sérieusement avant d'avoir les premiers résultats : il dépendra surtout de l'accompagnement pendant les 14 jours."
  }
};
