import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redis } from "@/lib/server/redis";

/**
 * Login só para editar a watchlist: uma senha única (WATCHLIST_PASSWORD, nas
 * variáveis de ambiente da Vercel). Ao acertar, o aparelho recebe um cookie
 * assinado que vale 90 dias. A assinatura usa a própria senha como chave:
 * trocar a senha na Vercel desconecta todos os aparelhos.
 *
 * A senha nunca vai para o navegador nem para o banco.
 */

export const SESSION_COOKIE = "painel_sessao";
const SESSION_DAYS = 90;
const MAX_FAILS = 5;
const LOCK_SECONDS = 15 * 60;

const password = () => process.env.WATCHLIST_PASSWORD ?? "";
export const loginConfigured = () => password().length > 0;

const sign = (payload: string) =>
  createHmac("sha256", createHash("sha256").update(`painel:${password()}`).digest())
    .update(payload)
    .digest("base64url");

const sameText = (a: string, b: string) => {
  // Compara resumos de tamanho fixo, em tempo constante.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

/** O aparelho que fez a requisição está logado? */
export async function isLoggedIn(): Promise<boolean> {
  if (!loginConfigured()) return false;
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  if (!exp || !sig || !(Number(exp) > Date.now())) return false;
  return sameText(sig, sign(exp));
}

export type LoginResult = { ok: true } | { ok: false; error: string; status: number };

/** Confere a senha; bloqueia por 15 min depois de 5 erros seguidos do mesmo IP. */
export async function login(attempt: string, ip: string): Promise<LoginResult> {
  if (!loginConfigured()) return { ok: false, error: "Senha não configurada no servidor (WATCHLIST_PASSWORD).", status: 503 };
  const failKey = `painel:login-falhas:${ip}`;
  const fails = Number((await redis<string | null>(["GET", failKey]).catch(() => null)) ?? 0);
  if (fails >= MAX_FAILS) return { ok: false, error: "Muitas tentativas erradas. Tente de novo em 15 minutos.", status: 429 };

  if (!sameText(attempt, password())) {
    await redis(["INCR", failKey]).then(() => redis(["EXPIRE", failKey, LOCK_SECONDS])).catch(() => {});
    return { ok: false, error: "Senha incorreta.", status: 401 };
  }
  await redis(["DEL", failKey]).catch(() => {});

  const exp = String(Date.now() + SESSION_DAYS * 86_400_000);
  (await cookies()).set(SESSION_COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  return { ok: true };
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
}
