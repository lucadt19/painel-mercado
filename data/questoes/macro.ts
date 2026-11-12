import { mkq } from "./_mk";

export default mkq("macro", [
  {
    l: "b",
    q: "A dívida pública de um país está alta após anos de déficits. O governo anuncia novo aumento de gastos enquanto o Banco Central sobe os juros para conter a inflação. Qual consequência é a mais coerente com a teoria?",
    o: [
      "O aperto monetário anula o efeito fiscal: atividade, juros e dívida não se alteram",
      "A expansão fiscal reduz o risco de refinanciamento, pois o crescimento maior aumenta a arrecadação",
      "A expansão fiscal reforça a pressão sobre os juros, encarece a rolagem da dívida e tende a reduzir o investimento privado",
      "A alta de juros afeta só os títulos novos e não muda as expectativas do mercado",
      "O Banco Central certamente abandonará a alta de juros, o que torna a política fiscal mais potente",
    ],
    c: "C",
    e: `Política fiscal expansionista com aperto monetário: mais competição por recursos, juros mais altos e menos investimento privado (efeito deslocamento, crowding out). Com dívida alta, juros maiores encarecem o refinanciamento e pioram a dinâmica da dívida.
A) supõe cancelamento perfeito.
B) ignora que o custo da dívida sobe junto com os juros.
D) despreza o canal de confiança e das expectativas.
E) o risco de "dominância fiscal" existe, mas a alternativa o trata como certo e conclui, sem base, que a política fiscal fica mais potente.`,
  },
  {
    l: "a",
    q: "Numa economia, as demissões pararam, mas as empresas preferem pagar horas extras a contratar, e o desemprego segue alto. As vendas voltaram a crescer antes da produção, reduzindo estoques. Há capacidade ociosa, e os poucos investimentos vão para eficiência e tecnologia. Em que fase do ciclo está a economia?",
    o: [
      "Expansão, pois as vendas sobem e os estoques caem",
      "Contração, pois o desemprego está alto e o investimento é baixo",
      "Desaceleração, pois as empresas evitam contratar",
      "Recuperação, pois as vendas retomam antes da produção e as demissões pararam",
      "Contração, pois os estoques caem e a produção está abaixo das vendas",
    ],
    c: "D",
    e: `Os sinais mostram a direção, não o nível: demissões cessaram, vendas puxam a produção (estoques caem pela demanda), investimento em eficiência, capacidade ociosa. É a recuperação.
A) na expansão, as empresas contratam e investem em capacidade, e o desemprego cai.
B) olha o nível e ignora a direção: na contração, as demissões continuam.
C) a desaceleração ocorre perto do pico, sem capacidade ociosa, com estoques subindo.
E) na contração, o estoque cai porque a produção é cortada em meio a demissões.`,
  },
  {
    l: "a",
    q: "O dólar à vista está a R$ 5,00. Os juros de 1 ano são de 12% no Brasil e de 4% nos EUA. Pela paridade coberta de juros, qual o dólar futuro de 1 ano?",
    o: ["R$ 5,40", "R$ 4,64", "R$ 5,00", "R$ 5,38", "R$ 5,60"],
    c: "D",
    e: `Futuro = spot × (1 + juro BR) ÷ (1 + juro EUA) = 5,00 × 1,12 ÷ 1,04 ≈ 5,385. Se fosse diferente, haveria arbitragem (tomar em uma moeda, aplicar na outra e travar o câmbio).
A) usa o diferencial simples (5 × 1,08).
B) inverte a fórmula.
C) ignora o diferencial de juros.
E) aplica os juros brasileiros sem os americanos.`,
  },
  {
    l: "b",
    q: "As expectativas de inflação para os próximos dois anos sobem e se afastam da meta, com a atividade aquecida. O que se espera do Copom, pela lógica do regime de metas?",
    o: [
      "Cortar a Selic para estimular o crédito",
      "Manter a Selic, pois a inflação corrente já está alta",
      "Subir a Selic (ou mantê-la alta por mais tempo) para ancorar as expectativas",
      "Vender reservas para valorizar o real, sem mexer nos juros",
      "Aumentar o compulsório e cortar a Selic ao mesmo tempo",
    ],
    c: "C",
    e: `No regime de metas, o BC reage às expectativas de inflação no horizonte relevante. Expectativas desancoradas com atividade forte pedem política monetária mais restritiva.`,
  },
  {
    l: "b",
    q: "Com a Selic em 13,75% a.a. e inflação esperada de 4,5% para os próximos 12 meses, qual o juro real ex-ante aproximado?",
    o: ["9,25%", "8,85%", "18,25%", "3,06%", "13,75%"],
    c: "B",
    e: `(1,1375 ÷ 1,045) − 1 ≈ 8,85%. A subtração simples (9,25%) é a aproximação de cabeça, que superestima um pouco.
C) soma as taxas.
D) divide uma pela outra (13,75 ÷ 4,5).
E) ignora a inflação.`,
  },
  {
    l: "b",
    q: "A curva de juros de um país fica invertida: os juros de 1 ano estão acima dos de 10 anos. O que isso costuma indicar?",
    o: [
      "Expectativa de alta forte de juros no futuro",
      "Expectativa de cortes de juros, frequentemente associada a desaceleração",
      "Que o Tesouro deixou de emitir títulos longos",
      "Inflação de longo prazo maior que a de curto prazo",
      "Que o prêmio de risco de longo prazo é muito alto",
    ],
    c: "B",
    e: `Curva invertida: o mercado espera juros curtos menores no futuro (cortes), o que costuma vir com desaceleração ou recessão. Nos EUA, a inversão é um sinal clássico de recessão à frente.`,
  },
  {
    l: "a",
    q: "Uma depreciação forte do real tende a ter qual efeito sobre a inflação no Brasil, no curto prazo?",
    o: [
      "Reduzir a inflação, pois torna as exportações mais competitivas",
      "Nenhum, pois o câmbio só afeta o comércio exterior",
      "Elevar a inflação, pelo repasse aos preços de importados e de bens cotados em dólar (combustíveis, alimentos)",
      "Elevar a inflação só no longo prazo, nunca no curto",
      "Reduzir a inflação de serviços e elevar a de bens na mesma proporção",
    ],
    c: "C",
    e: `O repasse cambial (pass-through) chega rápido aos preços de bens importados e de commodities cotadas em dólar (combustíveis, trigo, carnes), e depois a outros preços. Por isso o BC acompanha o câmbio de perto.`,
  },
  {
    l: "a",
    q: "A dívida pública é de 80% do PIB, o juro real médio da dívida é de 6% a.a. e o PIB cresce 2% a.a. em termos reais. Qual superávit primário (em % do PIB), aproximadamente, estabiliza a dívida/PIB?",
    o: ["0,0%", "1,6%", "3,2%", "4,8%", "6,4%"],
    c: "C",
    e: `Primário necessário ≈ (r − g) × dívida/PIB = (6% − 2%) × 80% = 3,2% do PIB. Com primário menor, a dívida/PIB sobe; com juros reais acima do crescimento, é preciso superávit para estabilizá-la.
B) usa só metade da diferença.
D) usa 6% × 80%.
E) soma r e g.`,
  },
  {
    l: "b",
    q: "Pela ótica da despesa, PIB = C + I + G + (X − M). Se as importações aumentam e todo o resto fica igual, o que acontece com o PIB medido?",
    o: [
      "Sobe, pois houve mais comércio",
      "Cai, pois as importações são subtraídas",
      "Não muda, pois importações não entram na conta",
      "Sobe, pois o consumo de importados entra em C",
      "Depende do câmbio, não das importações",
    ],
    c: "B",
    e: `Mantido todo o resto, mais importações significam menos produção doméstica atendendo a mesma demanda: X − M cai e o PIB cai. (Na prática, importações que entram como consumo também elevam C; a questão isola o efeito do M.)`,
  },
  {
    l: "a",
    q: "Um banco central faz 'quantitative easing' (compra de títulos longos em grande escala). Qual efeito é esperado sobre a curva de juros e os ativos?",
    o: [
      "Juros longos sobem e ações caem",
      "Juros longos caem, o que tende a valorizar ações e outros ativos de risco",
      "Só os juros de um dia mudam",
      "A moeda local se valoriza fortemente",
      "Nenhum efeito, pois a taxa básica já está em zero",
    ],
    c: "B",
    e: `Comprando títulos longos, o BC eleva seus preços e reduz os juros longos (prêmio de prazo menor), empurrando investidores para ativos de risco. Costuma desvalorizar a moeda local e é usado quando a taxa básica já está perto de zero.`,
  },
  {
    l: "b",
    q: "Na curva de Phillips de curto prazo, qual a relação esperada entre desemprego e inflação?",
    o: [
      "Desemprego e inflação sobem sempre juntos",
      "Relação inversa: desemprego baixo tende a vir com inflação maior",
      "Não há relação em nenhum prazo",
      "Desemprego alto causa inflação alta",
      "Relação inversa também no longo prazo, que o BC pode explorar",
    ],
    c: "B",
    e: `No curto prazo, mercado de trabalho apertado pressiona salários e preços. No longo prazo, com expectativas ajustadas, a curva tende a ser vertical na taxa natural de desemprego: o BC não consegue comprar emprego permanente com mais inflação.`,
  },
  {
    l: "b",
    q: "Em qual conta do balanço de pagamentos entra o investimento direto de uma empresa estrangeira que constrói uma fábrica no Brasil?",
    o: [
      "Balança comercial",
      "Conta de serviços",
      "Conta financeira (investimento direto no país)",
      "Renda primária",
      "Reservas internacionais",
    ],
    c: "C",
    e: `O investimento direto é registrado na conta financeira. Lucros e dividendos remetidos depois vão para a renda primária (conta corrente). A balança comercial registra exportações e importações de bens.`,
  },
]);
