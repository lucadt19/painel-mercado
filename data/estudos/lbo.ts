import { mk } from "./_mk";

export default mk("lbo", [
  ["b", "Me explique um modelo de LBO (walk me through an LBO).", `
- Define o preço de compra (múltiplo de EBITDA) e o financiamento: muita dívida + aporte de equity do fundo.
- Projeta a operação por 3–7 anos; o caixa livre amortiza a dívida.
- Na saída, vende a empresa (em geral pelo mesmo múltiplo).
- Equity na saída = EV de saída − dívida líquida restante.
- Calcula a TIR (IRR) e o múltiplo sobre o capital investido (MOIC) do fundo.`],
  ["b", "Por que usar alavancagem num LBO?", `
Para aumentar o retorno sobre o equity: o fundo coloca menos dinheiro próprio, e o caixa da empresa paga a dívida, fazendo a fatia do equity crescer. Juros dedutíveis ajudam. O custo: mais risco de não conseguir pagar a dívida.`],
  ["b", "Quais são as fontes de retorno num LBO?", `
- Crescimento do EBITDA (receita e margem).
- Desalavancagem: pagamento da dívida com o caixa gerado.
- Expansão de múltiplo: vender por um múltiplo maior que o de compra (não se deve contar com isso).`],
  ["b", "Que características fazem uma boa candidata a LBO?", `
Fluxo de caixa estável e previsível; pouca necessidade de capex e capital de giro; posição de mercado forte; possibilidade de melhorar a eficiência; ativos que sirvam de garantia; gestão boa; preço razoável e caminhos de saída claros (venda estratégica, IPO).`],
  ["b", "Qual a diferença entre TIR e MOIC?", `
MOIC é quantas vezes o dinheiro voltou (ex.: 2,5x), sem considerar o tempo. TIR é a taxa anual de retorno, que considera quando o dinheiro entra e sai. 2x em 3 anos ≈ 26% a.a.; 2x em 5 anos ≈ 15% a.a. Fundos olham os dois.`],
  ["b", "Quais regras de bolso relacionam MOIC e TIR?", `
Dobrar o dinheiro: em 3 anos ≈ 26%; em 5 anos ≈ 15%. Triplicar: em 3 anos ≈ 44%; em 5 anos ≈ 25%. (Regra do 72: anos para dobrar ≈ 72 ÷ taxa%.)`],
  ["b", "Quais tipos de dívida aparecem num LBO, do mais seguro ao mais arriscado?", `
- Revolver (linha rotativa) e term loans sênior com garantia: juros menores, amortização, covenants.
- Notas sênior sem garantia (high yield).
- Dívida subordinada / mezanino: juros maiores, às vezes PIK (juros capitalizados) e warrants.
- Equity do fundo: por último na fila.`],
  ["a", "Um fundo compra uma empresa com EBITDA de 100 a 10x, com 60% de dívida. Em 5 anos o EBITDA vai a 150, a dívida cai a 300 e vende a 10x. Qual o MOIC?", `
Compra: EV 1.000; dívida 600; equity 400. Saída: EV 1.500; dívida 300; equity 1.200. MOIC = 1.200 ÷ 400 = 3,0x (TIR ≈ 25% a.a. em 5 anos).`],
  ["a", "O que são covenants?", `
Cláusulas do contrato de dívida que protegem os credores. Financeiros (maintenance): manter, por exemplo, dívida líquida/EBITDA abaixo de 4x ou cobertura de juros acima de 2x. Restritivos (incurrence): limitar novas dívidas, dividendos, venda de ativos. Quebrar um covenant pode antecipar o vencimento.`],
  ["a", "O que é um dividend recap e por que um fundo faria?", `
A empresa investida pega dívida nova para pagar um dividendo ao fundo. O fundo recupera parte do capital antes da saída, o que aumenta a TIR (dinheiro de volta mais cedo). Custo: empresa mais alavancada.`],
  ["a", "Como o preço de compra máximo é definido num LBO?", `
Trabalhando de trás para frente a partir da TIR exigida (ex.: 20–25%): projeta-se o equity na saída, traz-se a valor presente pela TIR-alvo → equity máximo hoje; soma-se a dívida que o mercado empresta (múltiplo de EBITDA) → EV máximo que o fundo pode pagar.`],
  ["a", "Por que um LBO costuma dar um valor menor que um DCF ou uma venda estratégica?", `
O fundo exige uma TIR alta (20%+, acima do WACC) e normalmente não tem sinergias. Um comprador estratégico pode pagar mais porque captura sinergias e tem custo de capital menor. Por isso o LBO funciona como "piso" no football field.`],
  ["a", "O que é PIK (payment in kind)?", `
Juros pagos com mais dívida (capitalizados no principal), e não em caixa. Preserva o caixa da empresa nos primeiros anos, mas faz a dívida crescer rapidamente e é caro. Comum em mezanino e dívidas de holding.`],
  ["a", "Qual o papel do management rollover e do management equity plan num LBO?", `
Rollover: os executivos reinvestem parte do que receberiam na venda na nova empresa. Management equity plan: opções ou ações para a gestão (em geral 5–15% do equity). Os dois alinham os interesses da gestão aos do fundo.`],
  ["a", "Quais são as estratégias de saída de um investimento de PE?", `
Venda para um comprador estratégico (geralmente o maior preço), venda para outro fundo (secondary buyout), IPO e venda gradual das ações, ou recapitalização. A saída escolhida depende do ciclo de mercado e do tamanho da empresa.`],
]);
