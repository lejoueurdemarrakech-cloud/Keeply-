import { load, save, uid } from "./store.js";

/*
 * Disposition de l'écran : thème + widgets à gauche et à droite de l'orbe.
 * Types de widgets :
 *  - keeply.kpis | keeply.tasks | keeply.mails | keeply.health | keeply.social : données de Keeply HQ
 *  - weather | news | system | clock : infos locales
 *  - custom : contenu généré par Claude (matchs, cours, recettes…), rafraîchi à la demande
 */

export const THEMES = ["arc", "keeply", "mark", "nebula", "mono"];
export const BUILTIN = ["keeply.kpis", "keeply.tasks", "keeply.mails", "keeply.health", "keeply.social", "weather", "news", "system", "clock"];

const W = (kind, title, side, extra = {}) => ({ id: kind.replace(".", "-"), kind, title, side, ...extra });

export const PRESETS = {
  keeply: [W("keeply.kpis", "Keeply", "left"), W("keeply.tasks", "Tâches", "left"), W("keeply.mails", "Mails urgents", "left"), W("keeply.health", "Santé de l'app", "right"), W("keeply.social", "Réseaux", "right"), W("weather", "Météo", "right"), W("news", "Actualités", "right")],
  perso: [W("clock", "Horloge", "left"), W("weather", "Météo", "left"), W("system", "Système", "left"), W("news", "Actualités", "right"), W("keeply.tasks", "Tâches", "right")],
  focus: [W("keeply.tasks", "Tâches", "left"), W("weather", "Météo", "right")],
};

export const DEFAULT_LAYOUT = { theme: "arc", preset: "keeply", widgets: PRESETS.keeply };

export const getLayout = () => {
  const l = load("layout", DEFAULT_LAYOUT);
  return { ...DEFAULT_LAYOUT, ...l, widgets: Array.isArray(l.widgets) ? l.widgets : DEFAULT_LAYOUT.widgets };
};

const clean = (s, n = 60) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, n);

/**
 * Applique une commande d'interface (venue de Claude ou d'une phrase reconnue).
 * Formes acceptées :
 *  { theme } | { preset } | { remove: id|titre } | { add: {...} } | { move: id, side } | { reset: true } | { clear: true }
 * Renvoie la nouvelle disposition, ou null si rien n'a changé.
 */
export function applyUi(cmd) {
  if (!cmd || typeof cmd !== "object") return null;
  const l = getLayout();
  let changed = false;
  const find = (ref) => {
    const r = clean(ref).toLowerCase();
    return l.widgets.find((w) => w.id === r || w.kind === r || w.title.toLowerCase() === r || w.title.toLowerCase().includes(r) || r.includes(w.title.toLowerCase()));
  };

  if (cmd.reset) {
    Object.assign(l, DEFAULT_LAYOUT);
    changed = true;
  }
  if (cmd.theme && THEMES.includes(cmd.theme)) {
    l.theme = cmd.theme;
    changed = true;
  }
  if (cmd.preset && PRESETS[cmd.preset]) {
    const custom = l.widgets.filter((w) => w.kind === "custom");
    l.preset = cmd.preset;
    l.widgets = [...PRESETS[cmd.preset], ...(cmd.preset === "focus" ? [] : custom)];
    changed = true;
  }
  if (cmd.clear) {
    l.widgets = [];
    changed = true;
  }
  for (const ref of [].concat(cmd.remove ?? [])) {
    const w = find(ref);
    if (w) {
      l.widgets = l.widgets.filter((x) => x !== w);
      changed = true;
    }
  }
  if (cmd.move) {
    const w = find(cmd.move);
    if (w && (cmd.side === "left" || cmd.side === "right")) {
      w.side = cmd.side;
      changed = true;
    }
  }
  for (const a of [].concat(cmd.add ?? [])) {
    if (!a || typeof a !== "object") continue;
    const side = a.side === "left" ? "left" : a.side === "right" ? "right" : l.widgets.filter((w) => w.side === "left").length <= l.widgets.filter((w) => w.side === "right").length ? "left" : "right";
    if (BUILTIN.includes(a.kind)) {
      if (!l.widgets.some((w) => w.kind === a.kind)) {
        l.widgets.push({ id: a.kind.replace(".", "-"), kind: a.kind, title: clean(a.title) || a.kind, side });
        changed = true;
      }
      continue;
    }
    const prompt = clean(a.prompt, 400);
    if (!prompt) continue;
    l.widgets.push({
      id: uid("w"),
      kind: "custom",
      title: clean(a.title) || "Widget",
      side,
      prompt,
      view: a.view && typeof a.view === "object" ? a.view : null,
      updatedAt: a.view ? new Date().toISOString() : null,
    });
    changed = true;
  }
  if (!changed) return null;
  l.widgets = l.widgets.slice(0, 12);
  return save("layout", l);
}

export function setWidgetView(id, view) {
  const l = getLayout();
  const w = l.widgets.find((x) => x.id === id);
  if (!w) return null;
  w.view = view;
  w.updatedAt = new Date().toISOString();
  return save("layout", l);
}

export function saveLayout(next) {
  const l = getLayout();
  if (Array.isArray(next.widgets)) l.widgets = next.widgets.filter((w) => w && w.id && w.kind).slice(0, 12);
  if (THEMES.includes(next.theme)) l.theme = next.theme;
  return save("layout", l);
}
