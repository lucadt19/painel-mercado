/**
 * Banco de questões de múltipla escolha (abas "Questões" e "Simulado" da
 * página Estudos). As questões ficam em data/questoes/, uma lista por tema.
 *
 * Conteúdo escrito para o projeto. Exemplos enviados pelo dono do site
 * serviram de modelo de estilo e entraram adaptados (redação e números
 * próprios). As de GMAT seguem o formato do GMAT Focus, sem copiar questões
 * oficiais (direitos da GMAC).
 */

export type Exam = "mercado" | "gmat";

export const EXAM_LABEL: Record<Exam, string> = {
  mercado: "Mercado financeiro",
  gmat: "GMAT",
};

export const questionTopics = [
  { id: "contabilidade", exam: "mercado", label: "Contabilidade e DFC" },
  { id: "valuation", exam: "mercado", label: "Valuation e múltiplos" },
  { id: "dcf", exam: "mercado", label: "DCF e custo de capital" },
  { id: "ma", exam: "mercado", label: "M&A e transações" },
  { id: "credito", exam: "mercado", label: "Crédito e dívida corporativa" },
  { id: "rf", exam: "mercado", label: "Renda fixa e matemática financeira" },
  { id: "macro", exam: "mercado", label: "Macroeconomia" },
  { id: "historia", exam: "mercado", label: "História econômica e atualidades" },
  { id: "quant", exam: "gmat", label: "Quantitative Reasoning" },
  { id: "di", exam: "gmat", label: "Data Insights" },
  { id: "cr", exam: "gmat", label: "Critical Reasoning" },
  { id: "rc", exam: "gmat", label: "Reading Comprehension" },
] as const;

export type TopicId = (typeof questionTopics)[number]["id"];

export type Question = {
  /** Único e estável (o progresso é salvo por id). */
  id: string;
  exam: Exam;
  topic: TopicId;
  level: "basico" | "avancado";
  /**
   * Enunciado. Linhas começando com "|" viram uma tabela
   * (ex.: "| Ano | Receita |"); a primeira linha da tabela é o cabeçalho.
   */
  q: string;
  /** 5 alternativas, na ordem A–E. */
  options: [string, string, string, string, string];
  /** Índice da correta (0 = A). */
  answer: 0 | 1 | 2 | 3 | 4;
  /** Gabarito comentado (em português). */
  explanation: string;
};

export const LETTERS = ["A", "B", "C", "D", "E"] as const;

/** Simulado: 1 hora, cerca de 2 minutos por questão. */
export const SIMULADO_MINUTES = 60;
export const SIMULADO_SIZE = 30;
