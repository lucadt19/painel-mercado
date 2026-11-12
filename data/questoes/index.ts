import type { Question } from "@/config/questoes";
import contabilidade from "./contabilidade";
import cr from "./cr";
import credito from "./credito";
import dcf from "./dcf";
import di from "./di";
import historia from "./historia";
import ma from "./ma";
import macro from "./macro";
import quant from "./quant";
import rc from "./rc";
import rf from "./rf";
import valuation from "./valuation";

/** Todas as questões das abas "Questões" e "Simulado". */
export const questions: Question[] = [
  ...contabilidade,
  ...valuation,
  ...dcf,
  ...ma,
  ...credito,
  ...rf,
  ...macro,
  ...historia,
  ...quant,
  ...di,
  ...cr,
  ...rc,
];
