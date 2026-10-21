import { route } from "@/lib/http";
import { setBudget, usageOverview, type AiBudget } from "@/lib/bridge";

export const GET = route(async () => usageOverview());

export const PUT = route(async (req: Request) => ({ budget: await setBudget((await req.json()) as Partial<AiBudget>) }));
