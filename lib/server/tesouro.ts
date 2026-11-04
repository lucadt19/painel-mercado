import "server-only";
import type { TreasuryBond, TreasuryHistory } from "@/lib/types";
import { bondId } from "@/lib/treasury-id";
import { brDateToIso, fetchWithTimeout, parseBrNumber, SourceError } from "@/lib/server/http";

/**
 * Tesouro Direto via Tesouro Transparente (dados abertos oficiais do Tesouro
 * Nacional). O CSV traz todas as taxas e preços diários desde 2002 e é
 * atualizado uma vez por dia útil, com o fechamento do dia útil anterior.
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

/**
 * Taxa do arquivo. Vazio = sem taxa nesse dia. No Tesouro Selic, 0,00% (ou até
 * negativo) é um spread de verdade; nos demais títulos, 0,00 indica "sem taxa".
 */
const rate = (raw: string, indexer: TreasuryBond["indexer"]) => {
  const n = parseBrNumber(raw);
  if (n === null) return null;
  return n === 0 && indexer !== "Selic" ? null : n;
};

type Row = { title: string; maturity: string; date: string; cols: string[] };

/** Baixa e lê o CSV inteiro (~14 MB, ~180 mil linhas). */
async function loadRows(): Promise<{ rows: Row[]; latest: string }> {
  const res = await fetchWithTimeout(CSV_URL, {}, 60_000);
  if (!res.ok) throw new SourceError(`O Tesouro Transparente respondeu com erro ${res.status}.`);
  const text = await res.text();

  // Colunas: Tipo Titulo;Data Vencimento;Data Base;Taxa Compra Manha;Taxa Venda Manha;
  //          PU Compra Manha;PU Venda Manha;PU Base Manha
  const rows: Row[] = [];
  let latest = "";
  for (const line of text.split(/\r?\n/).slice(1)) {
    const cols = line.split(";");
    if (cols.length < 7) continue;
    const date = brDateToIso(cols[2]);
    const maturity = brDateToIso(cols[1]);
    if (!date || !maturity) continue;
    if (date > latest) latest = date;
    rows.push({ title: cols[0].trim(), maturity, date, cols });
  }
  if (!latest) throw new SourceError("O arquivo do Tesouro veio vazio ou em formato inesperado.");
  return { rows, latest };
}

/**
 * Uma leitura do arquivo para tudo: os títulos com preço na data mais recente
 * (tabela da Renda Fixa) e o histórico diário de cada um deles.
 */
export async function fetchTreasuryAll(): Promise<{
  referenceDate: string;
  bonds: TreasuryBond[];
  histories: Record<string, TreasuryHistory>;
}> {
  const { rows, latest } = await loadRows();
  const bonds = rows
    .filter((r) => r.date === latest)
    .map(({ title, maturity, cols }): TreasuryBond => ({
      id: bondId(title, maturity),
      title,
      indexer: indexerOf(title),
      maturity,
      buyRate: parseBrNumber(cols[3]),
      sellRate: parseBrNumber(cols[4]),
      buyPrice: parseBrNumber(cols[5]),
      sellPrice: parseBrNumber(cols[6]),
    }))
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR") || a.maturity.localeCompare(b.maturity));

  // Histórico só dos títulos ainda negociados: um ponto por dia útil.
  const current = new Set(bonds.map((b) => b.id));
  const histories: Record<string, TreasuryHistory> = {};
  for (const r of rows) {
    const id = bondId(r.title, r.maturity);
    if (!current.has(id)) continue;
    const indexer = indexerOf(r.title);
    const h = (histories[id] ??= { id, title: r.title, maturity: r.maturity, referenceDate: latest, points: [] });
    h.points.push({ date: r.date, buyRate: rate(r.cols[3], indexer), sellRate: rate(r.cols[4], indexer) });
  }
  for (const h of Object.values(histories)) h.points.sort((a, b) => a.date.localeCompare(b.date));

  return { referenceDate: latest, bonds, histories };
}
