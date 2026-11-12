import type { Exam, Question, TopicId } from "@/config/questoes";

/**
 * Lógica das questões de múltipla escolha (funções puras, sem tela):
 * fila do treino, montagem do simulado, correção e junção de aparelhos.
 */

export type AnswerRecord = {
  /** Última vez que respondeu (ms). */
  at: number;
  tries: number;
  hits: number;
  /** Acertou da última vez? */
  last: boolean;
};

export type SimuladoKind = Exam | "misto";

export type SimuladoResult = {
  id: string;
  kind: SimuladoKind;
  startedAt: number;
  finishedAt: number;
  /** Duração permitida (ms). */
  limitMs: number;
  qids: string[];
  /** Alternativa escolhida em cada questão (null = em branco). */
  chosen: (number | null)[];
  correct: number;
};

export type QuizProgress = {
  answers: Record<string, AnswerRecord>;
  simulados: SimuladoResult[];
};

export const emptyProgress = (): QuizProgress => ({ answers: {}, simulados: [] });

export function recordAnswer(prev: AnswerRecord | undefined, correct: boolean, now: number): AnswerRecord {
  return {
    at: now,
    tries: (prev?.tries ?? 0) + 1,
    hits: (prev?.hits ?? 0) + (correct ? 1 : 0),
    last: correct,
  };
}

export function shuffle<T>(list: T[], random: () => number = Math.random): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Treino: primeiro as que errou da última vez, depois as nunca feitas, por fim as acertadas. */
export function practiceQueue(
  pool: Question[],
  answers: Record<string, AnswerRecord>,
  opts: { mixAll?: boolean; random?: () => number } = {},
): string[] {
  const random = opts.random ?? Math.random;
  if (opts.mixAll) return shuffle(pool, random).map((q) => q.id);
  const rank = (q: Question) => (!answers[q.id] ? 1 : answers[q.id].last ? 2 : 0);
  return [0, 1, 2].flatMap((r) =>
    shuffle(
      pool.filter((q) => rank(q) === r),
      random,
    ).map((q) => q.id),
  );
}

/** Errou no treino: a questão volta daqui a 5 questões. */
export const PRACTICE_REINSERT = 5;

export function afterPractice(queue: string[], correct: boolean): string[] {
  const [current, ...rest] = queue;
  if (current === undefined || correct) return rest;
  const pos = Math.min(PRACTICE_REINSERT, rest.length);
  return [...rest.slice(0, pos), current, ...rest.slice(pos)];
}

/** Quantas questões de cada tema entram num simulado de GMAT (proporção parecida com a prova). */
const GMAT_MIX: Partial<Record<TopicId, number>> = { quant: 10, di: 7, cr: 8, rc: 5 };

/**
 * Sorteia as questões do simulado. Dentro de cada tema, prefere as que você
 * ainda não fez (ou fez menos vezes), para os simulados não se repetirem.
 * Mercado: proporcional ao tamanho de cada tema. Misto: metade de cada.
 */
export function buildSimulado(
  kind: SimuladoKind,
  all: Question[],
  answers: Record<string, AnswerRecord>,
  size: number,
  random: () => number = Math.random,
): string[] {
  const pick = (pool: Question[], n: number) =>
    shuffle(pool, random)
      .sort((a, b) => (answers[a.id]?.tries ?? 0) - (answers[b.id]?.tries ?? 0))
      .slice(0, n);

  const byTopic = (exam: Exam) => {
    const topics = [...new Set(all.filter((q) => q.exam === exam).map((q) => q.topic))];
    return topics.map((t) => all.filter((q) => q.topic === t));
  };

  const proportional = (exam: Exam, n: number): Question[] => {
    const groups = byTopic(exam);
    const total = groups.reduce((s, g) => s + g.length, 0);
    const out: Question[] = [];
    // Distribui pelo tamanho de cada tema; as sobras vão para os maiores restos.
    const quotas = groups.map((g) => (g.length / total) * n);
    const base = quotas.map(Math.floor);
    let rest = n - base.reduce((s, x) => s + x, 0);
    const order = quotas.map((q, i) => [q - Math.floor(q), i] as const).sort((a, b) => b[0] - a[0]);
    for (const [, i] of order) if (rest-- > 0) base[i]++;
    groups.forEach((g, i) => out.push(...pick(g, base[i])));
    return out;
  };

  const gmat = (n: number): Question[] => {
    const totalMix = Object.values(GMAT_MIX).reduce((s, x) => s + (x ?? 0), 0);
    const out: Question[] = [];
    for (const [topic, k] of Object.entries(GMAT_MIX)) {
      const quota = Math.round(((k ?? 0) / totalMix) * n);
      out.push(...pick(all.filter((q) => q.topic === topic), quota));
    }
    return out.slice(0, n);
  };

  const chosen =
    kind === "mercado"
      ? proportional("mercado", size)
      : kind === "gmat"
        ? gmat(size)
        : [...proportional("mercado", Math.ceil(size / 2)), ...gmat(Math.floor(size / 2))];
  // Ordem final aleatória (temas misturados, como numa prova).
  return shuffle(chosen, random).map((q) => q.id);
}

export function score(qids: string[], chosen: (number | null)[], byId: Map<string, Question>): number {
  return qids.reduce((s, id, i) => s + (chosen[i] === byId.get(id)?.answer ? 1 : 0), 0);
}

/** Junta dois aparelhos: respostas pelo registro mais recente; simulados pela união (sem repetir). */
export function mergeQuiz(a: QuizProgress, b: QuizProgress): QuizProgress {
  const answers = { ...a.answers };
  for (const [id, r] of Object.entries(b.answers)) if (!answers[id] || r.at > answers[id].at) answers[id] = r;
  const seen = new Set(a.simulados.map((s) => s.id));
  const simulados = [...a.simulados, ...b.simulados.filter((s) => !seen.has(s.id))]
    .sort((x, y) => y.finishedAt - x.finishedAt)
    .slice(0, 100);
  return { answers, simulados };
}
