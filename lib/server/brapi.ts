import "server-only";
import type { FxItem, Quote, QuoteItem } from "@/lib/types";
import { serverEnv } from "@/lib/server/env";
import { errorMessage, fetchWithTimeout, SourceError } from "@/lib/server/http";
import { recordBrapiCalls } from "@/lib/server/quota";

const BASE_URL = "https://brapi.dev/api";

/** Campos que usamos da resposta de /api/quote. */
type BrapiQuoteRaw = {
  symbol: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketPreviousClose?: number;
  regularMarketTime?: string;
};

type BrapiQuoteResponse = { results?: BrapiQuoteRaw[] };

type BrapiErrorResponse = { error?: boolean; message?: string; code?: string };

/** Campos que usamos da resposta de /api/v2/currency. */
type BrapiCurrencyRaw = {
  fromCurrency?: string;
  toCurrency?: string;
  bidPrice?: string | number;
  percentageChange?: string | number;
  updatedAtTimestamp?: string | number;
};

type BrapiCurrencyResponse = { currency?: BrapiCurrencyRaw[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Erro de "recurso fora do plano", para quem chama decidir o que fazer. */
export class PlanError extends SourceError {}

async function brapiGet<T>(path: string, retry = true): Promise<T> {
  if (!serverEnv.brapiToken) {
    throw new SourceError("Token da brapi não configurado (BRAPI_TOKEN).");
  }
  recordBrapiCalls(1);
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${serverEnv.brapiToken}` },
  });

  // Limite por minuto: espera o tempo pedido (até 8 s) e tenta mais uma vez.
  if (res.status === 429 && retry) {
    const wait = Number(res.headers.get("retry-after") ?? res.headers.get("ratelimit-reset") ?? 2);
    await sleep(Math.min(Number.isFinite(wait) ? wait : 2, 8) * 1000);
    return brapiGet<T>(path, false);
  }

  const body = (await res.json().catch(() => null)) as (T & BrapiErrorResponse) | null;

  if (!res.ok || !body || body.error) {
    if (res.status === 401) throw new SourceError("Token da brapi inválido.");
    if (res.status === 402 || res.status === 403)
      throw new PlanError("Dado não incluído no plano atual da brapi.");
    if (res.status === 404) throw new SourceError("Ativo não encontrado na brapi.");
    if (res.status === 429) throw new SourceError("Limite de requisições da brapi atingido.");
    throw new SourceError(body?.message ?? `A brapi respondeu com erro ${res.status}.`);
  }
  return body;
}

function toQuote(raw: BrapiQuoteRaw): Quote | null {
  const { regularMarketPrice: price, regularMarketTime: time } = raw;
  if (typeof price !== "number" || !time) return null;
  return {
    symbol: raw.symbol,
    name: raw.shortName || raw.longName || raw.symbol,
    currency: raw.currency ?? "BRL",
    price,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
    previousClose: raw.regularMarketPreviousClose ?? null,
    updatedAt: new Date(time).toISOString(),
  };
}

/** A brapi às vezes devolve o símbolo com sufixo (ex.: IFIX -> IFIX.SA). */
const normalizeSymbol = (s: string) => s.toUpperCase().replace(/\.SA$/, "");

/** Quantas chamadas à brapi rodam ao mesmo tempo (ela limita rajadas). */
const CONCURRENCY = 3;

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/**
 * Busca cotações. Respeita o limite de tickers por chamada do plano e faz
 * poucas chamadas por vez. Se um grupo falhar, só ele vem com erro.
 */
export async function fetchQuotes(symbols: string[]): Promise<QuoteItem[]> {
  const size = serverEnv.brapiMaxTickersPerRequest;
  const groups: string[][] = [];
  for (let i = 0; i < symbols.length; i += size) groups.push(symbols.slice(i, i + size));

  const results = await mapWithConcurrency(
    groups,
    CONCURRENCY,
    async (group): Promise<QuoteItem[]> => {
      try {
        const path = `/quote/${group.map(encodeURIComponent).join(",")}`;
        const data = await brapiGet<BrapiQuoteResponse>(path);
        return group.map((symbol) => {
          const raw = data.results?.find(
            (r) => r.symbol && normalizeSymbol(r.symbol) === normalizeSymbol(symbol),
          );
          const parsed = raw ? toQuote(raw) : null;
          return parsed
            ? { symbol, ok: true, quote: { ...parsed, symbol } }
            : { symbol, ok: false, error: "A brapi não retornou cotação para este ativo." };
        });
      } catch (err) {
        const error = errorMessage(err);
        return group.map((symbol) => ({ symbol, ok: false, error }));
      }
    },
  );
  return results.flat();
}

/** Câmbio pela brapi. Lança erro se a rota não estiver disponível no plano. */
export async function fetchFxFromBrapi(pairs: string[]): Promise<FxItem[]> {
  const data = await brapiGet<BrapiCurrencyResponse>(
    `/v2/currency?currency=${pairs.map(encodeURIComponent).join(",")}`,
  );
  return pairs.map((pair): FxItem => {
    const [from, to] = pair.split("-");
    const raw = data.currency?.find((c) => c.fromCurrency === from && c.toCurrency === to);
    const price = Number(raw?.bidPrice);
    const ts = Number(raw?.updatedAtTimestamp);
    if (!raw || !Number.isFinite(price) || !Number.isFinite(ts)) {
      return { pair, ok: false, error: "A brapi não retornou este par de moedas." };
    }
    const pct = Number(raw.percentageChange);
    return {
      pair,
      ok: true,
      rate: {
        pair,
        price,
        changePercent: Number.isFinite(pct) ? pct : null,
        updatedAt: new Date(ts * 1000).toISOString(),
        source: "brapi",
      },
    };
  });
}
