/**
 * Veículos de notícias (feeds RSS públicos). Edite à mão.
 *
 * Cada notícia recebe um tema (Mercado, Economia ou Empresas) por, nesta ordem:
 *  1. trechos do endereço da matéria (`pathThemes`, depois as regras gerais);
 *  2. categorias que o próprio feed informa;
 *  3. o tema padrão do veículo (`defaultTheme`), se houver.
 * Sem tema, a notícia fica de fora (ex.: política, esporte, carreira).
 *
 * Só exibimos título, veículo, horário e link. Nunca o texto da matéria.
 */

export type NewsTheme = "mercado" | "economia" | "empresas";

export const THEME_LABEL: Record<NewsTheme, string> = {
  mercado: "Mercado",
  economia: "Economia",
  empresas: "Empresas",
};

export type NewsSource = {
  id: string;
  name: string;
  url: string;
  /** Regras próprias do veículo: trecho do endereço -> tema (null = descartar). */
  pathThemes?: [string, NewsTheme | null][];
  /** Tema quando nada mais se aplica (feeds que já são de uma seção só). */
  defaultTheme?: NewsTheme;
  /**
   * "gratis": matérias abertas; "assinante": exige assinatura (às vezes com
   * algumas matérias grátis por mês, ver `paywallNote`). Pelo modelo de
   * assinatura do veículo; não abrimos as matérias para conferir.
   */
  paywall: Paywall;
  /** Detalhe mostrado ao passar o mouse no selo. */
  paywallNote?: string;
};

export type Paywall = "gratis" | "assinante";

export const PAYWALL_LABEL: Record<Paywall, string> = { gratis: "grátis", assinante: "assinante" };

export const newsSources: NewsSource[] = [
  { id: "infomoney", name: "InfoMoney", url: "https://www.infomoney.com.br/feed/", paywall: "gratis" },
  {
    id: "valor",
    name: "Valor Econômico",
    url: "https://valor.globo.com/rss/valor/",
    paywall: "assinante",
    paywallNote: "Exige assinatura para a maioria das matérias.",
    pathThemes: [
      ["/financas/", "mercado"],
      ["/empresas/", "empresas"],
      ["/agronegocios/", "empresas"],
      ["/brasil/", "economia"],
      ["/mundo/", null],
      ["/politica/", null],
    ],
  },
  {
    id: "estadao",
    name: "Estadão",
    url: "https://www.estadao.com.br/arc/outboundfeeds/feeds/rss/sections/economia/",
    paywall: "assinante",
    paywallNote: "Exige assinatura; algumas matérias ficam abertas.",
    pathThemes: [["/economia/negocios/", "empresas"]],
    defaultTheme: "economia",
  },
  {
    id: "folha",
    name: "Folha",
    url: "https://feeds.folha.uol.com.br/mercado/rss091.xml",
    paywall: "assinante",
    paywallNote: "Exige assinatura; libera algumas matérias por mês com cadastro.",
    defaultTheme: "economia",
  },
  {
    id: "exame",
    name: "Exame",
    url: "https://exame.com/feed/",
    paywall: "gratis",
    paywallNote: "Aberta; algumas matérias são exclusivas para assinantes.",
  },
  { id: "moneytimes", name: "Money Times", url: "https://www.moneytimes.com.br/feed/", paywall: "gratis" },
  { id: "g1", name: "g1", url: "https://g1.globo.com/rss/g1/economia/", defaultTheme: "economia", paywall: "gratis" },
];

/** Regras gerais por trecho do endereço (valem para todos os veículos). */
export const GENERIC_PATH_THEMES: [string, NewsTheme][] = [
  ["/mercados/", "mercado"],
  ["/mercado-financeiro/", "mercado"],
  ["/invest/", "mercado"],
  ["/investimentos/", "mercado"],
  ["/onde-investir/", "mercado"],
  ["/cripto", "mercado"],
  ["/economia/", "economia"],
  ["/negocios/", "empresas"],
  ["/business/", "empresas"],
  ["/empresas/", "empresas"],
];

/** Categorias do feed -> tema (comparação sem acento e em minúsculas). */
export const CATEGORY_THEMES: [string, NewsTheme][] = [
  ["mercados", "mercado"],
  ["acoes", "mercado"],
  ["ibovespa", "mercado"],
  ["dolar", "mercado"],
  ["cambio", "mercado"],
  ["renda fixa", "mercado"],
  ["fundos imobiliarios", "mercado"],
  ["criptomoedas", "mercado"],
  ["invest", "mercado"],
  ["economia", "economia"],
  ["juros", "economia"],
  ["inflacao", "economia"],
  ["empresas", "empresas"],
  ["negocios", "empresas"],
  ["temporada de balancos", "empresas"],
];
