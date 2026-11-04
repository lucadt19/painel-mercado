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
  HASH11: "ETF Cripto",
};

/**
 * Código CVM de cada empresa, para o selo de "resultado divulgado" ao lado do
 * ticker. Para acompanhar outra empresa, acrescente aqui (o código aparece em
 * dados.cvm.gov.br > Cias Abertas > Cadastro, com zeros à esquerda: 6 dígitos).
 */
export const cvmCodes: Record<string, string> = {
  PETR4: "009512", // Petrobras
  VALE3: "004170", // Vale
  ITUB4: "019348", // Itaú Unibanco
  WEGE3: "005410", // WEG
  BBAS3: "001023", // Banco do Brasil
};

/**
 * Nomes como aparecem nas manchetes, para achar a notícia do resultado mesmo
 * sem o ticker (ex.: "Itaú lucra R$ 12 bi no 3T26"). Com o nome, a manchete
 * precisa citar o trimestre ("3T26"), para evitar falso alarme.
 */
export const companyAliases: Record<string, string[]> = {
  PETR4: ["Petrobras"],
  VALE3: ["Vale"],
  ITUB4: ["Itaú", "Itau"],
  WEGE3: ["WEG"],
  BBAS3: ["Banco do Brasil"], // não usar "BB": casaria com BB Seguridade (outra empresa)
};

/** ETFs da seção "ETFs acompanhados" da página Ações & ETFs. */
export const trackedEtfs = ["BOVA11", "IVVB11", "SMAL11", "HASH11"];

/**
 * Aba "Mundo": grandes empresas estrangeiras, cotadas em dólar na bolsa
 * americana. No plano Gratuito só as 8 primeiras são cotadas (limite de 20
 * chamadas por minuto da brapi); as demais aparecem na busca e nos BDRs.
 * A ordem importa: deixe as mais importantes para você no topo.
 * `bdr` liga a empresa ao BDR negociado na B3, quando existe.
 */
export const worldStocks: { symbol: string; name: string; bdr?: string }[] = [
  { symbol: "AAPL", name: "Apple", bdr: "AAPL34" },
  { symbol: "MSFT", name: "Microsoft", bdr: "MSFT34" },
  { symbol: "NVDA", name: "Nvidia", bdr: "NVDC34" },
  { symbol: "GOOGL", name: "Alphabet (Google)", bdr: "GOGL34" },
  { symbol: "AMZN", name: "Amazon", bdr: "AMZO34" },
  { symbol: "META", name: "Meta (Facebook)", bdr: "M1TA34" },
  { symbol: "AVGO", name: "Broadcom", bdr: "AVGO34" },
  { symbol: "TSLA", name: "Tesla", bdr: "TSLA34" },
  { symbol: "TSM", name: "TSMC", bdr: "TSMC34" },
  { symbol: "BRK-B", name: "Berkshire Hathaway", bdr: "BERK34" },
  { symbol: "JPM", name: "JPMorgan Chase", bdr: "JPMC34" },
  { symbol: "V", name: "Visa", bdr: "VISA34" },
  { symbol: "LLY", name: "Eli Lilly", bdr: "LILY34" },
  { symbol: "WMT", name: "Walmart", bdr: "WALM34" },
  { symbol: "MA", name: "Mastercard", bdr: "MSCD34" },
  { symbol: "ORCL", name: "Oracle", bdr: "ORCL34" },
  { symbol: "NFLX", name: "Netflix", bdr: "NFLX34" },
  { symbol: "XOM", name: "Exxon Mobil", bdr: "EXXO34" },
  { symbol: "COST", name: "Costco", bdr: "COWC34" },
  { symbol: "UNH", name: "UnitedHealth", bdr: "UNHH34" },
  { symbol: "JNJ", name: "Johnson & Johnson", bdr: "JNJB34" },
  { symbol: "PG", name: "Procter & Gamble", bdr: "PGCO34" },
  { symbol: "HD", name: "Home Depot", bdr: "HOME34" },
  { symbol: "ASML", name: "ASML", bdr: "ASML34" },
  { symbol: "BAC", name: "Bank of America", bdr: "BOAC34" },
];

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
