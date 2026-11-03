import { load, save } from "./store.js";

export const EDGE_VOICES = {
  "fr-FR-RemyMultilingualNeural": "Rémy (homme, naturel)",
  "fr-FR-HenriNeural": "Henri (homme)",
  "fr-FR-VivienneMultilingualNeural": "Vivienne (femme, naturelle)",
  "fr-FR-DeniseNeural": "Denise (femme)",
};

export const DEFAULT_CONFIG = {
  name: "Jarvis",
  owner: "",
  port: 4777,
  hqUrl: "",
  hqToken: "",
  claudeBin: "claude",
  model: "sonnet",
  personality: "sobre",
  city: "Paris",
  feeds: ["une", "tech", "resto", "fidelite"],
  voice: { mode: "edge", edgeVoice: "fr-FR-RemyMultilingualNeural", macVoice: "", rate: 5 },
  muted: false,
  alerts: true,
  widgetRefreshMin: 60,
};

export function getConfig() {
  const c = load("config", DEFAULT_CONFIG);
  return { ...DEFAULT_CONFIG, ...c, voice: { ...DEFAULT_CONFIG.voice, ...(c.voice || {}) } };
}

/** Champs modifiables depuis l'interface (jamais le binaire ni le port). */
const EDITABLE = ["name", "owner", "hqUrl", "hqToken", "model", "personality", "city", "feeds", "voice", "muted", "alerts", "widgetRefreshMin"];

export function updateConfig(patch) {
  const cur = getConfig();
  for (const k of EDITABLE) if (patch[k] !== undefined) cur[k] = k === "voice" ? { ...cur.voice, ...patch.voice } : patch[k];
  cur.name = String(cur.name || "Jarvis").replace(/[^\p{L}\p{N} -]/gu, "").slice(0, 20) || "Jarvis";
  cur.hqUrl = String(cur.hqUrl || "").trim().replace(/\/+$/, "");
  cur.model = ["haiku", "sonnet", "opus"].includes(cur.model) ? cur.model : "sonnet";
  cur.widgetRefreshMin = Math.max(15, Math.min(720, Number(cur.widgetRefreshMin) || 60));
  return save("config", cur);
}

/** Ce que l'interface peut voir (le jeton HQ n'est jamais renvoyé en clair). */
export function publicConfig() {
  const c = getConfig();
  return { ...c, hqToken: c.hqToken ? "••••" + c.hqToken.slice(-4) : "", claudeBin: undefined, voices: EDGE_VOICES };
}
