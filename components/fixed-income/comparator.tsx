"use client";

import { useId, useMemo, useState } from "react";
import { CalendarDays, TrendingUp } from "lucide-react";
import {
  PRODUCTS,
  productById,
  RATE_KIND_LABEL,
  type ProductId,
  type RateKind,
} from "@/config/fixed-income";
import { useMacro } from "@/hooks/use-market-data";
import {
  equivalentRate,
  simulate,
  yearlyRows,
  type BaseRates,
  type Investment,
  type Snapshot,
} from "@/lib/fixed-income-calc";
import { formatBRL, formatMacroDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, SectionTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { ChartLegend, SeriesChart, type ChartSeries } from "@/components/charts/series-chart";

// ---------- Formulário ----------

type FormState = { product: ProductId; kind: RateKind; rate: string; months: string };

/** Taxa sugerida ao trocar a forma de rentabilidade. */
const DEFAULT_RATE: Record<RateKind, string> = { cdi: "100", pre: "13", ipca: "7", selic: "0,1" };

/**
 * Valor em reais digitado: "10.000", "10.000,50", "10000,50" e "10000.50".
 * Ponto é separador de milhar quando vem com vírgula ou em grupos de 3
 * dígitos ("10.000"); senão é a vírgula decimal digitada como ponto ("10.5").
 * Vazio ou inválido vira NaN.
 */
function parseNum(raw: string): number {
  const s = raw.trim();
  if (!s) return NaN;
  if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
  return Number(s);
}
const parseRate = (s: string) => Number(s.trim().replace(",", "."));

const inputCls =
  "w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm tabular-nums text-text focus:border-accent";
const labelCls = "mb-1 block text-xs text-muted";

/** "112,30% do CDI", "13,40% a.a.", "IPCA + 7,90%", "Selic + 0,10%". */
function rateText(kind: RateKind, rate: number) {
  const r = `${formatNumber(rate)}%`;
  if (kind === "cdi") return `${r} do CDI`;
  if (kind === "ipca") return `IPCA + ${r}`;
  if (kind === "selic") return `Selic + ${r}`;
  return `${r} a.a.`;
}

const pct = (frac: number) => `${formatNumber(frac * 100)}%`;

function InvestmentForm({
  title,
  value,
  onChange,
}: {
  title: string;
  value: FormState;
  onChange: (v: FormState) => void;
}) {
  const id = useId();
  const product = productById(value.product);
  const rateHint =
    value.kind === "cdi" ? "% do CDI (ex.: 110)" : value.kind === "pre" ? "% ao ano" : "% ao ano, além do indexador";

  return (
    <Card className="flex flex-col gap-4 p-4">
      <h2 className="text-sm font-medium">{title}</h2>

      <div>
        <label htmlFor={`${id}-tipo`} className={labelCls}>
          Tipo de investimento
        </label>
        <select
          id={`${id}-tipo`}
          value={value.product}
          onChange={(e) => {
            const p = productById(e.target.value as ProductId);
            const kind = p.kinds.includes(value.kind) ? value.kind : p.kinds[0];
            onChange({ ...value, product: p.id, kind, rate: kind === value.kind ? value.rate : DEFAULT_RATE[kind] });
          }}
          className={inputCls}
        >
          {PRODUCTS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
              {p.exempt ? " (isento de IR)" : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className={labelCls}>A rentabilidade está em</span>
        <Segmented
          label={`Forma de rentabilidade — ${title}`}
          value={value.kind}
          onChange={(kind) => onChange({ ...value, kind, rate: DEFAULT_RATE[kind] })}
          options={product.kinds.map((k) => ({ value: k, label: RATE_KIND_LABEL[k] }))}
          className="w-fit"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`${id}-taxa`} className={labelCls}>
            Rentabilidade ({rateHint})
          </label>
          <input
            id={`${id}-taxa`}
            inputMode="decimal"
            value={value.rate}
            onChange={(e) => onChange({ ...value, rate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${id}-prazo`} className={labelCls}>
            Prazo (meses)
          </label>
          <input
            id={`${id}-prazo`}
            inputMode="numeric"
            value={value.months}
            onChange={(e) => onChange({ ...value, months: e.target.value.replace(/[^0-9]/g, "") })}
            className={inputCls}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        {product.exempt ? "Isento de imposto de renda para pessoa física." : "IR pela tabela regressiva, cobrado no resgate."}
        {product.custody === "tesouro" && " Taxa de custódia da B3: 0,20% ao ano."}
        {product.custody === "tesouro-selic" && " Custódia da B3: 0,20% ao ano sobre o que passar de R$ 10 mil."}
      </p>
    </Card>
  );
}

// ---------- Resultado ----------

/** Faixa do IR pelo prazo, no nome usado pelas corretoras. */
function termLabel(days: number) {
  if (days <= 180) return "Curto prazo (até 180 dias)";
  if (days <= 360) return "181 a 360 dias";
  if (days <= 720) return "361 a 720 dias";
  return "Longo prazo (acima de 720 dias)";
}

/** Resumo de um investimento no resgate final: rentabilidade líquida ao ano, prazo e IR. */
function SummaryCard({
  tag,
  form,
  end,
  best,
}: {
  tag: string;
  form: FormState;
  end: Snapshot;
  best: boolean;
}) {
  const product = productById(form.product);
  return (
    <Card className={cn("flex flex-col gap-3 p-4", best && "border-accent")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted">Investimento {tag}</p>
          <h3 className="text-base font-semibold">{product.label}</h3>
          <p className="text-xs text-muted">{rateText(form.kind, parseRate(form.rate))}</p>
        </div>
        {best && (
          <span className="rounded bg-accent-soft px-1.5 py-px text-xs font-medium text-accent">Rende mais</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TrendingUp aria-hidden className="size-4 text-muted" />
        <span className="text-sm text-muted">Rentabilidade líquida</span>
        <span className="ml-auto text-xl font-semibold tabular-nums">
          {pct(end.netAnnual)} <span className="text-xs font-normal text-muted">a.a.</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <CalendarDays aria-hidden className="size-4 text-muted" />
        <span className="text-sm text-muted">Período</span>
        <span className="ml-auto text-sm font-medium tabular-nums">
          {end.month} {end.month === 1 ? "mês" : "meses"}
        </span>
      </div>

      <span className="w-fit rounded-full border border-border-strong px-2 py-0.5 text-xs">{termLabel(end.days)}</span>

      <div className="rounded-md bg-surface-hover px-3 py-2 text-sm">
        {end.irRate === 0 ? (
          "Este investimento é isento de Imposto de Renda."
        ) : (
          <>
            Alíquota do IR: <strong className="font-semibold tabular-nums">{formatNumber(end.irRate * 100)}%</strong>
            <span className="text-muted"> sobre o ganho ({formatBRL(end.ir)})</span>
          </>
        )}
        {end.custody > 0.005 && (
          <span className="block text-xs text-muted">Custódia da B3 no período: {formatBRL(end.custody)}</span>
        )}
      </div>

      <p className="text-xs text-muted">
        Valor líquido no resgate: <span className="font-medium tabular-nums text-text">{formatBRL(end.net)}</span>
      </p>
    </Card>
  );
}

function ResultTable({ title, rows, amount }: { title: string; rows: Snapshot[]; amount: number }) {
  const hasCustody = rows.some((r) => r.custody > 0.005);
  const th = "px-3 py-2 text-xs font-medium text-muted text-right";
  const td = "px-3 py-2 text-right tabular-nums whitespace-nowrap";
  return (
    <section>
      <SectionTitle aside={`investimento de ${formatBRL(amount)}`}>{title}</SectionTitle>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>
              <th className={cn(th, "text-left")}>Resgate em</th>
              <th className={th}>Bruto</th>
              <th className={th}>IR</th>
              {hasCustody && <th className={th}>Custódia</th>}
              <th className={th}>Líquido</th>
              <th className={th}>Rent. líquida</th>
              <th className={th}>Ao ano</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.month} className="hover:bg-surface-hover">
                <td className={cn(td, "text-left")}>
                  {r.month % 12 === 0 ? `${r.month / 12}º ano` : `${r.month} meses`}
                </td>
                <td className={td}>{formatBRL(r.gross)}</td>
                <td className={td}>
                  {r.irRate === 0 ? (
                    <span className="text-muted">isento</span>
                  ) : (
                    <>
                      {formatBRL(r.ir)} <span className="text-xs text-muted">({formatNumber(r.irRate * 100)}%)</span>
                    </>
                  )}
                </td>
                {hasCustody && <td className={td}>{formatBRL(r.custody)}</td>}
                <td className={cn(td, "font-medium")}>{formatBRL(r.net)}</td>
                <td className={td}>{pct(r.netReturn)}</td>
                <td className={td}>{pct(r.netAnnual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}

/** Formulário -> investimento; null se a taxa ou o prazo forem inválidos. */
function toInvestment(f: FormState): Investment | null {
  const rate = parseRate(f.rate);
  const months = Number(f.months);
  if (!Number.isFinite(rate) || rate < 0 || !Number.isInteger(months) || months < 1 || months > 600) return null;
  return { product: f.product, kind: f.kind, rate, months };
}

const labelOf = (f: FormState) => `${productById(f.product).label} ${rateText(f.kind, parseRate(f.rate))}`;

export function Comparator() {
  const macro = useMacro();
  const [a, setA] = useState<FormState>({ product: "cdb", kind: "cdi", rate: "110", months: "24" });
  const [b, setB] = useState<FormState>({ product: "lca", kind: "cdi", rate: "90", months: "24" });
  const [amountText, setAmountText] = useState("10.000");
  // Premissas editáveis; vazio = usa o valor atual do Banco Central.
  const [overrides, setOverrides] = useState<Record<keyof BaseRates, string>>({ cdi: "", ipca: "", selic: "" });

  const live = useMemo(() => {
    const get = (id: string) => {
      const it = macro.data?.items.find((i) => i.id === id);
      return it && it.ok ? it.indicator : undefined;
    };
    const meta = get("selicMeta");
    return {
      cdi: get("cdi"),
      ipca: get("ipca12m"),
      // O Tesouro Selic rende a Selic efetiva (over), que fica ~0,10 ponto abaixo da meta.
      selic: meta ? { ...meta, value: Math.round((meta.value - 0.1) * 100) / 100 } : undefined,
      selicMeta: meta,
    };
  }, [macro.data]);

  const base: BaseRates | null = useMemo(() => {
    const pick = (k: keyof BaseRates) => {
      const typed = parseRate(overrides[k]);
      return overrides[k].trim() && Number.isFinite(typed) ? typed : live[k]?.value;
    };
    const cdi = pick("cdi");
    const ipca = pick("ipca");
    const selic = pick("selic");
    return cdi !== undefined && ipca !== undefined && selic !== undefined ? { cdi, ipca, selic } : null;
  }, [overrides, live]);

  const amount = parseNum(amountText);

  // Memorizados: só mudam quando o formulário muda (não a cada atualização da tela).
  const invA = useMemo(() => toInvestment(a), [a]);
  const invB = useMemo(() => toInvestment(b), [b]);
  const ready = !!(base && invA && invB && Number.isFinite(amount) && amount > 0);

  const result = useMemo(() => {
    if (!base || !invA || !invB || !ready) return null;
    const simA = simulate(invA, base, amount);
    const simB = simulate(invB, base, amount);
    const endA = simA[simA.length - 1];
    const endB = simB[simB.length - 1];
    const samePeriod = invA.months === invB.months;
    // Mesmo prazo: compara o valor final. Prazos diferentes: a rentabilidade líquida ao ano.
    const aWins = samePeriod ? endA.net >= endB.net : endA.netAnnual >= endB.netAnnual;
    const [winner, loser] = aWins ? ([a, b] as const) : ([b, a] as const);
    const [winEnd, loseEnd] = aWins ? [endA, endB] : [endB, endA];
    const loserInv = aWins ? invB : invA;
    const eq = samePeriod ? equivalentRate(winEnd.net, loserInv, base, amount) : null;
    return { simA, simB, samePeriod, winner, loser, winEnd, loseEnd, loserInv, eq };
  }, [ready, invA, invB, base, amount, a, b]);

  // O gráfico precisa de datas: contamos os meses a partir da data dos dados do BC
  // (não do relógio), para a página poder ser pré-renderizada.
  const series = useMemo<ChartSeries[]>(() => {
    if (!result || !macro.data) return [];
    const start = new Date(macro.data.generatedAt);
    const dateAt = (m: number) => {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + m, 1));
      return d.toISOString().slice(0, 10);
    };
    const pts = (sim: Snapshot[]) => [
      { date: dateAt(0), value: amount },
      ...sim.map((s) => ({ date: dateAt(s.month), value: s.net })),
    ];
    return [
      { id: "a", label: `A: ${labelOf(a)}`, color: "accent", points: pts(result.simA) },
      { id: "b", label: `B: ${labelOf(b)}`, color: "text", dashed: true, points: pts(result.simB) },
    ];
  }, [result, macro.data, amount, a, b]);

  const baseFields: { key: keyof BaseRates; label: string; info?: string }[] = [
    { key: "cdi", label: "CDI (% a.a.)", info: live.cdi && formatMacroDate(live.cdi.referenceDate, live.cdi.dateKind) },
    { key: "ipca", label: "IPCA (% a.a.)", info: live.ipca && `12 meses, ${formatMacroDate(live.ipca.referenceDate, live.ipca.dateKind)}` },
    {
      key: "selic",
      label: "Selic efetiva (% a.a.)",
      info: live.selicMeta && `meta de ${formatNumber(live.selicMeta.value)}% − 0,10`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 md:grid-cols-2">
        <InvestmentForm title="Investimento A" value={a} onChange={setA} />
        <InvestmentForm title="Investimento B (comparar com)" value={b} onChange={setB} />
      </div>

      <Card className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="valor-investido" className={labelCls}>
            Valor investido (R$)
          </label>
          <input
            id="valor-investido"
            inputMode="decimal"
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            className={inputCls}
          />
        </div>
        {baseFields.map((f) => (
          <div key={f.key}>
            <label htmlFor={`base-${f.key}`} className={labelCls}>
              {f.label}
            </label>
            <input
              id={`base-${f.key}`}
              inputMode="decimal"
              placeholder={live[f.key] ? formatNumber(live[f.key]!.value) : "carregando…"}
              value={overrides[f.key]}
              onChange={(e) => setOverrides((o) => ({ ...o, [f.key]: e.target.value }))}
              className={cn(inputCls, "placeholder:text-text")}
            />
            <p className="mt-1 text-xs text-muted">
              {overrides[f.key].trim() ? "valor digitado por você" : f.info ? `atual, ${f.info} · Banco Central` : ""}
            </p>
          </div>
        ))}
      </Card>

      {!ready ? (
        <Card className="p-6 text-center text-sm text-muted">
          {!base
            ? "Carregando CDI, IPCA e Selic do Banco Central…"
            : "Preencha taxa, prazo (1 a 600 meses) e valor investido para ver o resultado."}
        </Card>
      ) : (
        result && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <SummaryCard tag="A" form={a} end={result.simA[result.simA.length - 1]} best={result.winner === a} />
              <SummaryCard tag="B" form={b} end={result.simB[result.simB.length - 1]} best={result.winner === b} />
            </div>

            <Card className="flex flex-col gap-2 p-4">
              <p className="text-base">
                <strong className="font-semibold">{labelOf(result.winner)}</strong> rende mais
                {result.samePeriod ? (
                  <>
                    : <strong className="font-semibold">{formatBRL(result.winEnd.net - result.loseEnd.net)}</strong> a mais
                    em {result.winEnd.month} meses ({formatBRL(result.winEnd.net)} contra {formatBRL(result.loseEnd.net)},
                    líquidos).
                  </>
                ) : (
                  <>
                    : {pct(result.winEnd.netAnnual)} ao ano líquidos, contra {pct(result.loseEnd.netAnnual)} de{" "}
                    {labelOf(result.loser)}. Os prazos são diferentes, então a comparação usa a rentabilidade ao ano.
                  </>
                )}
              </p>
              {result.eq !== null && (
                <p className="text-sm text-muted">
                  Para empatar, {productById(result.loserInv.product).label} precisaria pagar{" "}
                  <strong className="font-semibold text-text">{rateText(result.loserInv.kind, result.eq)}</strong>.
                </p>
              )}
            </Card>

            <Card className="p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium">Valor líquido se resgatado em cada mês</h2>
                <ChartLegend series={series} />
              </div>
              <SeriesChart series={series} formatValue={formatBRL} />
            </Card>

            <div className="flex flex-col gap-8">
              <ResultTable title={`A: ${labelOf(a)}`} rows={yearlyRows(result.simA)} amount={amount} />
              <ResultTable title={`B: ${labelOf(b)}`} rows={yearlyRows(result.simB)} amount={amount} />
            </div>
          </>
        )
      )}

      <Card className="p-4 text-xs text-muted">
        <h2 className="mb-2 text-sm font-medium text-text">Premissas da conta</h2>
        <ul className="flex list-disc flex-col gap-1 pl-4">
          <li>CDI, IPCA e Selic ficam constantes durante todo o prazo (os valores acima). Na prática eles variam: é uma estimativa.</li>
          <li>O Tesouro Selic rende a Selic efetiva (over), que costuma ficar cerca de 0,10 ponto abaixo da meta do Copom.</li>
          <li>% do CDI incide sobre o CDI de cada dia útil (252 por ano), como os bancos calculam.</li>
          <li>
            IR pela tabela regressiva sobre o ganho, no resgate: 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima.
            LCI, LCA, CRI, CRA e debêntures incentivadas são isentos para pessoa física (regras conferidas em 04/11/2026).
          </li>
          <li>Tesouro Direto: taxa de custódia da B3 de 0,20% ao ano (Tesouro Selic isento até R$ 10 mil), descontada antes do IR.</li>
          <li>Títulos sem cupom (juros só no vencimento). Títulos com juros semestrais têm IR a cada pagamento e não entram aqui.</li>
          <li>Sem IOF: ele só existe em resgates com menos de 30 dias. Sem taxas de corretora.</li>
        </ul>
      </Card>
    </div>
  );
}
