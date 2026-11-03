import { getTreasury } from "@/lib/server/data";

/** Taxas e preços do Tesouro Direto do último dia útil publicado. */
export async function GET() {
  return Response.json(await getTreasury());
}
