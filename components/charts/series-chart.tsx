"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { cn } from "@/lib/utils";

/** Cores permitidas, todas vindas dos tokens do tema (sem cor solta). */
export type SeriesColor = "accent" | "text" | "muted";

const TOKEN: Record<SeriesColor, string> = {
  accent: "--accent",
  text: "--text",
  muted: "--text-muted",
};

export type ChartSeries = {
  id: string;
  label: string;
  color: SeriesColor;
  /** Linha tracejada (para diferenciar sem usar outra cor). */
  dashed?: boolean;
  /** Barras em vez de linha (ex.: IPCA do mês). */
  bars?: boolean;
  points: { date: string; value: number }[];
};

const toTime = (day: string) => (Date.parse(`${day}T12:00:00Z`) / 1000) as UTCTimestamp;

function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Legenda simples, em HTML: traço com a cor/estilo de cada série. */
export function ChartLegend({ series }: { series: Pick<ChartSeries, "label" | "color" | "dashed" | "bars">[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {series.map((s) => (
        <li key={s.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn(
              s.bars ? "h-2.5 w-2 rounded-sm" : "h-0 w-4 border-t-2",
              s.dashed && "border-dashed",
              s.color === "accent" && (s.bars ? "bg-accent" : "border-accent"),
              s.color === "text" && (s.bars ? "bg-text" : "border-text"),
              s.color === "muted" && (s.bars ? "bg-muted" : "border-muted"),
            )}
          />
          {s.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Gráfico de séries no tempo (lightweight-charts): linhas e/ou barras,
 * grade quase invisível, cores do tema. Valores em % com 2 casas.
 */
export function SeriesChart({
  series,
  className,
  formatValue = (v) => `${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
}: {
  series: ChartSeries[];
  className?: string;
  formatValue?: (v: number) => string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const handlesRef = useRef(new Map<string, ISeriesApi<"Line"> | ISeriesApi<"Histogram">>());
  const seriesRef = useRef(series);
  const applyThemeRef = useRef<() => void>(() => {});
  const formatRef = useRef(formatValue);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handles = handlesRef.current;
    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        fontFamily: getComputedStyle(document.body).fontFamily,
        fontSize: 11,
        attributionLogo: true, // exigido pela licença da TradingView
      },
      localization: { locale: "pt-BR", priceFormatter: (v: number) => formatRef.current(v) },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
    });
    chartRef.current = chart;

    const applyTheme = () => {
      chart.applyOptions({
        layout: { textColor: cssVar("--text-muted") },
        grid: { vertLines: { visible: false }, horzLines: { color: cssVar("--border") } },
      });
      for (const s of seriesRef.current) {
        const h = handles.get(s.id);
        const color = cssVar(TOKEN[s.color]);
        if (h) h.applyOptions({ color });
      }
    };
    applyThemeRef.current = applyTheme;

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      chart.remove();
      handles.clear();
      chartRef.current = null;
    };
  }, []);

  // O formatador pode ser recriado a cada render; guardamos só a versão atual.
  useEffect(() => {
    formatRef.current = formatValue;
  });

  // Cria/atualiza as séries quando os dados mudam (passe `series` memorizado).
  useEffect(() => {
    seriesRef.current = series;
    const chart = chartRef.current;
    if (!chart) return;
    const handles = handlesRef.current;

    // Remove séries que saíram.
    for (const [id, h] of handles) {
      if (!series.some((s) => s.id === id)) {
        chart.removeSeries(h);
        handles.delete(id);
      }
    }
    for (const s of series) {
      let h = handles.get(s.id);
      if (!h) {
        h = s.bars
          ? chart.addSeries(HistogramSeries, { priceLineVisible: false, lastValueVisible: false })
          : chart.addSeries(LineSeries, {
              lineWidth: 2,
              lineStyle: s.dashed ? LineStyle.Dashed : LineStyle.Solid,
              priceLineVisible: false,
              pointMarkersVisible: s.points.length < 30,
            });
        handles.set(s.id, h);
      }
      // A biblioteca exige datas em ordem e sem repetição.
      const seen = new Set<number>();
      const data = s.points
        .map((p) => ({ time: toTime(p.date), value: p.value }))
        .sort((a, b) => a.time - b.time)
        .filter((p) => (seen.has(p.time) ? false : (seen.add(p.time), true)));
      h.setData(data);
    }
    applyThemeRef.current();
    chart.timeScale().fitContent();
  }, [series]);

  return <div ref={containerRef} className={cn("h-60 w-full md:h-72", className)} />;
}
