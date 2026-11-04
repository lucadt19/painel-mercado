import { NextResponse, type NextRequest } from "next/server";

/**
 * Limite por visitante na rota da página de ativo (a única que chama a brapi
 * a cada ticker diferente). Protege a cota contra quem tente abrir milhares
 * de ativos em sequência.
 *
 * Vale por instância do servidor (memória local): é um freio simples, não
 * uma barreira perfeita. A proteção principal é a lista de tickers aceitos,
 * na própria rota.
 */
const LIMIT = 30;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido"
  );
}

export function proxy(req: NextRequest) {
  const now = Date.now();
  const ip = clientIp(req);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= LIMIT) {
    const retryAfter = Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
    return NextResponse.json(
      { ok: false, error: "Muitas consultas em pouco tempo. Tente de novo em instantes." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  recent.push(now);
  hits.set(ip, recent);

  // Limpeza ocasional para o mapa não crescer sem limite.
  if (hits.size > 5_000) {
    for (const [key, times] of hits) if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/asset/:path*",
};
