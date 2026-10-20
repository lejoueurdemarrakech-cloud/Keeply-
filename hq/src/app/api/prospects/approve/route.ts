import { route } from "@/lib/http";
import { saveProspects } from "@/lib/prospects";

export const POST = route(async (req: Request) => {
  const { ids, approve = true } = (await req.json()) as { ids: string[]; approve?: boolean };
  let n = 0;
  await saveProspects((all) =>
    all.map((p) => {
      if (!ids.includes(p.id)) return p;
      if (approve && p.draft && p.email && p.source !== "demo" && ["nouveau", "pret"].includes(p.status)) {
        n++;
        return { ...p, status: "approuve", history: [...p.history, { at: new Date().toISOString(), event: "Approuvé pour l'envoi" }] };
      }
      if (!approve && p.status === "approuve") {
        n++;
        return { ...p, status: "pret" };
      }
      return p;
    }),
  );
  return { updated: n };
});
