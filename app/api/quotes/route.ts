import { getQuotes } from "@/lib/server/data";

/** Cotações de índices, watchlist e câmbio. Cache compartilhado no servidor. */
export async function GET() {
  return Response.json(await getQuotes());
}
