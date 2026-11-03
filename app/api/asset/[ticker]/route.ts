import { getAsset } from "@/lib/server/data";

/** Tickers aceitos: letras, números, ponto, hífen e ^ (índices), até 12 caracteres. */
const TICKER = /^[A-Z0-9.^-]{1,12}$/;

/** Dados da página de um ativo: cotação, histórico, indicadores e proventos. */
export async function GET(_req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const ticker = decodeURIComponent((await params).ticker).toUpperCase();
  if (!TICKER.test(ticker)) {
    return Response.json({ ok: false, error: "Ticker inválido." }, { status: 400 });
  }
  return Response.json(await getAsset(ticker));
}
