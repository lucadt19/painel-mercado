"use client";

import { useState } from "react";
import { newsSources, PAYWALL_LABEL, THEME_LABEL } from "@/config/news";
import { Lock } from "lucide-react";
import { formatUpdatedAt } from "@/lib/format";
import type { NewsItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Foto da matéria, como fornecida no feed do veículo (fica hospedada no site
 * dele; não guardamos cópia). Sem foto, ou se ela não carregar: com
 * `fallback="block"`, um bloco neutro com o nome do veículo; com "none",
 * nada (o texto ocupa o espaço). Folha e Money Times não mandam foto no feed.
 */
export function NewsImage({
  item,
  className,
  fallback = "block",
  onMissing,
}: {
  item: NewsItem;
  className?: string;
  fallback?: "block" | "none";
  /** Avisa quando a foto não existe ou não carregou. */
  onMissing?: () => void;
}) {
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const src = item.image && failedFor !== item.image ? item.image : null;

  if (!src) {
    if (fallback === "none") return null;
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
      onError={() => {
        setFailedFor(src);
        onMissing?.();
      }}
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

/** "grátis" ou "assinante" ao lado do veículo (detalhe ao passar o mouse). */
export function PaywallTag({ item, onImage }: { item: Pick<NewsItem, "paywall" | "sourceId">; onImage?: boolean }) {
  const note = newsSources.find((s) => s.id === item.sourceId)?.paywallNote;
  const paid = item.paywall === "assinante";
  return (
    <span
      title={note ?? (paid ? "Exige assinatura." : "Matéria aberta.")}
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1 text-[0.65rem] leading-4",
        onImage ? "border-on-image/40 text-on-image" : "border-border text-muted",
      )}
    >
      {paid && <Lock aria-hidden className="size-2.5" />}
      {PAYWALL_LABEL[item.paywall]}
    </span>
  );
}

/** "também em Valor (assinante)": a mesma notícia em veículos pagos, escondida da lista. */
export function AlsoIn({ item, onImage }: { item: NewsItem; onImage?: boolean }) {
  if (!item.alsoIn?.length) return null;
  return (
    <span className={cn("text-xs", onImage ? "text-on-image" : "text-muted")}>
      também em{" "}
      {item.alsoIn.map((a, i) => (
        <span key={a.link}>
          {i > 0 && ", "}
          {/* O card inteiro já é um link: este abre a versão paga sem abrir o card. */}
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(a.link, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                window.open(a.link, "_blank", "noopener,noreferrer");
              }
            }}
            className="cursor-pointer underline decoration-dotted underline-offset-2 hover:text-accent"
          >
            {a.sourceName} ({PAYWALL_LABEL[a.paywall]})
          </span>
        </span>
      ))}
    </span>
  );
}

function Meta({ item, onImage }: { item: NewsItem; onImage?: boolean }) {
  return (
    <span className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 text-xs", onImage ? "text-on-image" : "text-muted")}>
      <span className="font-medium">{item.sourceName}</span>
      <PaywallTag item={item} onImage={onImage} />
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
        <AlsoIn item={item} onImage />
      </div>
    </a>
  );
}

/**
 * Card menor: foto em cima, manchete e veículo embaixo. Sem foto (o feed não
 * manda, ou ela não carregou), vira um card só de texto, com a manchete maior,
 * em vez de um bloco vazio.
 */
export function NewsCard({ item }: { item: NewsItem }) {
  const [failedFor, setFailedFor] = useState<string | null>(null);
  const hasImage = !!item.image && failedFor !== item.image;
  return (
    <a
      href={item.link}
      {...linkProps}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:bg-surface-hover"
    >
      {hasImage && (
        <NewsImage item={item} className="aspect-video w-full" onMissing={() => setFailedFor(item.image)} />
      )}
      <div className={cn("flex flex-1 flex-col gap-2", hasImage ? "p-3" : "p-4")}>
        <ThemePill item={item} />
        <h3
          className={cn(
            "leading-snug font-medium group-hover:text-accent",
            hasImage ? "line-clamp-3 text-sm" : "line-clamp-5 text-base",
          )}
        >
          {item.title}
        </h3>
        <div className="mt-auto flex flex-col gap-1">
          <Meta item={item} />
          <AlsoIn item={item} />
        </div>
      </div>
    </a>
  );
}
