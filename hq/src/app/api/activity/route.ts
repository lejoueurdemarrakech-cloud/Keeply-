import { route } from "@/lib/http";
import { read } from "@/lib/store";
import type { ActivityEntry } from "@/lib/settings";

export const GET = route(async () => (await read<ActivityEntry[]>("activity", [])).slice(0, 60));
