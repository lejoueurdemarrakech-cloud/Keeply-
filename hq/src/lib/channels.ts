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

/** Messages types. {nom}, {ville}, {type} sont remplacés pour chaque commerce. Les [crochets] sont à écrire à la main. */
export const SCRIPTS: Script[] = [
  {
    id: "wa-1",
    channel: "whatsapp",
    title: "WhatsApp · premier message",
    when: "Le canal n°1 au Maroc. Entre 10 h et 11 h 30 ou entre 15 h et 17 h, jamais pendant le service.",
    body: "Bonjour, c'est Anas, de Keeply.\n\nJe fais des cartes de fidélité qui vont dans le téléphone des clients, sans appli à installer. J'aimerais vous en préparer une aux couleurs de {nom}, gratuitement, juste pour que vous voyiez le rendu.\n\nJe vous l'envoie ici ?",
  },
  {
    id: "wa-2",
    channel: "whatsapp",
    title: "WhatsApp · la carte démo (J+3)",
    when: "3 jours après, sans réponse. On envoie directement la carte faite dans le Studio : c'est elle qui parle.",
    body: "Voilà à quoi ressemblerait la carte de {nom}. [capture de la carte démo]\n\nVos clients scannent un QR au comptoir et elle reste dans leur téléphone. Si ce n'est pas le moment, aucun souci.",
  },
  {
    id: "mail-1",
    channel: "mail",
    title: "Mail · premier contact",
    when: "France, Belgique, Suisse, Luxembourg, Québec. Mardi à jeudi, 9 h à 11 h. Moins de 75 mots, aucun lien.",
    subject: "carte de fidélité {nom}",
    body: "Bonjour,\n\n[Une phrase vraie sur {nom} : ce que vous avez remarqué sur leur fiche, leur site ou leur Instagram.]\n\nLes clients qui passent une fois et ne reviennent pas ont souvent laissé la carte papier à la maison. Keeply la met dans leur téléphone, sans rien à installer.\n\nJe vous prépare un exemple à vos couleurs ?\n\nAnas\nFondateur de Keeply\n\nSi ce n'est pas pour vous, répondez « non » et je ne vous écrirai plus.",
  },
  {
    id: "mail-2",
    channel: "mail",
    title: "Mail · deuxième angle (J+5)",
    when: "5 jours après, dans le même fil. Un nouvel angle, pas un rappel.",
    subject: "vos habitués",
    body: "Bonjour,\n\nUn détail qui change beaucoup : quand il ne manque plus qu'un tampon à un client, son téléphone peut le lui rappeler. Sans SMS à payer, et vous le coupez quand vous voulez.\n\nSi l'exemple aux couleurs de {nom} vous tente, répondez « oui » et je vous l'envoie.\n\nAnas",
  },
  {
    id: "mail-3",
    channel: "mail",
    title: "Mail · on ferme la boucle (J+12)",
    when: "Le dernier. Moins de 40 mots, sans revendre.",
    subject: "dernier message",
    body: "Bonjour,\n\nJe ne vous relance plus après celui-ci. Si la fidélité devient un sujet pour {nom}, vous savez où me trouver.\n\nBonne continuation,\nAnas",
  },
  {
    id: "mail-en-1",
    channel: "mail",
    title: "Mail anglais · premier contact",
    when: "Canada anglophone, Pays-Bas, Australie, Bali. Under 75 words, no links.",
    subject: "loyalty card for {nom}",
    body: "Hi,\n\n[One true line about {nom}: something you noticed on their listing, website or Instagram.]\n\nCustomers who visit once and never come back have often left the paper card at home. Keeply puts it on their phone, with nothing to install.\n\nWant me to mock one up in your colours?\n\nAnas\nFounder, Keeply\n\nIf it's not for you, reply « no » and I won't write again.",
  },
  {
    id: "ig-1",
    channel: "instagram",
    title: "Instagram · message privé",
    when: "Après avoir aimé 2 ou 3 posts et laissé un vrai commentaire, quelques jours avant.",
    body: "Bonjour, [ce qui vous a plu chez eux, en vrai et en une phrase].\n\nJe suis Anas, je fais Keeply : des cartes de fidélité qui vont dans le téléphone des clients. Je peux vous montrer à quoi ressemblerait celle de {nom} ?",
  },
  {
    id: "call-1",
    channel: "appel",
    title: "Appel · 45 secondes",
    when: "En dehors du service. Demander le gérant, sinon l'heure où le rappeler.",
    body: "Bonjour, Anas, de Keeply. Je vous prends 30 secondes : est-ce que {nom} a une carte de fidélité aujourd'hui ?\n\n(Oui) Elle est en papier ? Keeply la met dans le téléphone de vos clients, et elle peut leur rappeler de revenir.\n(Non) C'est le plus simple : vos clients scannent un QR et la carte est dans leur téléphone.\n\nJe vous envoie à quoi ressemblerait la vôtre, par WhatsApp ou par mail ?",
  },
  {
    id: "visit-1",
    channel: "visite",
    title: "Visite · en boutique",
    when: "Maroc, Agadir en premier. 10 h à 11 h 30 ou 15 h à 17 h. iPhone chargé, carte démo prête.",
    body: "1. Commander quelque chose. Demander le gérant, sans vendre tout de suite.\n2. « Je m'appelle Anas, j'ai créé une app à Agadir pour les cafés et les restaurants. Je peux vous montrer quelque chose en une minute ? »\n3. Sortir l'iPhone : scanner le QR de démo, la carte arrive dans le Wallet. « Vos clients font ça, rien à installer. »\n4. Montrer une notification : « Quand vous voulez, une offre arrive sur leur écran. Sans payer de SMS. »\n5. « Je vous crée votre carte maintenant, avec votre logo ? 14 jours gratuits. »\n6. S'il hésite : laisser l'affiche de démo, prendre son WhatsApp, et le noter dans HQ (Visité + prochaine action).",
  },
];

/** Règles pour prospecter par mail depuis keeplyfidelity.app sans abîmer le domaine (qui envoie aussi les cartes des clients). */
export const SENDING_RULES: { titre: string; texte: string }[] = [
  { titre: "Une vraie boîte, écrite à la main", texte: "Les mails partent d'une vraie boîte (anas@keeplyfidelity.app), un par un, comme un mail normal. Jamais par Resend ni Brevo : ils sont réservés aux e-mails des clients, et leurs règles interdisent la prospection." },
  { titre: "Monter doucement", texte: "Semaine 1 : 10 mails par jour. Semaine 2 : 20. Ensuite 30 au plus. Un domaine neuf qui envoie 200 mails d'un coup finit en spam." },
  { titre: "Texte brut, zéro lien", texte: "Premier mail sans lien, sans image, sans pièce jointe et sans pixel de suivi. Le lien vient seulement quand la personne a répondu." },
  { titre: "Une phrase qui n'existe que pour eux", texte: "Chaque mail contient au moins un détail vrai sur ce commerce. Harvey le cherche ; s'il ne trouve rien, on écrit une phrase générale honnête plutôt que d'inventer." },
  { titre: "Des adresses de commerce, publiques", texte: "Seulement les adresses affichées par le commerce (site, fiche Google, Instagram). En France et en Belgique, la prospection par mail entre professionnels est permise si elle concerne leur métier et propose de se désinscrire." },
  { titre: "Un non est définitif", texte: "Mail qui revient : on retire l'adresse. « Non » ou pas de réponse après le 3e mail : on n'écrit plus jamais." },
];

export function fill(text: string, p: Pick<Prospect, "name" | "city" | "type">) {
  return text.replaceAll("{nom}", p.name).replaceAll("{ville}", p.city).replaceAll("{type}", kindOf(p.type));
}
