import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getConfig } from "./config";
import type { ConnectorId } from "./registry";
import { testAppStore } from "./appstore";
import { testGooglePlay } from "./google";
import { testStripe } from "./stripe";
import { testRevenueCat } from "./revenuecat";
import { adsTest, igTest } from "./meta";
import { testMail } from "@/lib/mail";
import { fetchJson } from "@/lib/http";
import nodemailer from "nodemailer";

export async function testConnector(id: ConnectorId): Promise<string> {
  const cfg = await getConfig(id);
  switch (id) {
    case "appstore":
      return testAppStore(cfg);
    case "googleplay":
      return testGooglePlay(cfg);
    case "stripe":
      return testStripe(cfg);
    case "revenuecat":
      return testRevenueCat(cfg);
    case "instagram":
      return igTest(cfg);
    case "metaads":
      return adsTest(cfg);
    case "mail":
      return testMail(cfg);
    case "outreach": {
      const port = Number(cfg.smtpPort || 465);
      await nodemailer.createTransport({ host: cfg.smtpHost, port, secure: port === 465, auth: { user: cfg.user, pass: cfg.password } }).verify();
      return "Envoi SMTP vérifié.";
    }
    case "anthropic": {
      const c = new Anthropic({ apiKey: cfg.apiKey });
      const m = await c.models.retrieve(cfg.model || "claude-opus-5-5");
      return `Connecté. Modèle : ${m.display_name}.`;
    }
    case "places": {
      await fetchJson("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": cfg.apiKey, "X-Goog-FieldMask": "places.id" },
        body: JSON.stringify({ textQuery: "café Paris", pageSize: 1 }),
      });
      return "Clé Google Places valide.";
    }
    case "sentry": {
      const issues = await fetchJson<unknown[]>(`https://${cfg.host || "sentry.io"}/api/0/projects/${cfg.org}/${cfg.project}/issues/?limit=1`, {
        headers: { Authorization: `Bearer ${cfg.authToken}` },
      });
      return `Connecté au projet ${cfg.project} (${issues.length ? "des erreurs existent" : "aucune erreur"}).`;
    }
    case "blob":
      return cfg.token ? "Jeton présent. L'envoi d'une image le vérifiera." : "Jeton manquant.";
  }
}
