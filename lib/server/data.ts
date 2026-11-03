import "server-only";
import { cacheLife } from "next/cache";
import { fxPairs, indices, watchlistSymbols } from "@/config/watchlist";
import type { FxItem, MacroResponse, QuotesResponse, TreasuryResponse } from "@/lib/types";
import { serverEnv } from "@/lib/server/env";
import { fetchFxFromBrapi, fetchQuotes, PlanError } from "@/lib/server/brapi";
import { fetchFxFromPtax, fetchMacroIndicators } from "@/lib/server/bcb";
import { fetchTreasuryBonds, TESOURO_SOURCE } from "@/lib/server/tesouro";
import { errorMessage, isTransientError } from "@/lib/server/http";
import { checkEstimatedQuota } from "@/lib/server/quota";

/*
 * Funções com cache compartilhado ("use cache"). A resposta fica guardada no
 * servidor e é renovada no intervalo do cacheLife; assim, várias abas abertas
 * não multiplicam as chamadas às fontes.
 */

const WEEK = 7 * 24 * 3600;
/** Nova tentativa mais cedo quando alguma fonte falhou. */
const RETRY_SECONDS = 300;

/**
 * Se a brapi disser que o câmbio está fora do plano, não tentamos de novo por
 * 24 h, para não gastar a cota à toa. (Por instância do servidor.)
 */
let brapiFxBlockedUntil = 0;

/** Câmbio: tenta a brapi (mais fresca); se o plano não cobrir, usa a PTAX. */
async function fetchFx(): Promise<FxItem[]> {
  const pairs = fxPairs.map((p) => p.pair);
  if (Date.now() >= brapiFxBlockedUntil) {
    try {
      const fromBrapi = await fetchFxFromBrapi(pairs);
      if (fromBrapi.every((item) => item.ok)) return fromBrapi;
    } catch (err) {
      if (err instanceof PlanError) brapiFxBlockedUntil = Date.now() + 24 * 3600 * 1000;
    }
  }
  return fetchFxFromPtax(pairs);
}

export async function getQuotes(): Promise<QuotesResponse> {
  "use cache";
  const refresh = serverEnv.quotesRefreshSeconds;

  const symbols = indices.map((i) => i.symbol);
  const callsPerRound =
    Math.ceil(symbols.length / serverEnv.brapiMaxTickersPerRequest) +
    Math.ceil(watchlistSymbols.length / serverEnv.brapiMaxTickersPerRequest) +
    1; // câmbio
  checkEstimatedQuota(callsPerRound);

  const [indexItems, watchItems, fx] = await Promise.all([
    fetchQuotes(symbols),
    fetchQuotes(watchlistSymbols),
    fetchFx(),
  ]);

  // Falha passageira (limite por minuto, rede): tenta de novo em 5 minutos em
  // vez de esperar o intervalo inteiro. Falhas permanentes (ticker inexistente,
  // fora do plano) seguem o intervalo normal, para não gastar a cota.
  const anyTransient = [...indexItems, ...watchItems, ...fx].some(
    (i) => !i.ok && isTransientError(i.error),
  );
  if (anyTransient) cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: refresh, revalidate: refresh, expire: WEEK });

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: refresh,
    delayMinutes: Math.round(refresh / 60),
    historyRange: serverEnv.brapiHistoryRange,
    indices: indexItems,
    watchlist: watchItems,
    fx,
  };
}

export async function getMacro(): Promise<MacroResponse> {
  "use cache";
  // As séries mudam no máximo uma vez por dia; renovar de hora em hora
  // garante pegar a publicação do dia cedo, sem custo (API pública).
  const items = await fetchMacroIndicators();
  if (items.some((i) => !i.ok)) cacheLife({ stale: RETRY_SECONDS, revalidate: 300, expire: WEEK });
  else cacheLife({ stale: 3600, revalidate: 3600, expire: WEEK });

  return {
    generatedAt: new Date().toISOString(),
    source: "Banco Central do Brasil (SGS)",
    items,
  };
}

export async function getTreasury(): Promise<TreasuryResponse> {
  "use cache";
  // O arquivo do Tesouro Transparente muda uma vez por dia útil.
  const generatedAt = new Date().toISOString();
  try {
    const { referenceDate, bonds } = await fetchTreasuryBonds();
    cacheLife({ stale: 3600, revalidate: 3600, expire: WEEK });
    return { generatedAt, source: TESOURO_SOURCE, ok: true, referenceDate, bonds };
  } catch (err) {
    cacheLife({ stale: RETRY_SECONDS, revalidate: 300, expire: WEEK });
    return { generatedAt, source: TESOURO_SOURCE, ok: false, error: errorMessage(err) };
  }
}
