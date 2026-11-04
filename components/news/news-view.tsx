"use client";

import { useMemo, useState } from "react";
import { newsSources, THEME_LABEL, type NewsTheme } from "@/config/news";
import { useNews } from "@/hooks/use-market-data";
import { formatUpdatedAt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { NewsList } from "@/components/news/news-list";

const PAGE = 30;
const THEMES: ("todos" | NewsTheme)[] = ["todos", "mercado", "economia", "empresas"];

const selectCls =
  "rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-text hover:bg-surface-hover";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Tema" className="flex rounded-md border border-border p-0.5">
          {THEMES.map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => {
                setTheme(t);
                setShown(PAGE);
              }}
              className={cn(
                "rounded px-2.5 py-1 text-xs transition-colors",
                theme === t ? "bg-accent-soft font-medium text-accent" : "text-muted hover:text-text",
              )}
            >
              {t === "todos" ? "Todos" : THEME_LABEL[t]}
            </button>
          ))}
        </div>
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

      <Card className="overflow-hidden">
        {!data && error ? (
          <p className="p-6 text-center text-sm text-muted">Dados indisponíveis no momento</p>
        ) : data && filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">Nenhuma manchete com esses filtros.</p>
        ) : (
          <NewsList items={data ? filtered.slice(0, shown) : undefined} loading={!error} showTheme={theme === "todos"} />
        )}
      </Card>

      {filtered.length > shown && (
        <button
          type="button"
          onClick={() => setShown((n) => n + PAGE)}
          className="w-full rounded-md border border-border py-2 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-text"
        >
          Carregar mais ({filtered.length - shown} restantes)
        </button>
      )}

      <p className="text-xs text-muted">
        Só exibimos título, veículo e horário. O texto completo fica no site de cada veículo.
      </p>
    </div>
  );
}
