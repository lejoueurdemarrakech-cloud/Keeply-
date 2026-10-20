import { route } from "@/lib/http";
import { read, store } from "@/lib/store";

/** Bibliothèque : jeux de hashtags, idées sauvegardées, check-list de croissance. */
interface Library {
  hashtagSets: { id: string; name: string; tags: string }[];
  ideas: { id: string; title: string; format: string; hook: string; outline: string; done?: boolean }[];
  checklist: Record<string, string[]>; // date → actions cochées
}

const EMPTY: Library = { hashtagSets: [], ideas: [], checklist: {} };

export const GET = route(async () => read<Library>("ig:library", EMPTY));

export const PUT = route(async (req: Request) => {
  const body = (await req.json()) as Partial<Library>;
  const cur = await read<Library>("ig:library", EMPTY);
  const next = { ...cur, ...body };
  await store.set("ig:library", next);
  return next;
});
