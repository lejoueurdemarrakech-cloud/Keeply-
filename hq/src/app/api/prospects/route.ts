import { route } from "@/lib/http";
import { COUNTRIES, TYPES, clearDemoProspects, listProspects, sentToday } from "@/lib/prospects";
import { outreachConfig } from "@/lib/mail";
import { configOrNull } from "@/lib/connectors/config";
import { getSettings } from "@/lib/settings";

export const GET = route(async () => {
  const [prospects, sent, sender, places, s] = await Promise.all([listProspects(), sentToday(), outreachConfig(), configOrNull("places"), getSettings()]);
  return {
    prospects,
    sentToday: sent,
    dailyLimit: s.prospecting.dailyLimit,
    sender: sender ? sender.user : null,
    searchSource: places ? "Google Places" : "OpenStreetMap",
    countries: COUNTRIES,
    types: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.label])),
  };
});

export const DELETE = route(async () => {
  await clearDemoProspects();
  return { ok: true };
});
