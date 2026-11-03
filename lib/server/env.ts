import "server-only";

function intFromEnv(name: string, fallback: number, min = 1): number {
  const raw = process.env[name];
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n >= min ? n : fallback;
}

export type BrapiPlan = "free" | "startup" | "pro";

const plan: BrapiPlan =
  process.env.BRAPI_PLAN?.trim() === "pro"
    ? "pro"
    : process.env.BRAPI_PLAN?.trim() === "startup"
      ? "startup"
      : "free";

/**
 * O que cada plano da brapi libera (conferido em 03/11/2026 com um ativo
 * comum; os 4 tickers de teste da brapi são liberados em qualquer plano).
 */
const PLAN_FEATURES = {
  // worldLimit: quantas empresas da aba Mundo cabem no limite de 20 chamadas
  // por minuto junto com as cotações (no Gratuito, 1 ativo por chamada).
  free: { maxRange: "3mo", dividends: false, fundamentals: false, tickersPerCall: 1, worldLimit: 8 },
  startup: { maxRange: "1y", dividends: true, fundamentals: false, tickersPerCall: 10, worldLimit: 99 },
  pro: { maxRange: "5y", dividends: true, fundamentals: true, tickersPerCall: 20, worldLimit: 99 },
} as const;

/** Configuração lida das variáveis de ambiente (ver .env.example). */
export const serverEnv = {
  /** Vazio se não configurado; as chamadas à brapi então falham com aviso claro. */
  brapiToken: process.env.BRAPI_TOKEN?.trim() ?? "",
  brapiPlan: plan,
  /** Maior período de histórico diário do plano. */
  brapiMaxRange: PLAN_FEATURES[plan].maxRange as "3mo" | "1y" | "5y",
  /** Histórico das tabelas: 1 ano se o plano permitir (variação em 12 meses), senão 3 meses. */
  brapiHistoryRange: (PLAN_FEATURES[plan].maxRange === "3mo" ? "3mo" : "1y") as "3mo" | "1y",
  brapiDividends: PLAN_FEATURES[plan].dividends,
  brapiFundamentals: PLAN_FEATURES[plan].fundamentals,
  quotesRefreshSeconds: intFromEnv("QUOTES_REFRESH_SECONDS", 1800, 60),
  brapiMaxTickersPerRequest: intFromEnv(
    "BRAPI_MAX_TICKERS_PER_REQUEST",
    PLAN_FEATURES[plan].tickersPerCall,
  ),
  /** Quantas empresas de `worldStocks` a aba Mundo cota diretamente. */
  worldLimit: PLAN_FEATURES[plan].worldLimit as number,
  brapiMonthlyQuota: intFromEnv("BRAPI_MONTHLY_QUOTA", 15000),
};
