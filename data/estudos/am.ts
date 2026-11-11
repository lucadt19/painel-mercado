import { mk } from "./_mk";

export default mk("am", [
  ["b", "O que é diversificação e por que funciona?", `
Combinar ativos que não se movem juntos (correlação < 1) reduz o risco da carteira sem reduzir na mesma proporção o retorno esperado. Elimina o risco específico de cada ativo; o risco sistemático (de mercado) continua.`],
  ["b", "O que é o índice de Sharpe?", `
(Retorno da carteira − taxa livre de risco) ÷ volatilidade. Mede o retorno em excesso por unidade de risco. No Brasil, usa-se em geral o CDI como livre de risco. Maior é melhor; serve para comparar gestores com riscos diferentes.`],
  ["b", "Qual a diferença entre gestão ativa e passiva?", `
Passiva: replica um índice (ETF, fundo indexado), com taxa baixa. Ativa: o gestor escolhe ativos para tentar superar o índice (gerar alfa), cobrando mais. Estudos mostram que a maioria dos ativos não bate o índice no longo prazo, depois das taxas.`],
  ["b", "Como funciona a taxa de administração e de performance?", `
Administração: % ao ano sobre o patrimônio (ex.: 2% a.a.), cobrada sempre. Performance: % do que exceder um benchmark (ex.: 20% do que passar do CDI), em geral com "linha d'água" (high water mark): só cobra se recuperar perdas anteriores.`],
  ["b", "Como você montaria uma carteira para uma pessoa de 25 anos e para uma de 65?", `
Depende de objetivo, prazo, tolerância a risco e liquidez (suitability). Jovem com horizonte longo: mais renda variável e ativos reais, reserva de emergência em pós-fixado. Perto da aposentadoria: mais renda fixa (inclusive IPCA+ para preservar poder de compra), menos volatilidade, foco em renda e liquidez.`],
  ["a", "O que são alfa e beta de uma carteira?", `
Beta: sensibilidade da carteira ao mercado (risco sistemático). Alfa: retorno acima do que o beta explicaria (ex.: pelo CAPM), atribuído à habilidade do gestor. Alfa positivo e consistente é raro e é o que justifica cobrar caro.`],
  ["a", "O que é a fronteira eficiente de Markowitz?", `
O conjunto de carteiras com o maior retorno esperado para cada nível de risco (volatilidade). Combinadas com o ativo livre de risco, geram a linha de mercado de capitais; a carteira tangente maximiza o Sharpe. Na prática, é sensível a estimativas de retorno e correlação.`],
  ["a", "O que são estratégias long/short e market neutral?", `
Long/short: compra ações que espera que subam e vende a descoberto as que espera que caiam. Market neutral: equilibra as pontas para ficar com beta próximo de zero, ganhando só com a diferença relativa (alfa), independente da direção do mercado.`],
  ["a", "O que é drawdown máximo e por que importa?", `
A maior queda do pico ao vale no valor da carteira. Mostra o pior cenário vivido e a dor de recuperação: cair 50% exige subir 100% para voltar. Investidores e alocadores olham drawdown junto com o Sharpe.`],
  ["a", "O que é rebalanceamento e qual o efeito?", `
Voltar a carteira aos pesos-alvo periodicamente (vender o que subiu, comprar o que caiu). Mantém o risco desejado e força a disciplina de "comprar barato e vender caro". Custo: impostos e corretagem.`],
]);
