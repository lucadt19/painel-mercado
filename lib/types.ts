/**
 * Tipos das respostas das rotas /api/*. Usados no servidor e no navegador.
 *
 * Regra do projeto: todo dado carrega `updatedAt`, o horário em que a FONTE
 * publicou o valor (não o horário da nossa requisição), e `source`.
 */

/** Resultado de um item: ou veio o dado, ou veio o motivo da falha. */
export type Result<T> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// ---------- Cotações (brapi) ----------

export type Quote = {
  symbol: string;
  name: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number | null;
  /** Horário da cotação informado pela brapi (ISO 8601). */
  updatedAt: string;
  /** Fechamentos diários do período do plano (3 meses no Gratuito), do mais antigo ao mais novo. */
  history: PricePoint[];
};

/** Um ponto de histórico: data (AAAA-MM-DD) e preço. */
export type PricePoint = { date: string; close: number };

export type QuoteItem = { symbol: string } & Result<{ quote: Quote }>;

// ---------- Câmbio ----------

export type FxRate = {
  /** Par no formato "USD-BRL". */
  pair: string;
  /** Preço de venda, em reais. */
  price: number;
  /** Variação contra o fechamento anterior, em %. Null se não houver base. */
  changePercent: number | null;
  /** Horário da cotação na fonte (ISO 8601). */
  updatedAt: string;
  /** "brapi" ou "PTAX/BCB", com o tipo de boletim no caso da PTAX. */
  source: string;
  /** Fechamentos dos últimos dias, do mais antigo ao mais novo. */
  history: PricePoint[];
};

export type FxItem = { pair: string } & Result<{ rate: FxRate }>;

export type QuotesResponse = {
  /** Quando o servidor montou esta resposta (ISO). */
  generatedAt: string;
  /** Intervalo de atualização configurado, em segundos. */
  refreshSeconds: number;
  /** Atraso aproximado das cotações, em minutos. */
  delayMinutes: number;
  /** Período do histórico pedido à brapi ("3mo" no Gratuito, "1y" no Startup). */
  historyRange: "3mo" | "1y";
  indices: QuoteItem[];
  watchlist: QuoteItem[];
  fx: FxItem[];
};

// ---------- Indicadores macro (BCB) ----------

export type MacroIndicator = {
  id: "selicMeta" | "cdi" | "ipcaMensal" | "ipca12m";
  label: string;
  /** Valor em % (ao ano para Selic e CDI; no mês ou em 12 meses para IPCA). */
  value: number;
  unit: "% a.a." | "% no mês" | "% em 12 meses";
  /** Data do dado na fonte (AAAA-MM-DD). O significado depende de `dateKind`. */
  referenceDate: string;
  /**
   * "since": em vigor desde a data (Selic meta, desde a decisão do Copom);
   * "day": taxa do dia (CDI); "month": mês de referência (IPCA).
   */
  dateKind: "since" | "day" | "month";
  sgsCode: number;
};

export type MacroItem = { id: MacroIndicator["id"] } & Result<{ indicator: MacroIndicator }>;

export type MacroResponse = {
  generatedAt: string;
  source: string;
  items: MacroItem[];
};

// ---------- Tesouro Direto (Tesouro Transparente) ----------

export type TreasuryBond = {
  title: string;
  indexer: "Selic" | "Prefixado" | "IPCA" | "IGP-M";
  /** Vencimento (AAAA-MM-DD). */
  maturity: string;
  /** Taxa de compra em % a.a. (spread sobre a Selic no Tesouro Selic). */
  buyRate: number | null;
  /** Preço unitário de compra, em reais. */
  buyPrice: number | null;
  sellRate: number | null;
  sellPrice: number | null;
};

export type TreasuryResponse = {
  generatedAt: string;
  source: string;
} & Result<{
  /** Data-base dos preços e taxas (AAAA-MM-DD): o último dia útil publicado. */
  referenceDate: string;
  bonds: TreasuryBond[];
}>;
