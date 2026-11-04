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
  /** Fechamentos diários, do mais antigo ao mais novo. */
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
  /** Período do histórico obtido da brapi ("1y" ou, se o plano recusar, "3mo"). */
  historyRange: HistoryRange;
  indices: QuoteItem[];
  watchlist: QuoteItem[];
  /** ETFs acompanhados (página Ações & ETFs). */
  etfs: QuoteItem[];
  fx: FxItem[];
};

export type HistoryRange = "3mo" | "1y";

/** Aba Mundo: ações americanas, cotadas em dólar. */
export type WorldResponse = {
  generatedAt: string;
  refreshSeconds: number;
  historyRange: HistoryRange;
  items: QuoteItem[];
};

// ---------- Lista completa de ativos da B3 (brapi /quote/list) ----------

export type ListedAsset = {
  symbol: string;
  name: string;
  /** Último preço (R$). A lista da brapi não informa o horário de cada cotação. */
  price: number | null;
  changePercent: number | null;
  volume: number | null;
  marketCap: number | null;
  sector: string | null;
  kind: "acao" | "fii" | "etf" | "bdr" | "outro";
};

export type MarketListResponse = {
  generatedAt: string;
  /** Hora em que o site consultou a lista (a fonte não informa o horário da cotação). */
  fetchedAt: string;
  refreshSeconds: number;
} & Result<{ assets: ListedAsset[] }>;

// ---------- Página de um ativo ----------

export type Fundamentals = {
  priceEarnings: number | null;
  priceToBook: number | null;
  /** Em %, ex.: 7.22. */
  dividendYield: number | null;
  marketCap: number | null;
  /** Em %. */
  netMargin: number | null;
  /** Em %. */
  roe: number | null;
  /** Data do balanço mais recente usado nos indicadores (AAAA-MM-DD). */
  balanceDate: string | null;
};

export type DividendPayment = {
  /** "Dividendo", "JCP", "Rendimento"... */
  label: string;
  /** Valor por ação/cota, em R$. */
  rate: number;
  /** Data com (último dia para ter direito), AAAA-MM-DD. */
  exDate: string | null;
  /** Data de pagamento, AAAA-MM-DD. */
  paymentDate: string | null;
};

export type AssetResponse = {
  generatedAt: string;
} & Result<{
  quote: Quote;
  /** Período do histórico obtido ("5y", ou menos se o plano recusar). */
  historyRange: string;
  fundamentals: Fundamentals;
  /** Proventos com data com nos últimos 12 meses (inclui pagamentos futuros já anunciados). */
  dividends: DividendPayment[];
  /** O que o plano da brapi cobre (indicadores completos: Pro; proventos: Startup ou Pro). */
  coverage: { fundamentals: boolean; dividends: boolean };
}>;

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

/** Um ponto de série histórica: data (AAAA-MM-DD) e valor em %. */
export type SeriesPoint = { date: string; value: number };

export type MacroHistoryResponse = {
  generatedAt: string;
  source: string;
  /** Uma série por indicador; até 5 anos, um ponto por mês. */
  series: Record<MacroIndicator["id"], Result<{ points: SeriesPoint[] }>>;
};

// ---------- Notícias (RSS) ----------

export type NewsItem = {
  /** Link da matéria original (também serve de identificador). */
  link: string;
  title: string;
  sourceId: string;
  sourceName: string;
  /** Horário de publicação informado pelo veículo (ISO). */
  publishedAt: string;
  theme: "mercado" | "economia" | "empresas";
  /** Foto fornecida pelo próprio feed (hospedada pelo veículo), ou null. */
  image: string | null;
  /** Quantos veículos publicaram sobre o mesmo assunto (inclui este). */
  coverage: number;
  /** Relevância: cobertura entre veículos com desconto pela idade. */
  score: number;
};

export type NewsResponse = {
  generatedAt: string;
  sources: ({ id: string; name: string } & Result<{ count: number }>)[];
  /** Mais recentes primeiro. */
  items: NewsItem[];
};

// ---------- Tesouro Direto (Tesouro Transparente) ----------

export type TreasuryBond = {
  /** Identificador estável (título + vencimento), usado no histórico. */
  id: string;
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

// ---------- Resultados trimestrais (CVM + manchetes) ----------

export type EarningsRelease = {
  /** Ex.: "3T26". */
  quarter: string;
  /** Ex.: "3º trimestre de 2026" ou "resultado anual de 2025". */
  quarterLabel: string;
  /** Dia da divulgação (AAAA-MM-DD). */
  date: string;
  /** "cvm": entrega oficial do ITR/DFP; "news": manchete do dia (antes de a CVM atualizar). */
  source: "cvm" | "news";
  /** Veículo da manchete, quando source = "news". */
  sourceName?: string;
  /** Link da manchete, quando source = "news". */
  link?: string;
};

export type EarningsResponse = {
  generatedAt: string;
  /** Por ticker, só os que divulgaram resultado nos últimos dias. */
  releases: Record<string, EarningsRelease>;
  /** Até quando os arquivos da CVM estão atualizados (última entrega no arquivo). */
  cvmUpdatedThrough: string | null;
};

/** Histórico diário de um título (desde que começou a ser negociado). */
export type TreasuryHistory = {
  id: string;
  title: string;
  maturity: string;
  /** Data mais recente do arquivo oficial (AAAA-MM-DD). */
  referenceDate: string;
  /** Um ponto por dia útil; taxas em % a.a. (null = sem taxa nesse dia). */
  points: { date: string; buyRate: number | null; sellRate: number | null }[];
};

export type TreasuryHistoryResponse = {
  generatedAt: string;
  source: string;
} & Result<{ history: TreasuryHistory }>;

export type TreasuryResponse = {
  generatedAt: string;
  source: string;
} & Result<{
  /** Data-base dos preços e taxas (AAAA-MM-DD): o último dia útil publicado. */
  referenceDate: string;
  bonds: TreasuryBond[];
}>;
