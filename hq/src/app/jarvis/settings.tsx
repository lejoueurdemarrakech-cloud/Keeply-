"use client";
import { Play, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Field, Modal, Segmented, Toggle, cx } from "@/components/ui";
import { api } from "@/lib/client";
import type { MemoryFact, Personality } from "@/lib/jarvis";
import { DEFAULT_FEEDS, EDGE_VOICES, FEED_LABELS } from "@/lib/jarvis-shared";
import { bestSystemVoice, type Speaker, type VoiceSettings } from "./voice";

export interface JarvisSettings {
  name: string;
  personality: Personality;
  city: string;
  feeds: string[];
  voice: VoiceSettings;
  muted: boolean;
  alerts: boolean;
  acks: boolean;
  alwaysClaude: boolean;
}

export const DEFAULT_SETTINGS: JarvisSettings = {
  name: "Jarvis",
  personality: "sobre",
  city: "Paris",
  feeds: DEFAULT_FEEDS,
  voice: { mode: "edge", edgeVoice: "fr-FR-RemyMultilingualNeural", systemVoice: "", rate: 5 },
  muted: false,
  alerts: true,
  acks: true,
  alwaysClaude: false,
};

function Row({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[14px] font-semibold">{title}</p>
        {hint && <p className="text-[12.5px] text-ink-3">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Settings({
  open,
  onClose,
  cfg,
  setCfg,
  speaker,
  memory,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  cfg: JarvisSettings;
  setCfg: (c: JarvisSettings) => void;
  speaker: Speaker;
  memory: MemoryFact[];
  onChanged: () => void;
}) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [fact, setFact] = useState("");
  const [city, setCity] = useState(cfg.city);
  const set = (p: Partial<JarvisSettings>) => setCfg({ ...cfg, ...p });
  const setVoice = (p: Partial<VoiceSettings>) => setCfg({ ...cfg, voice: { ...cfg.voice, ...p } });

  useEffect(() => {
    if (typeof speechSynthesis === "undefined") return;
    const load = () => setVoices(speechSynthesis.getVoices().filter((v) => v.lang?.toLowerCase().startsWith("fr")));
    const t = setTimeout(load, 0);
    speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      clearTimeout(t);
      speechSynthesis.removeEventListener("voiceschanged", load);
    };
  }, []);

  const auto = bestSystemVoice(voices);
  const test = () => {
    speaker.unlock();
    speaker.retryEdge();
    void speaker.speak(`Bonjour, je suis ${cfg.name}. Hier, Keeply a fait cent quatorze euros de ventes et tu as un mail urgent.`, cfg.voice);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Réglages de ${cfg.name}`} wide>
      <div className="space-y-6">
        <section>
          <h3 className="font-display mb-3 text-[15px] font-bold">Identité</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom et mot de réveil" hint="En mode mains libres, dis ce nom pour l'appeler.">
              <input className="field" value={cfg.name} maxLength={20} onChange={(e) => set({ name: e.target.value.replace(/[^\p{L}\p{N} -]/gu, "") || "Jarvis" })} />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-semibold text-ink-2">Personnalité</span>
              <Segmented<Personality>
                value={cfg.personality}
                onChange={(v) => set({ personality: v })}
                options={[
                  { value: "sobre", label: "Posé" },
                  { value: "chaleureux", label: "Chaleureux" },
                  { value: "concis", label: "Ultra concis" },
                ]}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-display mb-3 text-[15px] font-bold">Voix</h3>
          <Segmented
            value={cfg.voice.mode}
            onChange={(v) => setVoice({ mode: v })}
            options={[
              { value: "edge", label: "Réaliste (gratuite, en ligne)" },
              { value: "systeme", label: "Voix du Mac (hors ligne)" },
            ]}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {cfg.voice.mode === "edge" ? (
              <Field label="Voix réaliste" hint="Voix neuronales de Microsoft. Si elles ne répondent pas, Jarvis passe tout seul sur la voix du Mac.">
                <select className="field" value={cfg.voice.edgeVoice} onChange={(e) => setVoice({ edgeVoice: e.target.value })}>
                  {Object.entries(EDGE_VOICES).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label="Voix du Mac" hint="Pour une voix plus naturelle : Réglages Système > Accessibilité > Contenu énoncé > Voix, télécharge une voix française « Améliorée » ou « Premium ».">
                <select className="field" value={cfg.voice.systemVoice} onChange={(e) => setVoice({ systemVoice: e.target.value })}>
                  <option value="">Automatique{auto ? ` (${auto.name})` : ""}</option>
                  {voices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label={`Vitesse : ${cfg.voice.rate > 0 ? "+" : ""}${cfg.voice.rate} %`}>
              <input type="range" min={-30} max={40} step={5} value={cfg.voice.rate} onChange={(e) => setVoice({ rate: Number(e.target.value) })} className="mt-2 w-full accent-[var(--violet)]" />
            </Field>
          </div>
          <Button className="mt-3" icon={<Play className="size-4" />} onClick={test}>
            Tester la voix
          </Button>
        </section>

        <section>
          <h3 className="font-display mb-3 text-[15px] font-bold">Infos</h3>
          <Field label="Ville pour la météo">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                set({ city: city.trim() || "Paris" });
              }}
            >
              <input className="field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris, Marrakech…" />
              <Button type="submit">Valider</Button>
            </form>
          </Field>
          <p className="mt-4 mb-2 text-[13px] font-semibold text-ink-2">Rubriques d&apos;actualités</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FEED_LABELS).map(([id, label]) => {
              const on = cfg.feeds.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => set({ feeds: on ? cfg.feeds.filter((f) => f !== id) : [...cfg.feeds, id] })}
                  className={cx("rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors", on ? "bg-violet text-white" : "glass-soft text-ink-2 hover:text-ink")}
                  aria-pressed={on}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="font-display mb-1 text-[15px] font-bold">Comportement</h3>
          <div className="divide-y divide-line">
            <Row title="Alertes vocales" hint="Annonce à voix haute un nouveau mail urgent ou un problème sur l'app.">
              <Toggle checked={cfg.alerts} onChange={(v) => set({ alerts: v })} label="Alertes vocales" />
            </Row>
            <Row title="Petite phrase d'attente" hint="« Un instant » pendant que Claude réfléchit.">
              <Toggle checked={cfg.acks} onChange={(v) => set({ acks: v })} label="Phrase d'attente" />
            </Row>
            <Row title="Tout envoyer à Claude" hint="Désactive les réponses instantanées. Plus lent, mais Claude répond à tout.">
              <Toggle checked={cfg.alwaysClaude} onChange={(v) => set({ alwaysClaude: v })} label="Tout envoyer à Claude" />
            </Row>
          </div>
        </section>

        <section>
          <h3 className="font-display mb-3 text-[15px] font-bold">Mémoire</h3>
          <form
            className="flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!fact.trim()) return;
              await api("POST", "/api/jarvis/memory", { text: fact });
              setFact("");
              onChanged();
            }}
          >
            <input className="field" value={fact} onChange={(e) => setFact(e.target.value)} placeholder="ex. Mon objectif : 50 clients avant mars" />
            <Button type="submit">Retenir</Button>
          </form>
          <ul className="mt-3 divide-y divide-line">
            {memory.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-2 text-[14px]">
                <span className="flex-1">{m.text}</span>
                <button
                  onClick={async () => {
                    await api("DELETE", `/api/jarvis/memory?id=${m.id}`);
                    onChanged();
                  }}
                  className="rounded-lg p-1.5 text-ink-3 hover:bg-bg-2 hover:text-coral"
                  aria-label="Oublier"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {!memory.length && <li className="py-2 text-[13.5px] text-ink-3">Rien pour l&apos;instant. Tu peux aussi dire « souviens-toi que… ».</li>}
          </ul>
          <Button
            variant="danger"
            size="sm"
            className="mt-3"
            onClick={async () => {
              await api("DELETE", "/api/jarvis/history");
              location.reload();
            }}
          >
            Effacer la conversation
          </Button>
        </section>
      </div>
    </Modal>
  );
}
