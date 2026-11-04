"use client";

import { useMemo, useState } from "react";
import { newsSources, THEME_LABEL, type NewsTheme } from "@/config/news";
import { useNews } from "@/hooks/use-market-data";
import { formatUpdatedAt } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { FeaturedNews, NewsCard } from "@/components/news/news-cards";
import { Skeleton } from "@/components/ui/skeleton";
import type { NewsItem } from "@/lib/types";
import { Segmented } from "@/components/ui/segmented";

const PAGE = 24;
const THEMES: ("todos" | NewsTheme)[] = ["todos", "mercado", "economia", "empresas"];

const selectCls =
  "rounded-md border border-border-strong bg-surface px-2 py-1.5 text-xs text-text hover:bg-surface-hover";

export function NewsView() {
  const { data, error } = useNews();
  const [theme, setTheme] = useState<"todos" | NewsTheme>("todos");
  const [source, setSource] = useState("");
  const [shown, setShown] = useState(PAGE);

  const filtered = useMemo(
    () =>
      (data?.items ?? []).filter(
        (n) => (theme === "todos" || n.theme === theme) && (!source || n.sourceId === source),
      ),
    [data, theme, source],
  );
  const failed = data?.sources.filter((s) => !s.ok) ?? [];

  // Destaque: a mais relevante (assunto em mais veículos, mais recente) que tenha foto.
  const featured = useMemo(
    () =>
      filtered
        .filter((n) => n.image)
        .reduce<NewsItem | undefined>((best, n) => (!best || n.score > best.score ? n : best), undefined),
    [filtered],
  );
  const rest = useMemo(() => filtered.filter((n) => n !== featured), [filtered, featured]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Tema"
          value={theme}
          onChange={(t) => {
            setTheme(t);
            setShown(PAGE);
          }}
          options={THEMES.map((t) => ({ value: t, label: t === "todos" ? "Todos" : THEME_LABEL[t] }))}
        />
        <select
          aria-label="Veículo"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            setShown(PAGE);
          }}
          className={selectCls}
        >
          <option value="">Todos os veículos</option>
          {newsSources.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {data && (
          <span className="text-xs text-muted">
            {filtered.length} manchetes · atualização automática · consultado às {formatUpdatedAt(data.generatedAt)}
          </span>
        )}
      </div>

      {failed.length > 0 && (
        <p className="text-xs text-muted">
          Indisponível no momento: {failed.map((s) => s.name).join(", ")}.
        </p>
      )}

      {!data ? (
        error ? (
          <Card className="p-6 text-center text-sm text-muted">Dados indisponíveis no momento</Card>
        ) : (
          <div className="flex flex-col gap-4" aria-busy="true">
            <Skeleton className="aspect-[16/10] w-full rounded-card sm:aspect-[21/9]" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="aspect-[4/3] rounded-card" />
              ))}
            </div>
          </div>
        )
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted">Nenhuma manchete com esses filtros.</Card>
      ) : (
        <>
          {featured && <FeaturedNews item={featured} />}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, shown).map((n) => (
              <li key={n.link} className="flex">
                <NewsCard item={n} />
              </li>
            ))}
          </ul>
        </>
      )}

      {rest.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="w-full rounded-md border border-border py-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          Carregar mais ({rest.length - shown} restantes)
        </button>
      )}

      <p className="text-xs text-muted">
        Exibimos só a manchete, a foto fornecida no feed, o veículo e o horário. O texto completo fica no
        site de cada veículo. Destaque: o assunto publicado por mais veículos nas últimas horas.
      </p>
    </div>
  );
}
