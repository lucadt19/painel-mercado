import { getAsset } from "@/lib/server/data";
import { checkTicker } from "@/lib/server/known-tickers";

/** Tickers aceitos: letras, números, ponto, hífen e ^ (índices), até 12 caracteres. */
const TICKER = /^[A-Z0-9.^-]{1,12}$/;

const fail = (error: string, status: number) =>
  Response.json({ generatedAt: new Date().toISOString(), ok: false, error }, { status });

/**
 * Dados da página de um ativo: cotação, histórico, indicadores e proventos.
 * Só chama a brapi para tickers que existem (protege a cota).
 */
export async function GET(req: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const ticker = decodeURIComponent((await params).ticker).toUpperCase();
  if (!TICKER.test(ticker)) return fail("Ativo não encontrado.", 404);

  const known = await checkTicker(ticker, new URL(req.url).origin);
  if (known === "não") return fail("Ativo não encontrado.", 404);
  if (known === "indisponível") {
    return fail("A lista de ativos da B3 está indisponível no momento. Tente de novo em alguns minutos.", 503);
  }
  return Response.json(await getAsset(ticker));
}
