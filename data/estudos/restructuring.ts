import { mk } from "./_mk";

export default mk("restructuring", [
  ["b", "O que faz um banco de restructuring?", `
Assessora empresas em dificuldade financeira (ou seus credores) a reorganizar a dívida e o capital: renegociação fora da Justiça, recuperação judicial ou extrajudicial, venda de ativos, novos financiamentos (DIP) e troca de dívida por ações.`],
  ["b", "Quais sinais indicam que uma empresa pode estar entrando em dificuldade financeira?", `
Alavancagem crescente (dívida líquida/EBITDA alta), cobertura de juros baixa, caixa queimando, covenants perto do limite, rebaixamento de rating, títulos negociados com grande desconto, dívida curta concentrada e dificuldade de rolar vencimentos.`],
  ["b", "O que é a 'cascata de prioridade' (absolute priority rule)?", `
A ordem de recebimento numa liquidação ou reorganização: credores com garantia → credores sem garantia (sênior, depois subordinados) → preferencialistas → acionistas ordinários. Uma classe só recebe depois que a anterior é paga integralmente (na teoria; na prática há negociação).`],
  ["b", "O que é recuperação judicial no Brasil?", `
Processo da Lei 11.101/2005 em que a empresa, sob supervisão do juiz, suspende as execuções por um período (stay period de 180 dias, prorrogável) e propõe um plano de pagamento aos credores, votado em assembleia por classes. Se o plano for rejeitado, pode haver falência. A recuperação extrajudicial é um acordo negociado e depois homologado.`],
  ["a", "O que é financiamento DIP (debtor-in-possession)?", `
Empréstimo concedido a uma empresa já em recuperação para manter a operação. Tem prioridade sobre as dívidas antigas, por isso é atraente para o credor. No Brasil, a reforma de 2020 da Lei 11.101 trouxe regras próprias para esse financiamento.`],
  ["a", "O que é a troca de dívida por ações (debt-for-equity swap)?", `
Credores aceitam converter parte da dívida em participação acionária. Reduz a alavancagem e os juros; os acionistas antigos são fortemente diluídos (às vezes quase zerados). Comum quando o valor da empresa é menor que a dívida.`],
  ["a", "O que é o 'fulcrum security'?", `
A classe de dívida que, na reestruturação, fica parcialmente paga: as classes acima recebem tudo e as abaixo, nada. Seus credores costumam virar os novos donos da empresa (recebem as ações). Identificá-la é central para investidores distressed.`],
  ["a", "Como se avalia uma empresa em dificuldade financeira?", `
DCF ou múltiplos com premissas conservadoras e foco na liquidez de curto prazo (fluxo de caixa de 13 semanas); análise de recuperação por classe de credor (quanto cada uma recebe pela cascata); e valor de liquidação (quanto renderia a venda dos ativos).`],
  ["a", "Por que um investidor compraria títulos de uma empresa quase quebrada?", `
Porque eles negociam com desconto grande (ex.: 30% do valor de face). Se a empresa se reorganiza bem, o título pode ser pago bem acima disso ou virar participação acionária valiosa. Fundos distressed também usam a posição para influenciar o plano de reestruturação.`],
  ["a", "O que é um passivo concursal e um extraconcursal na recuperação judicial?", `
Concursais são os créditos sujeitos à recuperação (existentes na data do pedido), pagos conforme o plano. Extraconcursais ficam fora: créditos posteriores ao pedido (incluindo o DIP) e alguns com garantia fiduciária e adiantamentos de câmbio. Saber a diferença é essencial para estimar quanto cada credor recebe.`],
]);
