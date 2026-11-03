import "server-only";
import type {
  DividendPayment,
  Fundamentals,
  FxItem,
  ListedAsset,
  Quote,
  QuoteItem,
} from "@/lib/types";
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
  historicalDataPrice?: { date?: number; close?: number | null }[];
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

/**
 * Limitador: a brapi aceita 20 chamadas por minuto. Guardamos o horário das
 * últimas chamadas e, se já houver 15 no último minuto, esperamos abrir vaga
 * (margem para chamadas de outras instâncias do servidor).
 * (Vale por instância do servidor.)
 */
const RATE_LIMIT = 15;
const RATE_WINDOW_MS = 60_000;
// Em globalThis porque cada rota pode carregar sua própria cópia deste módulo.
const shared = globalThis as typeof globalThis & {
  __brapiRecentCalls?: number[];
  __brapiRefusedRanges?: Set<string>;
};
const recentCalls = (shared.__brapiRecentCalls ??= []);
/** Períodos de histórico que o plano já recusou: não tentamos de novo (economiza cota). */
const refusedRanges = (shared.__brapiRefusedRanges ??= new Set());

/** Espera no máximo isto por uma vaga; depois desiste (o Next limita cada rota a 50 s). */
const MAX_SLOT_WAIT_MS = 8_000;
const RATE_LIMIT_MSG = "Limite de requisições da brapi atingido.";

async function waitForRateSlot() {
  const deadline = Date.now() + MAX_SLOT_WAIT_MS;
  for (;;) {
    const now = Date.now();
    while (recentCalls.length && now - recentCalls[0] >= RATE_WINDOW_MS) recentCalls.shift();
    if (recentCalls.length < RATE_LIMIT) {
      recentCalls.push(now);
      return;
    }
    const freeAt = recentCalls[0] + RATE_WINDOW_MS + 50;
    // Falha passageira: o item é tentado de novo em 5 min e a tela mantém o último valor.
    if (freeAt > deadline) throw new SourceError(RATE_LIMIT_MSG);
    await sleep(freeAt - now);
  }
}

async function brapiGet<T>(path: string, retries = 1): Promise<T> {
  if (!serverEnv.brapiToken) {
    throw new SourceError("Token da brapi não configurado (BRAPI_TOKEN).");
  }
  await waitForRateSlot();
  recordBrapiCalls(1);
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${serverEnv.brapiToken}` },
  });

  // Limite por minuto: se a brapi pedir uma espera curta (até 5 s), espera e
  // tenta mais uma vez; se for longa, desiste logo (o Next limita cada rota a
  // 50 s) e o item é tentado de novo em 5 min.
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after") ?? res.headers.get("ratelimit-reset") ?? 60);
    if (retries > 0 && Number.isFinite(wait) && wait <= 5) {
      await sleep(Math.max(wait, 1) * 1000);
      return brapiGet<T>(path, retries - 1);
    }
    throw new SourceError(RATE_LIMIT_MSG);
  }

  const body = (await res.json().catch(() => null)) as (T & BrapiErrorResponse) | null;

  if (!res.ok || !body || body.error) {
    if (res.status === 401) throw new SourceError("Token da brapi inválido.");
    if (
      res.status === 402 ||
      res.status === 403 ||
      /^(INVALID_RANGE|INVALID_INTERVAL|FEATURE_NOT_AVAILABLE|MODULES_NOT_AVAILABLE)$/.test(body?.code ?? "")
    )
      throw new PlanError("Dado não incluído no plano atual da brapi.");
    if (res.status === 404) throw new SourceError("Ativo não encontrado na brapi.");
    if (res.status === 429) throw new SourceError(RATE_LIMIT_MSG);
    throw new SourceError(body?.message ?? `A brapi respondeu com erro ${res.status}.`);
  }
  return body;
}

function toQuote(raw: BrapiQuoteRaw): Quote | null {
  const { regularMarketPrice: price, regularMarketTime: time } = raw;
  if (typeof price !== "number" || !time) return null;
  const history = (raw.historicalDataPrice ?? [])
    .filter((p): p is { date: number; close: number } =>
      typeof p.date === "number" && typeof p.close === "number",
    )
    .map((p) => ({ date: spDay(p.date * 1000), close: p.close }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    symbol: raw.symbol,
    // shortName costuma ser só o ticker (ex.: "PETR4"); longName é mais útil.
    name: raw.longName || raw.shortName || raw.symbol,
    currency: raw.currency ?? "BRL",
    price,
    change: raw.regularMarketChange ?? 0,
    changePercent: raw.regularMarketChangePercent ?? 0,
    previousClose: raw.regularMarketPreviousClose ?? null,
    updatedAt: new Date(time).toISOString(),
    history,
  };
}

/** Dia (AAAA-MM-DD) em São Paulo de um instante. */
function spDay(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
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
 * Tenta cada período de histórico em ordem; se o plano recusar um, passa
 * para o próximo (mais curto). Devolve a resposta e o período que funcionou.
 */
async function getWithRangeFallback<T>(
  buildPath: (range: string) => string,
  ranges: string[],
): Promise<{ data: T; range: string }> {
  let lastErr: unknown = new PlanError("Dado não incluído no plano atual da brapi.");
  const candidates = ranges.filter((r, i) => i === ranges.length - 1 || !refusedRanges.has(r));
  for (const range of candidates) {
    try {
      return { data: await brapiGet<T>(buildPath(range)), range };
    } catch (err) {
      if (!(err instanceof PlanError)) throw err;
      refusedRanges.add(range);
      lastErr = err;
    }
  }
  throw lastErr;
}

/** Períodos a tentar para o histórico das tabelas, do preferido ao mínimo. */
function tableRanges(): string[] {
  return serverEnv.brapiHistoryRange === "1y" ? ["1y", "3mo"] : ["3mo"];
}

/** Períodos para a página do ativo, do maior que o plano permite até 3 meses. */
function assetRanges(): string[] {
  const all = ["5y", "1y", "3mo"];
  return all.slice(all.indexOf(serverEnv.brapiMaxRange));
}

/**
 * Busca cotações. Respeita o limite de tickers por chamada do plano e faz
 * poucas chamadas por vez. Se um grupo falhar, só ele vem com erro.
 * `rangeUsed` diz o período de histórico obtido (o menor entre os grupos).
 */
export async function fetchQuotes(
  symbols: string[],
): Promise<{ items: QuoteItem[]; rangeUsed: "1y" | "3mo" }> {
  const size = serverEnv.brapiMaxTickersPerRequest;
  const groups: string[][] = [];
  for (let i = 0; i < symbols.length; i += size) groups.push(symbols.slice(i, i + size));
  let rangeUsed: "1y" | "3mo" = serverEnv.brapiHistoryRange;

  const results = await mapWithConcurrency(
    groups,
    CONCURRENCY,
    async (group): Promise<QuoteItem[]> => {
      try {
        // O histórico diário vem na mesma chamada: não gasta cota extra.
        const { data, range } = await getWithRangeFallback<BrapiQuoteResponse>(
          (r) => `/quote/${group.map(encodeURIComponent).join(",")}?range=${r}&interval=1d`,
          tableRanges(),
        );
        if (range === "3mo") rangeUsed = "3mo";
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
  return { items: results.flat(), rangeUsed };
}

// ---------- Lista completa de ativos (busca e abas Brasil/Mundo) ----------

type BrapiListItem = {
  stock?: string;
  name?: string;
  close?: number | null;
  change?: number | null;
  volume?: number | null;
  market_cap?: number | null;
  sector?: string | null;
  type?: string;
  subType?: string;
};

type BrapiListResponse = { stocks?: BrapiListItem[]; hasNextPage?: boolean };

function kindOf(type?: string, subType?: string): ListedAsset["kind"] {
  if (type === "stock") return "acao";
  if (type === "bdr") return "bdr";
  if (subType === "fii") return "fii";
  if (subType === "etf") return "etf";
  return "outro";
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** Todos os ativos listados na B3 (ações, FIIs, ETFs, BDRs), em poucas chamadas. */
export async function fetchListedAssets(): Promise<ListedAsset[]> {
  const assets: ListedAsset[] = [];
  for (let page = 1; page <= 5; page++) {
    const data = await brapiGet<BrapiListResponse>(`/quote/list?limit=2000&page=${page}`);
    for (const s of data.stocks ?? []) {
      if (!s.stock) continue;
      assets.push({
        symbol: s.stock,
        // Para muitos BDRs a brapi devolve o próprio ticker como nome.
        name: s.name && s.name !== s.stock ? s.name : "",
        price: num(s.close),
        changePercent: num(s.change),
        volume: num(s.volume),
        marketCap: num(s.market_cap),
        sector: s.sector ?? null,
        kind: kindOf(s.type, s.subType),
      });
    }
    if (!data.hasNextPage) break;
  }
  if (!assets.length) throw new SourceError("A brapi devolveu a lista de ativos vazia.");
  return assets;
}

// ---------- Página de um ativo ----------

type BrapiAssetRaw = BrapiQuoteRaw & {
  priceEarnings?: number | null;
  marketCap?: number | null;
  defaultKeyStatistics?: {
    priceToBook?: number | null;
    dividendYield?: number | null;
    mostRecentQuarter?: string | null;
  } | null;
  financialData?: {
    profitMargins?: number | null;
    returnOnEquity?: number | null;
  } | null;
  dividendsData?: {
    cashDividends?: {
      label?: string;
      rate?: number;
      paymentDate?: string | null;
      lastDatePrior?: string | null;
    }[];
  } | null;
};

const isoDay = (v?: string | null) => (v ? spDay(new Date(v).getTime()) : null);
const pct = (v: unknown) => (num(v) === null ? null : (v as number) * 100);

/**
 * Tudo da página do ativo numa única chamada: cotação, 5 anos de histórico
 * diário, indicadores e proventos.
 */
export async function fetchAsset(symbol: string) {
  // Pede só o que o plano libera: módulos de indicadores (Pro) e proventos
  // (Startup ou Pro). Pedir algo fora do plano faz a chamada inteira falhar.
  const extras =
    (serverEnv.brapiFundamentals ? "&modules=defaultKeyStatistics,financialData" : "") +
    (serverEnv.brapiDividends ? "&dividends=true" : "");
  const { data, range } = await getWithRangeFallback<{ results?: BrapiAssetRaw[] }>(
    (r) => `/quote/${encodeURIComponent(symbol)}?range=${r}&interval=1d${extras}`,
    assetRanges(),
  );
  const raw = data.results?.[0];
  const quote = raw ? toQuote(raw) : null;
  if (!raw || !quote) throw new SourceError("Ativo não encontrado na brapi.");

  const stats: NonNullable<BrapiAssetRaw["defaultKeyStatistics"]> = raw.defaultKeyStatistics ?? {};
  const fin: NonNullable<BrapiAssetRaw["financialData"]> = raw.financialData ?? {};
  const fundamentals: Fundamentals = {
    priceEarnings: num(raw.priceEarnings),
    priceToBook: num(stats.priceToBook),
    dividendYield: pct(stats.dividendYield),
    marketCap: num(raw.marketCap),
    netMargin: pct(fin.profitMargins),
    roe: pct(fin.returnOnEquity),
    balanceDate: stats.mostRecentQuarter ? stats.mostRecentQuarter.slice(0, 10) : null,
  };

  // Proventos com data com nos últimos 12 meses (inclui anúncios futuros).
  const cutoff = spDay(Date.now() - 365 * 24 * 3600 * 1000);
  const dividends: DividendPayment[] = (raw.dividendsData?.cashDividends ?? [])
    .map((d) => ({
      label: d.label || "Provento",
      rate: num(d.rate) ?? 0,
      exDate: isoDay(d.lastDatePrior),
      paymentDate: isoDay(d.paymentDate),
    }))
    .filter((d) => d.rate > 0 && (d.exDate ?? d.paymentDate ?? "") >= cutoff)
    .sort((a, b) => (b.exDate ?? "").localeCompare(a.exDate ?? ""));

  return {
    quote: { ...quote, symbol },
    historyRange: range,
    fundamentals,
    dividends,
    // O que o plano atual cobre, para a página explicar o que falta.
    coverage: { fundamentals: serverEnv.brapiFundamentals, dividends: serverEnv.brapiDividends },
  };
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
        history: [],
      },
    };
  });
}
