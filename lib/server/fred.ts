import "server-only";
import type { UsMacroResponse } from "@/lib/types";
import { errorMessage, fetchWithTimeout, SourceError } from "@/lib/server/http";

/**
 * Juros e inflação dos EUA, pelo FRED (Federal Reserve Bank of St. Louis):
 * arquivos CSV públicos, sem chave.
 * - DFEDTARL / DFEDTARU: limites inferior e superior da faixa-alvo dos Fed
 *   Funds (diária; muda só nas reuniões do FOMC).
 * - CPIAUCNS: índice de preços ao consumidor (CPI-U, sem ajuste sazonal), do
 *   BLS. A inflação em 12 meses é a variação do índice contra o mesmo mês do
 *   ano anterior (é o número divulgado na imprensa).
 */

type Point = { date: string; value: number };

async function fredSeries(id: string, start: string): Promise<Point[]> {
  // O FRED recusa pedidos sem User-Agent (o Node não manda um por padrão).
  const res = await fetchWithTimeout(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${id}&cosd=${start}`, {
    headers: { Accept: "text/csv,*/*", "User-Agent": "Mozilla/5.0 (compatible; PainelPessoal/1.0)" },
  });
  if (!res.ok) throw new SourceError(`O FRED respondeu com erro ${res.status}.`);
  const points = (await res.text())
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => l.split(","))
    // Vazio ou "." = sem dado (feriado; ou o CPI de out/2025, não coletado no shutdown do governo).
    .filter(([date, v]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && v !== undefined && v.trim() !== "" && v.trim() !== ".")
    .map(([date, v]) => ({ date, value: Number(v) }))
    .filter((p) => Number.isFinite(p.value) && p.value > 0);
  if (!points.length) throw new SourceError("O FRED não retornou dados para a série.");
  return points;
}

const isoDaysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

export async function fetchUsMacro(): Promise<Omit<UsMacroResponse, "generatedAt">> {
  const [fed, cpi] = await Promise.all([
    (async (): Promise<UsMacroResponse["fed"]> => {
      try {
        const start = isoDaysAgo(800);
        const [lower, upper] = await Promise.all([fredSeries("DFEDTARL", start), fredSeries("DFEDTARU", start)]);
        const lastLower = lower.at(-1)!;
        const lastUpper = upper.at(-1)!;
        // Desde quando vale a faixa atual (a última decisão do FOMC que a mudou).
        let since = lastUpper.date;
        for (let i = upper.length - 1; i >= 0 && upper[i].value === lastUpper.value; i--) since = upper[i].date;
        return { ok: true, lower: lastLower.value, upper: lastUpper.value, since, asOf: lastUpper.date };
      } catch (err) {
        return { ok: false, error: errorMessage(err) };
      }
    })(),
    (async (): Promise<UsMacroResponse["cpi"]> => {
      try {
        const points = await fredSeries("CPIAUCNS", isoDaysAgo(800));
        const byDate = new Map(points.map((p) => [p.date, p.value]));
        const pct = (a: number, b: number) => Math.round((a / b - 1) * 10_000) / 100;
        const monthBefore = (d: string, months: number) => {
          const dt = new Date(`${d}T12:00:00Z`);
          dt.setUTCMonth(dt.getUTCMonth() - months);
          return dt.toISOString().slice(0, 10);
        };
        const last = points.at(-1)!;
        // 12 meses: o mês mais recente cujo índice de um ano antes existe. (O de
        // out/2025 não existe: sem ele, não há variação oficial até out/2026.)
        const withYoy = [...points].reverse().find((p) => byDate.has(monthBefore(p.date, 12)));
        if (!withYoy) throw new SourceError("Sem índice de 12 meses atrás.");
        const prev = byDate.get(monthBefore(last.date, 1));
        return {
          ok: true,
          yoy: pct(withYoy.value, byDate.get(monthBefore(withYoy.date, 12))!),
          referenceMonth: withYoy.date,
          mom: prev ? pct(last.value, prev) : null,
          momMonth: last.date,
        };
      } catch (err) {
        return { ok: false, error: errorMessage(err) };
      }
    })(),
  ]);
  return { source: "FRED (Federal Reserve Bank of St. Louis); CPI do BLS", fed, cpi };
}
