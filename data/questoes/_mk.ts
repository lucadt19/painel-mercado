import { questionTopics, type Question, type TopicId } from "@/config/questoes";

type Row = {
  /** b = básico, a = avançado */
  l: "b" | "a";
  q: string;
  o: [string, string, string, string, string];
  /** Letra da correta, como escrita. */
  c: "A" | "B" | "C" | "D" | "E";
  e: string;
  /** Alternativas com ordem fixa (ex.: Data Sufficiency): não troca a letra. */
  fixed?: boolean;
};

const LETTERS = "ABCDE";

/** Linhas que começam citando alternativas: "B) ...", "C) e D) ...", "B), D) e E) ...". */
const LINE_REFS = /(^|\n)((?:[A-E]\)(?:,? e |, )?)+)/g;
/** Citações entre parênteses: "(C)" ou "(A, D, E)". */
const PAREN_REFS = /\(([A-E](?:, ?[A-E])*)\)/g;

/** Letras citadas fora desses formatos (podem ser o artigo "A" ou citações soltas). */
function looseLetters(e: string): Set<string> {
  const rest = e.replace(LINE_REFS, "$1").replace(PAREN_REFS, "");
  return new Set([...rest.matchAll(/(?:^|[^\p{L}])([A-E])(?=[^\p{L}]|$)/gu)].map((m) => m[1]));
}

function swapIn(row: Row, from: number, target: number): Row {
  const a = LETTERS[from];
  const b = LETTERS[target];
  const swap = (l: string) => (l === a ? b : l === b ? a : l);
  const o = [...row.o] as Row["o"];
  [o[from], o[target]] = [o[target], o[from]];
  const lines = row.e
    .replace(LINE_REFS, (_m, pre: string, refs: string) => pre + refs.replace(/[A-E]/g, swap))
    .replace(PAREN_REFS, (_m, refs: string) => `(${refs.replace(/[A-E]/g, swap)})`)
    .split("\n");
  // Linhas "X) ..." de volta em ordem alfabética, depois do texto principal.
  const head = lines.filter((l) => !/^[A-E]\)/.test(l));
  const refs = lines.filter((l) => /^[A-E]\)/.test(l)).sort();
  return { ...row, o, c: b as Row["c"], e: [...head, ...refs].join("\n") };
}

/**
 * Para a letra certa não se concentrar em B e C, cada questão vai para a
 * letra menos usada até ali no tema, trocando de lugar com a alternativa que
 * estava nela. As letras citadas na explicação são trocadas junto. Se a
 * explicação citar uma das duas letras de forma ambígua (no meio do texto),
 * aquela troca é evitada.
 */
function balance(rows: Row[]): Row[] {
  const count = [0, 0, 0, 0, 0];
  return rows.map((row, i) => {
    const from = LETTERS.indexOf(row.c);
    if (row.fixed) {
      count[from]++;
      return row;
    }
    const loose = looseLetters(row.e);
    const candidates = [0, 1, 2, 3, 4]
      .filter((t) => t === from || (!loose.has(LETTERS[from]) && !loose.has(LETTERS[t])))
      .sort((x, y) => count[x] - count[y] || ((x - i + 50) % 5) - ((y - i + 50) % 5));
    const target = candidates[0];
    count[target]++;
    return target === from ? row : swapIn(row, from, target);
  });
}

/**
 * Monta as questões de um tema. O id é "tema-número": para não perder o
 * progresso salvo, acrescente questões novas SEMPRE NO FIM da lista.
 * Questões marcadas com `fixed` (Data Sufficiency) mantêm a ordem das alternativas.
 */
export function mkq(topic: TopicId, rows: Row[]): Question[] {
  const exam = questionTopics.find((t) => t.id === topic)!.exam;
  const final = balance(rows);
  return final.map((r, i) => ({
    id: `q-${topic}-${String(i + 1).padStart(3, "0")}`,
    exam,
    topic,
    level: r.l === "b" ? "basico" : "avancado",
    q: r.q.trim(),
    options: r.o,
    answer: LETTERS.indexOf(r.c) as Question["answer"],
    explanation: r.e.trim(),
  }));
}
