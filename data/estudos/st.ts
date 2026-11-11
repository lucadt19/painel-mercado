import { mk } from "./_mk";

export default mk("st", [
  ["b", "O que fazem sales e trading?", `
Sales mantém o relacionamento com investidores institucionais e leva ideias e produtos do banco a eles. Trading executa as ordens dos clientes e faz mercado (market making), assumindo e gerenciando o risco das posições. Juntos formam a área de "mercados" do banco.`],
  ["b", "Me dê sua visão de mercado (onde vai o dólar, a bolsa, os juros).", `
Estrutura: cenário atual (números de hoje) → 2–3 fatores que você acompanha (juros nos EUA, fiscal no Brasil, commodities, fluxo estrangeiro) → sua visão com convicção → como montaria uma operação para expressar a visão → o que te faria mudar de ideia. O entrevistador avalia o raciocínio, não o acerto.`],
  ["b", "O que é um contrato futuro? E uma opção?", `
Futuro: obrigação de comprar ou vender um ativo numa data futura a um preço combinado hoje; ajustes diários na bolsa. Opção: direito, e não obrigação, de comprar (call) ou vender (put) a um preço de exercício até ou numa data; o comprador paga um prêmio.`],
  ["b", "O que acontece com o preço de um título quando os juros sobem?", `
Cai. O título paga fluxos fixos; com juros de mercado maiores, esses fluxos valem menos a valor presente. Quanto mais longo o título (maior duration), maior a queda.`],
  ["b", "O que é spread de compra e venda (bid-ask)?", `
A diferença entre o preço pelo qual o market maker compra (bid) e pelo qual vende (ask). É a remuneração pela liquidez e pelo risco de carregar a posição. Ativos menos líquidos ou mais voláteis têm spread maior.`],
  ["b", "Por que o dólar costuma subir quando os juros nos EUA sobem?", `
Juros maiores nos EUA atraem capital para ativos em dólar e reduzem a vantagem do carry trade em moedas emergentes (diferencial de juros menor). Investidores saem do real → dólar sobe contra o real.`],
  ["a", "Quais fatores afetam o preço de uma opção? (gregas)", `
- Preço do ativo (delta), volatilidade (vega), tempo até o vencimento (theta), juros (rho), preço de exercício.
- Gamma: o quanto o delta muda com o preço do ativo.
Mais volatilidade e mais tempo aumentam o valor de calls e puts.`],
  ["a", "O que é a paridade put-call?", `
Call − Put = Preço do ativo − Valor presente do preço de exercício (opções europeias, mesmo exercício e vencimento, sem dividendos). Se não vale, há arbitragem. Mostra que comprar call e vender put equivale a ter o ativo financiado.`],
  ["a", "O que é um swap de taxa de juros?", `
Troca de fluxos: uma parte paga taxa fixa e recebe flutuante (ex.: CDI), ou o contrário, sobre um valor de referência. Usado para mudar a exposição a juros sem mexer na dívida. No Brasil, o "swap DI x pré" é base da curva de juros.`],
  ["a", "O que é o carry trade?", `
Tomar emprestado numa moeda de juros baixos e aplicar numa de juros altos, ganhando o diferencial. Funciona enquanto o câmbio fica estável; risco de perda grande quando a moeda de juros alto se desvaloriza bruscamente (fuga para segurança).`],
  ["a", "O que é volatilidade implícita e o 'sorriso' de volatilidade?", `
É a volatilidade que, no modelo de precificação (Black-Scholes), reproduz o preço de mercado da opção: a expectativa do mercado. O sorriso (smile/skew): opções muito fora do dinheiro, sobretudo puts, têm volatilidade implícita maior, porque o mercado paga mais pela proteção contra quedas fortes.`],
  ["a", "Como um trader faz hedge de uma call vendida?", `
Delta hedge: compra uma quantidade do ativo igual ao delta da opção e ajusta conforme o preço se move (o delta muda, efeito gamma). Assim fica neutro a pequenos movimentos e ganha ou perde conforme a volatilidade realizada fica abaixo ou acima da implícita.`],
]);
