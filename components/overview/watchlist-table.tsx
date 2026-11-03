"use client";

import { shortNames, watchlistSymbols } from "@/config/watchlist";
import { useQuotes } from "@/hooks/use-market-data";
import { formatBRL } from "@/lib/format";
import { changeOverHistory, ONE_MONTH_SESSIONS, recentSeries } from "@/lib/series";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@/components/change";
import { Sparkline } from "@/components/sparkline";
import { UpdatedAt } from "@/components/updated-at";

const th = "px-3 py-2 text-xs font-medium text-muted";
const td = "px-3 py-2.5";
/** Colunas secundárias: escondidas no celular. */
const secondary = "hidden md:table-cell";

export function WatchlistTable() {
  const { data, error } = useQuotes();
  const periodLabel = data?.historyRange === "1y" ? "12 meses" : "3 meses";

  return (
    <section aria-labelledby="watchlist-title">
      <SectionTitle aside={data ? `Variação no período: ${periodLabel}` : undefined}>
        <span id="watchlist-title">Minha watchlist</span>
      </SectionTitle>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className={cn(th, "text-left")}>Ativo</th>
              <th className={cn(th, "text-right")}>Preço</th>
              <th className={cn(th, "text-right")}>Dia</th>
              <th className={cn(th, secondary, "text-right")}>{periodLabel}</th>
              <th className={cn(th, secondary, "text-right")}>1 mês</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {watchlistSymbols.map((symbol) => {
              const item = data?.watchlist.find((i) => i.symbol === symbol);
              const name = shortNames[symbol] ?? (item?.ok ? item.quote.name : "");

              return (
                <tr key={symbol} className="transition-colors hover:bg-surface-hover">
                  <td className={cn(td, "text-left")}>
                    {/* Vira link para a página do ativo na etapa 4. */}
                    <span className="font-medium">{symbol}</span>
                    <div className="max-w-[12rem] truncate text-xs text-muted">{name}</div>
                  </td>

                  {!data ? (
                    error ? (
                      <td colSpan={4} className={cn(td, "text-right text-xs text-muted")}>
                        Dados indisponíveis no momento
                      </td>
                    ) : (
                      <>
                        <td className={td}><Skeleton className="ml-auto h-4 w-16" /></td>
                        <td className={td}><Skeleton className="ml-auto h-4 w-12" /></td>
                        <td className={cn(td, secondary)}><Skeleton className="ml-auto h-4 w-12" /></td>
                        <td className={cn(td, secondary)}><Skeleton className="ml-auto h-6 w-24" /></td>
                      </>
                    )
                  ) : !item || !item.ok ? (
                    <td
                      colSpan={4}
                      className={cn(td, "text-right text-xs text-muted")}
                      title={item && !item.ok ? item.error : undefined}
                    >
                      Dados indisponíveis no momento
                    </td>
                  ) : (
                    <>
                      <td className={cn(td, "text-right")}>
                        <span
                          key={`${item.quote.updatedAt}-${item.quote.price}`}
                          className={cn(
                            "-mx-1 inline-block rounded px-1 tabular-nums",
                            item.tick === "up" && "motion-safe:animate-flash-up",
                            item.tick === "down" && "motion-safe:animate-flash-down",
                          )}
                        >
                          {formatBRL(item.quote.price)}
                        </span>
                        <div>
                          <UpdatedAt iso={item.quote.updatedAt} staleError={item.stale?.error} />
                        </div>
                      </td>
                      <td className={cn(td, "text-right")}>
                        <Change value={item.quote.changePercent} />
                      </td>
                      <td className={cn(td, secondary, "text-right")}>
                        <Change value={changeOverHistory(item.quote.history, item.quote.price)} />
                      </td>
                      <td className={cn(td, secondary)}>
                        <Sparkline
                          values={recentSeries(
                            item.quote.history,
                            item.quote.price,
                            item.quote.updatedAt,
                            ONE_MONTH_SESSIONS,
                          )}
                          className="ml-auto"
                        />
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
