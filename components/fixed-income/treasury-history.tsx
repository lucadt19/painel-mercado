"use client";

import { useMemo, useState } from "react";
import { useTreasuryHistory } from "@/hooks/use-market-data";
import { formatDate, formatNumber } from "@/lib/format";
import type { TreasuryBond } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Segmented } from "@/components/ui/segmented";
import { SeriesChart, type ChartSeries } from "@/components/charts/series-chart";

const PERIODS = [
  { value: "1A", label: "1A", years: 1 },
  { value: "2A", label: "2A", years: 2 },
  { value: "5A", label: "5A", years: 5 },
  { value: "tudo", label: "Tudo", years: 0 },
] as const;
type PeriodId = (typeof PERIODS)[number]["value"];

/** Famílias na ordem do seletor. */
const FAMILY_ORDER = [
  "Tesouro Selic",
  "Tesouro Prefixado",
  "Tesouro Prefixado com Juros Semestrais",
  "Tesouro IPCA+",
  "Tesouro IPCA+ com Juros Semestrais",
];

/** Taxa no formato de cada título: "Selic + 0,06%", "IPCA + 7,88%", "13,48%". */
function rateText(indexer: TreasuryBond["indexer"], v: number) {
  const r = `${formatNumber(v)}%`;
  if (indexer === "Selic") return `Selic + ${r}`;
  if (indexer === "IPCA") return `IPCA + ${r}`;
  if (indexer === "IGP-M") return `IGP-M + ${r}`;
  return r;
}

const pct = (n: number) => `${Math.round(n)}%`;

/**
 * Histórico da taxa de compra de um título, com a comparação da taxa de
 * hoje contra a média, a mínima, a máxima e o percentil do período.
 */
export function TreasuryHistorySection({
  bonds,
  selectedId,
  onSelect,
}: {
  bonds: TreasuryBond[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { data, error } = useTreasuryHistory(selectedId);
  const [periodId, setPeriodId] = useState<PeriodId>("5A");
  const bond = bonds.find((b) => b.id === selectedId);

  // Grupos do seletor: famílias principais primeiro, as demais depois.
  const groups = useMemo(() => {
    const by = new Map<string, TreasuryBond[]>();
    for (const b of bonds) by.set(b.title, [...(by.get(b.title) ?? []), b]);
    const titles = [...by.keys()].sort((a, b) => {
      const ia = FAMILY_ORDER.indexOf(a);
      const ib = FAMILY_ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b, "pt-BR");
    });
    return titles.map((t) => ({ title: t, bonds: by.get(t)!.sort((a, b) => a.maturity.localeCompare(b.maturity)) }));
  }, [bonds]);

  const history = data?.ok ? data.history : undefined;

  const view = useMemo(() => {
    if (!history) return null;
    // Taxa de compra; nos dias sem ela (título fora de venda), não há ponto.
    const all = history.points
      .filter((p) => p.buyRate !== null)
      .map((p) => ({ date: p.date, value: p.buyRate as number }));
    if (all.length < 2) return null;
    const period = PERIODS.find((p) => p.value === periodId)!;
    const last = all[all.length - 1];
    const from = period.years ? `${Number(last.date.slice(0, 4)) - period.years}${last.date.slice(4)}` : "";
    const points = from ? all.filter((p) => p.date >= from) : all;

    let min = points[0];
    let max = points[0];
    let sum = 0;
    let below = 0;
    let above = 0;
    for (const p of points) {
      if (p.value < min.value) min = p;
      if (p.value > max.value) max = p;
      sum += p.value;
      if (p.value < last.value) below++;
      else if (p.value > last.value) above++;
    }
    const share = (n: number) => (n / points.length) * 100;
    return {
      points,
      first: points[0],
      last,
      min,
      max,
      mean: sum / points.length,
      // % dos dias do período com taxa menor, maior e igual à de hoje
      // (o Tesouro Selic costuma repetir a mesma taxa por muitos dias).
      belowPct: share(below),
      abovePct: share(above),
      equalPct: share(points.length - below - above),
      since: all[0].date,
      // O título é mais novo que o período escolhido (ex.: "5A" num título de 2023)?
      coversWholeHistory: !from || from <= all[0].date,
    };
  }, [history, periodId]);

  const series = useMemo<ChartSeries[]>(
    () => (view ? [{ id: "compra", label: "Taxa de compra", color: "accent", points: view.points }] : []),
    [view],
  );

  const indexer = bond?.indexer ?? "Prefixado";
  const periodLabel = view?.coversWholeHistory
    ? `desde o início da negociação (${view ? formatDate(view.since) : ""})`
    : { "1A": "do último ano", "2A": "dos últimos 2 anos", "5A": "dos últimos 5 anos", tudo: "" }[periodId];

  return (
    <section id="historico-tesouro" className="scroll-mt-16">
      <SectionTitle aside={history ? `até ${formatDate(history.referenceDate)} · Tesouro Transparente` : undefined}>
        Histórico das taxas
      </SectionTitle>

      <Card className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Título do Tesouro"
            value={selectedId}
            onChange={(e) => onSelect(e.target.value)}
            className="rounded-md border border-border-strong bg-surface px-2 py-1.5 text-sm text-text hover:bg-surface-hover"
          >
            {groups.map((g) => (
              <optgroup key={g.title} label={g.title.replace("Tesouro ", "")}>
                {g.bonds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title.replace("Tesouro ", "")} {b.maturity.slice(0, 4)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <Segmented
            label="Período do histórico"
            value={periodId}
            onChange={setPeriodId}
            options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
          />
        </div>

        {!data ? (
          error ? (
            <p className="py-10 text-center text-sm text-muted">Dados indisponíveis no momento</p>
          ) : (
            <>
              <Skeleton className="h-60 w-full md:h-72" />
              <p className="text-xs text-muted">Carregando o histórico (a primeira consulta do dia lê o arquivo oficial inteiro e pode levar alguns segundos).</p>
            </>
          )
        ) : !data.ok || !view ? (
          <p className="py-10 text-center text-sm text-muted">
            {data.ok ? "Histórico insuficiente para este título." : `Dados indisponíveis no momento. ${data.error}`}
          </p>
        ) : (
          <>
            <p className="text-sm">
              A taxa de hoje, <strong className="font-semibold">{rateText(indexer, view.last.value)}</strong>, está{" "}
              {view.belowPct >= view.abovePct ? "acima" : "abaixo"} da taxa de{" "}
              <strong className="font-semibold">{pct(Math.max(view.belowPct, view.abovePct))}</strong> dos dias{" "}
              {periodLabel}
              {view.equalPct >= 1 && <> e igual em {pct(view.equalPct)} deles</>}.
              {view.belowPct >= 50
                ? " Para quem compra agora, a taxa está mais alta que o habitual no período."
                : view.abovePct >= 50
                  ? " Para quem compra agora, a taxa está mais baixa que o habitual no período."
                  : " Para quem compra agora, a taxa está perto do habitual no período."}
            </p>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Hoje", value: view.last.value, date: view.last.date },
                { label: "Média do período", value: view.mean, date: null },
                { label: "Mínima", value: view.min.value, date: view.min.date },
                { label: "Máxima", value: view.max.value, date: view.max.date },
              ].map((s) => (
                <div key={s.label} className="rounded-md border border-border p-3">
                  <div className="text-xs text-muted">{s.label}</div>
                  <div className="mt-1 text-base font-semibold tabular-nums">{rateText(indexer, s.value)}</div>
                  <div className="text-xs text-muted">{s.date ? `em ${formatDate(s.date)}` : `desde ${formatDate(view.first.date)}`}</div>
                </div>
              ))}
            </div>

            <SeriesChart series={series} />
            <p className="text-xs text-muted">
              Taxa de compra diária, como publicada pelo Tesouro Nacional. Histórico disponível desde{" "}
              {formatDate(view.since)}, quando o título começou a ser negociado.
            </p>
          </>
        )}
      </Card>
    </section>
  );
}
