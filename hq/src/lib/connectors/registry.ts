/**
 * Catalogue des connexions. Partagé entre le serveur et l'interface :
 * aucun secret ici, seulement la description des champs et le mode d'emploi.
 */

export type ConnectorId =
  | "appstore"
  | "googleplay"
  | "stripe"
  | "revenuecat"
  | "instagram"
  | "metaads"
  | "mail"
  | "outreach"
  | "anthropic"
  | "places"
  | "sentry"
  | "blob";

export type ConnectorGroup = "Ventes" | "Instagram & Meta" | "Mails" | "Prospection" | "Santé de l'app" | "Intelligence";

export interface ConnectorField {
  key: string;
  label: string;
  type?: "text" | "password" | "textarea" | "number";
  placeholder?: string;
  help?: string;
  optional?: boolean;
  /** Variable d'environnement qui peut remplacer ce champ. */
  env?: string;
}

export interface ConnectorDef {
  id: ConnectorId;
  name: string;
  group: ConnectorGroup;
  description: string;
  fields: ConnectorField[];
  steps: string[];
  docs?: string;
}

export const CONNECTORS: ConnectorDef[] = [
  {
    id: "appstore",
    name: "App Store Connect",
    group: "Ventes",
    description: "Ventes, téléchargements et avis de l'app iPhone.",
    fields: [
      { key: "issuerId", label: "Issuer ID", placeholder: "57246542-96fe-1a63-e053-0824d011072a", env: "APPSTORE_ISSUER_ID" },
      { key: "keyId", label: "Key ID", placeholder: "2X9R4HXF34", env: "APPSTORE_KEY_ID" },
      { key: "privateKey", label: "Clé privée (.p8)", type: "textarea", placeholder: "-----BEGIN PRIVATE KEY-----", env: "APPSTORE_PRIVATE_KEY" },
      { key: "vendorNumber", label: "Numéro de fournisseur", placeholder: "85012345", help: "Rapports > Paiements et rapports financiers, en haut à gauche.", env: "APPSTORE_VENDOR_NUMBER" },
      { key: "appId", label: "Apple ID de l'app", placeholder: "6478123456", help: "Sert aux avis et à la surveillance de la fiche.", optional: true, env: "APPSTORE_APP_ID" },
    ],
    steps: [
      "Ouvre appstoreconnect.apple.com > Utilisateurs et accès > Intégrations > Clés d'API App Store Connect.",
      "Crée une clé avec l'accès « Finances » (ou « Admin » pour aussi répondre aux avis).",
      "Télécharge le fichier .p8 (une seule fois possible) et colle son contenu ici avec l'Issuer ID et le Key ID.",
      "Le numéro de fournisseur est dans Paiements et rapports financiers.",
    ],
    docs: "https://developer.apple.com/documentation/appstoreconnectapi/download-sales-and-trends-reports",
  },
  {
    id: "googleplay",
    name: "Google Play Console",
    group: "Ventes",
    description: "Ventes Google Play (rapports mensuels) et avis Android.",
    fields: [
      { key: "serviceAccount", label: "Compte de service (JSON)", type: "textarea", placeholder: '{"type":"service_account",…}', env: "GOOGLEPLAY_SERVICE_ACCOUNT" },
      { key: "bucket", label: "Bucket des rapports", placeholder: "pubsite_prod_rev_01234567890987654321", help: "Play Console > Télécharger des rapports > Financiers > « Copier l'URI Cloud Storage ».", env: "GOOGLEPLAY_BUCKET" },
      { key: "packageName", label: "Nom du package", placeholder: "app.keeply.android", optional: true, env: "GOOGLEPLAY_PACKAGE" },
    ],
    steps: [
      "Dans Google Cloud, crée un compte de service et télécharge sa clé JSON.",
      "Dans Play Console > Utilisateurs et autorisations, invite l'adresse du compte de service avec « Afficher les données financières » et « Répondre aux avis ».",
      "Copie l'URI du bucket des rapports (commence par pubsite_prod_rev_).",
      "Les ventes Google arrivent par rapport mensuel, mis à jour chaque jour par Google.",
    ],
    docs: "https://support.google.com/googleplay/android-developer/answer/6135870",
  },
  {
    id: "stripe",
    name: "Stripe",
    group: "Ventes",
    description: "Paiements web, abonnements et MRR.",
    fields: [{ key: "secretKey", label: "Clé secrète (lecture seule conseillée)", type: "password", placeholder: "rk_live_…", env: "STRIPE_SECRET_KEY" }],
    steps: [
      "Dashboard Stripe > Développeurs > Clés API > Créer une clé restreinte.",
      "Donne l'accès en lecture à : Charges, Balance, Customers, Subscriptions, Invoices.",
      "Colle la clé (rk_live_…) ici.",
    ],
    docs: "https://docs.stripe.com/keys#limit-access",
  },
  {
    id: "revenuecat",
    name: "RevenueCat",
    group: "Ventes",
    description: "Si tes abonnements passent par RevenueCat : MRR, essais et abonnés actifs iOS + Android.",
    fields: [
      { key: "secretKey", label: "Clé secrète API v2", type: "password", placeholder: "sk_…", env: "REVENUECAT_SECRET_KEY" },
      { key: "projectId", label: "ID du projet", placeholder: "proj1ab2c3d4", env: "REVENUECAT_PROJECT_ID" },
    ],
    steps: ["RevenueCat > Project settings > API keys > + New secret API key (v2, lecture « Charts & metrics »)."],
    docs: "https://www.revenuecat.com/docs/api-v2",
  },
  {
    id: "instagram",
    name: "Instagram",
    group: "Instagram & Meta",
    description: "Publier, programmer et suivre les stats du compte pro Instagram.",
    fields: [
      { key: "accessToken", label: "Jeton d'accès longue durée", type: "password", env: "INSTAGRAM_ACCESS_TOKEN" },
      { key: "igUserId", label: "ID du compte Instagram", placeholder: "17841400000000000", env: "INSTAGRAM_USER_ID" },
      { key: "apiHost", label: "Hôte de l'API", placeholder: "graph.facebook.com", help: "graph.facebook.com (connexion via Facebook) ou graph.instagram.com (connexion Instagram).", optional: true, env: "INSTAGRAM_API_HOST" },
      { key: "graphVersion", label: "Version de l'API", placeholder: "v24.0", optional: true, env: "META_GRAPH_VERSION" },
    ],
    steps: [
      "Passe le compte Instagram en compte professionnel (Créateur ou Entreprise).",
      "Sur developers.facebook.com, crée une app « Entreprise » et ajoute le produit Instagram.",
      "Autorisations : instagram_basic, instagram_content_publish, instagram_manage_insights, instagram_manage_comments, pages_show_list.",
      "Génère un jeton, échange-le contre un jeton longue durée (60 jours) et colle-le ici avec l'ID du compte.",
    ],
    docs: "https://developers.facebook.com/docs/instagram-platform/content-publishing",
  },
  {
    id: "metaads",
    name: "Meta Ads",
    group: "Instagram & Meta",
    description: "Dépenses, résultats et coût par installation des campagnes Facebook / Instagram.",
    fields: [
      { key: "accessToken", label: "Jeton d'accès (ads_read)", type: "password", env: "META_ADS_ACCESS_TOKEN" },
      { key: "adAccountId", label: "ID du compte publicitaire", placeholder: "act_1234567890", env: "META_AD_ACCOUNT_ID" },
    ],
    steps: [
      "Dans Business Manager > Utilisateurs système, crée un utilisateur système avec accès au compte publicitaire.",
      "Génère un jeton avec l'autorisation ads_read et colle-le ici.",
      "L'ID du compte se trouve dans le Gestionnaire de publicités (act_…).",
    ],
    docs: "https://developers.facebook.com/docs/marketing-api/insights",
  },
  {
    id: "mail",
    name: "Boîte mail pro",
    group: "Mails",
    description: "Lire, trier et répondre aux mails (IMAP / SMTP : Gmail, Google Workspace, OVH, iCloud, Outlook…).",
    fields: [
      { key: "imapHost", label: "Serveur IMAP", placeholder: "imap.gmail.com", env: "MAIL_IMAP_HOST" },
      { key: "imapPort", label: "Port IMAP", type: "number", placeholder: "993", optional: true, env: "MAIL_IMAP_PORT" },
      { key: "smtpHost", label: "Serveur SMTP", placeholder: "smtp.gmail.com", env: "MAIL_SMTP_HOST" },
      { key: "smtpPort", label: "Port SMTP", type: "number", placeholder: "465", optional: true, env: "MAIL_SMTP_PORT" },
      { key: "user", label: "Adresse mail", placeholder: "contact@keeply.app", env: "MAIL_USER" },
      { key: "password", label: "Mot de passe d'application", type: "password", env: "MAIL_PASSWORD" },
      { key: "fromName", label: "Nom d'expéditeur", placeholder: "Keeply", optional: true, env: "MAIL_FROM_NAME" },
    ],
    steps: [
      "Gmail / Workspace : active la validation en 2 étapes puis crée un « mot de passe d'application » (myaccount.google.com/apppasswords).",
      "Serveurs Gmail : imap.gmail.com (993) et smtp.gmail.com (465).",
      "OVH : ssl0.ovh.net (993 / 465). iCloud : imap.mail.me.com (993) / smtp.mail.me.com (587).",
    ],
  },
  {
    id: "outreach",
    name: "Boîte d'envoi prospection",
    group: "Prospection",
    description: "Optionnel mais conseillé : une adresse sur un domaine secondaire (ex. keeply-app.fr) pour la prospection, afin de protéger ton domaine principal.",
    fields: [
      { key: "smtpHost", label: "Serveur SMTP", placeholder: "smtp.gmail.com", env: "OUTREACH_SMTP_HOST" },
      { key: "smtpPort", label: "Port SMTP", type: "number", placeholder: "465", optional: true, env: "OUTREACH_SMTP_PORT" },
      { key: "imapHost", label: "Serveur IMAP (pour voir les réponses)", placeholder: "imap.gmail.com", optional: true, env: "OUTREACH_IMAP_HOST" },
      { key: "user", label: "Adresse", placeholder: "bonjour@keeply-app.fr", env: "OUTREACH_USER" },
      { key: "password", label: "Mot de passe d'application", type: "password", env: "OUTREACH_PASSWORD" },
      { key: "fromName", label: "Nom affiché", placeholder: "Yanis de Keeply", optional: true, env: "OUTREACH_FROM_NAME" },
    ],
    steps: [
      "Achète un domaine proche du tien et crée une boîte dessus (Google Workspace, Zoho…).",
      "Configure SPF, DKIM et DMARC sur ce domaine, puis laisse-le chauffer 2 à 3 semaines avec peu d'envois.",
      "Sans cette boîte, la prospection utilise ta boîte mail pro.",
    ],
  },
  {
    id: "places",
    name: "Google Places",
    group: "Prospection",
    description: "Optionnel : trouve plus d'établissements, avec note et nombre d'avis Google. Sans clé, la recherche utilise OpenStreetMap (gratuit).",
    fields: [{ key: "apiKey", label: "Clé API Google Maps Platform", type: "password", env: "GOOGLE_PLACES_API_KEY" }],
    steps: [
      "console.cloud.google.com > API et services > Activer « Places API (New) ».",
      "Crée une clé API et limite-la à Places API.",
    ],
    docs: "https://developers.google.com/maps/documentation/places/web-service/text-search",
  },
  {
    id: "sentry",
    name: "Sentry",
    group: "Santé de l'app",
    description: "Optionnel : remonte les plantages et erreurs de l'app dans le rapport de santé.",
    fields: [
      { key: "authToken", label: "Jeton d'API", type: "password", env: "SENTRY_AUTH_TOKEN" },
      { key: "org", label: "Organisation", placeholder: "keeply", env: "SENTRY_ORG" },
      { key: "project", label: "Projet", placeholder: "keeply-ios", env: "SENTRY_PROJECT" },
      { key: "host", label: "Hôte", placeholder: "sentry.io", optional: true, env: "SENTRY_HOST" },
    ],
    steps: ["Sentry > Settings > Auth Tokens > Create New Token (event:read, project:read)."],
  },
  {
    id: "anthropic",
    name: "Claude (IA)",
    group: "Intelligence",
    description: "Légendes Instagram, tri des mails, brouillons de réponses, mails de prospection personnalisés, briefing du jour.",
    fields: [
      { key: "apiKey", label: "Clé API Anthropic", type: "password", placeholder: "sk-ant-…", env: "ANTHROPIC_API_KEY" },
      { key: "model", label: "Modèle", placeholder: "claude-opus-5-5", optional: true, env: "ANTHROPIC_MODEL" },
    ],
    steps: ["platform.claude.com > API Keys > Create Key. Ajoute un peu de crédit dans Billing."],
  },
  {
    id: "blob",
    name: "Stockage des images",
    group: "Instagram & Meta",
    description: "Instagram doit pouvoir télécharger tes photos depuis une adresse publique. Vercel Blob les héberge pour toi.",
    fields: [{ key: "token", label: "BLOB_READ_WRITE_TOKEN", type: "password", env: "BLOB_READ_WRITE_TOKEN" }],
    steps: ["Sur Vercel : Storage > Create > Blob, relie-le au projet : la variable est ajoutée toute seule."],
  },
];

export const connectorDef = (id: ConnectorId) => CONNECTORS.find((c) => c.id === id)!;
