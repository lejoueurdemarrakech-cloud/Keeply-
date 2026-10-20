import { NextResponse } from "next/server";
import { isConfigured, recordTest } from "@/lib/connectors/config";
import { CONNECTORS, type ConnectorId } from "@/lib/connectors/registry";
import { testConnector } from "@/lib/connectors/test";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!CONNECTORS.some((c) => c.id === id)) return NextResponse.json({ error: "Connexion inconnue." }, { status: 404 });
  if (!(await isConfigured(id as ConnectorId))) return NextResponse.json({ ok: false, message: "Il manque des champs obligatoires." });
  try {
    const message = await testConnector(id as ConnectorId);
    await recordTest(id as ConnectorId, true, message);
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await recordTest(id as ConnectorId, false, message);
    return NextResponse.json({ ok: false, message });
  }
}
