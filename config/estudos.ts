/**
 * Áreas da página Estudos (flashcards para entrevistas do mercado
 * financeiro). As perguntas ficam em data/estudos/, uma lista por área.
 *
 * Conteúdo escrito para o projeto: os temas seguem o que cai em entrevistas
 * (inclusive os do guia "400 Investment Banking Interview Questions", usado
 * só como referência de temas e nível, sem copiar o texto, que tem direitos
 * reservados), mais o mercado brasileiro.
 */

export type StudyLevel = "basico" | "avancado";

export type StudyCard = {
  /** Único e estável (o progresso é salvo por id). */
  id: string;
  area: StudyAreaId;
  level: StudyLevel;
  q: string;
  /** Resposta: texto curto; linhas começando com "- " viram tópicos. */
  a: string;
};

export const studyAreas = [
  { id: "comportamental", label: "Fit e comportamentais", short: "Fit" },
  { id: "carreira", label: "Entendendo o mercado e a carreira", short: "Carreira" },
  { id: "contabilidade", label: "Contabilidade", short: "Contabilidade" },
  { id: "ev", label: "Enterprise value e equity value", short: "EV / Equity" },
  { id: "valuation", label: "Valuation (múltiplos)", short: "Valuation" },
  { id: "dcf", label: "Fluxo de caixa descontado (DCF)", short: "DCF" },
  { id: "ma", label: "M&A e merger model", short: "M&A" },
  { id: "lbo", label: "LBO e private equity", short: "LBO / PE" },
  { id: "restructuring", label: "Restructuring e distressed", short: "Restructuring" },
  { id: "er", label: "Equity research e ações", short: "Equity research" },
  { id: "st", label: "Sales & trading, mercados e derivativos", short: "S&T" },
  { id: "rf", label: "Renda fixa e crédito", short: "Renda fixa" },
  { id: "am", label: "Asset management e portfólio", short: "Asset mgmt" },
  { id: "brasil", label: "Mercado brasileiro", short: "Brasil" },
  { id: "raciocinio", label: "Brain teasers e contas de cabeça", short: "Brain teasers" },
] as const;

export type StudyAreaId = (typeof studyAreas)[number]["id"];

export const LEVEL_LABEL: Record<StudyLevel, string> = { basico: "Básico", avancado: "Avançado" };
