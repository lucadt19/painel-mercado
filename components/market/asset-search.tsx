"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { worldStocks } from "@/config/watchlist";
import { useMarketList } from "@/hooks/use-market-data";
import { buildSearchIndex, searchAssets, type SearchItem } from "@/lib/asset-search";
import type { ListedAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TickerLogo } from "@/components/ticker-logo";

const KIND_LABEL: Record<ListedAsset["kind"], string> = {
  acao: "Ação",
  fii: "FII",
  etf: "ETF",
  bdr: "BDR",
  outro: "Fundo",
};

/**
 * Busca de ativos: B3 inteira (ações, FIIs, ETFs, BDRs) + empresas da aba Mundo.
 * Sem `onSelect`, escolher um resultado abre a página do ativo; com `onSelect`,
 * devolve o ativo escolhido (ex.: adicionar à watchlist).
 */
export function AssetSearch({
  autoFocus,
  onSelect,
  onNavigate,
  placeholder = "Buscar ticker ou nome (ex.: PETR4, Banco do Brasil)",
  onlyB3 = false,
}: {
  autoFocus?: boolean;
  onSelect?: (item: SearchItem) => void;
  /** Chamado ao abrir um ativo (ex.: fechar a busca do cabeçalho). */
  onNavigate?: () => void;
  placeholder?: string;
  /** Só ativos da B3 (a watchlist cota em reais). */
  onlyB3?: boolean;
}) {
  const { data } = useMarketList();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const listId = useId();

  const index = useMemo(() => {
    const bdrNames = Object.fromEntries(worldStocks.filter((w) => w.bdr).map((w) => [w.bdr!, w.name]));
    const b3 = (data?.ok ? data.assets : []).map((a) => ({
      symbol: a.symbol,
      name: a.name || bdrNames[a.symbol] || "",
      kind: KIND_LABEL[a.kind],
    }));
    const world = onlyB3 ? [] : worldStocks.map((w) => ({ symbol: w.symbol, name: w.name, kind: "EUA" }));
    return buildSearchIndex([...world, ...b3]);
  }, [data, onlyB3]);

  const hits = useMemo(() => searchAssets(index, query), [index, query]);

  const choose = (h: SearchItem) => {
    if (onSelect) {
      onSelect(h);
      setQuery("");
    } else {
      router.push(`/acoes/${encodeURIComponent(h.symbol)}`);
      onNavigate?.();
    }
  };

  const rowCls = (i: number) =>
    cn(
      "flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-surface-hover focus-visible:bg-surface-hover",
      i === 0 && "bg-surface-hover/50",
    );
  const rowContent = (h: SearchItem) => (
    <>
      <TickerLogo symbol={h.symbol} size={24} />
      <span className="w-20 shrink-0 font-medium">{h.symbol}</span>
      <span className="flex-1 truncate text-xs text-muted">{h.name}</span>
      <span className="shrink-0 rounded border border-border px-1.5 text-[0.7rem] text-muted">{h.kind}</span>
    </>
  );

  return (
    <div className="relative">
      <label htmlFor={`${listId}-input`} className="sr-only">
        Buscar ativo
      </label>
      <div className="flex items-center gap-2 rounded-card border border-border-strong bg-surface px-3 focus-within:border-accent">
        <Search aria-hidden className="size-4 text-muted" strokeWidth={1.75} />
        <input
          id={`${listId}-input`}
          type="search"
          autoComplete="off"
          // Só quando o usuário abriu a busca de propósito (botão do cabeçalho).
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) choose(hits[0]);
            if (e.key === "Escape") setQuery("");
          }}
          aria-controls={listId}
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted"
        />
      </div>

      {query.trim().length >= 2 && (
        <ul
          id={listId}
          aria-label="Resultados da busca"
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-card border border-border bg-surface"
        >
          {hits.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-muted">
              {!data
                ? "Carregando lista de ativos…"
                : !data.ok
                  ? "Lista de ativos da B3 indisponível no momento. Tente de novo em alguns minutos."
                  : "Nenhum ativo encontrado."}
            </li>
          ) : (
            hits.map((h, i) => (
              <li key={`${h.kind}-${h.symbol}`}>
                {onSelect ? (
                  <button type="button" onClick={() => choose(h)} className={rowCls(i)}>
                    {rowContent(h)}
                  </button>
                ) : (
                  <Link href={`/acoes/${encodeURIComponent(h.symbol)}`} onClick={onNavigate} className={rowCls(i)}>
                    {rowContent(h)}
                  </Link>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
