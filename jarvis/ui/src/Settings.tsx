import { Play, Trash2, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { post } from "./api";
import type { State } from "./types";

const THEMES: { id: string; label: string; a: string; b: string }[] = [
  { id: "arc", label: "Arc", a: "94 231 255", b: "255 179 71" },
  { id: "keeply", label: "Keeply", a: "150 125 255", b: "243 190 114" },
  { id: "mark", label: "Mark", a: "255 82 82", b: "255 200 87" },
  { id: "nebula", label: "Nébuleuse", a: "205 130 255", b: "255 122 217" },
  { id: "mono", label: "Mono", a: "235 238 242", b: "160 170 180" },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "grid", gap: 10, paddingBottom: 18, borderBottom: "1px solid rgb(var(--a) / 0.12)" }}>
      <h3 className="label" style={{ margin: 0, fontSize: 12.5, color: "rgb(var(--a))" }}>{title}</h3>
      {children}
    </section>
  );
}
function Lbl({ text, hint, children }: { text: string; hint?: string; children: ReactNode }) {
  return (
    <label style={{ display: "grid", gap: 5 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>{text}</span>
      {children}
      {hint && <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{hint}</span>}
    </label>
  );
}

export function Settings({ open, onClose, s, onSaved, onTestVoice }: { open: boolean; onClose: () => void; s: State; onSaved: () => void; onTestVoice: () => void }) {
  const c = s.config;
  const [form, setForm] = useState({ name: c.name, owner: c.owner, hqUrl: c.hqUrl, hqToken: "", city: c.city, model: c.model, personality: c.personality, widgetRefreshMin: c.widgetRefreshMin });
  const [macVoices, setMacVoices] = useState<string[]>([]);
  const [fact, setFact] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    fetch("/api/voices")
      .then((r) => r.json())
      .then((d: { mac: string[] }) => setMacVoices(d.mac || []))
      .catch(() => undefined);
  }, [open]);

  if (!open) return null;
  const save = async (patch: Record<string, unknown>, note = "Enregistré.") => {
    try {
      await post("/api/config", patch);
      setMsg(note);
      onSaved();
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }} role="dialog" aria-modal="true" aria-label="Réglages de Jarvis">
      <button onClick={onClose} aria-label="Fermer" style={{ position: "absolute", inset: 0, background: "rgb(0 0 0 / 0.55)", backdropFilter: "blur(3px)" }} />
      <div className="panel rise" style={{ position: "relative", width: "min(520px, 100%)", height: "100%", overflowY: "auto", padding: "20px 22px 40px", display: "grid", gap: 18, alignContent: "start" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="hud-font glow-text" style={{ fontSize: 22, fontWeight: 700, letterSpacing: ".12em" }}>RÉGLAGES</div>
          <button onClick={onClose} className="btn ghost" aria-label="Fermer">
            <X size={16} />
          </button>
        </div>
        {msg && <div className="mono" style={{ fontSize: 12, color: "rgb(var(--ok))" }}>{msg}</div>}

        <Section title="Thème">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => post("/api/ui", { theme: t.id }).then(onSaved)} style={{ display: "grid", gap: 6, justifyItems: "center", padding: 8, borderRadius: 8, border: `1px solid ${s.layout.theme === t.id ? `rgb(${t.a})` : "rgb(var(--a) / 0.15)"}`, background: s.layout.theme === t.id ? `rgb(${t.a} / 0.12)` : "transparent" }} aria-pressed={s.layout.theme === t.id}>
                <span style={{ width: 30, height: 30, borderRadius: 99, background: `radial-gradient(circle at 35% 35%, white, rgb(${t.a}) 45%, rgb(${t.b} / 0.6))`, boxShadow: `0 0 14px rgb(${t.a} / 0.7)` }} />
                <span style={{ fontSize: 11.5, fontFamily: "Rajdhani", fontWeight: 600 }}>{t.label}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["keeply", "Vue Keeply"],
              ["perso", "Vue perso"],
              ["focus", "Focus"],
            ].map(([id, l]) => (
              <button key={id} className="chip" onClick={() => post("/api/ui", { preset: id }).then(onSaved)} style={s.layout.preset === id ? { borderColor: "rgb(var(--a))", color: "var(--ink)" } : undefined}>
                {l}
              </button>
            ))}
            <button className="chip" onClick={() => post("/api/ui", { reset: true }).then(onSaved)}>
              Par défaut
            </button>
          </div>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Tout se change aussi à la voix : « mets le thème rouge », « enlève les actus », « ajoute un widget avec les matchs de Ligue 1 ».</span>
        </Section>

        <Section title="Identité">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Lbl text="Nom et mot de réveil">
              <input className="field" value={form.name} maxLength={20} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Lbl>
            <Lbl text="Ton prénom">
              <input className="field" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
            </Lbl>
          </div>
          <Lbl text="Personnalité">
            <select className="field" value={form.personality} onChange={(e) => setForm({ ...form, personality: e.target.value })}>
              <option value="sobre">Posé, classe (majordome)</option>
              <option value="chaleureux">Chaleureux, énergique</option>
              <option value="concis">Ultra concis</option>
            </select>
          </Lbl>
          <button className="btn" onClick={() => save({ name: form.name, owner: form.owner, personality: form.personality })}>
            Enregistrer
          </button>
        </Section>

        <Section title="Keeply HQ">
          <Lbl text="Adresse de HQ" hint="Ex. https://keeply-hq.vercel.app">
            <input className="field" value={form.hqUrl} onChange={(e) => setForm({ ...form, hqUrl: e.target.value })} placeholder="https://…" />
          </Lbl>
          <Lbl text="Jeton" hint={`Le même que le pont (INGEST_TOKEN). ${c.hqToken ? `Actuel : ${c.hqToken}` : "Aucun jeton enregistré."}`}>
            <input className="field" type="password" value={form.hqToken} onChange={(e) => setForm({ ...form, hqToken: e.target.value })} placeholder="Laisser vide pour garder l'actuel" autoComplete="off" />
          </Lbl>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button className="btn" onClick={() => save({ hqUrl: form.hqUrl, ...(form.hqToken ? { hqToken: form.hqToken } : {}) }, "Connexion enregistrée.").then(() => fetch("/api/state?force=1").then(onSaved))}>
              Enregistrer et tester
            </button>
            <span style={{ fontSize: 12.5, display: "flex", alignItems: "center", gap: 6, color: s.hq.ok ? "rgb(var(--ok))" : "rgb(var(--warn))" }}>
              <span className={`dot ${s.hq.ok ? "" : "warn"}`} /> {s.hq.ok ? "Connecté" : s.hq.error || "Non connecté"}
            </span>
          </div>
        </Section>

        <Section title="Intelligence">
          <Lbl text="Modèle Claude" hint="Haiku : le plus rapide. Sonnet : le meilleur équilibre. Opus : le plus fort, plus lent.">
            <select className="field" value={form.model} onChange={(e) => {
              setForm({ ...form, model: e.target.value });
              void save({ model: e.target.value });
            }}>
              <option value="haiku">Haiku (rapide)</option>
              <option value="sonnet">Sonnet (recommandé)</option>
              <option value="opus">Opus (puissant)</option>
            </select>
          </Lbl>
          <span style={{ fontSize: 12, color: "var(--ink-3)" }}>Claude Code : {s.claude ?? "introuvable sur ce Mac"}. Il peut chercher sur le web, mais n&apos;a accès ni à tes fichiers ni au terminal.</span>
        </Section>

        <Section title="Voix">
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["edge", "Réaliste (en ligne)"],
              ["mac", "Voix du Mac"],
            ].map(([id, l]) => (
              <button key={id} className="chip" onClick={() => save({ voice: { mode: id } })} style={c.voice.mode === id ? { borderColor: "rgb(var(--a))", color: "var(--ink)", background: "rgb(var(--a) / 0.15)" } : undefined}>
                {l}
              </button>
            ))}
          </div>
          {c.voice.mode === "edge" ? (
            <Lbl text="Voix réaliste" hint="Voix neuronales gratuites de Microsoft. Si elles ne répondent pas, Jarvis passe tout seul sur la voix du Mac.">
              <select className="field" value={c.voice.edgeVoice} onChange={(e) => save({ voice: { edgeVoice: e.target.value } })}>
                {Object.entries(c.voices).map(([id, l]) => (
                  <option key={id} value={id}>
                    {l}
                  </option>
                ))}
              </select>
            </Lbl>
          ) : (
            <Lbl text="Voix du Mac" hint="Pour plus de naturel : Réglages Système > Accessibilité > Contenu énoncé > Voix du système > Gérer les voix, et télécharge une voix française « Premium ».">
              <select className="field" value={c.voice.macVoice} onChange={(e) => save({ voice: { macVoice: e.target.value } })}>
                <option value="">Voix par défaut</option>
                {macVoices.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Lbl>
          )}
          <Lbl text={`Vitesse : ${c.voice.rate > 0 ? "+" : ""}${c.voice.rate} %`}>
            <input type="range" min={-30} max={40} step={5} value={c.voice.rate} onChange={(e) => save({ voice: { rate: Number(e.target.value) } })} style={{ accentColor: "rgb(var(--a))" }} />
          </Lbl>
          <button className="btn" onClick={onTestVoice}>
            <Play size={14} /> Tester la voix
          </button>
        </Section>

        <Section title="Infos">
          <Lbl text="Ville pour la météo">
            <div style={{ display: "flex", gap: 8 }}>
              <input className="field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <button className="btn" onClick={() => save({ city: form.city })}>
                OK
              </button>
            </div>
          </Lbl>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}>Rubriques d&apos;actualités</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(s.feeds).map(([id, l]) => {
              const on = c.feeds.includes(id);
              return (
                <button key={id} className="chip" aria-pressed={on} onClick={() => save({ feeds: on ? c.feeds.filter((f) => f !== id) : [...c.feeds, id] })} style={on ? { borderColor: "rgb(var(--a))", color: "var(--ink)", background: "rgb(var(--a) / 0.15)" } : undefined}>
                  {l}
                </button>
              );
            })}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
            <input type="checkbox" checked={c.alerts} onChange={(e) => save({ alerts: e.target.checked })} style={{ accentColor: "rgb(var(--a))", width: 16, height: 16 }} />
            Alertes vocales (nouveau mail urgent, panne de l&apos;app)
          </label>
          <Lbl text={`Mise à jour des widgets générés : toutes les ${form.widgetRefreshMin} min`} hint="Chaque mise à jour utilise une demande à Claude.">
            <input type="range" min={15} max={240} step={15} value={form.widgetRefreshMin} onChange={(e) => setForm({ ...form, widgetRefreshMin: Number(e.target.value) })} onMouseUp={() => save({ widgetRefreshMin: form.widgetRefreshMin })} onTouchEnd={() => save({ widgetRefreshMin: form.widgetRefreshMin })} style={{ accentColor: "rgb(var(--a))" }} />
          </Lbl>
        </Section>

        <Section title="Mémoire">
          <form
            style={{ display: "flex", gap: 8 }}
            onSubmit={async (e) => {
              e.preventDefault();
              if (!fact.trim()) return;
              await post("/api/memory", { text: fact });
              setFact("");
              onSaved();
            }}
          >
            <input className="field" value={fact} onChange={(e) => setFact(e.target.value)} placeholder="Ex. Mon équipe de foot : le PSG" />
            <button className="btn" type="submit">
              Retenir
            </button>
          </form>
          <div style={{ display: "grid", gap: 4 }}>
            {s.memory.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "4px 0" }}>
                <span style={{ flex: 1 }}>{m.text}</span>
                <button onClick={() => post(`/api/memory?id=${m.id}`, undefined, "DELETE").then(onSaved)} aria-label="Oublier" style={{ color: "var(--ink-3)" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {!s.memory.length && <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>Rien pour l&apos;instant. Tu peux dire « souviens-toi que… ».</span>}
          </div>
        </Section>
      </div>
    </div>
  );
}
