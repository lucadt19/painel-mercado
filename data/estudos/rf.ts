import { mk } from "./_mk";

export default mk("rf", [
  ["b", "O que é a curva de juros e o que sua inclinação indica?", `
Gráfico das taxas por prazo. Positivamente inclinada (longas > curtas): normal, prêmio por prazo ou expectativa de alta de juros. Invertida (curtas > longas): mercado espera cortes de juros, muitas vezes associada a desaceleração ou recessão.`],
  ["b", "O que é duration?", `
Prazo médio ponderado dos fluxos de um título, que mede a sensibilidade do preço aos juros: variação % do preço ≈ −duration modificada × variação da taxa. Um título com duration 5 cai ~5% se os juros sobem 1 ponto.`],
  ["b", "Qual a diferença entre Tesouro Selic, Prefixado e IPCA+?", `
- Selic (LFT): rende a Selic do dia; quase sem risco de preço (sem marcação relevante); reserva de liquidez.
- Prefixado (LTN/NTN-F): taxa fixa nominal; ganha se os juros caírem, perde se subirem.
- IPCA+ (NTN-B): inflação + taxa real; protege o poder de compra; marcação a mercado forte nos longos.`],
  ["b", "O que é rating de crédito?", `
Nota que agências (S&P, Moody's, Fitch) dão à capacidade de um emissor pagar suas dívidas. Grau de investimento: BBB− (S&P) ou Baa3 (Moody's) para cima; abaixo disso, especulativo (high yield). Rating pior → juros maiores exigidos.`],
  ["b", "O que é spread de crédito?", `
A diferença entre a taxa de um título privado e a de um título público de mesmo prazo. Remunera o risco de inadimplência e a menor liquidez. Spreads abrem (aumentam) em crises e fecham em momentos de apetite a risco.`],
  ["b", "O que é marcação a mercado (MaM)?", `
Atualizar o valor de um título pelo preço que ele teria se vendido hoje, com as taxas atuais. Por isso um título "seguro" pode mostrar perda antes do vencimento se os juros subirem; quem leva até o vencimento recebe a taxa contratada.`],
  ["b", "Qual a diferença entre CDB, LCI/LCA e debênture?", `
- CDB: dívida de banco, com IR regressivo e garantia do FGC até R$ 250 mil por CPF por instituição.
- LCI/LCA: lastreadas em crédito imobiliário/agro; isentas de IR para pessoa física; também com FGC.
- Debênture: dívida de empresa não financeira; sem FGC; as incentivadas (infraestrutura) são isentas de IR para pessoa física.`],
  ["a", "O que é convexidade?", `
A curvatura da relação preço × taxa. A duration é uma aproximação linear; a convexidade corrige: para títulos comuns (convexidade positiva), o preço sobe mais quando os juros caem do que cai quando os juros sobem, na mesma magnitude. É valiosa para o investidor.`],
  ["a", "Como calcular a inflação implícita a partir da curva?", `
(1 + taxa nominal do prefixado) ÷ (1 + taxa real do IPCA+ do mesmo prazo) − 1. Ex.: pré 13% e IPCA+ 7% → (1,13 ÷ 1,07) − 1 ≈ 5,6% de inflação implícita ao ano. Se você espera inflação maior que isso, o IPCA+ tende a render mais que o prefixado.`],
  ["a", "Quais métricas de crédito um analista olha numa empresa?", `
Dívida líquida/EBITDA (alavancagem), EBITDA/despesa financeira (cobertura de juros), cronograma de amortização versus caixa, fluxo de caixa livre, garantias e covenants, e a estrutura (dívida da holding vs. da operacional, subordinação).`],
  ["a", "O que é um CRI/CRA e qual seu risco?", `
Certificados de recebíveis imobiliários e do agronegócio: títulos securitizados lastreados em fluxos de crédito (aluguéis, financiamentos, vendas de safra). Isentos de IR para pessoa física. O risco é o do devedor do lastro e da estrutura (subordinação, garantias), não da securitizadora; não têm FGC.`],
  ["a", "Por que títulos longos IPCA+ podem cair muito mesmo sendo 'protegidos da inflação'?", `
A proteção é contra a inflação, não contra a taxa real. Se a taxa real de mercado sobe (por risco fiscal, por exemplo), a marcação a mercado de um título com duration longa (10+ anos) derruba o preço. Quem segura até o vencimento recebe o contratado.`],
]);
