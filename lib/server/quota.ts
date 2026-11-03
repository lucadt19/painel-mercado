import "server-only";
import { serverEnv } from "@/lib/server/env";

/**
 * Controle da cota mensal da brapi.
 *
 * Estimativa = chamadas por rodada × rodadas por dia de pregão × dias úteis.
 * Uma "rodada" é uma renovação do cache de /api/quotes, que acontece no máximo
 * uma vez por QUOTES_REFRESH_SECONDS, não importa quantas abas estejam abertas.
 */
const TRADING_HOURS_PER_DAY = 8.5; // 10h às 18h30 (pregão + margem do atraso)
const TRADING_DAYS_PER_MONTH = 22;

export function estimateMonthlyCalls(callsPerRound: number): number {
  const roundsPerDay = Math.ceil((TRADING_HOURS_PER_DAY * 3600) / serverEnv.quotesRefreshSeconds);
  return callsPerRound * roundsPerDay * TRADING_DAYS_PER_MONTH;
}

let warnedEstimate = false;

/** Avisa no log se a estimativa passar de 80% da cota. */
export function checkEstimatedQuota(callsPerRound: number) {
  const estimate = estimateMonthlyCalls(callsPerRound);
  const share = estimate / serverEnv.brapiMonthlyQuota;
  if (share > 0.8 && !warnedEstimate) {
    warnedEstimate = true;
    console.warn(
      `[cota brapi] Estimativa de ${estimate} requisições/mês = ${Math.round(share * 100)}% da cota de ${serverEnv.brapiMonthlyQuota}. Reduza tickers ou aumente QUOTES_REFRESH_SECONDS.`,
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
