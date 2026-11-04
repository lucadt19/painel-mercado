import { getNews } from "@/lib/server/data";

/** Manchetes de economia e negócios (feeds RSS públicos): só título, veículo, horário e link. */
export async function GET() {
  return Response.json(await getNews());
}
