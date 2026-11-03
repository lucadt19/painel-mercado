import type { SeriesPoint, TreasuryBond } from "@/lib/types";

/**
 * Curva de juros a partir das taxas do Tesouro Direto.
 *
 * - Nominal: Tesouro Prefixado (sem cupom) e Prefixado com juros semestrais.
 * - Real: Tesouro IPCA+ (sem cupom) e IPCA+ com juros semestrais.
 *   Educa+ e Renda+ ficam de fora: pagam em parcelas e distorcem a curva.
 * - Quando os dois tipos têm o mesmo vencimento, usamos o sem cupom.
 *
 * Inflação implícita em cada vencimento prefixado:
 *   (1 + nominal) / (1 + real) − 1,
 * com a taxa real estimada por interpolação linear entre os vencimentos
 * de IPCA+ vizinhos (só dentro do intervalo coberto pela curva real).
 */

/** Taxa de referência do título: compra; se não houver, resgate. */
const rateOf = (b: TreasuryBond) => b.buyRate ?? b.sellRate;

function curve(bonds: TreasuryBond[], zeroTitle: string, couponTitle: string): SeriesPoint[] {
  const byDate = new Map<string, { value: number; zero: boolean }>();
  for (const b of bonds) {
    const zero = b.title === zeroTitle;
    if (!zero && b.title !== couponTitle) continue;
    const rate = rateOf(b);
    if (rate === null) continue;
    const current = byDate.get(b.maturity);
    if (!current || (zero && !current.zero)) byDate.set(b.maturity, { value: rate, zero });
  }
  return [...byDate]
    .map(([date, { value }]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const days = (d: string) => Date.parse(`${d}T00:00:00Z`) / 86_400_000;

function interpolate(points: SeriesPoint[], date: string): number | null {
  const t = days(date);
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const ta = days(a.date);
    const tb = days(b.date);
    if (t >= ta && t <= tb) return a.value + ((b.value - a.value) * (t - ta)) / (tb - ta || 1);
  }
  return null;
}

export function buildYieldCurves(bonds: TreasuryBond[]) {
  const nominal = curve(bonds, "Tesouro Prefixado", "Tesouro Prefixado com Juros Semestrais");
  const real = curve(bonds, "Tesouro IPCA+", "Tesouro IPCA+ com Juros Semestrais");
  const implied: SeriesPoint[] = [];
  for (const n of nominal) {
    const r = interpolate(real, n.date);
    if (r === null) continue;
    implied.push({ date: n.date, value: ((1 + n.value / 100) / (1 + r / 100) - 1) * 100 });
  }
  return { nominal, real, implied };
}
