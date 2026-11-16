import "server-only";
import { applyOverrides, type PlanOverride, type PlanOverrides } from "@/lib/launch-calendar";
import { BASE_ITEMS } from "@/lib/plan-v7";
import { read, update } from "@/lib/store";

const KEY = "ig-plan-v7";
const ids = new Set(BASE_ITEMS.map((i) => i.id));

export const readOverrides = () => read<PlanOverrides>(KEY, {});
export const livePlan = async () => applyOverrides(await readOverrides());

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;

export async function setOverride(id: string, patch: PlanOverride) {
  if (!ids.has(id)) throw new Error("Élément du plan inconnu.");
  const clean: PlanOverride = {};
  if (patch.date !== undefined) {
    if (!DATE.test(patch.date)) throw new Error("Date invalide.");
    clean.date = patch.date;
  }
  if (patch.heure !== undefined) {
    if (!TIME.test(patch.heure)) throw new Error("Heure invalide.");
    clean.heure = patch.heure;
  }
  if (patch.status !== undefined) {
    if (!["afaire", "pret", "publie"].includes(patch.status)) throw new Error("Statut invalide.");
    clean.status = patch.status;
  }
  if (patch.note !== undefined) clean.note = String(patch.note).slice(0, 2000);
  return update<PlanOverrides>(KEY, {}, (all) => ({ ...all, [id]: { ...all[id], ...clean } }));
}

/** Remet un élément à sa date et son heure de départ (garde le statut et la note). */
export async function resetPosition(id: string) {
  return update<PlanOverrides>(KEY, {}, (all) => {
    const cur = { ...all[id] };
    delete cur.date;
    delete cur.heure;
    return { ...all, [id]: cur };
  });
}
