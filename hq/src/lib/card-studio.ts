// Studio de cartes : le modèle d'une carte Wallet, les couleurs de l'app et les restaurants d'exemple.
// Les proportions et les couleurs reprennent l'app iOS (WalletPassPreview.swift, PassStripArt.swift, PassDesign.swift).

export type StripStyle = "photo" | "gradient" | "pattern" | "solid";
export type LogoKind = "icon" | "monogram" | "emoji" | "image";
export type LogoShape = "square" | "circle" | "none";

export interface StudioCard {
  id: string;
  name: string;
  updatedAt: number;
  // Couleurs
  bg: string;
  fg: string;
  label: string;
  // Logo
  logoKind: LogoKind;
  logoIcon: string;
  logoText: string;
  logoEmoji: string;
  logoImage: string | null;
  logoShape: LogoShape;
  // Bandeau
  strip: StripStyle;
  photo: string | null;
  zoom: number;
  posX: number;
  posY: number;
  dim: number;
  patternEmoji: string;
  // Programme
  model: "stamps" | "points";
  stampsRequired: number;
  stampsFilled: number;
  stampEmoji: string;
  points: number;
  pointsGoal: number;
  rewardTitle: string;
  showProgress: boolean;
  rewards: number;
  // Champs
  headerLabel: string;
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel: string;
  secondaryValue: string;
  auxiliaryLabel: string;
  auxiliaryValue: string;
  showQr: boolean;
}

export const PALETTE: { name: string; hex: string }[] = [
  { name: "Violet", hex: "#6B4AF2" },
  { name: "Lavande", hex: "#C9B8F5" },
  { name: "Framboise", hex: "#C2185B" },
  { name: "Rosé", hex: "#BE3A62" },
  { name: "Bordeaux", hex: "#7A1F3D" },
  { name: "Coucher", hex: "#C2410C" },
  { name: "Terracotta", hex: "#B4462A" },
  { name: "Safran", hex: "#F2A81C" },
  { name: "Or", hex: "#C9A227" },
  { name: "Olive", hex: "#4D5B2A" },
  { name: "Émeraude", hex: "#047857" },
  { name: "Menthe", hex: "#9FE6C8" },
  { name: "Lagon", hex: "#0E7490" },
  { name: "Océan", hex: "#1E3A8A" },
  { name: "Minuit", hex: "#141A2E" },
  { name: "Cacao", hex: "#4A3226" },
  { name: "Encre", hex: "#2B2F3A" },
  { name: "Noir", hex: "#111111" },
  { name: "Sable", hex: "#EFE2CB" },
  { name: "Crème", hex: "#F7F1E5" },
];

export const PHOTOS: { file: string; label: string; theme: string }[] = [
  { file: "burger", label: "Burger", theme: "Fast-food" },
  { file: "burger-gros-plan", label: "Burger gros plan", theme: "Fast-food" },
  { file: "burger-grill", label: "Grill", theme: "Fast-food" },
  { file: "poulet-frit", label: "Poulet frit", theme: "Fast-food" },
  { file: "poulet-roti", label: "Poulet rôti", theme: "Fast-food" },
  { file: "tacos", label: "Tacos", theme: "Fast-food" },
  { file: "tacos-assiette", label: "Tacos assiette", theme: "Fast-food" },
  { file: "pizza-four", label: "Pizza au four", theme: "Pizzeria" },
  { file: "pizza-table", label: "Pizza à table", theme: "Pizzeria" },
  { file: "pizza-boite", label: "Pizza à emporter", theme: "Pizzeria" },
  { file: "pasta", label: "Pâtes", theme: "Pizzeria" },
  { file: "pasta-bol", label: "Bol de pâtes", theme: "Pizzeria" },
  { file: "latte", label: "Latte", theme: "Café" },
  { file: "cappuccino", label: "Cappuccino", theme: "Café" },
  { file: "cafe-grains", label: "Grains de café", theme: "Café" },
  { file: "the", label: "Thé", theme: "Café" },
  { file: "petit-dejeuner", label: "Petit-déjeuner", theme: "Boulangerie" },
  { file: "croissants", label: "Croissants", theme: "Boulangerie" },
  { file: "viennoiseries", label: "Viennoiseries", theme: "Boulangerie" },
  { file: "pains", label: "Pains", theme: "Boulangerie" },
  { file: "donuts", label: "Donuts", theme: "Douceurs" },
  { file: "donut-rose", label: "Donut rose", theme: "Douceurs" },
  { file: "glace-fraise", label: "Glace fraise", theme: "Douceurs" },
  { file: "glace-cornet", label: "Cornet", theme: "Douceurs" },
  { file: "sushi", label: "Sushi", theme: "Restaurant" },
  { file: "makis", label: "Makis", theme: "Restaurant" },
  { file: "salade-bowl", label: "Salade", theme: "Restaurant" },
  { file: "salade-frites", label: "Salade frites", theme: "Restaurant" },
  { file: "bistrot", label: "Bistrot", theme: "Restaurant" },
  { file: "gastronomie", label: "Gastronomie", theme: "Haut de gamme" },
  { file: "table-dressee", label: "Table dressée", theme: "Haut de gamme" },
  { file: "filet-boeuf", label: "Filet de bœuf", theme: "Haut de gamme" },
  { file: "steak-braise", label: "Steak à la braise", theme: "Haut de gamme" },
  { file: "entrecote", label: "Entrecôte", theme: "Haut de gamme" },
  { file: "mojito", label: "Mojito", theme: "Bar" },
  { file: "citronnade", label: "Citronnade", theme: "Bar" },
  { file: "brochettes", label: "Brochettes", theme: "Fast-food" },
  { file: "hot-dog", label: "Hot-dog", theme: "Fast-food" },
  { file: "hot-dogs", label: "Hot-dogs", theme: "Fast-food" },
  { file: "bagel-sandwich", label: "Bagel garni", theme: "Fast-food" },
  { file: "bagel", label: "Bagel", theme: "Fast-food" },
  { file: "falafel", label: "Falafels", theme: "Fast-food" },
  { file: "falafel-assiette", label: "Assiette falafel", theme: "Fast-food" },
  { file: "fish-chips", label: "Fish & chips", theme: "Fast-food" },
  { file: "escalope-frites", label: "Escalope frites", theme: "Fast-food" },
  { file: "ribs", label: "Ribs", theme: "Restaurant" },
  { file: "curry", label: "Curry", theme: "Restaurant" },
  { file: "ramen", label: "Ramen", theme: "Restaurant" },
  { file: "tajine", label: "Tajine", theme: "Marocain" },
  { file: "couscous", label: "Couscous", theme: "Marocain" },
  { file: "jus-orange", label: "Jus d'orange", theme: "Café" },
  { file: "crepes-fraises", label: "Crêpes fraises", theme: "Douceurs" },
  { file: "crepes", label: "Crêpes", theme: "Douceurs" },
  { file: "gaufre", label: "Gaufre", theme: "Douceurs" },
  { file: "gaufres", label: "Gaufres", theme: "Douceurs" },
  { file: "macarons", label: "Macarons", theme: "Douceurs" },
  { file: "macarons-pastel", label: "Macarons pastel", theme: "Douceurs" },
  { file: "chocolat", label: "Chocolat", theme: "Douceurs" },
  { file: "brownie", label: "Brownie", theme: "Douceurs" },
  { file: "vin-blanc", label: "Vin blanc", theme: "Bar" },
  { file: "planche-apero", label: "Planche apéro", theme: "Bar" },
];

export const photoUrl = (file: string) => `/studio/photos/${file}.jpg`;
export const logoUrl = (slug: string) => `/studio/logos/${slug}.svg`;

export const LOGO_ICONS = [
  "Hamburger", "Pizza", "Coffee", "Croissant", "Sandwich", "Drumstick", "Beef", "Fish", "Soup", "Salad",
  "IceCreamCone", "Donut", "CakeSlice", "Cookie", "Dessert", "Wheat", "Wine", "Martini", "Beer", "CupSoda",
  "Citrus", "Cherry", "Leaf", "Flame", "ChefHat", "UtensilsCrossed", "CookingPot", "EggFried", "Popcorn", "Star",
  "Crown", "Heart", "Gem", "Sun", "Moon", "Sparkles",
] as const;

// ——— Couleurs ———

function rgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}
const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();

export function luminance(hex: string) {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Plus clair (amount > 0) ou plus foncé (amount < 0), comme `adjustingBrightness` dans l'app. */
export function shade(hex: string, amount: number) {
  const [r, g, b] = rgb(hex);
  return amount >= 0 ? toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount) : toHex(r * (1 + amount), g * (1 + amount), b * (1 + amount));
}

export function mix(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function rgba(hex: string, alpha: number) {
  const [r, g, b] = rgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Texte et étiquettes lisibles sur le fond choisi. */
export function autoColors(bg: string) {
  const light = luminance(bg) > 0.45;
  const fg = light ? "#1A1A1A" : "#FFFFFF";
  return { fg, label: mix(fg, bg, 0.3) };
}

// ——— Cartes ———

export const newId = () => Math.random().toString(36).slice(2, 10);

const BASE: Omit<StudioCard, "id" | "name" | "updatedAt" | "bg" | "fg" | "label"> = {
  logoKind: "icon",
  logoIcon: "Star",
  logoText: "",
  logoEmoji: "⭐️",
  logoImage: null,
  logoShape: "square",
  strip: "photo",
  photo: null,
  zoom: 1,
  posX: 50,
  posY: 50,
  dim: 0.3,
  patternEmoji: "⭐️",
  model: "stamps",
  stampsRequired: 10,
  stampsFilled: 7,
  stampEmoji: "",
  points: 240,
  pointsGoal: 400,
  rewardTitle: "un menu offert",
  showProgress: true,
  rewards: 2,
  headerLabel: "RÉCOMPENSES",
  primaryLabel: "MEMBRE",
  primaryValue: "SARAH M.",
  secondaryLabel: "STATUT",
  secondaryValue: "MEMBRE",
  auxiliaryLabel: "DEPUIS",
  auxiliaryValue: String(new Date().getFullYear()),
  showQr: true,
};

type Preset = Partial<StudioCard> & { name: string; bg: string; type: string; logo: string };

export const PRESETS: Preset[] = [
  { logo: "smash-club", name: "Smash Club", type: "Burger", bg: "#111111", fg: "#FFFFFF", label: "#F2A81C", logoIcon: "Hamburger", photo: "burger", stampsRequired: 8, stampsFilled: 5, primaryValue: "YANIS B.", rewardTitle: "un burger offert" },
  { logo: "pizzeria-nonna", name: "Pizzeria Nonna", type: "Pizzeria", bg: "#B4462A", logoIcon: "Pizza", photo: "pizza-four", stampsRequired: 10, stampsFilled: 7, primaryValue: "JULIE R." },
  { logo: "cafe-lumiere", name: "Café Lumière", type: "Café", bg: "#4A3226", label: "#E8C9A0", logoIcon: "Coffee", photo: "latte", stampsRequired: 10, stampsFilled: 6, stampEmoji: "☕️", primaryValue: "CAMILLE D." },
  { logo: "maison-brioche", name: "Maison Brioche", type: "Boulangerie", bg: "#F7F1E5", fg: "#3B2A1E", label: "#A0743C", logoIcon: "Croissant", photo: "croissants", dim: 0.15, stampsRequired: 8, stampsFilled: 3, primaryValue: "THOMAS L." },
  { logo: "sakura-bento", name: "Sakura Bento", type: "Japonais", bg: "#141A2E", label: "#F29CB0", logoIcon: "Fish", photo: "makis", model: "points", points: 320, pointsGoal: 500, rewardTitle: "un plateau offert", secondaryValue: "ARGENT", primaryValue: "INÈS K." },
  { logo: "taco-loco", name: "Taco Loco", type: "Tacos", bg: "#C2410C", logoKind: "emoji", logoEmoji: "🌮", photo: "tacos", stampsRequired: 8, stampsFilled: 6, primaryValue: "MEHDI A." },
  { logo: "crunchy-corner", name: "Crunchy Corner", type: "Poulet frit", bg: "#F2A81C", fg: "#1A1A1A", label: "#7A1F3D", logoIcon: "Drumstick", photo: "poulet-frit", dim: 0.2, stampsRequired: 10, stampsFilled: 8, primaryValue: "SAMIR O." },
  { logo: "gelato-bella", name: "Gelato Bella", type: "Glacier", bg: "#BE3A62", logoIcon: "IceCreamCone", photo: "glace-fraise", stampsRequired: 6, stampsFilled: 4, stampEmoji: "🍦", primaryValue: "LÉA P." },
  { logo: "comptoir-anna", name: "Le Comptoir d'Anna", type: "Bistrot", bg: "#2B2F3A", label: "#C9A227", logoKind: "monogram", logoText: "CA", logoShape: "circle", photo: "table-dressee", model: "points", points: 180, pointsGoal: 300, rewardTitle: "un dessert offert", primaryValue: "MARC V." },
  { logo: "atelier-braise", name: "Atelier Braise", type: "Steakhouse", bg: "#111111", label: "#C9A227", logoIcon: "Flame", photo: "steak-braise", model: "points", points: 860, pointsGoal: 1000, rewardTitle: "une entrecôte offerte", secondaryValue: "OR", primaryValue: "KARIM E." },
  { logo: "green-bowl", name: "Green Bowl", type: "Salades", bg: "#047857", label: "#9FE6C8", logoIcon: "Salad", photo: "salade-bowl", stampsRequired: 10, stampsFilled: 4, stampEmoji: "🥗", primaryValue: "NORA S." },
  { logo: "dar-atay", name: "Dar Atay", type: "Salon de thé", bg: "#4D5B2A", label: "#E8D9A8", logoIcon: "Leaf", photo: "the", stampsRequired: 8, stampsFilled: 5, primaryValue: "SALMA H." },
  { logo: "sweet-ring", name: "Sweet Ring", type: "Donuts", bg: "#C2185B", logoIcon: "Donut", photo: "donut-rose", stampsRequired: 6, stampsFilled: 5, stampEmoji: "🍩", primaryValue: "EMMA G." },
  { logo: "casa-mojito", name: "Casa Mojito", type: "Bar", bg: "#0E7490", label: "#9FE6C8", logoIcon: "Martini", photo: "mojito", model: "points", points: 90, pointsGoal: 150, rewardTitle: "un cocktail offert", primaryValue: "ADAM T." },
  { logo: "pasta-fresca", name: "Pasta Fresca", type: "Italien", bg: "#EFE2CB", fg: "#2B2F3A", label: "#B4462A", logoIcon: "ChefHat", photo: "pasta", dim: 0.15, stampsRequired: 10, stampsFilled: 2, primaryValue: "LUCAS F." },
  { logo: "table-saphir", name: "Table Saphir", type: "Gastronomique", bg: "#1E3A8A", label: "#C9B8F5", logoKind: "monogram", logoText: "TS", logoShape: "none", photo: "gastronomie", model: "points", points: 1250, pointsGoal: 2000, rewardTitle: "un menu dégustation", secondaryValue: "PLATINE", primaryValue: "SOPHIE B." },
  { logo: "mangal-grill", name: "Mangal Grill", type: "Brochettes", bg: "#7A1F3D", label: "#FFD166", photo: "brochettes", posY: 50, stampsRequired: 10, stampsFilled: 6, primaryValue: "RAYAN M.", rewardTitle: "un plateau offert" },
  { logo: "dar-tajine", name: "Dar Tajine", type: "Marocain", bg: "#9A3B1C", label: "#F3E3C9", photo: "tajine", posX: 40, posY: 42, model: "points", points: 140, pointsGoal: 250, rewardTitle: "un tajine offert", primaryValue: "YOUSSEF A." },
  { logo: "couscous-zahra", name: "Couscous Zahra", type: "Marocain", bg: "#0B6B4F", label: "#E8D9A8", photo: "couscous", posY: 55, stampsRequired: 8, stampsFilled: 5, primaryValue: "FATIMA Z." },
  { logo: "ty-billig", name: "Ty Billig", type: "Crêperie", bg: "#1E3A8A", label: "#BFD3FF", photo: "crepes-fraises", posY: 45, stampsRequired: 10, stampsFilled: 7, stampEmoji: "🥞", primaryValue: "MAËLLE K." },
  { logo: "ramen-kaze", name: "Ramen Kaze", type: "Ramen", bg: "#111111", label: "#F04438", photo: "ramen", posY: 40, model: "points", points: 260, pointsGoal: 400, rewardTitle: "un bol offert", primaryValue: "KENJI T." },
  { logo: "bagel-street", name: "Bagel Street", type: "Bagels", bg: "#2B2F3A", label: "#F2C14E", photo: "bagel-sandwich", posY: 48, stampsRequired: 8, stampsFilled: 3, primaryValue: "CHLOÉ M." },
  { logo: "fresh-press", name: "Fresh Press", type: "Bar à jus", bg: "#E8590C", photo: "jus-orange", posY: 55, stampsRequired: 6, stampsFilled: 4, stampEmoji: "🍊", primaryValue: "INÈS B." },
  { logo: "cacao-co", name: "Cacao & Co", type: "Chocolatier", bg: "#3A251B", label: "#E6C9A8", photo: "chocolat", posY: 50, model: "points", points: 75, pointsGoal: 120, rewardTitle: "un ballotin offert", primaryValue: "HÉLÈNE D." },
  { logo: "cave-saint-clair", name: "Cave Saint-Clair", type: "Bar à vin", bg: "#5C1530", label: "#F0D9A8", photo: "vin-blanc", posY: 40, model: "points", points: 420, pointsGoal: 600, rewardTitle: "une bouteille offerte", secondaryValue: "OR", primaryValue: "ANTOINE R." },
  { logo: "smoky-ribs", name: "Smoky Ribs", type: "Barbecue", bg: "#111111", label: "#F2A81C", photo: "ribs", posY: 50, stampsRequired: 8, stampsFilled: 6, primaryValue: "BILAL K." },
  { logo: "masala-house", name: "Masala House", type: "Indien", bg: "#F2A81C", fg: "#2A1200", label: "#7A1F3D", photo: "curry", posY: 50, dim: 0.2, stampsRequired: 10, stampsFilled: 5, primaryValue: "PRIYA S." },
  { logo: "sesame-falafel", name: "Sésame", type: "Falafels", bg: "#4D5B2A", label: "#F3E9C6", photo: "falafel", posY: 50, stampsRequired: 8, stampsFilled: 7, primaryValue: "OMAR H." },
  { logo: "fish-co", name: "Fish & Co", type: "Poisson", bg: "#0E5A70", label: "#9FE6C8", photo: "fish-chips", posY: 50, stampsRequired: 10, stampsFilled: 4, primaryValue: "OLIVIA W." },
  { logo: "dog-avenue", name: "Dog Avenue", type: "Hot-dogs", bg: "#D62828", label: "#FFE066", photo: "hot-dog", posY: 50, stampsRequired: 8, stampsFilled: 5, primaryValue: "NATHAN L." },
  { logo: "waffle-lab", name: "Waffle Lab", type: "Gaufres", bg: "#F5E3C3", fg: "#3B2412", label: "#8A4B14", photo: "gaufre", posY: 50, dim: 0.15, stampsRequired: 6, stampsFilled: 2, stampEmoji: "🧇", primaryValue: "ZOÉ P." },
  { logo: "rose-macaron", name: "Rose Macaron", type: "Pâtisserie", bg: "#F8D7E3", fg: "#5A1A33", label: "#9C2F5A", photo: "macarons", posY: 50, dim: 0.1, model: "points", points: 55, pointsGoal: 100, rewardTitle: "une boîte de 6", primaryValue: "CLARA V." },
];

export function fromPreset(p: Preset): StudioCard {
  const auto = autoColors(p.bg);
  const { type: _type, logo, ...rest } = p;
  void _type;
  return {
    ...BASE,
    fg: auto.fg,
    label: auto.label,
    ...rest,
    logoKind: "image",
    logoImage: logoUrl(logo),
    logoShape: "none",
    photo: p.photo ? photoUrl(p.photo) : null,
    patternEmoji: p.logoEmoji ?? p.stampEmoji ?? BASE.patternEmoji,
    id: newId(),
    updatedAt: Date.now(),
  } as StudioCard;
}

export function randomCard(): StudioCard {
  const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
  const base = fromPreset(pick(PRESETS));
  const colour = pick(PALETTE).hex;
  const auto = autoColors(colour);
  return { ...base, bg: colour, fg: auto.fg, label: auto.label, photo: photoUrl(pick(PHOTOS).file), zoom: 1, posX: 50, posY: 50, stampsFilled: Math.max(1, Math.floor(Math.random() * base.stampsRequired)) };
}

// ——— Cadrage du bandeau (même géométrie que StripFramingEditor.swift) ———

export const STRIP_RATIO = 375 / 144;
export const MAX_ZOOM = 4;

/** Fenêtre du bandeau dans la photo, en pixels de la photo. posX/posY = centre voulu en %, recadré pour rester dans l'image. */
export function stripWindow(w: number, h: number, zoom: number, posX: number, posY: number) {
  const z = Math.max(1, Math.min(zoom, MAX_ZOOM));
  const bw = w / h > STRIP_RATIO ? h * STRIP_RATIO : w;
  const bh = w / h > STRIP_RATIO ? h : w / STRIP_RATIO;
  const vw = bw / z;
  const vh = bh / z;
  const cx = Math.min(Math.max((posX / 100) * w, vw / 2), w - vw / 2);
  const cy = Math.min(Math.max((posY / 100) * h, vh / 2), h - vh / 2);
  return { x: cx - vw / 2, y: cy - vh / 2, vw, vh, cx, cy, posX: (cx / w) * 100, posY: (cy / h) * 100 };
}

const sizes = new Map<string, { w: number; h: number }>();
/** Taille réelle d'une image (mise en cache). */
export function imageSize(src: string): Promise<{ w: number; h: number }> {
  const known = sizes.get(src);
  if (known) return Promise.resolve(known);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = { w: img.naturalWidth, h: img.naturalHeight };
      sizes.set(src, s);
      resolve(s);
    };
    img.onerror = reject;
    img.src = src;
  });
}
export const cachedImageSize = (src: string) => sizes.get(src) ?? null;
