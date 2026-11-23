import "server-only";
import { watchlistSymbols, worldStocks } from "@/config/watchlist";
import { redis } from "@/lib/server/redis";
import { serverEnv } from "@/lib/server/env";

/**
 * Watchlists editáveis, guardadas no Upstash Redis (iguais em todos os
 * aparelhos). Sem banco, ou se ele falhar, vale a lista padrão.
 *
 * - "br": ativos da B3 (aba Brasil). Cada um custa ~300 chamadas/mês da brapi.
 * - "intl": ações americanas (aba Internacional). São as mesmas cotadas na aba
 *   Mundo, de hora em hora com a bolsa de NY aberta: o limite é o do plano
 *   (`worldLimit`), e trocar as empresas não muda o consumo da cota.
 */
export type Market = "br" | "intl";

const CONFIG = {
  br: {
    key: "painel:watchlist:v1",
    max: 20,
    /** Ativo da B3: 4 caracteres + 1 ou 2 dígitos (PETR4, BOVA11, AAPL34). */
    re: /^[A-Z0-9]{4}\d{1,2}$/,
    defaults: () => [...watchlistSymbols],
  },
  intl: {
    key: "painel:watchlist-intl:v1",
    max: Math.min(serverEnv.worldLimit, 20),
    /** Ticker americano: letras, às vezes com ponto ou hífen (BRK-B). */
    re: /^[A-Z][A-Z0-9.-]{0,9}$/,
    defaults: () => worldStocks.slice(0, Math.min(serverEnv.worldLimit, 20)).map((w) => w.symbol),
  },
} as const;

export const marketMax = (m: Market) => CONFIG[m].max;
export const validTicker = (m: Market, s: string) => CONFIG[m].re.test(s);

export type StoredWatchlist = { symbols: string[]; source: "banco" | "padrao" };

export async function readWatchlist(m: Market = "br"): Promise<StoredWatchlist> {
  const c = CONFIG[m];
  try {
    const raw = await redis<string | null>(["GET", c.key]);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    if (Array.isArray(parsed) && parsed.every((s) => typeof s === "string" && c.re.test(s))) {
      return { symbols: parsed.slice(0, c.max), source: "banco" };
    }
  } catch {
    // Banco fora do ar ou não configurado: lista padrão.
  }
  return { symbols: c.defaults(), source: "padrao" };
}

export async function saveWatchlist(symbols: string[], m: Market = "br"): Promise<void> {
  await redis(["SET", CONFIG[m].key, JSON.stringify(symbols)]);
}
