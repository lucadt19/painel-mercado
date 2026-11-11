"use client";

import { useState } from "react";
import { formatCompact, formatUpdatedAt } from "@/lib/format";
import type { VideoItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const linkProps = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Miniatura do YouTube (hospedada por ele); se não carregar, bloco neutro com o canal. */
function Thumb({ item, className }: { item: VideoItem; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div aria-hidden className={cn("flex items-center justify-center bg-surface-hover text-xs text-muted", className)}>
        {item.channelName}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- miniatura externa do YouTube
    <img
      src={item.thumbnail}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}

export function VideoMeta({ item }: { item: VideoItem }) {
  return (
    <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
      <span className="font-medium">{item.channelName}</span>
      <span aria-hidden>·</span>
      <time dateTime={item.publishedAt} className="tabular-nums">
        {formatUpdatedAt(item.publishedAt)}
      </time>
      {item.views > 0 && (
        <>
          <span aria-hidden>·</span>
          <span className="tabular-nums">{formatCompact(item.views)} visualizações</span>
        </>
      )}
      <span className="sr-only">(abre o YouTube em nova aba)</span>
    </span>
  );
}

/** Card com miniatura em cima, título e canal embaixo. */
export function VideoCard({ item }: { item: VideoItem }) {
  return (
    <a
      href={item.link}
      {...linkProps}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-colors hover:bg-surface-hover"
    >
      <Thumb item={item} className="aspect-video w-full" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-3 text-sm leading-snug font-medium group-hover:text-accent">{item.title}</h3>
        <div className="mt-auto">
          <VideoMeta item={item} />
        </div>
      </div>
    </a>
  );
}

/** Linha compacta: miniatura pequena ao lado do título (listas e Visão Geral). */
export function VideoRow({ item }: { item: VideoItem }) {
  return (
    <a
      href={item.link}
      {...linkProps}
      className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
    >
      <Thumb item={item} className="h-14 w-24 shrink-0 rounded-md text-[0.6rem]" />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="line-clamp-2 text-sm leading-snug group-hover:text-accent">{item.title}</span>
        <VideoMeta item={item} />
      </span>
    </a>
  );
}
