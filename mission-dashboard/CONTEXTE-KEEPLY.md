# Contexte Keeply (à lire avant de travailler sur HQ)

## Keeply en bref
- App iPhone pour commerçants : carte de fidélité dans Apple Wallet / Google Wallet (points ou tampons, paliers de récompenses, statuts Bronze/Argent/Or, campagnes, coupons).
- Cible : fast-foods (principal), cafés, restaurants y compris haut de gamme. Varier les exemples.
- Abonnement : essai 14 jours, 39,99 €/mois ou 359,99 €/an. Ventes via App Store (et Google Play à venir).
- App iOS 1.0 en ligne sur l'App Store depuis le 01/11/2026 (id 6816728580). France/Belgique/Luxembourg/Monaco : en attente de la vérification « trader » DSA d'Apple. Version 1.1 en préparation.
- Site : keeplyfidelity.app (dossier `site/`).

## Règles de contenu (partout : HQ, site, textes)
- **Jamais de faux témoignages / avis de commerçants.** Données d'exemple = clairement marquées « exemple ».
- Récompenses et statuts = **remises en % ou en €**. Un produit offert (boisson, dessert…) n'existe **que sous forme de coupon**.
- Les fonctions (offres automatiques, paliers, statuts…) sont **activables/désactivables** par le commerçant : le rappeler subtilement.
- Tout en **français**.

## Keeply HQ
- Tableau de bord interne du fondateur : voir `hq/README.md` (rôle de chaque page, lancement, Vercel, sécurité).
- En ligne sur Vercel (projet `keeply-hq`) ; push sur `claude/practical-wozniak-c8ezmz` = mise en production.
- Les fonctions « Claude » de HQ passent par un **pont local sur le Mac du fondateur** : injoignable depuis le cloud. Ne pas le casser ; tester l'affichage avec les données d'exemple.
- La plupart des connexions (boîte mail, App Store, Instagram, Meta Ads…) ne sont pas encore branchées : c'est le fondateur qui saisit les clés. Ne jamais mettre de clé dans le code (dépôt public).
- Prospection (Harvey) : 40 demandes/jour max, aucun e-mail envoyé sans validation du fondateur.

## Façon de travailler
- Le fondateur n'est pas développeur : expliquer simplement, en français, ce qui a changé et comment le voir.
- Ne jamais accepter de conditions, saisir de mot de passe ni toucher à la production de l'app Keeply (Supabase) depuis ici.
- Attention au budget : aller droit au but.
