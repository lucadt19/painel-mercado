import "server-only";
import { indices, trackedEtfs, watchlistSymbols, worldStocks } from "@/config/watchlist";
import { serverEnv } from "@/lib/server/env";

/**
 * Controle da cota mensal da brapi.
 *
 * Estimativa = chamadas por rodada × rodadas por dia × dias úteis, somando:
 *  - cotações (índices + watchlist + ETFs), a cada QUOTES_REFRESH_SECONDS no pregão da B3;
 *  - lista completa de ativos (2 páginas), no mesmo ritmo;
 *  - aba Mundo (1 chamada por empresa), de hora em hora no pregão americano.
 * Páginas de ativo (1 chamada por ativo a cada 30 min) entram como folga.
 */
const B3_HOURS_PER_DAY = 8.5; // 10h às 18h30 (pregão + margem do atraso)
const US_HOURS_PER_DAY = 7; // 9h30 às 16h30 em Nova York
const TRADING_DAYS_PER_MONTH = 22;
const LIST_CALLS_PER_ROUND = 2;
export const WORLD_REFRESH_SECONDS = 3600;

const groups = (n: number) => Math.ceil(n / serverEnv.brapiMaxTickersPerRequest);

/** `watchlist`: a lista em uso (a editável, do banco); padrão = config/watchlist.ts. */
export function estimateMonthlyCalls(watchlist: string[] = watchlistSymbols) {
  const quoteSymbols = new Set([...indices.map((i) => i.symbol), ...watchlist, ...trackedEtfs]);
  const b3Rounds = Math.ceil((B3_HOURS_PER_DAY * 3600) / serverEnv.quotesRefreshSeconds);
  const usRounds = Math.ceil((US_HOURS_PER_DAY * 3600) / WORLD_REFRESH_SECONDS);
  const quotes = groups(quoteSymbols.size) * b3Rounds;
  const list = LIST_CALLS_PER_ROUND * b3Rounds;
  const world = groups(Math.min(worldStocks.length, serverEnv.worldLimit)) * usRounds;
  return (quotes + list + world) * TRADING_DAYS_PER_MONTH;
}

let warnedEstimate = false;

/** Avisa no log (uma vez) se a estimativa passar de 80% da cota. */
export function checkEstimatedQuota(watchlist?: string[]) {
  const estimate = estimateMonthlyCalls(watchlist);
  const share = estimate / serverEnv.brapiMonthlyQuota;
  if (share > 0.8 && !warnedEstimate) {
    warnedEstimate = true;
    console.warn(
      `[cota brapi] Estimativa de ${estimate} requisições/mês = ${Math.round(share * 100)}% da cota de ${serverEnv.brapiMonthlyQuota}. Reduza tickers (watchlist, Mundo) ou aumente QUOTES_REFRESH_SECONDS.`,
    );
  }
  return { estimate, share };
}

/**
 * Contagem real de chamadas neste processo, por mês.
 * Na Vercel cada instância conta só as suas, então é um piso, não o total.
 * O número oficial fica no painel da brapi.
 */
const counter = { month: "", calls: 0, warned: false };

export function recordBrapiCalls(n: number) {
  const month = new Date().toISOString().slice(0, 7);
  if (counter.month !== month) Object.assign(counter, { month, calls: 0, warned: false });
  counter.calls += n;
  if (!counter.warned && counter.calls > 0.8 * serverEnv.brapiMonthlyQuota) {
    counter.warned = true;
    console.warn(
      `[cota brapi] ${counter.calls} chamadas em ${month} só nesta instância: mais de 80% da cota de ${serverEnv.brapiMonthlyQuota}.`,
    );
  }
}
