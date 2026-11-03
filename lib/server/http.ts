import "server-only";

/** Erro com mensagem já pronta para mostrar ao usuário (em português). */
export class SourceError extends Error {}

/**
 * fetch com tempo-limite e erros traduzidos.
 * Toda chamada externa passa por aqui.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 15_000,
): Promise<Response> {
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    const host = new URL(url).host;
    console.error(`[fetch] ${host}:`, err instanceof Error ? (err.cause ?? err.message) : err);
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new SourceError("A fonte demorou demais para responder.");
    }
    throw new SourceError("Não foi possível conectar à fonte.");
  }
}

/** Mensagem curta a partir de qualquer erro. */
export function errorMessage(err: unknown): string {
  if (err instanceof SourceError) return err.message;
  return "Erro inesperado ao buscar os dados.";
}

const TRANSIENT = {
  timeout: "A fonte demorou demais para responder.",
  network: "Não foi possível conectar à fonte.",
  rateLimit: "Limite de requisições da brapi atingido.",
};

/** Falha que tende a passar sozinha (vale tentar de novo logo). */
export function isTransientError(message: string): boolean {
  return Object.values(TRANSIENT).includes(message) || /erro 5\d\d/.test(message);
}

/** "1.234,56" -> 1234.56. Vazio ou inválido -> null. */
export function parseBrNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const n = Number(raw.trim().replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** "dd/mm/aaaa" -> "aaaa-mm-dd". */
export function brDateToIso(raw: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(raw.trim());
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}
