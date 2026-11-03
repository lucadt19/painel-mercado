import { getWorld } from "@/lib/server/data";

/** Aba Mundo: grandes empresas estrangeiras, em dólar. */
export async function GET() {
  return Response.json(await getWorld());
}
