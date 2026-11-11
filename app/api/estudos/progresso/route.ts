import { isLoggedIn } from "@/lib/server/session";
import { redis } from "@/lib/server/redis";
import { mergeProgress, type Progress } from "@/lib/study";

/**
 * Progresso dos flashcards, sincronizado entre aparelhos (só com login, a
 * mesma senha da watchlist). Sem login, o progresso fica só no navegador.
 */
const KEY = "painel:estudos:v1";
const MAX_BYTES = 400_000;

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

async function read(): Promise<Progress> {
  const raw = await redis<string | null>(["GET", KEY]);
  return raw ? (JSON.parse(raw) as Progress) : {};
}

function valid(p: unknown): p is Progress {
  if (!p || typeof p !== "object" || Array.isArray(p)) return false;
  return Object.entries(p).every(
    ([id, v]) =>
      /^[a-z]+-\d{3}$/.test(id) &&
      v &&
      typeof v === "object" &&
      [0, 1, 2, 3].includes((v as { box: number }).box) &&
      typeof (v as { at: number }).at === "number",
  );
}

export async function GET() {
  if (!(await isLoggedIn())) return fail("Sem login: progresso só neste aparelho.", 401);
  try {
    return Response.json({ ok: true, progress: await read() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Banco de dados indisponível.", 503);
  }
}

/** Junta o progresso enviado com o salvo (vale o registro mais recente de cada cartão). */
export async function PUT(req: Request) {
  if (!(await isLoggedIn())) return fail("Sem login: progresso só neste aparelho.", 401);
  const text = await req.text();
  if (text.length > MAX_BYTES) return fail("Progresso grande demais.", 413);
  let incoming: unknown;
  try {
    incoming = JSON.parse(text);
  } catch {
    return fail("Formato inválido.", 400);
  }
  if (!valid(incoming)) return fail("Formato inválido.", 400);
  try {
    const merged = mergeProgress(await read(), incoming);
    await redis(["SET", KEY, JSON.stringify(merged)]);
    return Response.json({ ok: true, progress: merged });
  } catch {
    return fail("Banco de dados indisponível.", 503);
  }
}
