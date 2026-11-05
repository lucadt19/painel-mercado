import "server-only";
import { watchlistSymbols } from "@/config/watchlist";
import { redis } from "@/lib/server/redis";

/**
 * Watchlist editável, guardada no Upstash Redis (igual em todos os aparelhos).
 * Sem banco, ou se ele falhar, vale a lista padrão de config/watchlist.ts.
 */

const KEY = "painel:watchlist:v1";

/** Máximo de ativos: cada um custa ~300 chamadas/mês da brapi no plano Gratuito. */
export const WATCHLIST_MAX = 20;

/** Ativo da B3: 4 caracteres + 1 ou 2 dígitos (PETR4, BOVA11, AAPL34). */
export const TICKER_RE = /^[A-Z0-9]{4}\d{1,2}$/;

export type StoredWatchlist = { symbols: string[]; source: "banco" | "padrao" };

export async function readWatchlist(): Promise<StoredWatchlist> {
  try {
    const raw = await redis<string | null>(["GET", KEY]);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string" && TICKER_RE.test(s))) {
      return { symbols: parsed.slice(0, WATCHLIST_MAX), source: "banco" };
    }
  } catch {
    // Banco fora do ar ou não configurado: lista padrão.
  }
  return { symbols: [...watchlistSymbols], source: "padrao" };
}

export async function saveWatchlist(symbols: string[]): Promise<void> {
  await redis(["SET", KEY, JSON.stringify(symbols)]);
}
