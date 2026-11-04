import "server-only";
import { indices, trackedEtfs, watchlistSymbols, worldStocks } from "@/config/watchlist";
import type { MarketListResponse } from "@/lib/types";

/** Tickers sempre aceitos: configurados à mão no projeto. */
const CONFIGURED = new Set(
  [...indices.map((i) => i.symbol), ...watchlistSymbols, ...trackedEtfs, ...worldStocks.map((w) => w.symbol)].map(
    (s) => s.toUpperCase(),
  ),
);

/**
 * O ticker existe? Só os que existem chamam a brapi: assim ninguém gasta a
 * cota pedindo tickers inventados.
 *
 * Consulta a nossa própria rota /api/market-list pela URL pública, que é uma
 * resposta em cache (não gasta cota).
 * - "sim": configurado no projeto ou presente na lista da B3;
 * - "não": a lista carregou e o ticker não está nela;
 * - "indisponível": a lista não carregou; por segurança, não arriscamos a cota.
 */
export async function checkTicker(ticker: string, origin: string): Promise<"sim" | "não" | "indisponível"> {
  if (CONFIGURED.has(ticker)) return "sim";
  try {
    const res = await fetch(new URL("/api/market-list", origin), { signal: AbortSignal.timeout(10_000) });
    const list = (await res.json()) as MarketListResponse;
    if (list.ok) return list.assets.some((a) => a.symbol.toUpperCase() === ticker) ? "sim" : "não";
  } catch {
    // Lista indisponível.
  }
  return "indisponível";
}
