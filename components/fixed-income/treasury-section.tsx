"use client";

import { useMemo, useState } from "react";
import { useTreasury } from "@/hooks/use-market-data";
import { formatBRL, formatDate, formatNumber } from "@/lib/format";
import type { TreasuryBond } from "@/lib/types";
import { buildYieldCurves } from "@/lib/yield-curve";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartLegend, SeriesChart, type ChartSeries } from "@/components/charts/series-chart";
import { TreasuryHistorySection } from "@/components/fixed-income/treasury-history";
import { treasuryReference } from "@/config/watchlist";
import { bondId } from "@/lib/treasury-id";

/** Famílias principais, abertas por padrão, nesta ordem. */
const MAIN = [
  "Tesouro Selic",
  "Tesouro Prefixado",
  "Tesouro Prefixado com Juros Semestrais",
  "Tesouro IPCA+",
  "Tesouro IPCA+ com Juros Semestrais",
];

/** Como ler a taxa de cada indexador. */
function rateLabel(b: TreasuryBond, rate: number | null) {
  if (rate === null) return "—";
  const r = `${formatNumber(rate)}%`;
  if (b.indexer === "Selic") return `Selic + ${r}`;
  if (b.indexer === "IPCA") return `IPCA + ${r}`;
  if (b.indexer === "IGP-M") return `IGP-M + ${r}`;
  return `${r} a.a.`;
}

const th = "px-3 py-2 text-xs font-medium text-muted";
const td = "px-3 py-2";

function BondRows({ bonds, onSelect }: { bonds: TreasuryBond[]; onSelect: (id: string) => void }) {
  return (
    <>
      {bonds.map((b) => (
        <tr key={b.id} className="transition-colors hover:bg-surface-hover">
          <td className={td}>
            <button
              type="button"
              onClick={() => onSelect(b.id)}
              title="Ver o histórico das taxas deste título"
              className="text-left font-medium hover:text-accent hover:underline"
            >
              {b.title.replace("Tesouro ", "")} {b.maturity.slice(0, 4)}
            </button>
            <div className="text-xs text-muted md:hidden">venc. {formatDate(b.maturity)}</div>
          </td>
          <td className={cn(td, "hidden text-right tabular-nums md:table-cell")}>{formatDate(b.maturity)}</td>
          <td className={cn(td, "text-right tabular-nums whitespace-nowrap")}>{rateLabel(b, b.buyRate)}</td>
          <td className={cn(td, "hidden text-right tabular-nums md:table-cell")}>
            {b.buyPrice === null ? "—" : formatBRL(b.buyPrice)}
          </td>
          <td className={cn(td, "hidden text-right tabular-nums whitespace-nowrap lg:table-cell")}>
            {rateLabel(b, b.sellRate)}
          </td>
        </tr>
      ))}
    </>
  );
}

function TreasuryTable({
  bonds,
  referenceDate,
  onSelect,
}: {
  bonds: TreasuryBond[];
  referenceDate: string;
  onSelect: (id: string) => void;
}) {
  const [showOthers, setShowOthers] = useState(false);
  const byTitle = useMemo(() => {
    const m = new Map<string, TreasuryBond[]>();
    for (const b of bonds) m.set(b.title, [...(m.get(b.title) ?? []), b]);
    for (const list of m.values()) list.sort((a, b) => a.maturity.localeCompare(b.maturity));
    return m;
  }, [bonds]);
  const main = MAIN.filter((t) => byTitle.has(t));
  const others = [...byTitle.keys()].filter((t) => !MAIN.includes(t)).sort();
  const otherCount = others.reduce((n, t) => n + byTitle.get(t)!.length, 0);

  const group = (title: string) => (
    <tbody key={title} className="divide-y divide-border border-t border-border">
      <tr>
        <th colSpan={5} scope="colgroup" className="bg-surface-hover/50 px-3 py-1.5 text-left text-xs font-medium text-muted">
          {title}
        </th>
      </tr>
      <BondRows bonds={byTitle.get(title)!} onSelect={onSelect} />
    </tbody>
  );

  return (
    <section>
      <SectionTitle aside={`data-base ${formatDate(referenceDate)} · Tesouro Transparente`}>Tesouro Direto</SectionTitle>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={cn(th, "text-left")}>Título</th>
              <th className={cn(th, "hidden text-right md:table-cell")}>Vencimento</th>
              <th className={cn(th, "text-right")}>Taxa de compra</th>
              <th className={cn(th, "hidden text-right md:table-cell")}>Preço unitário</th>
              <th className={cn(th, "hidden text-right lg:table-cell")}>Taxa de resgate</th>
            </tr>
          </thead>
          {main.map(group)}
          {showOthers && others.map(group)}
        </table>
      </Card>
      {others.length > 0 && (
        <button
          type="button"
          aria-expanded={showOthers}
          onClick={() => setShowOthers((v) => !v)}
          className="mt-3 w-full rounded-md border border-border py-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          {showOthers
            ? "Esconder outros títulos"
            : `Mostrar outros títulos (${others.map((t) => t.replace("Tesouro ", "")).join(", ")}: ${otherCount} vencimentos)`}
        </button>
      )}
      <p className="mt-2 text-xs text-muted">
        Taxas e preços do fechamento do dia útil anterior, como publicados no arquivo oficial. O arquivo traz
        todos os títulos com preço no dia, inclusive alguns que não estão mais à venda (ex.: IGP-M+).
      </p>
    </section>
  );
}

function YieldCurve({ bonds, referenceDate }: { bonds: TreasuryBond[]; referenceDate: string }) {
  const series = useMemo<ChartSeries[]>(() => {
    const { nominal, real, implied } = buildYieldCurves(bonds);
    return [
      { id: "nominal", label: "Prefixada (nominal)", color: "accent", points: nominal },
      { id: "real", label: "IPCA+ (real)", color: "text", points: real },
      { id: "implied", label: "Inflação implícita", color: "muted", dashed: true, points: implied },
    ];
  }, [bonds]);

  return (
    <section>
      <SectionTitle aside={`data-base ${formatDate(referenceDate)}`}>Curva de juros</SectionTitle>
      <Card className="p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">Taxa por vencimento (% a.a.)</h3>
          <ChartLegend series={series} />
        </div>
        <SeriesChart series={series} />
      </Card>
      <p className="mt-2 text-xs text-muted">
        Curvas montadas com os títulos Prefixado e IPCA+ (com e sem juros semestrais). Inflação implícita =
        (1 + nominal) ÷ (1 + real) − 1, em cada vencimento prefixado, com a taxa real estimada entre os
        vencimentos de IPCA+ vizinhos.
      </p>
    </section>
  );
}

/** Título que abre no histórico: o mesmo de referência da Visão Geral. */
const DEFAULT_BOND = bondId(treasuryReference.title, treasuryReference.maturity);

export function TreasurySection() {
  const { data, error } = useTreasury();
  const [selectedId, setSelectedId] = useState(DEFAULT_BOND);

  // Clique num título da tabela: abre o histórico dele e rola até a seção.
  const showHistory = (id: string) => {
    setSelectedId(id);
    document.getElementById("historico-tesouro")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!data) {
    return error ? (
      <Card className="p-6 text-sm text-muted">Dados do Tesouro indisponíveis no momento.</Card>
    ) : (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (!data.ok) {
    return (
      <Card className="p-6 text-sm text-muted" title={data.error}>
        Dados do Tesouro indisponíveis no momento.
      </Card>
    );
  }
  return (
    <div className="flex flex-col gap-8">
      <TreasuryTable bonds={data.bonds} referenceDate={data.referenceDate} onSelect={showHistory} />
      <TreasuryHistorySection
        bonds={data.bonds}
        selectedId={data.bonds.some((b) => b.id === selectedId) ? selectedId : data.bonds[0].id}
        onSelect={setSelectedId}
      />
      <YieldCurve bonds={data.bonds} referenceDate={data.referenceDate} />
    </div>
  );
}
