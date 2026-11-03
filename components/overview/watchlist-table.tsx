"use client";

import { shortNames, watchlistSymbols } from "@/config/watchlist";
import { useQuotes } from "@/hooks/use-market-data";
import { periodLabelFor, QuoteTable } from "@/components/market/quote-table";

export function WatchlistTable() {
  const { data, error } = useQuotes();
  const periodLabel = periodLabelFor(data?.historyRange);

  return (
    <QuoteTable
      title="Minha watchlist"
      aside={data ? `Variação no período: ${periodLabel}` : undefined}
      symbols={watchlistSymbols}
      items={data?.watchlist}
      names={shortNames}
      periodLabel={periodLabel}
      loading={!data && !error}
      failed={!data && !!error}
    />
  );
}
