# Mission : un dashboard Keeply HQ hyper moderne

Keeply HQ (`hq/`) est le tableau de bord interne du fondateur de Keeply (carte de fidélité Apple/Google Wallet pour fast-foods, cafés et restaurants). Stack : Next.js 16 (lire `hq/AGENTS.md` avant de coder), React 19, Tailwind 4, recharts, cmdk, sonner, lucide-react.

## 1. Avant tout
1. Lancer `bash mission-dashboard/installer-skills.sh` (skills de design : Taste, Emil Kowalski).
2. Lire et appliquer `design-taste-frontend`, `high-end-visual-design`, `redesign-existing-projects` et `emil-design-eng` pendant tout le travail.
3. `cd hq && npm install && npm run dev`, faire le tour de toutes les pages (`src/app/(app)/` : accueil, ventes, clients, avis, mails, instagram, prospection, harvey, taches, valider, connexions, outils, sante, claude, reglages).

## 2. Objectif
Refaire l'interface pour qu'elle soit **hyper moderne, premium, pas « template »** :
- accueil = vraie vue d'ensemble : chiffres clés (KPI), graphiques soignés, activité récente, tâches à valider ;
- navigation claire (barre latérale + palette de commandes ⌘K déjà là avec cmdk) ;
- mode clair et sombre (`data-theme`), animations discrètes (respecter `prefers-reduced-motion`) ;
- responsive (le fondateur l'ouvre aussi sur iPhone) ;
- garder l'identité Keeply : variables de `hq/src/app/globals.css` (violet #6b4af2, miel, nuit) — on peut les affiner, pas les remplacer par une autre marque.

Tu as carte blanche sur le design, les composants et la structure des pages.

## 3. Règles
- Interface **en français**.
- Ne pas casser la logique serveur (`src/app/api`, connexion, cron) : changer l'affichage, pas le fonctionnement. Si un changement serveur est utile, le proposer.
- Données d'exemple : les garder clairement marquées « exemple » ; **jamais de faux avis ou témoignages** présentés comme vrais.
- **Le dépôt est public** : aucun secret, clé ou mot de passe dans le code ou les commits.
- `npm run build` et `npm run lint` doivent passer ; vérifier chaque page avec des captures (Playwright) en clair, sombre et mobile.
- Déploiement : la branche `claude/practical-wozniak-c8ezmz` part en production sur Vercel à chaque push. Travailler sur ta propre branche ; le fondateur valide l'aperçu Vercel avant la fusion.
- Commits clairs, en français.
