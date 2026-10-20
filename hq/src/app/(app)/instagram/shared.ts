export interface IgMedia {
  id: string;
  caption: string;
  type: string;
  timestamp: string;
  permalink: string;
  thumbnail: string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  reach: number;
  views: number;
}

export interface IgOverview {
  live: boolean;
  error?: string;
  account: { username: string; name: string; followers: number; following: number; mediaCount: number; picture: string };
  growth: { date: string; followers: number; gained: number; lost: number; reach: number; views: number; profileViews: number }[];
  media: IgMedia[];
  audience: { cities: { name: string; value: number }[]; ages: { name: string; value: number }[] };
  analysis: {
    heat: (number | null)[][];
    best: { day: number; hour: number; score: number; n: number }[];
    formats: { type: string; posts: number; avgReach: number; avgEngagement: number }[];
    hashtags: { tag: string; posts: number; avgReach: number }[];
    engagementRate: number;
    followersGained7: number;
    followersGainedPrev7: number;
    postsPerWeek: number;
    top: IgMedia[];
  };
}

export const DAY_NAMES = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
export const FORMAT_LABEL: Record<string, string> = { IMAGE: "Photo", CAROUSEL_ALBUM: "Carrousel", REEL: "Reel", VIDEO: "Vidéo" };

/** Prochaines dates correspondant aux meilleurs créneaux observés. */
export function nextSlots(best: { day: number; hour: number }[], count = 4) {
  const out: Date[] = [];
  const now = new Date();
  for (let add = 0; add < 14 && out.length < count; add++) {
    const d = new Date(now);
    d.setDate(now.getDate() + add);
    const dow = (d.getDay() + 6) % 7;
    for (const b of best) {
      if (b.day !== dow) continue;
      const slot = new Date(d);
      slot.setHours(b.hour, 0, 0, 0);
      if (slot > now) out.push(slot);
    }
  }
  if (out.length < count) {
    for (const h of [8, 12, 18]) {
      const d = new Date(now);
      d.setDate(now.getDate() + 1);
      d.setHours(h, 0, 0, 0);
      out.push(d);
    }
  }
  return out.sort((a, b) => a.getTime() - b.getTime()).slice(0, count);
}

export function toLocalInput(d: Date) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 16);
}
