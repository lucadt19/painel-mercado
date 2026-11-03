/** Formatação pt-BR, sempre no fuso de São Paulo. */

const TZ = "America/Sao_Paulo";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const decimal2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const timeFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" });
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** R$ 1.234,56 */
export const formatBRL = (n: number) => brl.format(n);

const brl4 = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

/** R$ 5,4935 (câmbio, com 4 casas como na PTAX). */
export const formatBRL4 = (n: number) => brl4.format(n);

/** 1.234,56 (ou com outro número de casas decimais). */
export const formatNumber = (n: number, decimals = 2) =>
  decimals === 2
    ? decimal2.format(n)
    : n.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** +1,23% / −0,45% (com o sinal de menos tipográfico). */
export function formatPercent(n: number): string {
  const abs = decimal2.format(Math.abs(n));
  if (n > 0) return `+${abs}%`;
  if (n < 0) return `−${abs}%`;
  return `${abs}%`;
}

/** 14:32 */
export const formatTime = (iso: string) => timeFmt.format(new Date(iso));

/** 30/10/2026. Aceita "AAAA-MM-DD" (data pura) ou ISO completo. */
export function formatDate(isoOrDay: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoOrDay)) {
    const [y, m, d] = isoOrDay.split("-");
    return `${d}/${m}/${y}`;
  }
  return dateFmt.format(new Date(isoOrDay));
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** Data de um indicador macro, já com o rótulo certo para cada tipo. */
export function formatMacroDate(date: string, kind: "since" | "day" | "month"): string {
  if (kind === "since") return `vigente desde ${formatDate(date)}`;
  if (kind === "day") return `taxa de ${formatDate(date)}`;
  const [y, m] = date.split("-");
  return `referente a ${MONTHS[Number(m) - 1]}/${y}`;
}

/**
 * Horário de atualização para mostrar ao lado do dado:
 * "14:32" se for de hoje; "30/10/2026 14:32" se for de outro dia.
 */
export function formatUpdatedAt(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const sameDay = dayKeyFmt.format(d) === dayKeyFmt.format(now);
  return sameDay ? formatTime(iso) : `${formatDate(iso)} ${formatTime(iso)}`;
}
