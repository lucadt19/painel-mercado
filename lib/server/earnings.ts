import "server-only";
import { companyAliases, cvmCodes } from "@/config/watchlist";
import type { EarningsRelease, EarningsResponse, NewsItem } from "@/lib/types";
import { fetchWithTimeout, SourceError } from "@/lib/server/http";
import { readZipEntry } from "@/lib/server/unzip";

/**
 * Datas de divulgação de resultados.
 *
 * - CVM (oficial): data de entrega do ITR (trimestral) e do DFP (anual), dos
 *   dados abertos da CVM. A CVM atualiza esses arquivos uma vez por semana.
 * - Manchetes (mesmo dia): notícia que cita o ticker junto com "3T26",
 *   "lucro", "balanço" ou "resultado". Cobre os dias até a CVM atualizar.
 *
 * O selo aparece por SHOW_DAYS dias depois da divulgação.
 */
export const SHOW_DAYS = 7;

const CVM_BASE = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC";

type CvmFiling = { cdCvm: string; refer: string; received: string; kind: "ITR" | "DFP" };

/** Baixa um zip da CVM e devolve as linhas do CSV principal (latin-1, separado por ";"). */
async function fetchCvmCsv(kind: "ITR" | "DFP", year: number): Promise<Record<string, string>[]> {
  const base = `${kind.toLowerCase()}_cia_aberta_${year}`;
  const res = await fetchWithTimeout(`${CVM_BASE}/${kind}/DADOS/${base}.zip`, {}, 60_000);
  if (res.status === 404) return []; // arquivo do ano ainda não existe
  if (!res.ok) throw new SourceError(`A CVM respondeu com erro ${res.status}.`);
  const csv = readZipEntry(new Uint8Array(await res.arrayBuffer()), `${base}.csv`);
  if (!csv) throw new SourceError("Arquivo da CVM em formato inesperado.");

  const [header, ...lines] = new TextDecoder("latin1").decode(csv).split(/\r?\n/);
  const cols = header.split(";");
  return lines
    .filter((l) => l.trim())
    .map((l) => Object.fromEntries(l.split(";").map((v, i) => [cols[i], v])));
}

/** Entregas de ITR (ano atual) e DFP (ano anterior) das empresas configuradas. */
export async function fetchCvmFilings(
  now = new Date(),
): Promise<{ filings: CvmFiling[]; updatedThrough: string | null }> {
  const year = now.getFullYear();
  const wanted = new Set(Object.values(cvmCodes));
  const [itr, dfp] = await Promise.all([fetchCvmCsv("ITR", year), fetchCvmCsv("DFP", year - 1)]);

  // Uma entrega por empresa e período: a primeira versão (a divulgação de fato).
  const first = new Map<string, CvmFiling>();
  let updatedThrough: string | null = null;
  for (const [kind, rows] of [["ITR", itr], ["DFP", dfp]] as const) {
    for (const r of rows) {
      // Última entrega no arquivo inteiro: até quando a CVM está atualizada.
      if (r.DT_RECEB && (!updatedThrough || r.DT_RECEB > updatedThrough)) updatedThrough = r.DT_RECEB;
      if (!wanted.has(r.CD_CVM) || !r.DT_REFER || !r.DT_RECEB) continue;
      const key = `${r.CD_CVM}|${r.DT_REFER}|${kind}`;
      const prev = first.get(key);
      if (!prev || r.DT_RECEB < prev.received) {
        first.set(key, { cdCvm: r.CD_CVM, refer: r.DT_REFER, received: r.DT_RECEB, kind });
      }
    }
  }
  return { filings: [...first.values()], updatedThrough };
}

function quarterOf(refer: string, kind: "ITR" | "DFP") {
  const year = refer.slice(0, 4);
  const yy = year.slice(2);
  if (kind === "DFP") return { quarter: `4T${yy}`, quarterLabel: `resultado anual de ${year}` };
  const q = { "03": 1, "06": 2, "09": 3, "12": 4 }[refer.slice(5, 7)] ?? 0;
  return { quarter: `${q}T${yy}`, quarterLabel: `${q}º trimestre de ${year}` };
}

/** Trimestre mais recente já encerrado numa data (resultado divulgado ~1 mês depois). */
function lastClosedQuarter(day: string) {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  const q = Math.floor((month - 1) / 3); // jan–mar -> 0 (4º tri do ano anterior)
  return q === 0 ? { q: 4, year: year - 1 } : { q, year };
}

const EARNINGS_WORDS = /\b[1-4]T\d{2}\b|lucro|preju[ií]zo|balan[çc]o|resultado|receita|ebitda/i;

const QUARTER_TOKEN = /\b[1-4]T\d{2}\b/i;

/** Dia em São Paulo de um horário ISO (22h em Brasília já é o dia seguinte em UTC). */
const spDay = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));

/** Sem trimestre na manchete, ou com o último trimestre encerrado (ou o anterior). */
function plausibleQuarter(title: string, day: string): boolean {
  const m = /\b([1-4])T(\d{2})\b/i.exec(title);
  if (!m) return true;
  const cited = (2000 + Number(m[2])) * 4 + Number(m[1]);
  const last = lastClosedQuarter(day);
  const lastIndex = last.year * 4 + last.q;
  return cited === lastIndex || cited === lastIndex - 1;
}
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Manchete do dia sobre o resultado da empresa:
 * - cita o ticker (ou outra classe da mesma empresa) + uma palavra de resultado; ou
 * - cita o nome da empresa + o trimestre explícito ("3T26"), mais restrito,
 *   porque nomes como "Vale" aparecem em outros contextos.
 */
function fromNews(ticker: string, news: NewsItem[]): EarningsRelease | null {
  const root = ticker.slice(0, 4);
  const byTicker = new RegExp(`\\b${root}\\d{1,2}\\b`, "i");
  const names = companyAliases[ticker] ?? [];
  // Nome como palavra inteira, com a inicial maiúscula (não pega "vale-refeição").
  const byName = names.length
    ? new RegExp(`(^|[^\\p{L}])(${names.map(escapeRe).join("|")})(?![\\p{L}-])`, "u")
    : null;
  const hit = news
    .filter((n) => {
      // Trimestre citado precisa ser plausível para a data (ex.: em nov/2026, 3T26
      // ou 2T26). Descarta anos fiscais diferentes, como o "1T27" da BrasilAgro.
      if (!plausibleQuarter(n.title, spDay(n.publishedAt))) return false;
      if (byTicker.test(n.title)) return EARNINGS_WORDS.test(n.title);
      // Pelo nome: só se a manchete não for sobre outra empresa (sem ticker de
      // outra) e citar o trimestre. Ex.: "BrasilAgro (AGRO3) ... Itaú BBA" não conta.
      const otherTicker = (n.title.match(/\b[A-Z]{4}\d{1,2}\b/g) ?? []).some((t) => !t.startsWith(root));
      return !otherTicker && !!byName?.test(n.title) && QUARTER_TOKEN.test(n.title);
    })
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))[0]; // a primeira a noticiar
  if (!hit) return null;

  const day = spDay(hit.publishedAt);
  const explicit = /\b([1-4])T(\d{2})\b/i.exec(hit.title);
  const { q, year } = explicit
    ? { q: Number(explicit[1]), year: 2000 + Number(explicit[2]) }
    : lastClosedQuarter(day);
  return {
    quarter: `${q}T${String(year).slice(2)}`,
    quarterLabel: q === 4 ? `4º trimestre de ${year}` : `${q}º trimestre de ${year}`,
    date: day,
    source: "news",
    sourceName: hit.sourceName,
    link: hit.link,
  };
}

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);

/**
 * Por ticker, a divulgação dos últimos SHOW_DAYS dias. Com CVM e manchete do
 * mesmo trimestre, vale a data oficial (CVM).
 */
export function buildEarnings(
  cvm: { filings: CvmFiling[]; updatedThrough: string | null },
  news: NewsItem[],
  today: string,
): Omit<EarningsResponse, "generatedAt"> {
  const { filings } = cvm;
  const releases: Record<string, EarningsRelease> = {};
  for (const [ticker, cd] of Object.entries(cvmCodes)) {
    const official = filings
      .filter((f) => f.cdCvm === cd)
      .sort((a, b) => b.received.localeCompare(a.received))[0];
    const cvm: EarningsRelease | null = official
      ? { ...quarterOf(official.refer, official.kind), date: official.received, source: "cvm" }
      : null;
    const press = fromNews(ticker, news);

    // Manchete de um trimestre que a CVM ainda não registrou ganha da CVM.
    const pick = press && (!cvm || press.quarter !== cvm.quarter) ? press : cvm;
    if (pick && daysBetween(pick.date, today) <= SHOW_DAYS) releases[ticker] = pick;
  }
  return { releases, cvmUpdatedThrough: cvm.updatedThrough };
}
