import { route } from "@/lib/http";
import { getReviews } from "@/lib/reviews";

export const GET = route(async (req: Request) => getReviews(new URL(req.url).searchParams.has("refresh")));
