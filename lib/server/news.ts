import "server-only";
import { XMLParser } from "fast-xml-parser";
import {
  CATEGORY_THEMES,
  GENERIC_PATH_THEMES,
  newsSources,
  type NewsSource,
  type NewsTheme,
} from "@/config/news";
import type { NewsItem, NewsResponse } from "@/lib/types";
import { errorMessage, fetchWithTimeout, SourceError } from "@/lib/server/http";

const parser = new XMLParser({
  ignoreAttributes: true,
  htmlEntities: true,
  // Sempre lista, mesmo com um item ou uma categoria só.
  isArray: (name) => name === "item" || name === "category",
});

/** Notícias por veículo e no total (as mais recentes). */
const PER_SOURCE = 40;
const MAX_ITEMS = 200;

const norm = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

/** Texto de um nó do XML (pode vir como string, número ou objeto com #text). */
function text(node: unknown): string {
  if (node === null || node === undefined) return "";
  if (typeof node === "string" || typeof node === "number") return String(node).trim();
  if (typeof node === "object" && "#text" in node) return text((node as { "#text": unknown })["#text"]);
  return "";
}

/**
 * Alguns feeds (ex.: Folha) usam ISO-8859-1. Lemos os bytes e decodificamos
 * com a codificação declarada no XML ou no cabeçalho, para os acentos saírem certos.
 */
async function readXml(res: Response): Promise<string> {
  const bytes = new Uint8Array(await res.arrayBuffer());
  const head = new TextDecoder("ascii").decode(bytes.slice(0, 200));
  const declared =
    /encoding=["']([\w-]+)["']/i.exec(head)?.[1] ??
    /charset=([\w-]+)/i.exec(res.headers.get("content-type") ?? "")?.[1] ??
    "utf-8";
  try {
    return new TextDecoder(declared).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

/** Datas dos feeds: RFC 822 ("Tue, 03 Nov 2026 21:49:28 +0000") ou ISO sem fuso (= Brasília). */
function parseDate(raw: string): string | null {
  if (!raw) return null;
  const iso = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/.test(raw)
    ? `${raw.replace(" ", "T")}-03:00`
    : raw;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

function classify(source: NewsSource, link: string, categories: string[]): NewsTheme | null {
  let path = "";
  try {
    path = new URL(link).pathname.toLowerCase();
  } catch {
    return null;
  }
  for (const [frag, theme] of source.pathThemes ?? []) if (path.includes(frag)) return theme;
  for (const [frag, theme] of GENERIC_PATH_THEMES) if (path.includes(frag)) return theme;
  const cats = categories.map(norm);
  for (const [cat, theme] of CATEGORY_THEMES) if (cats.includes(cat)) return theme;
  return source.defaultTheme ?? null;
}

async function fetchSource(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetchWithTimeout(source.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; PainelPessoal/1.0)", Accept: "application/rss+xml, application/xml, text/xml" },
  });
  if (!res.ok) throw new SourceError(`O feed respondeu com erro ${res.status}.`);
  const xml = parser.parse(await readXml(res));
  const items: unknown[] = xml?.rss?.channel?.item ?? [];
  if (!Array.isArray(items)) throw new SourceError("Feed em formato inesperado.");

  const out: NewsItem[] = [];
  for (const raw of items.slice(0, PER_SOURCE)) {
    const it = raw as Record<string, unknown>;
    const title = text(it.title).replace(/\s+/g, " ");
    const link = text(it.link);
    const publishedAt = parseDate(text(it.pubDate) || text(it["dc:date"]));
    if (!title || !/^https?:\/\//.test(link) || !publishedAt) continue;
    const categories = (Array.isArray(it.category) ? it.category : []).map(text);
    const theme = classify(source, link, categories);
    if (!theme) continue;
    out.push({ link, title, sourceId: source.id, sourceName: source.name, publishedAt, theme });
  }
  return out;
}

/** Todos os veículos em paralelo; se um cair, só ele fica de fora. */
export async function fetchNews(): Promise<Omit<NewsResponse, "generatedAt">> {
  const results = await Promise.all(
    newsSources.map(async (s) => {
      try {
        const items = await fetchSource(s);
        return { source: { id: s.id, name: s.name, ok: true as const, count: items.length }, items };
      } catch (err) {
        return { source: { id: s.id, name: s.name, ok: false as const, error: errorMessage(err) }, items: [] };
      }
    }),
  );

  const seen = new Set<string>();
  const items = results
    .flatMap((r) => r.items)
    .filter((i) => (seen.has(i.link) ? false : (seen.add(i.link), true)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, MAX_ITEMS);

  return { sources: results.map((r) => r.source), items };
}
