import { mk } from "./_mk";

export default mk("valuation", [
  ["b", "Quais são as principais metodologias de valuation?", `
- Comparáveis de mercado (trading comps): múltiplos de empresas abertas parecidas.
- Transações precedentes (precedent transactions): múltiplos pagos em aquisições de empresas parecidas.
- Fluxo de caixa descontado (DCF): valor presente dos fluxos futuros.
Complementares: LBO (quanto um fundo pagaria), soma das partes, valor de liquidação.`],
  ["b", "Qual metodologia costuma dar o maior valor? E o menor?", `
Em geral, transações precedentes dão o maior valor, por incluírem o prêmio de controle pago pelo comprador. O DCF varia muito com as premissas (pode ficar no topo ou no fundo). Comparáveis de mercado tendem a ficar abaixo das transações. Mas isso depende do setor e do ciclo de mercado.`],
  ["b", "Como escolher empresas comparáveis?", `
Pelos mesmos critérios que definem o risco e o crescimento: setor e modelo de negócio, tamanho (receita, valor de mercado), geografia, margens e crescimento. Na prática, começa estreito e afrouxa os critérios se houver poucas empresas.`],
  ["b", "Quais múltiplos são mais usados e quando?", `
- EV/EBITDA: o mais comum; neutro à estrutura de capital e à depreciação.
- EV/EBIT: quando capex e depreciação variam muito entre empresas.
- P/L: bancos, seguradoras e empresas maduras.
- EV/Receita: empresas sem lucro (tecnologia em crescimento).
- P/VP (preço/valor patrimonial): bancos e financeiras.
- Setoriais: EV/assinante, EV/reserva (petróleo), FFO para imobiliário.`],
  ["b", "Por que se usam múltiplos sobre o EBITDA projetado (forward) e não o histórico?", `
Porque o valor depende do futuro. O múltiplo forward (próximos 12 meses ou ano seguinte) capta melhor a expectativa e reduz distorções de anos atípicos. O histórico (LTM) é útil por ser um número real, não estimativa.`],
  ["b", "Como funciona uma análise de transações precedentes?", `
Seleciona aquisições de empresas parecidas (setor, tamanho, período recente), calcula os múltiplos pagos (EV/EBITDA, EV/Receita na data do anúncio) e aplica a mediana ou um intervalo à empresa avaliada. Limites: poucas transações, informações incompletas, condições de mercado diferentes na época.`],
  ["b", "O que é o 'football field' (gráfico de campo de futebol)?", `
Um gráfico de barras horizontais que mostra o intervalo de valor obtido por cada metodologia (comps, transações, DCF, LBO, faixa de 52 semanas da ação). Serve para mostrar ao cliente, num só lugar, onde cada método situa o valor e embasar a faixa de preço recomendada.`],
  ["b", "Quando NÃO usar EV/EBITDA?", `
Para bancos e seguradoras (dívida é matéria-prima, não financiamento: usar P/L e P/VP); para empresas com EBITDA negativo (usar EV/Receita ou métricas operacionais); e quando capex é muito diferente entre os comparáveis (preferir EV/EBIT ou EV/(EBITDA − capex)).`],
  ["a", "Por que duas empresas do mesmo setor podem negociar a múltiplos muito diferentes?", `
Diferenças de crescimento esperado, margens e retorno sobre o capital, risco (alavancagem, concentração de clientes), qualidade da gestão e governança, liquidez das ações e ciclo. Um múltiplo é um atalho para o DCF: embute crescimento, risco e retorno.`],
  ["a", "Qual a relação entre o P/L e o crescimento e retorno de uma empresa?", `
Pelo modelo de Gordon, P/L justo ≈ payout ÷ (custo do capital próprio − crescimento), com payout = 1 − crescimento ÷ ROE. Ou seja: mais crescimento só aumenta o múltiplo se o ROE for maior que o custo do capital; crescer com ROE baixo destrói valor.`],
  ["a", "Como se avalia uma empresa sem lucro, como uma startup?", `
Com múltiplos de receita (EV/Receita, EV/ARR em SaaS) ou métricas operacionais (usuários, GMV), comparando com pares em estágio parecido; com DCF de horizonte longo até a maturidade (com cenários); ou pelo valor da última rodada de investimento. Ajustes por crescimento são essenciais (ex.: EV/Receita ÷ crescimento).`],
  ["a", "O que é soma das partes (sum of the parts) e quando usar?", `
Avalia cada divisão separadamente (cada uma com seus comparáveis ou DCF) e soma, depois subtrai a dívida líquida da holding e despesas corporativas. Usada em conglomerados com negócios muito diferentes. Muitas vezes o mercado aplica um "desconto de holding" ao total.`],
  ["a", "Como avaliar um banco?", `
Dívida e depósitos são parte da operação, então não se usa EV nem EBITDA. Usam-se P/L, P/VP (justificado pelo ROE: P/VP ≈ (ROE − g) ÷ (Ke − g)) e o modelo de dividendos descontados. Capital regulatório (Basileia) limita o que pode ser distribuído.`],
  ["a", "O que é o prêmio de controle e quanto costuma ser?", `
É o quanto o comprador paga acima do preço de mercado para assumir o controle, justificado pelas sinergias e pela capacidade de mudar a estratégia. Costuma ficar entre 20% e 40% sobre o preço não afetado (antes de rumores), variando por setor e mercado.`],
  ["a", "Calendarização: por que ajustar os números ao mesmo período?", `
Empresas têm anos fiscais diferentes (ex.: um termina em março, outro em dezembro). Para comparar múltiplos, os números são reponderados para o mesmo período (ex.: ano-calendário), combinando frações dos anos fiscais. Sem isso, compara-se crescimento e ciclos diferentes.`],
]);
