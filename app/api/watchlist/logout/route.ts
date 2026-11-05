import { logout } from "@/lib/server/session";

/** Sai (apaga o cookie deste aparelho). */
export async function POST() {
  await logout();
  return Response.json({ ok: true });
}
