import type { StudyCard } from "@/config/estudos";

/**
 * Lógica dos flashcards (funções puras, sem tela).
 *
 * Progresso por cartão em "caixas" (sistema Leitner simplificado):
 *  - 0: errou da última vez (prioridade máxima)
 *  - 1: mais ou menos
 *  - 2: acertou uma vez
 *  - 3: acertou duas vezes seguidas ou mais → "dominada"
 * Cartão sem registro = nunca visto.
 *
 * Na sessão: "Errei" volta daqui a 3 cartões, "Mais ou menos" daqui a 8,
 * "Acertei" sai da rodada.
 */

export type Grade = "errei" | "parcial" | "acertei";

export type CardProgress = {
  box: 0 | 1 | 2 | 3;
  /** Quando foi respondido pela última vez (ms); serve para juntar aparelhos. */
  at: number;
  seen: number;
  last: Grade;
};

export type Progress = Record<string, CardProgress>;

export const REINSERT_AFTER: Record<Exclude<Grade, "acertei">, number> = { errei: 3, parcial: 8 };

export function nextProgress(prev: CardProgress | undefined, grade: Grade, now: number): CardProgress {
  const box: CardProgress["box"] =
    grade === "errei" ? 0 : grade === "parcial" ? 1 : (Math.min(3, (prev?.box ?? 1) + 1) as CardProgress["box"]);
  return { box, at: now, seen: (prev?.seen ?? 0) + 1, last: grade };
}

/** Embaralha (Fisher–Yates) com uma função aleatória trocável (para testes). */
export function shuffle<T>(list: T[], random: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Ordem da sessão: primeiro as que errou, depois as "mais ou menos", as nunca
 * vistas, as acertadas uma vez e, por último, as dominadas. Dentro de cada
 * grupo, ordem aleatória. Com `mixAll`, ignora o progresso e embaralha tudo.
 */
export function buildQueue(
  cards: StudyCard[],
  progress: Progress,
  opts: { mixAll?: boolean; random?: () => number } = {},
): string[] {
  const random = opts.random ?? Math.random;
  if (opts.mixAll) return shuffle(cards, random).map((c) => c.id);
  const rank = (c: StudyCard) => {
    const p = progress[c.id];
    if (!p) return 2;
    return p.box === 0 ? 0 : p.box === 1 ? 1 : p.box === 2 ? 3 : 4;
  };
  const groups = new Map<number, StudyCard[]>();
  for (const c of cards) (groups.get(rank(c)) ?? groups.set(rank(c), []).get(rank(c))!).push(c);
  return [0, 1, 2, 3, 4].flatMap((r) => shuffle(groups.get(r) ?? [], random).map((c) => c.id));
}

/** Depois de responder o cartão da frente: tira-o e, se não acertou, recoloca mais adiante. */
export function afterAnswer(queue: string[], grade: Grade): string[] {
  const [current, ...rest] = queue;
  if (current === undefined || grade === "acertei") return rest;
  const pos = Math.min(REINSERT_AFTER[grade], rest.length);
  return [...rest.slice(0, pos), current, ...rest.slice(pos)];
}

/** Junta o progresso de dois aparelhos: por cartão, vale o registro mais recente. */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = { ...a };
  for (const [id, p] of Object.entries(b)) if (!out[id] || p.at > out[id].at) out[id] = p;
  return out;
}

export type AreaStats = { total: number; dominadas: number; revisar: number; novas: number };

export function statsFor(cards: StudyCard[], progress: Progress): AreaStats {
  let dominadas = 0;
  let revisar = 0;
  let novas = 0;
  for (const c of cards) {
    const p = progress[c.id];
    if (!p) novas++;
    else if (p.box >= 2) dominadas++;
    else revisar++;
  }
  return { total: cards.length, dominadas, revisar, novas };
}
