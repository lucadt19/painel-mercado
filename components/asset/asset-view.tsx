"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { shortNames, worldStocks } from "@/config/watchlist";
import { useAsset, useMarketList } from "@/hooks/use-market-data";
import { formatBRL, formatCompact, formatDate, formatMoney, formatNumber } from "@/lib/format";
import type { AssetResponse, DividendPayment, Fundamentals, Quote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@/components/change";
import { UpdatedAt } from "@/components/updated-at";
import { PriceChart } from "@/components/asset/price-chart";
import { Segmented } from "@/components/ui/segmented";
import { EarningsBadge } from "@/components/earnings-badge";
import { TickerLogo } from "@/components/ticker-logo";

// ---------- Períodos do gráfico ----------

type Period = { id: string; label: string; days?: number; months?: number; years?: number };

const PERIODS: Period[] = [
  { id: "1D", label: "1D" },
  { id: "5D", label: "5D", days: 5 },
  { id: "1M", label: "1M", months: 1 },
  { id: "3M", label: "3M", months: 3 },
  { id: "6M", label: "6M", months: 6 },
  { id: "1A", label: "1A", years: 1 },
  { id: "5A", label: "5A", years: 5 },
];

/** Dias corridos que o histórico entregue cobre, por período pedido à brapi. */
const RANGE_DAYS: Record<string, number> = { "3mo": 92, "1y": 366, "5y": 1830 };

function cutoffDay(lastDay: string, p: Period): string {
  const d = new Date(`${lastDay}T12:00:00Z`);
  if (p.months) d.setUTCMonth(d.getUTCMonth() - p.months);
  if (p.years) d.setUTCFullYear(d.getUTCFullYear() - p.years);
  return d.toISOString().slice(0, 10);
}

const spDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));

/** Pontos do período, terminando no preço atual. */
function pointsFor(quote: Quote, p: Period) {
  const today = spDay(quote.updatedAt);
  const all = [...quote.history.filter((h) => h.date < today), { date: today, close: quote.price }];
  if (p.days) return all.slice(-p.days);
  const cut = cutoffDay(today, p);
  return all.filter((h) => h.date >= cut);
}

// ---------- Blocos da página ----------

function Indicators({
  f,
  currency,
  covered,
}: {
  f: Fundamentals;
  currency: string;
  covered: boolean;
}) {
  const pctOrDash = (v: number | null) => (v === null ? "—" : `${formatNumber(v)}%`);
  const items: { label: string; value: string; hint: string }[] = [
    { label: "P/L", value: f.priceEarnings === null ? "—" : formatNumber(f.priceEarnings), hint: "Preço / lucro por ação" },
    { label: "P/VP", value: f.priceToBook === null ? "—" : formatNumber(f.priceToBook), hint: "Preço / valor patrimonial por ação" },
    { label: "Dividend yield", value: pctOrDash(f.dividendYield), hint: "Proventos dos últimos 12 meses / preço" },
    {
      label: "Valor de mercado",
      value: f.marketCap === null ? "—" : `${currency === "USD" ? "US$" : "R$"} ${formatCompact(f.marketCap)}`,
      hint: "Preço × total de ações",
    },
    { label: "Margem líquida", value: pctOrDash(f.netMargin), hint: "Lucro líquido / receita" },
    { label: "ROE", value: pctOrDash(f.roe), hint: "Lucro líquido / patrimônio líquido" },
  ];
  return (
    <section>
      <SectionTitle aside={f.balanceDate ? `balanço de ${formatDate(f.balanceDate)} · brapi` : "fonte: brapi"}>
        Indicadores
      </SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((it) => (
          <Card key={it.label} className="p-3" title={it.hint}>
            <div className="text-xs text-muted">{it.label}</div>
            <div className="mt-1 text-lg font-semibold tabular-nums">{it.value}</div>
          </Card>
        ))}
      </div>
      {!covered ? (
        <p className="mt-2 text-xs text-muted">
          P/VP, dividend yield, margem líquida e ROE exigem o plano Pro da brapi. No plano atual
          aparecem só P/L (quando a fonte informa) e valor de mercado.
        </p>
      ) : (
        Object.values(f).every((v) => v === null) && (
          <p className="mt-2 text-xs text-muted">
            A fonte não traz indicadores para este ativo (comum em ETFs, FIIs e ações estrangeiras).
          </p>
        )
      )}
    </section>
  );
}

function Dividends({
  items,
  currency,
  covered,
}: {
  items: DividendPayment[];
  currency: string;
  covered: boolean;
}) {
  const total = items.reduce((s, d) => s + d.rate, 0);
  const today = new Date().toISOString().slice(0, 10);
  const th = "px-3 py-2 text-xs font-medium text-muted";
  const td = "px-3 py-2";

  return (
    <section>
      <SectionTitle aside={items.length ? `total: ${formatMoney(total, currency)} por ação` : undefined}>
        Proventos dos últimos 12 meses
      </SectionTitle>
      {!covered ? (
        <Card className="p-4 text-sm text-muted">
          Dividendos e JCP exigem o plano Startup da brapi (ou superior). Com o plano atual, este
          histórico não está disponível.
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-4 text-sm text-muted">
          Nenhum dividendo ou JCP com data com nos últimos 12 meses, segundo a fonte.
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className={cn(th, "text-left")}>Tipo</th>
                <th className={cn(th, "text-right")}>Data com</th>
                <th className={cn(th, "text-right")}>Pagamento</th>
                <th className={cn(th, "text-right")}>Valor por ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((d, i) => (
                <tr key={`${d.exDate}-${d.label}-${i}`} className="hover:bg-surface-hover">
                  <td className={td}>{d.label}</td>
                  <td className={cn(td, "text-right tabular-nums")}>{d.exDate ? formatDate(d.exDate) : "—"}</td>
                  <td className={cn(td, "text-right tabular-nums")}>
                    {d.paymentDate ? formatDate(d.paymentDate) : "a definir"}
                    {d.paymentDate && d.paymentDate > today && (
                      <span className="ml-1.5 text-xs text-accent">a pagar</span>
                    )}
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>
                    {currency === "USD" ? formatMoney(d.rate, currency) : formatBRL(d.rate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </section>
  );
}

export function AssetSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full md:h-80" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link href="/acoes" className="inline-flex items-center gap-1 text-xs text-muted hover:text-accent">
      <ArrowLeft aria-hidden className="size-3.5" /> Ações & ETFs
    </Link>
  );
}

const KIND_LABEL = { acao: "Ação", fii: "FII", etf: "ETF", bdr: "BDR", outro: "Fundo" } as const;

// ---------- Página ----------

export function AssetView({ ticker }: { ticker: string }) {
  const { data, error } = useAsset(ticker);
  const list = useMarketList();
  const [periodId, setPeriodId] = useState("3M");

  const world = worldStocks.find((w) => w.symbol === ticker);
  const listed = list.data?.ok ? list.data.assets.find((a) => a.symbol === ticker) : undefined;
  const kindLabel = world ? "Ação · EUA" : listed ? KIND_LABEL[listed.kind] : undefined;

  const ok = data?.ok ? (data as Extract<AssetResponse, { ok: true }>) : undefined;
  const period = PERIODS.find((p) => p.id === periodId)!;
  const points = useMemo(() => (ok ? pointsFor(ok.quote, period) : []), [ok, period]);
  const periodChange =
    points.length >= 2 ? (points[points.length - 1].close / points[0].close - 1) * 100 : null;

  if (!data) {
    if (error) {
      return (
        <div className="flex flex-col gap-4">
          <BackLink />
          <Card className="p-6 text-sm text-muted">Dados indisponíveis no momento.</Card>
        </div>
      );
    }
    return <AssetSkeleton />;
  }

  if (!ok) {
    const notFound = !data.ok && /não encontrado|inválido/i.test(data.error);
    return (
      <div className="flex flex-col gap-4">
        <BackLink />
        <h1 className="text-xl font-semibold">{ticker}</h1>
        <Card className="p-6 text-sm text-muted">
          {notFound
            ? "Ativo não encontrado. Confira o ticker ou use a busca em Ações & ETFs."
            : `Dados indisponíveis no momento. ${!data.ok ? data.error : ""}`}
        </Card>
      </div>
    );
  }

  const q = ok.quote;
  const name = world?.name ?? shortNames[ticker] ?? (listed?.name || q.name);
  // Com a B3, vale o período que o histórico de fato cobre (ativos novos têm menos de 5 anos).
  const hist = q.history;
  const availableDays = ok.b3
    ? (Date.parse(hist[hist.length - 1].date) - Date.parse(hist[0].date)) / 86_400_000 + 10
    : (RANGE_DAYS[ok.historyRange] ?? 0);
  const periodDays = (p: Period) => (p.days ?? 0) + (p.months ?? 0) * 30 + (p.years ?? 0) * 365;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <BackLink />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <TickerLogo symbol={ticker} size={36} />
          <h1 className="text-xl font-semibold tracking-tight">{ticker}</h1>
          <EarningsBadge symbol={ticker} />
          <span className="text-sm text-muted">{name}</span>
          {kindLabel && (
            <span className="rounded border border-border px-1.5 text-xs text-muted">{kindLabel}</span>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xl font-semibold tabular-nums">{formatMoney(q.price, q.currency)}</span>
          <Change value={q.changePercent} className="text-sm" />
          <span className="text-xs text-muted">no dia ·</span>
          <UpdatedAt iso={q.updatedAt} prefix="cotação de" />
        </div>
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            label="Período do gráfico"
            value={periodId}
            onChange={setPeriodId}
            options={PERIODS.map((p) => {
              const intraday = p.id === "1D";
              const tooLong = !intraday && periodDays(p) > availableDays;
              return {
                value: p.id,
                label: p.label,
                disabled: intraday || tooLong,
                title: intraday
                  ? "Gráfico intradiário requer o plano Startup da brapi"
                  : tooLong
                    ? ok.b3
                      ? `Histórico disponível desde ${formatDate(hist[0].date)}`
                      : "Período não disponível no plano atual da brapi (Startup: 1 ano; Pro: 5 anos ou mais)"
                    : undefined,
              };
            })}
          />
          <div className="text-xs text-muted">
            Variação em {period.label}: <Change value={periodChange} />
          </div>
        </div>
        <Card className="p-2">
          <PriceChart
            points={points}
            currency={q.currency}
            description={
              points.length >= 2
                ? `Preço de ${ticker} em ${period.label}: de ${formatMoney(points[0].close, q.currency)} em ${formatDate(points[0].date)} a ${formatMoney(points[points.length - 1].close, q.currency)} em ${formatDate(points[points.length - 1].date)}`
                : `Preço de ${ticker}: sem dados suficientes para o gráfico`
            }
          />
        </Card>
        {ok.b3 ? (
          <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted">
            <p>
              Fechamentos diários · até {formatDate(ok.b3.until)}: B3 (Séries Históricas, arquivo oficial); depois:
              brapi. Preços não ajustados por dividendos.
            </p>
            {ok.b3.adjustments.length > 0 && (
              <p>
                Ajustado por {ok.b3.adjustments.map((a) => `${a.fator} em ${formatDate(a.data)}`).join(", ")} (detectado
                pelo salto de preço; estimativa).
              </p>
            )}
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">Fechamentos diários · fonte: brapi</p>
        )}
      </section>

      <Indicators f={ok.fundamentals} currency={q.currency} covered={ok.coverage.fundamentals} />
      <Dividends items={ok.dividends} currency={q.currency} covered={ok.coverage.dividends} />
    </div>
  );
}
