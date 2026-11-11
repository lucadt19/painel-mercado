import { mk } from "./_mk";

export default mk("contabilidade", [
  ["b", "Quais são as três demonstrações financeiras principais e o que cada uma mostra?", `
- DRE (income statement): receitas, custos e despesas de um período, chegando ao lucro líquido.
- Balanço patrimonial (balance sheet): ativos, passivos e patrimônio líquido numa data; Ativo = Passivo + PL.
- Demonstração dos fluxos de caixa (cash flow statement): parte do lucro líquido, ajusta itens não caixa e variações de capital de giro, e soma os fluxos de investimento e de financiamento, chegando à variação do caixa.`],
  ["b", "Como as três demonstrações se conectam?", `
- O lucro líquido da DRE é a primeira linha da DFC (método indireto) e entra em lucros acumulados no PL.
- A DFC ajusta o lucro por itens não caixa (depreciação, amortização) e pelas variações das contas do balanço (capital de giro, imobilizado, dívida, ações).
- O caixa final da DFC é a conta de caixa do balanço, que então fecha (Ativo = Passivo + PL).`],
  ["b", "Se você só pudesse olhar uma demonstração para avaliar a saúde de uma empresa, qual escolheria?", `
A DFC: mostra quanto caixa a empresa de fato gera e para onde ele vai, o que é mais difícil de "maquiar" que o lucro contábil. (O balanço sozinho não mostra desempenho; a DRE mistura itens não caixa.) Uma boa resposta cita que, para comparar, você ainda precisaria das outras duas.`],
  ["b", "A depreciação sobe R$ 10. O que acontece nas três demonstrações? (alíquota de 34%)", `
- DRE: EBIT cai 10; lucro antes do IR cai 10; IR cai 3,4; lucro líquido cai 6,6.
- DFC: lucro líquido −6,6, mas a depreciação (não caixa) volta +10 → caixa operacional +3,4 (economia de imposto).
- Balanço: caixa +3,4; imobilizado −10 → ativo −6,6. PL (lucros acumulados) −6,6. Fecha.`],
  ["b", "A empresa compra estoque de R$ 100 com caixa. O que muda nas demonstrações?", `
- DRE: nada (o custo só aparece quando o estoque é vendido, no CMV).
- DFC: aumento de estoque é consumo de capital de giro → caixa operacional −100.
- Balanço: caixa −100 e estoque +100; o total do ativo não muda.`],
  ["b", "O que é capital de giro (working capital) e por que importa na DFC?", `
Capital de giro operacional = ativos operacionais de curto prazo (contas a receber, estoques) − passivos operacionais de curto prazo (fornecedores, salários a pagar). Quando ele aumenta, a empresa "prende" caixa (vende a prazo, estoca mais), então o aumento entra negativo na DFC; quando diminui, libera caixa.`],
  ["b", "Por que a depreciação afeta o caixa, se é uma despesa não caixa?", `
Porque é dedutível do imposto. Ela reduz o lucro tributável, então a empresa paga menos IR. O efeito no caixa é a economia fiscal (depreciação × alíquota), não a depreciação em si.`],
  ["b", "Qual a diferença entre regime de caixa e regime de competência?", `
Competência registra receitas e despesas quando são incorridas (venda feita, serviço prestado), independentemente do pagamento. Caixa registra só quando o dinheiro entra ou sai. As demonstrações contábeis seguem competência; a DFC existe justamente para mostrar o lado caixa.`],
  ["b", "O que é EBITDA e por que é tão usado?", `
Lucro antes de juros, impostos, depreciação e amortização. É usado como aproximação do fluxo de caixa operacional, comparável entre empresas com estruturas de capital, regimes fiscais e políticas de depreciação diferentes. Limites: ignora capex, capital de giro e impostos, e não é medida contábil padronizada (cada empresa ajusta à sua maneira).`],
  ["b", "Uma empresa pode ter lucro e ficar sem caixa? Dê um exemplo.", `
Sim. Exemplo: cresce rápido vendendo a prazo e aumentando estoques; o lucro aparece pela competência, mas o caixa fica preso em contas a receber e estoques. Capex alto e amortização de dívida (que não passam pela DRE) também consomem caixa.`],
  ["b", "O que é goodwill e quando ele aparece?", `
É o valor pago numa aquisição acima do valor justo dos ativos líquidos identificáveis da empresa comprada. Aparece no balanço do comprador. Não é amortizado (IFRS/US GAAP), mas passa por teste de impairment anual; se o valor recuperável cair, é baixado (despesa na DRE).`],
  ["b", "Qual a diferença entre capex e despesa operacional?", `
Capex (investimento em ativo imobilizado ou intangível) gera benefício por vários anos: vai para o balanço e é depreciado ao longo da vida útil. Despesa operacional (opex) beneficia só o período e vai direto à DRE. Na DFC, capex aparece no fluxo de investimento.`],
  ["b", "Onde aparecem a emissão de dívida e o pagamento de dividendos?", `
Ambos na DFC, em atividades de financiamento (emissão entra positiva; dividendos saem negativos). No balanço: dívida aumenta o passivo; dividendos reduzem lucros acumulados (PL). Nenhum dos dois passa pela DRE (os juros da dívida sim).`],
  ["b", "Receita diferida (deferred revenue): o que é e como afeta o caixa?", `
É dinheiro recebido antes de entregar o produto ou serviço (ex.: assinatura anual paga adiantado). Entra como passivo; vira receita conforme o serviço é prestado. Um aumento de receita diferida aumenta o caixa operacional (recebeu antes de reconhecer).`],
  ["b", "A empresa vende a prazo R$ 100 de produtos que custaram R$ 60 (alíquota 34%). Efeitos?", `
- DRE: receita +100, CMV −60, lucro antes do IR +40, IR −13,6, lucro líquido +26,4.
- DFC: lucro +26,4; contas a receber +100 (−100); estoque −60 (+60) → caixa −13,6 (só o imposto, se pago agora).
- Balanço: contas a receber +100, estoque −60, caixa −13,6 → ativo +26,4; PL +26,4.`],
  ["b", "O que é amortização e como difere da depreciação?", `
As duas distribuem o custo de um ativo pela vida útil. Depreciação é para ativos tangíveis (máquinas, prédios); amortização, para intangíveis com vida útil definida (software, licenças, carteiras de clientes adquiridas). Goodwill não é amortizado.`],
  ["b", "O que é patrimônio líquido e de que é composto?", `
É o valor contábil dos sócios: ativos menos passivos. Principais contas: capital social, reservas de capital, reservas de lucros/lucros acumulados, ações em tesouraria (redutora) e outros resultados abrangentes. Não é o valor de mercado da empresa.`],
  ["a", "A empresa faz um impairment de R$ 100 no goodwill. Efeitos (supondo não dedutível)?", `
- DRE: despesa de 100 → lucro líquido −100 (sem economia fiscal, se não dedutível).
- DFC: lucro −100, soma de volta 100 (não caixa) → caixa inalterado.
- Balanço: goodwill −100; PL −100.`],
  ["a", "O que são impostos diferidos (deferred taxes)? Dê um exemplo.", `
Diferenças temporárias entre o lucro contábil e o fiscal. Exemplo: depreciação acelerada para fins fiscais. A empresa paga menos IR hoje do que a DRE mostra → passivo fiscal diferido, que reverte no futuro. Prejuízos fiscais acumulados geram ativo fiscal diferido (crédito a usar contra lucros futuros).`],
  ["a", "Como o leasing (IFRS 16) mudou as demonstrações?", `
Quase todo arrendamento passou a entrar no balanço: ativo de direito de uso e passivo de arrendamento. Na DRE, o aluguel sai do custo/despesa e vira depreciação do direito de uso + juros do passivo. Efeito: EBITDA sobe, dívida líquida sobe. Ao comparar empresas, é preciso tratar leasing de forma consistente no EV e no EBITDA.`],
  ["a", "A empresa recompra ações por R$ 50. Efeitos?", `
- DRE: nada.
- DFC: −50 em financiamento.
- Balanço: caixa −50; ações em tesouraria (conta redutora do PL) −50.
O lucro por ação tende a subir (menos ações), se o custo do caixa usado for menor que o "custo" das ações recompradas.`],
  ["a", "Remuneração em ações (stock-based compensation): como entra nas demonstrações?", `
É despesa na DRE (reduz lucro), mas não caixa: volta na DFC. Aumenta o PL (as ações/opções emitidas). Em valuation, é custo econômico real (dilui o acionista); muitos analistas não a somam de volta ao calcular fluxo de caixa ou EBITDA ajustado.`],
  ["a", "Por que o crescimento do capital de giro pode ser negativo para uma empresa boa?", `
Empresas com poder de negociação recebem dos clientes antes de pagar fornecedores (ex.: varejo e supermercados). O capital de giro é negativo, e o crescimento GERA caixa: cada real a mais de vendas traz financiamento gratuito dos fornecedores.`],
  ["a", "Como contabilizar uma participação de 30% em outra empresa? E de 80%?", `
- 30% (influência significativa, em geral 20%–50%): método de equivalência patrimonial; a participação fica no ativo e a fatia do lucro da investida entra na DRE numa linha própria.
- 80% (controle): consolida 100% das receitas, custos, ativos e passivos; os 20% dos outros sócios aparecem como participação de não controladores (no PL e na DRE).`],
  ["a", "O que é LIFO e FIFO e qual o efeito em período de inflação?", `
Métodos de custo do estoque. FIFO (primeiro a entrar, primeiro a sair): o CMV usa os custos antigos (menores) → lucro maior, estoque final mais valioso. LIFO (último a entrar, primeiro a sair): CMV com custos recentes (maiores) → lucro e imposto menores. LIFO não é aceito no IFRS, nem no Brasil; existe nos EUA (US GAAP).`],
  ["a", "Uma dívida de R$ 100 com juros de 10% é emitida e os recursos vão para capex. Efeitos no 1º ano (alíquota 34%, depreciação de 10 ao ano)?", `
- DRE: juros −10 e depreciação −10 → lucro antes do IR −20 → lucro líquido −13,2.
- DFC: lucro −13,2 + depreciação 10 = −3,2 no operacional; capex −100; dívida +100 → caixa −3,2.
- Balanço: caixa −3,2, imobilizado +90 → ativo +86,8; dívida +100; PL −13,2 → passivo + PL +86,8.`],
  ["a", "O que são itens não recorrentes e por que analistas os ajustam?", `
Ganhos ou perdas pontuais (venda de ativo, reestruturação, multa, impairment). São retirados do EBITDA e do lucro "ajustados" para mostrar o desempenho recorrente, que é o que se projeta e se compara. Cuidado: empresas que têm "não recorrentes" todo ano estão maquiando o resultado.`],
  ["a", "Qual a diferença entre IFRS e US GAAP mais cobrada em entrevista?", `
Exemplos frequentes: LIFO proibido no IFRS; no IFRS juros pagos podem ser classificados em operacional ou financiamento (no US GAAP, operacional); reversão de impairment (exceto goodwill) permitida no IFRS; arrendamentos operacionais seguem separados na DRE no US GAAP (custo linear), mas no IFRS 16 viram depreciação + juros.`],
]);
