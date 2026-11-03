"use client";

import { useState } from "react";
import { shortNames, trackedEtfs, worldStocks } from "@/config/watchlist";
import { useAutoRefresh } from "@/components/auto-refresh-provider";
import { useMarketList, useQuotes, useWorld } from "@/hooks/use-market-data";
import { cn } from "@/lib/utils";
import { AssetSearch } from "@/components/market/asset-search";
import { ListedTable } from "@/components/market/listed-table";
import { periodLabelFor, QuoteTable } from "@/components/market/quote-table";

type Tab = "brasil" | "mundo";

const worldNames = Object.fromEntries(worldStocks.map((w) => [w.symbol, w.name]));
const bdrNames = Object.fromEntries(worldStocks.filter((w) => w.bdr).map((w) => [w.bdr!, w.name]));

function BrasilTab() {
  const quotes = useQuotes();
  const list = useMarketList();
  const { delayMinutes } = useAutoRefresh();
  const periodLabel = periodLabelFor(quotes.data?.historyRange);

  return (
    <div className="flex flex-col gap-8">
      <QuoteTable
        title="ETFs acompanhados"
        aside={quotes.data ? `Variação no período: ${periodLabel}` : undefined}
        symbols={trackedEtfs}
        items={quotes.data?.etfs}
        names={shortNames}
        periodLabel={periodLabel}
        loading={!quotes.data && !quotes.error}
        failed={!quotes.data && !!quotes.error}
      />
      <ListedTable
        title="Todos os ativos da B3"
        assets={list.data?.ok ? list.data.assets : undefined}
        kinds={[
          { kind: "acao", label: "Ações" },
          { kind: "fii", label: "FIIs" },
          { kind: "etf", label: "ETFs" },
        ]}
        fetchedAt={list.data?.fetchedAt}
        delayMinutes={delayMinutes}
        loading={!list.data && !list.error}
        error={list.data && !list.data.ok ? list.data.error : list.error ? "Falha ao buscar a lista" : undefined}
      />
    </div>
  );
}

function MundoTab() {
  const world = useWorld();
  const list = useMarketList();
  const { delayMinutes } = useAutoRefresh();
  const periodLabel = periodLabelFor(world.data?.historyRange);

  return (
    <div className="flex flex-col gap-8">
      <QuoteTable
        title="Maiores empresas do mundo"
        aside="Em dólar, bolsa de Nova York · atualização de hora em hora"
        symbols={world.data?.items.map((i) => i.symbol) ?? worldStocks.slice(0, 8).map((w) => w.symbol)}
        items={world.data?.items}
        names={worldNames}
        periodLabel={periodLabel}
        loading={!world.data && !world.error}
        failed={!world.data && !!world.error}
      />
      {world.data && world.data.items.length < worldStocks.length && (
        <p className="-mt-5 text-xs text-muted">
          No plano Gratuito da brapi, {world.data.items.length} empresas têm cotação direta em dólar.
          As demais ({worldStocks
            .slice(world.data.items.length)
            .map((w) => w.name)
            .join(", ")}) aparecem na busca e nos BDRs abaixo.
        </p>
      )}
      <ListedTable
        title="BDRs na B3 (empresas estrangeiras, em reais)"
        assets={list.data?.ok ? list.data.assets : undefined}
        kinds={[{ kind: "bdr", label: "BDRs" }]}
        names={bdrNames}
        fetchedAt={list.data?.fetchedAt}
        delayMinutes={delayMinutes}
        loading={!list.data && !list.error}
        error={list.data && !list.data.ok ? list.data.error : list.error ? "Falha ao buscar a lista" : undefined}
      />
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "brasil", label: "Brasil" },
  { id: "mundo", label: "Mundo" },
];

export function AcoesView() {
  const [tab, setTab] = useState<Tab>("brasil");

  return (
    <div className="flex flex-col gap-6">
      <AssetSearch />

      <div role="tablist" aria-label="Mercado" className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`painel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              tab === t.id
                ? "border-accent font-medium text-text"
                : "border-transparent text-muted hover:text-text",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div id={`painel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "brasil" ? <BrasilTab /> : <MundoTab />}
      </div>
    </div>
  );
}
