import "server-only";
import { XMLParser } from "fast-xml-parser";
import { VIDEO_EXCLUDE, videoChannels, type VideoChannel } from "@/config/videos";
import type { VideoItem, VideosResponse } from "@/lib/types";
import { errorMessage, fetchWithTimeout, SourceError } from "@/lib/server/http";

/**
 * Vídeos dos canais configurados, pelo feed público oficial do YouTube
 * (os ~15 mais recentes de cada canal). Só título, canal, horário, miniatura
 * e link; o vídeo abre no YouTube.
 */

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  htmlEntities: true,
  isArray: (name) => name === "entry",
});

const text = (v: unknown): string =>
  typeof v === "string" || typeof v === "number" ? String(v).trim() : v && typeof v === "object" && "#text" in v ? text((v as { "#text": unknown })["#text"]) : "";

type Entry = Record<string, unknown> & {
  "yt:videoId"?: unknown;
  title?: unknown;
  published?: unknown;
  link?: { "@_href"?: string } | { "@_href"?: string }[];
  "media:group"?: {
    "media:thumbnail"?: { "@_url"?: string };
    "media:community"?: { "media:statistics"?: { "@_views"?: string } };
  };
};

async function fetchChannel(ch: VideoChannel): Promise<VideoItem[]> {
  const res = await fetchWithTimeout(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`, {
    headers: { Accept: "application/atom+xml, application/xml" },
  });
  if (!res.ok) throw new SourceError(`O YouTube respondeu com erro ${res.status}.`);
  const xml = parser.parse(await res.text());
  const entries: Entry[] = xml?.feed?.entry ?? [];

  const out: VideoItem[] = [];
  for (const e of entries) {
    const videoId = text(e["yt:videoId"]);
    const title = text(e.title).replace(/\s+/g, " ");
    const publishedAt = text(e.published);
    const links = Array.isArray(e.link) ? e.link : e.link ? [e.link] : [];
    const link = links[0]?.["@_href"] ?? `https://www.youtube.com/watch?v=${videoId}`;
    if (!videoId || !title || !Date.parse(publishedAt)) continue;
    if (link.includes("/shorts/") || VIDEO_EXCLUDE.test(title)) continue;
    if (ch.titleFilter && !ch.titleFilter.test(title)) continue;
    out.push({
      videoId,
      title,
      channelId: ch.id,
      channelName: ch.name,
      kind: ch.kind,
      publishedAt: new Date(publishedAt).toISOString(),
      link,
      // Miniatura média (320x180), servida pelo próprio YouTube.
      thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      views: Number(e["media:group"]?.["media:community"]?.["media:statistics"]?.["@_views"] ?? 0),
    });
  }
  return out;
}

/** Todos os canais em paralelo; se um cair, só ele fica de fora. */
export async function fetchVideos(): Promise<Omit<VideosResponse, "generatedAt">> {
  const results = await Promise.all(
    videoChannels.map(async (ch) => {
      try {
        const items = await fetchChannel(ch);
        return { channel: { id: ch.id, name: ch.name, ok: true as const, count: items.length }, items };
      } catch (err) {
        return { channel: { id: ch.id, name: ch.name, ok: false as const, error: errorMessage(err) }, items: [] };
      }
    }),
  );
  const items = results.flatMap((r) => r.items).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { channels: results.map((r) => r.channel), items };
}
