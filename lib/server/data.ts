import "server-only";
import { cacheLife } from "next/cache";
import { fxPairs, indices, trackedEtfs, watchlistSymbols, worldStocks } from "@/config/watchlist";
import type {
  AssetResponse,
  EarningsResponse,
  FxHistoryResponse,
  FxItem,
  MacroHistoryResponse,
  MacroResponse,
  MarketListResponse,
  NewsResponse,
  QuoteItem,
  QuotesResponse,
  TreasuryHistoryResponse,
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
import { fetchFxFromPtax, fetchFxHistory, fetchMacroHistory, fetchMacroIndicators } from "@/lib/server/bcb";
import { fetchTreasuryAll, TESOURO_SOURCE } from "@/lib/server/tesouro";
import { fetchNews } from "@/lib/server/news";
import { buildEarnings, fetchCvmFilings } from "@/lib/server/earnings";
import { closeOnOrBefore, loadB3History, mergeHistory } from "@/lib/server/b3-history";
import { errorMessage, isTransientError } from "@/lib/server/http";
import { checkEstimatedQuota, WORLD_REFRESH_SECONDS } from "@/lib/server/quota";

/*
 * Funções com cache compartilhado ("use cache"). A resposta fica guardada no
 * servidor e é renovada no intervalo do cacheLife; assim, várias abas abertas
 * não multiplicam as chamadas às fontes.
 */

const WEEK = 7 * 24 * 3600;
const BUILD_WAIT_MSG = "Aguardando a primeira consulta após a publicação.";
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

/**
 * Variação em 12 meses no plano Gratuito: a brapi entrega só 3 meses, então o
 * fechamento de 1 ano atrás vem dos arquivos da B3 e entra como primeiro
 * ponto do histórico (as tabelas calculam a variação a partir dele).
 * Devolve também se todos os ativos conseguiram esse ponto.
 */
async function withYearAgo(items: QuoteItem[]): Promise<{ items: QuoteItem[]; complete: boolean }> {
  // Sem nenhum ativo com dados (ex.: na publicação), não dá para afirmar "12 meses".
  let complete = items.some((i) => i.ok);
  const out = await Promise.all(
    items.map(async (item) => {
      if (!item.ok || !item.quote.history.length) return item;
      const recent = item.quote.history;
      const last = recent[recent.length - 1].date;
      const yearAgo = `${Number(last.slice(0, 4)) - 1}${last.slice(4)}`;
      if (recent[0].date <= yearAgo) return item; // o plano já cobre 1 ano
      const { history } = mergeHistory(await loadB3History(item.symbol), recent);
      const point = closeOnOrBefore(history, yearAgo);
      // Aceita até 10 dias antes (feriados, ativo sem negócio no dia).
      if (!point || Date.parse(yearAgo) - Date.parse(point.date) > 10 * 86_400_000) {
        complete = false;
        return item;
      }
      return { ...item, quote: { ...item.quote, history: [point, ...recent] } };
    }),
  );
  return { items: out, complete };
}

/** Falha passageira (limite por minuto, rede)? Então vale tentar de novo em 5 min. */
const hasTransient = (items: { ok: boolean; error?: string }[]) =>
  items.some((i) => !i.ok && isTransientError(i.error ?? ""));

/**
 * Último valor bom de cada ativo, no servidor. Se a fonte falhar por motivo
 * passageiro, devolvemos esse valor (marcado como `stale`, com o horário
 * original) em vez de "indisponível". Vale enquanto a instância do servidor
 * estiver viva; o navegador tem a sua própria cópia, que sobrevive a isso.
 */
const lastGood = ((globalThis as typeof globalThis & { __lastGoodItems?: Map<string, unknown> }).__lastGoodItems ??=
  new Map<string, unknown>());

function withLastGood<T extends { ok: boolean; error?: string; stale?: { error: string } }>(
  items: T[],
  key: (item: T) => string,
): T[] {
  return items.map((item) => {
    const k = key(item);
    if (item.ok) {
      lastGood.set(k, item);
      return item;
    }
    const previous = lastGood.get(k) as T | undefined;
    return previous && isTransientError(item.error ?? "") ? { ...previous, stale: { error: item.error! } } : item;
  });
}

export async function getQuotes(): Promise<QuotesResponse> {
  "use cache";
  const refresh = serverEnv.quotesRefreshSeconds;
  checkEstimatedQuota();

  // Índices + watchlist + ETFs acompanhados, sem repetir tickers.
  const indexSymbols = indices.map((i) => i.symbol);
  const assetSymbols = [...new Set([...watchlistSymbols, ...trackedEtfs])];

  // Na publicação (build), o Next monta as rotas mais de uma vez e em processos
  // separados: as chamadas à brapi passam das 20/min. Então o build não consulta
  // a brapi; a primeira consulta de verdade acontece 1 min depois, no servidor
  // (com o limitador). Até lá, o navegador mostra os últimos valores que guardou.
  const building = process.env.NEXT_PHASE === "phase-production-build";
  const waiting = (symbols: string[]) => ({
    items: symbols.map((symbol): QuoteItem => ({ symbol, ok: false, error: BUILD_WAIT_MSG })),
    rangeUsed: serverEnv.brapiHistoryRange,
  });

  const [idx, assets, fx] = await Promise.all([
    building ? waiting(indexSymbols) : fetchQuotes(indexSymbols),
    building ? waiting(assetSymbols) : fetchQuotes(assetSymbols),
    fetchFx(),
  ]);
  // Falhas permanentes (ticker inexistente, fora do plano) seguem o intervalo
  // normal, para não gastar a cota.
  if (building) cacheLife({ stale: 60, revalidate: 60, expire: WEEK });
  else if (hasTransient([...idx.items, ...assets.items, ...fx]))
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: refresh, revalidate: refresh, expire: WEEK });

  const yearAgo = await withYearAgo(assets.items);
  const bySymbol = new Map(
    withLastGood(slimHistory(yearAgo.items), (i) => `q:${i.symbol}`).map((i) => [i.symbol, i]),
  );

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: refresh,
    delayMinutes: Math.round(refresh / 60),
    // Rótulo da coluna das tabelas: 12 meses se todos os ativos têm o ponto de 1 ano atrás.
    historyRange: assets.rangeUsed === "1y" || yearAgo.complete ? "1y" : "3mo",
    indices: withLastGood(slimHistory(idx.items), (i) => `q:${i.symbol}`),
    watchlist: watchlistSymbols.map((s) => bySymbol.get(s)!),
    etfs: trackedEtfs.map((s) => bySymbol.get(s)!),
    fx: withLastGood(fx, (i) => `fx:${i.pair}`),
  };
}

/** Aba Mundo: grandes empresas estrangeiras, em dólar, de hora em hora. */
export async function getWorld(): Promise<WorldResponse> {
  "use cache";
  const symbols = worldStocks.slice(0, serverEnv.worldLimit).map((w) => w.symbol);

  // Na publicação (build), sem brapi: ver getQuotes.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    cacheLife({ stale: 60, revalidate: 60, expire: WEEK });
    return {
      generatedAt: new Date().toISOString(),
      refreshSeconds: WORLD_REFRESH_SECONDS,
      historyRange: serverEnv.brapiHistoryRange,
      items: symbols.map((symbol) => ({ symbol, ok: false, error: BUILD_WAIT_MSG })),
    };
  }

  checkEstimatedQuota();
  const { items, rangeUsed } = await fetchQuotes(symbols);

  if (hasTransient(items))
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
  else cacheLife({ stale: WORLD_REFRESH_SECONDS, revalidate: WORLD_REFRESH_SECONDS, expire: WEEK });

  return {
    generatedAt: new Date().toISOString(),
    refreshSeconds: WORLD_REFRESH_SECONDS,
    historyRange: rangeUsed,
    items: withLastGood(slimHistory(items), (i) => `w:${i.symbol}`),
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

    // Antes dos meses que a brapi entrega, o histórico vem dos arquivos da B3.
    const b3 = asset.quote.currency === "BRL" ? await loadB3History(symbol) : null;
    const { history, b3Until } = mergeHistory(b3, asset.quote.history);
    const spanDays = history.length
      ? (Date.parse(history[history.length - 1].date) - Date.parse(history[0].date)) / 86_400_000
      : 0;
    const historyRange = !b3Until ? asset.historyRange : spanDays >= 1800 ? "5y" : spanDays >= 360 ? "1y" : asset.historyRange;
    return {
      generatedAt,
      ok: true,
      ...asset,
      quote: { ...asset.quote, history },
      historyRange,
      // Só os ajustes da parte antiga: nos meses da brapi o gráfico segue os preços dela.
      b3: b3Until && b3 ? { until: b3Until, adjustments: b3.adjustments.filter((a) => a.data <= b3Until) } : null,
    };
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
    // O card mostra a data de referência do próprio dado, então o valor anterior continua correto.
    items: withLastGood(items, (i) => `m:${i.id}`),
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

/**
 * Arquivo do Tesouro Transparente (~14 MB) lido UMA vez para tudo: tabela de
 * títulos e histórico de cada um. Ele muda uma vez por dia útil.
 */
async function getTreasuryAll() {
  "use cache";
  cacheLife({ stale: 3600, revalidate: 3600, expire: WEEK });
  return fetchTreasuryAll();
}

export async function getTreasury(): Promise<TreasuryResponse> {
  "use cache";
  const generatedAt = new Date().toISOString();
  try {
    const { referenceDate, bonds } = await getTreasuryAll();
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

/** Histórico de um título (página Renda Fixa). */
export async function getTreasuryHistory(id: string): Promise<TreasuryHistoryResponse> {
  "use cache";
  const generatedAt = new Date().toISOString();
  try {
    const history = (await getTreasuryAll()).histories[id];
    cacheLife({ stale: 3600, revalidate: 3600, expire: WEEK });
    if (!history) return { generatedAt, source: TESOURO_SOURCE, ok: false, error: "Título não encontrado." };
    return { generatedAt, source: TESOURO_SOURCE, ok: true, history };
  } catch (err) {
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
    return { generatedAt, source: TESOURO_SOURCE, ok: false, error: errorMessage(err) };
  }
}

/** Histórico da PTAX de uma moeda (página do câmbio): 1 ponto por dia útil, renovado a cada hora. */
export async function getFxHistory(pair: string): Promise<FxHistoryResponse> {
  "use cache";
  const generatedAt = new Date().toISOString();
  const source = "PTAX de venda · Banco Central do Brasil (SGS)";
  try {
    const points = await fetchFxHistory(pair);
    cacheLife({ stale: 3600, revalidate: 3600, expire: WEEK });
    return { generatedAt, source, pair, ok: true, points };
  } catch (err) {
    cacheLife({ stale: RETRY_SECONDS, revalidate: RETRY_SECONDS, expire: WEEK });
    return { generatedAt, source, pair, ok: false, error: errorMessage(err) };
  }
}

/** Entregas de ITR/DFP na CVM (arquivos semanais): renovadas a cada 6 h. */
async function getCvmFilings() {
  "use cache";
  cacheLife({ stale: 6 * 3600, revalidate: 6 * 3600, expire: WEEK });
  return fetchCvmFilings();
}

/** Selos de "resultado divulgado": CVM + manchetes do dia; renovados a cada 5 min. */
export async function getEarnings(): Promise<EarningsResponse> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300, expire: WEEK });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const [filings, news] = await Promise.all([
    // CVM fora do ar: seguimos só com as manchetes.
    getCvmFilings().catch(() => ({ filings: [], updatedThrough: null })),
    getNews().then((n) => n.items).catch(() => []),
  ]);
  return { generatedAt: new Date().toISOString(), ...buildEarnings(filings, news, today) };
}
