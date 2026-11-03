#!/usr/bin/env bash
# Retire Jarvis du démarrage automatique et supprime l'app. Garde ~/.jarvis (réglages, mémoire) sauf si --tout.
set -euo pipefail
LABEL="app.keeply.jarvis"
launchctl bootout "gui/$(id -u)/$LABEL" >/dev/null 2>&1 || true
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
rm -rf "$HOME/Applications/Jarvis.app"
if [ "${1:-}" = "--tout" ]; then rm -rf "$HOME/.jarvis"; echo "Réglages et mémoire supprimés."; fi
echo "Jarvis est désinstallé."
