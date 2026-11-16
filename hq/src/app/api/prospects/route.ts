import { route } from "@/lib/http";
import { COUNTRIES, LIVE_COUNTRIES, PRIORITY_COUNTRIES, TYPES, clearDemoProspects, listProspects, sentToday } from "@/lib/prospects";
import { outreachConfig } from "@/lib/mail";
import { configOrNull } from "@/lib/connectors/config";
import { getSettings } from "@/lib/settings";
import { androidWaitlist } from "@/lib/android";

export const GET = route(async () => {
  const [prospects, sent, sender, places, s, android, apollo] = await Promise.all([listProspects(), sentToday(), outreachConfig(), configOrNull("places"), getSettings(), androidWaitlist(), configOrNull("apollo")]);
  return {
    prospects,
    sentToday: sent,
    dailyLimit: s.prospecting.dailyLimit,
    sender: sender ? sender.user : null,
    searchSource: places ? "Google Places" : "OpenStreetMap",
    countries: COUNTRIES,
    priorityCountries: PRIORITY_COUNTRIES,
    liveCountries: LIVE_COUNTRIES,
    apollo: !!apollo?.apiKey,
    android,
    types: Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [k, v.label])),
  };
});

export const DELETE = route(async () => {
  await clearDemoProspects();
  return { ok: true };
});
