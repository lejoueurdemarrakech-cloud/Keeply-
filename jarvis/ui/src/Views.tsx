import { Check, CloudRain, ExternalLink, Music2, ShieldAlert, Terminal, X } from "lucide-react";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { State, View } from "./types";
import { Ring, Spark, ViewRenderer } from "./ViewRenderer";

/* ============================================================
   Les écrans plein cadre qui s'ouvrent depuis une étoile.
   Chaque type de réponse a son affichage : météo, matchs, actus,
   crypto, change, minuteur, musique, Keeply, prospection,
   lancement, agent (journal façon terminal). Le reste (réponses
   de Claude) passe par le rendu universel en blocs.
   ============================================================ */

export type Rich = View & { kind?: string; [k: string]: unknown };
export interface AgentLog {
  task: string;
  steps: { tool: string; detail: string; ok?: boolean; out?: string }[];
  approval: { tool: string; detail: string; risk?: string }[] | null;
  done: boolean;
}

const st = (i: number): CSSProperties => ({ animationDelay: `${Math.min(i, 14) * 45}ms` });
const eur = (n?: number) => `${Math.round(Number(n) || 0).toLocaleString("fr-FR")} €`;
const ICON: Record<string, string> = { "ciel dégagé": "☀️", "quelques nuages": "🌤️", couvert: "☁️", brouillard: "🌫️", bruine: "🌦️", pluie: "🌧️", neige: "🌨️", orage: "⛈️" };

function Weather({ v }: { v: Rich }) {
  const w = v.weather as { city: string; temp: number; feels: number; wind: number; humidity: number; label: string; hours: { h: number; temp: number; rain: number }[]; days: { date: string; min: number; max: number; rain: number; label: string }[] };
  const max = Math.max(...w.hours.map((h) => h.temp)), min = Math.min(...w.hours.map((h) => h.temp));
  return (
    <div className="v-weather">
      <div className="wx-hero in" style={st(0)}>
        <span className="wx-ico">{ICON[w.label] ?? "🌡️"}</span>
        <span className="wx-temp">{w.temp}°</span>
        <div>
          <p className="wx-label">{w.label}</p>
          <p className="muted">Ressenti {w.feels}° · Vent {w.wind} km/h · Humidité {w.humidity} %</p>
        </div>
      </div>
      <div className="wx-hours in" style={st(1)}>
        {w.hours.map((h, i) => (
          <div key={i} className="wx-h">
            <span className="muted">{h.h} h</span>
            <div className="wx-bar"><i style={{ height: `${20 + ((h.temp - min) / Math.max(1, max - min)) * 70}%` }} /></div>
            <b>{h.temp}°</b>
            {h.rain > 20 && <span className="wx-rain"><CloudRain size={11} /> {h.rain} %</span>}
          </div>
        ))}
      </div>
      <div className="wx-days">
        {w.days.map((d, i) => (
          <div key={d.date} className="glass wx-day in" style={st(2 + i)}>
            <span className="muted">{i === 0 ? "Aujourd'hui" : new Date(d.date + "T12:00").toLocaleDateString("fr-FR", { weekday: "long" })}</span>
            <span className="wx-dico">{ICON[d.label] ?? "🌡️"}</span>
            <b>{d.min}° / {d.max}°</b>
            <span className="muted">{d.label}{d.rain > 20 ? ` · pluie ${d.rain} %` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type M = { league: string; time: string; state: string; status: string; home: { name: string; logo?: string; score?: string | null }; away: { name: string; logo?: string; score?: string | null } };
function Matches({ v }: { v: Rich }) {
  const list = (v.matches as M[]) || [];
  if (!list.length) return <p className="empty">Aucun match.</p>;
  const groups = list.reduce<Record<string, M[]>>((a, m) => ((a[m.league] ??= []).push(m), a), {});
  let i = 0;
  return (
    <div className="v-matches">
      {Object.entries(groups).map(([league, ms]) => (
        <section key={league}>
          <h4 className="label">{league}</h4>
          <div className="m-grid">
            {ms.map((m) => (
              <div key={m.home.name + m.away.name} className={`glass match in ${m.state}`} style={st(i++)}>
                <Team t={m.home} />
                <div className="m-mid">
                  {m.state === "pre" ? <b className="m-time">{m.time}</b> : <b className="m-score">{m.home.score} <i>–</i> {m.away.score}</b>}
                  <span className={`m-st ${m.state}`}>{m.state === "in" ? `● ${m.status}` : m.status}</span>
                </div>
                <Team t={m.away} right />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
const Team = ({ t, right }: { t: M["home"]; right?: boolean }) => (
  <div className={`m-team ${right ? "r" : ""}`}>
    {t.logo ? <img src={t.logo} alt="" /> : <span className="m-nologo" />}
    <span>{t.name}</span>
  </div>
);

function News({ v }: { v: Rich }) {
  const items = (v.items as { title: string; source: string; link: string; date: string }[]) || [];
  const [hero, ...rest] = items;
  if (!hero) return <p className="empty">Aucune actu.</p>;
  const clean = (t: string) => t.replace(/ - [^-]+$/, "");
  return (
    <div className="v-news">
      <a className="glass n-hero in" href={hero.link} target="_blank" rel="noreferrer" style={st(0)}>
        <span className="label">{hero.source}</span>
        <h3>{clean(hero.title)}</h3>
        <span className="muted">{ago(hero.date)}</span>
      </a>
      <div className="n-grid">
        {rest.map((n, i) => (
          <a key={n.link} className="glass n-card in" href={n.link} target="_blank" rel="noreferrer" style={st(i + 1)}>
            <span className="label">{n.source}</span>
            <p>{clean(n.title)}</p>
            <span className="muted">{ago(n.date)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
function ago(d: string) {
  const m = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  return !isFinite(m) ? "" : m < 60 ? `il y a ${Math.max(1, m)} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function Crypto({ v }: { v: Rich }) {
  const items = (v.items as { name: string; eur: number; usd: number; change: number }[]) || [];
  return (
    <div className="v-cards">
      {items.map((c, i) => (
        <div key={c.name} className="glass big-card in" style={st(i)}>
          <span className="label">{c.name}</span>
          <b className="big-num">{Math.round(c.eur).toLocaleString("fr-FR")} €</b>
          <span className={c.change >= 0 ? "up" : "down"}>{c.change >= 0 ? "▲" : "▼"} {Math.abs(c.change).toFixed(2)} % · 24 h</span>
          <span className="muted">{Math.round(c.usd).toLocaleString("fr-FR")} $</span>
        </div>
      ))}
    </div>
  );
}

function Fx({ v }: { v: Rich }) {
  const main = v.main as { code: string; value: number };
  const items = (v.items as { code: string; value: number }[]) || [];
  return (
    <div className="v-fx">
      <div className="glass big-card in" style={st(0)}>
        <span className="label">{String(v.amount)} {String(v.from)} =</span>
        <b className="big-num">{main.value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {main.code}</b>
      </div>
      <div className="v-cards">
        {items.filter((x) => x.code !== main.code).map((x, i) => (
          <div key={x.code} className="glass mini-card in" style={st(i + 1)}>
            <span className="label">{x.code}</span>
            <b>{x.value.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimerFace({ endsAt, total, small }: { endsAt: number; total: number; small?: boolean }) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 250);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, endsAt - Date.now());
  const s = Math.ceil(left / 1000);
  const txt = `${s >= 3600 ? Math.floor(s / 3600) + ":" : ""}${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <Ring value={1 - left / total} size={small ? 46 : 300} stroke={small ? 4 : 10}>
      <span className={small ? "timer-s" : "timer-big"}>{left ? txt : "Terminé"}</span>
    </Ring>
  );
}

function KeeplyView({ s }: { s: State }) {
  const t = s.hq.today;
  if (!s.hq.ok || !t) return <p className="empty">Keeply HQ ne répond pas : {s.hq.error}</p>;
  const pct = t.goal.revenue / Math.max(1, t.goal.target);
  const ads = s.hq.ads;
  return (
    <div className="v-keeply">
      <div className="glass k-hero in" style={st(0)}>
        <Ring value={pct} size={150} stroke={9}>
          <b className="k-pct">{Math.round(pct * 100)} %</b>
        </Ring>
        <div>
          <span className="label">Ce mois-ci</span>
          <b className="big-num">{eur(t.goal.revenue)}</b>
          <p className="muted">Objectif {eur(t.goal.target)} · projection {eur(t.goal.projection)} · {t.goal.daysLeft} jours restants</p>
          {t.sales?.series?.length ? <Spark values={t.sales.series.map((x) => x.total)} height={52} /> : null}
        </div>
      </div>
      <div className="v-cards">
        {[
          ["Ventes hier", eur(t.sales?.yesterday)],
          ["MRR", t.sales?.mrr != null ? eur(t.sales.mrr) : "—"],
          ["Téléchargements", String(t.sales?.downloads ?? "—")],
          ["Instagram", t.instagram ? `${t.instagram.followers} abonnés` : "—"],
          ["Meta Ads 7 j", ads ? `${Math.round(ads.spend)} € · ${ads.results} rés.` : "—"],
          ["Santé de l'app", t.health ? `${t.health.score}/100` : "en pause"],
        ].map(([l, val], i) => (
          <div key={l} className="glass mini-card in" style={st(i + 1)}>
            <span className="label">{l}</span>
            <b>{val}</b>
          </div>
        ))}
      </div>
      <div className="k-cols">
        <Panel title="Tâches" i={7}>
          {t.tasks.length ? t.tasks.map((x) => <Row key={x.id} hot={x.priority === "haute"}>{x.title}</Row>) : <p className="muted">Aucune tâche.</p>}
        </Panel>
        <Panel title={`Mails urgents · ${t.mails?.urgentCount ?? 0}`} i={8}>
          {t.mails?.urgent?.length ? t.mails.urgent.map((m) => <Row key={m.id}>{m.from.name || m.from.email} · {m.subject}</Row>) : <p className="muted">Rien d'urgent.</p>}
        </Panel>
      </div>
    </div>
  );
}

function ProspectionView({ s }: { s: State }) {
  const p = s.hq.extra?.prospection;
  if (!p) return <p className="empty">La prospection n'est pas disponible.</p>;
  const FL: Record<string, string> = { FR: "🇫🇷", MA: "🇲🇦", BE: "🇧🇪", CH: "🇨🇭", LU: "🇱🇺", CA: "🇨🇦", MC: "🇲🇨" };
  const max = Math.max(1, ...Object.values(p.byCountry));
  return (
    <div className="v-keeply">
      <div className="v-cards">
        {[["Établissements", p.total], ["Contactés", p.contacted], ["Intéressés", p.interested], ["Clients", p.clients], ["Relances dues", p.followUps]].map(([l, v], i) => (
          <div key={l} className="glass mini-card in" style={st(i)}>
            <span className="label">{l}</span>
            <b className="big-num sm">{v}</b>
          </div>
        ))}
      </div>
      <Panel title="Par pays" i={6}>
        {Object.entries(p.byCountry).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
          <div key={c} className="bar-row">
            <span>{FL[c] ?? c} {c}</span>
            <div className="bar"><i style={{ width: `${(n / max) * 100}%` }} /></div>
            <b>{n}</b>
          </div>
        ))}
      </Panel>
    </div>
  );
}

function PlanView({ s }: { s: State }) {
  const x = s.hq.extra;
  const days = x ? Math.ceil((new Date(x.launchDate + "T00:00:00").getTime() - Date.now()) / 864e5) : 0;
  return (
    <div className="v-keeply">
      <div className="glass k-hero in" style={st(0)}>
        <b className="big-num">{days > 0 ? `J-${days}` : "C'est parti"}</b>
        <div>
          <span className="label">Lancement Instagram</span>
          <p className="muted">dimanche 15 novembre · {x?.android ?? 0} commerçants sur la liste Android</p>
        </div>
      </div>
      <div className="timeline">
        {(x?.plan || []).map((i, k) => {
          const d = Math.round((new Date(i.date + "T12:00:00").getTime() - Date.now()) / 864e5);
          return (
            <div key={i.id} className={`glass tl-item in ${d <= 2 ? "hot" : ""}`} style={st(k + 1)}>
              <span className="tl-date">{new Date(i.date + "T12:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })} · {i.heure}</span>
              <b>{i.titre}</b>
              <span className="muted">{i.kind === "post" ? "Post" : "Stories"} · {i.format}{d <= 2 ? " · à préparer" : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgentView({ log, onApprove }: { log: AgentLog; onApprove: (ok: boolean) => void }) {
  return (
    <div className="v-agent">
      <div className="term glass in" style={st(0)}>
        <div className="term-head"><Terminal size={14} /> <span>{log.task}</span>{!log.done && <span className="pulse-dot" />}</div>
        <div className="term-body">
          {log.steps.map((s, i) => (
            <div key={i} className="term-line">
              <span className={`term-tool ${s.ok === false ? "bad" : ""}`}>{s.tool}</span>
              <code>{s.detail}</code>
              {s.out && <pre>{s.out}</pre>}
            </div>
          ))}
          {!log.steps.length && <p className="muted">Je regarde…</p>}
        </div>
      </div>
      {log.approval && (
        <div className="glass approval in" style={st(1)}>
          <ShieldAlert size={20} />
          <div>
            <b>J'ai besoin de ton accord</b>
            {log.approval.map((a, i) => (
              <span key={i} style={{ display: "grid", gap: 2 }}>
                <code>{a.tool === "Bash" ? "$ " : `${a.tool} · `}{a.detail}</code>
                {a.risk && <span style={{ color: "rgb(var(--bad))", fontSize: 12.5, fontWeight: 600 }}>⚠ {a.risk}</span>}
              </span>
            ))}
            <p className="muted">Dis « oui » ou « non », ou clique.</p>
          </div>
          <div className="approval-btns">
            <button className="btn ok" onClick={() => onApprove(true)}><Check size={15} /> Autoriser une fois</button>
            <button className="btn" onClick={() => onApprove(false)}><X size={15} /> Refuser</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MailView({ v }: { v: Rich }) {
  const items = (v.items as { id: string; from: string; subject: string; date: string; body: string }[]) || [];
  if (!items.length) return <p className="empty">Aucun mail.</p>;
  return (
    <div className="mail-list">
      {items.map((m, i) => (
        <div key={m.id + i} className="glass mail-item in" style={st(i)}>
          <div className="mail-top">
            <b>{m.from}</b>
            <span className="muted tiny">{new Date(m.date).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p className="mail-subject">{m.subject}</p>
          <p className="muted mail-body">{m.body}</p>
        </div>
      ))}
    </div>
  );
}

function AgendaView({ v }: { v: Rich }) {
  const items = (v.items as { time: string; title: string; sub: string }[]) || [];
  if (!items.length) return <p className="empty">Rien de prévu.</p>;
  return (
    <div className="timeline">
      {items.map((x, i) => (
        <div key={i} className="glass tl-item in" style={st(i)}>
          <span className="tl-date">{x.time}</span>
          <b>{x.title}</b>
          <span className="muted">{x.sub}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ title, i, children }: { title: string; i: number; children: ReactNode }) {
  return (
    <div className="glass panel in" style={st(i)}>
      <h4 className="label">{title}</h4>
      {children}
    </div>
  );
}
const Row = ({ children, hot }: { children: ReactNode; hot?: boolean }) => <div className={`row ${hot ? "hot" : ""}`}>{children}</div>;

export function RichView({ v, s, agent, onApprove }: { v: Rich; s: State; agent: AgentLog | null; onApprove: (ok: boolean) => void }) {
  const k = v.kind;
  if (k === "agent" && agent) return <AgentView log={agent} onApprove={onApprove} />;
  if (k === "weather") return <Weather v={v} />;
  if (k === "matches") return <Matches v={v} />;
  if (k === "news") return <News v={v} />;
  if (k === "crypto") return <Crypto v={v} />;
  if (k === "fx") return <Fx v={v} />;
  if (k === "timer") return <div className="v-center"><TimerFace endsAt={v.endsAt as number} total={v.total as number} /></div>;
  if (k === "music") return <div className="v-center glass music in"><Music2 size={34} /><b>{String(v.track)}</b></div>;
  if (k === "keeply") return <KeeplyView s={s} />;
  if (k === "prospection") return <ProspectionView s={s} />;
  if (k === "plan") return <PlanView s={s} />;
  if (k === "mail") return <MailView v={v} />;
  if (k === "agenda") return <AgendaView v={v} />;
  return (
    <div className="v-generic in" style={st(0)}>
      <ViewRenderer view={v} />
      {!!v.sources?.length && (
        <div className="sources">
          {v.sources.slice(0, 4).map((x) => <a key={x.url} href={x.url} target="_blank" rel="noreferrer"><ExternalLink size={11} /> {x.title}</a>)}
        </div>
      )}
    </div>
  );
}
