import {
  holidays,
  holidaysCoveredUntilYear,
  sessionPeriods,
  specialSessions,
} from "@/config/b3-calendario";

/** Data e hora de agora em São Paulo, independente do fuso do computador. */
export function saoPauloNow(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    weekday: get("weekday"), // "Mon".."Sun"
  };
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export type MarketStatus = {
  open: boolean;
  /** Motivo de estar fechado, para mostrar na interface. */
  reason: "aberto" | "fim de semana" | "feriado" | "antes da abertura" | "após o fechamento";
  holidayName?: string;
  /** Minutos desde o fechamento de hoje (só quando reason = "após o fechamento"). */
  minutesSinceClose?: number;
  /** true se o calendário não cobre a data de hoje (precisa ser atualizado). */
  calendarOutdated: boolean;
};

export function getMarketStatus(now: Date = new Date()): MarketStatus {
  const { date, minutes, weekday } = saoPauloNow(now);
  const year = Number(date.slice(0, 4));

  const period =
    sessionPeriods.find((p) => date >= p.from && date <= p.to) ?? sessionPeriods.at(-1)!;
  const calendarOutdated =
    year > holidaysCoveredUntilYear || !sessionPeriods.some((p) => date >= p.from && date <= p.to);

  const base = { calendarOutdated };

  if (weekday === "Sat" || weekday === "Sun") return { ...base, open: false, reason: "fim de semana" };
  if (holidays[date]) {
    return { ...base, open: false, reason: "feriado", holidayName: holidays[date] };
  }

  const special = specialSessions[date];
  const openAt = toMinutes(special?.open ?? period.open);
  const closeAt = toMinutes(special?.close ?? period.close);

  if (minutes < openAt) return { ...base, open: false, reason: "antes da abertura" };
  if (minutes >= closeAt) {
    return { ...base, open: false, reason: "após o fechamento", minutesSinceClose: minutes - closeAt };
  }
  return { ...base, open: true, reason: "aberto" };
}

/**
 * Bolsa de Nova York aberta (9h30–16h, seg–sex, no fuso de Nova York, que
 * já considera o horário de verão americano)? Não considera os feriados dos
 * EUA: nesses dias a página só faz uma consulta a mais por hora, que volta
 * com o último fechamento.
 * `marginMinutes` estende o fim para pegar o preço de fechamento com atraso.
 */
export function isNyseOpen(now: Date = new Date(), marginMinutes = 0): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return false;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60 + marginMinutes;
}

/**
 * Cotações devem ser atualizadas agora? Sim durante o pregão e também por um
 * tempo depois do fechamento, igual ao atraso da fonte: o preço de fechamento
 * só chega depois desse atraso.
 */
export function shouldPollQuotes(status: MarketStatus, delayMinutes: number): boolean {
  if (status.open) return true;
  return status.reason === "após o fechamento" && (status.minutesSinceClose ?? 0) <= delayMinutes + 5;
}
