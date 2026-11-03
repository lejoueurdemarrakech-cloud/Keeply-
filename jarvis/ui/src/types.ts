export type Block =
  | { type: "stats"; items: { label: string; value: string; sub?: string }[] }
  | { type: "matches"; items: { league?: string; home: string; away: string; score?: string; time?: string; status?: string }[] }
  | { type: "list"; items: { title: string; sub?: string; meta?: string; url?: string }[] }
  | { type: "table"; columns: string[]; rows: (string | number)[][] }
  | { type: "chart"; kind?: "bar" | "line"; unit?: string; points: { label: string; value: number }[] }
  | { type: "timeline"; items: { time?: string; title: string; sub?: string }[] }
  | { type: "progress"; items: { label: string; value: number; text?: string }[] }
  | { type: "text"; text: string }
  | { type: "links"; items: { title: string; url: string }[] }
  | { type: "image"; url: string; caption?: string };

export interface View {
  title?: string;
  subtitle?: string;
  blocks: Block[];
  sources?: { title: string; url: string }[];
}

export interface Widget {
  id: string;
  kind: string;
  title: string;
  side: "left" | "right";
  prompt?: string;
  view?: View | null;
  updatedAt?: string | null;
}

export interface Layout {
  theme: string;
  preset: string;
  widgets: Widget[];
}

export interface Mail {
  id: string;
  subject: string;
  from: { name: string; email: string };
  date: string;
}
export interface Task {
  id: string;
  title: string;
  priority: string;
  due?: string | null;
}

export interface Today {
  ownerName: string;
  goal: { target: number; revenue: number; projection: number; daysLeft: number; daysInMonth: number; dayOfMonth: number };
  sales: { today: number; yesterday: number; month: number; downloads: number; mrr?: number; demo: boolean; series: { date: string; total: number }[] } | null;
  instagram: { followers: number; gained7: number; engagement: number; demo: boolean } | null;
  mails: { urgent: Mail[]; urgentCount: number; unread: number; demo: boolean } | null;
  health: { score: number; at: string; problems: { checkId: string; name: string; detail: string; severity: string }[] } | null;
  tasks: Task[];
  posts: { id: string; caption: string; scheduledAt?: string }[];
  failedPosts?: number;
  prospects: { replied: { id: string; name: string; city: string }[]; toApprove: number; sentToday: number; dailyLimit: number };
}

export interface SystemStats {
  host: string;
  cpu: number;
  cores: number;
  memUsed: number;
  memTotalGb: number;
  uptimeH: number;
  battery: { level: number; charging: boolean } | null;
  jarvisMb: number;
}

export interface Weather {
  error?: string;
  city: string;
  temp: number;
  feels: number;
  wind: number;
  humidity: number;
  label: string;
  hours: { h: number; temp: number; rain: number }[];
  days: { date: string; min: number; max: number; rain: number; label: string }[];
}

export interface Extra {
  activity: { id: string; at: string; area: string; message: string; level?: string }[];
  plan: { kind: "post" | "story"; id: string; date: string; heure: string; titre: string; format: string }[];
  launchDate: string;
  prospection: { total: number; contacted: number; interested: number; clients: number; followUps: number; byCountry: Record<string, number> };
  android: number;
}

export interface Credits {
  today: number;
  month: number;
  lastHour: number;
  tokensToday: number;
  byModel: Record<string, number>;
  lastActivity: string | null;
  at: string;
}

export interface State {
  at: string;
  config: {
    name: string;
    owner: string;
    hqUrl: string;
    hqToken: string;
    model: string;
    personality: string;
    city: string;
    feeds: string[];
    voice: { mode: "edge" | "mac"; edgeVoice: string; macVoice: string; rate: number };
    muted: boolean;
    alerts: boolean;
    widgetRefreshMin: number;
    voices: Record<string, string>;
  };
  layout: Layout;
  hq: { ok: boolean; stale?: boolean; error?: string; today?: Today; ads?: { spend: number; results: number; cpr: number; live: boolean; active: number } | null; extra?: Extra };
  weather: Weather;
  news: { title: string; source: string; link: string; date: string; feed: string }[];
  system: SystemStats;
  memory: { id: string; text: string; at: string }[];
  claude: string | null;
  claudeLogin?: boolean | null;
  feeds: Record<string, string>;
}

export type Ev =
  | { type: "status"; text: string }
  | { type: "sentence"; text: string }
  | { type: "view"; view: View }
  | { type: "layout"; layout: Layout }
  | { type: "stop" }
  | { type: "error"; text: string }
  | { type: "home" }
  | { type: "agent"; phase: "start" | "resume"; task: string }
  | { type: "step"; tool: string; detail: string }
  | { type: "stepResult"; ok: boolean; text: string }
  | { type: "approval"; items: { tool: string; detail: string; risk?: string; scope?: string }[] }
  | { type: "done"; say: string; done: (string | { open: string } | { draft: { to: string; subject: string; body: string } })[]; via: "instant" | "claude" | "agent"; focus?: string | null; costUsd?: number; ms?: number; approval?: boolean };
