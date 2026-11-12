import { isLoggedIn } from "@/lib/server/session";
import { redis } from "@/lib/server/redis";
import { emptyProgress, mergeQuiz, type QuizProgress } from "@/lib/quiz";

/**
 * Progresso das questões e histórico de simulados, sincronizado entre
 * aparelhos (só com login, a mesma senha da watchlist).
 */
const KEY = "painel:questoes:v1";
const MAX_BYTES = 600_000;

const fail = (error: string, status: number) => Response.json({ ok: false, error }, { status });

async function read(): Promise<QuizProgress> {
  const raw = await redis<string | null>(["GET", KEY]);
  return raw ? (JSON.parse(raw) as QuizProgress) : emptyProgress();
}

function valid(p: unknown): p is QuizProgress {
  if (!p || typeof p !== "object") return false;
  const { answers, simulados } = p as Partial<QuizProgress>;
  if (!answers || typeof answers !== "object" || !Array.isArray(simulados)) return false;
  const okAnswers = Object.entries(answers).every(
    ([id, r]) => /^q-[a-z]+-\d{3}$/.test(id) && r && typeof r.at === "number" && typeof r.last === "boolean",
  );
  const okSims = simulados.every(
    (s) => s && typeof s.id === "string" && Array.isArray(s.qids) && Array.isArray(s.chosen) && s.qids.length <= 100,
  );
  return okAnswers && okSims;
}

export async function GET() {
  if (!(await isLoggedIn())) return fail("Sem login: progresso só neste aparelho.", 401);
  try {
    return Response.json({ ok: true, progress: await read() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return fail("Banco de dados indisponível.", 503);
  }
}

/** Junta o progresso enviado com o salvo. */
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
    const merged = mergeQuiz(await read(), incoming);
    await redis(["SET", KEY, JSON.stringify(merged)]);
    return Response.json({ ok: true, progress: merged });
  } catch {
    return fail("Banco de dados indisponível.", 503);
  }
}
