"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { fxPairs } from "@/config/watchlist";
import { useFxHistory, useQuotes } from "@/hooks/use-market-data";
import { formatBRL4, formatDate } from "@/lib/format";
import type { SeriesPoint } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { Change } from "@/components/change";
import { UpdatedAt } from "@/components/updated-at";
import { SeriesChart, type ChartSeries } from "@/components/charts/series-chart";

const PERIODS = [
  { id: "1M", months: 1 },
  { id: "6M", months: 6 },
  { id: "1A", months: 12 },
  { id: "2A", months: 24 },
  { id: "5A", months: 60 },
];

/** Últimos `months` meses, contados a partir do dado mais recente (não do relógio). */
function cut(points: SeriesPoint[], months: number): SeriesPoint[] {
  const last = points.at(-1)?.date;
  if (!last) return points;
  const d = new Date(`${last}T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  const from = d.toISOString().slice(0, 10);
  return points.filter((p) => p.date >= from);
}

function Stat({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <Card className="flex flex-col gap-0.5 p-3">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </Card>
  );
}

/** Página de uma moeda: cotação atual (PTAX) e histórico de até 5 anos. */
export function FxView({ pair }: { pair: string }) {
  const meta = fxPairs.find((p) => p.pair === pair)!;
  const quotes = useQuotes();
  const history = useFxHistory(pair);
  const [periodId, setPeriodId] = useState("1A");
  const months = PERIODS.find((p) => p.id === periodId)!.months;

  const points = useMemo(
    () => (history.data?.ok ? cut(history.data.points, months) : []),
    [history.data, months],
  );
  const series = useMemo<ChartSeries[]>(
    () => [{ id: pair, label: meta.label, color: "accent", points }],
    [pair, meta.label, points],
  );

  const stats = useMemo(() => {
    if (points.length < 2) return null;
    let min = points[0];
    let max = points[0];
    for (const p of points) {
      if (p.value < min.value) min = p;
      if (p.value > max.value) max = p;
    }
    const first = points[0];
    const last = points.at(-1)!;
    return { min, max, first, last, change: (last.value / first.value - 1) * 100 };
  }, [points]);

  const fx = quotes.data?.fx.find((f) => f.pair === pair);
  const [from, to] = pair.split("-");

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="inline-flex w-fit items-center gap-1 text-xs text-muted hover:text-accent">
        <ArrowLeft aria-hidden className="size-3.5" /> Visão Geral
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          {meta.label} <span className="text-sm font-normal text-muted">{from}/{to}</span>
        </h1>
        {!quotes.data ? (
          <Skeleton className="h-7 w-48" />
        ) : fx?.ok ? (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold tabular-nums">{formatBRL4(fx.rate.price)}</span>
            <Change value={fx.rate.changePercent} className="text-sm" />
            <span className="text-xs text-muted">no dia</span>
            <UpdatedAt iso={fx.rate.updatedAt} prefix="PTAX" staleError={fx.stale?.error} />
          </div>
        ) : (
          <p className="text-sm text-muted">Cotação de hoje indisponível no momento</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs text-muted">Histórico diário (PTAX de venda)</h2>
        <Segmented
          label="Período do histórico"
          value={periodId}
          onChange={setPeriodId}
          options={PERIODS.map((p) => ({ value: p.id, label: p.id }))}
        />
      </div>

      <Card className="p-3">
        {!history.data && !history.error ? (
          <Skeleton className="h-60 w-full md:h-80" />
        ) : !history.data?.ok ? (
          <p className="flex h-60 items-center justify-center text-xs text-muted md:h-80">
            Dados indisponíveis no momento
          </p>
        ) : (
          <SeriesChart series={series} formatValue={formatBRL4} className="h-60 md:h-80" />
        )}
      </Card>

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={`Variação em ${periodId}`} value={<Change value={stats.change} />} note={`desde ${formatDate(stats.first.date)}`} />
          <Stat label="Mínima no período" value={formatBRL4(stats.min.value)} note={`em ${formatDate(stats.min.date)}`} />
          <Stat label="Máxima no período" value={formatBRL4(stats.max.value)} note={`em ${formatDate(stats.max.date)}`} />
          <Stat label="Último fechamento" value={formatBRL4(stats.last.value)} note={`PTAX de ${formatDate(stats.last.date)}`} />
        </div>
      )}

      <p className="text-xs text-muted">
        Fonte: {history.data?.source ?? "Banco Central do Brasil"}. A PTAX é a média das cotações do dia calculada
        pelo Banco Central; o fechamento sai por volta das 13h.
      </p>
    </div>
  );
}
