import { getTreasuryHistory } from "@/lib/server/data";

/** Ids válidos: letras minúsculas, números e hífens (ver lib/treasury-id.ts). */
const ID = /^[a-z0-9-]{5,80}$/;

/** Histórico diário de um título do Tesouro Direto, desde que começou a ser negociado. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = decodeURIComponent((await params).id);
  if (!ID.test(id)) {
    return Response.json({ generatedAt: new Date().toISOString(), ok: false, error: "Título não encontrado." }, { status: 404 });
  }
  return Response.json(await getTreasuryHistory(id));
}
