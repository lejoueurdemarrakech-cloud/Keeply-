# Jarvis

L'assistant vocal personnel du fondateur de Keeply, **installé sur le Mac**.
Interface HUD plein écran, voix réaliste, branché sur **Keeply HQ** (chiffres, tâches, mails, santé de l'app, réseaux) et sur **Claude Code** (abonnement du Mac) avec recherche web : il répond à tout et **affiche** ce qu'on lui demande (matchs du jour, actus, cours, recettes, tableaux, graphiques…).

## Installer (une seule fois)

Dans le Terminal, depuis le dossier du dépôt :

```bash
bash jarvis/installer.sh
```

Le script :

1. vérifie Node.js (20 ou plus) et Claude Code ;
2. installe et compile l'app ;
3. la branche sur Keeply HQ : il reprend l'adresse et le jeton du pont s'il les trouve, sinon il les demande (le jeton est l'`INGEST_TOKEN`, le même que celui du pont) ;
4. la lance à chaque ouverture de session (service en arrière-plan) ;
5. crée l'app **Jarvis** dans `~/Applications` : glisse-la dans le Dock.

Relancer le script = mettre Jarvis à jour. Pour l'enlever : `bash jarvis/desinstaller.sh` (ajoute `--tout` pour effacer aussi réglages et mémoire).

## Utiliser

- Ouvre l'app Jarvis, clique **Activer** (autorise le micro la première fois).
- **Espace** ou clic sur le réacteur : parler. **Échap** : couper. **/** : écrire.
- **Mains libres** : il écoute en continu, dis « Jarvis, … ».
- Exemples :
  - « Briefing », « Où en sont les ventes ? », « Mes tâches », « Ajoute une tâche : relancer Apple ».
  - « Les matchs de Ligue des champions ce soir » → tableau des matchs à l'écran.
  - « Ajoute un widget avec le cours du Bitcoin » → widget épinglé, mis à jour tout seul.
  - « Mets le thème rouge », « Enlève les actus », « Passe en mode perso », « Remets l'interface par défaut ».
  - « Souviens-toi que mon équipe est le PSG ».
- Tout résultat affiché peut être **épinglé** en widget (bouton Épingler).

## Comment c'est construit

| Partie | Rôle |
| --- | --- |
| `server/` | Petit serveur Node sans framework sur `http://127.0.0.1:4777` (n'écoute que sur le Mac). |
| `server/brain.js` | Réponses instantanées (interface, chiffres Keeply) ; le reste part à Claude avec un protocole `<say>` (à dire), `<view>` (à afficher), `<ui>` (changer l'écran), `<actions>`. |
| `server/claude.js` | Lance la CLI `claude` en flux : recherche web autorisée, **aucun accès aux fichiers ni au terminal**, dossier de travail vide (`~/.jarvis/workspace`). |
| `server/hq.js` | Lit HQ via `/api/ingest/jarvis` (jeton du pont) et y crée tâches et notes. |
| `server/tts.js` | Voix neuronale gratuite (Microsoft Edge), repli sur la voix du Mac (`say`), cache audio. |
| `server/info.js` | Météo (Open-Meteo) et actus (Google Actualités, RSS), gratuits et sans clé. |
| `ui/` | Interface React compilée (Vite) : réacteur animé, widgets, rendu universel des réponses. |

Données locales dans `~/.jarvis` : `config.json` (réglages, jeton HQ, fichier lisible par toi seul), `layout.json` (thème et widgets), `memory.json`, cache audio, journal `jarvis.log`.

**Mémoire** : environ 60 Mo pour le serveur, plus la fenêtre de l'app. Claude n'est lancé que pendant une question. Les widgets générés ne se mettent à jour que si l'écran est ouvert (réglable, une demande à Claude par mise à jour).

## Développer

```bash
cd jarvis
npm install
npm run build && npm start      # http://127.0.0.1:4777
npm test                        # tests du cerveau et de l'interface
npm run check                   # vérification des types
```

Variables utiles pour tester : `JARVIS_HOME` (dossier de données), `JARVIS_CLAUDE_BIN` (autre binaire Claude), `JARVIS_PORT`.
