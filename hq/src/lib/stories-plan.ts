/** Séquences de stories clés du lancement v6 (24 nov. 2026 au 5 janv. 2027). La routine de tous les jours est dans INSTAGRAM_PLAN.stories_quotidiennes. */
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
    "id": "s01",
    "date": "2026-11-24",
    "heure": "21:15",
    "type": "ouverture",
    "titre": "Le compte ouvre",
    "lien_post": "p01",
    "objectif": "Faire suivre le compte dès le premier soir.",
    "slides": [
      {
        "texte": "Fidéliser, c'est devenu facile.",
        "visuel": "fond blanc, une carte du Studio, entière et centrée qui glisse",
        "sticker": null
      },
      {
        "texte": "Le 1er décembre.",
        "visuel": "fond violet Keeply, date en grand",
        "sticker": "Compte à rebours « Lancement de Keeply » (1er déc., 12 h 30)"
      }
    ]
  },
  {
    "id": "s02",
    "date": "2026-11-25",
    "heure": "19:00",
    "type": "coulisses",
    "titre": "Ce qu'on prépare",
    "lien_post": null,
    "objectif": "Montrer qu'il y a une vraie personne derrière.",
    "slides": [
      {
        "texte": "Une semaine avant.",
        "visuel": "bureau du fondateur, Mac ouvert sur l'app",
        "sticker": null
      },
      {
        "texte": "Vous gérez un commerce ?",
        "visuel": "fond blanc",
        "sticker": "Sondage « Oui / Non »"
      }
    ]
  },
  {
    "id": "s03",
    "date": "2026-11-26",
    "heure": "13:15",
    "type": "partage",
    "titre": "Un scan",
    "lien_post": "p02",
    "objectif": "Pousser le Reel p02.",
    "slides": [
      {
        "texte": "Un scan. Elle est dans son Wallet.",
        "visuel": "aperçu du Reel p02",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s04",
    "date": "2026-11-27",
    "heure": "19:00",
    "type": "question",
    "titre": "Votre carte aujourd'hui ?",
    "lien_post": null,
    "objectif": "Comprendre le public et nourrir les « Questions de patrons ».",
    "slides": [
      {
        "texte": "Aujourd'hui, vous fidélisez comment ?",
        "visuel": "fond blanc",
        "sticker": "Quiz « Carton / Appli / Rien / Autre »"
      },
      {
        "texte": "Une question pour le fondateur ?",
        "visuel": "photo du fondateur",
        "sticker": "Boîte à questions"
      }
    ]
  },
  {
    "id": "s05",
    "date": "2026-11-30",
    "heure": "19:00",
    "type": "teasing",
    "titre": "Demain",
    "lien_post": null,
    "objectif": "Rappeler le lancement à ceux qui ont suivi.",
    "slides": [
      {
        "texte": "Demain, 12 h 30.",
        "visuel": "iPhone posé, écran noir",
        "sticker": "Compte à rebours (rappel)"
      },
      {
        "texte": "Ils reviennent.",
        "visuel": "une carte du Studio, entière et centrée sur fond de sa couleur",
        "sticker": null
      }
    ]
  },
  {
    "id": "s06",
    "date": "2026-12-01",
    "heure": "12:35",
    "type": "lancement",
    "titre": "C'est en ligne",
    "lien_post": "p04",
    "objectif": "Le jour J : faire télécharger.",
    "slides": [
      {
        "texte": "Keeply est disponible.",
        "visuel": "fond violet, logo",
        "sticker": null
      },
      {
        "texte": "Maroc · Canada · Suisse.",
        "visuel": "les trois drapeaux, sobres",
        "sticker": null
      },
      {
        "texte": "France, Belgique : très bientôt.",
        "visuel": "fond blanc",
        "sticker": "Lien « Liste d'attente »"
      },
      {
        "texte": "Essai gratuit 14 jours.",
        "visuel": "capture App Store de Keeply",
        "sticker": "Lien « Télécharger » (App Store)"
      }
    ]
  },
  {
    "id": "s07",
    "date": "2026-12-01",
    "heure": "20:30",
    "type": "coulisses",
    "titre": "Le soir du lancement",
    "lien_post": null,
    "objectif": "Partager le moment, vrai.",
    "slides": [
      {
        "texte": "[Ce que tu ressens, en vrai.]",
        "visuel": "selfie vidéo du fondateur, 10 s, non monté",
        "sticker": null
      },
      {
        "texte": "Merci.",
        "visuel": "fond blanc",
        "sticker": null
      }
    ]
  },
  {
    "id": "s08",
    "date": "2026-12-03",
    "heure": "13:15",
    "type": "partage",
    "titre": "Trois gestes",
    "lien_post": "p05",
    "objectif": "Pousser le carrousel explicatif.",
    "slides": [
      {
        "texte": "Comment ça marche, en trois gestes.",
        "visuel": "slide 1 du carrousel",
        "sticker": "Lien vers le post"
      }
    ]
  },
  {
    "id": "s09",
    "date": "2026-12-04",
    "heure": "19:00",
    "type": "pédagogie",
    "titre": "Les options",
    "lien_post": null,
    "objectif": "Montrer qu'on garde la main.",
    "slides": [
      {
        "texte": "Vous gardez la main.",
        "visuel": "capture des interrupteurs d'offres automatiques",
        "sticker": null
      },
      {
        "texte": "Chaque option s'allume ou s'éteint.",
        "visuel": "même capture, un interrupteur qui bascule (vidéo écran)",
        "sticker": null
      },
      {
        "texte": "Laquelle vous servirait le plus ?",
        "visuel": "fond blanc",
        "sticker": "Sondage « Anniversaire / Retour après absence »"
      }
    ]
  },
  {
    "id": "s10",
    "date": "2026-12-06",
    "heure": "21:15",
    "type": "partage",
    "titre": "Chrono n°1",
    "lien_post": "p06",
    "objectif": "Pousser le Reel Chrono.",
    "slides": [
      {
        "texte": "Combien de temps pour une carte de fidélité ?",
        "visuel": "aperçu du Reel",
        "sticker": "Curseur « Votre estimation »"
      },
      {
        "texte": "La réponse en vidéo.",
        "visuel": "image du chrono final",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s11",
    "date": "2026-12-08",
    "heure": "13:15",
    "type": "partage",
    "titre": "Le calcul",
    "lien_post": "p07",
    "objectif": "Faire refaire le calcul.",
    "slides": [
      {
        "texte": "Votre panier moyen ?",
        "visuel": "fond blanc",
        "sticker": "Boîte à questions (réponse : montant)"
      },
      {
        "texte": "Quatre passages de plus par mois (exemple, panier 10 €).",
        "visuel": "chiffre 4 en grand",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s12",
    "date": "2026-12-10",
    "heure": "21:15",
    "type": "partage",
    "titre": "Ils reviennent, épisode 1",
    "lien_post": "p08",
    "objectif": "Lancer la série.",
    "slides": [
      {
        "texte": "Nouvelle série.",
        "visuel": "image du Reel",
        "sticker": null
      },
      {
        "texte": "Reviendra-t-il ?",
        "visuel": "fond noir",
        "sticker": "Sondage « Oui / Non »"
      }
    ]
  },
  {
    "id": "s13",
    "date": "2026-12-13",
    "heure": "21:15",
    "type": "partage",
    "titre": "La collection",
    "lien_post": "p09",
    "objectif": "Faire choisir une carte.",
    "slides": [
      {
        "texte": "Laquelle ressemble à votre commerce ?",
        "visuel": "4 cartes du Studio en grille",
        "sticker": "Sondage à 4 choix (quiz)"
      }
    ]
  },
  {
    "id": "s14",
    "date": "2026-12-15",
    "heure": "13:15",
    "type": "partage",
    "titre": "Android",
    "lien_post": "p10",
    "objectif": "Lever l'objection Android.",
    "slides": [
      {
        "texte": "Vos clients sur Android aussi.",
        "visuel": "deux téléphones, même carte",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s15",
    "date": "2026-12-17",
    "heure": "21:15",
    "type": "partage",
    "titre": "Chrono n°2",
    "lien_post": "p11",
    "objectif": "Pousser le deuxième chrono.",
    "slides": [
      {
        "texte": "Chrono n°2 : un café.",
        "visuel": "aperçu du Reel",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s16",
    "date": "2026-12-20",
    "heure": "21:15",
    "type": "partage",
    "titre": "Épisode 2",
    "lien_post": "p12",
    "objectif": "Montrer l'écran verrouillé.",
    "slides": [
      {
        "texte": "Il pleut.",
        "visuel": "fenêtre sous la pluie",
        "sticker": null
      },
      {
        "texte": "Votre offre part toute seule.",
        "visuel": "notification sur écran verrouillé",
        "sticker": "Lien vers le Reel"
      },
      {
        "texte": "Ou pas : vous décidez.",
        "visuel": "interrupteur éteint",
        "sticker": null
      }
    ]
  },
  {
    "id": "s17",
    "date": "2026-12-22",
    "heure": "13:15",
    "type": "partage",
    "titre": "Le prix",
    "lien_post": "p13",
    "objectif": "Faire enregistrer le carrousel prix.",
    "slides": [
      {
        "texte": "Le prix, sans astérisque.",
        "visuel": "slide 2 du carrousel",
        "sticker": "Lien vers le post"
      }
    ]
  },
  {
    "id": "s18",
    "date": "2026-12-24",
    "heure": "18:00",
    "type": "calme",
    "titre": "Joyeuses fêtes",
    "lien_post": null,
    "objectif": "Rester présent sans vendre.",
    "slides": [
      {
        "texte": "Bon service ce soir à tous ceux qui travaillent.",
        "visuel": "comptoir de nuit, lumière chaude",
        "sticker": null
      }
    ]
  },
  {
    "id": "s19",
    "date": "2026-12-27",
    "heure": "21:15",
    "type": "partage",
    "titre": "Un mois",
    "lien_post": "p14",
    "objectif": "Partager les vrais chiffres.",
    "slides": [
      {
        "texte": "Un mois. Les vrais chiffres.",
        "visuel": "aperçu du Reel",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s20",
    "date": "2026-12-29",
    "heure": "21:15",
    "type": "partage",
    "titre": "Le final",
    "lien_post": "p15",
    "objectif": "Convertir après la série.",
    "slides": [
      {
        "texte": "Il est revenu.",
        "visuel": "image du final",
        "sticker": null
      },
      {
        "texte": "Essai gratuit 14 jours.",
        "visuel": "capture App Store",
        "sticker": "Lien « Télécharger »"
      }
    ]
  },
  {
    "id": "s21",
    "date": "2027-01-03",
    "heure": "21:15",
    "type": "partage",
    "titre": "Janvier",
    "lien_post": "p17",
    "objectif": "Coller au problème du moment.",
    "slides": [
      {
        "texte": "Vos clients réguliers sont revenus après les fêtes ?",
        "visuel": "fond blanc",
        "sticker": "Sondage « Oui / Pas tous »"
      },
      {
        "texte": "Une relance peut partir toute seule.",
        "visuel": "notification « Vous nous manquez »",
        "sticker": "Lien vers le Reel"
      }
    ]
  },
  {
    "id": "s22",
    "date": "2027-01-05",
    "heure": "13:15",
    "type": "partage",
    "titre": "Tout couper",
    "lien_post": "p18",
    "objectif": "Rassurer.",
    "slides": [
      {
        "texte": "Vous pouvez tout couper.",
        "visuel": "interrupteurs éteints un à un (vidéo écran)",
        "sticker": "Lien vers le Reel"
      }
    ]
  }
];
