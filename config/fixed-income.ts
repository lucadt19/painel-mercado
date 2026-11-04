/**
 * Regras do comparador de renda fixa (pessoa física). Conferidas em 04/11/2026:
 * a MP 1.303/2025 (que mudaria a tributação) perdeu a validade; propostas de
 * tributar LCI/LCA seguem em discussão, sem aprovação. Se a lei mudar,
 * atualize aqui.
 */

/** Tabela regressiva de IR sobre o ganho, cobrado no resgate. */
export const IR_BRACKETS: { upToDays: number; rate: number; label: string }[] = [
  { upToDays: 180, rate: 0.225, label: "22,5% (até 180 dias)" },
  { upToDays: 360, rate: 0.2, label: "20% (181 a 360 dias)" },
  { upToDays: 720, rate: 0.175, label: "17,5% (361 a 720 dias)" },
  { upToDays: Infinity, rate: 0.15, label: "15% (acima de 720 dias)" },
];

/** Taxa de custódia da B3 no Tesouro Direto: 0,20% ao ano sobre o saldo. */
export const TESOURO_CUSTODY_RATE = 0.002;
/** No Tesouro Selic, a custódia só incide sobre o que passar deste valor. */
export const TESOURO_SELIC_CUSTODY_EXEMPT = 10_000;

export type RateKind = "pre" | "cdi" | "ipca" | "selic";

export const RATE_KIND_LABEL: Record<RateKind, string> = {
  pre: "Pré-fixado",
  cdi: "% do CDI",
  ipca: "IPCA + taxa",
  selic: "Selic + taxa",
};

export type ProductId =
  | "cdb"
  | "lc"
  | "lci"
  | "lca"
  | "cri"
  | "cra"
  | "debenture"
  | "debenture-incentivada"
  | "tesouro-selic"
  | "tesouro-prefixado"
  | "tesouro-ipca";

export type Product = {
  id: ProductId;
  label: string;
  /** Isento de IR para pessoa física. */
  exempt: boolean;
  /** Formas de rentabilidade possíveis para o produto. */
  kinds: RateKind[];
  /** Taxa de custódia da B3 (títulos do Tesouro). */
  custody?: "tesouro" | "tesouro-selic";
};

export const PRODUCTS: Product[] = [
  { id: "cdb", label: "CDB", exempt: false, kinds: ["cdi", "pre", "ipca"] },
  { id: "lc", label: "LC (Letra de Câmbio)", exempt: false, kinds: ["cdi", "pre", "ipca"] },
  { id: "lci", label: "LCI", exempt: true, kinds: ["cdi", "pre", "ipca"] },
  { id: "lca", label: "LCA", exempt: true, kinds: ["cdi", "pre", "ipca"] },
  { id: "cri", label: "CRI", exempt: true, kinds: ["ipca", "cdi", "pre"] },
  { id: "cra", label: "CRA", exempt: true, kinds: ["ipca", "cdi", "pre"] },
  { id: "debenture", label: "Debênture", exempt: false, kinds: ["ipca", "cdi", "pre"] },
  { id: "debenture-incentivada", label: "Debênture incentivada", exempt: true, kinds: ["ipca", "cdi", "pre"] },
  { id: "tesouro-selic", label: "Tesouro Selic", exempt: false, kinds: ["selic"], custody: "tesouro-selic" },
  { id: "tesouro-prefixado", label: "Tesouro Prefixado", exempt: false, kinds: ["pre"], custody: "tesouro" },
  { id: "tesouro-ipca", label: "Tesouro IPCA+", exempt: false, kinds: ["ipca"], custody: "tesouro" },
];

export const productById = (id: ProductId) => PRODUCTS.find((p) => p.id === id)!;
