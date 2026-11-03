import { getMacroHistory } from "@/lib/server/data";

/** Histórico de 5 anos de Selic meta, CDI e IPCA (Banco Central). */
export async function GET() {
  return Response.json(await getMacroHistory());
}
