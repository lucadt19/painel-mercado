"use client";

import { useEffect, useRef } from "react";
import {
  AreaSeries,
  ColorType,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { formatMoney } from "@/lib/format";

/** Cores do tema atual, lidas dos tokens CSS (nenhuma cor solta no código). */
function themeColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    text: v("--text-muted"),
    border: v("--border"),
    up: v("--up"),
    upSoft: v("--up-soft"),
    down: v("--down"),
    downSoft: v("--down-soft"),
  };
}

const toTime = (day: string) => (Date.parse(`${day}T12:00:00Z`) / 1000) as UTCTimestamp;

/**
 * Gráfico de preço (TradingView Lightweight Charts): área com linha fina,
 * grade quase invisível, cor pela direção do período.
 */
export function PriceChart({
  points,
  currency,
  description,
}: {
  points: { date: string; close: number }[];
  currency: string;
  /** Resumo em texto para leitores de tela (o gráfico é um canvas). */
  description: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const pointsRef = useRef(points);
  const applyThemeRef = useRef<() => void>(() => {});

  // Cria o gráfico uma vez; reaplica cores quando o tema muda.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        fontFamily: getComputedStyle(document.body).fontFamily,
        fontSize: 11,
        attributionLogo: true, // exigido pela licença da TradingView
      },
      localization: {
        locale: "pt-BR",
        priceFormatter: (p: number) => formatMoney(p, currency),
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, fixLeftEdge: true, fixRightEdge: true },
      handleScroll: false,
      handleScale: false,
      crosshair: { vertLine: { labelVisible: true }, horzLine: { labelVisible: true } },
    });
    const series = chart.addSeries(AreaSeries, { lineWidth: 2, priceLineVisible: false });
    chartRef.current = chart;
    seriesRef.current = series;

    const applyTheme = () => {
      const c = themeColors();
      const pts = pointsRef.current;
      const rising = pts.length < 2 || pts[pts.length - 1].close >= pts[0].close;
      chart.applyOptions({
        layout: { textColor: c.text },
        grid: { vertLines: { visible: false }, horzLines: { color: c.border } },
      });
      series.applyOptions({
        lineColor: rising ? c.up : c.down,
        topColor: rising ? c.upSoft : c.downSoft,
        bottomColor: "transparent",
      });
    };
    applyTheme();

    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    applyThemeRef.current = applyTheme;

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [currency]);

  // Atualiza os dados (e a cor) quando o período muda.
  useEffect(() => {
    pointsRef.current = points;
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;
    series.setData(points.map((p) => ({ time: toTime(p.date), value: p.close })));
    applyThemeRef.current();
    chart.timeScale().fitContent();
  }, [points]);

  return <div ref={containerRef} role="img" aria-label={description} className="h-64 w-full md:h-80" />;
}
