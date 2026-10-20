import "server-only";
import type { Client, MailItem, Prospect, Review, SaleRecord } from "@/lib/types";

/** Générateur pseudo-aléatoire reproductible : les chiffres de démo restent stables d'un affichage à l'autre. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);

export const isoDay = (d: Date) => d.toISOString().slice(0, 10);
export function daysBetween(from: string, to: string) {
  const out: string[] = [];
  const d = new Date(from + "T00:00:00Z");
  const end = new Date(to + "T00:00:00Z");
  while (d <= end) {
    out.push(isoDay(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const COUNTRIES = ["FR", "FR", "FR", "FR", "BE", "CH", "CA", "MA", "ES", "LU"];

/** Ventes de démo : croissance douce, saisonnalité hebdo, mix App Store / Google Play / Stripe. */
export function demoSales(source: "appstore" | "googleplay" | "stripe", from: string, to: string): SaleRecord[] {
  const out: SaleRecord[] = [];
  const base = { appstore: 22, googleplay: 10, stripe: 30 }[source];
  const start = new Date("2026-01-01T00:00:00Z").getTime();
  for (const day of daysBetween(from, to)) {
    const r = rng(hash(source + day));
    const t = (new Date(day + "T00:00:00Z").getTime() - start) / 864e5;
    const growth = 1 + Math.max(0, t) * 0.002;
    const dow = new Date(day + "T00:00:00Z").getUTCDay();
    const weekly = dow === 0 ? 0.62 : dow === 6 ? 0.8 : dow === 1 ? 1.15 : 1;
    const amountDay = base * growth * weekly * (0.7 + r() * 0.6);
    const orders = Math.floor(amountDay / (source === "stripe" ? 29 : 14) + r());
    const downloads = Math.round((source === "googleplay" ? 9 : 17) * growth * weekly * (0.6 + r() * 0.8));
    if (source !== "stripe") {
      out.push({ id: `${source}-${day}-dl`, date: day, source, product: "Keeply Pro", country: "FR", units: downloads, amount: 0, kind: "telechargement" });
    }
    for (let i = 0; i < orders; i++) {
      const annual = r() < 0.16;
      const price = source === "stripe" ? (annual ? 290 : 29) : annual ? 199.99 * 0.85 : 19.99 * 0.85;
      out.push({
        id: `${source}-${day}-${i}`,
        date: day,
        source,
        product: annual ? "Keeply Pro annuel" : "Keeply Pro mensuel",
        country: COUNTRIES[Math.floor(r() * COUNTRIES.length)],
        units: 1,
        amount: Math.round(price * (annual ? 0.3 : 1) * 100) / 100,
        kind: r() < 0.55 ? "renouvellement" : "abonnement",
      });
    }
    if (r() < 0.07) {
      out.push({ id: `${source}-${day}-rf`, date: day, source, product: "Keeply Pro mensuel", country: "FR", units: 1, amount: -(source === "stripe" ? 29 : 16.99), kind: "remboursement" });
    }
  }
  return out;
}

export function demoInstagram() {
  const r = rng(42);
  const days = daysBetween(isoDay(new Date(Date.now() - 89 * 864e5)), isoDay(new Date()));
  let followers = 1840;
  const growth = days.map((date) => {
    const gained = Math.round(6 + r() * 22 + (r() < 0.06 ? 60 + r() * 120 : 0));
    const lost = Math.round(r() * 7);
    followers += gained - lost;
    return { date, followers, gained, lost, reach: Math.round(900 + r() * 2600 + gained * 30), views: Math.round(2500 + r() * 7000), profileViews: Math.round(40 + r() * 120) };
  });
  const captions = [
    "3 erreurs qui font fuir vos clients fidèles ☕️ (la 2e est la plus courante)",
    "Avant / après : la carte papier vs la carte dans le Wallet",
    "Ce café de Lyon a fait +38 % de visites en 2 mois. On vous explique.",
    "Combien coûte vraiment un client perdu ? Petit calcul 👇",
    "On a testé 5 façons de faire revenir un client. Voici la gagnante.",
    "Le tampon numérique, en 2 secondes en caisse. Démo.",
    "POV : votre client a encore oublié sa carte de fidélité 🙃",
    "La question qu'on nous pose le plus : « mes clients doivent installer une app ? »",
    "Nouveau : les rappels automatiques le jour de l'anniversaire 🎂",
    "Les coulisses : comment on conçoit une carte Keeply",
    "Boulangers : l'astuce du 10e pain offert, revisitée",
    "Votre carte de fidélité peut-elle survivre à une machine à laver ? La nôtre oui.",
  ];
  const media = captions.map((caption, i) => {
    const type = i % 3 === 0 ? "REEL" : i % 3 === 1 ? "CAROUSEL_ALBUM" : "IMAGE";
    const reach = Math.round((type === "REEL" ? 5200 : 1900) * (0.5 + r() * 1.4));
    const d = new Date(Date.now() - (i * 6 + 1) * 864e5);
    d.setUTCHours([7, 11, 16, 17, 18][Math.floor(r() * 5)], 0, 0, 0);
    return {
      id: "demo-media-" + i,
      caption,
      type,
      timestamp: d.toISOString(),
      permalink: "https://www.instagram.com/",
      thumbnail: `/demo/ig-${(i % 6) + 1}.svg`,
      likes: Math.round(reach * (0.025 + r() * 0.03)),
      comments: Math.round(reach * (0.003 + r() * 0.008)),
      saves: Math.round(reach * (0.01 + r() * 0.03)),
      shares: Math.round(reach * (0.004 + r() * 0.02)),
      reach,
      views: Math.round(reach * (1.3 + r())),
    };
  });
  return {
    account: { username: "keeply.app", name: "Keeply · Carte de fidélité", followers, following: 312, mediaCount: 148, picture: "" },
    growth,
    media,
    audience: {
      cities: [
        { name: "Paris", value: 31 },
        { name: "Lyon", value: 12 },
        { name: "Marseille", value: 8 },
        { name: "Bruxelles", value: 6 },
        { name: "Casablanca", value: 5 },
        { name: "Bordeaux", value: 5 },
      ],
      ages: [
        { name: "18-24", value: 14 },
        { name: "25-34", value: 41 },
        { name: "35-44", value: 28 },
        { name: "45-54", value: 12 },
        { name: "55+", value: 5 },
      ],
    },
  };
}

export function demoAds() {
  const r = rng(7);
  const days = daysBetween(isoDay(new Date(Date.now() - 29 * 864e5)), isoDay(new Date()));
  const campaigns = [
    { id: "c1", name: "Installations iOS · Restaurateurs FR", objective: "Installations", status: "ACTIVE" },
    { id: "c2", name: "Reels démo · Reciblage visiteurs site", objective: "Trafic", status: "ACTIVE" },
    { id: "c3", name: "Leads cafés · Lyon & Paris", objective: "Prospects", status: "PAUSED" },
  ].map((c, i) => {
    const spend = Math.round((180 + r() * 420) * (i === 2 ? 0.4 : 1));
    const impressions = Math.round(spend * (90 + r() * 80));
    const clicks = Math.round(impressions * (0.009 + r() * 0.014));
    const results = Math.max(1, Math.round(clicks * (0.08 + r() * 0.12)));
    return { ...c, spend, impressions, reach: Math.round(impressions * 0.62), clicks, ctr: clicks / impressions, cpc: spend / clicks, cpm: (spend / impressions) * 1000, results, costPerResult: spend / results, frequency: 1.4 + r() * 1.6, revenue: Math.round(results * (8 + r() * 30)) };
  });
  const daily = days.map((date) => ({ date, spend: Math.round((22 + r() * 20) * 100) / 100, clicks: Math.round(40 + r() * 70), results: Math.round(3 + r() * 9) }));
  return { campaigns, daily };
}

const MAILS: Array<Omit<MailItem, "id" | "messageId" | "date" | "priority" | "category" | "reasons" | "seen" | "isBulk" | "snippet"> & { hoursAgo: number; bulk?: boolean }> = [
  { from: { name: "Sophie Martin", email: "sophie@cafe-des-arts.fr" }, to: "contact@keeply.app", subject: "URGENT - les tampons ne s'ajoutent plus depuis ce matin", text: "Bonjour,\n\nDepuis ce matin quand on scanne la carte d'un client, le tampon ne s'ajoute pas. On a déjà eu 6 clients concernés. Pouvez-vous regarder rapidement ? On est ouverts jusqu'à 19h.\n\nMerci,\nSophie - Café des Arts, Lyon", hoursAgo: 1 },
  { from: { name: "Karim Benali", email: "karim@lesmashburger.com" }, to: "contact@keeply.app", subject: "Question sur l'abonnement annuel", text: "Bonjour, on est sur l'offre mensuelle depuis 3 mois et on aimerait passer à l'annuel. Est-ce qu'on garde nos clients et leurs tampons ? Et est-ce qu'il y a une facture avec TVA ? Merci !", hoursAgo: 3 },
  { from: { name: "App Store Connect", email: "no_reply@email.apple.com" }, to: "contact@keeply.app", subject: "The status of your app has changed to Ready for Distribution", text: "Dear Developer, The status of Keeply version 2.4 is now Ready for Distribution.", hoursAgo: 5 },
  { from: { name: "Claire Dubois", email: "claire.dubois@lefigaro-food.fr" }, to: "contact@keeply.app", subject: "Demande d'interview - dossier commerce local", text: "Bonjour,\n\nJe prépare un dossier sur les outils numériques des commerces de proximité pour la fin du mois. Seriez-vous disponible pour un échange de 20 minutes cette semaine ?\n\nBien à vous,\nClaire Dubois", hoursAgo: 7 },
  { from: { name: "Thomas Leroy", email: "thomas@boulangerie-leroy.fr" }, to: "contact@keeply.app", subject: "Résilier mon abonnement", text: "Bonjour, je souhaite résilier mon abonnement, mes clients ne l'utilisent pas assez. Comment faire ? Merci.", hoursAgo: 9 },
  { from: { name: "Stripe", email: "notifications@stripe.com" }, to: "contact@keeply.app", subject: "Paiement de 290,00 € reçu de Le Petit Zinc", text: "Vous avez reçu un paiement de 290,00 €.", hoursAgo: 11 },
  { from: { name: "Nadia El Amrani", email: "nadia@groupe-saveurs.ma" }, to: "contact@keeply.app", subject: "Partenariat - 14 restaurants à Casablanca et Rabat", text: "Bonjour,\n\nJe dirige un groupe de 14 restaurants au Maroc. Nous cherchons une solution de fidélité commune à tous nos établissements. Proposez-vous des tarifs pour plusieurs points de vente ?\n\nCordialement,\nNadia El Amrani", hoursAgo: 14 },
  { from: { name: "Product Hunt", email: "hello@producthunt.com" }, to: "contact@keeply.app", subject: "Les lancements de la semaine", text: "Découvrez les produits les plus votés cette semaine.", hoursAgo: 20, bulk: true },
  { from: { name: "Julie Moreau", email: "julie@latelier-cafe.be" }, to: "contact@keeply.app", subject: "Comment changer le logo sur la carte ?", text: "Bonjour, j'ai un nouveau logo, comment le mettre à jour sur la carte de mes clients ? Est-ce que ça se met à jour automatiquement chez eux ? Merci beaucoup", hoursAgo: 26 },
  { from: { name: "Google Play Console", email: "noreply-play-console@google.com" }, to: "contact@keeply.app", subject: "Action requise : mise à jour de la politique sur les données", text: "Veuillez mettre à jour la section Sécurité des données avant le 15 du mois prochain.", hoursAgo: 30 },
  { from: { name: "Marc Petit", email: "marc.petit@gmail.com" }, to: "contact@keeply.app", subject: "Je suis client d'un café qui utilise Keeply", text: "Bonjour, j'ai perdu ma carte dans mon Wallet après avoir changé de téléphone, comment la récupérer ?", hoursAgo: 40 },
  { from: { name: "Qonto", email: "no-reply@qonto.com" }, to: "contact@keeply.app", subject: "Votre relevé mensuel est disponible", text: "Votre relevé du mois est disponible dans votre espace.", hoursAgo: 52, bulk: true },
];

export function demoMails(): Omit<MailItem, "priority" | "category" | "reasons">[] {
  return MAILS.map((m, i) => ({
    ...m,
    id: "demo-" + i,
    messageId: `<demo-${i}@keeply.local>`,
    date: new Date(Date.now() - m.hoursAgo * 36e5).toISOString(),
    snippet: m.text.replace(/\s+/g, " ").slice(0, 140),
    seen: i > 4,
    isBulk: !!m.bulk || /no.?reply|notifications?@/i.test(m.from.email),
  }));
}

export function demoReviews(): Review[] {
  const list: Array<[Review["store"], number, string, string, number]> = [
    ["appstore", 5, "Simple et efficace", "Mes clients adorent ne plus avoir de carte papier. Mise en place en 10 minutes.", 2],
    ["appstore", 2, "Bug au scan", "Depuis la mise à jour, le scan plante une fois sur trois. Obligé de relancer l'app.", 1],
    ["googleplay", 4, "", "Très bien mais il manque l'export des clients en CSV.", 3],
    ["appstore", 5, "Top pour mon café", "Les rappels automatiques font vraiment revenir les clients.", 6],
    ["googleplay", 1, "", "L'app ne s'ouvre plus sur mon Samsung, écran blanc.", 4],
    ["appstore", 4, "Bien pensé", "Interface claire. J'aimerais pouvoir offrir des tampons doubles le mardi.", 9],
    ["googleplay", 5, "", "Parfait pour notre boulangerie, merci !", 12],
  ];
  return list.map(([store, rating, title, body, days], i) => ({
    id: "demo-review-" + i,
    store,
    rating,
    title,
    body,
    author: ["Café Lumière", "Pizzeria Nonna", "Le Fournil", "Mokka Bar", "Saveurs d'Asie", "Chez Lulu", "Pain & Co"][i],
    date: new Date(Date.now() - days * 864e5).toISOString(),
    country: "FR",
    version: "2.4",
  }));
}

export function demoClients(): Client[] {
  const rows: Array<[string, string, Client["plan"], number, Client["status"], number, number]> = [
    ["Café des Arts", "Lyon", "Mensuel", 29, "actif", 210, 420],
    ["Le Smash Burger", "Paris", "Mensuel", 29, "actif", 120, 690],
    ["Le Petit Zinc", "Bordeaux", "Annuel", 24.17, "actif", 330, 310],
    ["Boulangerie Leroy", "Nantes", "Mensuel", 29, "actif", 95, 140],
    ["L'Atelier Café", "Bruxelles", "Mensuel", 29, "actif", 60, 255],
    ["Sushi Kaze", "Paris", "Essai", 0, "essai", 6, 34],
    ["Tajine & Co", "Marseille", "Annuel", 24.17, "actif", 280, 515],
    ["Mokka Bar", "Genève", "Mensuel", 29, "pause", 150, 98],
    ["Chez Lulu", "Lille", "Essai", 0, "essai", 3, 12],
    ["La Fourchette d'Or", "Toulouse", "Mensuel", 29, "resilie", 200, 75],
  ];
  return rows.map(([name, city, plan, mrr, status, days, cards], i) => ({
    id: "demo-client-" + i,
    name,
    city,
    contact: ["Sophie", "Karim", "Paul", "Thomas", "Julie", "Kenji", "Leïla", "Hugo", "Lucie", "Marc"][i],
    email: `contact@${name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "")}.fr`,
    phone: "",
    plan,
    mrr,
    status,
    since: isoDay(new Date(Date.now() - days * 864e5)),
    cards,
    lastActivity: isoDay(new Date(Date.now() - (i % 4) * 2 * 864e5)),
    notes: "",
    tags: [],
  }));
}

/** Établissements fictifs quand la recherche réelle n'est pas possible (hors-ligne). */
export function demoProspects(city: string, country: string, type: string, n = 12): Omit<Prospect, "id" | "createdAt" | "history" | "status" | "score" | "signals" | "lang">[] {
  const r = rng(hash(city + type + country));
  const names = {
    cafe: ["Café Tribu", "Le Comptoir", "Brûlerie du Marché", "Café Pinson", "Mokxa", "Le Petit Grain", "Café Odette", "Kafé Kopi", "La Tasse", "Café du Coin", "Noir Café", "Coutume"],
    restaurant: ["Bistrot Paul", "La Table d'Anna", "Le Zinc", "Osteria Bella", "Le Bouchon", "Maison Pho", "Chez Mamie", "Le Cèdre", "Burger Club", "La Cantine", "Saveurs du Sud", "Le Passage"],
    boulangerie: ["Pain & Co", "Le Fournil", "Maison Kayser", "Aux Délices", "Boulangerie du Parc", "La Mie Dorée", "Le Pétrin", "Au Bon Pain", "Fournil Saint-Jean", "Graines", "La Huche", "Pains d'Antan"],
  } as Record<string, string[]>;
  const list = names[type] ?? names.cafe;
  return list.slice(0, n).map((name) => {
    const slug = name.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
    const hasSite = r() < 0.75;
    return {
      name,
      type,
      city,
      country,
      address: `${Math.floor(1 + r() * 120)} rue ${["de la République", "Victor Hugo", "du Marché", "Pasteur", "des Halles"][Math.floor(r() * 5)]}, ${city}`,
      website: hasSite ? `https://www.${slug}.fr` : undefined,
      email: hasSite && r() < 0.7 ? `contact@${slug}.fr` : undefined,
      phone: "+33 4 " + Math.floor(10 + r() * 89) + " " + Math.floor(10 + r() * 89) + " " + Math.floor(10 + r() * 89) + " " + Math.floor(10 + r() * 89),
      instagram: r() < 0.6 ? slug : undefined,
      rating: Math.round((3.8 + r() * 1.1) * 10) / 10,
      reviews: Math.floor(20 + r() * 900),
      source: "demo" as const,
    };
  });
}
