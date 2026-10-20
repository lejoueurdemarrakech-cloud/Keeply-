import { route } from "@/lib/http";
import { runHealth } from "@/lib/health";

export const maxDuration = 300;
export const POST = route(() => runHealth("manuel"));
