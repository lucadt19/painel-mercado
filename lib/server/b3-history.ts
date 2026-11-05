import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PricePoint } from "@/lib/types";

/**
 * Histórico longo de preços da B3 (arquivos oficiais COTAHIST), gerado por
 * scripts/b3-historico.mjs em data/b3-historico/ (atualizado todo mês pelo
 * GitHub Actions). Os últimos meses continuam vindo da brapi; aqui juntamos
 * as duas fontes numa série só.
 */

type B3File = {
  fonte: string;
  inicio: string;
  ate: string;
  ajustes: { data: string; fator: string }[];
  /** Dias desde o ponto anterior (o primeiro é 0). */
  d: number[];
  c: number[];
};

export type B3History = { points: PricePoint[]; until: string; adjustments: B3File["ajustes"] };

const DIR = path.join(process.cwd(), "data", "b3-historico");

/** Histórico da B3 de um ticker, ou null se não houver (índices, ações dos EUA). */
export async function loadB3History(ticker: string): Promise<B3History | null> {
  if (!/^[A-Z0-9]{4,11}$/.test(ticker)) return null;
  let file: B3File;
  try {
    file = JSON.parse(await readFile(path.join(DIR, `${ticker}.json`), "utf8")) as B3File;
  } catch {
    return null;
  }
  const points: PricePoint[] = [];
  let day = Date.parse(`${file.inicio}T12:00:00Z`);
  for (let i = 0; i < file.d.length; i++) {
    day += file.d[i] * 86_400_000;
    points.push({ date: new Date(day).toISOString().slice(0, 10), close: file.c[i] });
  }
  return { points, until: file.ate, adjustments: file.ajustes };
}

/**
 * Junta a B3 (período antigo) com a brapi (meses recentes). No primeiro dia
 * que as duas têm em comum, se os preços diferirem mais de 2% (por exemplo,
 * um desdobramento recente que a brapi já ajustou), a parte da B3 é escalada
 * para encaixar na da brapi.
 */
export function mergeHistory(b3: B3History | null, recent: PricePoint[]): { history: PricePoint[]; b3Until: string | null } {
  if (!b3 || !b3.points.length) return { history: recent, b3Until: null };
  if (!recent.length) return { history: b3.points, b3Until: b3.until };

  const first = recent[0];
  const overlap = b3.points.find((p) => p.date === first.date);
  const ratio = overlap ? first.close / overlap.close : 1;
  const scale = Math.abs(ratio - 1) > 0.02 ? ratio : 1;

  const older = b3.points
    .filter((p) => p.date < first.date)
    .map((p) => (scale === 1 ? p : { date: p.date, close: Math.round(p.close * scale * 10000) / 10000 }));
  return { history: [...older, ...recent], b3Until: older.at(-1)?.date ?? null };
}

/** Fechamento mais recente até `day` (AAAA-MM-DD). */
export function closeOnOrBefore(points: PricePoint[], day: string): PricePoint | undefined {
  let found: PricePoint | undefined;
  for (const p of points) {
    if (p.date > day) break;
    found = p;
  }
  return found;
}
