// Types partagés entre serveur et interface.

export type SalesSource = "appstore" | "googleplay" | "stripe" | "revenuecat" | "manual";

export interface SaleRecord {
  id: string;
  date: string; // AAAA-MM-JJ
  source: SalesSource | string;
  product: string;
  country: string;
  units: number;
  /** Montant net encaissé en euros (après commission du store). */
  amount: number;
  kind: "achat" | "abonnement" | "renouvellement" | "remboursement" | "telechargement";
}

export interface SourceStatus {
  id: string;
  label: string;
  state: "live" | "demo" | "error" | "off";
  message?: string;
}

export interface SalesSummary {
  from: string;
  to: string;
  currency: "EUR";
  totals: { revenue: number; units: number; downloads: number; refunds: number; orders: number };
  previous: { revenue: number; units: number; downloads: number; refunds: number; orders: number };
  series: Array<Record<string, number | string>>;
  bySource: Array<{ source: string; label: string; revenue: number; units: number }>;
  byCountry: Array<{ country: string; revenue: number; units: number }>;
  byProduct: Array<{ product: string; revenue: number; units: number }>;
  recent: SaleRecord[];
  subscriptions?: { mrr: number; active: number; trials: number; churnRate?: number; source: string };
  sources: SourceStatus[];
}

export type PostStatus = "brouillon" | "programme" | "publication" | "publie" | "echec";
export type PostFormat = "image" | "carrousel" | "reel" | "story";

export interface Post {
  id: string;
  format: PostFormat;
  caption: string;
  media: string[];
  firstComment?: string;
  pillar?: string;
  scheduledAt?: string | null;
  status: PostStatus;
  error?: string;
  igMediaId?: string;
  permalink?: string;
  publishedAt?: string;
  createdAt: string;
}

export type MailCategory = "client" | "prospect" | "partenariat" | "support" | "facturation" | "presse" | "store" | "notification" | "newsletter" | "perso" | "autre";

export interface MailItem {
  id: string; // uid IMAP ou id démo
  messageId: string;
  from: { name: string; email: string };
  to: string;
  subject: string;
  date: string;
  snippet: string;
  text: string;
  seen: boolean;
  priority: 1 | 2 | 3 | 4 | 5; // 5 = urgent
  category: MailCategory;
  reasons: string[];
  summary?: string;
  action?: string;
  autoReplied?: boolean;
  done?: boolean;
  isBulk: boolean;
  references?: string;
}

export interface AutoReplySettings {
  enabled: boolean;
  mode: "toujours" | "hors-horaires";
  hours: { start: string; end: string; days: number[] };
  subjectPrefix: string;
  body: string;
  cooldownDays: number;
  skipCategories: MailCategory[];
}

export interface HealthCheck {
  id: string;
  name: string;
  kind: "http" | "texte" | "json" | "ssl" | "liens" | "appstore" | "playstore";
  url: string;
  expectStatus?: number;
  expectText?: string;
  maxMs?: number;
  enabled: boolean;
}

export interface HealthResult {
  checkId: string;
  name: string;
  kind: HealthCheck["kind"] | "e2e" | "sentry" | "avis";
  ok: boolean;
  severity: "ok" | "attention" | "panne";
  ms?: number;
  detail: string;
  items?: string[];
}

export interface HealthRun {
  id: string;
  at: string;
  trigger: "manuel" | "quotidien" | "e2e";
  results: HealthResult[];
  summary?: string;
  score: number; // 0-100
}

export type ProspectStatus = "nouveau" | "pret" | "approuve" | "envoye" | "relance1" | "relance2" | "repondu" | "interesse" | "refus" | "client" | "exclu";

export interface Prospect {
  id: string;
  name: string;
  type: string;
  city: string;
  country: string;
  address?: string;
  website?: string;
  email?: string;
  emails?: string[];
  phone?: string;
  instagram?: string;
  rating?: number;
  reviews?: number;
  source: "osm" | "google" | "manuel" | "demo";
  score: "chaud" | "tiede" | "froid" | "ecarte";
  signals: string[];
  lang: string;
  status: ProspectStatus;
  draft?: { subject: string; body: string; followUps: { delayDays: number; subject: string; body: string }[] };
  history: { at: string; event: string }[];
  nextSendAt?: string | null;
  step?: number; // 0 = premier mail envoyé, 1 = relance 1…
  createdAt: string;
  notes?: string;
  siteSnippet?: string;
  emailCheck?: "ok" | "sans-mx" | "inconnu";
  /** Intérêt estimé par Claude (1 à 10), sa raison et l'accroche choisie. */
  fit?: number;
  fitReason?: string;
  angle?: string;
  osmId?: string;
  placeId?: string;
}

export interface Settings {
  ownerName: string;
  businessName: string;
  ownerEmail: string;
  signature: string;
  monthlyGoal: number;
  siteUrl: string;
  appStoreUrl: string;
  playStoreUrl: string;
  vipSenders: string[];
  urgentKeywords: string[];
  autoReply: AutoReplySettings;
  health: { dailyHour: number; alertEmail: boolean; createTasks: boolean; checks: HealthCheck[] };
  prospecting: {
    pitch: string;
    offer: string;
    dailyLimit: number;
    followUpDays: number[];
    senderName: string;
    calendarLink: string;
    optOutLine: string;
    sendWindow: { start: string; end: string };
  };
  instagram: { handle: string; pillars: string[]; defaultHashtags: string };
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  priority: "basse" | "normale" | "haute";
  due?: string | null;
  tag?: string;
  link?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  city: string;
  contact: string;
  email: string;
  phone: string;
  plan: "Essai" | "Mensuel" | "Annuel";
  mrr: number;
  status: "essai" | "actif" | "pause" | "resilie";
  since: string;
  cards: number;
  lastActivity?: string;
  notes: string;
  tags: string[];
}

export interface Review {
  id: string;
  store: "appstore" | "googleplay";
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
  country?: string;
  version?: string;
  reply?: string;
  bug?: boolean;
}
