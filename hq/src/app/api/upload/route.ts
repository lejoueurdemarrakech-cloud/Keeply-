import { promises as fs } from "node:fs";
import path from "node:path";
import { put } from "@vercel/blob";
import { route, HttpError } from "@/lib/http";
import { getConfig } from "@/lib/connectors/config";

export const POST = route(async (req: Request) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Aucun fichier reçu.");
  if (file.size > 100 * 1024 * 1024) throw new HttpError(400, "Fichier trop lourd (100 Mo max).");
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const name = `${Date.now()}-${safe}`;
  const { token } = await getConfig("blob");
  if (token) {
    const blob = await put(`hq/${name}`, file, { access: "public", token, contentType: file.type });
    return { url: blob.url, public: true };
  }
  if (process.env.VERCEL) throw new HttpError(400, "Configure « Stockage des images » (Vercel Blob) dans Connexions pour envoyer des fichiers.");
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}`, public: false };
});
