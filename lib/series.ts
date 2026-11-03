import type { PricePoint } from "@/lib/types";

const spDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

/**
 * Últimos `days` dias de preço para o mini-gráfico, terminando no preço atual.
 * Se o histórico já tem o dia de hoje, troca pelo preço mais recente.
 */
export function recentSeries(
  history: PricePoint[],
  price: number,
  updatedAt: string,
  days: number,
): number[] {
  const today = spDay(updatedAt);
  const past = history.filter((p) => p.date < today);
  return [...past.slice(-(days - 1)).map((p) => p.close), price];
}

/** Variação % do primeiro fechamento do histórico até o preço atual. */
export function changeOverHistory(history: PricePoint[], price: number): number | null {
  const first = history[0]?.close;
  return first ? (price / first - 1) * 100 : null;
}

/** Fechamentos de aproximadamente 1 mês (≈ 22 pregões). */
export const ONE_MONTH_SESSIONS = 22;
