import "server-only";
import type { FxItem, MacroIndicator, MacroItem } from "@/lib/types";
import { brDateToIso, errorMessage, fetchWithTimeout, SourceError } from "@/lib/server/http";

/**
 * Banco Central: séries do SGS (Selic, CDI, IPCA) e PTAX (câmbio).
 * APIs públicas, sem token. Códigos conferidos em 03/11/2026.
 */
const SERIES: Omit<MacroIndicator, "value" | "referenceDate">[] = [
  { id: "selicMeta", label: "Selic meta", unit: "% a.a.", sgsCode: 432, dateKind: "since" },
  { id: "cdi", label: "CDI", unit: "% a.a.", sgsCode: 4389, dateKind: "day" },
  { id: "ipcaMensal", label: "IPCA (mês)", unit: "% no mês", sgsCode: 433, dateKind: "month" },
  { id: "ipca12m", label: "IPCA (12 meses)", unit: "% em 12 meses", sgsCode: 13522, dateKind: "month" },
];

type SgsPoint = { data: string; valor: string };

async function sgsGet(code: number, query: string): Promise<SgsPoint[]> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados${query}`;
  const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new SourceError(`O Banco Central respondeu com erro ${res.status}.`);
  const body = (await res.json().catch(() => null)) as SgsPoint[] | null;
  if (!body?.length) throw new SourceError("O Banco Central não retornou dados para a série.");
  return body;
}

const brDate = (d: Date) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(d);

/**
 * Último ponto da série. Para a Selic meta, a série é diária e o BC já
 * publica o dia seguinte; o dado útil é desde quando a meta atual vale
 * (a decisão do Copom), então voltamos até o valor mudar.
 */
async function fetchLatestSgs(code: number, dateKind: MacroIndicator["dateKind"]): Promise<SgsPoint> {
  if (dateKind !== "since") return (await sgsGet(code, "/ultimos/1?formato=json")).at(-1)!;

  const now = new Date();
  const start = new Date(now.getTime() - 400 * 24 * 3600 * 1000); // Copom: ~8 reuniões/ano
  const points = await sgsGet(
    code,
    `?formato=json&dataInicial=${brDate(start)}&dataFinal=${brDate(now)}`,
  );
  const current = points.at(-1)!;
  let since = current;
  for (let i = points.length - 1; i >= 0 && points[i].valor === current.valor; i--) since = points[i];
  return { data: since.data, valor: current.valor };
}

export async function fetchMacroIndicators(): Promise<MacroItem[]> {
  return Promise.all(
    SERIES.map(async (s): Promise<MacroItem> => {
      try {
        const point = await fetchLatestSgs(s.sgsCode, s.dateKind);
        const value = Number(point.valor);
        const referenceDate = brDateToIso(point.data);
        if (!Number.isFinite(value) || !referenceDate) {
          return { id: s.id, ok: false, error: "Formato inesperado na resposta do Banco Central." };
        }
        return { id: s.id, ok: true, indicator: { ...s, value, referenceDate } };
      } catch (err) {
        return { id: s.id, ok: false, error: errorMessage(err) };
      }
    }),
  );
}

// ---------- PTAX ----------

type PtaxPoint = {
  cotacaoVenda: number;
  dataHoraCotacao: string; // "2026-11-03 13:06:31.835" no horário de Brasília
  tipoBoletim: string; // "Abertura" | "Intermediário" | "Fechamento" ...
};

/** "MM-DD-AAAA", o formato que a API da PTAX pede. */
function ptaxDate(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value;
  return `${get("month")}-${get("day")}-${get("year")}`;
}

/** Horário de Brasília (UTC−3, sem horário de verão desde 2019) para ISO. */
function ptaxTimeToIso(raw: string): string {
  const [date, time] = raw.split(" ");
  return new Date(`${date}T${time.slice(0, 8)}-03:00`).toISOString();
}

/**
 * PTAX: boletins do Banco Central ao longo do dia (abertura, intermediários
 * e fechamento). Variação calculada contra o fechamento do dia útil anterior.
 */
export async function fetchFxFromPtax(pairs: string[]): Promise<FxItem[]> {
  const now = new Date();
  const start = new Date(now.getTime() - 10 * 24 * 3600 * 1000);

  return Promise.all(
    pairs.map(async (pair): Promise<FxItem> => {
      const [currency] = pair.split("-");
      try {
        const url =
          "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
          "CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
          `?@moeda='${currency}'&@dataInicial='${ptaxDate(start)}'&@dataFinalCotacao='${ptaxDate(now)}'` +
          "&$format=json&$select=cotacaoVenda,dataHoraCotacao,tipoBoletim";
        const res = await fetchWithTimeout(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new SourceError(`O Banco Central respondeu com erro ${res.status}.`);
        const body = (await res.json().catch(() => null)) as { value?: PtaxPoint[] } | null;
        const points = body?.value ?? [];
        const last = points.at(-1);
        if (!last) throw new SourceError("O Banco Central não retornou a PTAX.");

        const lastDay = last.dataHoraCotacao.slice(0, 10);
        const previousClose = points
          .filter((p) => p.tipoBoletim === "Fechamento" && p.dataHoraCotacao.slice(0, 10) < lastDay)
          .at(-1);
        const changePercent = previousClose
          ? (last.cotacaoVenda / previousClose.cotacaoVenda - 1) * 100
          : null;

        return {
          pair,
          ok: true,
          rate: {
            pair,
            price: last.cotacaoVenda,
            changePercent,
            updatedAt: ptaxTimeToIso(last.dataHoraCotacao),
            source: `PTAX/BCB · boletim ${last.tipoBoletim.toLowerCase()}`,
          },
        };
      } catch (err) {
        return { pair, ok: false, error: errorMessage(err) };
      }
    }),
  );
}
