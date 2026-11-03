/**
 * Ativos acompanhados. Edite à mão.
 * Os tickers seguem o formato da B3 (ex.: PETR4, BOVA11).
 */
export const watchlist = {
  acoes: ["PETR4", "VALE3", "ITUB4", "WEGE3", "BBAS3"],
  etfs: ["BOVA11", "IVVB11", "SMAL11"],
  fiis: [] as string[],
};

/**
 * Nome curto exibido na tabela. Se um ticker não estiver aqui, usamos o
 * nome que a brapi devolver.
 */
export const shortNames: Record<string, string> = {
  PETR4: "Petrobras PN",
  VALE3: "Vale ON",
  ITUB4: "Itaú Unibanco PN",
  WEGE3: "WEG ON",
  BBAS3: "Banco do Brasil ON",
  BOVA11: "ETF Ibovespa",
  IVVB11: "ETF S&P 500",
  SMAL11: "ETF Small Caps",
};

/** Título do Tesouro mostrado no card de renda fixa da Visão Geral. */
export const treasuryReference = { title: "Tesouro IPCA+", maturity: "2035-05-15" };

/** Todos os tickers da watchlist, na ordem de exibição. */
export const watchlistSymbols = [...watchlist.acoes, ...watchlist.etfs, ...watchlist.fiis];

/**
 * Índices da faixa do topo, com o símbolo usado na brapi.
 * Dólar e euro ficam em `fxPairs`, porque vêm de outra rota da fonte.
 */
export const indices = [
  { symbol: "^BVSP", label: "Ibovespa", decimals: 0 },
  { symbol: "IFIX", label: "IFIX", decimals: 2 },
  { symbol: "^GSPC", label: "S&P 500", decimals: 2 },
];

export const fxPairs = [
  { pair: "USD-BRL", label: "Dólar" },
  { pair: "EUR-BRL", label: "Euro" },
];
