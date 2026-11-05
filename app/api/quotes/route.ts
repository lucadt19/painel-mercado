import { getQuotes } from "@/lib/server/data";

/**
 * Até 2 min: com a watchlist cheia, a rodada espera vagas no limite da brapi
 * (20 chamadas/min) em vez de falhar parte dos ativos.
 */
export const maxDuration = 120;

/** Cotações de índices, watchlist e câmbio. Cache compartilhado no servidor. */
export async function GET() {
  return Response.json(await getQuotes());
}
