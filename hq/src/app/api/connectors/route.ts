import { route } from "@/lib/http";
import { publicStatus } from "@/lib/connectors/config";
import { storeKind } from "@/lib/store";

export const GET = route(async () => ({
  connectors: await publicStatus(),
  store: storeKind(),
  cronSecret: !!process.env.CRON_SECRET,
  ingestToken: !!process.env.INGEST_TOKEN,
  password: !!process.env.ADMIN_PASSWORD,
}));
