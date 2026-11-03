/**
 * Calendário de negociação da B3 (mercado à vista de ações).
 *
 * ATUALIZAR À MÃO:
 *  - todo fim de ano, quando a B3 publicar os feriados do ano seguinte;
 *  - em março e novembro, quando a B3 ajusta o horário por causa do
 *    horário de verão dos EUA.
 *
 * Fontes oficiais:
 *  - Feriados 2026: https://www.b3.com.br/pt_br/noticias/calendario-de-negociacao-da-b3-confira-o-funcionamento-da-bolsa-em-2026.htm
 *  - Horário desde 03/11/2026: https://www.b3.com.br/pt_br/noticias/b3-ajusta-horarios-de-negociacao-de-acoes-e-derivativos-acompanhando-fim-do-horario-de-verao-nos-eua.htm
 *
 * Todas as datas e horas estão no horário de Brasília (America/Sao_Paulo).
 */

export type SessionPeriod = {
  /** Primeiro dia em que o horário vale (AAAA-MM-DD). */
  from: string;
  /** Último dia em que o horário vale (AAAA-MM-DD). */
  to: string;
  /** Abertura do pregão regular (HH:MM). */
  open: string;
  /** Fim do leilão de fechamento (HH:MM). */
  close: string;
  note: string;
};

export const sessionPeriods: SessionPeriod[] = [
  {
    from: "2026-11-03",
    // Fim provável: o horário de verão dos EUA começa em 14/03/2027.
    // Confirmar a data exata quando a B3 publicar o comunicado.
    to: "2027-03-12",
    open: "10:00",
    close: "18:00",
    note: "Pregão regular 10h–17h55, leilão de fechamento até 18h (Ofício Circular 050/2026-VNC).",
  },
];

/** Dias sem pregão. */
export const holidays: Record<string, string> = {
  "2026-01-01": "Confraternização Universal",
  "2026-02-16": "Carnaval",
  "2026-02-17": "Carnaval",
  "2026-04-03": "Sexta-feira Santa",
  "2026-04-21": "Tiradentes",
  "2026-05-01": "Dia do Trabalho",
  "2026-06-04": "Corpus Christi",
  "2026-09-07": "Independência do Brasil",
  "2026-10-12": "Nossa Senhora Aparecida",
  "2026-11-02": "Finados",
  "2026-11-20": "Dia Nacional de Zumbi e da Consciência Negra",
  "2026-12-24": "Véspera de Natal",
  "2026-12-25": "Natal",
  "2026-12-31": "Véspera de Ano Novo",
  // 2027: adicionar quando a B3 publicar o calendário.
};

/** Dias com horário especial (sobrepõem o horário do período). */
export const specialSessions: Record<string, { open?: string; close?: string; note: string }> = {
  "2026-02-18": { open: "13:00", note: "Quarta-feira de Cinzas" },
};

/** Último ano com feriados cadastrados acima. */
export const holidaysCoveredUntilYear = 2026;
