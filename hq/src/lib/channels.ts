import type { Prospect } from "@/lib/types";

/** Canaux pour toucher un commerce : mail, WhatsApp, appel, Instagram, visite. */
const DIAL: Record<string, string> = { FR: "33", BE: "32", CH: "41", LU: "352", MC: "377", MA: "212", CA: "1" };

/** Numéro au format international, chiffres seulement (ex. 212612345678). */
export function e164(phone: string | undefined, country: string) {
  if (!phone) return "";
  let d = phone.replace(/[^\d+]/g, "");
  if (d.startsWith("+")) return d.slice(1);
  if (d.startsWith("00")) return d.slice(2);
  const code = DIAL[country] ?? "";
  if (d.startsWith("0")) d = d.slice(1);
  return code && !d.startsWith(code) ? code + d : d;
}

/** Portable probable, donc WhatsApp probable (au Maroc, presque tous les commerces y répondent). */
export function mobile(p: Pick<Prospect, "phone" | "country">) {
  const n = e164(p.phone, p.country);
  return /^212[67]|^33[67]|^324|^417|^3526|^3776/.test(n);
}

export const telLink = (p: Pick<Prospect, "phone" | "country">) => (p.phone ? `tel:+${e164(p.phone, p.country)}` : "");
export const waLink = (p: Pick<Prospect, "phone" | "country">, text: string) => `https://wa.me/${e164(p.phone, p.country)}?text=${encodeURIComponent(text)}`;
export const igLink = (p: Pick<Prospect, "instagram">) => (p.instagram ? `https://instagram.com/${p.instagram.replace(/^@/, "")}` : "");
export const mapsLink = (p: Pick<Prospect, "lat" | "lon" | "name" | "address" | "city">) =>
  p.lat && p.lon ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.address ?? ""} ${p.city}`)}`;

/** Itinéraire Google Maps à pied passant par les commerces (10 maximum). */
export function routeLink(list: Pick<Prospect, "lat" | "lon" | "name" | "address" | "city">[]) {
  const pts = list.slice(0, 10).map((p) => (p.lat && p.lon ? `${p.lat},${p.lon}` : `${p.name} ${p.address ?? ""} ${p.city}`));
  if (pts.length < 2) return pts.length ? mapsLink(list[0]) : "";
  const q = new URLSearchParams({ api: "1", travelmode: "walking", origin: pts[0], destination: pts[pts.length - 1] });
  if (pts.length > 2) q.set("waypoints", pts.slice(1, -1).join("|"));
  return `https://www.google.com/maps/dir/?${q}`;
}

/** Tri « tournée » : on part du premier et on va chaque fois au plus proche. */
export function walkingOrder<T extends Pick<Prospect, "lat" | "lon">>(list: T[]) {
  const withPos = list.filter((p) => p.lat && p.lon);
  const rest = list.filter((p) => !(p.lat && p.lon));
  const out: T[] = [];
  const left = [...withPos];
  let cur = left.shift();
  while (cur) {
    out.push(cur);
    let best = -1;
    let bd = Infinity;
    left.forEach((p, i) => {
      const d = (p.lat! - cur!.lat!) ** 2 + ((p.lon! - cur!.lon!) * Math.cos((cur!.lat! * Math.PI) / 180)) ** 2;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    cur = best >= 0 ? left.splice(best, 1)[0] : undefined;
  }
  return [...out, ...rest];
}

const KIND: Record<string, string> = { cafe: "café", restaurant: "restaurant", fastfood: "fast-food", boulangerie: "boulangerie", bar: "bar", glacier: "salon de thé" };
export const kindOf = (type: string) => KIND[type] ?? "commerce";

export interface Script {
  id: string;
  channel: "whatsapp" | "mail" | "instagram" | "appel" | "visite";
  title: string;
  when: string;
  subject?: string;
  body: string;
}

/** Messages types. {nom}, {ville}, {type} sont remplacés pour chaque commerce. */
export const SCRIPTS: Script[] = [
  {
    id: "wa-1",
    channel: "whatsapp",
    title: "WhatsApp · premier message",
    when: "Le plus efficace au Maroc. Entre 10 h et 11 h 30 ou 15 h et 17 h, jamais pendant le service.",
    body: "Bonjour, ici Anas, fondateur de Keeply. Je vous écris parce que {nom} a l'air d'avoir des habitués.\n\nKeeply met votre carte de fidélité dans le téléphone de vos clients (Apple Wallet et Google Wallet), sans application à installer pour eux. Ils scannent un QR code au comptoir, et vous pouvez leur envoyer une offre sur leur écran verrouillé quand vous voulez.\n\nJe peux vous montrer en 2 minutes en vidéo ? Essai gratuit 14 jours.",
  },
  {
    id: "wa-2",
    channel: "whatsapp",
    title: "WhatsApp · relance (J+3)",
    when: "3 jours après sans réponse. Une seule relance, courte.",
    body: "Bonjour, je me permets de revenir vers vous pour Keeply. Je vous envoie une vidéo de 30 secondes qui montre comment vos clients gardent la carte {nom} dans leur téléphone ? Si ce n'est pas le moment, aucun souci.",
  },
  {
    id: "mail-1",
    channel: "mail",
    title: "Mail · premier contact",
    when: "France, Belgique, Suisse, Luxembourg, Canada. Mardi à jeudi, 9 h à 11 h.",
    subject: "La carte de fidélité de {nom}, dans le téléphone de vos clients",
    body: "Bonjour,\n\nJe m'appelle Anas et j'ai créé Keeply, une app qui met la carte de fidélité d'un {type} directement dans Apple Wallet et Google Wallet de ses clients.\n\nVos clients scannent un QR code au comptoir, sans application à installer. La carte ne se perd plus, et vous pouvez leur envoyer une offre sur leur écran verrouillé, sans frais d'envoi. Tampons ou points, remises en % ou en €, offres automatiques : tout s'active ou se coupe, vous gardez la main.\n\nL'essai est gratuit pendant 14 jours, sur l'App Store. Je peux vous montrer en 10 minutes, quand vous voulez.\n\nBelle journée,\nAnas, fondateur de Keeply\nkeeplyfidelity.app",
  },
  {
    id: "mail-2",
    channel: "mail",
    title: "Mail · relance (J+5)",
    when: "5 jours après, en répondant au premier mail.",
    subject: "Re : la carte de fidélité de {nom}",
    body: "Bonjour,\n\nJe remonte mon message au cas où il serait passé sous la pile. Une question simple : comment faites-vous revenir vos clients aujourd'hui ?\n\nSi Keeply peut aider {nom}, je vous montre en 10 minutes. Sinon, dites-le-moi et je ne vous écris plus.\n\nAnas",
  },
  {
    id: "ig-1",
    channel: "instagram",
    title: "Instagram · message privé",
    when: "Après avoir aimé 2 ou 3 de leurs posts et laissé un vrai commentaire.",
    body: "Bonjour {nom}, votre compte donne faim. Je suis le fondateur de Keeply : on met la carte de fidélité des {type}s dans le Wallet de leurs clients, sans app à installer. Je peux vous envoyer à quoi ressemblerait la vôtre ?",
  },
  {
    id: "call-1",
    channel: "appel",
    title: "Appel · 45 secondes",
    when: "En dehors des heures de service. Demander le gérant, sinon l'heure où le rappeler.",
    body: "Bonjour, Anas de Keeply. Je ne vous prends que 30 secondes : je voulais savoir si {nom} a une carte de fidélité aujourd'hui ?\n\n(Oui) Elle est en carton ? Keeply la met dans le téléphone de vos clients, avec une offre qui arrive sur leur écran verrouillé quand vous voulez.\n(Non) C'est justement le plus simple : vos clients scannent un QR code et la carte est dans leur téléphone.\n\nJe vous envoie une vidéo de 30 secondes par WhatsApp ou par mail ?",
  },
  {
    id: "visit-1",
    channel: "visite",
    title: "Visite · le pitch en boutique",
    when: "Maroc (Agadir en premier). 10 h à 11 h 30 ou 15 h à 17 h. iPhone chargé avec la démo prête.",
    body: "1. Commander quelque chose. Demander le gérant, sans vendre tout de suite.\n2. « Je m'appelle Anas, j'ai créé une app à Agadir pour les cafés et les restaurants. Je peux vous montrer un truc en 1 minute ? »\n3. Sortir l'iPhone : scanner le QR de démo, la carte arrive dans le Wallet. « Vos clients font ça, rien à installer. »\n4. Montrer une notification : « Et quand vous voulez, une offre arrive sur leur écran. Sans payer de SMS. »\n5. « Je vous crée votre carte maintenant, avec votre logo, en 5 minutes ? 14 jours gratuits. »\n6. S'il hésite : laisser l'affiche de démo et prendre son WhatsApp. Le noter dans HQ (Visité + prochaine action).",
  },
];

export function fill(text: string, p: Pick<Prospect, "name" | "city" | "type">) {
  return text.replaceAll("{nom}", p.name).replaceAll("{ville}", p.city).replaceAll("{type}", kindOf(p.type));
}
