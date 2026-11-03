"use client";

import Link from "next/link";
import { treasuryReference } from "@/config/watchlist";
import { useMacro, useTreasury } from "@/hooks/use-market-data";
import { formatDate, formatMacroDate, formatNumber } from "@/lib/format";
import type { MacroIndicator } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RateCard({
  label,
  value,
  unit,
  date,
  error,
  loading,
}: {
  label: string;
  value?: string;
  unit?: string;
  date?: string;
  error?: string;
  loading?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-1 p-3">
      <div className="text-xs text-muted">{label}</div>
      {loading ? (
        <>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-28" />
        </>
      ) : error ? (
        <p className="py-1 text-xs text-muted" title={error}>
          Dados indisponíveis no momento
        </p>
      ) : (
        <>
          <div className="text-lg font-semibold tabular-nums">
            {value}
            {unit && <span className="ml-1 text-xs font-normal text-muted">{unit}</span>}
          </div>
          <div className="text-xs text-muted">{date}</div>
        </>
      )}
    </Card>
  );
}

const MACRO_IDS: MacroIndicator["id"][] = ["selicMeta", "cdi", "ipca12m"];
const MACRO_LABELS: Record<string, string> = {
  selicMeta: "Selic meta",
  cdi: "CDI",
  ipca12m: "IPCA 12 meses",
};

export function FixedIncomeCards() {
  const macro = useMacro();
  const treasury = useTreasury();

  const bond =
    treasury.data?.ok === true
      ? treasury.data.bonds.find(
          (b) => b.title === treasuryReference.title && b.maturity === treasuryReference.maturity,
        )
      : undefined;
  const bondLabel = `${treasuryReference.title} ${treasuryReference.maturity.slice(0, 4)}`;

  return (
    <section aria-labelledby="renda-fixa-title">
      <SectionTitle
        aside={
          <Link href="/renda-fixa" className="hover:text-accent">
            Ver renda fixa
          </Link>
        }
      >
        <span id="renda-fixa-title">Renda fixa</span>
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {MACRO_IDS.map((id) => {
          const item = macro.data?.items.find((i) => i.id === id);
          if (!macro.data) {
            return (
              <RateCard
                key={id}
                label={MACRO_LABELS[id]}
                loading={!macro.error}
                error={macro.error ? "Falha ao buscar dados" : undefined}
              />
            );
          }
          if (!item || !item.ok) {
            return (
              <RateCard
                key={id}
                label={MACRO_LABELS[id]}
                error={item && !item.ok ? item.error : "Sem dados"}
              />
            );
          }
          const ind = item.indicator;
          return (
            <RateCard
              key={id}
              label={MACRO_LABELS[id]}
              value={`${formatNumber(ind.value)}%`}
              unit={ind.unit === "% a.a." ? "a.a." : undefined}
              date={formatMacroDate(ind.referenceDate, ind.dateKind)}
            />
          );
        })}

        {!treasury.data ? (
          <RateCard
            label={bondLabel}
            loading={!treasury.error}
            error={treasury.error ? "Falha ao buscar dados" : undefined}
          />
        ) : !treasury.data.ok ? (
          <RateCard label={bondLabel} error={treasury.data.error} />
        ) : !bond || bond.buyRate === null ? (
          <RateCard label={bondLabel} error="Título não encontrado na data-base mais recente." />
        ) : (
          <RateCard
            label={bondLabel}
            value={`IPCA + ${formatNumber(bond.buyRate)}%`}
            date={`taxa de compra · data-base ${formatDate(treasury.data.referenceDate)}`}
          />
        )}
      </div>
    </section>
  );
}
