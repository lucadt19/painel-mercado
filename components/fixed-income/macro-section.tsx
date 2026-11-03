"use client";

import { useMemo, useState } from "react";
import { useMacro, useMacroHistory } from "@/hooks/use-market-data";
import { formatMacroDate, formatNumber } from "@/lib/format";
import type { MacroIndicator, MacroHistoryResponse, SeriesPoint } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RateCard } from "@/components/overview/fixed-income-cards";
import { ChartLegend, SeriesChart, type ChartSeries } from "@/components/charts/series-chart";

const IDS: MacroIndicator["id"][] = ["selicMeta", "cdi", "ipcaMensal", "ipca12m"];

const PERIODS = [
  { id: "1A", years: 1 },
  { id: "2A", years: 2 },
  { id: "5A", years: 5 },
];

/** Últimos `years` anos da série, contados a partir do dado mais recente. */
function cut(points: SeriesPoint[], years: number): SeriesPoint[] {
  const last = points.at(-1)?.date;
  if (!last) return points;
  const from = `${Number(last.slice(0, 4)) - years}${last.slice(4)}`;
  return points.filter((p) => p.date >= from);
}

function seriesOf(data: MacroHistoryResponse | undefined, id: MacroIndicator["id"]) {
  const s = data?.series[id];
  return s && s.ok ? s.points : [];
}

function ChartCard({
  title,
  series,
  loading,
  failed,
}: {
  title: string;
  series: ChartSeries[];
  loading: boolean;
  failed: boolean;
}) {
  return (
    <Card className="p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <ChartLegend series={series} />
      </div>
      {loading ? (
        <Skeleton className="h-60 w-full md:h-72" />
      ) : failed ? (
        <p className="flex h-60 items-center justify-center text-xs text-muted md:h-72">
          Dados indisponíveis no momento
        </p>
      ) : (
        <SeriesChart series={series} />
      )}
    </Card>
  );
}

export function MacroSection() {
  const macro = useMacro();
  const history = useMacroHistory();
  const [periodId, setPeriodId] = useState("2A");
  const years = PERIODS.find((p) => p.id === periodId)!.years;

  const rateSeries = useMemo<ChartSeries[]>(
    () => [
      { id: "selic", label: "Selic meta", color: "accent", points: cut(seriesOf(history.data, "selicMeta"), years) },
      { id: "cdi", label: "CDI", color: "muted", dashed: true, points: cut(seriesOf(history.data, "cdi"), years) },
    ],
    [history.data, years],
  );
  const ipcaSeries = useMemo<ChartSeries[]>(
    () => [
      { id: "ipcaMes", label: "IPCA do mês", color: "muted", bars: true, points: cut(seriesOf(history.data, "ipcaMensal"), years) },
      { id: "ipca12", label: "IPCA em 12 meses", color: "accent", points: cut(seriesOf(history.data, "ipca12m"), years) },
    ],
    [history.data, years],
  );

  const loading = !history.data && !history.error;
  const failedRates = !!history.error || (!!history.data && !history.data.series.selicMeta.ok && !history.data.series.cdi.ok);
  const failedIpca = !!history.error || (!!history.data && !history.data.series.ipcaMensal.ok && !history.data.series.ipca12m.ok);

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle aside="fonte: Banco Central do Brasil">Indicadores</SectionTitle>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {IDS.map((id) => {
          const item = macro.data?.items.find((i) => i.id === id);
          const label = { selicMeta: "Selic meta", cdi: "CDI", ipcaMensal: "IPCA do mês", ipca12m: "IPCA 12 meses" }[id];
          if (!macro.data) {
            return <RateCard key={id} label={label} loading={!macro.error} error={macro.error ? "Falha ao buscar dados" : undefined} />;
          }
          if (!item || !item.ok) {
            return <RateCard key={id} label={label} error={item && !item.ok ? item.error : "Sem dados"} />;
          }
          const ind = item.indicator;
          return (
            <RateCard
              key={id}
              label={label}
              value={`${formatNumber(ind.value)}%`}
              unit={ind.unit === "% a.a." ? "a.a." : undefined}
              date={formatMacroDate(ind.referenceDate, ind.dateKind)}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs text-muted">Histórico mensal</h3>
        <div role="radiogroup" aria-label="Período do histórico" className="flex rounded-md border border-border p-0.5">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={periodId === p.id}
              onClick={() => setPeriodId(p.id)}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition-colors",
                periodId === p.id ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-text",
              )}
            >
              {p.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Selic meta e CDI (% a.a.)" series={rateSeries} loading={loading} failed={failedRates} />
        <ChartCard title="IPCA (%)" series={ipcaSeries} loading={loading} failed={failedIpca} />
      </div>
    </section>
  );
}
