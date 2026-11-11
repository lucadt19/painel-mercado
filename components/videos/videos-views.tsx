"use client";

import { useMemo } from "react";
import Link from "next/link";
import { VIDEO_KIND_LABEL, videoChannels, type VideoKind } from "@/config/videos";
import { useVideos } from "@/hooks/use-market-data";
import { formatDate, formatUpdatedAt } from "@/lib/format";
import type { VideoItem, VideosResponse } from "@/lib/types";
import { Card, SectionTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoCard, VideoRow } from "@/components/videos/video-card";

const DAY = 86_400_000;

/** Dia em São Paulo (AAAA-MM-DD). */
const spDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));

function CardsSkeleton({ n = 3 }: { n?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }, (_, i) => (
        <Skeleton key={i} className="aspect-video w-full" />
      ))}
    </div>
  );
}

function Status({ data }: { data: VideosResponse }) {
  const failed = data.channels.filter((c) => !c.ok);
  return (
    <p className="text-xs text-muted">
      Fonte: canais oficiais no YouTube (feed público) · atualização automática · consultado às{" "}
      {formatUpdatedAt(data.generatedAt)}
      {failed.length > 0 && ` · indisponíveis agora: ${failed.map((c) => c.name).join(", ")}`}
    </p>
  );
}

// ---------- Morning calls ----------

/** Último Morning Call de cada banco (os de hoje em destaque) e os dos dias anteriores. */
export function MorningCallsView() {
  const { data, error } = useVideos();

  if (!data) {
    return error ? <Card className="p-6 text-sm text-muted">Dados indisponíveis no momento.</Card> : <CardsSkeleton n={2} />;
  }

  const today = spDay(data.generatedAt);
  const morning = data.items.filter((v) => v.kind === "morning");
  const latest = videoChannels
    .filter((c) => c.kind === "morning")
    .map((c) => ({ channel: c, item: morning.find((v) => v.channelId === c.id) }));
  const latestIds = new Set(latest.map((l) => l.item?.videoId));
  const previous = morning.filter((v) => !latestIds.has(v.videoId) && Date.parse(data.generatedAt) - Date.parse(v.publishedAt) < 7 * DAY);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle aside="publicados antes da abertura do pregão">Mais recentes</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          {latest.map(({ channel, item }) =>
            item ? (
              <div key={channel.id} className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted">
                  {spDay(item.publishedAt) === today ? "Hoje" : `De ${formatDate(spDay(item.publishedAt))}`} · {channel.name}
                </span>
                <VideoCard item={item} />
              </div>
            ) : (
              <Card key={channel.id} className="p-4 text-sm text-muted">
                {channel.name}: nenhum Morning Call recente no feed.
              </Card>
            ),
          )}
        </div>
      </section>

      {previous.length > 0 && (
        <section>
          <SectionTitle>Dias anteriores</SectionTitle>
          <Card className="divide-y divide-border overflow-hidden">
            {previous.map((v) => (
              <VideoRow key={v.videoId} item={v} />
            ))}
          </Card>
        </section>
      )}
      <Status data={data} />
    </div>
  );
}

// ---------- Podcasts & vídeos ----------

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

/**
 * "Recomendados da semana": vídeos dos últimos 7 dias que estão indo melhor
 * que o normal DO PRÓPRIO CANAL (visualizações por dia no ar ÷ mediana do
 * canal no feed). Assim um canal com milhões de inscritos não ocupa a lista
 * toda; e no máximo 2 por canal.
 */
function weekly(items: VideoItem[], now: number) {
  const perDay = (v: VideoItem) => v.views / Math.max(1, (now - Date.parse(v.publishedAt)) / DAY);
  const pool = items.filter((v) => v.kind !== "morning");
  const typical = new Map<string, number>();
  for (const id of new Set(pool.map((v) => v.channelId))) {
    typical.set(id, median(pool.filter((v) => v.channelId === id).map(perDay)) || 1);
  }
  const ranked = pool
    .filter((v) => now - Date.parse(v.publishedAt) < 7 * DAY)
    .map((v) => ({ v, score: perDay(v) / typical.get(v.channelId)! }))
    .sort((a, b) => b.score - a.score);
  const perChannel = new Map<string, number>();
  const out: VideoItem[] = [];
  for (const { v } of ranked) {
    const n = perChannel.get(v.channelId) ?? 0;
    if (n >= 2) continue;
    perChannel.set(v.channelId, n + 1);
    out.push(v);
    if (out.length === 6) break;
  }
  return out;
}

export function VideosView() {
  const { data, error } = useVideos();
  const recommended = useMemo(() => (data ? weekly(data.items, Date.parse(data.generatedAt)) : []), [data]);

  if (!data) {
    return error ? <Card className="p-6 text-sm text-muted">Dados indisponíveis no momento.</Card> : <CardsSkeleton n={6} />;
  }

  const byKind = (kind: VideoKind) => data.items.filter((v) => v.kind === kind).slice(0, 6);
  const channelsOf = (kind: VideoKind) =>
    videoChannels
      .filter((c) => c.kind === kind)
      .map((c) => c.name)
      .join(", ");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionTitle aside="últimos 7 dias · os que mais se destacaram em cada canal">Recomendados da semana</SectionTitle>
        {recommended.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((v) => (
              <VideoCard key={v.videoId} item={v} />
            ))}
          </div>
        ) : (
          <Card className="p-4 text-sm text-muted">Nenhum vídeo novo nos últimos 7 dias.</Card>
        )}
      </section>

      {(["analise", "educacao"] as const).map((kind) => (
        <section key={kind}>
          <SectionTitle aside={channelsOf(kind)}>{VIDEO_KIND_LABEL[kind]}: mais recentes</SectionTitle>
          <Card className="divide-y divide-border overflow-hidden">
            {byKind(kind).map((v) => (
              <VideoRow key={v.videoId} item={v} />
            ))}
          </Card>
        </section>
      ))}

      <p className="text-xs text-muted">
        &quot;Recomendados&quot; compara as visualizações de cada vídeo com as do próprio canal (até 2 por canal); é
        popularidade, não avaliação de conteúdo. Canais em <code>config/videos.ts</code>.
      </p>
      <Status data={data} />
    </div>
  );
}

// ---------- Visão Geral ----------

/** Card da Visão Geral: os Morning Calls de hoje (ou os mais recentes). */
export function MorningCallsCard() {
  const { data, error } = useVideos();
  const latest = useMemo(() => {
    if (!data) return [];
    return videoChannels
      .filter((c) => c.kind === "morning")
      .map((c) => data.items.find((v) => v.kind === "morning" && v.channelId === c.id))
      .filter((v): v is VideoItem => !!v);
  }, [data]);

  return (
    <section aria-labelledby="morning-title">
      <SectionTitle
        aside={
          <Link href="/noticias/morning-calls" className="hover:text-accent">
            Ver todos
          </Link>
        }
      >
        <span id="morning-title">Morning calls</span>
      </SectionTitle>
      <Card className="divide-y divide-border overflow-hidden">
        {!data ? (
          error ? (
            <p className="p-4 text-sm text-muted">Dados indisponíveis no momento</p>
          ) : (
            <div className="flex flex-col gap-3 p-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )
        ) : latest.length ? (
          latest.map((v) => <VideoRow key={v.videoId} item={v} />)
        ) : (
          <p className="p-4 text-sm text-muted">Nenhum Morning Call recente.</p>
        )}
      </Card>
    </section>
  );
}
