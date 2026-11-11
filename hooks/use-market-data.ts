"use client";

import useSWR from "swr";
import { useAutoRefresh } from "@/components/auto-refresh-provider";
import type {
  AssetResponse,
  EarningsResponse,
  FxHistoryResponse,
  MacroHistoryResponse,
  NewsResponse,
  FxItem,
  MarketListResponse,
  WorldResponse,
  MacroResponse,
  QuoteItem,
  QuotesResponse,
  TreasuryHistoryResponse,
  TreasuryResponse,
  VideosResponse,
  WatchlistResponse,
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

/**
 * Depois de uma falha, consultar de novo em 2,5 min (o servidor tenta a fonte
 * de novo em 5 min e, até lá, responde do cache, sem gastar cota). Sem isso,
 * a tela ficaria "indisponível" até o próximo intervalo normal (30 min).
 */
const RETRY_MS = 150 * 1000;

/** Algum item falhou nesta rodada (mesmo que a tela mostre o valor anterior)? */
const anyFailed = (items: { ok: boolean; stale?: unknown }[]) => items.some((i) => !i.ok || i.stale);

/*
 * Último valor bom de cada ativo, para não apagar a tela quando a fonte falha.
 * Fica também no armazenamento do navegador: abrindo o site do zero durante
 * uma falha, aparecem os últimos números (com o horário deles), não "indisponível".
 */
const STORAGE_KEY = "painel:ultimos-valores:v1";
type StoreName = "quotes" | "fx" | "etfs" | "world" | "macro";

function readSaved(): Partial<Record<StoreName, [string, unknown][]>> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
const saved = readSaved();
const stores: Record<StoreName, Map<string, unknown>> = {
  quotes: new Map(saved.quotes),
  fx: new Map(saved.fx),
  etfs: new Map(saved.etfs),
  world: new Map(saved.world),
  macro: new Map(saved.macro),
};

function persistStores() {
  try {
    const data = Object.fromEntries(Object.entries(stores).map(([name, map]) => [name, [...map]]));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Armazenamento bloqueado (janela anônima, por exemplo): fica só na memória.
  }
}

function keepLastGood<T extends { ok: boolean; stale?: { error: string } }>(
  items: T[],
  name: StoreName,
  key: (item: T) => string,
): WithStale<T>[] {
  const store = stores[name] as Map<string, T>;
  return items.map((item) => {
    const k = key(item);
    // Valor antigo vindo do servidor (a fonte falhou lá): mostra como está.
    if (item.ok && item.stale) return item;
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
  const result = {
    ...data,
    indices: keepLastGood(data.indices, "quotes", (i) => i.symbol),
    watchlist: keepLastGood(data.watchlist, "quotes", (i) => i.symbol),
    // Os ETFs repetem tickers da watchlist; usam um mapa próprio para o flash
    // não ser "consumido" pela watchlist antes.
    etfs: keepLastGood(data.etfs, "etfs", (i) => i.symbol),
    fx: keepLastGood(data.fx, "fx", (i) => i.pair),
  };
  persistStores();
  return result;
}

/** Cotações: atualiza no intervalo do plano da brapi, só com o pregão aberto. */
export function useQuotes() {
  const { pollQuotes } = useAutoRefresh();
  return useSWR<QuotesData>("/api/quotes", fetchQuotes, {
    refreshInterval: (latest) => {
      if (!pollQuotes || !latest) return 0;
      const failed = anyFailed([...latest.indices, ...latest.watchlist, ...latest.etfs, ...latest.fx]);
      return failed ? RETRY_MS : latest.refreshSeconds * 1000;
    },
  });
}

const HOUR = 3600 * 1000;

/** Selic, CDI e IPCA: mudam no máximo uma vez por dia; checa de hora em hora. */
export function useMacro() {
  return useSWR<MacroResponse>("/api/macro", fetchMacro, {
    refreshInterval: (latest) => (latest?.items.some((i) => !i.ok || i.stale) ? RETRY_MS : HOUR),
  });
}

/** Indicador que falhou: fica o último valor bom (o card mostra a data de referência dele). */
async function fetchMacro(url: string): Promise<MacroResponse> {
  const data = await getJson<MacroResponse>(url);
  const result = { ...data, items: keepLastGood(data.items, "macro", (i) => i.id) };
  persistStores();
  return result;
}

/** Tesouro Direto: o arquivo oficial muda uma vez por dia útil; checa de hora em hora. */
export function useTreasury() {
  return useSWR<TreasuryResponse>("/api/treasury", getJson, { refreshInterval: HOUR });
}

export type WorldData = Omit<WorldResponse, "items"> & { items: WithStale<QuoteItem>[] };

async function fetchWorld(url: string): Promise<WorldData> {
  const data = await getJson<WorldResponse>(url);
  const result = { ...data, items: keepLastGood(data.items, "world", (i) => i.symbol) };
  persistStores();
  return result;
}

/** Aba Mundo: de hora em hora, só com a bolsa de Nova York aberta. */
export function useWorld() {
  const { pollWorld } = useAutoRefresh();
  return useSWR<WorldData>("/api/world", fetchWorld, {
    refreshInterval: (latest) => {
      if (!pollWorld || !latest) return 0;
      return anyFailed(latest.items) ? RETRY_MS : latest.refreshSeconds * 1000;
    },
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
    // Lista indisponível: tenta de novo logo, mesmo com o pregão fechado
    // (sem ela a tabela da B3 e a busca ficam vazias).
    refreshInterval: (latest) =>
      latest && !latest.ok ? RETRY_MS : pollQuotes && latest ? latest.refreshSeconds * 1000 : 0,
    // A lista é grande; não precisa rebuscar a cada foco na aba.
    revalidateOnFocus: false,
  });
}

/**
 * A rota do ativo responde 404 (ticker inexistente), 429 (muitas consultas) e
 * 503 (lista de ativos indisponível) com uma mensagem em JSON; mostramos essa
 * mensagem em vez de um erro genérico.
 */
async function getAssetJson(url: string): Promise<AssetResponse> {
  const res = await fetch(url);
  if (res.ok || [404, 429, 503].includes(res.status)) return res.json() as Promise<AssetResponse>;
  throw new Error(`Erro ${res.status} ao buscar ${url}`);
}

/** Página de um ativo: atualiza a cada 30 min com o pregão aberto. */
export function useAsset(ticker: string) {
  const { pollQuotes, pollWorld } = useAutoRefresh();
  return useSWR<AssetResponse>(`/api/asset/${encodeURIComponent(ticker)}`, getAssetJson, {
    // Com erro passageiro (ex.: limite por minuto da brapi), tenta de novo em
    // 2 min; o servidor responde do cache até a nova tentativa dele (5 min).
    refreshInterval: (latest) =>
      latest && !latest.ok && !/não encontrado/i.test(latest.error)
        ? 120 * 1000
        : pollQuotes || pollWorld
          ? 1800 * 1000
          : 0,
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

/** Histórico diário de um título do Tesouro (o arquivo oficial muda 1 vez por dia útil). */
export function useTreasuryHistory(id: string | null) {
  return useSWR<TreasuryHistoryResponse>(
    id ? `/api/treasury-history/${encodeURIComponent(id)}` : null,
    getJson,
    { refreshInterval: 6 * HOUR, revalidateOnFocus: false },
  );
}

/** Vídeos do YouTube: a cada 30 min com a aba visível. */
export function useVideos() {
  return useSWR<VideosResponse>("/api/videos", getJson, { refreshInterval: 30 * 60 * 1000, revalidateOnFocus: false });
}

/** Watchlist editável: a lista salva e se este aparelho está logado. */
export function useWatchlist() {
  return useSWR<WatchlistResponse>("/api/watchlist", getJson, { revalidateOnFocus: false });
}

/** Histórico da PTAX de uma moeda: o BC publica o fechamento 1 vez por dia; checa de hora em hora. */
export function useFxHistory(pair: string) {
  return useSWR<FxHistoryResponse>(`/api/fx-history/${encodeURIComponent(pair)}`, getJson, {
    refreshInterval: HOUR,
    revalidateOnFocus: false,
  });
}

/** Selos de resultado divulgado: checa a cada 30 min com a aba visível. */
export function useEarnings() {
  return useSWR<EarningsResponse>("/api/earnings", getJson, {
    refreshInterval: 30 * 60 * 1000,
    revalidateOnFocus: false,
  });
}
