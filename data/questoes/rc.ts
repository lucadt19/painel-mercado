import { mkq } from "./_mk";

const P1 = `Reading Comprehension.

For most of the twentieth century, economists assumed that central banks could control inflation simply by managing the money supply. In the 1980s, however, the relationship between measured money growth and inflation weakened in many countries, as financial innovation created new kinds of deposits that were hard to classify. Central banks gradually shifted to targeting interest rates directly and, beginning with New Zealand in 1990, to announcing explicit inflation targets.

Supporters of inflation targeting argue that a public, numerical target anchors the expectations of firms and workers: if people believe inflation will stay near the target, they set prices and wages accordingly, making the target partly self-fulfilling. Critics respond that a narrow focus on inflation may lead central banks to ignore financial imbalances, such as rapid growth in credit or asset prices, that can end in costly crises. The 2008 financial crisis, which occurred in a period of low and stable inflation, gave this critique new force.`;

const P2 = `Reading Comprehension.

Behavioral economists have documented that individual investors tend to sell stocks that have risen in value too soon and to hold stocks that have fallen for too long, a pattern known as the disposition effect. One explanation draws on prospect theory, which holds that people feel losses more intensely than equivalent gains and evaluate outcomes relative to a reference point, typically the purchase price. Selling a losing stock would turn a "paper" loss into a realized one, which investors find painful.

The disposition effect is costly. Because past winners tend, on average, to continue outperforming for several months, selling them early sacrifices returns, and in many tax systems holding losers postpones tax benefits that selling would provide. Some researchers note, however, that professional fund managers display the effect to a lesser degree, suggesting that training and accountability can reduce it.`;

export default mkq("rc", [
  {
    l: "b",
    q: `${P1}\n\nThe primary purpose of the passage is to:`,
    o: [
      "argue that central banks should return to targeting the money supply",
      "explain the causes of the 2008 financial crisis",
      "describe the shift to inflation targeting and present arguments for and against it",
      "compare the economic policies of New Zealand and other countries",
      "prove that inflation targeting caused financial crises",
    ],
    c: "C",
    e: `O texto descreve a mudança (da oferta de moeda para metas de inflação) e apresenta defensores e críticos. Não defende a volta à oferta de moeda (A), não se dedica às causas da crise (B) e não afirma que as metas causaram crises (E).`,
  },
  {
    l: "b",
    q: `${P1}\n\nAccording to the passage, why did central banks move away from targeting the money supply?`,
    o: [
      "Financial innovation weakened the link between measured money growth and inflation",
      "Inflation became too low to measure",
      "New Zealand required them to",
      "Interest rates could no longer be controlled",
      "The 2008 crisis showed that money targets failed",
    ],
    c: "A",
    e: `O primeiro parágrafo diz que, nos anos 1980, a relação entre crescimento monetário e inflação enfraqueceu por causa de inovações financeiras. A crise de 2008 (E) veio décadas depois.`,
  },
  {
    l: "a",
    q: `${P1}\n\nThe author mentions that the 2008 crisis "occurred in a period of low and stable inflation" most likely in order to:`,
    o: [
      "show that inflation targeting had failed to control inflation",
      "argue that New Zealand's policy was a mistake",
      "suggest that the crisis was caused by high interest rates",
      "support the critics' point that stable inflation does not guarantee financial stability",
      "show that expectations were not anchored",
    ],
    c: "D",
    e: `O detalhe reforça a crítica: mesmo com inflação baixa e estável (o objetivo das metas), houve uma grande crise financeira, ou seja, o foco estreito na inflação pode ignorar desequilíbrios. A contradiz o texto: a inflação estava controlada.`,
  },
  {
    l: "a",
    q: `${P1}\n\nSupporters of inflation targeting would most likely agree with which of the following?`,
    o: [
      "A public target has no effect on how firms set prices",
      "Central banks should target asset prices instead of inflation",
      "Money supply targets are more credible than inflation targets",
      "Inflation targets cause credit booms",
      "If workers expect inflation of 3%, wage demands will tend to be consistent with 3% inflation",
    ],
    c: "E",
    e: `Os defensores dizem que a meta ancora expectativas: se as pessoas esperam inflação perto da meta, ajustam preços e salários de acordo. E aplica exatamente essa ideia.`,
  },
  {
    l: "b",
    q: `${P2}\n\nThe "disposition effect," as described in the passage, refers to the tendency of investors to:`,
    o: [
      "buy stocks that have recently fallen",
      "sell rising stocks too early and hold falling stocks too long",
      "trade more often than professionals",
      "avoid stocks entirely after a loss",
      "follow the recommendations of fund managers",
    ],
    c: "B",
    e: `Definição dada na primeira frase do texto.`,
  },
  {
    l: "b",
    q: `${P2}\n\nAccording to prospect theory as presented in the passage, investors hold losing stocks because:`,
    o: [
      "tax rules forbid selling at a loss",
      "they expect losers to outperform",
      "professional advice tells them to",
      "realizing a loss is painful, since losses are felt more intensely than equivalent gains",
      "they do not know the purchase price",
    ],
    c: "D",
    e: `O texto explica que perdas pesam mais que ganhos equivalentes e que vender transformaria a perda "no papel" em perda realizada, o que é doloroso. A contradiz o texto (vender perdedoras traria benefício fiscal).`,
  },
  {
    l: "a",
    q: `${P2}\n\nThe passage suggests that the disposition effect is costly for which of the following reasons?`,
    o: [
      "Past winners tend to keep outperforming for a while, and holding losers can delay tax benefits",
      "Past losers usually rebound quickly",
      "Professional managers charge high fees",
      "Selling winners creates tax refunds",
      "Investors trade too rarely",
    ],
    c: "A",
    e: `O segundo parágrafo dá dois custos: vencedoras tendem a continuar subindo por alguns meses (vender cedo perde retorno) e segurar perdedoras adia benefícios fiscais.`,
  },
  {
    l: "a",
    q: `${P2}\n\nThe information about professional fund managers in the final sentence serves mainly to:`,
    o: [
      "show that the disposition effect does not exist",
      "prove that professionals earn higher returns",
      "suggest that the bias can be reduced, though not necessarily eliminated",
      "argue that individuals should not invest",
      "contradict prospect theory",
    ],
    c: "C",
    e: `Os profissionais mostram o efeito "em menor grau": o viés existe, mas treinamento e cobrança podem reduzi-lo. A e E exageram; B e D não estão no texto.`,
  },
]);
