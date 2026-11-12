import { mkq } from "./_mk";

export default mkq("dcf", [
  {
    l: "b",
    q: "Uma empresa projeta para o ano: EBIT de R$ 500 mi, despesa de juros de R$ 70 mi, D&A de R$ 100 mi, capex de R$ 180 mi, aumento do capital de giro de R$ 40 mi e amortização de dívida de R$ 60 mi. Com alíquota de 34%, qual o FCFF do ano?",
    o: ["R$ 163,8 mi", "R$ 210,0 mi", "R$ 103,8 mi", "R$ 290,0 mi", "R$ 380,0 mi"],
    c: "B",
    e: `NOPAT = 500 × 0,66 = 330. FCFF = 330 + 100 − 180 − 40 = 210. Juros e amortização ficam de fora: o FCFF é o caixa para todos os financiadores, antes do serviço da dívida.
A) parte do lucro líquido (já com os juros).
C) parte do lucro líquido e ainda desconta a amortização (fluxo do acionista).
D) soma o aumento do capital de giro em vez de subtrair.
E) ignora o imposto.`,
  },
  {
    l: "a",
    q: "O FCFF do último ano projetado é de R$ 200 mi. O WACC nominal é de 13,4% a.a., a inflação de longo prazo é de 5% a.a. e o crescimento real na perpetuidade é de 2% a.a. Qual o valor da perpetuidade ao fim do período explícito (sem trazer a valor presente)?",
    o: ["R$ 1.789 mi", "R$ 3.344 mi", "R$ 3.400 mi", "R$ 1.807 mi", "R$ 3.175 mi"],
    c: "C",
    e: `Taxa e crescimento na mesma base. Nominal: g = 1,02 × 1,05 − 1 = 7,1%; VT = 200 × 1,071 ÷ (13,4% − 7,1%) = 214,2 ÷ 0,063 = 3.400. Real: WACC real = 1,134 ÷ 1,05 − 1 = 8%; VT = 200 × 1,02 ÷ (8% − 2%) = 3.400.
A) usa o WACC nominal com o g real.
B) soma as taxas (g = 7%) em vez de compor.
D) multiplica 2% × 1,05 em vez de compor os fatores.
E) esquece de crescer o primeiro fluxo da perpetuidade (200 ÷ 6,3%).`,
  },
  {
    l: "b",
    q: "Num DCF, o FCFF é projetado do ano 1 ao ano 7, e a perpetuidade de Gordon começa no ano 8. Como a perpetuidade entra no EV?",
    o: [
      "Calculada com o FCFF do ano 8 e descontada por 7 anos",
      "Calculada com o FCFF do ano 8 e descontada por 8 anos",
      "Calculada com o FCFF do ano 7 e somada sem desconto",
      "Calculada com o FCFF do ano 7, sem crescimento, e descontada por 7 anos",
      "Calculada com o FCFF do ano 7 e descontada por 8 anos",
    ],
    c: "A",
    e: `Gordon: FCFF do ano 8 ÷ (WACC − g) dá o valor da perpetuidade no fim do ano 7 (um período antes do primeiro fluxo que ela representa). Por isso é descontada por 7 anos, como o último fluxo projetado.
B) desconta um ano a mais.
C) ignora que o valor está no ano 7, não hoje.
D) não aplica o crescimento ao primeiro fluxo.
E) usa o fluxo errado e desconta um ano a mais.`,
  },
  {
    l: "a",
    q: "Uma empresa sem dívida passa a ter 40% de dívida na estrutura de capital, sem mudança na operação e com Kd abaixo do Ke. Qual combinação de efeitos é a mais consistente (supondo alavancagem moderada)?",
    o: [
      "Ke cai; WACC cai; EV sobe",
      "Ke sobe; WACC não muda; EV não muda",
      "Ke não muda; WACC cai; EV sobe",
      "Ke sobe; WACC cai; EV sobe",
      "Ke sobe; WACC sobe; EV cai",
    ],
    c: "D",
    e: `No CAPM só o beta muda com a dívida: βl = βu × [1 + (1 − t) × D/E]. Com D/E saindo de zero, o beta e o Ke sobem (o lucro do acionista fica mais volátil). Ainda assim, o WACC cai: 40% do capital passa a custar o Kd, menor e com benefício fiscal. Mesmo FCFF a uma taxa menor → EV sobe.
A) ignora o aumento do beta.
B) supõe que a estrutura de capital não afeta a taxa (sem impostos).
C) ignora que a dívida eleva o Ke.
E) descreve alavancagem excessiva (risco de falência), não o caso.`,
  },
  {
    l: "b",
    q: "O Banco Central eleva a Selic e o WACC de todas as empresas sobe 2 p.p. Uma distribuidora de energia madura (FCFF estável, quase todo pago em dividendos) e uma empresa de tecnologia (FCFF negativo nos primeiros anos, valor concentrado na perpetuidade) valem hoje R$ 1 bi cada. Qual efeito é o mais consistente?",
    o: [
      "As duas perdem o mesmo valor, pois a alta do WACC é igual",
      "A distribuidora perde mais, pois distribui mais caixa no curto prazo",
      "A de tecnologia perde mais, pois depende de fluxos distantes, mais sensíveis à taxa",
      "A de tecnologia perde menos, pois seu crescimento compensa a taxa",
      "Nenhuma perde valor, pois o FCFF não depende da Selic",
    ],
    c: "C",
    e: `Quanto mais distante o fluxo, maior o efeito da taxa sobre o valor presente (maior "duration"). A de tecnologia concentra valor na perpetuidade, onde o denominador (WACC − g) é pequeno e muito sensível. Ações de crescimento costumam cair mais em ciclos de alta de juros.
A) ignora o prazo dos fluxos.
B) inverte a lógica: caixa próximo sofre menos desconto.
D) o crescimento já está no preço e não reage à taxa.
E) ignora a taxa de desconto.`,
  },
  {
    l: "b",
    q: "Uma empresa tem estrutura-alvo de 60% equity e 40% dívida. O Ke é de 15%, o custo da dívida antes do IR é de 10% e a alíquota é de 34%. Qual o WACC?",
    o: ["13,00%", "11,64%", "12,00%", "9,00%", "8,58%"],
    c: "B",
    e: `WACC = 60% × 15% + 40% × 10% × (1 − 0,34) = 9,00% + 2,64% = 11,64%.
A) ignora o benefício fiscal (9 + 4).
C) inverte os pesos e ignora o IR (40% × 15% + 60% × 10%).
D) considera só o componente do equity.
E) aplica o (1 − t) também ao Ke.`,
  },
  {
    l: "a",
    q: "O beta desalavancado médio do setor é 0,80. A empresa avaliada tem D/E-alvo de 0,5 e alíquota de 34%. Com taxa livre de risco de 11% e prêmio de mercado de 5%, qual o Ke pelo CAPM?",
    o: ["15,00%", "17,00%", "16,32%", "16,00%", "14,01%"],
    c: "C",
    e: `βl = 0,80 × [1 + 0,66 × 0,5] = 0,80 × 1,33 = 1,064. Ke = 11% + 1,064 × 5% = 16,32%.
A) usa o beta desalavancado (11 + 0,8 × 5).
B) realavanca sem o IR (0,8 × 1,5 = 1,2).
D) usa beta 1,0 (o do mercado), sem olhar o setor.
E) divide o beta por 1,33 (desalavanca em vez de realavancar).`,
  },
  {
    l: "b",
    q: "O valor terminal no fim do ano 5 é de R$ 1.000 mi. Com WACC de 10% a.a., quanto ele contribui para o EV hoje?",
    o: ["R$ 909,1 mi", "R$ 666,7 mi", "R$ 620,9 mi", "R$ 683,0 mi", "R$ 1.000,0 mi"],
    c: "C",
    e: `1.000 ÷ 1,10⁵ = 1.000 ÷ 1,6105 = 620,9.
A) desconta 1 ano.
B) usa juros simples: 1.000 ÷ (1 + 5 × 10%).
D) desconta 4 anos (1.000 ÷ 1,4641).
E) não traz a valor presente.`,
  },
  {
    l: "a",
    q: "Um analista projeta fluxos de caixa em reais NOMINAIS (com inflação) e, por engano, os desconta por uma taxa REAL. Qual o efeito no valor?",
    o: [
      "Nenhum, pois a inflação se cancela",
      "Valor subestimado",
      "Valor superestimado",
      "Afeta só o valor terminal, que fica subestimado",
      "Afeta só os fluxos explícitos, não a perpetuidade",
    ],
    c: "C",
    e: `Fluxos nominais incluem a inflação; a taxa real não. Descontar fluxos inflados por uma taxa menor superestima o valor, e o erro é maior no valor terminal (crescimento nominal sobre taxa real). Fluxo e taxa precisam estar na mesma base.`,
  },
  {
    l: "a",
    q: "Um analista desconta o FCFE (fluxo do acionista) pelo WACC e chega ao valor do equity. Qual o erro mais provável no resultado?",
    o: [
      "Nenhum, pois FCFE e WACC são consistentes",
      "Equity value superestimado, pois o WACC é menor que o Ke",
      "Equity value subestimado, pois o WACC é maior que o Ke",
      "EV superestimado, mas equity correto",
      "Só o valor por ação muda, não o equity value",
    ],
    c: "B",
    e: `O FCFE pertence só ao acionista e deve ser descontado pelo Ke. Em empresa com dívida, o WACC é menor que o Ke (mistura o Kd, mais barato), então descontar o FCFE pelo WACC superestima o valor do equity.`,
  },
  {
    l: "b",
    q: "Uma perpetuidade de Gordon usa FCFF do ano seguinte de R$ 100 mi e WACC de 10%. Em quanto sobe o valor terminal se o crescimento perpétuo passar de 3% para 4%?",
    o: ["Cerca de 10%", "Cerca de 1%", "Cerca de 25%", "Cerca de 17%", "Cerca de 33%"],
    c: "D",
    e: `Com g = 3%: 100 ÷ 7% = 1.428,6. Com g = 4%: 100 ÷ 6% = 1.666,7. Alta de 16,7%. Um ponto a mais de crescimento muda muito o valor, por isso se usam tabelas de sensibilidade de WACC × g.`,
  },
  {
    l: "b",
    q: "O que a convenção de meio de período (mid-year convention) faz com o valor de um DCF?",
    o: [
      "Reduz o valor, pois adia os fluxos em meio ano",
      "Não muda o valor, só a apresentação",
      "Aumenta o valor, pois supõe fluxos chegando, em média, no meio de cada ano",
      "Aumenta só o valor terminal pelo múltiplo de saída",
      "Reduz o WACC em meio ponto",
    ],
    c: "C",
    e: `Supõe que o caixa entra ao longo do ano (em média no meio), e não todo no fim: cada fluxo é descontado por meio período a menos (0,5; 1,5; 2,5...), o que aumenta o valor presente. Não altera o WACC.`,
  },
]);
