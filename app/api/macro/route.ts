import { getMacro } from "@/lib/server/data";

/** Selic meta, CDI e IPCA (Banco Central). */
export async function GET() {
  return Response.json(await getMacro());
}
