/* Constantes de Jarvis partagées entre le serveur et le navigateur. */

export const EDGE_VOICES = {
  "fr-FR-RemyMultilingualNeural": "Rémy (homme, naturel)",
  "fr-FR-HenriNeural": "Henri (homme)",
  "fr-FR-VivienneMultilingualNeural": "Vivienne (femme, naturelle)",
  "fr-FR-DeniseNeural": "Denise (femme)",
} as const;
export type EdgeVoice = keyof typeof EDGE_VOICES;

export const FEED_LABELS: Record<string, string> = {
  une: "À la une",
  maroc: "Maroc",
  tech: "Tech",
  apple: "Apple",
  resto: "Restauration",
  fidelite: "Fidélité",
  startups: "Startups",
};
export const DEFAULT_FEEDS = ["une", "tech", "resto", "fidelite"];
