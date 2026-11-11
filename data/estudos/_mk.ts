import type { StudyAreaId, StudyCard } from "@/config/estudos";

/**
 * Monta os cartões de uma área a partir de [nível, pergunta, resposta].
 * O id é "área-número": para não perder o progresso salvo, acrescente
 * perguntas novas SEMPRE NO FIM da lista (e não apague do meio; troque o texto).
 */
export function mk(area: StudyAreaId, rows: ["b" | "a", string, string][]): StudyCard[] {
  return rows.map(([lvl, q, a], i) => ({
    id: `${area}-${String(i + 1).padStart(3, "0")}`,
    area,
    level: lvl === "b" ? "basico" : "avancado",
    q,
    a: a.trim(),
  }));
}
