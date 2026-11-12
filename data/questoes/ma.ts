import { mkq } from "./_mk";

export default mkq("ma", [
  {
    l: "b",
    q: "A Alfa tem valor de mercado de R$ 3.000 mi e lucro líquido de R$ 200 mi. Ela vai comprar 100% da Beta, que vale R$ 800 mi em bolsa e tem lucro de R$ 50 mi, pagando prêmio de 25% sobre a cotação, integralmente em ações novas da Alfa. Sem sinergias, a operação é:",
    o: [
      "Acretiva, pois a Beta negocia a 16x, perto do P/L da Alfa",
      "Neutra, pois em operações pagas em ações o efeito no LPA é nulo",
      "Diluitiva, pois o P/L pago pela Beta (20x) é maior que o P/L da Alfa (15x)",
      "Acretiva, pois o lucro da Beta se soma sem custo de juros",
      "Diluitiva, pois toda emissão de ações reduz o LPA",
    ],
    c: "C",
    e: `Em operação 100% em ações, compare o P/L do comprador com o P/L pago. Alfa: 3.000 ÷ 200 = 15x. Preço pago: 800 × 1,25 = 1.000 → 1.000 ÷ 50 = 20x. A Alfa "paga" com ações mais baratas (15x) do que o lucro que compra (20x): cada ação emitida traz menos lucro do que a Alfa já gera por ação.
A) o múltiplo relevante é o pago, com prêmio (16x a mercado também já seria maior que 15x).
B) só seria neutra com P/L iguais.
D) o custo vem da emissão de ações.
E) emissão não dilui por si: com P/L pago menor que 15x, seria acretiva.`,
  },
  {
    l: "b",
    q: "Uma empresa vai usar R$ 500 mi de caixa, que hoje rende 10% a.a. antes do IR (alíquota 34%), para comprar uma empresa com lucro líquido de R$ 40 mi. Sem sinergias, a operação é:",
    o: [
      "Acretiva, pois o rendimento do lucro comprado (8%) supera o custo do caixa após IR (6,6%)",
      "Diluitiva, pois o caixa rende 10%, mais que os 8% do lucro comprado",
      "Neutra, pois não há emissão de ações",
      "Diluitiva, pois toda aquisição em caixa reduz o lucro",
      "Acretiva, pois o caixa não tem custo",
    ],
    c: "A",
    e: `O custo do caixa é o rendimento que se deixa de ganhar, após o IR: 10% × 0,66 = 6,6%. O lucro comprado rende 40 ÷ 500 = 8% sobre o preço. 8% > 6,6% → o lucro líquido sobe mais do que cai a receita financeira, e o LPA sobe (sem novas ações).
B) compara com o rendimento antes do IR.
C) e E) o caixa tem custo de oportunidade.
D) depende do preço pago.`,
  },
  {
    l: "a",
    q: "A Gama compra uma empresa pagando P/L de 14x, financiada 100% com dívida a 12% a.a., alíquota de 34%. Sem sinergias, a operação é:",
    o: [
      "Acretiva, pois juros são dedutíveis",
      "Diluitiva, pois o custo da dívida após IR (7,92%) supera o rendimento do lucro comprado (7,14%)",
      "Acretiva, pois 1 ÷ 14 é maior que 12% × 34%",
      "Neutra, pois não há emissão de ações",
      "Diluitiva, pois o custo da dívida antes do IR (12%) supera 7,14%",
    ],
    c: "B",
    e: `Custo da dívida após IR: 12% × 0,66 = 7,92%. Rendimento do lucro comprado: 1 ÷ 14 = 7,14%. A dívida custa mais do que o lucro que traz → LPA cai.
A) a dedutibilidade já está nos 7,92%.
C) compara com o benefício fiscal, e não com o custo líquido.
D) a dívida também tem custo.
E) chega à resposta certa pelo motivo errado: tem de comparar após o IR.`,
  },
  {
    l: "a",
    q: "A Delta tem lucro líquido de R$ 100 mi e 50 mi de ações (LPA de R$ 2,00). Compra uma empresa com lucro de R$ 20 mi por R$ 300 mi, financiada 100% com dívida a 10% a.a.; alíquota de 34%. Qual o LPA pro forma?",
    o: ["R$ 2,40", "R$ 1,604", "R$ 2,00", "R$ 2,004", "R$ 1,80"],
    c: "D",
    e: `Juros: 10% × 300 = 30, após IR: 19,8. Lucro pro forma: 100 + 20 − 19,8 = 100,2. Ações: 50 mi (sem emissão). LPA = 100,2 ÷ 50 = R$ 2,004: acréscimo marginal de 0,2%.
A) ignora os juros.
B) desconta os juros sem somar o lucro da comprada (100 − 19,8).
C) supõe efeito nulo.
E) desconta os juros antes do IR (100 + 20 − 30 = 90).`,
  },
  {
    l: "a",
    q: "A Alfa (100 mi de ações a R$ 30; lucro de R$ 200 mi) compra a Beta (lucro de R$ 50 mi) por R$ 1.000 mi em ações novas, emitidas a R$ 30. Quantas sinergias ANTES do IR (alíquota de 34%) são necessárias para a operação não diluir o LPA?",
    o: ["Cerca de R$ 16,7 mi", "Cerca de R$ 25,3 mi", "Cerca de R$ 50,0 mi", "Cerca de R$ 11,0 mi", "Cerca de R$ 33,3 mi"],
    c: "B",
    e: `Ações novas: 1.000 ÷ 30 = 33,33 mi → total 133,33 mi. LPA sozinho: 200 ÷ 100 = 2,00. Lucro necessário: 2,00 × 133,33 = 266,7. Lucro combinado sem sinergias: 250. Faltam 16,7 após IR → 16,7 ÷ 0,66 ≈ 25,3 antes do IR.
A) esquece de converter para antes do IR.
C) usa o lucro da Beta.
D) multiplica por 0,66 em vez de dividir.
E) usa o número de ações novas.`,
  },
  {
    l: "b",
    q: "Uma empresa paga R$ 900 mi por 100% de outra, cujo PL contábil é de R$ 500 mi. Na alocação do preço, marcas e carteira de clientes são avaliadas em R$ 150 mi a mais que o valor contábil (ignore impostos diferidos). Qual o goodwill?",
    o: ["R$ 400 mi", "R$ 250 mi", "R$ 150 mi", "R$ 900 mi", "R$ 550 mi"],
    c: "B",
    e: `Preço − PL a valor justo = 900 − (500 + 150) = 250. Os 150 de intangíveis identificáveis viram ativos próprios (amortizados); o resíduo é goodwill (não amortizado, testado por impairment).
A) não aloca os intangíveis.
C) confunde a mais-valia com o goodwill.
D) usa o preço inteiro.
E) soma em vez de subtrair a mais-valia (900 − 500 + 150).`,
  },
  {
    l: "a",
    q: "Num acordo 'cash-free, debt-free', o EV combinado é de R$ 1.000 mi. A empresa tem dívida de R$ 300 mi, caixa de R$ 50 mi e capital de giro R$ 20 mi abaixo do nível normal (working capital peg). Quanto o comprador paga pelas ações?",
    o: ["R$ 750 mi", "R$ 770 mi", "R$ 650 mi", "R$ 730 mi", "R$ 1.000 mi"],
    c: "D",
    e: `Equity = EV − dívida + caixa ± ajuste de capital de giro = 1.000 − 300 + 50 − 20 = 730. O capital de giro abaixo do normal reduz o preço, porque o comprador terá de repor esse caixa.
A) esquece o ajuste de capital de giro (1.000 − 300 + 50).
B) soma o ajuste em vez de subtrair.
C) subtrai o caixa em vez de somar.
E) paga o EV pelas ações.`,
  },
  {
    l: "b",
    q: "Comprador e vendedor discordam do crescimento futuro da empresa-alvo: o vendedor acredita em EBITDA muito maior nos próximos dois anos. Qual mecanismo ajuda a fechar o negócio?",
    o: ["Fairness opinion", "Earn-out", "Tag along", "Break-up fee", "Cláusula de não concorrência"],
    c: "B",
    e: `O earn-out paga parte do preço no futuro, condicionada a metas (ex.: EBITDA). Se as projeções do vendedor se confirmarem, ele recebe mais; se não, o comprador não pagou por isso.
A) é parecer de preço justo.
C) protege minoritários na venda de controle.
D) é multa se o negócio for desfeito.
E) protege o comprador da concorrência do vendedor.`,
  },
  {
    l: "b",
    q: "Qual tipo de sinergia o mercado costuma considerar mais confiável ao avaliar uma fusão?",
    o: [
      "Vendas cruzadas para a base de clientes combinada",
      "Aumento de preços pela maior participação de mercado",
      "Redução de despesas administrativas duplicadas",
      "Lançamento de novos produtos conjuntos",
      "Expansão internacional usando a marca da adquirida",
    ],
    c: "C",
    e: `Sinergias de custo (fechar estruturas duplicadas, compras em escala) dependem da gestão e acontecem mais rápido. As de receita (A, D, E) dependem de clientes e mercado e são mais incertas. B ainda pode esbarrar no CADE.`,
  },
  {
    l: "a",
    q: "Um banco recomenda a um comprador estratégico um preço máximo para uma aquisição. Qual metodologia tende a indicar o MAIOR valor que esse comprador poderia pagar?",
    o: [
      "Comparáveis de mercado (trading comps)",
      "LBO com TIR-alvo de 25%",
      "DCF da empresa-alvo isolada mais o valor presente das sinergias",
      "Valor de liquidação",
      "Valor patrimonial contábil",
    ],
    c: "C",
    e: `O estratégico pode pagar até o valor do alvo sozinho mais as sinergias que só ele captura (descontado o custo de integração). Comps não têm prêmio de controle; o LBO é um "piso" (fundo exige TIR alta e não tem sinergias); liquidação e valor contábil ficam abaixo para empresas saudáveis.`,
  },
]);
