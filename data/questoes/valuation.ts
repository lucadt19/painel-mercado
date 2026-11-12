import { mkq } from "./_mk";

export default mkq("valuation", [
  {
    l: "a",
    q: "Uma empresa fechada está sendo vendida por 7,0x EV/EBITDA LTM. O EBITDA reportado é de R$ 15,0 mi e inclui R$ 2,0 mi de despesas não recorrentes com uma reestruturação já concluída. Os sócios, que continuarão na gestão, recebem R$ 0,5 mi de pró-labore; o custo de mercado dessas funções é de R$ 1,5 mi. A due diligence achou uma contingência fiscal provável, não provisionada, de R$ 3,0 mi. A dívida líquida é de R$ 20,0 mi. Qual o equity value?",
    o: ["R$ 82,0 mi", "R$ 92,0 mi", "R$ 89,0 mi", "R$ 96,0 mi", "R$ 103,0 mi"],
    c: "C",
    e: `EBITDA ajustado: 15,0 + 2,0 (não recorrente volta) − 1,0 (pró-labore a custo de mercado: 1,5 − 0,5) = 16,0. EV = 7,0 × 16,0 = 112,0. A contingência não muda o EBITDA recorrente, mas é tratada como dívida: equity = 112,0 − 20,0 − 3,0 = 89,0.
A) não ajusta o EBITDA (105 − 23).
B) não desconta a contingência.
D) volta a despesa não recorrente, mas não ajusta o pró-labore.
E) soma o ajuste do pró-labore em vez de subtrair.`,
  },
  {
    l: "b",
    q: "Os comparáveis de uma empresa negociam aos seguintes P/L: 9x, 11x, 13x, 15x e 35x. A empresa tem 50 mi de ações e lucro líquido de R$ 120 mi, que inclui um ganho não recorrente de R$ 20 mi, já líquido de impostos. Usando a mediana dos comparáveis, qual o preço implícito por ação?",
    o: ["R$ 31,20", "R$ 26,00", "R$ 39,84", "R$ 33,20", "R$ 30,80"],
    c: "B",
    e: `Mediana: 13x (a média, 16,6x, é distorcida pelo 35x). Lucro recorrente: 120 − 20 = 100. Equity value: 13 × 100 = 1.300 → R$ 26,00 por ação.
A) não exclui o ganho não recorrente.
C) usa a média e não ajusta o lucro.
D) usa a média com o lucro ajustado.
E) tira o ganho do equity value, e não do lucro.`,
  },
  {
    l: "b",
    q: "Qual dos múltiplos abaixo combina numerador e denominador de forma INCONSISTENTE?",
    o: ["EV / EBIT", "Preço / lucro por ação", "Equity value / EBITDA", "EV / receita", "Equity value / FCFE"],
    c: "C",
    e: `O EBITDA é anterior aos juros: pertence a todos os financiadores e combina com o EV. O equity value só combina com métricas posteriores aos juros (lucro líquido, FCFE).
A) e D) usam métricas anteriores aos juros com o EV: consistentes.
B) e E) usam métricas do acionista com valores do acionista: consistentes.`,
  },
  {
    l: "b",
    q: "Uma empresa de software (assinaturas, pouco ativo físico) e uma cimenteira têm o mesmo EBITDA, as mesmas margens e o mesmo crescimento esperado. Qual tende a negociar a um EV/EBITDA maior, e por quê?",
    o: [
      "A cimenteira, pois os ativos físicos garantem mais valor",
      "Nenhuma, pois EBITDA e crescimento iguais implicam o mesmo múltiplo",
      "A de software, pois tem WACC menor por ter poucos ativos físicos",
      "A cimenteira, pois a depreciação maior reduz seu EBITDA",
      "A de software, pois converte mais EBITDA em caixa, com menos capex e capital de giro",
    ],
    c: "E",
    e: `O EBITDA ignora capex e capital de giro. A cimenteira precisa reinvestir boa parte do EBITDA para manter fornos e fábricas; a de software, quase nada. Cada real de EBITDA gera mais caixa livre na de software e, por isso, vale mais.
A) confunde ativo com geração de caixa.
B) ignora a conversão do EBITDA em caixa.
C) ter poucos ativos não reduz, por si, o WACC.
D) contradiz o enunciado, que fixa o EBITDA igual.`,
  },
  {
    l: "a",
    q: "Uma construtora negocia hoje a 5x EV/EBITDA, contra média de 9x entre 2020 e 2021. As demais construtoras também estão bem abaixo das próprias médias daquele período. Um analista conclui que o setor está barato. Qual a principal ressalva?",
    o: [
      "A comparação deveria usar o P/L, que é menos sensível ao custo de capital",
      "A média foi formada com juros muito baixos; com juros mais altos, o múltiplo justo tende a ser menor",
      "Os múltiplos históricos precisam ser corrigidos pela inflação acumulada",
      "A média deveria incluir construtoras americanas, para ter mais observações",
      "Múltiplos de construtoras não se comparam ao longo do tempo",
    ],
    c: "B",
    e: `Em 2020–2021 a Selic chegou a 2% a.a. Com custo de capital maior, o múltiplo justo cai para todo o mercado. O fato de todo o setor estar abaixo da média reforça que o desconto vem de um fator comum (juros), e não de uma oportunidade específica.
A) o P/L também depende do custo de capital (e ainda sofre com a alavancagem).
C) múltiplo é razão entre valores do mesmo período; não se corrige por inflação.
D) mistura mercados com custos de capital diferentes.
E) dá para comparar, desde que se considere o ambiente de juros.`,
  },
  {
    l: "b",
    q: "Em qual situação os múltiplos de comparáveis de mercado (trading comps) são a referência MAIS adequada?",
    o: [
      "Avaliar a compra de 100% de uma empresa fechada por um concorrente",
      "Definir a faixa de preço do IPO de uma empresa",
      "Estimar o preço de uma oferta de controle com sinergias relevantes",
      "Calcular o prêmio que um comprador estratégico deve pagar",
      "Defender o preço de uma OPA de fechamento de capital",
    ],
    c: "B",
    e: `No IPO, investidores compram participações minoritárias negociadas em bolsa, então o preço se baseia em comparáveis listados (com desconto de IPO). Os múltiplos de transações embutem prêmio de controle e sinergias e servem quando o controle está sendo negociado (A, C, D, E).`,
  },
  {
    l: "b",
    q: "Uma empresa tem valor de mercado de R$ 500 mi, dívida bruta de R$ 200 mi, caixa de R$ 80 mi, participação de não controladores de R$ 30 mi e uma participação minoritária em coligada (registrada por equivalência) de R$ 20 mi. Qual o enterprise value consistente com um EBITDA consolidado?",
    o: ["R$ 620 mi", "R$ 650 mi", "R$ 600 mi", "R$ 630 mi", "R$ 570 mi"],
    c: "D",
    e: `EV = 500 + 200 − 80 + 30 (não controladores: o EBITDA consolidado inclui 100% das controladas) − 20 (coligada: o resultado dela não está no EBITDA) = 630.
A) ignora os dois ajustes (500 + 200 − 80).
B) esquece de subtrair a coligada.
C) ignora os não controladores.
E) subtrai os não controladores em vez de somar.`,
  },
  {
    l: "a",
    q: "Uma empresa tem 100 mi de ações a R$ 20 e 10 mi de opções com preço de exercício de R$ 12, todas exercíveis. Pelo método da ação em tesouraria, qual o equity value diluído?",
    o: ["R$ 2.000 mi", "R$ 2.200 mi", "R$ 2.080 mi", "R$ 2.120 mi", "R$ 2.060 mi"],
    c: "C",
    e: `O exercício traz 10 × 12 = R$ 120 mi, usados para recomprar 120 ÷ 20 = 6 mi de ações. Ações novas líquidas: 10 − 6 = 4 mi. Ações diluídas: 104 mi × 20 = 2.080.
A) ignora a diluição.
B) soma as 10 mi de opções sem a recompra.
D) e E) erram a conta da recompra.`,
  },
  {
    l: "a",
    q: "Um banco tem ROE sustentável de 18%, custo do capital próprio de 14% e crescimento de longo prazo de 6%. Pelo modelo de Gordon, qual o P/VP justo?",
    o: ["1,29x", "0,78x", "1,50x", "2,25x", "1,80x"],
    c: "C",
    e: `P/VP justo = (ROE − g) ÷ (Ke − g) = (18% − 6%) ÷ (14% − 6%) = 12% ÷ 8% = 1,5x. Como o ROE supera o custo do capital, o banco vale mais que o patrimônio.
A) usa ROE ÷ Ke (18 ÷ 14).
B) inverte a fórmula.
D) usa ROE ÷ (Ke − g).
E) usa 18 ÷ 10, sem lógica de Gordon.`,
  },
  {
    l: "a",
    q: "Uma empresa madura converte 60% do EBITDA em FCFF, cresce 5% a.a. na perpetuidade e tem WACC de 11%. Qual EV/EBITDA (do ano atual) é implícito?",
    o: ["5,5x", "10,0x", "10,5x", "9,1x", "16,7x"],
    c: "C",
    e: `EV = FCFF do próximo ano ÷ (WACC − g) = 0,60 × EBITDA × 1,05 ÷ 6% → EV/EBITDA = 0,63 ÷ 0,06 = 10,5x. Mostra como conversão de caixa, crescimento e custo de capital determinam o múltiplo.
A) usa 0,6 ÷ 11%.
B) esquece o crescimento do fluxo do próximo ano (0,6 ÷ 6%).
D) divide por 6,6%.
E) ignora a conversão de 60% (1 ÷ 6%).`,
  },
]);
