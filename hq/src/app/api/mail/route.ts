import { route } from "@/lib/http";
import { inbox } from "@/lib/mail";

export const maxDuration = 60;
export const GET = route(async (req: Request) => inbox(new URL(req.url).searchParams.has("refresh")));
