import { mkq } from "./_mk";

export default mkq("credito", [
  {
    l: "a",
    q: "Uma debênture tem covenants de Dívida Líquida/EBITDA máximo de 3,0x, EBITDA/Despesa Financeira mínimo de 2,5x e ICSD (índice de cobertura do serviço da dívida) mínimo de 1,2x. No cenário de estresse, os dois primeiros seguem com folga, mas o ICSD cai para 0,9x. Qual explicação é a mais consistente?",
    o: [
      "Queda forte do EBITDA por perda de margem",
      "Alta do CDI encarecendo a dívida pós-fixada",
      "Concentração de amortizações de principal no período ou baixa conversão do EBITDA em caixa (capex, capital de giro)",
      "Aumento do caixa da companhia, que reduz a dívida líquida",
      "Alongamento da dívida com carência de principal",
    ],
    c: "C",
    e: `O ICSD compara a geração de caixa com o serviço da dívida (juros + principal). Ele piora sozinho quando o EBITDA não vira caixa (capex, capital de giro) ou quando um vencimento de principal se concentra no período, fatores que não mexem nos índices baseados em EBITDA.
A) uma queda do EBITDA pioraria também alavancagem e cobertura.
B) juros maiores derrubariam o EBITDA/Despesa Financeira.
D) mais caixa não piora o serviço da dívida.
E) carência reduz o serviço da dívida e melhora o ICSD.`,
  },
  {
    l: "b",
    q: "Uma empresa tem EBITDA de R$ 200 mi e dívida líquida de R$ 500 mi. Ela compra um concorrente com EBITDA de R$ 50 mi por R$ 400 mi, pagos 100% com dívida nova. O covenant de Dívida Líquida/EBITDA é de no máximo 3,5x. O que acontece?",
    o: [
      "Fica em 2,5x, dentro do limite",
      "Fica em 3,6x, acima do limite",
      "Fica em 4,5x, acima do limite",
      "Fica em 2,0x, pois o EBITDA novo compensa",
      "Fica em 3,2x, dentro do limite",
    ],
    c: "B",
    e: `Pro forma: dívida líquida 500 + 400 = 900; EBITDA 200 + 50 = 250. 900 ÷ 250 = 3,6x, acima do limite de 3,5x. A empresa precisaria de waiver dos credores, de pagar parte com ações ou de usar um EBITDA pro forma com sinergias, se o contrato permitir.
A) é a alavancagem antes da compra.
C) não soma o EBITDA da adquirida (900 ÷ 200).
D) e E) erram a conta.`,
  },
  {
    l: "b",
    q: "Uma empresa vai à falência e seus ativos valem R$ 600 mi. As dívidas são: R$ 400 mi sênior com garantia, R$ 300 mi sênior sem garantia e R$ 200 mi subordinada. Pela ordem de prioridade, quanto recebe cada classe (em % do valor de face)?",
    o: [
      "Com garantia 100%; sem garantia 66,7%; subordinada 0%",
      "Todas recebem 66,7%",
      "Com garantia 100%; sem garantia 100%; subordinada 0%",
      "Com garantia 100%; sem garantia 40%; subordinada 40%",
      "Com garantia 75%; sem garantia 50%; subordinada 25%",
    ],
    c: "A",
    e: `A cascata paga por ordem: os 400 com garantia recebem tudo; sobram 200 para os 300 sem garantia (66,7%); a subordinada recebe zero. Os sem garantia são a "fulcrum security" (recebem só em parte e tendem a virar acionistas numa reestruturação).
B) divide proporcionalmente, ignorando a prioridade.
C) paga mais do que existe.
D) e E) não respeitam a ordem.`,
  },
  {
    l: "a",
    q: "Uma debênture incentivada (Lei 12.431) de uma transmissora foi precificada a NTN-B + 1,50%, ou seja, a taxa real da debênture é a taxa real da NTN-B somada ao spread. A NTN-B de referência paga IPCA + 6,80% e o IPCA esperado é de 5,00% a.a. Qual o retorno nominal anual esperado, já líquido de IR, para uma pessoa física residente que leve o papel ao vencimento?",
    o: ["8,30%", "13,30%", "11,66%", "13,82%", "13,72%"],
    c: "E",
    e: `Taxa real: 6,80% + 1,50% = 8,30%. Nominal: 1,05 × 1,083 − 1 = 13,72%. Para pessoa física residente, a debênture incentivada tem alíquota zero de IR: líquido = bruto.
A) é só a taxa real.
B) soma IPCA e taxa real sem capitalizar.
C) aplica 15% de IR, ignorando a isenção.
D) capitaliza o spread separadamente (1,05 × 1,068 × 1,015), quando o enunciado diz que ele é somado à taxa real.`,
  },
  {
    l: "a",
    q: "Uma empresa tem EBITDA de R$ 120 mi e dívida bruta de R$ 500 mi a CDI + 2% a.a. O covenant exige EBITDA/Despesa Financeira de no mínimo 2,0x. Ignorando receitas financeiras, até que CDI o covenant é respeitado?",
    o: ["12,0%", "14,0%", "10,0%", "11,0%", "8,0%"],
    c: "C",
    e: `EBITDA ÷ juros ≥ 2,0 → juros ≤ 60 → taxa ≤ 60 ÷ 500 = 12% → CDI + 2% ≤ 12% → CDI ≤ 10%.
A) para na taxa total, sem descontar o spread.
B) soma o spread em vez de subtrair.
D) e E) erram a conta.`,
  },
  {
    l: "b",
    q: "Uma debênture tem duration modificada de 4 anos. Se o spread de crédito dela fecha (cai) 0,50 ponto percentual, sem mudança nos juros de referência, o que acontece aproximadamente com o preço?",
    o: ["Cai cerca de 2%", "Sobe cerca de 0,5%", "Não muda, pois a taxa de referência não mudou", "Sobe cerca de 2%", "Sobe cerca de 4%"],
    c: "D",
    e: `Variação de preço ≈ −duration modificada × variação da taxa = −4 × (−0,50%) = +2%. Spread menor = taxa total menor = preço maior.
A) inverte o sinal.
B) ignora a duration.
C) o spread também faz parte da taxa.
E) usa 1 ponto em vez de 0,5.`,
  },
  {
    l: "b",
    q: "Um investidor compra um CRI de uma securitizadora, lastreado em aluguéis de galpões pagos por uma varejista. Qual é o principal risco de crédito do papel?",
    o: [
      "O risco da securitizadora, que emitiu o título",
      "O risco do FGC, que garante o investimento",
      "O risco do devedor do lastro (a varejista) e da estrutura de garantias",
      "Não há risco de crédito, pois é isento de IR",
      "O risco do Tesouro Nacional, que regula o mercado",
    ],
    c: "C",
    e: `A securitização separa o lastro (patrimônio separado): quem paga é o devedor dos recebíveis, então o risco é o da varejista e das garantias (alienação fiduciária dos imóveis, fundo de reserva, subordinação). CRI não tem FGC, e a isenção de IR não reduz risco.`,
  },
  {
    l: "a",
    q: "Uma rede de lojas tem EBITDA de R$ 100 mi (antes do IFRS 16), aluguéis de R$ 30 mi por ano e dívida líquida financeira de R$ 250 mi. Com o IFRS 16, o passivo de arrendamento é de R$ 150 mi. Qual a alavancagem (DL/EBITDA) incluindo os arrendamentos?",
    o: ["2,50x", "4,00x", "1,92x", "3,08x", "3,33x"],
    c: "D",
    e: `Com o IFRS 16, o aluguel sai do custo: EBITDA 100 + 30 = 130. Dívida líquida com arrendamentos: 250 + 150 = 400. 400 ÷ 130 = 3,08x. Por isso muitos contratos de dívida definem os covenants "pré-IFRS 16" ou excluem arrendamentos, para não mudar a métrica.
A) ignora o IFRS 16.
B) soma a dívida, mas não ajusta o EBITDA (400 ÷ 100).
C) ajusta o EBITDA, mas não a dívida (250 ÷ 130).
E) erra a conta (400 ÷ 120).`,
  },
  {
    l: "b",
    q: "Em uma crise de aversão a risco, o que tende a acontecer com o spread dos títulos high yield (abaixo do grau de investimento) em relação aos de grau de investimento?",
    o: [
      "Os dois spreads caem igualmente",
      "O spread high yield abre (sobe) mais que o de grau de investimento",
      "O spread high yield cai, pois os juros básicos são cortados",
      "Só o spread de grau de investimento abre",
      "Os spreads não mudam, pois dependem só do rating",
    ],
    c: "B",
    e: `Na aversão a risco, investidores exigem mais prêmio por risco de inadimplência e por falta de liquidez, e emissores mais frágeis sofrem mais: os spreads abrem em todo o crédito, e muito mais no high yield. Cortes de juros básicos reduzem a taxa de referência, mas não o spread.`,
  },
]);
