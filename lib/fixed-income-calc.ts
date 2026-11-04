import {
  IR_BRACKETS,
  productById,
  TESOURO_CUSTODY_RATE,
  TESOURO_SELIC_CUSTODY_EXEMPT,
  type ProductId,
  type RateKind,
} from "@/config/fixed-income";

/**
 * Contas do comparador de renda fixa. Funções puras (sem tela), para poder
 * testar à parte.
 *
 * Premissas: CDI, IPCA e Selic constantes no período; título sem cupom
 * (juros só no vencimento); IR no resgate, pela tabela regressiva; IOF fora
 * (só existe em resgates com menos de 30 dias).
 */

export type Investment = {
  product: ProductId;
  kind: RateKind;
  /** Taxa digitada: % a.a. (pré, IPCA+, Selic+) ou % do CDI. */
  rate: number;
  months: number;
};

/** Taxas de referência, em % ao ano. */
export type BaseRates = { cdi: number; ipca: number; selic: number };

/** Taxa bruta efetiva ao ano (fração; 0,1365 = 13,65%). */
export function grossAnnualRate(kind: RateKind, rate: number, base: BaseRates): number {
  const r = rate / 100;
  switch (kind) {
    case "pre":
      return r;
    case "cdi": {
      // % do CDI incide sobre o CDI diário (252 dias úteis), como os bancos calculam.
      const daily = Math.pow(1 + base.cdi / 100, 1 / 252) - 1;
      return Math.pow(1 + r * daily, 252) - 1;
    }
    case "ipca":
      return (1 + base.ipca / 100) * (1 + r) - 1;
    case "selic":
      return (1 + base.selic / 100) * (1 + r) - 1;
  }
}

export function irBracket(days: number) {
  return IR_BRACKETS.find((b) => days <= b.upToDays)!;
}

export type Snapshot = {
  month: number;
  days: number;
  gross: number;
  custody: number;
  irRate: number;
  ir: number;
  net: number;
  /** Rentabilidade líquida acumulada (fração). */
  netReturn: number;
  /** Rentabilidade líquida anualizada (fração). */
  netAnnual: number;
};

/**
 * Simula mês a mês e devolve o resultado de um resgate em cada mês
 * (o IR depende de quanto tempo o dinheiro ficou aplicado).
 */
export function simulate(inv: Investment, base: BaseRates, amount: number): Snapshot[] {
  const product = productById(inv.product);
  const monthly = Math.pow(1 + grossAnnualRate(inv.kind, inv.rate, base), 1 / 12);
  const months = Math.max(1, Math.round(inv.months));
  const out: Snapshot[] = [];
  let custody = 0;

  for (let m = 1; m <= months; m++) {
    const gross = amount * Math.pow(monthly, m);
    // Custódia da B3 (Tesouro): 0,20% a.a. sobre o saldo, cobrada aos poucos.
    if (product.custody) {
      const exempt = product.custody === "tesouro-selic" ? TESOURO_SELIC_CUSTODY_EXEMPT : 0;
      custody += (Math.max(0, gross - exempt) * TESOURO_CUSTODY_RATE) / 12;
    }
    const days = Math.round((m * 365) / 12);
    const bracket = irBracket(days);
    // IR sobre o ganho, já descontada a custódia paga.
    const gain = Math.max(0, gross - amount - custody);
    const irRate = product.exempt ? 0 : bracket.rate;
    const ir = gain * irRate;
    const net = gross - custody - ir;
    out.push({
      month: m,
      days,
      gross,
      custody,
      irRate,
      ir,
      net,
      netReturn: net / amount - 1,
      netAnnual: Math.pow(net / amount, 12 / m) - 1,
    });
  }
  return out;
}

/** Linhas da tabela "ano a ano": fim de cada ano e o mês final, se não for ano cheio. */
export function yearlyRows(snapshots: Snapshot[]): Snapshot[] {
  const rows = snapshots.filter((s) => s.month % 12 === 0);
  const last = snapshots[snapshots.length - 1];
  if (last && last.month % 12 !== 0) rows.push(last);
  return rows;
}

/**
 * Que taxa o investimento `other` precisaria pagar para terminar com o mesmo
 * valor líquido que `target` (mesmo prazo e valor)? Busca binária na taxa.
 */
export function equivalentRate(
  targetNet: number,
  other: Investment,
  base: BaseRates,
  amount: number,
): number | null {
  const netAt = (rate: number) => {
    const s = simulate({ ...other, rate }, base, amount);
    return s[s.length - 1].net;
  };
  let lo = 0;
  let hi = other.kind === "cdi" ? 400 : 100;
  if (netAt(hi) < targetNet || netAt(lo) > targetNet) return null;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (netAt(mid) < targetNet) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
