/** Séquences de stories du lancement (12 nov. au 26 déc. 2026). Rempli à partir du plan des stories. */
export interface StorySlide {
  texte: string;
  visuel: string;
  sticker: string | null;
}
export interface StorySeq {
  id: string;
  date: string;
  heure: string;
  type: string;
  titre: string;
  lien_post: string | null;
  objectif: string;
  slides: StorySlide[];
}

export const STORIES_PLAN: StorySeq[] = [
  {
    "id": "s001",
    "date": "2026-11-12",
    "heure": "19:00",
    "type": "teasing",
    "titre": "J-3 : quelque chose arrive",
    "lien_post": null,
    "objectif": "Créer l'attente avant l'ouverture du compte ; indicateur : abonnés au rappel du compte à rebours.",
    "slides": [
      {
        "texte": "Dimanche. 21 h.",
        "visuel": "Main du fondateur qui pose un iPhone écran noir sur un comptoir, lumière du soir",
        "sticker": null
      },
      {
        "texte": "Vos clients vont revenir.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée, floutée, sur fond uni de la DA",
        "sticker": null
      },
      {
        "texte": "Keeply arrive.",
        "visuel": "Fond uni, logo Keeply centré",
        "sticker": "compte à rebours « Keeply · dimanche 15 nov. 21:00 »"
      }
    ]
  },
  {
    "id": "s002",
    "date": "2026-11-13",
    "heure": "19:00",
    "type": "teasing",
    "titre": "J-2 : une question avant dimanche",
    "lien_post": null,
    "objectif": "Faire parler les premiers abonnés et tester le sujet carte oubliée ; indicateur : taux de réponse au sondage.",
    "slides": [
      {
        "texte": "Deux jours.",
        "visuel": "Vidéo du fondateur à Agadir, plan serré sur ses mains au clavier",
        "sticker": null
      },
      {
        "texte": "Une question, d'abord.",
        "visuel": "Vidéo du fondateur face caméra, une phrase",
        "sticker": null
      },
      {
        "texte": "Vos clients ont-ils votre carte sur eux ?",
        "visuel": "Fond uni, petit portefeuille posé sur un comptoir",
        "sticker": "sondage « Toujours » / « Ils l'oublient »"
      },
      {
        "texte": "Dimanche, ils l'auront toujours.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée, à moitié dévoilée",
        "sticker": "compte à rebours « Keeply · dimanche 15 nov. 21:00 »"
      }
    ]
  },
  {
    "id": "s003",
    "date": "2026-11-14",
    "heure": "19:00",
    "type": "annonce post",
    "titre": "J-1 : épisode 1 demain",
    "lien_post": "p01",
    "objectif": "Annoncer le lancement et l'épisode 1 la veille ; indicateur : abonnés au compte à rebours et réponses en DM.",
    "slides": [
      {
        "texte": "Demain, 21 h.",
        "visuel": "Vidéo du fondateur face caméra, voix posée",
        "sticker": null
      },
      {
        "texte": "Ils reviennent. Épisode 1.",
        "visuel": "Extrait flouté de l'épisode 1 : le client pousse la porte du snack",
        "sticker": null
      },
      {
        "texte": "Il ne vous connaît pas. Encore.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée, tampons vides",
        "sticker": "compte à rebours « Ils reviennent · épisode 1 · 15 nov. 21:00 »"
      }
    ]
  },
  {
    "id": "s004",
    "date": "2026-11-15",
    "heure": "21:10",
    "type": "lancement",
    "titre": "Keeply est disponible",
    "lien_post": "p01",
    "objectif": "Transformer le jour J en premiers essais ; indicateur roi : clics sur le sticker lien keeplyfidelity.app/app.",
    "slides": [
      {
        "texte": "C'est en ligne.",
        "visuel": "Vidéo du fondateur face caméra, iPhone en main, l'App Store ouvert sur Keeply",
        "sticker": null
      },
      {
        "texte": "Keeply est disponible. Sur l'App Store.",
        "visuel": "Capture de la fiche App Store de Keeply",
        "sticker": null
      },
      {
        "texte": "France. Belgique. Suisse. Luxembourg. Monaco. Maroc. Canada.",
        "visuel": "Fond uni, les sept noms empilés en typographie de la DA",
        "sticker": null
      },
      {
        "texte": "Épisode 1. Il ne vous connaît pas. Encore.",
        "visuel": "Repartage du Reel p01",
        "sticker": "question « Votre premier client fidèle, il venait pour quoi ? »"
      },
      {
        "texte": "14 jours gratuits. Sur Android : bientôt sur Google Play.",
        "visuel": "Main qui tient un iPhone avec la nouvelle carte du fondateur, entière et bien cadrée dans le Wallet",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s004&utm_term=story"
      }
    ]
  },
  {
    "id": "s005",
    "date": "2026-11-16",
    "heure": "12:30",
    "type": "Android",
    "titre": "Android : bientôt",
    "lien_post": "p02",
    "objectif": "Récolter les commerçants sur Android dès le lendemain du lancement, et annoncer p02 ; indicateurs : clics vers /android et réponses ANDROID.",
    "slides": [
      {
        "texte": "Vous êtes sur Android ?",
        "visuel": "Main qui pose un téléphone Android sur un comptoir de café",
        "sticker": null
      },
      {
        "texte": "Keeply arrive bientôt sur Google Play.",
        "visuel": "Fond uni, logo Keeply et mention Google Play en petit",
        "sticker": null
      },
      {
        "texte": "Au comptoir, vous avez quoi ?",
        "visuel": "Fond uni",
        "sticker": "sondage « iPhone » / « Android »"
      },
      {
        "texte": "Touchez le lien ou répondez ANDROID. On vous prévient à l'ouverture.",
        "visuel": "Fond uni, flèche discrète vers le sticker",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s005&utm_term=story"
      },
      {
        "texte": "Demain, 13 h. Votre vitrine change de place.",
        "visuel": "Écran verrouillé d'iPhone flouté avec une notification d'un fast-food fictif à Lille",
        "sticker": null
      }
    ]
  },
  {
    "id": "s006",
    "date": "2026-11-17",
    "heure": "13:15",
    "type": "repartage",
    "titre": "Votre vitrine, sur leur écran verrouillé",
    "lien_post": "p02",
    "objectif": "Pousser p02 dans l'heure et lancer le réflexe sondage ; indicateurs : taps vers le post et votes.",
    "slides": [
      {
        "texte": "Regardez où elle s'affiche. 👀",
        "visuel": "Main qui sort un iPhone de sa poche, écran verrouillé avec une notification Keeply d'un café fictif à Montréal",
        "sticker": null
      },
      {
        "texte": "Combien de fois regardez-vous votre écran verrouillé ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Quelques fois » / « Je ne compte plus »"
      },
      {
        "texte": "Personne ne compte. Tout le monde regarde.",
        "visuel": "Même écran verrouillé, plan serré sur la notification",
        "sticker": null
      },
      {
        "texte": "Votre vitrine. Sur leur écran verrouillé.",
        "visuel": "Repartage de la photo p02",
        "sticker": "question « Votre offre de la semaine, ce serait quoi ? »"
      }
    ]
  },
  {
    "id": "s007",
    "date": "2026-11-18",
    "heure": "18:30",
    "type": "coulisses",
    "titre": "Une journée à construire Keeply",
    "lien_post": "p03",
    "objectif": "Montrer la personne derrière l'app et annoncer p03 ; indicateur : questions reçues dans la boîte.",
    "slides": [
      {
        "texte": "Aujourd'hui, à Agadir.",
        "visuel": "Selfie vidéo du fondateur en marchant vers son bureau",
        "sticker": null
      },
      {
        "texte": "[Ce que le fondateur construit vraiment aujourd'hui, en une phrase]",
        "visuel": "Écran du Mac avec l'éditeur de cartes Keeply ouvert sur une nouvelle carte du fondateur, entière et bien cadrée",
        "sticker": null
      },
      {
        "texte": "Une question pour moi ?",
        "visuel": "Vidéo du fondateur qui sourit à la caméra",
        "sticker": "question « Posez votre question au fondateur »"
      },
      {
        "texte": "Demain, 21 h. Qui est derrière Keeply.",
        "visuel": "Silhouette du fondateur floutée, contre-jour",
        "sticker": null
      }
    ]
  },
  {
    "id": "s008",
    "date": "2026-11-19",
    "heure": "21:15",
    "type": "repartage",
    "titre": "Fait à Agadir",
    "lien_post": "p03",
    "objectif": "Faire ouvrir les DM après p03 et lire la répartition des pays ; indicateurs : DM reçus et réponses au quiz pays.",
    "slides": [
      {
        "texte": "Le post est en ligne. C'est moi.",
        "visuel": "Vidéo du fondateur face caméra, une phrase",
        "sticker": null
      },
      {
        "texte": "Fait à Agadir. Par une seule personne.",
        "visuel": "Repartage du Reel p03",
        "sticker": "question « Qu'est-ce qui vous retient de lancer une carte de fidélité ? »"
      },
      {
        "texte": "Votre commerce est dans quel pays ?",
        "visuel": "Fond uni, sept petits points sur une carte stylisée",
        "sticker": "quiz à 4 choix « France » / « Belgique ou Suisse » / « Maroc » / « Canada ou autre »"
      }
    ]
  },
  {
    "id": "s009",
    "date": "2026-11-20",
    "heure": "12:30",
    "type": "FAQ",
    "titre": "FAQ : le prix",
    "lien_post": null,
    "objectif": "Répondre une fois pour toutes à la question du prix et l'épingler dans « Prix » ; indicateur : clics sur le lien d'essai.",
    "slides": [
      {
        "texte": "On me demande le prix.",
        "visuel": "Vidéo du fondateur face caméra, au comptoir d'un snack",
        "sticker": null
      },
      {
        "texte": "Dès 39,99 €/mois en France. Prix adaptés dans chaque pays.",
        "visuel": "Fond uni, prix en grand, mention « prix affichés sur l'App Store pour chaque pays » en petit",
        "sticker": null
      },
      {
        "texte": "14 jours gratuits. Vous voyez qui revient avant de payer.",
        "visuel": "Main qui tient un iPhone avec la nouvelle carte du fondateur, entière et bien cadrée d'une brasserie fictive à Bruxelles",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s009&utm_term=story"
      }
    ]
  },
  {
    "id": "s010",
    "date": "2026-11-21",
    "heure": "16:00",
    "type": "démo",
    "titre": "Un scan. C'est tout.",
    "lien_post": null,
    "objectif": "Montrer le geste produit et préparer le drop ; indicateur : taux de complétion et réponses au curseur.",
    "slides": [
      {
        "texte": "Un scan. C'est tout.",
        "visuel": "Mains au comptoir : le gérant scanne le QR de la carte d'un client",
        "sticker": null
      },
      {
        "texte": "Deux secondes. Un tampon.",
        "visuel": "Capture de l'app : la nouvelle carte du fondateur, entière et bien cadrée d'un fast-food fictif à Lille, un tampon qui s'allume",
        "sticker": null
      },
      {
        "texte": "Votre carte actuelle vous ressemble ?",
        "visuel": "Fond uni",
        "sticker": "curseur emoji 🎨 « À quel point votre carte de fidélité actuelle vous ressemble ? »"
      },
      {
        "texte": "Bientôt : une collection.",
        "visuel": "Bord d'une nouvelle carte du fondateur, entière et bien cadrée, le reste hors champ",
        "sticker": null
      }
    ]
  },
  {
    "id": "s011",
    "date": "2026-11-22",
    "heure": "17:00",
    "type": "sondage",
    "titre": "Vous gardez la main",
    "lien_post": null,
    "objectif": "Rassurer sur le contrôle des automatismes ; indicateur : votes et partages en DM.",
    "slides": [
      {
        "texte": "Vous gardez la main.",
        "visuel": "Pouce du gérant qui bascule un interrupteur dans l'app",
        "sticker": null
      },
      {
        "texte": "Offres auto. Paliers. Relances. Tout s'active. Tout se coupe.",
        "visuel": "Capture de l'écran des interrupteurs (offres automatiques, paliers)",
        "sticker": null
      },
      {
        "texte": "Un client absent depuis 30 jours. Vous le relancez ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Oui, automatiquement » / « Je préfère à la main »"
      },
      {
        "texte": "Les deux se font. Vous choisissez.",
        "visuel": "Capture du réglage « client absent » activé, puis coupé",
        "sticker": null
      }
    ]
  },
  {
    "id": "s012",
    "date": "2026-11-23",
    "heure": "19:00",
    "type": "Android",
    "titre": "Android : on pense à vous",
    "lien_post": "p04",
    "objectif": "Relancer la liste Android la semaine des pubs et teaser l'épisode 2 ; indicateurs : clics /android et abonnés au compte à rebours.",
    "slides": [
      {
        "texte": "Sur Android ? On pense à vous.",
        "visuel": "Main qui tient un téléphone Android derrière un comptoir de pizzeria",
        "sticker": null
      },
      {
        "texte": "Google Play, bientôt. Pas de date promise. Pas d'oubli non plus.",
        "visuel": "Fond uni, logo Keeply",
        "sticker": null
      },
      {
        "texte": "Répondez ANDROID ou touchez le lien.",
        "visuel": "Fond uni",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s012&utm_term=story"
      },
      {
        "texte": "Demain, 13 h. Il revient ?",
        "visuel": "Extrait flouté de l'épisode 2 : la nouvelle carte du fondateur, entière et bien cadrée avec un seul tampon",
        "sticker": "compte à rebours « Ils reviennent · épisode 2 · 24 nov. 13:00 »"
      }
    ]
  },
  {
    "id": "s013",
    "date": "2026-11-24",
    "heure": "13:15",
    "type": "repartage",
    "titre": "Épisode 2 : la deuxième visite",
    "lien_post": "p04",
    "objectif": "Faire voir l'épisode 2 et ramener vers l'essai ; indicateurs : taps vers le Reel et clics lien.",
    "slides": [
      {
        "texte": "Il est revenu.",
        "visuel": "Extrait de l'épisode 2 : la nouvelle carte du fondateur, entière et bien cadrée, deux tampons",
        "sticker": null
      },
      {
        "texte": "Le plus dur ? La deuxième fois.",
        "visuel": "Repartage du Reel p04",
        "sticker": "sondage « Le plus dur pour vous : le 1er passage » / « le 2e passage »"
      },
      {
        "texte": "Le deuxième passage. On s'en occupe.",
        "visuel": "Main qui tient l'iPhone, la carte dans le Wallet",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s013&utm_term=story"
      }
    ]
  },
  {
    "id": "s014",
    "date": "2026-11-25",
    "heure": "19:00",
    "type": "teasing",
    "titre": "Teasing du drop",
    "lien_post": "p05",
    "objectif": "Teaser 24 h avant la collection ; indicateur : abonnés au compte à rebours.",
    "slides": [
      {
        "texte": "Demain, je vous montre quelque chose.",
        "visuel": "Mains du fondateur qui étalent des cartes imprimées face cachée sur une table",
        "sticker": null
      },
      {
        "texte": "La collection.",
        "visuel": "Plusieurs nouvelles cartes du fondateur, entières en éventail, floutées",
        "sticker": "compte à rebours « Le drop · jeudi 26 nov. 15:30 »"
      },
      {
        "texte": "Envie de voir ?",
        "visuel": "Fond uni",
        "sticker": "curseur emoji 👀 « Envie de voir ? »"
      }
    ]
  },
  {
    "id": "s015",
    "date": "2026-11-26",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Le drop : la collection",
    "lien_post": "p05",
    "objectif": "Faire choisir un style et pousser la création de carte ; indicateurs : votes, commentaires sur p05, clics lien.",
    "slides": [
      {
        "texte": "La voici.",
        "visuel": "Main qui fait glisser les nouvelles cartes du fondateur, chacune entière, sur un comptoir",
        "sticker": null
      },
      {
        "texte": "Choisissez votre style.",
        "visuel": "Repartage du carrousel p05",
        "sticker": "sondage « [Style 1] » / « [Style 2] » (noms réels des styles)"
      },
      {
        "texte": "Une carte par jour, cette semaine.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée d'une brasserie fictive à Bruxelles",
        "sticker": null
      },
      {
        "texte": "Créez la vôtre.",
        "visuel": "Capture de l'éditeur de cartes Keeply",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s015&utm_term=story"
      }
    ]
  },
  {
    "id": "s016",
    "date": "2026-11-27",
    "heure": "12:30",
    "type": "FAQ",
    "titre": "FAQ : et mes clients sans iPhone ?",
    "lien_post": "p06",
    "objectif": "Lever l'objection n°1 côté clients et collecter les suivantes, puis annoncer p06 ; indicateur : questions reçues.",
    "slides": [
      {
        "texte": "Et mes clients sans iPhone ?",
        "visuel": "Vidéo du fondateur face caméra",
        "sticker": null
      },
      {
        "texte": "[Réponse exacte du fondateur : comment un client sur Android reçoit et garde sa carte]",
        "visuel": "Capture de la nouvelle carte du fondateur, entière et bien cadrée telle qu'elle s'affiche chez un client sur Android [à filmer]",
        "sticker": null
      },
      {
        "texte": "Une autre question ?",
        "visuel": "Fond uni",
        "sticker": "question « Votre question sur Keeply »"
      },
      {
        "texte": "Demain, 21 h. En bonne compagnie.",
        "visuel": "Wallet flouté, cartes empilées",
        "sticker": null
      }
    ]
  },
  {
    "id": "s017",
    "date": "2026-11-28",
    "heure": "21:15",
    "type": "repartage",
    "titre": "Wallet flex",
    "lien_post": "p06",
    "objectif": "Faire partager p06 entre gérants ; indicateurs : partages et votes.",
    "slides": [
      {
        "texte": "Votre nom. Juste à côté de leur carte bancaire.",
        "visuel": "Main qui ouvre le Wallet : la nouvelle carte du fondateur, entière et bien cadrée d'un café fictif à Montréal entre une carte bancaire et un billet d'avion",
        "sticker": null
      },
      {
        "texte": "En bonne compagnie.",
        "visuel": "Repartage de la photo p06",
        "sticker": "sondage « Ma carte dans leur Wallet : je veux » / « je découvre »"
      },
      {
        "texte": "Partagez-la à un gérant de café. ☕",
        "visuel": "Fond uni",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s017&utm_term=story"
      }
    ]
  },
  {
    "id": "s018",
    "date": "2026-11-29",
    "heure": "17:00",
    "type": "sondage",
    "titre": "Combien reviennent ?",
    "lien_post": null,
    "objectif": "Faire prendre conscience qu'on ne mesure pas le retour client ; indicateur : part de « Aucune idée ».",
    "slides": [
      {
        "texte": "Une question du dimanche.",
        "visuel": "Main du fondateur autour d'une tasse, en terrasse",
        "sticker": null
      },
      {
        "texte": "Combien de vos clients reviennent dans le mois ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Je le sais » / « Aucune idée »"
      },
      {
        "texte": "Keeply vous le montre. Passage par passage.",
        "visuel": "Capture du tableau de bord Keeply (compte de démonstration)",
        "sticker": null
      },
      {
        "texte": "Votre commerce est dans quel pays ?",
        "visuel": "Fond uni",
        "sticker": "quiz à 4 choix « France » / « Belgique ou Suisse » / « Maroc » / « Canada ou autre »"
      }
    ]
  },
  {
    "id": "s019",
    "date": "2026-11-30",
    "heure": "19:00",
    "type": "Android",
    "titre": "Android : toujours là",
    "lien_post": "p07",
    "objectif": "Continuer la liste Android et annoncer le chrono ; indicateurs : clics /android et compte à rebours.",
    "slides": [
      {
        "texte": "Toujours sur Android ?",
        "visuel": "Main qui tient un Android devant une vitrine de snack",
        "sticker": null
      },
      {
        "texte": "Au comptoir, vous avez quoi ?",
        "visuel": "Fond uni",
        "sticker": "sondage « iPhone » / « Android »"
      },
      {
        "texte": "Google Play, bientôt. Répondez ANDROID ou touchez le lien.",
        "visuel": "Fond uni",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s019&utm_term=story"
      },
      {
        "texte": "Demain, 15 h 30. 60 secondes. Montre en main.",
        "visuel": "Chrono figé à 00:00 sur l'iPhone",
        "sticker": "compte à rebours « Chrono 60 secondes · 1er déc. 15:30 »"
      }
    ]
  },
  {
    "id": "s020",
    "date": "2026-12-01",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Chrono 60 secondes",
    "lien_post": "p07",
    "objectif": "Montrer la rapidité de création et convertir ; indicateurs : réponses au quiz et clics lien.",
    "slides": [
      {
        "texte": "Prêt ? Top.",
        "visuel": "Main sur l'iPhone, chrono qui démarre à l'écran",
        "sticker": null
      },
      {
        "texte": "Combien de temps pour créer une carte ?",
        "visuel": "Repartage du Reel p07",
        "sticker": "quiz « 60 secondes » (bonne réponse, montrée dans p07) / « Une journée » / « Une semaine »"
      },
      {
        "texte": "Votre carte. Avant la fin de votre café.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée d'un snack fictif à Casablanca, juste créée",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s020&utm_term=story"
      }
    ]
  },
  {
    "id": "s021",
    "date": "2026-12-02",
    "heure": "18:30",
    "type": "coulisses",
    "titre": "Coulisses : au comptoir",
    "lien_post": "p08",
    "objectif": "Montrer le terrain réel et récolter des freins verbatim, puis annoncer p08 ; indicateur : réponses à la boîte.",
    "slides": [
      {
        "texte": "Ce matin : [ce que le fondateur a vraiment fait]",
        "visuel": "Selfie vidéo du fondateur, affiche QR Keeply à la main",
        "sticker": null
      },
      {
        "texte": "Qu'est-ce qui vous ferait essayer ?",
        "visuel": "Vidéo du fondateur, plan serré",
        "sticker": "question « Ce qui vous ferait essayer Keeply »"
      },
      {
        "texte": "Demain, 21 h. Mettez le son. 🔊",
        "visuel": "iPhone flouté qui vibre sur un comptoir",
        "sticker": null
      }
    ]
  },
  {
    "id": "s022",
    "date": "2026-12-03",
    "heure": "21:15",
    "type": "repartage",
    "titre": "ASMR : le son du retour",
    "lien_post": "p08",
    "objectif": "Faire écouter p08 avec le son ; indicateurs : taps vers le Reel et curseur.",
    "slides": [
      {
        "texte": "Ce son-là.",
        "visuel": "Gros plan : iPhone qui vibre sur un comptoir, notification Keeply, son réel",
        "sticker": null
      },
      {
        "texte": "Écoutez.",
        "visuel": "Repartage du Reel p08",
        "sticker": "curseur emoji 🔊 « Satisfaisant ? »"
      },
      {
        "texte": "Le son d'un client qui revient.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée, un tampon qui s'allume",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s022&utm_term=story"
      }
    ]
  },
  {
    "id": "s023",
    "date": "2026-12-04",
    "heure": "12:30",
    "type": "FAQ",
    "titre": "FAQ : combien ça coûte vraiment",
    "lien_post": "p09",
    "objectif": "Répéter le prix réel et annoncer p09 ; indicateur : clics lien et DM « prix ».",
    "slides": [
      {
        "texte": "Combien ça coûte, vraiment ?",
        "visuel": "Vidéo du fondateur face caméra",
        "sticker": null
      },
      {
        "texte": "Dès 39,99 €/mois en France. Prix adaptés dans chaque pays.",
        "visuel": "Fond uni, prix en grand, « affichés sur l'App Store pour chaque pays » en petit",
        "sticker": null
      },
      {
        "texte": "14 jours gratuits pour voir.",
        "visuel": "Capture de la fiche App Store",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s023&utm_term=story"
      },
      {
        "texte": "Demain, 15 h 30. Le prix d'un café par jour. ☕",
        "visuel": "Tasse de café floutée sur un comptoir",
        "sticker": null
      }
    ]
  },
  {
    "id": "s024",
    "date": "2026-12-05",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Le prix d'un café",
    "lien_post": "p09",
    "objectif": "Convertir sur l'argument prix ; indicateur roi : clics lien.",
    "slides": [
      {
        "texte": "Un café par jour.",
        "visuel": "Main qui pose un expresso sur le comptoir d'un café fictif à Luxembourg",
        "sticker": null
      },
      {
        "texte": "Le prix d'un café par jour.",
        "visuel": "Repartage du carrousel p09",
        "sticker": "sondage « Ça vaut le coup » / « Je teste 14 jours »"
      },
      {
        "texte": "Dès 39,99 €/mois en France. Prix adaptés dans chaque pays.",
        "visuel": "Fond uni",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s024&utm_term=story"
      }
    ]
  },
  {
    "id": "s025",
    "date": "2026-12-06",
    "heure": "17:00",
    "type": "sondage",
    "titre": "Le creux de 15 h",
    "lien_post": null,
    "objectif": "Faire nommer le creux de la journée pour préparer p12 ; indicateur : votes.",
    "slides": [
      {
        "texte": "15 h. Le creux.",
        "visuel": "Main posée sur un comptoir, salle vide derrière (vraie salle, filmée)",
        "sticker": null
      },
      {
        "texte": "Votre creux à vous ?",
        "visuel": "Fond uni",
        "sticker": "sondage « 15 h » / « 17 h »"
      },
      {
        "texte": "Une notification peut le remplir. Vous choisissez l'heure.",
        "visuel": "Capture de la programmation d'une notification dans Keeply",
        "sticker": null
      },
      {
        "texte": "Et vous pouvez ne rien envoyer. Vous gardez la main.",
        "visuel": "Capture de l'interrupteur coupé",
        "sticker": null
      }
    ]
  },
  {
    "id": "s026",
    "date": "2026-12-07",
    "heure": "19:00",
    "type": "Android",
    "titre": "Android + teaser épisode 3",
    "lien_post": "p10",
    "objectif": "Liste Android et teaser 24 h de l'épisode 3 ; indicateurs : clics /android et compte à rebours.",
    "slides": [
      {
        "texte": "Un mot pour Android.",
        "visuel": "Vidéo du fondateur face caméra, un Android à la main",
        "sticker": null
      },
      {
        "texte": "Keeply arrive bientôt sur Google Play. Vous serez prévenu.",
        "visuel": "Fond uni",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s026&utm_term=story"
      },
      {
        "texte": "Demain, 13 h. Il pleut.",
        "visuel": "Vitrine sous la pluie, la nouvelle carte du fondateur, entière et bien cadrée floutée en reflet",
        "sticker": "compte à rebours « Ils reviennent · épisode 3 · 8 déc. 13:00 »"
      }
    ]
  },
  {
    "id": "s027",
    "date": "2026-12-08",
    "heure": "13:15",
    "type": "repartage",
    "titre": "Épisode 3 : il pleut",
    "lien_post": "p10",
    "objectif": "Faire commenter PLUIE et montrer l'interrupteur ; indicateurs : réponses et commentaires sur p10.",
    "slides": [
      {
        "texte": "Il pleut. L'offre part toute seule.",
        "visuel": "Main qui tient un iPhone sous un auvent, notification d'offre d'un snack fictif",
        "sticker": null
      },
      {
        "texte": "Épisode 3.",
        "visuel": "Repartage du Reel p10",
        "sticker": "question « Quelle offre automatique vous tente ? »"
      },
      {
        "texte": "Activée quand vous voulez. Coupée aussi.",
        "visuel": "Capture du réglage « jour de pluie » avec son interrupteur",
        "sticker": null
      },
      {
        "texte": "Commentez PLUIE sous le Reel. On vous envoie la liste.",
        "visuel": "Fond uni",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s027&utm_term=story"
      }
    ]
  },
  {
    "id": "s028",
    "date": "2026-12-09",
    "heure": "18:30",
    "type": "coulisses",
    "titre": "Coulisses : micro-trottoir",
    "lien_post": "p11",
    "objectif": "Montrer le tournage réel et annoncer p11 ; indicateur : votes au sondage.",
    "slides": [
      {
        "texte": "Aujourd'hui : micro-trottoir.",
        "visuel": "Selfie vidéo du fondateur dans une rue d'Agadir, micro à la main",
        "sticker": null
      },
      {
        "texte": "Une question. De vraies réponses.",
        "visuel": "Coulisses du tournage, passants de dos ou floutés tant que l'accord n'est pas signé",
        "sticker": null
      },
      {
        "texte": "Et vous, combien de cartes de fidélité sur vous ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Aucune » / « Au moins une »"
      },
      {
        "texte": "Demain, 15 h 30. Leurs réponses.",
        "visuel": "Micro posé sur un muret",
        "sticker": null
      }
    ]
  },
  {
    "id": "s029",
    "date": "2026-12-10",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Micro-trottoir",
    "lien_post": "p11",
    "objectif": "Faire participer au-delà des abonnés ; indicateur : participations au sticker « Ajoutez la vôtre ».",
    "slides": [
      {
        "texte": "Ils ont répondu.",
        "visuel": "Extrait du micro-trottoir, vraies personnes filmées avec accord",
        "sticker": null
      },
      {
        "texte": "Combien de cartes avez-vous sur vous ?",
        "visuel": "Repartage du Reel p11",
        "sticker": "Ajoutez la vôtre « Votre portefeuille, en photo »"
      },
      {
        "texte": "La vôtre, elle sera où ? Dans leur Wallet.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée rangée dans un Wallet",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s029&utm_term=story"
      }
    ]
  },
  {
    "id": "s030",
    "date": "2026-12-11",
    "heure": "12:30",
    "type": "FAQ",
    "titre": "FAQ : et ma caisse ?",
    "lien_post": "p12",
    "objectif": "Lever l'objection caisse et annoncer p12 ; indicateur : questions reçues et clics.",
    "slides": [
      {
        "texte": "Et ma caisse ?",
        "visuel": "Vidéo du fondateur à côté d'une caisse de fast-food",
        "sticker": null
      },
      {
        "texte": "[Réponse exacte du fondateur : Keeply et la caisse, ce qui change et ce qui ne change pas]",
        "visuel": "Plan large du comptoir, caisse et iPhone côte à côte",
        "sticker": null
      },
      {
        "texte": "Un scan avec votre iPhone. Deux secondes.",
        "visuel": "Capture de l'écran de scan Keeply",
        "sticker": "question « Votre question sur la mise en place »"
      },
      {
        "texte": "Demain, 21 h. 15 h. Une notification. 15 h 40.",
        "visuel": "Split-screen flouté salle vide / salle pleine",
        "sticker": null
      }
    ]
  },
  {
    "id": "s031",
    "date": "2026-12-12",
    "heure": "21:15",
    "type": "repartage",
    "titre": "Avant et après la notification",
    "lien_post": "p12",
    "objectif": "Convertir sur le résultat ; indicateur roi : clics lien.",
    "slides": [
      {
        "texte": "Avant. Après.",
        "visuel": "Split-screen salle vide à 15 h, salle qui se remplit à 15 h 40 (scènes tournées, sans chiffre)",
        "sticker": null
      },
      {
        "texte": "Une notification à 15 h ?",
        "visuel": "Repartage du Reel p12",
        "sticker": "sondage « Je l'enverrais » / « Plutôt à 17 h »"
      },
      {
        "texte": "14 jours pour essayer.",
        "visuel": "Main qui tient l'iPhone, notification sur l'écran verrouillé",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s031&utm_term=story"
      }
    ]
  },
  {
    "id": "s032",
    "date": "2026-12-13",
    "heure": "17:00",
    "type": "quiz",
    "titre": "Quiz : vous gardez la main",
    "lien_post": null,
    "objectif": "Corriger les idées reçues sur les automatismes et les récompenses ; indicateur : part de bonnes réponses.",
    "slides": [
      {
        "texte": "Quiz du dimanche.",
        "visuel": "Pouce du gérant sur les interrupteurs de l'app",
        "sticker": null
      },
      {
        "texte": "Les offres automatiques, on peut les couper ?",
        "visuel": "Fond uni",
        "sticker": "quiz « Oui, une par une » (bonne réponse) / « Non, tout ou rien »"
      },
      {
        "texte": "Une par une. Vous gardez la main.",
        "visuel": "Capture de l'écran des interrupteurs",
        "sticker": null
      },
      {
        "texte": "Un produit offert ? Par coupon. Les récompenses ? En % ou en €.",
        "visuel": "Capture d'un coupon Keeply et d'un palier en remise %",
        "sticker": null
      }
    ]
  },
  {
    "id": "s033",
    "date": "2026-12-14",
    "heure": "19:00",
    "type": "fêtes",
    "titre": "Réglages des fêtes",
    "lien_post": "p13",
    "objectif": "Rendre Keeply utile pour les fêtes et annoncer p13 ; indicateur : partages et complétion.",
    "slides": [
      {
        "texte": "Les fêtes arrivent.",
        "visuel": "Main qui accroche une guirlande au-dessus d'un comptoir",
        "sticker": null
      },
      {
        "texte": "Fermé le 25 ? Coupez les automatismes. Un geste.",
        "visuel": "Capture des interrupteurs, offres auto coupées",
        "sticker": null
      },
      {
        "texte": "Le 31 ? Programmez votre notification à l'avance.",
        "visuel": "Capture de la programmation d'une notification au 31 déc.",
        "sticker": null
      },
      {
        "texte": "Demain, 15 h 30. Pendant que vous dormez. Même à Noël.",
        "visuel": "Écran verrouillé flouté, la nuit",
        "sticker": null
      }
    ]
  },
  {
    "id": "s034",
    "date": "2026-12-15",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Pendant que vous dormez",
    "lien_post": "p13",
    "objectif": "Faire enregistrer p13 et connaître les jours de fermeture ; indicateurs : réponses et enregistrements.",
    "slides": [
      {
        "texte": "Pendant que vous dormez, Keeply relance.",
        "visuel": "iPhone sur une table de nuit, écran verrouillé avec notification d'un resto fictif à Genève",
        "sticker": null
      },
      {
        "texte": "Édition fêtes.",
        "visuel": "Repartage du carrousel p13",
        "sticker": "question « Vous fermez quels jours pendant les fêtes ? »"
      },
      {
        "texte": "Ouvert le 31 ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Ouvert » / « Fermé »"
      }
    ]
  },
  {
    "id": "s035",
    "date": "2026-12-16",
    "heure": "19:00",
    "type": "Android",
    "titre": "Android + la première affiche",
    "lien_post": "p14",
    "objectif": "Liste Android et annonce p14 ; indicateurs : clics /android et réponses ANDROID.",
    "slides": [
      {
        "texte": "Vous êtes sur Android ?",
        "visuel": "Main qui tient un Android derrière le comptoir d'un resto de quartier",
        "sticker": null
      },
      {
        "texte": "Keeply arrive bientôt sur Google Play.",
        "visuel": "Fond uni",
        "sticker": null
      },
      {
        "texte": "Répondez ANDROID ou touchez le lien. On vous prévient.",
        "visuel": "Fond uni",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s035&utm_term=story"
      },
      {
        "texte": "Demain, 13 h. La première affiche.",
        "visuel": "Fondateur de dos, une affiche roulée sous le bras",
        "sticker": null
      }
    ]
  },
  {
    "id": "s036",
    "date": "2026-12-17",
    "heure": "13:15",
    "type": "repartage",
    "titre": "La première affiche",
    "lien_post": "p14",
    "objectif": "Ouvrir des DM après p14 ; indicateurs : réponses et DM.",
    "slides": [
      {
        "texte": "Elle est posée. [lieu réel, avec l'accord du commerce]",
        "visuel": "Vidéo du fondateur face caméra devant l'affiche",
        "sticker": null
      },
      {
        "texte": "J'ai posé la première affiche.",
        "visuel": "Repartage du Reel p14",
        "sticker": "question « Où poseriez-vous la vôtre ? »"
      },
      {
        "texte": "[Ce que le fondateur a ressenti, en une phrase vraie]",
        "visuel": "Plan serré sur l'affiche QR et sa carte entière",
        "sticker": null
      }
    ]
  },
  {
    "id": "s037",
    "date": "2026-12-18",
    "heure": "19:00",
    "type": "FAQ",
    "titre": "FAQ : la mise en place + teaser épisode 4",
    "lien_post": "p15",
    "objectif": "Lever l'objection temps de mise en place et teaser l'épisode 4 ; indicateurs : questions et compte à rebours.",
    "slides": [
      {
        "texte": "Combien de temps pour démarrer ?",
        "visuel": "Vidéo du fondateur face caméra",
        "sticker": null
      },
      {
        "texte": "Votre carte : le chrono est sur le profil. L'affiche : au comptoir. [Étapes réelles à confirmer]",
        "visuel": "Capture de l'éditeur puis photo de l'affiche QR posée près d'une caisse",
        "sticker": null
      },
      {
        "texte": "Une question sur la mise en place ?",
        "visuel": "Fond uni",
        "sticker": "question « Votre question »"
      },
      {
        "texte": "Demain, 21 h. Il passe Argent.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée au palier Argent, floutée",
        "sticker": "compte à rebours « Ils reviennent · épisode 4 · 19 déc. 21:00 »"
      }
    ]
  },
  {
    "id": "s038",
    "date": "2026-12-19",
    "heure": "21:15",
    "type": "repartage",
    "titre": "Épisode 4 : statut Argent",
    "lien_post": "p15",
    "objectif": "Expliquer les paliers sans ambiguïté et annoncer p16 ; indicateur : part de bonnes réponses au quiz.",
    "slides": [
      {
        "texte": "Il passe Argent.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée au palier Argent, remise [en % ou en €, valeur réelle] affichée",
        "sticker": null
      },
      {
        "texte": "Le palier Argent, c'est quoi ?",
        "visuel": "Repartage du Reel p15",
        "sticker": "quiz « Une remise en % ou en € » (bonne réponse) / « Un produit gratuit »"
      },
      {
        "texte": "Un produit offert, c'est par coupon. Les paliers, c'est une remise.",
        "visuel": "Capture des paliers Bronze, Argent, Or",
        "sticker": null
      },
      {
        "texte": "Demain, 15 h 30. Le niveau des grandes chaînes.",
        "visuel": "Fond uni",
        "sticker": null
      }
    ]
  },
  {
    "id": "s039",
    "date": "2026-12-20",
    "heure": "15:45",
    "type": "repartage",
    "titre": "Le niveau des grandes chaînes",
    "lien_post": "p16",
    "objectif": "Faire partager p16 à un associé ; indicateurs : partages et clics.",
    "slides": [
      {
        "texte": "La fidélité des grandes chaînes. Pour le commerce du coin.",
        "visuel": "Main qui tient un iPhone avec la nouvelle carte du fondateur, entière et bien cadrée d'une table fictive à Genève",
        "sticker": null
      },
      {
        "texte": "Votre carte doit avoir l'air de quoi ?",
        "visuel": "Repartage du carrousel p16",
        "sticker": "sondage « D'une grande chaîne » / « De chez moi »"
      },
      {
        "texte": "Les deux. Partagez à un associé.",
        "visuel": "Fond uni",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s039&utm_term=story"
      }
    ]
  },
  {
    "id": "s040",
    "date": "2026-12-21",
    "heure": "19:00",
    "type": "teasing",
    "titre": "Teaser du final",
    "lien_post": "p17",
    "objectif": "Teaser 24 h du final de la série ; indicateur : abonnés au compte à rebours.",
    "slides": [
      {
        "texte": "Demain, le final.",
        "visuel": "Vidéo du fondateur face caméra",
        "sticker": null
      },
      {
        "texte": "Un tampon. Deux. Cinq. Argent.",
        "visuel": "Montage de la nouvelle carte du fondateur, entière et bien cadrée qui se remplit d'épisode en épisode",
        "sticker": null
      },
      {
        "texte": "Vous avez suivi la série ?",
        "visuel": "Fond uni",
        "sticker": "sondage « Depuis l'épisode 1 » / « Je rattrape »"
      },
      {
        "texte": "Ils reviennent. Le final.",
        "visuel": "Carte presque pleine, floutée",
        "sticker": "compte à rebours « Ils reviennent · le final · 22 déc. 21:00 »"
      }
    ]
  },
  {
    "id": "s041",
    "date": "2026-12-22",
    "heure": "21:15",
    "type": "repartage",
    "titre": "Épisode 5 : le final",
    "lien_post": "p17",
    "objectif": "Faire revoir la série et annoncer p18 ; indicateurs : réponses et vues de la série.",
    "slides": [
      {
        "texte": "Dix passages plus tard.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée complète, dix tampons",
        "sticker": null
      },
      {
        "texte": "Le final.",
        "visuel": "Repartage du Reel p17",
        "sticker": "question « Votre client le plus fidèle revient depuis quand ? »"
      },
      {
        "texte": "Demain, 13 h. 14 jours. Voyez qui revient.",
        "visuel": "Fond uni",
        "sticker": null
      }
    ]
  },
  {
    "id": "s042",
    "date": "2026-12-23",
    "heure": "13:15",
    "type": "offre",
    "titre": "14 jours pour voir qui revient",
    "lien_post": "p18",
    "objectif": "Dernier appel avant les fêtes ; indicateurs rois : clics essai et clics /android.",
    "slides": [
      {
        "texte": "Dernier post avant les fêtes.",
        "visuel": "Vidéo du fondateur face caméra",
        "sticker": null
      },
      {
        "texte": "14 jours. Voyez qui revient.",
        "visuel": "Repartage de la photo p18",
        "sticker": "lien « Essai gratuit 14 jours » vers keeplyfidelity.app/app?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=s042&utm_term=story"
      },
      {
        "texte": "Dès 39,99 €/mois en France. Prix adaptés dans chaque pays.",
        "visuel": "Fond uni, « prix affichés sur l'App Store pour chaque pays » en petit",
        "sticker": null
      },
      {
        "texte": "Sur Android ? Bientôt sur Google Play.",
        "visuel": "Fond uni",
        "sticker": "lien « Être prévenu » vers keeplyfidelity.app/android?utm_source=instagram&utm_medium=story&utm_campaign=lancement&utm_content=story_android_s042&utm_term=story"
      }
    ]
  },
  {
    "id": "s043",
    "date": "2026-12-24",
    "heure": "18:00",
    "type": "fêtes",
    "titre": "Bonnes fêtes",
    "lien_post": null,
    "objectif": "Story légère, sans vente ; indicateur : réponses spontanées.",
    "slides": [
      {
        "texte": "Bonnes fêtes. 🎄",
        "visuel": "Vidéo du fondateur, lumières de fête derrière lui",
        "sticker": null
      },
      {
        "texte": "Fermez l'esprit tranquille. Vos réglages vous attendent.",
        "visuel": "nouvelle carte du fondateur, entière et bien cadrée sous une guirlande",
        "sticker": null
      }
    ]
  },
  {
    "id": "s044",
    "date": "2026-12-26",
    "heure": "17:00",
    "type": "fêtes",
    "titre": "Six semaines",
    "lien_post": null,
    "objectif": "Remercier et récolter les envies de janvier, sans vente ; indicateur : réponses à la boîte.",
    "slides": [
      {
        "texte": "Six semaines. Merci d'être là.",
        "visuel": "Vidéo du fondateur face caméra, à Agadir",
        "sticker": null
      },
      {
        "texte": "[Vrai bilan du fondateur : ce qu'il a appris, sans chiffre inventé]",
        "visuel": "Plan de ses mains sur l'affiche QR et les nouvelles cartes, entières",
        "sticker": null
      },
      {
        "texte": "Qu'aimeriez-vous voir en janvier ?",
        "visuel": "Fond uni",
        "sticker": "question « Votre idée pour janvier »"
      }
    ]
  }
];
