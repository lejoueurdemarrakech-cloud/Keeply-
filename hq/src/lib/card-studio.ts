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
];

export const photoUrl = (file: string) => `/studio/photos/${file}.jpg`;

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

type Preset = Partial<StudioCard> & { name: string; bg: string; type: string };

export const PRESETS: Preset[] = [
  { name: "Smash Club", type: "Burger", bg: "#111111", fg: "#FFFFFF", label: "#F2A81C", logoIcon: "Hamburger", photo: "burger", stampsRequired: 8, stampsFilled: 5, primaryValue: "YANIS B.", rewardTitle: "un burger offert" },
  { name: "Pizzeria Nonna", type: "Pizzeria", bg: "#B4462A", logoIcon: "Pizza", photo: "pizza-four", stampsRequired: 10, stampsFilled: 7, primaryValue: "JULIE R." },
  { name: "Café Lumière", type: "Café", bg: "#4A3226", label: "#E8C9A0", logoIcon: "Coffee", photo: "latte", stampsRequired: 10, stampsFilled: 6, stampEmoji: "☕️", primaryValue: "CAMILLE D." },
  { name: "Maison Brioche", type: "Boulangerie", bg: "#F7F1E5", fg: "#3B2A1E", label: "#A0743C", logoIcon: "Croissant", photo: "croissants", dim: 0.15, stampsRequired: 8, stampsFilled: 3, primaryValue: "THOMAS L." },
  { name: "Sakura Bento", type: "Japonais", bg: "#141A2E", label: "#F29CB0", logoIcon: "Fish", photo: "makis", model: "points", points: 320, pointsGoal: 500, rewardTitle: "un plateau offert", secondaryValue: "ARGENT", primaryValue: "INÈS K." },
  { name: "Taco Loco", type: "Tacos", bg: "#C2410C", logoKind: "emoji", logoEmoji: "🌮", photo: "tacos", stampsRequired: 8, stampsFilled: 6, primaryValue: "MEHDI A." },
  { name: "Crunchy Corner", type: "Poulet frit", bg: "#F2A81C", fg: "#1A1A1A", label: "#7A1F3D", logoIcon: "Drumstick", photo: "poulet-frit", dim: 0.2, stampsRequired: 10, stampsFilled: 8, primaryValue: "SAMIR O." },
  { name: "Gelato Bella", type: "Glacier", bg: "#BE3A62", logoIcon: "IceCreamCone", photo: "glace-fraise", stampsRequired: 6, stampsFilled: 4, stampEmoji: "🍦", primaryValue: "LÉA P." },
  { name: "Le Comptoir d'Anna", type: "Bistrot", bg: "#2B2F3A", label: "#C9A227", logoKind: "monogram", logoText: "CA", logoShape: "circle", photo: "table-dressee", model: "points", points: 180, pointsGoal: 300, rewardTitle: "un dessert offert", primaryValue: "MARC V." },
  { name: "Atelier Braise", type: "Steakhouse", bg: "#111111", label: "#C9A227", logoIcon: "Flame", photo: "steak-braise", model: "points", points: 860, pointsGoal: 1000, rewardTitle: "une entrecôte offerte", secondaryValue: "OR", primaryValue: "KARIM E." },
  { name: "Green Bowl", type: "Salades", bg: "#047857", label: "#9FE6C8", logoIcon: "Salad", photo: "salade-bowl", stampsRequired: 10, stampsFilled: 4, stampEmoji: "🥗", primaryValue: "NORA S." },
  { name: "Dar Atay", type: "Salon de thé", bg: "#4D5B2A", label: "#E8D9A8", logoIcon: "Leaf", photo: "the", stampsRequired: 8, stampsFilled: 5, primaryValue: "SALMA H." },
  { name: "Sweet Ring", type: "Donuts", bg: "#C2185B", logoIcon: "Donut", photo: "donut-rose", stampsRequired: 6, stampsFilled: 5, stampEmoji: "🍩", primaryValue: "EMMA G." },
  { name: "Casa Mojito", type: "Bar", bg: "#0E7490", label: "#9FE6C8", logoIcon: "Martini", photo: "mojito", model: "points", points: 90, pointsGoal: 150, rewardTitle: "un cocktail offert", primaryValue: "ADAM T." },
  { name: "Pasta Fresca", type: "Italien", bg: "#EFE2CB", fg: "#2B2F3A", label: "#B4462A", logoIcon: "ChefHat", photo: "pasta", dim: 0.15, stampsRequired: 10, stampsFilled: 2, primaryValue: "LUCAS F." },
  { name: "Table Saphir", type: "Gastronomique", bg: "#1E3A8A", label: "#C9B8F5", logoKind: "monogram", logoText: "TS", logoShape: "none", photo: "gastronomie", model: "points", points: 1250, pointsGoal: 2000, rewardTitle: "un menu dégustation", secondaryValue: "PLATINE", primaryValue: "SOPHIE B." },
];

export function fromPreset(p: Preset): StudioCard {
  const auto = autoColors(p.bg);
  const { type: _type, ...rest } = p;
  void _type;
  return {
    ...BASE,
    fg: auto.fg,
    label: auto.label,
    ...rest,
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
  return { ...base, bg: colour, fg: auto.fg, label: auto.label, photo: photoUrl(pick(PHOTOS).file), stampsFilled: Math.max(1, Math.floor(Math.random() * base.stampsRequired)) };
}
