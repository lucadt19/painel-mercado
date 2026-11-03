import { getMarketList } from "@/lib/server/data";

/** Todos os ativos listados na B3 (busca e aba Brasil). */
export async function GET() {
  return Response.json(await getMarketList());
}
