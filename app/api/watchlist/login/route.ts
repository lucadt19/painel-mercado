import { login } from "@/lib/server/session";

const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconhecido";

/** Entra com a senha da watchlist (cookie de 90 dias neste aparelho). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const attempt = typeof body?.password === "string" ? body.password : "";
  if (!attempt) return Response.json({ ok: false, error: "Digite a senha." }, { status: 400 });
  const result = await login(attempt, clientIp(req));
  return Response.json(result, { status: result.ok ? 200 : result.status });
}
