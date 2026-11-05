#!/usr/bin/env node
/**
 * Histórico de preços da B3 (arquivos oficiais COTAHIST, gratuitos).
 *
 * Baixa os arquivos anuais dos últimos 5 anos (o do ano atual é atualizado
 * pela B3 todo dia útil), lê só o mercado à vista (ações, FIIs, ETFs, BDRs)
 * e grava um arquivo pequeno por ativo em data/b3-historico/{TICKER}.json.
 *
 * Uso: node scripts/b3-historico.mjs
 * Roda sozinho no GitHub Actions uma vez por mês (.github/workflows/b3-historico.yml).
 *
 * Layout do arquivo (documento "SeriesHistoricas_Layout" da B3), posições 1-indexadas:
 *   1-2 tipo de registro ("01" = cotação) · 3-10 data AAAAMMDD · 11-12 BDI
 *   13-24 ticker · 25-27 tipo de mercado ("010" = à vista)
 *   109-121 preço de fechamento (2 casas, sem vírgula) · 211-217 fator de cotação
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { open, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInflateRaw } from "node:zlib";

const ROOT = process.cwd();
const OUT_DIR = join(ROOT, "data", "b3-historico");
const CACHE_DIR = join(ROOT, ".cache", "b3");
const BASE_URL = "https://bvmf.bmfbovespa.com.br/InstDados/SerHist";
const YEARS_BACK = 5;

/** Fatores exatos de desdobramento/grupamento que tentamos reconhecer. */
const SPLIT_FACTORS = [2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30, 40, 50, 100];
const SPLIT_TOLERANCE = 0.04;

const log = (...a) => console.log("[b3]", ...a);

/** Ano atual em São Paulo. */
const currentYear = Number(
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(new Date()),
);

async function download(year) {
  mkdirSync(CACHE_DIR, { recursive: true });
  const file = join(CACHE_DIR, `COTAHIST_A${year}.ZIP`);
  // Anos encerrados não mudam: reaproveita o que já foi baixado.
  if (year < currentYear && existsSync(file) && statSync(file).size > 0) return file;
  const url = `${BASE_URL}/COTAHIST_A${year}.ZIP`;
  log("baixando", url);
  const res = await fetch(url);
  if (res.status === 404) return null; // começo de janeiro: o arquivo do ano ainda não existe
  if (!res.ok) throw new Error(`B3 respondeu ${res.status} para ${url}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

/** Posição e tamanho do (único) arquivo dentro do zip, pelo diretório central. */
async function zipEntry(file) {
  const fh = await open(file, "r");
  try {
    const size = (await fh.stat()).size;
    const tailLen = Math.min(size, 65_557);
    const tail = Buffer.alloc(tailLen);
    await fh.read(tail, 0, tailLen, size - tailLen);
    const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
    if (eocd < 0) throw new Error(`zip inválido: ${file}`);
    let cdOffset = tail.readUInt32LE(eocd + 16);
    let compSize, localOffset, method;
    // ZIP64 (arquivos grandes): os valores reais ficam no campo extra.
    const cd = Buffer.alloc(46 + 1024);
    if (cdOffset === 0xffffffff) {
      const loc = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x06, 0x07]));
      const rec = Buffer.alloc(56);
      await fh.read(rec, 0, 56, Number(tail.readBigUInt64LE(loc + 8)));
      cdOffset = Number(rec.readBigUInt64LE(48));
    }
    await fh.read(cd, 0, cd.length, cdOffset);
    method = cd.readUInt16LE(10);
    compSize = cd.readUInt32LE(20);
    localOffset = cd.readUInt32LE(42);
    const nameLen = cd.readUInt16LE(28);
    const extraLen = cd.readUInt16LE(30);
    if (compSize === 0xffffffff || localOffset === 0xffffffff) {
      let p = 46 + nameLen;
      const end = p + extraLen;
      while (p < end) {
        const id = cd.readUInt16LE(p);
        const len = cd.readUInt16LE(p + 2);
        if (id === 0x0001) {
          let q = p + 4;
          if (cd.readUInt32LE(24) === 0xffffffff) q += 8; // tamanho descompactado
          if (compSize === 0xffffffff) {
            compSize = Number(cd.readBigUInt64LE(q));
            q += 8;
          }
          if (localOffset === 0xffffffff) localOffset = Number(cd.readBigUInt64LE(q));
        }
        p += 4 + len;
      }
    }
    const local = Buffer.alloc(30);
    await fh.read(local, 0, 30, localOffset);
    const dataStart = localOffset + 30 + local.readUInt16LE(26) + local.readUInt16LE(28);
    return { dataStart, compSize, method };
  } finally {
    await fh.close();
  }
}

/** Lê o zip em fluxo (o texto descompactado passa de 1 GB) e chama `onLine` por linha. */
async function eachLine(file, onLine) {
  const { dataStart, compSize, method } = await zipEntry(file);
  if (method !== 8) throw new Error(`compressão ${method} não suportada em ${file}`);
  const stream = createReadStream(file, { start: dataStart, end: dataStart + compSize - 1 }).pipe(createInflateRaw());
  let rest = "";
  for await (const chunk of stream) {
    const text = rest + chunk.toString("latin1");
    const lines = text.split("\n");
    rest = lines.pop();
    for (const l of lines) onLine(l);
  }
  if (rest) onLine(rest);
}

/** ticker -> Map(data -> fechamento) */
const series = new Map();

function onLine(line) {
  if (!line.startsWith("01") || line.slice(24, 27) !== "010") return;
  const raw = line.slice(2, 10);
  const date = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
  const ticker = line.slice(12, 24).trim();
  const close = Number(line.slice(108, 121)) / 100;
  const factor = Number(line.slice(210, 217)) || 1;
  if (!ticker || !(close > 0)) return;
  let s = series.get(ticker);
  if (!s) series.set(ticker, (s = new Map()));
  s.set(date, close / factor);
}

/**
 * Desdobramentos e grupamentos: um salto de um pregão para o outro que bate
 * com um fator exato (ex.: preço cai à metade = desdobramento 1:2). Ajusta os
 * preços anteriores para ficarem comparáveis com os de hoje. É uma estimativa:
 * a B3 não informa os eventos neste arquivo.
 */
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : NaN;
};

/**
 * Dias de mercado agitado (Ibovespa, pelo BOVA11, variando mais de 4%): nesses
 * dias uma queda pela metade pode ser real (ex.: 26/10/2026, dia seguinte ao
 * 2º turno, com o BOVA11 em −14,5%), então não tratamos saltos como desdobramento.
 */
function turbulentDays() {
  const days = new Set();
  const bova = series.get("BOVA11");
  if (!bova) return days;
  const pts = [...bova].sort((a, b) => a[0].localeCompare(b[0]));
  for (let i = 1; i < pts.length; i++) {
    if (Math.abs(pts[i][1] / pts[i - 1][1] - 1) > 0.04) days.add(pts[i][0]);
  }
  return days;
}
let TURBULENT = new Set();

/** Eventos a menos disto (em pregões) um do outro são ruído de ativo pouco negociado. */
const MIN_SESSIONS_APART = 15;
/** Abaixo disto o preço anda em saltos de 1 tick (ex.: 0,005 -> 0,01) e engana a detecção. */
const MIN_PRICE = 0.1;

function adjustSplits(points) {
  // 1ª passada: candidatos (índice do pregão depois do salto -> multiplicador dos anteriores).
  const candidates = [];
  const near = (x, tol) => SPLIT_FACTORS.find((k) => Math.abs(x / k - 1) <= tol);
  for (let i = points.length - 1; i > 0; i--) {
    const [date, after] = points[i];
    const before = points[i - 1][1];
    const r = before / after;
    // O salto precisa ser um degrau: o preço fica no novo patamar nos pregões
    // seguintes (mediana de até 5 antes e 5 depois). Ativos pouco negociados
    // que pulam e voltam não contam.
    const prev = points.slice(Math.max(0, i - 5), i).map((p) => p[1]);
    const next = points.slice(i, i + 5).map((p) => p[1]);
    const rStep = next.length >= 3 && prev.length >= 3 ? median(prev) / median(next) : NaN;
    const steady = (k) =>
      !TURBULENT.has(date) && Number.isFinite(rStep) && Math.abs((r > 1 ? rStep : 1 / rStep) / k - 1) <= 0.25;
    const kSplit = r > 1 ? near(r, SPLIT_TOLERANCE) : undefined;
    const kReverse = r < 1 ? near(1 / r, SPLIT_TOLERANCE) : undefined;
    const split = kSplit && steady(kSplit) ? kSplit : undefined; // preço caiu k vezes: desdobramento
    const reverse = kReverse && steady(kReverse) ? kReverse : undefined; // preço subiu k vezes: grupamento
    if (Math.min(before, after) < MIN_PRICE) continue;
    if (split) candidates.push({ i, mult: 1 / split, label: `desdobramento 1:${split}`, date });
    else if (reverse) candidates.push({ i, mult: reverse, label: `grupamento ${reverse}:1`, date });
  }
  // Descarta candidatos próximos de outro (o preço pulou e voltou).
  const kept = candidates.filter(
    (c) => !candidates.some((o) => o !== c && Math.abs(o.i - c.i) < MIN_SESSIONS_APART),
  );

  // 2ª passada: aplica os ajustes, do mais recente para o mais antigo.
  const byIndex = new Map(kept.map((c) => [c.i, c]));
  const out = new Array(points.length);
  let mult = 1;
  out[points.length - 1] = points[points.length - 1][1];
  for (let i = points.length - 1; i > 0; i--) {
    const c = byIndex.get(i);
    if (c) mult *= c.mult;
    out[i - 1] = points[i - 1][1] * mult;
  }
  const adjustments = kept.map((c) => ({ data: c.date, fator: c.label })).reverse();
  return { closes: out, adjustments };
}

const round = (x) => (x >= 1 ? Math.round(x * 100) / 100 : Math.round(x * 10000) / 10000);
const dayNumber = (d) => Math.round(Date.parse(`${d}T12:00:00Z`) / 86_400_000);

async function main() {
  const years = [];
  for (let y = currentYear - YEARS_BACK; y <= currentYear; y++) years.push(y);
  for (const y of years) {
    const file = await download(y);
    if (!file) {
      log(`ano ${y}: arquivo ainda não publicado`);
      continue;
    }
    log(`lendo ${y}...`);
    await eachLine(file, onLine);
  }

  let latest = "";
  for (const s of series.values()) for (const d of s.keys()) if (d > latest) latest = d;
  if (!latest) throw new Error("nenhuma cotação lida");
  const startDate = new Date(`${latest}T12:00:00Z`);
  startDate.setUTCFullYear(startDate.getUTCFullYear() - YEARS_BACK);
  startDate.setUTCDate(startDate.getUTCDate() - 7);
  const start = startDate.toISOString().slice(0, 10);
  // Só ativos negociados nos últimos 90 dias (ainda listados).
  const recentCut = new Date(Date.parse(`${latest}T12:00:00Z`) - 90 * 86_400_000).toISOString().slice(0, 10);

  TURBULENT = turbulentDays();
  log(`dias de mercado agitado (sem detecção de desdobramento): ${[...TURBULENT].sort().join(", ") || "nenhum"}`);

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });
  let count = 0;
  let adjusted = 0;
  for (const [ticker, s] of series) {
    // Ações (3 a 8), units/FIIs/ETFs (11) e BDRs (31 a 39). Ficam de fora
    // direitos de subscrição e recibos (1, 2, 9, 10, 12 a 15), que vivem poucos dias.
    if (!/^[A-Z0-9]{4}([3-8]|11|3[1-9])$/.test(ticker)) continue;
    const points = [...s].filter(([d]) => d >= start).sort((a, b) => a[0].localeCompare(b[0]));
    if (points.length < 2 || points[points.length - 1][0] < recentCut) continue;
    const { closes, adjustments } = adjustSplits(points);
    if (adjustments.length) adjusted++;
    // Datas como diferença de dias em relação ao ponto anterior (arquivo menor).
    const deltas = points.map(([d], i) => (i === 0 ? 0 : dayNumber(d) - dayNumber(points[i - 1][0])));
    writeFileSync(
      join(OUT_DIR, `${ticker}.json`),
      JSON.stringify({
        fonte: "B3 · Séries Históricas (COTAHIST)",
        inicio: points[0][0],
        ate: points[points.length - 1][0],
        ajustes: adjustments,
        d: deltas,
        c: closes.map(round),
      }),
    );
    count++;
  }
  writeFileSync(join(OUT_DIR, "_info.json"), JSON.stringify({ geradoEm: new Date().toISOString(), ate: latest, ativos: count }));
  log(`${count} ativos gravados (dados até ${latest}; ${adjusted} com desdobramento/grupamento detectado)`);
  log("arquivos:", readdirSync(OUT_DIR).length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
