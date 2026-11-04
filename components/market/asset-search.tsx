"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { worldStocks } from "@/config/watchlist";
import { useMarketList } from "@/hooks/use-market-data";
import type { ListedAsset } from "@/lib/types";
import { cn } from "@/lib/utils";

type Hit = { symbol: string; name: string; kind: string };

const KIND_LABEL: Record<ListedAsset["kind"], string> = {
  acao: "Ação",
  fii: "FII",
  etf: "ETF",
  bdr: "BDR",
  outro: "Fundo",
};

/** Sem acentos e em minúsculas, para "itau" achar "Itaú". */
const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Busca de ativos: B3 inteira (ações, FIIs, ETFs, BDRs) + empresas da aba Mundo. */
export function AssetSearch() {
  const { data } = useMarketList();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const listId = useId();

  const index = useMemo<Hit[]>(() => {
    const bdrNames = Object.fromEntries(worldStocks.filter((w) => w.bdr).map((w) => [w.bdr!, w.name]));
    const b3 = (data?.ok ? data.assets : []).map((a) => ({
      symbol: a.symbol,
      name: a.name || bdrNames[a.symbol] || "",
      kind: KIND_LABEL[a.kind],
    }));
    const world = worldStocks.map((w) => ({ symbol: w.symbol, name: w.name, kind: "EUA" }));
    return [...world, ...b3];
  }, [data]);

  const hits = useMemo(() => {
    const q = norm(query.trim());
    if (q.length < 2) return [];
    const starts: Hit[] = [];
    const contains: Hit[] = [];
    for (const h of index) {
      const sym = norm(h.symbol);
      if (sym.startsWith(q)) starts.push(h);
      else if (norm(h.name).includes(q) || sym.includes(q)) contains.push(h);
      if (starts.length >= 8) break;
    }
    return [...starts, ...contains].slice(0, 8);
  }, [index, query]);

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
          placeholder="Buscar ticker ou nome (ex.: PETR4, Itaú)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) router.push(`/acoes/${encodeURIComponent(hits[0].symbol)}`);
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
              {data ? "Nenhum ativo encontrado." : "Carregando lista de ativos…"}
            </li>
          ) : (
            hits.map((h, i) => (
              <li key={`${h.kind}-${h.symbol}`}>
                <Link
                  href={`/acoes/${encodeURIComponent(h.symbol)}`}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm hover:bg-surface-hover focus-visible:bg-surface-hover",
                    i === 0 && "bg-surface-hover/50",
                  )}
                >
                  <span className="w-20 shrink-0 font-medium">{h.symbol}</span>
                  <span className="flex-1 truncate text-xs text-muted">{h.name}</span>
                  <span className="shrink-0 rounded border border-border px-1.5 text-[0.7rem] text-muted">
                    {h.kind}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
