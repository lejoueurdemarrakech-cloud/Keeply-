import "server-only";
import { read, update } from "@/lib/store";
import { decrypt, encrypt } from "@/lib/secret";
import { CONNECTORS, connectorDef, type ConnectorId } from "./registry";

type Values = Record<string, string>;
type Saved = Partial<Record<ConnectorId, { data: string; updatedAt: string; lastTest?: { ok: boolean; message: string; at: string } }>>;

const KEY = "connectors";

async function savedValues(id: ConnectorId): Promise<Values> {
  const all = await read<Saved>(KEY, {});
  const entry = all[id];
  if (!entry) return {};
  try {
    return JSON.parse(decrypt(entry.data));
  } catch {
    return {};
  }
}

/** Valeurs effectives : la variable d'environnement gagne sur la valeur enregistrée. */
export async function getConfig(id: ConnectorId): Promise<Values> {
  const def = connectorDef(id);
  const saved = await savedValues(id);
  const out: Values = {};
  for (const f of def.fields) {
    const fromEnv = f.env ? process.env[f.env] : undefined;
    const v = (fromEnv ?? saved[f.key] ?? "").toString();
    if (v) out[f.key] = f.key === "privateKey" ? v.replace(/\\n/g, "\n") : v;
  }
  return out;
}

export async function isConfigured(id: ConnectorId): Promise<boolean> {
  const def = connectorDef(id);
  const cfg = await getConfig(id);
  return def.fields.filter((f) => !f.optional).every((f) => !!cfg[f.key]);
}

/** Configuration complète ou null (pour basculer en données de démo). */
export async function configOrNull(id: ConnectorId): Promise<Values | null> {
  return (await isConfigured(id)) ? getConfig(id) : null;
}

export async function saveConfig(id: ConnectorId, values: Values) {
  const def = connectorDef(id);
  const current = await savedValues(id);
  const next: Values = { ...current };
  for (const f of def.fields) {
    const v = values[f.key];
    if (v === undefined) continue;
    // Un champ secret laissé vide garde l'ancienne valeur.
    if ((f.type === "password" || f.type === "textarea") && v.trim() === "" && current[f.key]) continue;
    if (v.trim() === "") delete next[f.key];
    else next[f.key] = v.trim();
  }
  await update<Saved>(KEY, {}, (all) => ({
    ...all,
    [id]: { ...all[id], data: encrypt(JSON.stringify(next)), updatedAt: new Date().toISOString() },
  }));
}

export async function clearConfig(id: ConnectorId) {
  await update<Saved>(KEY, {}, (all) => {
    const copy = { ...all };
    delete copy[id];
    return copy;
  });
}

export async function recordTest(id: ConnectorId, ok: boolean, message: string) {
  await update<Saved>(KEY, {}, (all) => ({
    ...all,
    [id]: { data: all[id]?.data ?? encrypt("{}"), updatedAt: all[id]?.updatedAt ?? new Date().toISOString(), lastTest: { ok, message, at: new Date().toISOString() } },
  }));
}

/** Vue sans secrets pour l'interface. */
export async function publicStatus() {
  const all = await read<Saved>(KEY, {});
  return Promise.all(
    CONNECTORS.map(async (def) => {
      const saved = await savedValues(def.id);
      const fields = def.fields.map((f) => {
        const fromEnv = !!(f.env && process.env[f.env]);
        const value = fromEnv ? "" : saved[f.key] ?? "";
        const secret = f.type === "password" || f.type === "textarea";
        return {
          key: f.key,
          fromEnv,
          filled: fromEnv || !!value,
          value: secret ? "" : value,
          hint: secret && value ? "••••" + value.slice(-4) : "",
        };
      });
      return {
        id: def.id,
        configured: await isConfigured(def.id),
        updatedAt: all[def.id]?.updatedAt ?? null,
        lastTest: all[def.id]?.lastTest ?? null,
        fields,
      };
    }),
  );
}
