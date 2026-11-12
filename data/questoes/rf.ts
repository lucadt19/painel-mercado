import { mkq } from "./_mk";

export default mkq("rf", [
  {
    l: "b",
    q: "Um financiamento de R$ 240.000 será pago pelo SAC em 24 parcelas mensais, a primeira em 30 dias, a juros de 1,5% a.m. Qual o valor da 10ª parcela?",
    o: ["R$ 12.250", "R$ 13.600", "R$ 12.400", "R$ 12.100", "R$ 13.450"],
    c: "A",
    e: `Amortização constante: 240.000 ÷ 24 = 10.000. Depois de 9 parcelas, o saldo é 240.000 − 90.000 = 150.000. Juros da 10ª: 1,5% × 150.000 = 2.250. Parcela: 12.250.
B) usa o saldo inicial (10.000 + 3.600).
C) usa o saldo depois de 8 parcelas (160.000).
D) usa o saldo depois de 10 parcelas (140.000).
E) usa o saldo de 230.000 (só 1 parcela paga).`,
  },
  {
    l: "a",
    q: "Um empréstimo de R$ 10.000 é pago pela tabela Price em 12 parcelas mensais iguais, a 2% a.m., a primeira em 30 dias. Qual o valor aproximado da parcela?",
    o: ["R$ 1.033,33", "R$ 833,33", "R$ 945,60", "R$ 1.056,87", "R$ 916,67"],
    c: "C",
    e: `PMT = PV × i ÷ [1 − (1 + i)^−n] = 10.000 × 0,02 ÷ (1 − 1,02^−12) = 200 ÷ (1 − 0,7885) = 200 ÷ 0,2115 ≈ 945,60.
A) soma os juros simples do ano ao principal e divide (10.000 × 1,24 ÷ 12).
B) ignora os juros (10.000 ÷ 12).
D) capitaliza o principal por 12 meses e divide por 12, ignorando que cada parcela reduz o saldo.
E) divide o principal por 12 e soma juros de só 1% (metade da taxa).`,
  },
  {
    l: "b",
    q: "Uma aplicação rendeu 15% nominais no ano, com IR de 15% sobre o rendimento nominal. A inflação do período foi de 5%. Qual o retorno real líquido aproximado?",
    o: ["10,00%", "7,38%", "8,50%", "9,52%", "7,75%"],
    c: "B",
    e: `O IR incide sobre o ganho nominal: 15% × 0,85 = 12,75% líquidos. Real: 1,1275 ÷ 1,05 − 1 ≈ 7,38%.
A) subtrai a inflação do bruto (15 − 5).
C) desconta o IR do retorno real (10% × 0,85).
D) deflaciona sem o IR (1,15 ÷ 1,05).
E) subtrai a inflação do líquido (12,75 − 5).`,
  },
  {
    l: "b",
    q: "Qual a taxa anual equivalente a 1% ao mês, em juros compostos?",
    o: ["12,00%", "12,68%", "11,36%", "13,00%", "12,36%"],
    c: "B",
    e: `(1,01)¹² − 1 = 12,68%. Em juros compostos, a taxa anual equivalente é maior que 12 × 1%.
A) é a taxa nominal (juros simples).
C), D) e E) erram a capitalização.`,
  },
  {
    l: "a",
    q: "O Tesouro Prefixado de 5 anos paga 12,5% a.a. e o Tesouro IPCA+ de mesmo prazo paga IPCA + 6,2% a.a. Qual a inflação implícita aproximada?",
    o: ["6,30%", "5,93%", "6,20%", "4,50%", "18,70%"],
    c: "B",
    e: `Inflação implícita = 1,125 ÷ 1,062 − 1 ≈ 5,93%. Se você espera inflação acima disso, o IPCA+ tende a render mais que o prefixado; abaixo, o prefixado.
A) subtrai as taxas (12,5 − 6,2).
C) repete a taxa real.
E) soma as taxas.`,
  },
  {
    l: "b",
    q: "Uma NTN-B longa tem duration modificada de 10 anos. Se a taxa real de mercado sobe 1 ponto percentual, o que acontece aproximadamente com o preço?",
    o: ["Sobe cerca de 10%", "Cai cerca de 1%", "Cai cerca de 10%", "Não muda, pois o título é corrigido pelo IPCA", "Cai cerca de 0,1%"],
    c: "C",
    e: `ΔPreço ≈ −duration × Δtaxa = −10 × 1% = −10%. A correção pelo IPCA protege da inflação, não da alta da taxa real. Quem leva até o vencimento recebe a taxa contratada.`,
  },
  {
    l: "b",
    q: "Um Tesouro Prefixado (LTN) paga R$ 1.000 no vencimento, daqui a exatamente 2 anos. Se a taxa de compra é de 12% a.a., qual o preço hoje (aproximado)?",
    o: ["R$ 760,00", "R$ 892,86", "R$ 797,19", "R$ 806,45", "R$ 880,00"],
    c: "C",
    e: `1.000 ÷ 1,12² = 1.000 ÷ 1,2544 ≈ 797,19.
A) desconta juros simples de 2 anos do valor de face (1.000 − 240).
B) desconta só 1 ano.
D) usa juros simples (1.000 ÷ 1,24).
E) subtrai 12% uma vez.`,
  },
  {
    l: "a",
    q: "Uma LCA paga 90% do CDI, isenta de IR. Um CDB de mesmo prazo (mais de 720 dias, IR de 15%) e mesmo risco precisaria pagar aproximadamente quanto do CDI para empatar?",
    o: ["90,0% do CDI", "103,5% do CDI", "105,9% do CDI", "115,0% do CDI", "76,5% do CDI"],
    c: "C",
    e: `O CDB líquido é 85% do bruto: CDB × 0,85 = 90% → CDB = 90% ÷ 0,85 ≈ 105,9% do CDI. (Aproximação que ignora a capitalização; a conta exata dá algo muito próximo.)
B) multiplica 90 × 1,15 em vez de dividir por 0,85.
D) soma 15 pontos.
E) aplica o IR sobre a LCA isenta.`,
  },
  {
    l: "b",
    q: "Um investidor resgata um CDB após 400 dias. Qual alíquota de IR incide sobre o rendimento?",
    o: ["22,5%", "20,0%", "17,5%", "15,0%", "Isento"],
    c: "C",
    e: `Tabela regressiva: até 180 dias, 22,5%; de 181 a 360, 20%; de 361 a 720, 17,5%; acima de 720, 15%. 400 dias → 17,5%.`,
  },
  {
    l: "b",
    q: "Com a meta da Selic acima de 8,5% a.a., quanto rende a poupança (depósitos feitos após maio de 2012)?",
    o: [
      "70% da Selic mais TR",
      "0,5% ao mês mais TR",
      "100% do CDI",
      "6% ao ano fixos, sem TR",
      "IPCA + 0,5% ao mês",
    ],
    c: "B",
    e: `Regra atual: com a Selic acima de 8,5% a.a., a poupança rende 0,5% a.m. + TR (≈ 6,17% a.a. + TR). Com a Selic igual ou abaixo de 8,5%, rende 70% da Selic + TR. É isenta de IR para pessoa física.`,
  },
  {
    l: "b",
    q: "Qual o limite de garantia do FGC por CPF, por instituição financeira?",
    o: ["R$ 100 mil", "R$ 250 mil", "R$ 1 milhão", "Sem limite para CDBs", "R$ 500 mil"],
    c: "B",
    e: `R$ 250 mil por CPF por instituição (conglomerado), com teto global de R$ 1 milhão a cada 4 anos. Cobre CDB, LCI, LCA, LC, RDB e poupança; não cobre debêntures, CRI, CRA, fundos nem títulos públicos.`,
  },
  {
    l: "a",
    q: "Uma taxa de 24% ao ano é capitalizada mensalmente (taxa nominal). Qual a taxa efetiva anual?",
    o: ["24,00%", "26,82%", "25,00%", "28,00%", "26,00%"],
    c: "B",
    e: `Taxa nominal de 24% a.a. com capitalização mensal = 2% a.m. Efetiva: 1,02¹² − 1 ≈ 26,82%.
A) confunde nominal com efetiva.
C), D) e E) erram a capitalização.`,
  },
  {
    l: "b",
    q: "Um imóvel gera aluguel líquido de R$ 5.000 por mês, para sempre e sem reajuste. Com taxa de desconto de 0,8% a.m., qual o valor presente desse fluxo?",
    o: ["R$ 600.000", "R$ 625.000", "R$ 400.000", "R$ 750.000", "R$ 62.500"],
    c: "B",
    e: `Perpetuidade sem crescimento: VP = fluxo ÷ taxa = 5.000 ÷ 0,008 = 625.000.
A) usa 5.000 × 120 meses.
C) usa 5.000 ÷ 1,25%... (taxa errada).
E) divide por 8%.`,
  },
  {
    l: "b",
    q: "A juros compostos de 10% a.a., em quanto tempo um capital aproximadamente dobra?",
    o: ["10 anos", "5 anos", "Cerca de 7,3 anos", "Cerca de 8,5 anos", "20 anos"],
    c: "C",
    e: `ln 2 ÷ ln 1,1 ≈ 0,693 ÷ 0,0953 ≈ 7,27 anos. A regra do 72 dá 72 ÷ 10 = 7,2 anos, ótima aproximação de cabeça.
A) usa juros simples (100% ÷ 10%).`,
  },
]);
