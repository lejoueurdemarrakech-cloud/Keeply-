import { listProspects } from "@/lib/prospects";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const rows = (await listProspects()).map((p) => ({
    nom: p.name,
    type: p.type,
    ville: p.city,
    pays: p.country,
    score: p.score,
    statut: p.status,
    email: p.email ?? "",
    verification: p.emailCheck ?? "",
    telephone: p.phone ?? "",
    site: p.website ?? "",
    instagram: p.instagram ?? "",
    note: p.rating ?? "",
    avis: p.reviews ?? "",
    signaux: p.signals.join(" | "),
    adresse: p.address ?? "",
    source: p.source,
  }));
  return new Response("﻿" + toCsv(rows), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="prospects-keeply.csv"` },
  });
}
