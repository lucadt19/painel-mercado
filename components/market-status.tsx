"use client";

import { useAutoRefresh } from "@/components/auto-refresh-provider";
import { cn } from "@/lib/utils";

/**
 * Status do pregão + indicador de atualização automática.
 * Ponto verde: atualização automática ativa. Cinza: pausada.
 */
export function MarketStatus() {
  const { market, tabVisible, pollQuotes } = useAutoRefresh();

  if (!market) {
    return (
      <span className="flex items-center gap-2 text-xs text-muted">
        <span aria-hidden className="size-1.5 rounded-full bg-muted" />
        Pregão —
      </span>
    );
  }

  const label = market.open ? "Pregão aberto" : "Pregão fechado";

  let detail: string;
  if (pollQuotes) detail = "Atualização automática ativa";
  else if (!tabVisible) detail = "Atualização automática pausada: aba em segundo plano";
  else if (market.reason === "feriado") detail = `Atualização automática pausada: feriado (${market.holidayName})`;
  else detail = `Atualização automática pausada: pregão fechado (${market.reason})`;
  if (market.calendarOutdated) detail += ". Atenção: calendário da B3 desatualizado.";

  return (
    <span className="flex items-center gap-2 text-xs text-muted" title={detail}>
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full transition-colors", pollQuotes ? "bg-up" : "bg-muted")}
      />
      <span>{label}</span>
      <span className="sr-only">. {detail}</span>
    </span>
  );
}
