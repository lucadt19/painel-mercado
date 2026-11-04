"use client";

import useSWR from "swr";
import { useAutoRefresh } from "@/components/auto-refresh-provider";
import type {
  AssetResponse,
  MacroHistoryResponse,
  NewsResponse,
  FxItem,
  MarketListResponse,
  WorldResponse,
  MacroResponse,
  QuoteItem,
  QuotesResponse,
  TreasuryResponse,
} from "@/lib/types";

/**
 * - `stale`: o item falhou nesta rodada, mas tinha valor bom antes; mostramos
 *   o valor antigo (com o horário dele).
 * - `tick`: o preço mudou desde a rodada anterior (para o flash verde/vermelho).
 */
export type WithStale<T> = T & { stale?: { error: string }; tick?: "up" | "down" };

/** Preço de um item, seja cotação ou câmbio. */
function priceOf(item: unknown): number | undefined {
  const i = item as { quote?: { price: number }; rate?: { price: number } } | undefined;
  return i?.quote?.price ?? i?.rate?.price;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${url}`);
  return res.json() as Promise<T>;
}

// Último valor bom de cada ativo, para não apagar a tela quando a fonte falha.
const lastGoodQuotes = new Map<string, QuoteItem>();
const lastGoodFx = new Map<string, FxItem>();
const lastGoodEtfs = new Map<string, QuoteItem>();
const lastGoodWorld = new Map<string, QuoteItem>();

function keepLastGood<T extends { ok: boolean }>(
  items: T[],
  store: Map<string, T>,
  key: (item: T) => string,
): WithStale<T>[] {
  return items.map((item) => {
    const k = key(item);
    if (item.ok) {
      const before = priceOf(store.get(k));
      const now = priceOf(item);
      store.set(k, item);
      if (before !== undefined && now !== undefined && now !== before) {
        return { ...item, tick: now > before ? "up" : "down" };
      }
      return item;
    }
    const previous = store.get(k);
    const error = (item as unknown as { error: string }).error;
    return previous ? { ...previous, stale: { error } } : item;
  });
}

export type QuotesData = Omit<QuotesResponse, "indices" | "watchlist" | "etfs" | "fx"> & {
  indices: WithStale<QuoteItem>[];
  watchlist: WithStale<QuoteItem>[];
  etfs: WithStale<QuoteItem>[];
  fx: WithStale<FxItem>[];
};

async function fetchQuotes(url: string): Promise<QuotesData> {
  const data = await getJson<QuotesResponse>(url);
  return {
    ...data,
    indices: keepLastGood(data.indices, lastGoodQuotes, (i) => i.symbol),
    watchlist: keepLastGood(data.watchlist, lastGoodQuotes, (i) => i.symbol),
    // Os ETFs repetem tickers da watchlist; usam um mapa próprio para o flash
    // não ser "consumido" pela watchlist antes.
    etfs: keepLastGood(data.etfs, lastGoodEtfs, (i) => i.symbol),
    fx: keepLastGood(data.fx, lastGoodFx, (i) => i.pair),
  };
}

/** Cotações: atualiza no intervalo do plano da brapi, só com o pregão aberto. */
export function useQuotes() {
  const { pollQuotes } = useAutoRefresh();
  return useSWR<QuotesData>("/api/quotes", fetchQuotes, {
    refreshInterval: (latest) => (pollQuotes && latest ? latest.refreshSeconds * 1000 : 0),
  });
}

const HOUR = 3600 * 1000;

/** Selic, CDI e IPCA: mudam no máximo uma vez por dia; checa de hora em hora. */
export function useMacro() {
  return useSWR<MacroResponse>("/api/macro", getJson, { refreshInterval: HOUR });
}

/** Tesouro Direto: o arquivo oficial muda uma vez por dia útil; checa de hora em hora. */
export function useTreasury() {
  return useSWR<TreasuryResponse>("/api/treasury", getJson, { refreshInterval: HOUR });
}

export type WorldData = Omit<WorldResponse, "items"> & { items: WithStale<QuoteItem>[] };

async function fetchWorld(url: string): Promise<WorldData> {
  const data = await getJson<WorldResponse>(url);
  return { ...data, items: keepLastGood(data.items, lastGoodWorld, (i) => i.symbol) };
}

/** Aba Mundo: de hora em hora, só com a bolsa de Nova York aberta. */
export function useWorld() {
  const { pollWorld } = useAutoRefresh();
  return useSWR<WorldData>("/api/world", fetchWorld, {
    refreshInterval: (latest) => (pollWorld && latest ? latest.refreshSeconds * 1000 : 0),
  });
}

// Última lista boa: se uma atualização falhar, a tabela continua com ela
// (e com o horário da consulta que deu certo).
let lastGoodList: MarketListResponse | undefined;

async function fetchMarketList(url: string): Promise<MarketListResponse> {
  const data = await getJson<MarketListResponse>(url);
  if (data.ok) lastGoodList = data;
  return data.ok || !lastGoodList ? data : lastGoodList;
}

/** Lista completa da B3: no mesmo ritmo das cotações. */
export function useMarketList() {
  const { pollQuotes } = useAutoRefresh();
  return useSWR<MarketListResponse>("/api/market-list", fetchMarketList, {
    refreshInterval: (latest) => (pollQuotes && latest ? latest.refreshSeconds * 1000 : 0),
    // A lista é grande; não precisa rebuscar a cada foco na aba.
    revalidateOnFocus: false,
  });
}

/** Página de um ativo: atualiza a cada 30 min com o pregão aberto. */
export function useAsset(ticker: string) {
  const { pollQuotes, pollWorld } = useAutoRefresh();
  return useSWR<AssetResponse>(`/api/asset/${encodeURIComponent(ticker)}`, getJson, {
    refreshInterval: pollQuotes || pollWorld ? 1800 * 1000 : 0,
  });
}

/** Histórico das séries macro: muda no máximo uma vez por dia; checa a cada 6 h. */
export function useMacroHistory() {
  return useSWR<MacroHistoryResponse>("/api/macro-history", getJson, {
    refreshInterval: 6 * HOUR,
    revalidateOnFocus: false,
  });
}

/** Manchetes: a cada 5 minutos com a aba visível (independe do pregão). */
export function useNews() {
  return useSWR<NewsResponse>("/api/news", getJson, { refreshInterval: 5 * 60 * 1000 });
}
