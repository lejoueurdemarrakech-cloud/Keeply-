import { route } from "@/lib/http";
import { todayOverview } from "@/lib/today";

export const maxDuration = 60;
export const GET = route(todayOverview);
