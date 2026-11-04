import "server-only";
import { cacheLife } from "next/cache";
import { fxPairs, indices, trackedEtfs, watchlistSymbols, worldStocks } from "@/config/watchlist";
import type {
  AssetResponse,
  FxItem,
  MacroHistoryResponse,
  MacroResponse,
  MarketListResponse,
  NewsResponse,
  QuoteItem,
  QuotesResponse,
  TreasuryResponse,
  WorldResponse,
} from "@/lib/types";
import { serverEnv } from "@/lib/server/env";
import {
  fetchAsset,
  fetchFxFromBrapi,
  fetchListedAssets,
  fetchQuotes,
  PlanError,
} from "@/lib/server/brapi";
import { fetchFxFromPtax, fetchMacroHistory, fetchMacroIndicators } from "@/lib/server/bcb";
import { fetchTreasuryBonds, TESOURO_SOURCE } from "@/lib/server/tesouro";
import { fetchNews } from "@/lib/server/news";
import { errorMessage, isTransientError } from "@/lib/server/http";
import { checkEstimatedQuota, WORLD_REFRESH_SECONDS } from "@/lib/server/quota";

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

/**
 * As tabelas só usam o primeiro ponto do histórico (variação no período) e
 * o último mês (mini-gráfico). Enviar o ano inteiro de cada ativo pesaria
 * no celular, então cortamos o resto.
 */
function slimHistory(items: QuoteItem[]): QuoteItem[] {
  return items.map((i) =>
    i.ok && i.quote.history.length > 25
      ? { ...i, quote: { ...i.quote, history: [i.quote.history[0], ...i.quote.history.slice(-23)] } }
      : i,
  );
}

/** Falha passageira (limite por minuto, rede)? Então vale tentar de novo em 5 min. */
const hasTransient = (items: { ok: boolean; error?: string }[]) =>
  items.some((i) => !i.ok && isTransientError(i.error ?? ""));

export async function getQuotes(): Promise<QuotesResponse> {
  "use cache";
  const refresh = serverEnv.quotesRefreshSeconds;
  checkEstimatedQuota();

  // Índices + watchlist + ETFs acompanhados, sem repetir tickers.
  const indexSymbols = indices.map((i) => i.symbol);
  const assetSymbols = [...new Set([...watchlistSymbols, ...trackedEtfs])];

  const [idx, assets, fx] = await Promise.all([
    fetchQuotes(indexSymbols),
    fetchQuotes(assetSymbols),
    fetchFx(),
  ]);
  const bySymbol = new Map(slimHistory(assets.items).map((i) => [i.symbol, i]));

  // Falhas permanentes (ticker inexistente, fora do plano) seguem o intervalo
  // normal, para não gastar a cota.
  if (hasTransient([...idx.items, ...assets.items, ...fx]))
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: refresh, revalidate: refresh, expire: WEEK });

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: refresh,
    delayMinutes: Math.round(refresh / 60),
    historyRange: idx.rangeUsed === "3mo" || assets.rangeUsed === "3mo" ? "3mo" : "1y",
    indices: slimHistory(idx.items),
    watchlist: watchlistSymbols.map((s) => bySymbol.get(s)!),
    etfs: trackedEtfs.map((s) => bySymbol.get(s)!),
    fx,
  };
}

/** Aba Mundo: grandes empresas estrangeiras, em dólar, de hora em hora. */
export async function getWorld(): Promise<WorldResponse> {
  "use cache";
  checkEstimatedQuota();
  const symbols = worldStocks.slice(0, serverEnv.worldLimit).map((w) => w.symbol);
  const { items, rangeUsed } = await fetchQuotes(symbols);

  if (hasTransient(items))
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: WORLD_REFRESH_SECONDS, revalidate: WORLD_REFRESH_SECONDS, expire: WEEK });

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: WORLD_REFRESH_SECONDS,
    historyRange: rangeUsed,
    items: slimHistory(items),
  };
}

/** Lista completa da B3 (busca e aba Brasil). */
export async function getMarketList(): Promise<MarketListResponse> {
  "use cache";
  const refresh = serverEnv.quotesRefreshSeconds;
  const now = new Date().toISOString();
  try {
    const assets = await fetchListedAssets();
    cacheLife({ stale: refresh, revalidate: refresh, expire: WEEK });
    return { generatedAt: now, fetchedAt: now, refreshSeconds: refresh, ok: true, assets };
  } catch (err) {
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
    return { generatedAt: now, fetchedAt: now, refreshSeconds: refresh, ok: false, error: errorMessage(err) };
  }
}

/** Página de um ativo: 1 chamada, guardada por 30 min. */
export async function getAsset(symbol: string): Promise<AssetResponse> {
  "use cache";
  const generatedAt = new Date().toISOString();
  try {
    const asset = await fetchAsset(symbol);
    cacheLife({ stale: 1800, revalidate: 1800, expire: WEEK });
    return { generatedAt, ok: true, ...asset };
  } catch (err) {
    const error = errorMessage(err);
    const retry = isTransientError(error) ? RETRY_SECONDS : 1800;
    cacheLife({ stale: retry, revalidate: retry, expire: WEEK });
    return { generatedAt, ok: false, error };
  }
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

/** Histórico de 5 anos das séries macro (página Renda Fixa). */
export async function getMacroHistory(): Promise<MacroHistoryResponse> {
  "use cache";
  const series = await fetchMacroHistory();
  if (Object.values(series).some((s) => !s.ok))
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: 6 * 3600, revalidate: 6 * 3600, expire: WEEK });

  return { generatedAt: new Date().toISOString(), source: "Banco Central do Brasil (SGS)", series };
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

/** Manchetes dos feeds RSS: renovadas a cada 5 minutos. */
export async function getNews(): Promise<NewsResponse> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: WEEK });
  return { generatedAt: new Date().toISOString(), ...(await fetchNews()) };
}
