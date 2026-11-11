import { mk } from "./_mk";

export default mk("ma", [
  ["b", "Me explique um merger model (accretion/dilution).", `
- Define preço e forma de pagamento (caixa, dívida, ações).
- Projeta o lucro líquido de comprador e alvo.
- Combina: lucro do comprador + lucro do alvo − juros perdidos sobre o caixa usado − juros da dívida nova (após IR) − amortização de intangíveis novos + sinergias.
- Divide pelo novo número de ações (com as emitidas) → LPA pro forma.
- Compara com o LPA do comprador sozinho: maior = acréscimo (accretive); menor = diluição (dilutive).`],
  ["b", "Por que uma empresa compra outra?", `
Crescer mais rápido que organicamente; ganhar mercado ou eliminar concorrente; sinergias de custo (cortar duplicidades) e de receita (vender mais para a base combinada); adquirir tecnologia, marca ou equipe; diversificar; ou porque o alvo está barato.`],
  ["b", "Como saber se uma aquisição com 100% em ações será acréscimo ou diluição, sem fazer a conta?", `
Compare o P/L: se o P/L do comprador é maior que o P/L pago pelo alvo (preço da compra ÷ lucro do alvo), a operação é acréscimo. Intuição: o comprador "paga" com ações caras (de P/L alto) e compra lucro barato.`],
  ["b", "E para pagamento em caixa ou dívida, qual a regra rápida?", `
Compare o custo após impostos do caixa ou da dívida com o "rendimento do lucro" do alvo (1 ÷ P/L pago). Se o retorno do lucro comprado é maior que o custo após IR do financiamento, é acréscimo. Ordem típica de custo: caixa (perde só o juro do caixa) < dívida < ações.`],
  ["b", "O que são sinergias? Quais são mais confiáveis?", `
Ganhos que só existem com a combinação. Sinergias de custo (fechar sede, cortar áreas duplicadas, poder de compra) são mais confiáveis e rápidas. Sinergias de receita (vendas cruzadas) são mais incertas; o mercado costuma descontá-las.`],
  ["b", "Quais as formas de pagar uma aquisição e prós e contras de cada uma?", `
- Caixa: rápido, sem diluição; mas usa a liquidez da empresa.
- Dívida: barata após IR e sem diluição; aumenta a alavancagem e o risco.
- Ações: preserva caixa e divide o risco com os vendedores; dilui os acionistas e costuma ser o mais caro em termos de custo de capital.`],
  ["b", "O que é due diligence?", `
A investigação do comprador sobre o alvo antes de fechar: financeira (qualidade do resultado, dívida, capital de giro), jurídica, fiscal, trabalhista, ambiental, comercial e de TI. Serve para validar o preço, achar riscos e definir garantias e indenizações no contrato.`],
  ["b", "Qual a diferença entre compra de ações e compra de ativos?", `
Na compra de ações (stock deal), o comprador assume a empresa inteira, com todos os passivos (inclusive ocultos). Na compra de ativos (asset deal), escolhe ativos e passivos específicos. A compra de ativos protege o comprador e pode trazer benefícios fiscais (reavaliação dos ativos), mas é mais trabalhosa e pode gerar imposto maior para o vendedor.`],
  ["a", "Como o goodwill e os intangíveis novos são criados numa aquisição?", `
Preço de compra (equity) − patrimônio líquido contábil do alvo = excesso. Parte dele é alocada à reavaliação de ativos a valor justo (imobilizado, intangíveis identificáveis como marcas e carteira de clientes, que geram amortização). O que sobra é goodwill (não amortizado, testado por impairment).`],
  ["a", "Uma aquisição acréscimo é sempre boa? E uma diluição é sempre ruim?", `
Não. LPA é métrica contábil de curto prazo. Uma compra com dívida barata pode ser acréscimo e destruir valor (se o retorno sobre o capital investido for menor que o WACC). Uma compra diluidora no ano 1 pode criar valor se o alvo crescer rápido ou houver sinergias grandes. O critério correto é o valor (VPL do negócio vs. preço pago).`],
  ["a", "Quanto de sinergia é preciso para uma operação deixar de ser diluidora?", `
Calcule a diluição em reais de lucro: (LPA sozinho − LPA pro forma) × ações pro forma. Divida por (1 − alíquota) para ter as sinergias antes do IR necessárias. É uma pergunta comum de "breakeven".`],
  ["a", "O que é contribution analysis?", `
Compara o quanto cada empresa contribui (receita, EBITDA, lucro) para a combinada com a participação acionária que cada grupo de acionistas terá após a fusão. Ajuda a defender a relação de troca numa fusão por ações.`],
  ["a", "O que é um earn-out e por que se usa?", `
Parte do preço paga no futuro, condicionada a metas (ex.: EBITDA nos próximos 2 anos). Usado quando comprador e vendedor discordam das projeções: o vendedor recebe mais se o desempenho vier. Também ajuda a reter os fundadores.`],
  ["a", "Como o comprador trata o caixa e a dívida do alvo num acordo 'cash-free, debt-free'?", `
O preço é negociado em base de enterprise value: o vendedor fica com o caixa e paga a dívida no fechamento (ou o preço do equity é ajustado por isso), mais um ajuste pelo capital de giro normal (working capital peg). Assim o comprador paga só pelo negócio operacional.`],
  ["a", "O que é uma fairness opinion?", `
Parecer de um banco ou consultoria de que o preço de uma transação é justo, do ponto de vista financeiro, para os acionistas. Protege o conselho de administração juridicamente. Baseia-se nas mesmas metodologias (comps, transações, DCF).`],
]);
