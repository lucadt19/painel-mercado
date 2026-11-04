"use client";

import Link from "next/link";
import { fxPairs, indices } from "@/config/watchlist";
import { useQuotes, type QuotesData } from "@/hooks/use-market-data";
import { formatBRL4, formatNumber } from "@/lib/format";
import { recentSeries } from "@/lib/series";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@/components/change";
import { Sparkline } from "@/components/sparkline";
import { UpdatedAt } from "@/components/updated-at";

/** Ordem da faixa: Ibovespa, IFIX, Dólar, Euro, S&P 500. */
type Slot =
  | { kind: "index"; symbol: string; label: string; decimals: number }
  | { kind: "fx"; pair: string; label: string };

const slots: Slot[] = [
  { kind: "index", ...indices[0] },
  { kind: "index", ...indices[1] },
  ...fxPairs.map((p): Slot => ({ kind: "fx", ...p })),
  ...indices.slice(2).map((i): Slot => ({ kind: "index", ...i })),
];

/** Mini-gráfico: últimos 5 pregões, terminando no valor atual. */
const SPARK_DAYS = 5;

type TileData = {
  value: string;
  changePercent: number | null;
  series: number[];
  updatedAt: string;
  sourcePrefix?: string;
  staleError?: string;
  tick?: "up" | "down";
};

function tileData(slot: Slot, data: QuotesData): TileData | { error: string } {
  if (slot.kind === "index") {
    const item = data.indices.find((i) => i.symbol === slot.symbol);
    if (!item || !item.ok) return { error: item && !item.ok ? item.error : "Sem dados." };
    const q = item.quote;
    return {
      value: formatNumber(q.price, slot.decimals),
      changePercent: q.changePercent,
      series: recentSeries(q.history, q.price, q.updatedAt, SPARK_DAYS),
      updatedAt: q.updatedAt,
      staleError: item.stale?.error,
      tick: item.tick,
    };
  }
  const item = data.fx.find((f) => f.pair === slot.pair);
  if (!item || !item.ok) return { error: item && !item.ok ? item.error : "Sem dados." };
  const r = item.rate;
  return {
    value: formatBRL4(r.price),
    changePercent: r.changePercent,
    series: recentSeries(r.history, r.price, r.updatedAt, SPARK_DAYS),
    updatedAt: r.updatedAt,
    sourcePrefix: r.source.startsWith("PTAX") ? "PTAX" : undefined,
    staleError: item.stale?.error,
    tick: item.tick,
  };
}

/** Clicar no card abre o histórico: índices na página do ativo, moedas na página do câmbio. */
const hrefOf = (slot: Slot) =>
  slot.kind === "index" ? `/acoes/${encodeURIComponent(slot.symbol)}` : `/cambio/${slot.pair.toLowerCase()}`;

function Tile({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={`${label}: ver histórico`}
      className="group min-w-[10.5rem] shrink-0 snap-start rounded-card md:min-w-0"
    >
      <Card className="flex h-full flex-col gap-1 p-3 transition-colors duration-150 group-hover:border-border-strong group-hover:bg-surface-hover">
        <div className="text-xs text-muted">{label}</div>
        {children}
      </Card>
    </Link>
  );
}

export function IndexStrip() {
  const { data, error } = useQuotes();

  return (
    <section aria-label="Índices e câmbio">
      {/* No celular, carrossel horizontal; a partir do tablet, grade de 5. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
        {slots.map((slot) => {
          const key = slot.kind === "index" ? slot.symbol : slot.pair;

          if (!data) {
            return (
              <Tile key={key} label={slot.label} href={hrefOf(slot)}>
                {error ? (
                  <p className="py-3 text-xs text-muted">Dados indisponíveis no momento</p>
                ) : (
                  <>
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-1 h-7 w-full" />
                  </>
                )}
              </Tile>
            );
          }

          const t = tileData(slot, data);
          if ("error" in t) {
            return (
              <Tile key={key} label={slot.label} href={hrefOf(slot)}>
                <p className="py-3 text-xs text-muted" title={t.error}>
                  Dados indisponíveis no momento
                </p>
              </Tile>
            );
          }

          return (
            <Tile key={key} label={slot.label} href={hrefOf(slot)}>
              <div
                key={`${t.updatedAt}-${t.value}`}
                className={cn(
                  "-mx-1 rounded px-1 text-lg font-semibold tabular-nums",
                  t.tick === "up" && "motion-safe:animate-flash-up",
                  t.tick === "down" && "motion-safe:animate-flash-down",
                )}
              >
                {t.value}
              </div>
              <div className="flex items-center justify-between gap-2">
                <Change value={t.changePercent} className="text-sm" />
                <UpdatedAt iso={t.updatedAt} prefix={t.sourcePrefix} staleError={t.staleError} />
              </div>
              <Sparkline values={t.series} width={160} height={28} className="mt-1 w-full" />
            </Tile>
          );
        })}
      </div>
    </section>
  );
}
