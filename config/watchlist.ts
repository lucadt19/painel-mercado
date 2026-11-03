/**
 * Ativos acompanhados. Edite à mão.
 * Os tickers seguem o formato da B3 (ex.: PETR4, BOVA11).
 */
export const watchlist = {
  acoes: ["PETR4", "VALE3", "ITUB4", "WEGE3", "BBAS3"],
  etfs: ["BOVA11", "IVVB11", "SMAL11"],
  fiis: [] as string[],
};

/** Todos os tickers da watchlist, na ordem de exibição. */
export const watchlistSymbols = [...watchlist.acoes, ...watchlist.etfs, ...watchlist.fiis];

/**
 * Índices da faixa do topo, com o símbolo usado na brapi.
 * Dólar e euro ficam em `fxPairs`, porque vêm de outra rota da fonte.
 */
export const indices = [
  { symbol: "^BVSP", label: "Ibovespa" },
  { symbol: "IFIX", label: "IFIX" },
  { symbol: "^GSPC", label: "S&P 500" },
];

export const fxPairs = [
  { pair: "USD-BRL", label: "Dólar" },
  { pair: "EUR-BRL", label: "Euro" },
];
