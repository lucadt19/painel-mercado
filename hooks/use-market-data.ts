"use client";

import useSWR from "swr";
import { useAutoRefresh } from "@/components/auto-refresh-provider";
import type {
  FxItem,
  MacroResponse,
  QuoteItem,
  QuotesResponse,
  TreasuryResponse,
} from "@/lib/types";

/**
 * Um item que falhou nesta rodada, mas tinha valor bom antes:
 * mostramos o valor antigo (com o horário dele) marcado como `stale`.
 */
export type WithStale<T> = T & { stale?: { error: string } };

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${url}`);
  return res.json() as Promise<T>;
}

// Último valor bom de cada ativo, para não apagar a tela quando a fonte falha.
const lastGoodQuotes = new Map<string, QuoteItem>();
const lastGoodFx = new Map<string, FxItem>();

function keepLastGood<T extends { ok: boolean }>(
  items: T[],
  store: Map<string, T>,
  key: (item: T) => string,
): WithStale<T>[] {
  return items.map((item) => {
    const k = key(item);
    if (item.ok) {
      store.set(k, item);
      return item;
    }
    const previous = store.get(k);
    const error = (item as unknown as { error: string }).error;
    return previous ? { ...previous, stale: { error } } : item;
  });
}

export type QuotesData = Omit<QuotesResponse, "indices" | "watchlist" | "fx"> & {
  indices: WithStale<QuoteItem>[];
  watchlist: WithStale<QuoteItem>[];
  fx: WithStale<FxItem>[];
};

async function fetchQuotes(url: string): Promise<QuotesData> {
  const data = await getJson<QuotesResponse>(url);
  return {
    ...data,
    indices: keepLastGood(data.indices, lastGoodQuotes, (i) => i.symbol),
    watchlist: keepLastGood(data.watchlist, lastGoodQuotes, (i) => i.symbol),
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
