import "server-only";
import { read, update, uid } from "@/lib/store";
import type { Settings } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  ownerName: "",
  businessName: "Keeply",
  ownerEmail: "",
  signature: "L'équipe Keeply",
  monthlyGoal: 3500,
  siteUrl: "",
  appStoreUrl: "",
  playStoreUrl: "",
  vipSenders: [],
  urgentKeywords: ["urgent", "bug", "bloqué", "ne fonctionne", "marche pas", "remboursement", "résilier", "paiement", "facture", "plainte", "avocat"],
  autoReply: {
    enabled: false,
    mode: "toujours",
    hours: { start: "09:00", end: "18:00", days: [1, 2, 3, 4, 5] },
    subjectPrefix: "Re : ",
    body:
      "Bonjour {prenom},\n\nNous avons bien reçu votre message au sujet de « {sujet} » et nous vous en remercions.\nIl est entre de bonnes mains : nous revenons vers vous sous 24 h ouvrées.\n\nSi c'est urgent, répondez simplement à ce mail en ajoutant « URGENT » dans l'objet.\n\nBelle journée,\n{signature}",
    cooldownDays: 3,
    skipCategories: ["newsletter", "notification", "store"],
  },
  health: {
    dailyHour: 7,
    alertEmail: true,
    createTasks: true,
    checks: [],
  },
  prospecting: {
    pitch:
      "Keeply crée la carte de fidélité de l'établissement dans Apple Wallet et Google Wallet : les clients l'ajoutent en scannant un QR code, sans application à installer. Tampons ou points, validation en caisse en 2 secondes, rappels automatiques pour faire revenir les clients.",
    offer: "14 jours gratuits, sans engagement, mise en place en 10 minutes.",
    dailyLimit: 25,
    followUpDays: [3, 7],
    senderName: "",
    calendarLink: "",
    optOutLine: "Si ce n'est pas pour vous, répondez « non merci » et je ne vous écrirai plus.",
    sendWindow: { start: "09:30", end: "11:30" },
  },
  instagram: {
    handle: "keeply.app",
    pillars: ["Astuces fidélité pour restaurateurs", "Coulisses de Keeply", "Témoignages clients", "Démo produit", "Humour café & resto"],
    defaultHashtags: "#fidelisation #restaurant #cafe #commercelocal #cartedefidelite #applewallet",
  },
};

export async function getSettings(): Promise<Settings> {
  const saved = await read<Partial<Settings>>("settings", {});
  return deepMerge(DEFAULT_SETTINGS, saved) as Settings;
}

export async function saveSettings(patch: Partial<Settings>) {
  return update<Partial<Settings>>("settings", {}, (cur) => deepMerge(cur, patch) as Partial<Settings>);
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (Array.isArray(patch)) return patch;
  if (patch && typeof patch === "object" && base && typeof base === "object" && !Array.isArray(base)) {
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = deepMerge((base as Record<string, unknown>)[k], v);
    }
    return out;
  }
  return patch === undefined ? base : patch;
}

export interface ActivityEntry {
  id: string;
  at: string;
  area: "ventes" | "instagram" | "mails" | "sante" | "prospection" | "systeme" | "taches";
  message: string;
  level?: "info" | "succes" | "erreur";
}

export async function logActivity(area: ActivityEntry["area"], message: string, level: ActivityEntry["level"] = "info") {
  await update<ActivityEntry[]>("activity", [], (list) =>
    [{ id: uid("a"), at: new Date().toISOString(), area, message, level }, ...list].slice(0, 300),
  );
}
