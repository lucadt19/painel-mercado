"use client";

import { useState } from "react";
import { THEME_LABEL } from "@/config/news";
import { formatUpdatedAt } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Foto da matéria, como fornecida no feed do veículo (fica hospedada no site
 * dele; não guardamos cópia). Sem foto, ou se ela não carregar, mostra um
 * bloco neutro com o nome do veículo.
 */
export function NewsImage({ item, className }: { item: NewsItem; className?: string }) {
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const src = item.image && failedFor !== item.image ? item.image : null;

  if (!src) {
    return (
      <div
        aria-hidden
        className={cn("flex items-center justify-center bg-surface-hover text-xs font-medium text-muted", className)}
      >
        {item.sourceName}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- foto externa, já redimensionada pelo veículo
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailedFor(src)}
      className={cn("object-cover", className)}
    />
  );
}

function ThemePill({ item, onImage }: { item: NewsItem; onImage?: boolean }) {
  return (
    <span
      className={cn(
        "inline-block self-start rounded-full px-2 py-0.5 text-[0.7rem] font-medium uppercase tracking-wide",
        onImage ? "bg-scrim text-on-image" : "bg-surface-hover text-muted",
      )}
    >
      {THEME_LABEL[item.theme]}
    </span>
  );
}

function Meta({ item, onImage }: { item: NewsItem; onImage?: boolean }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-2 text-xs", onImage ? "text-on-image" : "text-muted")}>
      <span className="font-medium">{item.sourceName}</span>
      <span aria-hidden>·</span>
      <time dateTime={item.publishedAt} className="tabular-nums">
        {formatUpdatedAt(item.publishedAt)}
      </time>
      <span className="sr-only">(abre o site do veículo em nova aba)</span>
    </span>
  );
}

const linkProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Notícia de destaque: foto grande com a manchete por cima. */
export function FeaturedNews({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      {...linkProps}
      className="group relative block overflow-hidden rounded-card border border-border"
    >
      <NewsImage item={item} className="aspect-[16/10] w-full sm:aspect-[21/9]" />
      {/* Película escura só na base, para a manchete ficar legível sobre qualquer foto. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-scrim via-scrim/70 to-transparent p-4 pt-16 sm:p-6 sm:pt-24">
        <div className="flex flex-wrap items-center gap-2">
          <ThemePill item={item} onImage />
          {item.coverage > 1 && (
            <span className="text-xs text-on-image">Destaque: assunto em {item.coverage} veículos</span>
          )}
        </div>
        <h2 className="text-lg leading-snug font-semibold text-on-image group-hover:underline sm:text-xl">
          {item.title}
        </h2>
        <Meta item={item} onImage />
      </div>
    </a>
  );
}

/** Card menor: foto em cima, manchete e veículo embaixo. */
export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      {...linkProps}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:bg-surface-hover"
    >
      <NewsImage item={item} className="aspect-video w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <ThemePill item={item} />
        <h3 className="line-clamp-3 text-sm leading-snug font-medium group-hover:text-accent">{item.title}</h3>
        <div className="mt-auto">
          <Meta item={item} />
        </div>
      </div>
    </a>
  );
}
