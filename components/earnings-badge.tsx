"use client";

import { cvmCodes } from "@/config/watchlist";
import { useEarnings } from "@/hooks/use-market-data";
import { formatDate } from "@/lib/format";

/**
 * Selo ao lado do ticker quando a empresa divulgou resultado nos últimos dias
 * ("Resultado 3T26"). Passando o mouse ou focando, explica a data e a fonte;
 * vindo de manchete, leva à notícia.
 *
 * Só as empresas com código CVM cadastrado podem ter selo: as outras nem
 * consultam os dados (a tabela da B3 tem centenas de linhas).
 */
export function EarningsBadge({ symbol }: { symbol: string }) {
  return cvmCodes[symbol] ? <Badge symbol={symbol} /> : null;
}

function Badge({ symbol }: { symbol: string }) {
  const { data } = useEarnings();
  const r = data?.releases[symbol];
  if (!r) return null;

  const when = formatDate(r.date);
  const description =
    r.source === "cvm"
      ? `Resultado do ${r.quarterLabel} divulgado em ${when} (entregue à CVM${
          data?.cvmUpdatedThrough ? `; arquivos da CVM atualizados até ${formatDate(data.cvmUpdatedThrough)}` : ""
        })`
      : `Resultado do ${r.quarterLabel} noticiado em ${when} por ${r.sourceName}`;

  const cls =
    "inline-flex items-center rounded bg-accent-soft px-1.5 py-px text-[0.65rem] font-medium tabular-nums text-accent";

  return r.link ? (
    <a href={r.link} target="_blank" rel="noopener noreferrer" title={description} aria-label={description} className={`${cls} hover:underline`}>
      Resultado {r.quarter}
    </a>
  ) : (
    <span title={description} className={cls}>
      Resultado {r.quarter}
      <span className="sr-only">: {description}</span>
    </span>
  );
}
