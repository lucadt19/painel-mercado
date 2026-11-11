import { mk } from "./_mk";

export default mk("ev", [
  ["b", "Qual a diferença entre enterprise value e equity value?", `
Equity value (valor de mercado das ações) é o que pertence só aos acionistas. Enterprise value é o valor do negócio operacional para todos os financiadores (acionistas e credores), independente da estrutura de capital. Simplificado: EV = equity value + dívida líquida (+ preferenciais + minoritários).`],
  ["b", "Qual a fórmula do enterprise value?", `
EV = equity value + dívida + ações preferenciais + participação de não controladores − caixa (e investimentos não operacionais). Leasing e passivos de pensão podem entrar, se o EBITDA usado for consistente com isso.`],
  ["b", "Por que se subtrai o caixa no enterprise value?", `
Porque o caixa não é parte do negócio operacional, e quem compra a empresa "recebe" esse caixa de volta (pode usá-lo para pagar parte do preço ou da dívida). O EV mede o valor da operação; o caixa é um ativo não operacional.`],
  ["b", "Por que se soma a participação de não controladores (minority interest)?", `
Porque, ao consolidar uma controlada da qual tem, digamos, 80%, a empresa inclui 100% da receita e do EBITDA dela. Para o EV ser comparável a um EBITDA que contém 100% da controlada, é preciso somar o valor dos 20% que não pertencem a ela.`],
  ["b", "Como se calcula o equity value de uma empresa aberta?", `
Preço da ação × número de ações diluídas. As ações diluídas incluem o efeito de opções, bônus e conversíveis "no dinheiro" (in the money), em geral pelo método da ação em tesouraria (treasury stock method).`],
  ["b", "Uma empresa emite R$ 100 de ações e mantém o caixa. O que acontece com equity value e EV?", `
Equity value sobe 100 (mais caixa para os acionistas). EV não muda: soma 100 de equity, subtrai 100 de caixa. O negócio operacional é o mesmo.`],
  ["b", "Uma empresa pega R$ 100 de dívida e usa para pagar dividendos. Efeito em EV e equity value?", `
Equity value cai 100 (saiu caixa para os acionistas, em tese o preço cai). Dívida +100. EV fica igual: −100 de equity, +100 de dívida.`],
  ["b", "O enterprise value pode ser menor que o equity value? Pode ser negativo?", `
Sim. EV < equity value quando a empresa tem mais caixa que dívida (dívida líquida negativa). EV negativo ocorre quando o caixa supera equity + dívida, o que costuma acontecer em empresas com problemas, em que o mercado espera queimar esse caixa.`],
  ["a", "Como funciona o método da ação em tesouraria (treasury stock method)?", `
Para opções no dinheiro: supõe-se que todas são exercidas e que o dinheiro recebido pelo preço de exercício é usado para recomprar ações ao preço atual. Ações adicionais = opções × (1 − preço de exercício ÷ preço da ação). Exemplo: 100 opções, exercício 10, ação a 20 → 100 − (100×10/20) = 50 ações novas.`],
  ["a", "Como tratar dívida conversível no cálculo de ações diluídas?", `
Se o preço da ação está acima do preço de conversão, a conversão é vantajosa: conta as ações que seriam emitidas e não conta o conversível como dívida (para não contar duas vezes). Se estiver abaixo, trata como dívida no EV e não soma ações.`],
  ["a", "Por que usar EV/EBITDA, mas P/L (preço/lucro) com equity value?", `
O múltiplo deve casar numerador e denominador: EBITDA e EBIT pertencem a todos os financiadores (antes de juros), então pedem EV. O lucro líquido é depois dos juros, só dos acionistas, então pede equity value (P/L). Misturar distorce comparações entre empresas com estruturas de capital diferentes.`],
  ["a", "Leasing: entra no enterprise value? Como manter a consistência?", `
Pós-IFRS 16, o passivo de arrendamento está no balanço e o EBITDA não tem o custo do aluguel. Para comparar: ou soma o passivo de leasing ao EV e usa o EBITDA pós-IFRS 16; ou exclui o passivo do EV e usa um EBITDA "pré-IFRS 16" (com o aluguel). O erro é misturar.`],
  ["a", "Investimentos em coligadas (equity investments) entram no EV? Por quê?", `
Subtraem-se (como o caixa), porque o EBITDA da empresa não inclui o resultado dessas participações minoritárias (vem por equivalência abaixo do EBITDA). Para manter a consistência numerador/denominador, o valor delas sai do EV.`],
  ["a", "Passivo de pensão (unfunded pension) e preferenciais: por que somar ao EV?", `
São direitos sobre o fluxo de caixa da empresa que vêm antes dos acionistas ordinários: funcionam como dívida. Quem compra o negócio precisa honrá-los. Por isso são somados (o déficit de pensão, depois de impostos, em muitos casos).`],
  ["a", "Um múltiplo EV/Receita faz sentido? E P/Receita?", `
EV/Receita faz (receita pertence a toda a empresa), e é usado para empresas sem lucro ou EBITDA negativo. P/Receita mistura equity com uma métrica de toda a empresa: não é consistente, mas ainda aparece, por exemplo, em bancos e setores sem dívida relevante.`],
]);
