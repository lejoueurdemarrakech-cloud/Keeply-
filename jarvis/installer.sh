#!/usr/bin/env bash
# ============================================================
#  Installation de Jarvis sur le Mac (à lancer une seule fois) :
#    bash jarvis/installer.sh
#  - installe et compile l'app (dans ce dossier)
#  - la branche sur Keeply HQ (adresse + jeton du pont)
#  - la démarre à chaque ouverture de session (LaunchAgent)
#  - crée l'app « Jarvis » dans ~/Applications
#  Relancer le script met simplement Jarvis à jour.
# ============================================================
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
HOME_J="$HOME/.jarvis"
PORT=4777
LABEL="app.keeply.jarvis"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
APP="$HOME/Applications/Jarvis.app"

say_step() { printf "\n\033[1;36m▸ %s\033[0m\n" "$1"; }
fail() { printf "\n\033[1;31m✗ %s\033[0m\n" "$1"; exit 1; }

[ "$(uname)" = "Darwin" ] || fail "Ce script est fait pour macOS."

say_step "Vérification des outils"
NODE="$(command -v node || true)"
[ -n "$NODE" ] || fail "Node.js est introuvable. Installe-le depuis https://nodejs.org (version LTS), puis relance ce script."
NODE_MAJOR="$("$NODE" -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || fail "Node.js $NODE_MAJOR est trop ancien : il faut la version 20 ou plus (https://nodejs.org)."
echo "Node.js : $("$NODE" -v)"
CLAUDE="$(command -v claude || true)"
if [ -z "$CLAUDE" ]; then
  for p in "$HOME/.claude/local/claude" "$HOME/.local/bin/claude" /opt/homebrew/bin/claude /usr/local/bin/claude; do [ -x "$p" ] && CLAUDE="$p" && break; done
fi
if [ -n "$CLAUDE" ]; then echo "Claude Code : $("$CLAUDE" --version 2>/dev/null | head -1)"; else echo "⚠️  Claude Code introuvable : Jarvis marchera, mais sans les questions libres. Installe-le puis relance ce script."; fi

say_step "Installation et compilation (une minute)"
cd "$DIR"
npm install --no-audit --no-fund --loglevel=error
npm run build --silent
npm prune --omit=dev --no-audit --no-fund --loglevel=error >/dev/null 2>&1 || true

say_step "Connexion à Keeply HQ"
mkdir -p "$HOME_J"
CFG="$HOME_J/config.json"
CUR_URL="$("$NODE" -e 'try{const c=require(process.argv[1]);process.stdout.write(c.hqUrl||"")}catch{}' "$CFG")"
CUR_TOKEN="$("$NODE" -e 'try{const c=require(process.argv[1]);process.stdout.write(c.hqToken?"oui":"")}catch{}' "$CFG")"
HQ_URL="$CUR_URL"
HQ_TOKEN=""
# Le pont du Mac connaît déjà l'adresse et le jeton : on essaie de les reprendre.
if [ -z "$CUR_URL" ] || [ -z "$CUR_TOKEN" ]; then
  for f in "$HOME/Outils/keeply-pont/.env" "$HOME/Outils/keeply-pont/config.json" "$HOME/Outils/keeply-pont/.env.local"; do
    [ -f "$f" ] || continue
    U="$(grep -Ei '"?(HQ_URL|hqUrl|HQ)"?[[:space:]]*[=:]' "$f" | grep -Eo 'https?://[^"[:space:],]+' | head -1 || true)"
    [ -z "$U" ] && U="$(grep -Eo 'https://[A-Za-z0-9._-]+\.vercel\.app' "$f" | head -1 || true)"
    T="$(grep -Ei '"?(INGEST_TOKEN|HQ_TOKEN|hqToken|ingestToken)"?[[:space:]]*[=:]' "$f" | head -1 | sed -E 's/^[^=:]*[=:][[:space:]]*"?//; s/"?,?[[:space:]]*$//' || true)"
    [ -z "$HQ_URL" ] && [ -n "$U" ] && HQ_URL="$U"
    [ -n "$T" ] && HQ_TOKEN="$T"
    [ -n "$U$T" ] && echo "Réglages repris du pont ($f)."
    break
  done
fi
if [ -z "$HQ_URL" ]; then
  read -r -p "Adresse de Keeply HQ (ex. https://keeply-hq.vercel.app), ou Entrée pour plus tard : " HQ_URL || true
fi
if [ -z "$CUR_TOKEN" ] && [ -z "$HQ_TOKEN" ] && [ -n "$HQ_URL" ]; then
  read -r -s -p "Jeton INGEST_TOKEN (le même que le pont, il ne s'affiche pas) : " HQ_TOKEN || true
  echo
fi
"$NODE" -e '
  const fs = require("fs");
  const [file, url, token, claude] = process.argv.slice(1);
  let c = {};
  try { c = JSON.parse(fs.readFileSync(file, "utf8")); } catch {}
  if (url) c.hqUrl = url.replace(/\/+$/, "");
  if (token) c.hqToken = token;
  if (claude) c.claudeBin = claude;
  fs.writeFileSync(file, JSON.stringify(c, null, 2), { mode: 0o600 });
' "$CFG" "$HQ_URL" "$HQ_TOKEN" "$CLAUDE"
chmod 600 "$CFG"

say_step "Démarrage automatique"
mkdir -p "$HOME/Library/LaunchAgents"
PATH_DIRS="$(dirname "$NODE"):$( [ -n "$CLAUDE" ] && dirname "$CLAUDE" || echo /usr/local/bin):/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>$NODE</string><string>$DIR/server/index.js</string></array>
  <key>WorkingDirectory</key><string>$DIR</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key><string>$PATH_DIRS</string>
    <key>HOME</key><string>$HOME</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>ProcessType</key><string>Interactive</string>
  <key>StandardOutPath</key><string>$HOME_J/jarvis.log</string>
  <key>StandardErrorPath</key><string>$HOME_J/jarvis.log</string>
</dict>
</plist>
PLIST
launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true
# macOS met un instant à arrêter l'ancien service : on attend, puis on réessaie si besoin.
for _ in 1 2 3 4 5; do launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || break; sleep 1; done
for i in 1 2 3; do launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null && break; [ "$i" = 3 ] && fail "Impossible de démarrer le service Jarvis (launchctl)."; sleep 2; done
launchctl kickstart -k "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true

say_step "Création de l'app Jarvis"
mkdir -p "$HOME/Applications"
# Petit lanceur : relance le service si besoin, puis ouvre Jarvis dans une fenêtre d'app
# Chrome dédiée (profil séparé, micro mémorisé, son autorisé), sinon dans le navigateur par défaut.
cat > "$HOME_J/ouvrir.sh" <<LAUNCH
#!/bin/bash
U="http://127.0.0.1:$PORT"
if ! curl -s -m 2 -o /dev/null "\$U/api/system"; then
  launchctl kickstart "gui/\$(id -u)/$LABEL" >/dev/null 2>&1
  for i in 1 2 3 4 5 6; do curl -s -m 1 -o /dev/null "\$U/api/system" && break; sleep 1; done
fi
if [ -d "/Applications/Google Chrome.app" ] || [ -d "\$HOME/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="\$U" --user-data-dir="\$HOME/.jarvis/chrome" --autoplay-policy=no-user-gesture-required --no-first-run --no-default-browser-check --window-size=1512,945
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  # Même chose avec Edge : fenêtre d'app sans barre d'adresse, profil à part
  open -na "Microsoft Edge" --args --app="\$U" --user-data-dir="\$HOME/.jarvis/edge" --autoplay-policy=no-user-gesture-required --no-first-run --no-default-browser-check --window-size=1512,945
else
  open "\$U"
fi
LAUNCH
chmod +x "$HOME_J/ouvrir.sh"
rm -rf "$APP"
osacompile -o "$APP" -e "do shell script quoted form of (POSIX path of (path to home folder)) & \".jarvis/ouvrir.sh\"" >/dev/null
echo "App créée : $APP (glisse-la dans le Dock)."

say_step "Vérification"
for _ in 1 2 3 4 5 6 7 8 9 10; do curl -s -m 2 -o /dev/null "http://127.0.0.1:$PORT/api/system" && OK=1 && break; sleep 1; done
[ "${OK:-}" = 1 ] || fail "Jarvis ne répond pas. Journal : $HOME_J/jarvis.log"
printf "\n\033[1;32m✓ Jarvis est installé et tourne sur http://127.0.0.1:%s\033[0m\n" "$PORT"
echo "Ouverture…"
open "$APP"
