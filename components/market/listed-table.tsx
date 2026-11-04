"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { formatBRL, formatCompact, formatUpdatedAt } from "@/lib/format";
import type { ListedAsset } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Change } from "@/components/change";
import { Segmented } from "@/components/ui/segmented";
import { TickerLogo } from "@/components/ticker-logo";
import { EarningsBadge } from "@/components/earnings-badge";

type SortKey = "marketCap" | "volume" | "up" | "down";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "marketCap", label: "Maior valor de mercado" },
  { key: "volume", label: "Maior volume" },
  { key: "up", label: "Maiores altas do dia" },
  { key: "down", label: "Maiores quedas do dia" },
];

const PAGE = 50;
const th = "px-3 py-2 text-xs font-medium text-muted";
const td = "px-3 py-2";

function sortAssets(list: ListedAsset[], key: SortKey) {
  const val = (a: ListedAsset) =>
    key === "marketCap" ? a.marketCap : key === "volume" ? a.volume : a.changePercent;
  const dir = key === "down" ? 1 : -1;
  return [...list].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    if (va === null) return 1; // sem dado vai para o fim
    if (vb === null) return -1;
    return (va - vb) * dir;
  });
}

const selectCls =
  "rounded-md border border-border-strong bg-surface px-2 py-1.5 text-xs text-text hover:bg-surface-hover";

/**
 * Tabela da lista completa da B3 (aba Brasil e BDRs): filtro por tipo e
 * setor, ordenação e "mostrar mais". A fonte não informa o horário de cada
 * cotação, então mostramos a hora da consulta.
 */
export function ListedTable({
  title,
  assets,
  kinds,
  names = {},
  fetchedAt,
  delayMinutes,
  loading,
  error,
}: {
  title: ReactNode;
  assets: ListedAsset[] | undefined;
  /** Tipos que esta tabela mostra; com mais de um, aparece o filtro de tipo. */
  kinds: { kind: ListedAsset["kind"]; label: string }[];
  names?: Record<string, string>;
  fetchedAt?: string;
  delayMinutes: number;
  loading: boolean;
  error?: string;
}) {
  const [kind, setKind] = useState(kinds[0].kind);
  const [sector, setSector] = useState("");
  const [sort, setSort] = useState<SortKey>("marketCap");
  const [shown, setShown] = useState(PAGE);

  const ofKind = useMemo(() => (assets ?? []).filter((a) => a.kind === kind), [assets, kind]);
  const sectors = useMemo(
    () => [...new Set(ofKind.map((a) => a.sector).filter((s): s is string => !!s))].sort(),
    [ofKind],
  );
  const rows = useMemo(
    () => sortAssets(sector ? ofKind.filter((a) => a.sector === sector) : ofKind, sort),
    [ofKind, sector, sort],
  );

  const resetPaging = () => setShown(PAGE);

  return (
    <section>
      <SectionTitle
        aside={
          fetchedAt ? (
            <span title="A lista da brapi não informa o horário de cada cotação; mostramos a hora da consulta. A página de cada ativo traz o horário exato.">
              consultado às {formatUpdatedAt(fetchedAt)} · atraso ~{delayMinutes} min
            </span>
          ) : undefined
        }
      >
        {title}
      </SectionTitle>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {kinds.length > 1 && (
          <Segmented
            label="Tipo de ativo"
            value={kind}
            onChange={(k) => {
              setKind(k);
              setSector("");
              resetPaging();
            }}
            options={kinds.map((k) => ({ value: k.kind, label: k.label }))}
          />
        )}
        {sectors.length > 1 && (
          <select
            aria-label="Setor"
            value={sector}
            onChange={(e) => {
              setSector(e.target.value);
              resetPaging();
            }}
            className={selectCls}
          >
            <option value="">Todos os setores</option>
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}
        <select
          aria-label="Ordenar por"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            resetPaging();
          }}
          className={selectCls}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        {assets && <span className="text-xs text-muted">{rows.length} ativos</span>}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className={cn(th, "text-left")}>Ativo</th>
              <th className={cn(th, "text-right")}>Preço</th>
              <th className={cn(th, "text-right")}>Dia</th>
              <th className={cn(th, "hidden text-right md:table-cell")}>Volume</th>
              <th className={cn(th, "hidden text-right md:table-cell")}>Valor de mercado</th>
              <th className={cn(th, "hidden text-left lg:table-cell")}>Setor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {!assets ? (
              error ? (
                <tr>
                  <td colSpan={6} className={cn(td, "py-6 text-center text-xs text-muted")} title={error}>
                    Dados indisponíveis no momento
                  </td>
                </tr>
              ) : loading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={i}>
                    <td className={td}><Skeleton className="h-4 w-24" /></td>
                    <td className={td}><Skeleton className="ml-auto h-4 w-16" /></td>
                    <td className={td}><Skeleton className="ml-auto h-4 w-12" /></td>
                    <td className={cn(td, "hidden md:table-cell")}><Skeleton className="ml-auto h-4 w-12" /></td>
                    <td className={cn(td, "hidden md:table-cell")}><Skeleton className="ml-auto h-4 w-14" /></td>
                    <td className={cn(td, "hidden lg:table-cell")}><Skeleton className="h-4 w-28" /></td>
                  </tr>
                ))
              ) : null
            ) : (
              rows.slice(0, shown).map((a) => (
                <tr key={a.symbol} className="transition-colors hover:bg-surface-hover">
                  <td className={td}>
                    <div className="flex items-center gap-2.5">
                      <TickerLogo symbol={a.symbol} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <Link href={`/acoes/${encodeURIComponent(a.symbol)}`} className="font-medium hover:text-accent">
                            {a.symbol}
                          </Link>
                          <EarningsBadge symbol={a.symbol} />
                        </div>
                        <div className="max-w-[14rem] truncate text-xs text-muted">{names[a.symbol] ?? a.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className={cn(td, "text-right tabular-nums whitespace-nowrap")}>
                    {a.price === null ? "—" : formatBRL(a.price)}
                  </td>
                  <td className={cn(td, "text-right")}>
                    <Change value={a.changePercent} />
                  </td>
                  <td className={cn(td, "hidden text-right tabular-nums md:table-cell")}>
                    {a.volume === null ? "—" : formatCompact(a.volume)}
                  </td>
                  <td className={cn(td, "hidden text-right tabular-nums md:table-cell")}>
                    {a.marketCap === null ? "—" : `R$ ${formatCompact(a.marketCap)}`}
                  </td>
                  <td className={cn(td, "hidden max-w-[12rem] truncate text-xs text-muted lg:table-cell")}>
                    {a.sector ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {assets && rows.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="mt-3 w-full rounded-md border border-border py-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          Mostrar mais {Math.min(PAGE, rows.length - shown)} de {rows.length - shown} restantes
        </button>
      )}
    </section>
  );
}
