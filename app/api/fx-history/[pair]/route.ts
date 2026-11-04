import { getFxHistory } from "@/lib/server/data";
import { FX_HISTORY_SERIES } from "@/lib/server/bcb";

/** Histórico de 5 anos da PTAX de uma moeda (Banco Central). Só as moedas configuradas. */
export async function GET(_req: Request, { params }: { params: Promise<{ pair: string }> }) {
  const pair = decodeURIComponent((await params).pair).toUpperCase();
  if (!FX_HISTORY_SERIES[pair]) {
    return Response.json({ generatedAt: new Date().toISOString(), ok: false, error: "Moeda não encontrada." }, { status: 404 });
  }
  return Response.json(await getFxHistory(pair));
}
