import "server-only";
import { companyAliases } from "@/config/watchlist";
import { searchAliases } from "@/config/search-aliases";
import type { EarningsRelease, EarningsResponse, NewsItem } from "@/lib/types";
import { fetchWithTimeout, SourceError } from "@/lib/server/http";
import { readZipEntry } from "@/lib/server/unzip";

/**
 * Datas de divulgação de resultados, para TODAS as empresas da B3.
 *
 * Fontes oficiais (dados abertos da CVM, atualizados 1 vez por semana):
 * - IPE: documentos protocolados pela empresa, como "Release de Resultados
 *   3T26" (é o mesmo release publicado no site de RI). Traz o link do documento.
 * - ITR (trimestral) e DFP (anual): data de entrega das demonstrações.
 * - FCA: cadastro que liga cada empresa (CNPJ) aos seus tickers.
 *
 * Mesmo dia: manchetes que citam um ticker junto com uma palavra de resultado,
 * para cobrir os dias até a CVM atualizar os arquivos.
 *
 * O selo aparece por SHOW_DAYS dias depois da divulgação.
 */
export const SHOW_DAYS = 7;

const CVM_BASE = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC";

export type CvmFiling = {
  cnpj: string;
  quarter: string;
  quarterLabel: string;
  /** Dia da entrega na CVM (AAAA-MM-DD). */
  date: string;
  /** Link do documento na CVM (release ou demonstrações). */
  link?: string;
  kind: "release" | "itr" | "dfp";
};

export type CvmData = {
  filings: CvmFiling[];
  /** CNPJ -> tickers negociados. */
  tickers: Record<string, string[]>;
  updatedThrough: string | null;
};

/** Baixa um zip da CVM e devolve as linhas de um CSV dele (latin-1, separado por ";"). */
async function fetchCvmCsv(zipUrl: string, entry: string): Promise<Record<string, string>[]> {
  const res = await fetchWithTimeout(zipUrl, {}, 60_000);
  if (res.status === 404) return []; // arquivo do ano ainda não existe (começo de janeiro)
  if (!res.ok) throw new SourceError(`A CVM respondeu com erro ${res.status}.`);
  const csv = readZipEntry(new Uint8Array(await res.arrayBuffer()), entry);
  if (!csv) throw new SourceError("Arquivo da CVM em formato inesperado.");

  const [header, ...lines] = new TextDecoder("latin1").decode(csv).split(/\r?\n/);
  const cols = header.split(";");
  return lines
    .filter((l) => l.trim())
    .map((l) => Object.fromEntries(l.split(";").map((v, i) => [cols[i], v])));
}

const docUrl = (kind: string, year: number) =>
  `${CVM_BASE}/${kind.toUpperCase()}/DADOS/${kind}_cia_aberta_${year}.zip`;

const QUARTER_RE = /\b([1-4])\s?T\s?(\d{2}|\d{4})\b/i;

function labelOf(q: number, year: number) {
  return { quarter: `${q}T${String(year).slice(2)}`, quarterLabel: `${q}º trimestre de ${year}` };
}

/** Trimestre pela data de referência das demonstrações (ITR) ou anual (DFP). */
function quarterOfRefer(refer: string, kind: "itr" | "dfp") {
  const year = Number(refer.slice(0, 4));
  if (kind === "dfp") return { quarter: `4T${String(year).slice(2)}`, quarterLabel: `resultado anual de ${year}` };
  const q = { "03": 1, "06": 2, "09": 3, "12": 4 }[refer.slice(5, 7)] ?? 0;
  return labelOf(q, year);
}

/**
 * Release de resultados no IPE: tipo "Press-release", ou um assunto que fale
 * de resultado/desempenho com o trimestre ("Apresentação de Resultados 3T26").
 * Ficam de fora avisos que vêm ANTES do resultado (convite, cronograma, calendário).
 */
function isEarningsRelease(r: Record<string, string>): boolean {
  const subject = r.Assunto ?? "";
  if (!QUARTER_RE.test(subject)) return false;
  if (
    /cronograma|calend[aá]rio|agenda|convite|datas? de divulga|aviso de divulga|per[ií]odo de sil[eê]ncio|pr[eé]via|operacional|produ[cç][aã]o/i.test(
      subject,
    )
  )
    return false;
  return r.Tipo === "Press-release" || /resultad|desempenho|release|demonstra/i.test(subject);
}

/** Releases (IPE), ITR e DFP de todas as empresas, mais o cadastro de tickers (FCA). */
export async function fetchCvmData(now = new Date()): Promise<CvmData> {
  const year = now.getFullYear();
  const [ipe, itr, dfp, fca] = await Promise.all([
    fetchCvmCsv(docUrl("ipe", year), `ipe_cia_aberta_${year}.csv`),
    fetchCvmCsv(docUrl("itr", year), `itr_cia_aberta_${year}.csv`),
    fetchCvmCsv(docUrl("dfp", year - 1), `dfp_cia_aberta_${year - 1}.csv`),
    fetchCvmCsv(docUrl("fca", year), `fca_cia_aberta_valor_mobiliario_${year}.csv`),
  ]);

  const filings: CvmFiling[] = [];
  let updatedThrough: string | null = null;
  const seen = (d: string) => {
    if (d && (!updatedThrough || d > updatedThrough)) updatedThrough = d;
  };

  for (const r of ipe) {
    seen(r.Data_Entrega);
    if (!r.CNPJ_Companhia || !r.Data_Entrega || !isEarningsRelease(r)) continue;
    const m = QUARTER_RE.exec(r.Assunto)!;
    const y = Number(m[2].length === 2 ? `20${m[2]}` : m[2]);
    // Resultado só sai semanas depois do fim do trimestre: documento de antes
    // disso é aviso ou projeção (ex.: "Datas de divulgação do 3T26" em 01/10).
    const quarterEnd = Date.UTC(y, Number(m[1]) * 3, 0); // último dia do trimestre
    if (Date.parse(`${r.Data_Entrega}T12:00:00Z`) < quarterEnd + 10 * 86_400_000) continue;
    filings.push({
      cnpj: r.CNPJ_Companhia,
      ...labelOf(Number(m[1]), y),
      date: r.Data_Entrega,
      link: r.Link_Download || undefined,
      kind: "release",
    });
  }
  for (const [kind, rows] of [["itr", itr], ["dfp", dfp]] as const) {
    for (const r of rows) {
      seen(r.DT_RECEB);
      if (!r.CNPJ_CIA || !r.DT_REFER || !r.DT_RECEB) continue;
      filings.push({ cnpj: r.CNPJ_CIA, ...quarterOfRefer(r.DT_REFER, kind), date: r.DT_RECEB, link: r.LINK_DOC || undefined, kind });
    }
  }

  // Tickers ainda negociados na B3, por CNPJ.
  const tickers: Record<string, string[]> = {};
  for (const r of fca) {
    const t = r.Codigo_Negociacao?.trim().toUpperCase();
    if (!t || !/^[A-Z0-9]{4}\d{1,2}$/.test(t) || r.Data_Fim_Negociacao) continue;
    const list = (tickers[r.CNPJ_Companhia] ??= []);
    if (!list.includes(t)) list.push(t);
  }
  return { filings, tickers, updatedThrough };
}

// ---------- Manchetes ----------

/** Trimestre mais recente já encerrado numa data (resultado divulgado ~1 mês depois). */
function lastClosedQuarter(day: string) {
  const year = Number(day.slice(0, 4));
  const month = Number(day.slice(5, 7));
  const q = Math.floor((month - 1) / 3); // jan–mar -> 0 (4º tri do ano anterior)
  return q === 0 ? { q: 4, year: year - 1 } : { q, year };
}

const EARNINGS_WORDS = /\b[1-4]T\d{2}\b|lucr|preju[ií]zo|balan[çc]o|resultado|ebitda|trimestr/i;
/** Menção ao trimestre: "3T26", "3º trimestre" ou só "trimestre". */
const QUARTER_TOKEN = /\b[1-4]T\d{2}\b|\btrimestr/i;
/** Tickers de ações e units da B3 numa manchete. */
const TICKER_IN_TITLE = /\b([A-Z]{4})(3|4|5|6|11)\b/g;

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

function releaseFromNews(n: NewsItem): EarningsRelease {
  const day = spDay(n.publishedAt);
  const explicit = /\b([1-4])T(\d{2})\b/i.exec(n.title);
  const { q, year } = explicit ? { q: Number(explicit[1]), year: 2000 + Number(explicit[2]) } : lastClosedQuarter(day);
  return { ...labelOf(q, year), date: day, source: "news", sourceName: n.sourceName, link: n.link };
}

/**
 * Manchetes do dia sobre resultado, por raiz de ticker (PETR, VALE...):
 * - a manchete cita UM só ticker (listas como "PETR4, VALE3 e ITUB4 sobem"
 *   não contam) e uma palavra de resultado; ou
 * - cita o nome da empresa (companyAliases) + o trimestre explícito ("3T26"),
 *   sem ticker de outra empresa.
 * Fica a primeira manchete a noticiar.
 */
function newsByRoot(news: NewsItem[]): Map<string, EarningsRelease> {
  const out = new Map<string, EarningsRelease>();
  const sorted = [...news].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  // Nomes das empresas: os da watchlist (companyAliases) e os nomes populares da busca.
  const names = new Map<string, Set<string>>();
  for (const [ticker, list] of Object.entries(companyAliases))
    for (const n of list) (names.get(ticker.slice(0, 4)) ?? names.set(ticker.slice(0, 4), new Set()).get(ticker.slice(0, 4))!).add(n);
  for (const [root, list] of Object.entries(searchAliases))
    for (const n of list) if (n.length >= 3) (names.get(root) ?? names.set(root, new Set()).get(root)!).add(n);
  const aliasRes = [...names].map(([root, set]) => ({
    root,
    re: new RegExp(`(^|[^\\p{L}])(${[...set].map(escapeRe).join("|")})(?![\\p{L}-])`, "u"),
  }));

  for (const n of sorted) {
    if (!plausibleQuarter(n.title, spDay(n.publishedAt))) continue;
    const roots = new Set([...n.title.matchAll(TICKER_IN_TITLE)].map((m) => m[1]));
    let root: string | undefined;
    if (roots.size === 1 && EARNINGS_WORDS.test(n.title)) root = [...roots][0];
    else if (roots.size === 0 && QUARTER_TOKEN.test(n.title)) root = aliasRes.find((a) => a.re.test(n.title))?.root;
    if (root && !out.has(root)) out.set(root, releaseFromNews(n));
  }
  return out;
}

const daysBetween = (a: string, b: string) =>
  Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);

/**
 * Por ticker, a divulgação dos últimos SHOW_DAYS dias. Por empresa, vale a
 * primeira entrega do trimestre mais recente (release, ITR ou DFP); com
 * manchete do mesmo trimestre, vale a data oficial (CVM). Manchete de um
 * trimestre que a CVM ainda não registrou ganha da CVM.
 */
export function buildEarnings(cvm: CvmData, news: NewsItem[], today: string): Omit<EarningsResponse, "generatedAt"> {
  const releases: Record<string, EarningsRelease> = {};
  const recent = (date: string) => daysBetween(date, today) <= SHOW_DAYS && daysBetween(date, today) >= 0;

  // CVM: por empresa, o trimestre mais recente e a primeira entrega dele.
  const official = new Map<string, EarningsRelease>();
  const byCnpj = new Map<string, CvmFiling[]>();
  for (const f of cvm.filings) (byCnpj.get(f.cnpj) ?? byCnpj.set(f.cnpj, []).get(f.cnpj)!).push(f);
  const order = (q: string) => Number(q.slice(2)) * 10 + Number(q[0]);
  for (const [cnpj, list] of byCnpj) {
    const latestQ = list.reduce((best, f) => (order(f.quarter) > order(best) ? f.quarter : best), list[0].quarter);
    const first = list
      .filter((f) => f.quarter === latestQ)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.kind === "release" ? -1 : 1))[0];
    const rel: EarningsRelease = {
      quarter: first.quarter,
      quarterLabel: first.quarterLabel,
      date: first.date,
      source: "cvm",
      sourceName: first.kind === "release" ? "release na CVM" : first.kind === "itr" ? "ITR na CVM" : "DFP na CVM",
      link: first.link,
    };
    for (const t of cvm.tickers[cnpj] ?? []) official.set(t, rel);
  }

  const press = newsByRoot(news);
  const allTickers = new Set([...official.keys(), ...Object.values(cvm.tickers).flat()]);
  for (const [root] of press) {
    // Ticker citado que não está no cadastro (ex.: cadastro da CVM fora do ar): fica pelo menos a raiz + 3/4/11.
    if (![...allTickers].some((t) => t.startsWith(root))) for (const s of ["3", "4", "11"]) allTickers.add(root + s);
  }

  for (const t of allTickers) {
    const cvmRel = official.get(t);
    const newsRel = press.get(t.slice(0, 4));
    const pick = newsRel && (!cvmRel || newsRel.quarter !== cvmRel.quarter) ? newsRel : cvmRel;
    if (pick && recent(pick.date)) releases[t] = pick;
  }
  return { releases, cvmUpdatedThrough: cvm.updatedThrough };
}
