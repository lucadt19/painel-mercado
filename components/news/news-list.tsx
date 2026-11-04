"use client";

import { formatUpdatedAt } from "@/lib/format";
import { THEME_LABEL } from "@/config/news";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lista de manchetes: só título (link para a matéria original), veículo,
 * horário e tema. Não reproduzimos o texto das matérias.
 */
export function NewsList({
  items,
  loading,
  showTheme = true,
  className,
}: {
  items: NewsItem[] | undefined;
  loading: boolean;
  showTheme?: boolean;
  className?: string;
}) {
  if (!items) {
    return loading ? (
      <ul className={cn("divide-y divide-border", className)} aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i} className="flex flex-col gap-1.5 px-4 py-3">
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-3 w-32" />
          </li>
        ))}
      </ul>
    ) : null;
  }

  return (
    <ul className={cn("divide-y divide-border", className)}>
      {items.map((n) => (
        <li key={n.link}>
          <a
            href={n.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-surface-hover"
          >
            <span className="text-sm leading-snug group-hover:text-accent">{n.title}</span>
            <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
              <span className="font-medium">{n.sourceName}</span>
              <span aria-hidden>·</span>
              <time dateTime={n.publishedAt} className="tabular-nums">
                {formatUpdatedAt(n.publishedAt)}
              </time>
              {showTheme && (
                <>
                  <span aria-hidden>·</span>
                  <span>{THEME_LABEL[n.theme]}</span>
                </>
              )}
              <span className="sr-only">(abre o site do veículo em nova aba)</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
