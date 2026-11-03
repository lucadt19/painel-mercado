import "server-only";

function intFromEnv(name: string, fallback: number, min = 1): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= min ? n : fallback;
}

/** Configuração lida das variáveis de ambiente (ver .env.example). */
export const serverEnv = {
  /** Vazio se não configurado; as chamadas à brapi então falham com aviso claro. */
  brapiToken: process.env.BRAPI_TOKEN?.trim() ?? "",
  quotesRefreshSeconds: intFromEnv("QUOTES_REFRESH_SECONDS", 1800, 60),
  brapiMaxTickersPerRequest: intFromEnv("BRAPI_MAX_TICKERS_PER_REQUEST", 1),
  brapiMonthlyQuota: intFromEnv("BRAPI_MONTHLY_QUOTA", 15000),
  /** Histórico pedido junto com a cotação: "3mo" (Gratuito) ou "1y" (Startup ou acima). */
  brapiHistoryRange: (process.env.BRAPI_HISTORY_RANGE?.trim() === "1y" ? "1y" : "3mo") as
    | "3mo"
    | "1y",
};
