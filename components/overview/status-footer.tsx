"use client";

import { useAutoRefresh } from "@/components/auto-refresh-provider";
import { useQuotes } from "@/hooks/use-market-data";
import { formatUpdatedAt } from "@/lib/format";

/** "Atualização automática · cotações de 17:43 · atraso ~30 min" */
export function StatusFooter() {
  const { data } = useQuotes();
  const { pollQuotes, market, tabVisible } = useAutoRefresh();

  // Horário da cotação mais recente informado pela fonte.
  const latest = data
    ? [...data.indices, ...data.watchlist]
        .filter((i) => i.ok)
        .map((i) => (i.ok ? i.quote.updatedAt : ""))
        .sort()
        .at(-1)
    : undefined;

  let mode = "Atualização automática";
  if (market && !pollQuotes) {
    mode = !tabVisible
      ? "Atualização automática pausada (aba em segundo plano)"
      : "Atualização automática pausada (pregão fechado)";
  }

  return (
    <footer className="mt-10 border-t border-border pt-4 text-xs text-muted">
      {mode}
      {latest && <> · cotações de {formatUpdatedAt(latest)}</>}
      {data && <> · atraso ~{data.delayMinutes} min</>}
    </footer>
  );
}
