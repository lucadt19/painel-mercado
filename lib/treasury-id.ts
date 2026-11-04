/**
 * Identificador estável de um título do Tesouro, usado na URL do histórico.
 * Ex.: ("Tesouro IPCA+ com Juros Semestrais", "2035-05-15")
 *   -> "tesouro-ipca-com-juros-semestrais-2035-05-15"
 */
export function bondId(title: string, maturity: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug}-${maturity}`;
}
