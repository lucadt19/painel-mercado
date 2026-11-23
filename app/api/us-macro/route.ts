import { getUsMacro } from "@/lib/server/data";

/** Juros do Fed (faixa-alvo) e inflação CPI dos EUA (FRED). */
export async function GET() {
  return Response.json(await getUsMacro());
}
