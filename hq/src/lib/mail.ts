import "server-only";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import nodemailer from "nodemailer";
import { configOrNull, getConfig } from "@/lib/connectors/config";
import { demoMails } from "@/lib/demo";
import { getSettings, logActivity } from "@/lib/settings";
import { read, update } from "@/lib/store";
import type { MailCategory, MailItem, Settings } from "@/lib/types";

type Cfg = Record<string, string>;

export interface RawMail {
  id: string;
  messageId: string;
  from: { name: string; email: string };
  replyTo?: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
  text: string;
  seen: boolean;
  isBulk: boolean;
  references?: string;
}

function imapClient(cfg: Cfg) {
  return new ImapFlow({
    host: cfg.imapHost,
    port: Number(cfg.imapPort || 993),
    secure: Number(cfg.imapPort || 993) === 993,
    auth: { user: cfg.user, pass: cfg.password },
    logger: false,
    socketTimeout: 60_000,
  });
}

/** Lit les mails récents de la boîte de réception. */
export async function fetchInbox(cfg: Cfg, opts: { days?: number; limit?: number; unseenOnly?: boolean } = {}): Promise<RawMail[]> {
  const client = imapClient(cfg);
  await client.connect();
  const out: RawMail[] = [];
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const since = new Date(Date.now() - (opts.days ?? 14) * 864e5);
      const found = await client.search(opts.unseenOnly ? { since, seen: false } : { since }, { uid: true });
      const uids = (Array.isArray(found) ? found : []).slice(-(opts.limit ?? 80));
      if (!uids.length) return [];
      for await (const msg of client.fetch(uids, { uid: true, flags: true, envelope: true, source: { maxLength: 80_000 } }, { uid: true })) {
        const parsed = await simpleParser(msg.source as Buffer).catch(() => null);
        const headers = parsed?.headers;
        const h = (k: string) => {
          const v = headers?.get(k);
          return v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
        };
        const from = parsed?.from?.value?.[0] ?? msg.envelope?.from?.[0];
        const email = (from && "address" in from ? from.address : "")?.toLowerCase() ?? "";
        const text = (parsed?.text || (parsed?.html ? String(parsed.html).replace(/<[^>]+>/g, " ") : "")).replace(/\n{3,}/g, "\n\n").trim();
        const autoSub = h("auto-submitted");
        out.push({
          id: String(msg.uid),
          messageId: parsed?.messageId || msg.envelope?.messageId || String(msg.uid),
          from: { name: (from && "name" in from ? from.name : "") || email, email },
          replyTo: parsed?.replyTo?.value?.[0]?.address?.toLowerCase(),
          to: cfg.user,
          subject: parsed?.subject || msg.envelope?.subject || "(sans objet)",
          date: new Date(parsed?.date || msg.envelope?.date || Date.now()).toISOString(),
          snippet: text.replace(/\s+/g, " ").slice(0, 160),
          text: text.slice(0, 12000),
          seen: msg.flags?.has("\\Seen") ?? false,
          isBulk:
            !!h("list-unsubscribe") ||
            /bulk|list|junk/i.test(h("precedence")) ||
            (!!autoSub && !/^no$/i.test(autoSub.replace(/"/g, ""))) ||
            !!h("x-autoreply") ||
            /no[-_.]?reply|do[-_.]?not[-_.]?reply|mailer-daemon|postmaster|notifications?@|bounce/i.test(email),
          references: [parsed?.references].flat().filter(Boolean).join(" ") || undefined,
        });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

export async function imapAction(cfg: Cfg, uid: string, action: "seen" | "unseen" | "archive") {
  const client = imapClient(cfg);
  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      if (action === "seen") await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
      if (action === "unseen") await client.messageFlagsRemove(uid, ["\\Seen"], { uid: true });
      if (action === "archive") {
        const boxes = await client.list();
        const archive = boxes.find((b) => b.specialUse === "\\Archive") ?? boxes.find((b) => b.specialUse === "\\All") ?? boxes.find((b) => /archive/i.test(b.path));
        await client.messageFlagsAdd(uid, ["\\Seen"], { uid: true });
        if (archive) await client.messageMove(uid, archive.path, { uid: true });
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout().catch(() => undefined);
  }
}

export async function sendMail(
  cfg: Cfg,
  msg: { to: string; subject: string; text: string; inReplyTo?: string; references?: string; headers?: Record<string, string> },
) {
  const port = Number(cfg.smtpPort || 465);
  const transport = nodemailer.createTransport({
    host: cfg.smtpHost,
    port,
    secure: port === 465,
    auth: { user: cfg.user, pass: cfg.password },
  });
  return transport.sendMail({
    from: cfg.fromName ? { name: cfg.fromName, address: cfg.user } : cfg.user,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    inReplyTo: msg.inReplyTo,
    references: msg.references ? `${msg.references} ${msg.inReplyTo ?? ""}`.trim() : msg.inReplyTo,
    headers: msg.headers,
  });
}

export async function testMail(cfg: Cfg) {
  const client = imapClient(cfg);
  await client.connect();
  const status = (await client.status("INBOX", { messages: true, unseen: true })) || { messages: 0, unseen: 0 };
  await client.logout();
  const port = Number(cfg.smtpPort || 465);
  await nodemailer.createTransport({ host: cfg.smtpHost, port, secure: port === 465, auth: { user: cfg.user, pass: cfg.password } }).verify();
  return `Connecté. ${status.messages} mails dans la boîte, ${status.unseen} non lus. Envoi SMTP vérifié.`;
}

/* ---------- Priorité ---------- */

const CATEGORY_RULES: Array<[MailCategory, RegExp]> = [
  ["store", /apple\.com|google\.com|play-console|appstoreconnect|testflight/i],
  ["facturation", /facture|invoice|paiement|payment|reçu|receipt|virement|prélèvement|stripe|qonto|urssaf|tva/i],
  ["presse", /journaliste|interview|presse|article|podcast|média|reportage/i],
  ["partenariat", /partenariat|partnership|collaboration|revendeur|affiliation|groupe de \d+|plusieurs (restaurants|établissements)/i],
  ["support", /bug|ne fonctionne|marche pas|erreur|problème|aide|comment (faire|changer)|bloqué|tampon|scan|carte/i],
  ["client", /abonnement|résilier|mon compte|mes clients|ma carte|annuel|mensuel/i],
];

export function classify(m: RawMail, settings: Settings, clientEmails: Set<string>): Pick<MailItem, "priority" | "category" | "reasons"> {
  const hay = `${m.subject}\n${m.text.slice(0, 2000)}`;
  const reasons: string[] = [];
  let score = 2;
  let category: MailCategory = "autre";

  if (m.isBulk) {
    category = /newsletter|hebdo|weekly|digest|découvrez/i.test(hay) || !/no.?reply|notification/i.test(m.from.email) ? "newsletter" : "notification";
    score = 1;
  }
  for (const [cat, re] of CATEGORY_RULES) {
    if (re.test(hay) || re.test(m.from.email)) {
      if (!m.isBulk || cat === "store" || cat === "facturation") category = cat;
      break;
    }
  }
  if (m.isBulk && category !== "store") {
    return { priority: 1, category: category === "autre" ? "newsletter" : category, reasons: ["Envoi automatique ou newsletter"] };
  }
  const domain = m.from.email.split("@")[1] ?? "";
  if (settings.vipSenders.some((v) => v && (m.from.email === v.toLowerCase() || domain === v.toLowerCase().replace(/^@/, "")))) {
    score += 2;
    reasons.push("Expéditeur important");
  }
  if (clientEmails.has(m.from.email) || clientEmails.has("@" + domain)) {
    score += 1;
    category = category === "autre" ? "client" : category;
    reasons.push("Client Keeply");
  }
  const urgent = settings.urgentKeywords.filter((k) => k && hay.toLowerCase().includes(k.toLowerCase()));
  if (urgent.length) {
    score += urgent.length > 1 ? 2 : 1;
    reasons.push(`Mots clés : ${urgent.slice(0, 3).join(", ")}`);
  }
  if (/urgent|asap|au plus vite|immédiatement/i.test(m.subject)) {
    score += 1;
    reasons.push("Marqué urgent");
  }
  if (category === "partenariat" || category === "presse") {
    score += 1;
    reasons.push(category === "presse" ? "Presse" : "Opportunité commerciale");
  }
  if (category === "store" && /rejected|refusé|action requise|action required|policy|violation/i.test(hay)) {
    score += 2;
    reasons.push("Action demandée par un store");
  }
  if (!m.seen) reasons.push("Non lu");
  const age = (Date.now() - new Date(m.date).getTime()) / 36e5;
  if (age > 48 && !m.seen && score >= 3) {
    score += 1;
    reasons.push("En attente depuis plus de 2 jours");
  }
  if (category === "autre" && !m.isBulk) category = "prospect";
  return { priority: Math.max(1, Math.min(5, score)) as MailItem["priority"], category, reasons };
}

/* ---------- Boîte triée ---------- */

interface MailState {
  overrides: Record<string, { priority?: number; category?: MailCategory; done?: boolean }>;
  ai: Record<string, { priority: number; category: MailCategory; summary: string; action: string }>;
  autoReplied: Record<string, string>; // messageId → date
  lastReplyTo: Record<string, string>; // email → date
}
const EMPTY_STATE: MailState = { overrides: {}, ai: {}, autoReplied: {}, lastReplyTo: {} };

export const mailState = () => read<MailState>("mail:state", EMPTY_STATE);
export const updateMailState = (fn: (s: MailState) => MailState) => update<MailState>("mail:state", EMPTY_STATE, fn);

async function clientEmailSet() {
  const clients = await read<{ email: string }[]>("clients", []);
  const set = new Set<string>();
  for (const c of clients) {
    if (!c.email) continue;
    set.add(c.email.toLowerCase());
    const domain = c.email.split("@")[1];
    if (domain && !/gmail|hotmail|yahoo|outlook|icloud|orange|free\.fr|wanadoo|laposte/.test(domain)) set.add("@" + domain);
  }
  return set;
}

export async function inbox(refresh = false) {
  const cfg = await configOrNull("mail");
  let raw: RawMail[];
  let live = false;
  let error: string | undefined;
  if (!cfg) raw = demoMails();
  else {
    const cached = await read<{ at: number; items: RawMail[] } | null>("mail:cache", null);
    if (!refresh && cached && Date.now() - cached.at < 5 * 60_000) raw = cached.items;
    else {
      try {
        raw = await fetchInbox(cfg);
        await update("mail:cache", null, () => ({ at: Date.now(), items: raw }));
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
        raw = cached?.items ?? [];
      }
    }
    live = true;
  }
  const [settings, state, clients] = await Promise.all([getSettings(), mailState(), clientEmailSet()]);
  const items: MailItem[] = raw.map((m) => {
    const base = classify(m, settings, clients);
    const ai = state.ai[m.messageId];
    const o = state.overrides[m.messageId] ?? {};
    return {
      ...m,
      ...base,
      ...(ai ? { priority: Math.max(1, Math.min(5, Math.round(ai.priority))) as MailItem["priority"], category: ai.category, summary: ai.summary, action: ai.action } : {}),
      ...(o.priority ? { priority: o.priority as MailItem["priority"] } : {}),
      ...(o.category ? { category: o.category } : {}),
      done: o.done ?? false,
      autoReplied: !!state.autoReplied[m.messageId],
    };
  });
  items.sort((a, b) => Number(a.done) - Number(b.done) || b.priority - a.priority || b.date.localeCompare(a.date));
  return { items, live, error, autoReply: settings.autoReply.enabled };
}

/* ---------- Réponse automatique ---------- */

function inBusinessHours(s: Settings["autoReply"], d = new Date()) {
  const local = new Date(d.toLocaleString("en-US", { timeZone: process.env.HQ_TIMEZONE || "Europe/Paris" }));
  const day = local.getDay() === 0 ? 7 : local.getDay();
  const hm = local.toTimeString().slice(0, 5);
  return s.hours.days.includes(day) && hm >= s.hours.start && hm < s.hours.end;
}

export function renderTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export async function autoReplyTick() {
  const settings = await getSettings();
  const ar = settings.autoReply;
  if (!ar.enabled) return "désactivée";
  const cfg = await configOrNull("mail");
  if (!cfg) return "boîte non connectée";
  if (ar.mode === "hors-horaires" && inBusinessHours(ar)) return "heures ouvrées";

  const [mails, state, clients] = await Promise.all([fetchInbox(cfg, { days: 2, limit: 40, unseenOnly: true }), mailState(), clientEmailSet()]);
  const own = cfg.user.toLowerCase();
  let sent = 0;
  for (const m of mails) {
    if (sent >= 20) break;
    if (state.autoReplied[m.messageId]) continue;
    if (m.isBulk || !m.from.email || m.from.email === own) continue;
    if (Date.now() - new Date(m.date).getTime() > 36 * 36e5) continue;
    const { category } = classify(m, settings, clients);
    if (ar.skipCategories.includes(category)) continue;
    const last = state.lastReplyTo[m.from.email];
    if (last && Date.now() - new Date(last).getTime() < ar.cooldownDays * 864e5) continue;

    const firstName = (m.from.name || "").split(/\s+/)[0].replace(/[^\p{L}-]/gu, "");
    const text = renderTemplate(ar.body, { prenom: firstName || "", sujet: m.subject, signature: settings.signature }).replace("Bonjour ,", "Bonjour,");
    await sendMail(cfg, {
      to: m.from.email,
      subject: (m.subject.match(/^re\s?:/i) ? "" : ar.subjectPrefix) + m.subject,
      text,
      inReplyTo: m.messageId,
      references: m.references,
      headers: { "Auto-Submitted": "auto-replied", "X-Auto-Response-Suppress": "All", Precedence: "auto_reply" },
    });
    sent++;
    const now = new Date().toISOString();
    await updateMailState((s) => ({ ...s, autoReplied: { ...s.autoReplied, [m.messageId]: now }, lastReplyTo: { ...s.lastReplyTo, [m.from.email]: now } }));
  }
  if (sent) await logActivity("mails", `Réponse automatique envoyée à ${sent} mail(s)`, "succes");
  return `${sent} réponse(s) automatique(s)`;
}

/** Configuration d'envoi pour la prospection : boîte dédiée si elle existe, sinon la boîte pro. */
export async function outreachConfig() {
  const o = await configOrNull("outreach");
  if (o) return { ...o, imapHost: o.imapHost || "" };
  return configOrNull("mail");
}

export async function mailConfigured() {
  return !!(await getConfig("mail")).user;
}
