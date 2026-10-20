# Keeply HQ

Le poste de pilotage personnel de Keeply : ventes, Instagram et Meta Ads, mails pro triés par priorité, santé de l'app testée chaque jour, prospection de cafés et restaurants, clients, avis, tâches et outils.

Tant qu'un compte n'est pas connecté, chaque écran affiche des **données d'exemple** (badge jaune) pour que tout soit utilisable tout de suite.

## Ce que fait chaque page

| Page | Ce que tu y fais |
| --- | --- |
| **Aujourd'hui** | Objectif du mois en carte à tampons, chiffres clés, liste « À traiter » (mails urgents, pannes, avis négatifs, prospects qui ont répondu), briefing du matin écrit par l'IA. |
| **Ventes** | App Store + Google Play + Stripe + toute autre plateforme (import CSV ou webhook). Revenu net en euros, ventes, téléchargements, remboursements, MRR, par pays et par produit, comparaison avec la période d'avant. |
| **Instagram & Ads** | Planning (calendrier), création de posts (photo, carrousel, Reel, story) avec aperçu téléphone, légendes et hashtags par IA, publication programmée ; statistiques (abonnés, portée, meilleurs créneaux, formats, hashtags, audience) ; croissance (coach IA, routine quotidienne, planning de la semaine, idées, accroches de Reels, bio, jeux de hashtags, veille des concurrents) ; publicités Meta (dépenses, résultats, alertes, rédaction d'annonces). |
| **Mails** | Boîte pro classée par priorité et par catégorie, résumé et action proposés par l'IA, réponse rédigée en un clic, modèles, archivage, **réponse automatique** (« nous avons bien reçu votre mail… ») avec garde-fous. |
| **Prospection** | Recherche de cafés, restaurants, boulangeries… par pays et par ville (OpenStreetMap gratuit, ou Google Places), visite de leur site pour trouver mail, Instagram et indices, vérification du domaine, score chaud/tiède/froid, mails personnalisés par l'IA avec relances, file d'envoi progressive, arrêt automatique dès qu'un prospect répond, liste d'exclusion. |
| **Santé de l'app** | Test quotidien : site en ligne, temps de réponse, certificat HTTPS, liens cassés, fiche App Store, fiche Google Play, erreurs Sentry, avis qui parlent de bug, et tests navigateur (ordinateur + téléphone) lancés chaque matin par GitHub Actions. Alerte par mail et tâche créée en cas de panne. |
| **Clients** | Établissements clients, formule, MRR, risques de départ. Leurs mails remontent en priorité. |
| **Avis** | Avis App Store et Google Play réunis, réponse préparée par l'IA et publiée depuis l'app. |
| **Tâches** | Tableau À faire / En cours / Fait (glisser-déposer). |
| **Outils** | Projection du MRR, LTV/CAC, liens de suivi UTM, atelier d'écriture IA (fiche store, notes de version, LinkedIn, newsletter, SMS, pitch), bloc-notes. |
| **Connexions** | Brancher chaque service, avec le mode d'emploi et un bouton de test. Les clés sont chiffrées. |
| **Réglages** | Objectif, adresses surveillées, règles de tri des mails, rythme de prospection, rubriques Instagram. |

Raccourci partout : **⌘K / Ctrl+K** pour aller à une page ou lancer une action.

## Lancer en local

```bash
cd hq
npm install
cp .env.example .env.local   # facultatif en local
npm run dev                  # http://localhost:3000
```

Sans `ADMIN_PASSWORD`, l'accès est libre en local (jamais en ligne). Les données sont enregistrées dans `hq/data/hq-db.json` (ignoré par git).

## Mettre en ligne (Vercel, conseillé)

1. Sur vercel.com : **Add New > Project**, choisis ce dépôt et règle **Root Directory** sur `hq`.
2. **Storage > Create > Upstash Redis** et relie-le au projet (le disque de Vercel n'est pas permanent).
3. **Storage > Create > Blob** pour héberger les images Instagram.
4. Ajoute les variables `ADMIN_PASSWORD`, `SESSION_SECRET`, `CRON_SECRET`, `INGEST_TOKEN` (voir `.env.example`).
5. Déploie, connecte-toi, puis branche tes comptes dans **Connexions**.

### Automatisations 24 h/24

La route `/api/cron` publie les posts programmés, envoie les réponses automatiques, lance le test de santé du jour et la prospection. Elle tourne :

- toute seule toutes les 3 minutes quand le tableau de bord est ouvert ;
- une fois par jour via le cron Vercel (`vercel.json`) ;
- **toutes les 5 à 10 minutes** si tu ajoutes une tâche gratuite sur cron-job.org vers `https://ton-domaine/api/cron?secret=CRON_SECRET` (conseillé pour programmer des posts à l'heure près).

### Tests navigateur quotidiens (GitHub Actions)

Le workflow `.github/workflows/keeply-tests-quotidiens.yml` ouvre le site chaque matin dans Chrome (ordinateur et téléphone) et envoie le rapport à l'onglet Santé. Ajoute dans GitHub > Settings > Secrets and variables > Actions : `KEEPLY_SITE_URL`, `HQ_URL`, `HQ_INGEST_TOKEN` (et la variable facultative `KEEPLY_PAGES`, ex. `/,/tarifs,/contact`).

### Ventes d'autres plateformes

`POST /api/ingest/sales` avec l'en-tête `Authorization: Bearer INGEST_TOKEN` et un corps `{ "date": "2026-10-20", "amount": 29, "product": "Keeply Pro", "country": "FR", "source": "paddle" }`. Pratique avec Zapier, Make ou n8n pour Lemon Squeezy, Paddle, Shopify, Gumroad… Ou import CSV depuis la page Ventes.

## Sécurité

- Accès protégé par mot de passe (session signée, 30 jours), limitation des essais.
- Clés d'API chiffrées (AES-256-GCM) avec `SESSION_SECRET`.
- Le contenu des mails, avis et sites visités est traité par l'IA comme des données, jamais comme des consignes. La réponse automatique n'envoie qu'un texte fixe que tu as écrit ; tout texte rédigé par l'IA attend ton clic avant de partir.
- Prospection : envoi en semaine, dans un créneau, avec une limite par jour, une phrase de désinscription, une liste d'exclusion et l'arrêt des relances dès qu'un prospect répond. Utilise de préférence une boîte sur un domaine secondaire.

## Technique

Next.js 16 (App Router), React 19, Tailwind CSS 4, Recharts, SWR, SDK Anthropic (Claude), ImapFlow / Nodemailer, Stripe, jose. Le code serveur est dans `src/lib` (un fichier par service dans `src/lib/connectors`), les routes d'API dans `src/app/api`, les pages dans `src/app/(app)`.
