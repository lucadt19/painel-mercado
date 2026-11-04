import { getEarnings } from "@/lib/server/data";

/** Empresas da watchlist que divulgaram resultado nos últimos dias (CVM + manchetes). */
export async function GET() {
  return Response.json(await getEarnings());
}
