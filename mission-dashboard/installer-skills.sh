#!/usr/bin/env bash
# Installe les skills de design dans .claude/skills du dépôt (à lancer depuis la racine).
set -e
npx -y skills add Leonxlnx/taste-skill --skill design-taste-frontend --skill high-end-visual-design --skill redesign-existing-projects --skill full-output-enforcement -a claude-code -y
npx -y skills add emilkowalski/skills --skill emil-design-eng --skill apple-design --skill animate --skill improve-animations --skill pick-ui-library -a claude-code -y
echo "Skills installés :" && ls .claude/skills
