import { mkq } from "./_mk";

export default mkq("contabilidade", [
  {
    l: "b",
    q: "Uma indústria revisa a vida útil de seus equipamentos e a despesa de depreciação do ano aumenta em R$ 80 mi. A depreciação é dedutível e a alíquota de IR/CSLL é de 34%. Qual o efeito sobre o caixa e o ativo total ao fim do ano?",
    o: [
      "Caixa não se altera e ativo total cai R$ 80 mi",
      "Caixa aumenta R$ 27,2 mi e ativo total cai R$ 52,8 mi",
      "Caixa cai R$ 52,8 mi e ativo total cai R$ 132,8 mi",
      "Caixa aumenta R$ 27,2 mi e ativo total cai R$ 80 mi",
      "Caixa cai R$ 27,2 mi e ativo total cai R$ 107,2 mi",
    ],
    c: "B",
    e: `O lucro antes do IR cai 80 e o imposto cai 27,2 (80 × 34%), então o lucro líquido cai 52,8. Na DFC, a depreciação volta somada (não é saída de caixa): o caixa fica 27,2 maior, que é o benefício fiscal. No balanço: caixa +27,2 e imobilizado −80 → ativo −52,8, igual à queda do PL.
A) ignora o efeito fiscal.
C) trata a depreciação como saída de caixa.
D) esquece de somar o aumento de caixa ao ativo.
E) inverte o sinal do benefício fiscal.`,
  },
  {
    l: "a",
    q: "Uma empresa vende à vista, por R$ 250 mi, um terreno com valor contábil de R$ 190 mi. O ganho é tributado a 34% e o imposto é pago no próprio exercício. Como a operação aparece na DFC pelo método indireto?",
    o: [
      "CFO de R$ 39,6 mi, CFI de R$ 250 mi e aumento de caixa de R$ 289,6 mi",
      "CFO nulo, CFI de R$ 250 mi e aumento de caixa de R$ 250 mi",
      "CFO de R$ 39,6 mi, CFI de R$ 190 mi e aumento de caixa de R$ 229,6 mi",
      "CFO de (R$ 20,4 mi), CFI de R$ 250 mi e aumento de caixa de R$ 229,6 mi",
      "CFO de R$ 60 mi, CFI de R$ 190 mi e aumento de caixa de R$ 250 mi",
    ],
    c: "D",
    e: `O ganho de 60 gera lucro líquido de 39,6 (60 × 0,66). No CFO, o ganho é estornado por não ser operacional (39,6 − 60), e sobra só o imposto pago: (20,4). O valor integral da venda, 250, entra no CFI. Caixa: 250 − 20,4 = 229,6.
A) não estorna o ganho e o conta duas vezes.
B) ignora o imposto.
C) chega ao caixa certo, mas deixa o ganho no CFO e não registra o valor total da venda no CFI.
E) ignora o imposto e erra a classificação.`,
  },
  {
    l: "b",
    q: "Em julho, uma empresa paga à vista R$ 24 mi por um seguro com cobertura de julho a junho do ano seguinte. Qual o efeito, em julho, sobre o lucro antes do IR e sobre a DFC?",
    o: [
      "Lucro cai R$ 24 mi; CFO cai R$ 24 mi",
      "Lucro não muda; CFO não muda e CFI cai R$ 24 mi",
      "Lucro cai R$ 2 mi; CFO cai R$ 24 mi",
      "Lucro cai R$ 2 mi; CFO cai R$ 2 mi e CFI cai R$ 22 mi",
      "Lucro não muda; CFO cai R$ 24 mi",
    ],
    c: "C",
    e: `Pela competência, a despesa de julho é só a parcela do mês: 24 ÷ 12 = 2. Os outros 22 ficam no ativo como despesa antecipada (ativo operacional). Na DFC, o lucro menor é ajustado pelo aumento da despesa antecipada, então o CFO cai os 24 pagos.
A) segue o regime de caixa.
B) e D) classificam a despesa antecipada como investimento.
E) reconhece a despesa só no fim da cobertura.`,
  },
  {
    l: "b",
    q: "Nos últimos quatro anos, uma empresa pagou R$ 800 mi por ano em dividendos, gerou fluxo de caixa livre médio de R$ 500 mi e manteve o saldo de caixa estável, sem aumentos de capital nem venda de ativos. Qual consequência é a mais consistente?",
    o: [
      "Dívida líquida estável, pois o caixa não variou",
      "Dívida bruta e dívida líquida maiores em cerca de R$ 300 mi por ano",
      "Patrimônio líquido estável, pois dividendos não passam pela DRE",
      "Lucro líquido menor em R$ 300 mi por ano",
      "FCF menor, pois os dividendos reduzem o CFO",
    ],
    c: "B",
    e: `A empresa distribui 300 por ano a mais do que gera. Com caixa estável e sem outras fontes, a diferença só pode ter vindo de dívida. É um nível de dividendos insustentável.
A) confunde caixa estável com dívida estável.
C) dividendos reduzem o PL, mesmo sem passar pela DRE.
D) dividendos não afetam o lucro.
E) dividendos ficam no CFF, não no CFO.`,
  },
  {
    l: "a",
    q: "Uma empresa capta R$ 300 mi em dívida a 10% a.a. em 1º de janeiro. Em 31 de dezembro, paga os juros do ano e amortiza 25% do principal. Com alíquota de 34%, qual a variação do caixa no ano por conta dessa dívida?",
    o: [
      "R$ 225,0 mi",
      "R$ 195,0 mi",
      "R$ 205,2 mi",
      "R$ 280,2 mi",
      "R$ 175,2 mi",
    ],
    c: "C",
    e: `Juros: 10% × 300 = 30, que reduzem o lucro líquido em 30 × 0,66 = 19,8 (efeito no CFO). No CFF: captação +300 e amortização −75. Variação: 300 − 75 − 19,8 = 205,2.
A) esquece os juros.
B) ignora o benefício fiscal dos juros (300 − 75 − 30).
D) esquece a amortização.
E) trata a amortização como despesa dedutível.`,
  },
  {
    l: "a",
    q: "Uma empresa tem receita líquida de R$ 900 mi, CMV de R$ 540 mi, estoques de R$ 90 mi, contas a receber de R$ 150 mi e fornecedores de R$ 60 mi (saldos médios; ano de 360 dias). Ela quer reduzir o ciclo de caixa para 60 dias apenas alongando o prazo com fornecedores. Quanto caixa essa mudança libera?",
    o: ["R$ 30 mi", "R$ 90 mi", "R$ 50 mi", "R$ 20 mi", "R$ 60 mi"],
    c: "A",
    e: `Prazo de estoque: 90 ÷ 540 × 360 = 60 dias. Prazo de recebimento: 150 ÷ 900 × 360 = 60 dias. Prazo de pagamento: 60 ÷ 540 × 360 = 40 dias. Ciclo atual: 60 + 60 − 40 = 80 dias. Para 60 dias, o prazo de pagamento sobe 20 dias, para 60: fornecedores = 540 × 60 ÷ 360 = 90, um aumento de 30 no passivo, que libera caixa.
B) usa o novo saldo de fornecedores, e não a variação.
C) aplica os 20 dias sobre a receita diária (900 ÷ 360 × 20).
D) confunde a redução de 20 dias com o valor em reais.
E) confunde o caixa liberado com o saldo atual de fornecedores (60).`,
  },
  {
    l: "b",
    q: "A receita de uma varejista cresce de R$ 400 mi para R$ 480 mi. O capital de giro operacional dela é, de forma estável, 25% da receita. Qual o efeito desse crescimento no fluxo de caixa operacional do ano?",
    o: [
      "Libera R$ 20 mi de caixa",
      "Não afeta o caixa, pois capital de giro não passa pela DRE",
      "Consome R$ 120 mi de caixa",
      "Consome R$ 20 mi de caixa",
      "Consome R$ 80 mi de caixa",
    ],
    c: "D",
    e: `O capital de giro vai de 100 (25% × 400) para 120 (25% × 480). O aumento de 20 é dinheiro "preso" em contas a receber e estoques: entra negativo no CFO.
A) inverte o sinal.
B) o capital de giro não passa pela DRE, mas passa pela DFC.
C) usa o saldo final, e não a variação.
E) usa o aumento da receita inteiro.`,
  },
  {
    l: "b",
    q: "Uma empresa compra R$ 50 mi de estoque a prazo, com pagamento em 60 dias. Qual o efeito imediato nas demonstrações?",
    o: [
      "DRE: CMV +50; caixa −50",
      "Balanço: estoque +50 e fornecedores +50; DRE e caixa sem efeito",
      "Balanço: estoque +50 e caixa −50; DRE sem efeito",
      "DRE: despesa de 50; fornecedores +50",
      "Nenhum efeito até o pagamento",
    ],
    c: "B",
    e: `A compra a prazo aumenta um ativo (estoque) e um passivo (fornecedores) no mesmo valor. A DRE só é afetada quando o estoque é vendido (CMV), e o caixa, quando o fornecedor é pago. Na DFC do período, o aumento de estoque (−50) é compensado pelo aumento de fornecedores (+50).
A) e D) lançam o custo antes da venda.
C) trata a compra como à vista.
E) ignora o registro pela competência.`,
  },
  {
    l: "a",
    q: "Com a adoção do IFRS 16, uma rede de lojas passa a registrar no balanço seus contratos de aluguel. Qual combinação de efeitos é a esperada?",
    o: [
      "EBITDA cai, dívida líquida cai e o lucro dos primeiros anos sobe",
      "EBITDA sobe, dívida líquida (com arrendamentos) sobe e o caixa total gerado não muda",
      "EBITDA não muda, dívida sobe e o caixa operacional cai",
      "EBITDA sobe e o caixa gerado pela empresa aumenta no mesmo valor",
      "Só a DFC muda: o aluguel passa do CFO para o CFI",
    ],
    c: "B",
    e: `O aluguel sai do custo operacional e vira depreciação do direito de uso + juros do passivo de arrendamento, ambos abaixo do EBITDA: o EBITDA sobe. O passivo de arrendamento entra na dívida. É só uma mudança de classificação: o caixa que a empresa gera é o mesmo (na DFC, o pagamento vai para o CFF).
A) inverte os efeitos.
C) ignora a reclassificação do aluguel.
D) confunde EBITDA maior com mais caixa.
E) o pagamento do arrendamento vai para o CFF, não para o CFI, e o balanço também muda.`,
  },
  {
    l: "b",
    q: "Uma empresa reconhece um impairment de R$ 40 mi no goodwill, não dedutível para fins fiscais. Qual o efeito no lucro líquido, no caixa e no ativo?",
    o: [
      "Lucro −26,4; caixa +13,6; ativo −26,4",
      "Lucro −40; caixa −40; ativo −40",
      "Lucro −40; caixa sem efeito; ativo −40",
      "Lucro sem efeito; caixa sem efeito; ativo −40",
      "Lucro −26,4; caixa sem efeito; ativo −26,4",
    ],
    c: "C",
    e: `Não dedutível: não há economia de imposto, então o lucro cai os 40 inteiros. Na DFC, o impairment volta somado (não é caixa): caixa inalterado. No balanço, goodwill −40 e PL −40.
A) e E) aplicam um benefício fiscal que não existe.
B) trata o impairment como saída de caixa.
D) ignora que o impairment passa pela DRE.`,
  },
  {
    l: "b",
    q: "Em janeiro, uma empresa de software recebe R$ 120 mil por uma assinatura anual, com o serviço prestado de janeiro a dezembro. Qual o efeito em janeiro?",
    o: [
      "Receita de 120 mil e CFO de 120 mil",
      "Receita de 10 mil, receita diferida de 110 mil no passivo e CFO de 120 mil",
      "Receita de 10 mil e CFO de 10 mil",
      "Nenhuma receita até dezembro; CFO de 120 mil",
      "Receita de 10 mil e 110 mil em contas a receber",
    ],
    c: "B",
    e: `Pela competência, só 1/12 do serviço foi prestado em janeiro: receita de 10 mil. Os 110 mil restantes são uma obrigação de prestar o serviço (receita diferida, no passivo). O dinheiro entrou inteiro: o aumento da receita diferida soma ao CFO, que fica em 120 mil.
A) e D) ignoram a competência.
C) segue o regime de caixa só na metade.
E) a empresa já recebeu; não há valor a receber.`,
  },
  {
    l: "a",
    q: "A Alfa tem 30% da Beta e a registra por equivalência patrimonial. No ano, a Beta teve lucro de R$ 200 mi e pagou R$ 50 mi em dividendos no total. Quanto varia o saldo do investimento na Beta no balanço da Alfa?",
    o: ["+R$ 60 mi", "+R$ 45 mi", "+R$ 15 mi", "+R$ 150 mi", "Não varia; só a DRE é afetada"],
    c: "B",
    e: `A Alfa reconhece 30% do lucro (+60), que aumenta o investimento, e os dividendos recebidos (30% × 50 = 15) reduzem o investimento (viram caixa). Variação: 60 − 15 = +45. Na DFC, os 60 de equivalência são estornados (não caixa) e os 15 recebidos entram como caixa.
A) esquece os dividendos.
C) considera só os dividendos.
D) usa 100% do lucro menos 100% dos dividendos.
E) o investimento é ajustado no balanço pela equivalência.`,
  },
  {
    l: "a",
    q: "Uma empresa paga R$ 30 mi de remuneração em ações (stock-based compensation) aos executivos. Como esse valor deve ser tratado por um analista?",
    o: [
      "Ignorado, pois não é caixa e não afeta o acionista",
      "Somado de volta ao EBITDA e ao fluxo de caixa sem nenhum ajuste, pois não é caixa",
      "É despesa na DRE e não caixa na DFC; em valuation, é custo econômico real (dilui o acionista) e não deveria ser simplesmente somado de volta",
      "Lançado só no PL, sem passar pela DRE",
      "Tratado como investimento (CFI), por remunerar a gestão no longo prazo",
    ],
    c: "C",
    e: `A remuneração em ações é despesa na DRE, volta somada na DFC por não ser caixa e aumenta o PL. Mas tem custo real: dilui os acionistas. Somá-la de volta ao EBITDA "ajustado" ou ao FCF sem contar as ações novas superestima o valor.
A) ignora a diluição.
B) é o erro comum que o enunciado quer evitar.
D) ela passa pela DRE.
E) não é investimento.`,
  },
  {
    l: "b",
    q: "Em um período de inflação, duas empresas idênticas usam métodos diferentes de custo de estoque: uma usa FIFO (PEPS) e a outra, custo médio. Qual tende a reportar maior lucro bruto?",
    o: [
      "A que usa custo médio, porque o custo médio é sempre menor",
      "As duas reportam o mesmo lucro, pois o método não muda a receita",
      "A que usa FIFO, porque vende primeiro o estoque mais antigo e barato",
      "A que usa FIFO, porque seu estoque final fica com custo menor",
      "Nenhuma: na inflação, o lucro bruto cai igualmente nas duas",
    ],
    c: "C",
    e: `No FIFO, o CMV usa os custos mais antigos (menores, com inflação), então o lucro bruto é maior e o estoque final fica com os custos recentes (maiores). O custo médio fica no meio. (LIFO, que daria o menor lucro, não é aceito no IFRS nem no Brasil.)
A) o custo médio fica acima do FIFO na inflação.
B) o método muda o CMV.
D) o estoque final no FIFO fica com custo MAIOR.
E) ignora a diferença de CMV.`,
  },
]);
