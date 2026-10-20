import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tableau de bord personnel : tout est calculé à la demande, côté serveur, sans cache partagé.
  serverExternalPackages: ["imapflow", "mailparser", "nodemailer"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
