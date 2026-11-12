import { mkq } from "./_mk";

/** Alternativas padrão de Data Sufficiency (iguais em toda prova). */
const DS: [string, string, string, string, string] = [
  "Statement (1) ALONE is sufficient, but statement (2) alone is not sufficient.",
  "Statement (2) ALONE is sufficient, but statement (1) alone is not sufficient.",
  "BOTH statements TOGETHER are sufficient, but NEITHER statement ALONE is sufficient.",
  "EACH statement ALONE is sufficient.",
  "Statements (1) and (2) TOGETHER are NOT sufficient.",
];

const TABLE = `
| Company | Revenue 2025 ($M) | Revenue 2026 ($M) | Employees 2026 |
| A | 120 | 150 | 400 |
| B | 200 | 210 | 900 |
| C | 80 | 104 | 250 |
| D | 150 | 135 | 500 |`;

export default mkq("di", [
  {
    l: "b",
    q: "Data Sufficiency. Is x > 0?\n(1) x² > 0\n(2) x³ > 0",
    o: DS,
    fixed: true,
    c: "B",
    e: `(1) x² > 0 só diz que x ≠ 0: x pode ser 2 ou −2 → insuficiente. (2) x³ > 0 → x > 0 → suficiente. Resposta: B.`,
  },
  {
    l: "b",
    q: "Data Sufficiency. What is the value of x?\n(1) 2x + y = 10\n(2) x − y = 2",
    o: DS,
    fixed: true,
    c: "C",
    e: `Cada equação sozinha tem duas incógnitas. Juntas: somando, 3x = 12 → x = 4. Resposta: C.`,
  },
  {
    l: "b",
    q: "Data Sufficiency. Is the integer n even?\n(1) n² is even.\n(2) 3n is odd.",
    o: DS,
    fixed: true,
    c: "D",
    e: `(1) Se n² é par, n é par (o quadrado de um ímpar é ímpar) → resposta "sim", suficiente. (2) Se 3n é ímpar, n é ímpar → resposta "não", também suficiente (em DS, um "não" definitivo é suficiente). Resposta: D.`,
  },
  {
    l: "b",
    q: "Data Sufficiency. What is the price of one shirt?\n(1) The price of 2 shirts and 3 ties is $100.\n(2) The price of 4 shirts and 6 ties is $200.",
    o: DS,
    fixed: true,
    c: "E",
    e: `A afirmação (2) é exatamente o dobro da (1): é a mesma equação, sem informação nova. Uma equação com duas incógnitas não determina o preço da camisa. Resposta: E.`,
  },
  {
    l: "b",
    q: "Data Sufficiency. What is the average (arithmetic mean) of a, b and c?\n(1) a + b = 20\n(2) c = 10",
    o: DS,
    fixed: true,
    c: "C",
    e: `A média depende de a + b + c. (1) falta c; (2) falta a + b. Juntas: (20 + 10) ÷ 3 = 10. Resposta: C.`,
  },
  {
    l: "a",
    q: "Data Sufficiency. Is xy > 0?\n(1) x > 0\n(2) y > x",
    o: DS,
    fixed: true,
    c: "C",
    e: `(1) não diz nada sobre y. (2) y > x vale com os dois positivos ou os dois negativos ou x negativo e y positivo → insuficiente. Juntas: x > 0 e y > x > 0 → xy > 0. Resposta: C.`,
  },
  {
    l: "a",
    q: "Data Sufficiency. How many employees does the company have?\n(1) 40% of the employees are women.\n(2) The company has 30 more men than women.",
    o: DS,
    fixed: true,
    c: "C",
    e: `(1) só dá a proporção. (2) só dá a diferença. Juntas: homens 60%, mulheres 40% → a diferença de 20% corresponde a 30 pessoas → total 150. Resposta: C.`,
  },
  {
    l: "a",
    q: "Data Sufficiency. What is the remainder when the positive integer n is divided by 4?\n(1) When n is divided by 8, the remainder is 5.\n(2) When n is divided by 2, the remainder is 1.",
    o: DS,
    fixed: true,
    c: "A",
    e: `(1) n = 8k + 5 = 4(2k + 1) + 1 → resto 1 sempre → suficiente. (2) n ímpar: resto pode ser 1 (n = 5) ou 3 (n = 3) → insuficiente. Resposta: A.`,
  },
  {
    l: "b",
    q: "Data Sufficiency. Is triangle PQR a right triangle?\n(1) The sides of PQR measure 5, 12 and 13.\n(2) Two of the angles of PQR add up to 90°.",
    o: DS,
    fixed: true,
    c: "D",
    e: `(1) 5² + 12² = 25 + 144 = 169 = 13² → retângulo. (2) Se dois ângulos somam 90°, o terceiro mede 90° → retângulo. Cada uma sozinha basta. Resposta: D.`,
  },
  {
    l: "a",
    q: "Data Sufficiency. Did the company's revenue from product P increase from 2025 to 2026?\n(1) The number of units of P sold increased by 10%.\n(2) The price per unit of P decreased by 5%.",
    o: DS,
    fixed: true,
    c: "C",
    e: `Receita = unidades × preço. Sozinha, cada afirmação deixa a outra variável livre. Juntas: 1,10 × 0,95 = 1,045 → receita subiu 4,5%. Resposta: C.`,
  },
  {
    l: "b",
    q: `Table Analysis. Based on the table below, which company had the highest percent increase in revenue from 2025 to 2026?\n${TABLE}`,
    o: ["Company A", "Company B", "Company C", "Company D", "Companies A and C tied"],
    c: "C",
    e: `A: 150/120 − 1 = 25%. B: 210/200 − 1 = 5%. C: 104/80 − 1 = 30%. D: 135/150 − 1 = −10%. Maior: C.`,
  },
  {
    l: "b",
    q: `Table Analysis. Based on the table below, which company had the highest 2026 revenue per employee?\n${TABLE}`,
    o: ["Company A", "Company B", "Company C", "Company D", "Companies A and D tied"],
    c: "C",
    e: `Receita por funcionário (US$ mil): A 150/400 = 375; B 210/900 ≈ 233; C 104/250 = 416; D 135/500 = 270. Maior: C.`,
  },
  {
    l: "a",
    q: `Table Analysis. Based on the table below, by approximately what percent did the combined revenue of the four companies grow from 2025 to 2026?\n${TABLE}`,
    o: ["5.0%", "7.5%", "8.9%", "12.5%", "13.4%"],
    c: "C",
    e: `2025: 120 + 200 + 80 + 150 = 550. 2026: 150 + 210 + 104 + 135 = 599. Crescimento: 599/550 − 1 ≈ 8,9%. (A média simples dos crescimentos, 12,5%, está errada porque ignora o peso de cada empresa.)`,
  },
  {
    l: "a",
    q: `Table Analysis. Based on the table below, if Company D's revenue in 2027 returns exactly to its 2025 level, by approximately what percent will it grow from 2026 to 2027?\n${TABLE}`,
    o: ["10.0%", "11.1%", "15.0%", "9.0%", "−10.0%"],
    c: "B",
    e: `De 135 para 150: 150/135 − 1 ≈ 11,1%. Cair 10% e voltar exige subir mais de 10%, porque a base ficou menor.`,
  },
]);
