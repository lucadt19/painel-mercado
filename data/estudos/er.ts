import { mk } from "./_mk";

export default mk("er", [
  ["b", "O que faz um analista de equity research (sell-side)?", `
Acompanha um grupo de empresas de um setor, monta modelos de projeção, publica relatórios com recomendação (compra, neutro, venda) e preço-alvo, conversa com investidores institucionais e com a gestão das empresas. O cliente é o investidor; a receita vem, em parte, das comissões de corretagem.`],
  ["b", "Me apresente uma ação que você recomendaria (pitch a stock).", `
Estrutura sugerida (2 minutos):
- A empresa em uma frase e por que agora.
- Tese: 2–3 motivos pelos quais o mercado está errado (crescimento, margem, catalisador).
- Valuation: preço-alvo e potencial de alta, por múltiplo e/ou DCF, comparado aos pares.
- Riscos e o que mudaria sua visão.
- Catalisadores (resultados, regulação, M&A).`],
  ["b", "Qual a diferença entre buy-side e sell-side?", `
Sell-side vende serviços e ideias: bancos de investimento, corretoras, research que publica relatórios. Buy-side compra ativos com dinheiro próprio ou de clientes: gestoras, fundos de pensão, hedge funds, private equity. O analista buy-side recomenda internamente para o gestor.`],
  ["b", "O que é preço-alvo e como se chega nele?", `
É o valor que o analista espera para a ação em 12 meses (em geral). Calcula-se por DCF, múltiplos sobre o lucro ou EBITDA projetado do ano seguinte, ou soma das partes. O potencial de valorização (preço-alvo ÷ preço atual − 1) define a recomendação.`],
  ["b", "Quais indicadores você olharia primeiro numa empresa de varejo? E num banco?", `
- Varejo: vendas mesmas lojas (SSS), margem bruta, giro de estoque, capital de giro, expansão de lojas, alavancagem.
- Banco: margem financeira (NII), custo do crédito e inadimplência, eficiência, ROE, índice de Basileia, crescimento da carteira.`],
  ["a", "O que é 'consenso' e por que importa para a reação da ação aos resultados?", `
A média das projeções dos analistas. A ação reage à surpresa, não ao número em si: um lucro forte pode derrubar a ação se veio abaixo do consenso ou se a projeção da empresa (guidance) decepcionou. Por isso o research compara cada linha do resultado com o consenso.`],
  ["a", "Como identificar um resultado trimestral de baixa qualidade?", `
Lucro sustentado por itens não recorrentes, crescimento de receita com explosão de contas a receber, capital de giro piorando, capex alto mal explicado, mudança de critério contábil, fluxo de caixa operacional muito abaixo do lucro e aumento de dívida sem justificativa.`],
  ["a", "O que é um catalisador numa tese de investimento?", `
Um evento que faz o mercado reconhecer o valor que você enxerga: resultado trimestral, aprovação regulatória, venda de ativo, troca de gestão, recompra de ações, mudança de juros. Sem catalisador, uma ação barata pode ficar barata por muito tempo (value trap).`],
  ["a", "O que é ROIC e por que é tão importante?", `
Retorno sobre o capital investido = NOPAT ÷ capital investido (capital de giro + ativos operacionais). Se ROIC > WACC, a empresa cria valor ao crescer; se ROIC < WACC, crescer destrói valor. É a ligação entre a qualidade do negócio e o múltiplo que ele merece.`],
  ["a", "O que é um 'value trap'?", `
Ação que parece barata pelos múltiplos (P/L baixo), mas continua caindo ou estagnada porque o negócio está em declínio estrutural, o lucro vai cair ou há problemas de governança. O múltiplo baixo é merecido.`],
]);
