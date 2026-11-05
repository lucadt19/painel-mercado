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
  // Atributos são necessários: a foto vem em <media:content url="...">.
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
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

/** Atributo de um nó (ex.: url de <media:content>). */
function attr(node: unknown, name: string): string {
  return node && typeof node === "object" ? text((node as Record<string, unknown>)[`@_${name}`]) : "";
}

const asList = (v: unknown): unknown[] => (Array.isArray(v) ? v : v ? [v] : []);
/**
 * Só https; decodifica &amp; (vem assim dentro do HTML do feed) e, nas imagens
 * do WordPress/Jetpack (InfoMoney), pede até 1024 px em vez da miniatura de 300.
 */
const httpsOnly = (u: string) =>
  /^https:\/\//.test(u)
    ? u.replace(/&amp;/g, "&").replace(/([?&]fit=)\d+%2C\d+/, (_m, prefix: string) => `${prefix}1024%2C1024`)
    : null;

/**
 * Foto da matéria, só do que o próprio feed fornece (nunca abrimos a página
 * da matéria): <media:content>/<media:thumbnail>/<enclosure>, <mediaurl>
 * (Exame) ou a primeira <img> do conteúdo que não esteja dentro de um link
 * para OUTRA matéria (o InfoMoney mistura miniaturas de "leia também").
 */
function imageOf(it: Record<string, unknown>, link: string): string | null {
  for (const key of ["media:content", "media:thumbnail", "enclosure"]) {
    for (const n of asList(it[key])) {
      const url = attr(n, "url");
      const kind = attr(n, "type") || attr(n, "medium") || "image";
      if (url && /image/i.test(kind) && httpsOnly(url)) return url;
    }
  }
  const mediaUrl = httpsOnly(text(it.mediaurl));
  if (mediaUrl) return mediaUrl;

  const html = `${text(it["content:encoded"])} ${text(it.description)}`;
  const tag = /<a\s[^>]*href=["']([^"']+)["'][^>]*>|<\/a>|<img\s[^>]*src=["']([^"']+)["']/gi;
  let insideOtherLink = false;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    if (m[1] !== undefined) insideOtherLink = m[1].split("?")[0] !== link.split("?")[0];
    else if (m[0].startsWith("</a")) insideOtherLink = false;
    else if (m[2] && !insideOtherLink && httpsOnly(m[2])) return m[2];
  }
  return null;
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
    out.push({
      link,
      title,
      sourceId: source.id,
      sourceName: source.name,
      publishedAt,
      theme,
      image: imageOf(it, link),
      coverage: 1,
      score: 0,
      paywall: source.paywall,
    });
  }
  return out;
}

// ---------- Relevância ----------

/** Palavras que não identificam o assunto (comparação sem acento). */
const STOPWORDS = new Set(
  "para sobre apos como mais pelo pela pelos pelas entre segundo deve pode podem nesta neste contra ainda seus suas esta este essa esse isso qual quais veja entenda hoje anos dias semana mes quer diz dizem fica ficam tera terao sera serao mesmo desde quando onde porque menos alta queda sobe sobem cai caem".split(" "),
);

const keywords = (title: string) =>
  new Set(norm(title).split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOPWORDS.has(w)));

/**
 * O RSS não informa importância. Critério: o assunto coberto por mais
 * veículos (manchetes com palavras-chave em comum, publicadas com até 12 h de
 * diferença), com desconto pela idade. `coverage` = quantos veículos.
 */
function scoreRelevance(items: NewsItem[]) {
  const now = Date.now();
  const kws = items.map((i) => keywords(i.title));
  const times = items.map((i) => Date.parse(i.publishedAt));
  items.forEach((item, a) => {
    const sources = new Set([item.sourceId]);
    items.forEach((other, b) => {
      if (a === b || sources.has(other.sourceId) || Math.abs(times[a] - times[b]) > 12 * 3600_000) return;
      let shared = 0;
      for (const w of kws[a]) if (kws[b].has(w)) shared++;
      const union = kws[a].size + kws[b].size - shared;
      if (shared >= 2 && shared / union >= 0.2) sources.add(other.sourceId);
    });
    const hoursAgo = (now - times[a]) / 3600_000;
    item.coverage = sources.size;
    item.score = Math.round((sources.size * 10 - hoursAgo) * 10) / 10;
  });
}

/**
 * Mesmo assunto em veículo pago e gratuito: fica só a versão gratuita (a paga
 * vira "também em ..."). Para esconder, a semelhança precisa ser maior do que
 * a usada na relevância: 3 palavras-chave em comum e 25% do total, até 12 h de
 * diferença (calibrado com as manchetes de 05/11/2026). Às vezes junta dois
 * ângulos do mesmo tema; por isso a versão paga continua como link em
 * "também em ...". Assuntos só em veículos pagos continuam na lista.
 */
function preferFree(items: NewsItem[]): NewsItem[] {
  const kws = items.map((i) => keywords(i.title));
  const times = items.map((i) => Date.parse(i.publishedAt));
  const hidden = new Set<number>();
  items.forEach((paid, p) => {
    if (paid.paywall !== "assinante") return;
    let best = -1;
    let bestSim = 0;
    items.forEach((free, f) => {
      if (free.paywall !== "gratis" || Math.abs(times[p] - times[f]) > 12 * 3600_000) return;
      let shared = 0;
      for (const w of kws[p]) if (kws[f].has(w)) shared++;
      const sim = shared / (kws[p].size + kws[f].size - shared || 1);
      if (shared >= 3 && sim >= 0.25 && sim > bestSim) {
        best = f;
        bestSim = sim;
      }
    });
    if (best >= 0) {
      hidden.add(p);
      const free = items[best];
      free.alsoIn = [...(free.alsoIn ?? []), { sourceName: paid.sourceName, link: paid.link, paywall: paid.paywall }];
      // A versão gratuita herda a relevância do assunto.
      free.coverage = Math.max(free.coverage, paid.coverage);
      free.score = Math.max(free.score, paid.score);
    }
  });
  return items.filter((_, i) => !hidden.has(i));
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
  scoreRelevance(items);

  return { sources: results.map((r) => r.source), items: preferFree(items) };
}
