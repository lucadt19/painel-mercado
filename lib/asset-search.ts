import { nameAbbreviations, searchAliases } from "@/config/search-aliases";

/**
 * Busca de ativos por ticker ou nome. Cada palavra digitada precisa começar
 * alguma palavra do nome (ou de um apelido conhecido), sem acento e com as
 * abreviações da B3 expandidas: "banco do brasil" acha "BCO BRASIL S.A.".
 */

export type SearchItem = { symbol: string; name: string; kind: string };
type Indexed = SearchItem & { sym: string; words: string[] };

const STOPWORDS = new Set(["de", "do", "da", "dos", "das", "e", "sa", "s"]);

export const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const wordsOf = (s: string) =>
  normalize(s)
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .map((w) => nameAbbreviations[w] ?? w);

/**
 * Tickers do mercado fracionário (PETR4F) repetem o ativo do lote padrão e só
 * poluem a busca: ficam de fora quando o ativo sem o "F" existe.
 */
export function buildSearchIndex(items: SearchItem[]): Indexed[] {
  const symbols = new Set(items.map((i) => i.symbol));
  return items
    .filter((i) => !(i.symbol.endsWith("F") && symbols.has(i.symbol.slice(0, -1))))
    .map((i) => {
      const aliases = searchAliases[i.symbol.slice(0, 4)] ?? [];
      return { ...i, sym: normalize(i.symbol), words: [...wordsOf(i.name), ...aliases.flatMap(wordsOf)] };
    });
}

/** Até `limit` resultados: ticker exato, ticker que começa com o texto e, depois, nome. */
export function searchAssets(index: Indexed[], query: string, limit = 8): SearchItem[] {
  const q = normalize(query.trim());
  if (q.length < 2) return [];
  const terms = wordsOf(q);
  const exact: Indexed[] = [];
  const starts: Indexed[] = [];
  const byName: Indexed[] = [];
  for (const h of index) {
    if (h.sym === q.replace(/\s/g, "")) exact.push(h);
    else if (h.sym.startsWith(q)) starts.push(h);
    else if (terms.length && terms.every((t) => h.words.some((w) => w.startsWith(t)))) byName.push(h);
  }
  // Pelo nome, ações e units antes dos outros (ex.: "itau" -> ITUB4 antes de fundos "Itaú ...").
  const rank = (h: Indexed) => (/^[A-Z]{4}(3|4|11)$/.test(h.symbol) && h.kind !== "FII" && h.kind !== "ETF" ? 0 : 1);
  byName.sort((a, b) => rank(a) - rank(b));
  return [...exact, ...starts, ...byName].slice(0, limit).map(({ symbol, name, kind }) => ({ symbol, name, kind }));
}
