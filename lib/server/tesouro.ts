import "server-only";
import type { TreasuryBond } from "@/lib/types";
import { brDateToIso, fetchWithTimeout, parseBrNumber, SourceError } from "@/lib/server/http";

/**
 * Tesouro Direto via Tesouro Transparente (dados abertos oficiais do Tesouro
 * Nacional). O CSV traz todo o histórico desde 2002 e é atualizado uma vez por
 * dia útil, com as taxas e preços do dia útil anterior. Usamos só a data mais
 * recente do arquivo.
 */
const CSV_URL =
  "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv";

export const TESOURO_SOURCE = "Tesouro Transparente (Tesouro Nacional)";

function indexerOf(title: string): TreasuryBond["indexer"] {
  if (title.includes("Selic")) return "Selic";
  if (title.includes("Prefixado")) return "Prefixado";
  if (title.includes("IGPM")) return "IGP-M";
  return "IPCA"; // IPCA+, Educa+ e Renda+ são corrigidos pelo IPCA
}

export async function fetchTreasuryBonds(): Promise<{ referenceDate: string; bonds: TreasuryBond[] }> {
  // O arquivo tem ~14 MB; damos mais tempo que o padrão.
  const res = await fetchWithTimeout(CSV_URL, {}, 60_000);
  if (!res.ok) throw new SourceError(`O Tesouro Transparente respondeu com erro ${res.status}.`);
  const text = await res.text();

  // Colunas: Tipo Titulo;Data Vencimento;Data Base;Taxa Compra Manha;Taxa Venda Manha;
  //          PU Compra Manha;PU Venda Manha;PU Base Manha
  const rows: string[][] = [];
  let latest = "";
  for (const line of text.split(/\r?\n/).slice(1)) {
    const cols = line.split(";");
    if (cols.length < 7) continue;
    const base = brDateToIso(cols[2]);
    if (!base) continue;
    if (base > latest) latest = base;
    rows.push(cols);
  }
  if (!latest) throw new SourceError("O arquivo do Tesouro veio vazio ou em formato inesperado.");

  const bonds = rows
    .filter((cols) => brDateToIso(cols[2]) === latest)
    .map((cols): TreasuryBond => ({
      title: cols[0].trim(),
      indexer: indexerOf(cols[0]),
      maturity: brDateToIso(cols[1]) ?? cols[1],
      buyRate: parseBrNumber(cols[3]),
      sellRate: parseBrNumber(cols[4]),
      buyPrice: parseBrNumber(cols[5]),
      sellPrice: parseBrNumber(cols[6]),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR") || a.maturity.localeCompare(b.maturity));

  return { referenceDate: latest, bonds };
}
