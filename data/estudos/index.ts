import type { StudyCard } from "@/config/estudos";
import am from "./am";
import brasil from "./brasil";
import carreira from "./carreira";
import comportamental from "./comportamental";
import contabilidade from "./contabilidade";
import dcf from "./dcf";
import er from "./er";
import ev from "./ev";
import lbo from "./lbo";
import ma from "./ma";
import raciocinio from "./raciocinio";
import restructuring from "./restructuring";
import rf from "./rf";
import st from "./st";
import valuation from "./valuation";

/** Todos os cartões da página Estudos. */
export const studyCards: StudyCard[] = [
  ...comportamental,
  ...carreira,
  ...contabilidade,
  ...ev,
  ...valuation,
  ...dcf,
  ...ma,
  ...lbo,
  ...restructuring,
  ...er,
  ...st,
  ...rf,
  ...am,
  ...brasil,
  ...raciocinio,
];
