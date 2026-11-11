import { mk } from "./_mk";

export default mk("raciocinio", [
  ["b", "Quanto é 17 × 24 de cabeça?", `
408. Truque: 17 × 24 = 17 × 25 − 17 = 425 − 17 = 408.`],
  ["b", "Quantos anos para dobrar um investimento a 9% ao ano?", `
Pela regra do 72: 72 ÷ 9 = 8 anos (aproximadamente).`],
  ["b", "Um investimento cai 50% e depois sobe 50%. Qual o resultado?", `
Perde 25%: 100 → 50 → 75. Perdas exigem ganhos percentuais maiores para recuperar (cair 50% exige subir 100%).`],
  ["b", "Quantos postos de gasolina existem em São Paulo? (estimativa)", `
Exemplo de raciocínio: ~12 milhões de habitantes; ~5 milhões de carros; cada carro abastece 1 vez por semana → ~700 mil abastecimentos por dia. Um posto faz ~500 por dia → ~1.400 postos. A resposta exata importa menos que a estrutura clara e premissas razoáveis ditas em voz alta.`],
  ["b", "Qual é o ângulo entre os ponteiros do relógio às 3h15?", `
7,5°. Às 3h15 o ponteiro dos minutos está no 3 (90°); o das horas andou 1/4 do caminho do 3 para o 4: 90° + 30° × 0,25 = 97,5°. Diferença: 7,5°.`],
  ["b", "Qual o valor presente de R$ 1.000 recebidos em 2 anos, a 10% ao ano?", `
1.000 ÷ 1,1² = 1.000 ÷ 1,21 ≈ R$ 826,45.`],
  ["a", "Você tem 8 bolas iguais, uma mais pesada, e uma balança de dois pratos. Quantas pesagens no mínimo?", `
2. Divida em 3, 3 e 2. Pese 3 × 3: se equilibrar, a pesada está nas 2 restantes (pese uma contra a outra). Se não, pegue o grupo mais pesado e pese 1 × 1 (se equilibrar, é a terceira).`],
  ["a", "Uma perpetuidade paga R$ 100 por ano, crescendo 2%, com taxa de desconto de 10%. Quanto vale?", `
100 ÷ (0,10 − 0,02) = R$ 1.250 (supondo o primeiro pagamento daqui a um ano).`],
  ["a", "Uma empresa vale 10x EBITDA, com dívida líquida de 2x EBITDA. Se o EBITDA cai 20% e o múltiplo se mantém, quanto cai o equity?", `
Com EBITDA 100: EV 1.000, dívida 200, equity 800. Novo EBITDA 80: EV 800, equity 600 → queda de 25%. A alavancagem amplia a variação do equity em relação à do EBITDA.`],
  ["a", "Quanto é 1,05 elevado a 10, aproximadamente?", `
≈ 1,63. Atalho: ln(1,05) ≈ 0,0488 → × 10 = 0,488 → e^0,488 ≈ 1,63. (Pela regra do 72, a 5% dobra em ~14 anos, então em 10 anos fica abaixo de 2.)`],
]);
