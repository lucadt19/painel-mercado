"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { WithStale } from "@/hooks/use-market-data";
import { formatMoney } from "@/lib/format";
import { changeOverHistory, ONE_MONTH_SESSIONS, recentSeries } from "@/lib/series";
import type { QuoteItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@/components/change";
import { Sparkline } from "@/components/sparkline";
import { UpdatedAt } from "@/components/updated-at";
import { TickerLogo } from "@/components/ticker-logo";
import { EarningsBadge } from "@/components/earnings-badge";

const th = "px-3 py-2 text-xs font-medium text-muted";
const td = "px-3 py-2.5";
/** Colunas secundárias: escondidas no celular. */
const secondary = "hidden md:table-cell";

/**
 * Tabela de cotações (watchlist, ETFs, aba Mundo): preço com horário da
 * fonte, variação do dia, variação no período e mini-gráfico de 1 mês.
 */
export function QuoteTable({
  title,
  aside,
  symbols,
  items,
  names,
  periodLabel,
  loading,
  failed,
}: {
  title: ReactNode;
  aside?: ReactNode;
  /** Ordem de exibição. */
  symbols: string[];
  items: WithStale<QuoteItem>[] | undefined;
  names: Record<string, string>;
  periodLabel: string;
  loading: boolean;
  /** A requisição inteira falhou (sem nenhum dado na tela). */
  failed: boolean;
}) {
  return (
    <section>
      <SectionTitle aside={aside}>{title}</SectionTitle>
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
            {symbols.map((symbol) => {
              const item = items?.find((i) => i.symbol === symbol);
              const name = names[symbol] ?? (item?.ok ? item.quote.name : "");

              return (
                <tr key={symbol} className="transition-colors hover:bg-surface-hover">
                  <td className={cn(td, "text-left")}>
                    <div className="flex items-center gap-2.5">
                      <TickerLogo symbol={symbol} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <Link href={`/acoes/${encodeURIComponent(symbol)}`} className="font-medium hover:text-accent">
                            {symbol}
                          </Link>
                          <EarningsBadge symbol={symbol} />
                        </div>
                        <div className="max-w-[12rem] truncate text-xs text-muted">{name}</div>
                      </div>
                    </div>
                  </td>

                  {!items ? (
                    failed ? (
                      <td colSpan={4} className={cn(td, "text-right text-xs text-muted")}>
                        Dados indisponíveis no momento
                      </td>
                    ) : loading ? (
                      <>
                        <td className={td}><Skeleton className="ml-auto h-4 w-16" /></td>
                        <td className={td}><Skeleton className="ml-auto h-4 w-12" /></td>
                        <td className={cn(td, secondary)}><Skeleton className="ml-auto h-4 w-12" /></td>
                        <td className={cn(td, secondary)}><Skeleton className="ml-auto h-6 w-24" /></td>
                      </>
                    ) : null
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
                            "-mx-1 inline-block rounded px-1 tabular-nums whitespace-nowrap",
                            item.tick === "up" && "motion-safe:animate-flash-up",
                            item.tick === "down" && "motion-safe:animate-flash-down",
                          )}
                        >
                          {formatMoney(item.quote.price, item.quote.currency)}
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

/** "12 meses" ou "3 meses", conforme o histórico que a brapi entregou. */
export const periodLabelFor = (range: string | undefined) => (range === "3mo" ? "3 meses" : "12 meses");
