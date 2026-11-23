import { revalidateTag } from "next/cache";
import { worldStocks } from "@/config/watchlist";
import { isLoggedIn, loginConfigured } from "@/lib/server/session";
import { marketMax, readWatchlist, saveWatchlist, validTicker, type Market } from "@/lib/server/watchlist-store";
import { checkTicker } from "@/lib/server/known-tickers";
import { redisConfigured } from "@/lib/server/redis";
import { fetchQuotes } from "@/lib/server/brapi";
import { QUOTES_TAG, WORLD_TAG } from "@/lib/server/data";
import type { WatchlistResponse } from "@/lib/types";

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

/** ?m=intl = watchlist internacional; sem parâmetro, a da B3. */
const marketOf = (req: Request): Market => (new URL(req.url).searchParams.get("m") === "intl" ? "intl" : "br");

const knownWorld = new Set(worldStocks.map((w) => w.symbol));

/** A lista atual e se este aparelho pode editá-la. */
export async function GET(req: Request) {
  const m = marketOf(req);
  const { symbols, source } = await readWatchlist(m);
  const body: WatchlistResponse = {
    symbols,
    source,
    max: marketMax(m),
    canEdit: redisConfigured && loginConfigured(),
    loggedIn: await isLoggedIn(),
  };
  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}

/** Salva a lista inteira (ordem incluída). Só com login. */
export async function PUT(req: Request) {
  if (!(await isLoggedIn())) return fail("Entre com a senha para editar a watchlist.", 401);
  const m = marketOf(req);
  const body = (await req.json().catch(() => null)) as { symbols?: unknown } | null;
  const raw = body?.symbols;
  if (!Array.isArray(raw) || !raw.every((s) => typeof s === "string")) return fail("Lista inválida.", 400);

  const symbols = [...new Set(raw.map((s) => s.trim().toUpperCase()))];
  const max = marketMax(m);
  if (symbols.length > max) {
    return fail(
      m === "intl"
        ? `A watchlist internacional aceita no máximo ${max} ativos no plano atual da brapi.`
        : `A watchlist aceita no máximo ${max} ativos.`,
      400,
    );
  }
  if (!symbols.every((s) => validTicker(m, s))) return fail("Ticker inválido na lista.", 400);

  // Só os tickers novos precisam ser conferidos.
  const current = new Set((await readWatchlist(m)).symbols);
  for (const s of symbols.filter((x) => !current.has(x))) {
    if (m === "br") {
      const known = await checkTicker(s, new URL(req.url).origin);
      if (known === "não") return fail(`${s} não foi encontrado na B3.`, 400);
      if (known === "indisponível") return fail("Lista de ativos da B3 indisponível agora. Tente de novo em alguns minutos.", 503);
    } else if (!knownWorld.has(s)) {
      // Ticker americano fora da lista conhecida: confere na brapi (1 chamada).
      const { items } = await fetchQuotes([s]).catch(() => ({ items: [] as { ok: boolean }[] }));
      if (!items[0]?.ok) return fail(`${s} não foi encontrado na brapi (confira o ticker na bolsa americana).`, 400);
    }
  }

  try {
    await saveWatchlist(symbols, m);
  } catch {
    return fail("Não foi possível salvar agora (banco de dados indisponível).", 503);
  }
  // As cotações são montadas a partir da lista: renova o cache já.
  revalidateTag(m === "intl" ? WORLD_TAG : QUOTES_TAG, { expire: 0 });
  return Response.json({ ok: true, symbols });
}
