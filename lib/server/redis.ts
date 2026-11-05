import "server-only";
import { SourceError } from "@/lib/server/http";

/**
 * Upstash Redis pela API REST (sem dependência). As variáveis KV_REST_API_URL
 * e KV_REST_API_TOKEN são criadas pela Vercel ao conectar o banco ao projeto.
 *
 * Sem as variáveis em desenvolvimento, usa um banco em memória (só para
 * testar no computador; some ao reiniciar o servidor).
 */

const url = process.env.KV_REST_API_URL;
const token = process.env.KV_REST_API_TOKEN;

export const redisConfigured = Boolean(url && token) || process.env.NODE_ENV === "development";

const memory = ((globalThis as typeof globalThis & { __devRedis?: Map<string, { v: string; exp?: number }> }).__devRedis ??=
  new Map());

function memoryCommand(cmd: (string | number)[]): unknown {
  const [name, key, ...args] = cmd.map(String);
  const now = Date.now();
  const entry = memory.get(key);
  if (entry?.exp && entry.exp < now) memory.delete(key);
  switch (name.toUpperCase()) {
    case "GET":
      return memory.get(key)?.v ?? null;
    case "SET":
      memory.set(key, { v: args[0] });
      return "OK";
    case "DEL":
      return memory.delete(key) ? 1 : 0;
    case "INCR": {
      const n = Number(memory.get(key)?.v ?? 0) + 1;
      memory.set(key, { v: String(n), exp: memory.get(key)?.exp });
      return n;
    }
    case "EXPIRE": {
      const e = memory.get(key);
      if (e) e.exp = now + Number(args[0]) * 1000;
      return e ? 1 : 0;
    }
    default:
      throw new Error(`Comando não suportado no banco de teste: ${name}`);
  }
}

/** Executa um comando Redis (ex.: ["GET", "chave"]). */
export async function redis<T = unknown>(cmd: (string | number)[]): Promise<T> {
  if (!url || !token) {
    if (process.env.NODE_ENV === "development") return memoryCommand(cmd) as T;
    throw new SourceError("Banco de dados da watchlist não configurado.");
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const body = (await res.json().catch(() => null)) as { result?: T; error?: string } | null;
  if (!res.ok || !body || body.error) throw new SourceError(`Banco de dados respondeu com erro (${body?.error ?? res.status}).`);
  return body.result as T;
}
