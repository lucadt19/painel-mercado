import { mk } from "./_mk";

export default mk("brasil", [
  ["b", "O que é a Selic e quem a define?", `
A taxa básica de juros da economia, definida pelo Copom (Comitê de Política Monetária do Banco Central) a cada ~45 dias (8 reuniões por ano). É o principal instrumento para levar a inflação à meta. A Selic efetiva (over) fica ligeiramente abaixo da meta.`],
  ["b", "Qual a diferença entre Selic e CDI?", `
A Selic é a taxa das operações com títulos públicos entre instituições; o CDI é a taxa média dos empréstimos de um dia entre bancos, sem lastro em título público. Andam quase juntos (o CDI fica cerca de 0,10 ponto abaixo da Selic meta) e o CDI é o principal referencial de aplicações pós-fixadas.`],
  ["b", "Como funciona o sistema de metas de inflação no Brasil?", `
O Conselho Monetário Nacional (CMN) define a meta para o IPCA (desde 2025, meta contínua de 3%, com tolerância de 1,5 ponto). O Banco Central ajusta a Selic para cumprir a meta. Se a inflação ficar fora do intervalo por 6 meses seguidos, o BC precisa explicar publicamente os motivos.`],
  ["b", "O que fazem a CVM e o Banco Central na regulação do mercado?", `
CVM (Comissão de Valores Mobiliários): regula e fiscaliza o mercado de capitais (companhias abertas, fundos, ofertas, B3, analistas). Banco Central: regula bancos e instituições financeiras, política monetária e câmbio. O CMN dá as diretrizes gerais.`],
  ["b", "Quais os segmentos de listagem da B3 e o que é o Novo Mercado?", `
Segmentos com regras de governança crescentes: Básico, Nível 1, Nível 2 e Novo Mercado (além do Bovespa Mais). O Novo Mercado exige apenas ações ordinárias (ON, com voto), tag along de 100%, free float mínimo, conselho com membros independentes e mais transparência.`],
  ["b", "Qual a diferença entre ações ON, PN e units?", `
ON (ordinárias, final 3): dão direito a voto. PN (preferenciais, final 4, 5, 6): sem voto ou com voto restrito, mas com preferência nos dividendos. Units (final 11): pacotes de ações (ex.: 1 ON + 2 PN) negociados como um só papel.`],
  ["b", "Como funciona o IR sobre ações para pessoa física?", `
15% sobre o ganho em operações comuns (swing trade) e 20% em day trade. Isenção para vendas de até R$ 20 mil por mês no mercado à vista (não vale para day trade nem ETFs). O imposto é apurado e pago pelo próprio investidor (DARF) até o último dia útil do mês seguinte. Prejuízos podem ser compensados.`],
  ["b", "Como são tributados dividendos e JCP no Brasil?", `
Dividendos: por décadas isentos para a pessoa física. A reforma do IR aprovada em 2025 (Lei 15.270) passou a reter 10% na fonte sobre dividendos acima de R$ 50 mil por mês pagos por uma mesma empresa a uma mesma pessoa, a partir de 2026, junto com um imposto mínimo para altas rendas (confira a regra vigente). JCP (juros sobre capital próprio): retenção de 15% de IR na fonte para o acionista, mas dedutível para a empresa, por isso as empresas o usam como forma eficiente de distribuir lucro.`],
  ["a", "O que é tag along?", `
Direito do acionista minoritário de vender suas ações pelo mesmo preço (ou um percentual dele) pago ao controlador numa venda de controle. A Lei das S.A. garante 80% para as ações ON; o Novo Mercado exige 100%.`],
  ["a", "O que é uma OPA?", `
Oferta pública de aquisição: proposta para comprar ações dos acionistas no mercado. Obrigatória em alguns casos (cancelamento de registro/fechamento de capital, aumento relevante de participação do controlador, alienação de controle via tag along) e voluntária em tentativas de aquisição.`],
  ["a", "Como o risco fiscal afeta juros, câmbio e bolsa no Brasil?", `
Dúvidas sobre a trajetória da dívida pública elevam o prêmio de risco: juros futuros longos sobem (inclinando a curva), o real se desvaloriza e a bolsa cai (taxa de desconto maior e saída de estrangeiros). O BC pode ter de manter a Selic alta por mais tempo, o que pesa na atividade.`],
  ["a", "O que são FIIs e como são tributados?", `
Fundos de investimento imobiliário, negociados na B3, que investem em imóveis (lajes, galpões, shoppings) ou em papéis (CRIs). Distribuem ao menos 95% do resultado semestral. Os rendimentos são isentos de IR para pessoa física, cumpridos os requisitos legais (de cotistas e negociação em bolsa); o ganho na venda das cotas paga 20%.`],
  ["a", "Qual a diferença entre um follow-on e um IPO? E o que é bookbuilding?", `
IPO é a primeira oferta pública de ações (a empresa abre o capital). Follow-on é uma oferta posterior de uma empresa já listada (primária: dinheiro novo para a empresa; secundária: acionistas vendendo). Bookbuilding é o processo em que os bancos coletam ordens dos investidores para definir o preço e a alocação.`],
  ["a", "O que é o come-cotas?", `
Antecipação semestral do IR (em maio e novembro) nos fundos abertos de renda fixa e multimercado: a Receita cobra parte do imposto "comendo" cotas, a 15% (longo prazo) ou 20% (curto prazo). Não incide em fundos de ações, ETFs e FIIs.`],
]);
