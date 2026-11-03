import type { Snapshot } from "@/lib/jarvis";

/* ============================================================
   Réponses instantanées : les demandes courantes sont comprises
   ici, sans attendre Claude, à partir des données de HQ déjà
   chargées. Tout le reste part chez Claude.
   ============================================================ */

export type CardKind = "sales" | "mails" | "tasks" | "weather" | "news" | "ads" | "instagram" | "health" | "prospects" | "memory" | "agenda";

export type Action = { type: "task" | "note" | "remember" | "open"; text: string; href: string };

export interface LocalAnswer {
  say: string;
  detail?: string;
  cards?: CardKind[];
  actions?: Action[];
  special?: "stop" | "clear" | "help" | "settings";
  /** Ne pas garder dans l'historique (ex. « stop »). */
  silent?: boolean;
}

export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9%€ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const euros = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} euros`;
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

export const PAGES: { href: string; words: string[]; label: string }[] = [
  { href: "/", words: ["accueil", "aujourd hui", "tableau de bord", "dashboard"], label: "l'accueil" },
  { href: "/valider", words: ["valider", "validation"], label: "À valider" },
  { href: "/ventes", words: ["ventes", "vente", "chiffre d affaires"], label: "les ventes" },
  { href: "/sante", words: ["sante"], label: "la santé de l'app" },
  { href: "/reseaux", words: ["reseaux", "reseau"], label: "Réseaux" },
  { href: "/instagram", words: ["instagram", "insta"], label: "Instagram" },
  { href: "/ads", words: ["meta ads", "pubs", "pub", "publicites", "ads"], label: "Meta Ads" },
  { href: "/prospection", words: ["prospection", "prospects"], label: "la prospection" },
  { href: "/harvey", words: ["harvey"], label: "Harvey" },
  { href: "/mails", words: ["mails", "mail", "boite mail", "messagerie"], label: "les mails" },
  { href: "/clients", words: ["clients"], label: "les clients" },
  { href: "/avis", words: ["avis"], label: "les avis" },
  { href: "/taches", words: ["taches", "tache", "todo"], label: "les tâches" },
  { href: "/outils", words: ["outils"], label: "les outils" },
  { href: "/claude", words: ["credits", "credits claude"], label: "les crédits Claude" },
  { href: "/connexions", words: ["connexions"], label: "les connexions" },
  { href: "/reglages", words: ["reglages", "parametres"], label: "les réglages" },
];

function greeting(name?: string) {
  const h = new Date().getHours();
  const g = h < 5 ? "Bonsoir" : h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir";
  return name ? `${g} ${name.split(" ")[0]}.` : `${g}.`;
}

export function salesLine(s: Snapshot) {
  const t = s.today;
  if (!t.sales) return "Je n'ai pas encore de données de ventes.";
  const pct = t.goal.target ? Math.round((t.goal.revenue / t.goal.target) * 100) : 0;
  return `Hier : ${euros(t.sales.yesterday)}. Ce mois-ci : ${euros(t.goal.revenue)}, soit ${pct} % de l'objectif de ${euros(t.goal.target)}. Projection fin de mois : ${euros(t.goal.projection)}.${t.sales.demo ? " Attention, ce sont des données d'exemple." : ""}`;
}

export function mailsLine(s: Snapshot, read = false) {
  const m = s.today.mails;
  if (!m) return "La boîte mail n'est pas encore branchée.";
  if (!m.urgentCount) return `Aucun mail urgent. ${plural(m.unread, "message non lu", "messages non lus")}.`;
  const list = m.urgent.slice(0, read ? 5 : 2).map((x) => `${x.from.name || x.from.email} : ${x.subject}`);
  return `${plural(m.urgentCount, "mail urgent", "mails urgents")}. ${read ? list.join(". ") + "." : `Le plus important, ${list[0]}.`}`;
}

export function tasksLine(s: Snapshot) {
  const t = s.today.tasks;
  if (!t.length) return "Aucune tâche ouverte. Tout est fait.";
  const high = t.filter((x) => x.priority === "haute");
  return `${plural(t.length, "tâche ouverte", "tâches ouvertes")}${high.length ? `, dont ${high.length} prioritaire${high.length > 1 ? "s" : ""}` : ""}. En premier : ${t[0].title}.`;
}

export function weatherLine(s: Snapshot, tomorrow = false) {
  const w = s.weather;
  if (!w) return "Je n'arrive pas à joindre la météo pour l'instant.";
  if (tomorrow) return `Demain à ${w.city} : ${w.tomorrow.label}, de ${w.tomorrow.min} à ${w.tomorrow.max} degrés, ${w.tomorrow.rain} % de risque de pluie.`;
  return `À ${w.city}, il fait ${w.temp} degrés, ${w.label}. Entre ${w.today.min} et ${w.today.max} aujourd'hui${w.today.rain >= 40 ? `, ${w.today.rain} % de risque de pluie, prends un parapluie` : ""}.`;
}

export function newsLine(s: Snapshot, feed?: string) {
  const items = s.news.filter((h) => !feed || h.feed === feed).slice(0, 4);
  if (!items.length) return "Je n'ai pas réussi à récupérer les actualités.";
  return `Voici les titres. ${items.map((h) => h.title.replace(/[.!?]$/, "")).join(". ")}.`;
}

export function adsLine(s: Snapshot) {
  const a = s.ads;
  if (!a) return "Je n'ai pas les chiffres des publicités.";
  return `Sur 7 jours, ${euros(a.spend)} dépensés pour ${a.results} résultats, soit ${a.cpr.toFixed(2).replace(".", ",")} euros par résultat.${a.best ? ` La plus rentable : ${a.best}.` : ""}${a.live ? "" : " Ce sont des données d'exemple."}`;
}

export function igLine(s: Snapshot) {
  const i = s.today.instagram;
  if (!i) return "Instagram n'est pas encore branché.";
  return `${i.followers.toLocaleString("fr-FR")} abonnés, ${i.gained7 >= 0 ? "plus" : "moins"} ${Math.abs(i.gained7)} cette semaine. Engagement à ${(i.engagement * 100).toFixed(1).replace(".", ",")} %.${i.demo ? " Données d'exemple." : ""}`;
}

export function healthLine(s: Snapshot) {
  const h = s.today.health;
  if (!h) return "L'app n'a pas encore été testée aujourd'hui.";
  if (!h.problems.length) return `L'app va bien : ${h.score} sur 100, aucun problème détecté.`;
  return `Santé de l'app : ${h.score} sur 100. ${plural(h.problems.length, "problème", "problèmes")}, dont ${h.problems[0].name}.`;
}

export function prospectsLine(s: Snapshot) {
  const p = s.today.prospects;
  return `${plural(p.replied.length, "prospect a répondu", "prospects ont répondu")}${p.replied[0] ? `, dont ${p.replied[0].name}` : ""}. ${plural(p.toApprove, "mail attend", "mails attendent")} ta validation. ${p.sentToday} envoyés aujourd'hui sur ${p.dailyLimit}.`;
}

export function briefing(s: Snapshot, owner?: string): LocalAnswer {
  const t = s.today;
  const parts = [greeting(owner)];
  if (t.sales) parts.push(`Hier, ${euros(t.sales.yesterday)} de ventes, et ${Math.round((t.goal.revenue / Math.max(1, t.goal.target)) * 100)} % de l'objectif du mois.`);
  if (t.mails?.urgentCount) parts.push(`${plural(t.mails.urgentCount, "mail urgent t'attend", "mails urgents t'attendent")}, le premier de ${t.mails.urgent[0].from.name || t.mails.urgent[0].from.email}.`);
  if (t.health?.problems.length) parts.push(`Attention, l'app signale ${t.health.problems[0].name}.`);
  if (t.reviews?.recentBad.length) parts.push(`${plural(t.reviews.recentBad.length, "avis négatif", "avis négatifs")} sans réponse.`);
  if (t.prospects.replied.length) parts.push(`${plural(t.prospects.replied.length, "prospect a répondu", "prospects ont répondu")}.`);
  const high = t.tasks.filter((x) => x.priority === "haute");
  if (high.length) parts.push(`Priorité du jour : ${high[0].title}.`);
  if (s.weather) parts.push(`Dehors, ${s.weather.temp} degrés, ${s.weather.label}.`);
  if (parts.length < 3) parts.push("Rien d'urgent. Bonne journée pour avancer sur le fond.");
  const demo = t.sales?.demo || t.mails?.demo;
  return { say: parts.join(" ") + (demo ? " Une partie des chiffres est encore en mode exemple." : ""), cards: ["sales", "mails", "tasks", "weather"] };
}

export const HELP =
  "Je peux te faire le briefing du jour, te donner les ventes, les mails urgents, les tâches, la santé de l'app, Instagram, les pubs, la prospection, la météo et les actus. Je crée des tâches, je prends des notes, je retiens ce que tu me dis et j'ouvre n'importe quelle page de HQ. Pour le reste, je demande à Claude.";

const has = (n: string, ...words: string[]) => words.some((w) => new RegExp(`(^| )${w}( |$)`).test(n));

/**
 * Comprend la demande si elle est simple. Renvoie null si Claude doit répondre.
 * `s` peut être absent tant que les données chargent : seules les commandes de base marchent alors.
 */
export function localAnswer(raw: string, s: Snapshot | undefined, owner?: string): LocalAnswer | null {
  const n = norm(raw);
  if (!n) return null;

  // Commandes de contrôle
  if (/^(stop|arrete|tais toi|silence|chut|ca suffit|merci c est bon)$/.test(n)) return { say: "", special: "stop", silent: true };
  if (/^(efface|oublie) (la |notre )?(conversation|discussion|historique)/.test(n)) return { say: "C'est effacé. On repart de zéro.", special: "clear", silent: true };
  if (/^(aide|help)$|que (sais|peux) tu faire|qu est ce que tu (sais|peux) faire/.test(n)) return { say: HELP, special: "help" };
  if (/^(ouvre |affiche )?(les )?(reglages|parametres) (de )?(jarvis|la voix)/.test(n)) return { say: "Voici mes réglages.", special: "settings", silent: true };

  // Mémoire
  const mem = raw.match(/^(?:jarvis[, ]+)?(?:souviens[- ]toi|rappelle[- ]toi|retiens|n'oublie pas|note bien)(?: que| de| bien que)?\s+(.+)/i);
  if (mem) return { say: "C'est noté, je m'en souviendrai.", actions: [{ type: "remember", text: mem[1].trim(), href: "" }], cards: ["memory"] };
  if (/qu est ce que tu sais (de|sur) moi|de quoi tu te souviens|ta memoire/.test(n)) {
    const m = s?.memory ?? [];
    return { say: m.length ? `Je retiens ${plural(m.length, "chose", "choses")}. Par exemple : ${m.slice(0, 3).map((x) => x.text).join(". ")}.` : "Je n'ai encore rien retenu. Dis-moi « souviens-toi que… ».", cards: ["memory"] };
  }

  // Tâches et notes
  const task = raw.match(/^(?:jarvis[, ]+)?(?:ajoute|cree|crée|mets|nouvelle)(?: une)? t[aâ]che(?: pour| de)?\s*:?\s+(.+)/i) ?? raw.match(/^(?:jarvis[, ]+)?rappelle[- ]moi (?:de |d')(.+)/i);
  if (task) {
    const title = task[1].trim().replace(/[.!]$/, "");
    return { say: `Tâche ajoutée : ${title}.`, actions: [{ type: "task", text: title.charAt(0).toUpperCase() + title.slice(1), href: "" }], cards: ["tasks"] };
  }
  const note = raw.match(/^(?:jarvis[, ]+)?(?:prends? (?:une )?note|note|ajoute (?:une note|au bloc-notes))\s*(?:que|:)?\s+(.+)/i);
  if (note && !/^bien\b/i.test(note[1])) return { say: "Noté dans le bloc-notes.", actions: [{ type: "note", text: note[1].trim(), href: "" }] };

  // Navigation
  const nav = n.match(/^(?:ouvre|va (?:sur|dans|a)|montre(?: moi)?|affiche|emmene moi (?:sur|dans|a)) (?:la page |l |les |le |la )?(.+)$/);
  if (nav) {
    const page = PAGES.find((p) => p.words.some((w) => nav[1] === w || nav[1].startsWith(w + " ") || nav[1].endsWith(" " + w)));
    if (page) return { say: `J'ouvre ${page.label}.`, actions: [{ type: "open", text: page.label, href: page.href }] };
  }

  // Heure et date
  if (/^(quelle heure|il est quelle heure|l heure)/.test(n)) return { say: `Il est ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " heures ")}.` };
  if (/^(on est quel jour|quel jour|quelle date|la date)/.test(n)) return { say: `Nous sommes le ${new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}.` };

  if (!s) return null;

  // Questions d'analyse ou de rédaction : c'est le travail de Claude.
  if (/(^| )(pourquoi|comment (ameliorer|faire|augmenter|booster)|conseil|conseille|que (dois|devrais|faut il)|analyse|explique|compare|idees?|strategie|redige|ecris|propose|imagine|aide moi a)( |$)/.test(n)) return null;

  // Salutations et briefing
  if (/^(salut|bonjour|bonsoir|hello|coucou|yo|hey)( jarvis)?$/.test(n)) return { say: `${greeting(owner)} Je suis là. Tu veux le briefing du jour ?` };
  if (has(n, "briefing", "brief", "resume", "recap", "quoi de neuf", "point du jour", "fais le point", "comment ca va aujourd hui")) return briefing(s, owner);

  // Données de HQ
  if (has(n, "meteo", "quel temps", "pleuvoir", "pluie", "temperature", "fait il chaud", "fait il froid", "parapluie")) return { say: weatherLine(s, has(n, "demain")), cards: ["weather"] };
  if (has(n, "actu", "actus", "actualite", "actualites", "news", "infos", "titres")) {
    const feed = has(n, "tech", "technologie") ? "tech" : has(n, "maroc") ? "maroc" : has(n, "apple", "iphone") ? "apple" : has(n, "resto", "restauration", "restaurants") ? "resto" : has(n, "fidelite") ? "fidelite" : has(n, "startup", "startups") ? "startups" : undefined;
    return { say: newsLine(s, feed), cards: ["news"] };
  }
  if (has(n, "mail", "mails", "messages", "email", "emails", "boite")) return { say: mailsLine(s, has(n, "lis", "lire", "liste", "lesquels", "quels")), cards: ["mails"] };
  if (has(n, "tache", "taches", "a faire", "todo", "priorites")) return { say: tasksLine(s), cards: ["tasks"] };
  if (has(n, "pub", "pubs", "publicite", "publicites", "ads", "campagne", "campagnes", "meta")) return { say: adsLine(s), cards: ["ads"] };
  if (has(n, "instagram", "insta", "abonnes", "followers")) return { say: igLine(s), cards: ["instagram"] };
  if (has(n, "sante", "panne", "bug", "app marche", "app fonctionne", "en ligne", "plante")) return { say: healthLine(s), cards: ["health"] };
  if (has(n, "prospect", "prospects", "prospection", "harvey")) return { say: prospectsLine(s), cards: ["prospects"] };
  if (has(n, "vente", "ventes", "vendu", "chiffre", "revenu", "revenus", "mrr", "objectif", "argent", "gagne")) return { say: salesLine(s), cards: ["sales"] };
  if (has(n, "agenda", "programme", "planning", "posts prevus")) {
    const p = s.today.posts;
    return { say: p.length ? `${plural(p.length, "post programmé", "posts programmés")} cette semaine. ${tasksLine(s)}` : `Aucun post programmé cette semaine. ${tasksLine(s)}`, cards: ["agenda", "tasks"] };
  }
  return null;
}
