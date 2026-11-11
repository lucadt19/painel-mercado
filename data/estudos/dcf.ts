import { mk } from "./_mk";

export default mk("dcf", [
  ["b", "Me explique um DCF (walk me through a DCF).", `
- Projeta o fluxo de caixa livre da firma (FCFF) por 5–10 anos: EBIT × (1 − alíquota) + D&A − capex − variação do capital de giro.
- Calcula o valor terminal (Gordon ou múltiplo de saída).
- Desconta tudo pelo WACC até hoje e soma → enterprise value.
- Subtrai a dívida líquida (e outros ajustes) → equity value; divide pelas ações diluídas → valor por ação.`],
  ["b", "Como se calcula o fluxo de caixa livre para a firma (FCFF)?", `
FCFF = EBIT × (1 − alíquota) + depreciação e amortização − capex − aumento do capital de giro. É o caixa disponível para todos os financiadores (acionistas e credores), antes dos juros.`],
  ["b", "O que é WACC e como se calcula?", `
Custo médio ponderado de capital: WACC = Ke × E/(D+E) + Kd × (1 − alíquota) × D/(D+E). Ke = custo do capital próprio; Kd = custo da dívida, multiplicado por (1 − alíquota) porque os juros são dedutíveis. Os pesos devem ser de mercado (ou da estrutura de capital-alvo).`],
  ["b", "Como se calcula o custo do capital próprio (Ke)?", `
Pelo CAPM: Ke = taxa livre de risco + beta × prêmio de risco de mercado. Em mercados emergentes, costuma-se somar o risco-país (ou usar a taxa local como base). Às vezes também um prêmio de tamanho.`],
  ["b", "Quais as duas formas de calcular o valor terminal?", `
- Perpetuidade com crescimento (Gordon): VT = FCFF(n+1) ÷ (WACC − g), com g abaixo do crescimento nominal da economia de longo prazo.
- Múltiplo de saída: VT = EBITDA final × múltiplo (EV/EBITDA) de comparáveis.
Usar as duas como checagem cruzada: o múltiplo implícito no Gordon e o crescimento implícito no múltiplo devem fazer sentido.`],
  ["b", "Por que o valor terminal costuma ser 60–80% do valor total do DCF?", `
Porque ele representa todos os fluxos após o horizonte projetado (para sempre). Isso torna o DCF muito sensível às premissas de crescimento perpétuo, WACC e margem de longo prazo, por isso se apresentam tabelas de sensibilidade.`],
  ["b", "O que é beta e como interpretá-lo?", `
Mede o risco sistemático de uma ação: quanto ela oscila em relação ao mercado. Beta 1 = acompanha o mercado; > 1 = mais volátil; < 1 = menos. Só o risco sistemático é remunerado, porque o risco específico pode ser diversificado.`],
  ["b", "Por que se usa FCFF com WACC e FCFE com Ke?", `
O fluxo e a taxa devem ser do mesmo grupo de financiadores. FCFF (antes dos juros) pertence a credores e acionistas → desconta pelo WACC → enterprise value. FCFE (depois de juros e amortizações) pertence só aos acionistas → desconta pelo Ke → equity value.`],
  ["b", "Se o WACC sobe, o que acontece com o valor? E se o crescimento perpétuo sobe?", `
WACC maior → fluxos e valor terminal descontados mais fortemente → valor cai. Crescimento perpétuo maior → valor terminal maior → valor sobe (e o efeito é muito forte quando g se aproxima do WACC).`],
  ["b", "Qual o fluxo de caixa usado no DCF considera os juros?", `
O FCFF não considera juros (é o caixa antes do financiamento); a dívida entra via WACC e é subtraída no final (EV → equity). O FCFE considera: desconta juros após impostos e soma a emissão líquida de dívida.`],
  ["a", "Como 'desalavancar' e 'realavancar' o beta? Por que fazer isso?", `
Os betas observados dos comparáveis embutem a alavancagem de cada um. Desalavanca-se cada beta: βu = βl ÷ [1 + (1 − t) × D/E]; tira-se a mediana; realavanca-se com a estrutura-alvo da empresa: βl = βu × [1 + (1 − t) × D/E]. Assim o beta reflete só o risco do negócio mais a alavancagem da empresa avaliada.`],
  ["a", "O que é a convenção de meio de período (mid-year convention)?", `
Supõe que os fluxos chegam, em média, no meio de cada ano, e não no fim. Desconta-se o ano 1 por 0,5 em vez de 1, o ano 2 por 1,5 etc. Aumenta um pouco o valor. No valor terminal pelo Gordon aplica-se o mesmo deslocamento; no múltiplo de saída, não.`],
  ["a", "Como o DCF muda para uma empresa em mercado emergente como o Brasil?", `
Taxa livre de risco: usar NTN-B (em reais, real) ou o título americano + risco-país (em dólar), sempre consistente com a moeda dos fluxos. Fluxos nominais em reais → taxa nominal em reais; fluxos reais → taxa real. Câmbio, inflação e prêmio de risco maior pesam; o diferencial de inflação conecta as taxas em dólar e em real.`],
  ["a", "Por que o crescimento perpétuo não pode ser maior que o crescimento da economia?", `
Porque, em perpetuidade, uma empresa crescendo mais rápido que a economia acabaria maior que a própria economia. Na prática, g fica perto da inflação de longo prazo mais o crescimento real do PIB. E g precisa ser coerente com o reinvestimento: g = taxa de reinvestimento × retorno sobre o capital.`],
  ["a", "Qual o efeito de mais dívida no WACC? Existe uma estrutura ótima?", `
No começo, mais dívida reduz o WACC (dívida é mais barata e os juros são dedutíveis). A partir de certo ponto, o risco de falência eleva o custo da dívida e o beta do equity, e o WACC volta a subir. A estrutura ótima minimiza o WACC (trade-off entre benefício fiscal e custo de dificuldade financeira).`],
  ["a", "Por que o custo da dívida usado no WACC deve ser o atual e não o contratado?", `
O WACC é uma taxa de oportunidade para o futuro: o que importa é quanto a empresa pagaria para se financiar hoje (yield to maturity dos títulos dela ou de empresas com o mesmo rating), não a taxa negociada anos atrás.`],
  ["a", "Como tratar prejuízos fiscais acumulados (NOLs) num DCF?", `
Eles reduzem o imposto a pagar no futuro: projeta-se a compensação ano a ano (no Brasil, limitada a 30% do lucro tributável de cada ano), aumentando os fluxos. Ou calcula-se o valor presente da economia fiscal à parte e soma-se ao EV.`],
  ["a", "Dê três críticas ao DCF.", `
- Muito sensível a premissas difíceis de prever (WACC, crescimento perpétuo, margens de longo prazo).
- O valor terminal domina o resultado.
- Pode ser "ajustado" para chegar a qualquer número.
Por isso se usam cenários, sensibilidades e checagens com os múltiplos implícitos.`],
]);
