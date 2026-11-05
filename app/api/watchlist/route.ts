import { revalidateTag } from "next/cache";
import { isLoggedIn, loginConfigured } from "@/lib/server/session";
import { readWatchlist, saveWatchlist, TICKER_RE, WATCHLIST_MAX } from "@/lib/server/watchlist-store";
import { checkTicker } from "@/lib/server/known-tickers";
import { redisConfigured } from "@/lib/server/redis";
import { QUOTES_TAG } from "@/lib/server/data";
import type { WatchlistResponse } from "@/lib/types";

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

/** A lista atual e se este aparelho pode editá-la. */
export async function GET() {
  const { symbols, source } = await readWatchlist();
  const body: WatchlistResponse = {
    symbols,
    source,
    max: WATCHLIST_MAX,
    canEdit: redisConfigured && loginConfigured(),
    loggedIn: await isLoggedIn(),
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}

/** Salva a lista inteira (ordem incluída). Só com login. */
export async function PUT(req: Request) {
  if (!(await isLoggedIn())) return fail("Entre com a senha para editar a watchlist.", 401);
  const body = (await req.json().catch(() => null)) as { symbols?: unknown } | null;
  const raw = body?.symbols;
  if (!Array.isArray(raw) || !raw.every((s) => typeof s === "string")) return fail("Lista inválida.", 400);

  const symbols = [...new Set(raw.map((s) => s.trim().toUpperCase()))];
  if (symbols.length > WATCHLIST_MAX) return fail(`A watchlist aceita no máximo ${WATCHLIST_MAX} ativos.`, 400);
  if (!symbols.every((s) => TICKER_RE.test(s))) return fail("Ticker inválido na lista.", 400);

  // Só os tickers novos precisam ser conferidos na lista da B3.
  const current = new Set((await readWatchlist()).symbols);
  for (const s of symbols.filter((x) => !current.has(x))) {
    const known = await checkTicker(s, new URL(req.url).origin);
    if (known === "não") return fail(`${s} não foi encontrado na B3.`, 400);
    if (known === "indisponível") return fail("Lista de ativos da B3 indisponível agora. Tente de novo em alguns minutos.", 503);
  }

  try {
    await saveWatchlist(symbols);
  } catch {
    return fail("Não foi possível salvar agora (banco de dados indisponível).", 503);
  }
  // As cotações são montadas a partir da lista: renova o cache já.
  revalidateTag(QUOTES_TAG, { expire: 0 });
  return Response.json({ ok: true, symbols });
}
