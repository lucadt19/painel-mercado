# CLAUDE.md — Painel de Mercado Pessoal

> Este arquivo é o briefing permanente do projeto. Leia-o inteiro no início de cada sessão.
> Quando uma decisão nova for tomada, atualize a seção correspondente (ou "Decisões registradas" no final).

---

## 1. Visão geral

**O que é:** um painel pessoal de mercado financeiro, com dados ao vivo (ou com pequeno atraso) sobre bolsa brasileira, ETFs, renda fixa e notícias de negócios.

**Para quem:** uso pessoal do dono do site, estudante de Direito e Engenharia com base em contabilidade e valuation, que quer acompanhar o mercado diariamente numa ótica intermediária. Não é um produto para o público, nem um blog.

**Objetivo de uso:** abrir o site de manhã e entre as aulas, e em menos de 30 segundos saber:
- como estão Ibovespa, dólar e os principais ativos que acompanho;
- onde estão Selic, CDI, IPCA e as taxas do Tesouro Direto;
- quais são as manchetes relevantes do dia.

**Domínio:** domínio próprio (.com.br via Registro.br ou equivalente), hospedado na Vercel.

**Princípio central:** clareza e velocidade de leitura acima de tudo. Cada elemento na tela precisa responder a uma pergunta. Se não responde, sai.

---

## 2. Páginas (4)

### 2.1 Visão Geral (`/`): a página principal
- **Faixa de índices no topo:** Ibovespa, IFIX, dólar (USD/BRL), euro (EUR/BRL) e S&P 500, se disponível. Cada um mostra o valor, a variação do dia em % e um sparkline do dia ou da semana.
- **Minha watchlist:** tabela compacta com ticker, nome curto, preço, variação do dia, variação em 12 meses e um mini-gráfico. A lista inicial fica em arquivo de configuração (ver seção 4).
- **Renda fixa resumida:** cards com Selic meta, CDI, IPCA (12 meses) e a taxa de um Tesouro IPCA+ de referência.
- **Manchetes:** as 5 notícias mais recentes, com link para "ver todas".
- **Rodapé de status:** "Atualização automática · cotações de HH:MM · atraso ~X min", com o atraso correspondente ao plano da brapi em uso.

### 2.2 Ações & ETFs (`/acoes`)
- Busca de ticker, para ações, FIIs, ETFs e BDRs.
- **Página de detalhe do ativo** (`/acoes/[ticker]`):
  - gráfico de preço com seletor de período (1D, 5D, 1M, 6M, 1A, 5A);
  - painel de indicadores: P/L, P/VP, dividend yield, valor de mercado, margem líquida e ROE, quando disponíveis;
  - histórico de dividendos e JCP dos últimos 12 meses.
- Seção dedicada a **ETFs** que acompanho, por exemplo BOVA11, IVVB11, SMAL11 e HASH11 (lista configurável).

### 2.3 Renda Fixa (`/renda-fixa`)
- **Indicadores macro:** Selic meta, CDI, IPCA mensal e acumulado em 12 meses, com gráfico histórico de 2 a 5 anos para cada um.
- **Tesouro Direto:** tabela com os títulos ofertados (título, indexador, vencimento, taxa de compra e preço unitário).
- **Curva de juros:** gráfico da curva prefixada (nominal) e da curva IPCA+ (real) por vencimento, com a inflação implícita calculada a partir das duas.
- Nota explicativa curta sobre como ler as taxas. No Tesouro Selic, a taxa é um spread sobre a Selic; no Prefixado, é nominal; no IPCA+, é real.
- **Histórico das taxas** de cada título do Tesouro, comparado com a taxa de hoje.
- **Comparador** (`/renda-fixa/comparador`, aba dentro da Renda Fixa): dois investimentos lado a lado, com IR, isenções e custódia, mostrando a rentabilidade líquida ano a ano.

### 2.4 Notícias (`/noticias`)
- Lista de manchetes agregadas de feeds RSS de veículos de negócios e economia.
- Cada item mostra **apenas** título, foto (a que o próprio feed fornece, hospedada pelo veículo), veículo, horário e link para a matéria original. Não reproduzir o texto das matérias nem abrir as páginas delas para extrair conteúdo.
- A notícia mais relevante aparece em destaque, grande, com as demais em cards menores.
- Filtros simples por fonte e por tema (Mercado, Economia, Empresas).

---

## 3. Stack técnica

| Camada | Escolha | Observação |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Usar Server Components e rotas de API para buscar dados no servidor |
| Estilo | **Tailwind CSS** | Tokens de design definidos no tema (ver seção 5) |
| Componentes | **shadcn/ui**, apenas o necessário | Sem bibliotecas de UI pesadas |
| Gráficos | **TradingView Lightweight Charts** para preço e **Recharts** para séries macro e curva de juros | Avaliar se uma só biblioteca basta antes de instalar duas |
| Ícones | **lucide-react** | |
| Hospedagem | **Vercel** | Deploy automático a partir do GitHub |
| Banco de dados | **Nenhum na v1** | Supabase só se a watchlist passar a ser editável pela interface (fase futura) |

**Regras gerais:**
- Pergunte antes de adicionar qualquer dependência nova.
- Código limpo e tipado; um tipo TypeScript para cada resposta de API.
- Tratamento de erro em toda chamada externa: se uma fonte cair, aquele card mostra "indisponível" e o resto do site continua funcionando.

---

## 4. Fontes de dados

| Dado | Fonte | Detalhes |
|---|---|---|
| Cotações, histórico, fundamentos e dividendos de ações, FIIs, ETFs, BDRs e índices | **brapi.dev** | Exige token. Atraso aproximado por plano: Gratuito ~30 min, Startup ~15 min, Pro ~5 min. Nenhum plano é tempo real tick-a-tick. Confirmar limites atuais na documentação. |
| Tesouro Direto (taxas e preços ofertados no dia) | **brapi.dev** `/api/v2/treasury/indicators` e `/list` | Fonte primária: Tesouro Direto / Tesouro Transparente. A brapi faz cache de poucos minutos. Verificar quais títulos e endpoints o plano contratado cobre; o histórico exige plano Pro. Alternativa gratuita para histórico: CSV oficial do Tesouro Transparente, processado no servidor. |
| Selic, CDI e IPCA | **API SGS do Banco Central** (`api.bcb.gov.br/dados/serie/bcdata.sgs.{código}/dados?formato=json`) | Pública e sem token. Confirmar os códigos das séries (Selic meta, CDI diário, IPCA mensal) antes de usar. |
| Câmbio | brapi (`/api/v2/currency`) ou PTAX do Banco Central | |
| Notícias | Feeds RSS públicos de veículos de economia | Exibir só manchete e link |

**Fontes proibidas:** não usar scraping nem APIs internas não documentadas de portais como Investidor10, Status Invest ou similares. Eles não oferecem API pública, o conteúdo é de direitos reservados, e endpoints internos podem mudar ou ser bloqueados sem aviso. Usar apenas APIs documentadas e fontes oficiais (B3, Tesouro Nacional, Banco Central), diretamente ou via brapi.

**Regras de dados (importantes):**
- **O token da brapi nunca vai para o navegador.** Ele fica em variável de ambiente (`BRAPI_TOKEN`) e é usado só em código de servidor.
- Agrupar tickers numa única chamada sempre que a API permitir.

### 4.1 Atualização automática

O site deve se **atualizar sozinho, sem recarregar a página**, enquanto estiver aberto.

**Como implementar:**
- No servidor: rotas de API próprias (`/api/quotes`, `/api/treasury`, `/api/macro`) que consultam as fontes e fazem cache, para que várias abas abertas não multipliquem as chamadas à brapi.
- No navegador: polling com **SWR** ou **TanStack Query** (escolher um), com `refetchInterval` conforme a tabela abaixo.
- **Pausar o polling quando a aba estiver em segundo plano** e atualizar na hora ao voltar para ela.
- **Pausar o polling de cotações com o pregão fechado**, nos fins de semana e feriados; nesses momentos, mostrar o último fechamento.
- Ao chegar um preço novo, aplicar o flash sutil verde ou vermelho descrito na seção 5.

| Dado | Intervalo de atualização | Cache no servidor |
|---|---|---|
| Ações, ETFs, FIIs, índices e câmbio | igual ao atraso do plano (ex.: 5 min no Pro, 15 min no Startup) | mesmo valor |
| Taxas e preços do Tesouro Direto | 5 minutos durante o horário de funcionamento do Tesouro | 5 minutos |
| Selic, CDI e IPCA (BCB) | 1 vez por hora; essas séries mudam no máximo 1 vez por dia | 6 horas |
| Notícias (RSS) | 5 minutos | 5 minutos |

Atualizar com frequência maior do que o atraso da fonte não traz dado mais novo, só gasta a cota de requisições.

**Transparência obrigatória:**
- **Nunca chamar os dados de "tempo real"** na interface. Usar "Atualização automática".
- Cada bloco mostra o horário da cotação devolvido pela fonte (ex.: "Cotação de 14:32 · atraso ~5 min"), e não o horário da requisição.
- Indicador discreto no header: um ponto verde quando a atualização automática estiver ativa, cinza quando estiver pausada (aba oculta ou pregão fechado).

**Cota mensal:** calcular o consumo esperado (tickers × chamadas por hora × horas de pregão × dias úteis) e garantir que cabe no plano contratado, com folga. Se o uso passar de 80% da cota, registrar aviso no log do servidor.
- A watchlist inicial fica em `config/watchlist.ts`, para eu editar à mão. Ponto de partida, que ajustarei:
  - Ações: PETR4, VALE3, ITUB4, WEGE3, BBAS3
  - ETFs: BOVA11, IVVB11, SMAL11
  - FIIs: deixar a lista vazia por enquanto

---

## 5. Direção estética: minimalista moderno

### Sensação geral
Um terminal financeiro **calmo**. A densidade de informação de um Bloomberg, com a limpeza de um dashboard da Stripe ou do Linear. Referências de espírito: Koyfin, Linear, Stripe Dashboard e Vercel Dashboard. Nada de visual de "app de corretora" com banners, gradientes e chamadas para investir.

### Tema e cores
- **Modo escuro como padrão**, com modo claro disponível por um toggle no header que respeita a preferência do sistema.
- Paleta quase monocromática: fundo, superfície, borda e texto em escala de cinzas neutros, levemente frios.
- **Uma única cor de destaque** (sugestão: azul ou índigo) para links, foco e o item ativo da navegação.
- **Verde e vermelho só para variação de preço**, em tons dessaturados, nunca neon. A variação mostra também o sinal e uma seta (▲ ▼), para que a informação não dependa só da cor.
- Todas as cores definidas como tokens (CSS variables) no tema do Tailwind; nenhuma cor solta no código.

### Tipografia
- **Interface:** sans-serif geométrica e neutra, como Inter ou Geist.
- **Números:** fonte com **algarismos tabulares** (`font-variant-numeric: tabular-nums`) ou uma mono, como Geist Mono ou JetBrains Mono, para que preços e porcentagens fiquem alinhados nas tabelas.
- Hierarquia por **peso e tamanho**, não por cor. Poucos tamanhos de fonte, no máximo 5 na escala.

### Layout e componentes
- Grid de **cards com borda fina (1px)** e cantos levemente arredondados (8px). Sem sombras pesadas.
- Espaçamento generoso entre seções e compacto dentro das tabelas.
- **Header fixo** fino com o nome do site à esquerda, navegação no centro (Visão Geral · Ações & ETFs · Renda Fixa · Notícias), e à direita o status do mercado ("Pregão aberto" ou "fechado") e o toggle de tema.
- Tabelas com linhas zebradas sutis ou divisórias finas, números alinhados à direita e hover discreto na linha.
- Sparklines sem eixos, finos e na cor da variação.
- Gráficos grandes com grid quase invisível, tooltip limpo e sem legenda redundante.

### Estados e microinterações
- **Skeletons** (blocos cinza pulsando) durante o carregamento, sem spinners.
- Quando um preço atualizar, um flash sutil de fundo verde ou vermelho por cerca de 1 segundo.
- Transições curtas (150–200ms). Nada de animações decorativas.
- Erro de fonte: card com texto discreto, "Dados indisponíveis no momento", e o horário da última atualização bem-sucedida.

### Responsividade
- Precisa funcionar bem no **celular**, que é onde vou checar entre as aulas.
- No mobile, a faixa de índices vira carrossel horizontal, a watchlist esconde colunas secundárias (12 meses, mini-gráfico) e a navegação vai para uma barra inferior ou menu compacto.

### O que NÃO fazer
- Gradientes chamativos, glassmorphism ou ilustrações 3D.
- Emojis na interface.
- Mais de uma cor de destaque.
- Texto de marketing do tipo "Invista no seu futuro!". O site é ferramenta, não vitrine.

---

## 6. Localização e formatação

- Idioma da interface: **português do Brasil**.
- Moeda: `R$ 1.234,56` (usar `Intl.NumberFormat('pt-BR')`).
- Porcentagens: `+1,23%` / `−0,45%`, sempre com sinal.
- Datas: `dd/mm/aaaa`; horários em 24h.
- Fuso horário: **America/Sao_Paulo** em todos os horários exibidos.
- Status do pregão calculado com base no horário de negociação da B3, sem horário fixo no código, porque ele muda ao longo do ano. Considerar fins de semana e feriados.

---

## 7. Privacidade e acesso

- **Site aberto para ver, sem login.** Só editar a watchlist pede uma senha (decisão de 05/11/2026; antes, 03/11/2026, não havia login nenhum).
- Adicionar `robots.txt` bloqueando indexação e `noindex` nas páginas, para mantê-lo fora dos buscadores.
- Nenhum dado pessoal ou financeiro meu (posições, valores investidos) fica armazenado na v1.
- Como as rotas `/api/...` ficam públicas, avaliar um limite de requisições nelas para proteger a cota da brapi.

---

## 8. Ordem de construção (fazer uma etapa por vez)

Ao fim de cada etapa: parar, me mostrar o resultado rodando localmente e esperar meu ok antes de seguir. Fazer um commit por etapa.

1. **Fundação:** criar o projeto Next.js + TypeScript + Tailwind; definir os tokens de design (cores, fontes e escala de espaçamento); montar o layout base com header, navegação e toggle de tema; deixar as 4 páginas vazias com títulos.
2. **Camada de dados:** clientes tipados para brapi e BCB, rotas de API no servidor, cache, tratamento de erro, variáveis de ambiente (`.env.example` documentado) e o mecanismo de atualização automática da seção 4.1.
3. **Visão Geral:** faixa de índices, watchlist, cards de renda fixa, manchetes e skeletons.
4. **Ações & ETFs:** busca, página de detalhe com gráfico e indicadores, e seção de ETFs.
5. **Renda Fixa:** séries macro, tabela do Tesouro e curva de juros.
6. **Notícias:** agregação de RSS e filtros.
7. **Refino:** responsividade completa, acessibilidade (contraste e navegação por teclado), limite de requisições nas rotas de API, metadados, favicon e `robots.txt`.
8. **Deploy:** subir na Vercel, configurar as variáveis de ambiente e conectar o domínio próprio.

---

## 9. Fases futuras (não fazer agora)

- ~~Watchlist editável pela interface~~ (feito em 05/11/2026, com senha única e Upstash Redis).
- Carteira pessoal com posições e rentabilidade.
- Alertas de preço por e-mail.
- Comparador de ativos lado a lado.

---

## 10. Como trabalhar comigo

- Antes de grandes mudanças, **proponha o plano** e espere aprovação.
- Explique em 1–2 frases o porquê de decisões técnicas relevantes. Quero aprender, mas sem aulas longas.
- Se um dado não estiver disponível na fonte planejada (por limite de plano, por exemplo), **avise e proponha alternativa** em vez de inventar dados ou deixar mock silencioso.
- Nunca use dados fictícios sem rotulá-los claramente como "exemplo".

---

## Decisões registradas

_(Adicionar aqui, com data, cada decisão tomada durante o projeto.)_

- 03/11/2026: dados com atualização automática (polling), usando apenas fontes oficiais ou APIs documentadas; sem scraping de portais como Investidor10.
- 03/11/2026: desenvolver com o plano Gratuito da brapi (~30 min de atraso). Avaliar a assinatura do plano Pro (~5 min) quando o site estiver no ar. O intervalo de polling é configurável por variável de ambiente (`QUOTES_REFRESH_SECONDS`), para mudar de plano sem mexer no código.
- 03/11/2026: sem login nem senha. O site fica aberto; `noindex` e `robots.txt` o mantêm fora dos buscadores.
- 03/11/2026: escolhas da etapa 1: dependências `next-themes`, `lucide-react`, `clsx` e `tailwind-merge`; o tema segue o sistema e, sem preferência, abre no escuro; o toggle guarda a escolha; cor de destaque índigo frio; nome provisório "Painel"; gerenciador de pacotes npm; navegação no celular em barra inferior fixa.
- 03/11/2026: o tema usa um script inline (padrão recomendado pela documentação do Next 16) em vez de `next-themes`.
- 03/11/2026: regra de dados: usar sempre a fonte mais recente e confiável disponível e mostrar, ao lado de cada informação, quando ela foi atualizada na fonte.
- 03/11/2026: limites do plano Gratuito da brapi: 15.000 requisições/mês, 1 ticker por chamada, histórico de 3 meses, sem dividendos, fundamentos nem Tesouro. Por isso:
  - Tesouro Direto vem do CSV oficial do Tesouro Transparente (taxas e preços do último dia útil, com a data-base exibida); cache de 1 hora, já que o arquivo muda uma vez por dia.
  - Câmbio: brapi se o plano permitir; senão, PTAX do Banco Central (boletins ao longo do dia, com horário).
  - Selic meta, CDI e IPCA: SGS do Banco Central, séries 432 (Selic meta), 4389 (CDI anualizado), 433 (IPCA mensal) e 13522 (IPCA 12 meses).
- 03/11/2026: polling no navegador com SWR. Cache no servidor com `use cache` + `cacheLife` do Next 16: a resposta das rotas `/api/*` é compartilhada por todas as abas e se renova no intervalo configurado.
- 03/11/2026: testado com o token: o câmbio da brapi exige o plano Startup (dólar e euro vêm da PTAX); a brapi limita a 20 chamadas por minuto (fazemos no máximo 3 por vez, com uma nova tentativa após 429); o IFIX volta como `IFIX.SA`. Para o servidor local confiar no antivírus Norton (que intercepta HTTPS), `npm run dev` usa `node --use-system-ca`.
- 03/11/2026: Visão Geral (etapa 3): a watchlist mostra a variação em 3 meses (limite do Gratuito); com `BRAPI_PLAN=startup` ou `pro` passa a 12 meses sozinha. Histórico diário vem na mesma chamada da cotação (sem custo de cota). Tesouro de referência: IPCA+ 2035 (`config/watchlist.ts`). Mini-gráficos em SVG próprio, sem biblioteca. Manchetes reservadas até a etapa 6. Se uma fonte falhar por motivo passageiro, o cache dura 5 min em vez do intervalo normal.
- 03/11/2026: Ações & ETFs (etapa 4), a pedido: abas Brasil e Mundo.
  - CORREÇÃO (testado com ativo comum, WEGE3): no Gratuito o histórico vai só até 3 meses (1d, 5d, 1mo, 3mo); dividendos/JCP exigem Startup; indicadores P/VP, DY, margem e ROE (`modules`) exigem Pro. O primeiro teste usou PETR4, que é um dos 4 tickers de teste da brapi (PETR4, VALE3, ITUB4, MGLU3) liberados em qualquer plano; não usar esses tickers para testar limites de plano.
  - `BRAPI_PLAN` (free/startup/pro) liga sozinho histórico, proventos, indicadores, ativos por chamada e quantas empresas a aba Mundo cota. A página do ativo explica o que falta no plano atual.
  - Limite de 20 chamadas/min da brapi + limite de 50 s do Next por função `use cache` no build: as chamadas falham rápido em vez de esperar (limitador de 15/min por instância; no 429, só espera se a brapi pedir ≤ 5 s). Item que falhou por limite tenta de novo em 5 min; o navegador mantém o último valor bom (cotações e lista). No Gratuito a aba Mundo cota só as 8 primeiras de `worldStocks`.
  - Brasil: todos os ativos da B3 via `/quote/list` (2 chamadas por rodada); essa lista não traz horário de cotação, então a tabela mostra "consultado às". ETFs acompanhados: BOVA11, IVVB11, SMAL11, HASH11.
  - Mundo: 25 grandes empresas em dólar (`worldStocks` em `config/watchlist.ts`), 1 chamada cada, de hora em hora com a bolsa de Nova York aberta; mais os BDRs da B3 pela lista.
  - Página do ativo: 1 chamada (histórico até o máximo do plano + indicadores e proventos se o plano cobrir), cache de 30 min. Gráfico com `lightweight-charts` (logo da TradingView exigido pela licença).
  - Cota estimada: ~9.500 de 15.000/mês.
- 03/11/2026: Renda Fixa (etapa 5): só `lightweight-charts` para todos os gráficos (sem Recharts). Histórico de 5 anos das séries do BC, 1 ponto por mês, períodos 1A/2A/5A (padrão 2A). O CSV do Tesouro traz taxa de compra para todos os títulos, inclusive fora de venda (ex.: IGP-M+), então não dá para filtrar "ofertados": a tabela abre as famílias principais e recolhe Educa+, Renda+ e IGP-M+. Curva nominal = Prefixado (com e sem cupom); real = IPCA+ (com e sem cupom); inflação implícita interpolando a curva real.
- 03/11/2026: Notícias (etapa 6): 7 feeds RSS públicos em `config/news.ts` (InfoMoney, Valor, Estadão, Folha, Exame, Money Times, g1; o feed da CNN Brasil não existe mais). Leitura com `fast-xml-parser`, respeitando a codificação de cada feed (a Folha usa ISO-8859-1). Tema por endereço da matéria, depois categoria do feed, depois padrão do veículo; sem tema, a notícia é descartada. Só título, veículo, horário e link; cache e atualização de 5 min.
- 04/11/2026: Refino (etapa 7):
  - Proteção da cota: `/api/asset/[ticker]` só chama a brapi para tickers configurados ou presentes na lista da B3 (lida da própria rota `/api/market-list`, em cache); sem a lista, responde 503 em vez de arriscar. `proxy.ts` limita a 30 consultas de ativo por minuto por IP (memória local, por instância).
  - Acessibilidade: contraste medido (WCAG AA) nos dois temas; verde/vermelho do tema claro escurecidos (#187a4f, #b83c35); token `--border-strong` (≥ 3:1) nos contornos de controles. Componente `Segmented` (radio group com setas) para todos os seletores; abas Brasil/Mundo com setas; link "Pular para o conteúdo"; gráficos com descrição em texto (`role="img"`).
  - Acabamento: `app/icon.svg`, ícones PNG gerados com `ImageResponse` (iPhone e Android), `manifest.ts` para "Adicionar à tela de início", `robots.ts` bloqueando tudo, páginas 404 e de erro. Nome do site continua "Painel" (`config/site.ts`).
- 04/11/2026: logos das empresas ao lado dos tickers (tabelas, busca, página do ativo), de `icons.brapi.dev`; sem logo, mostra as iniciais. Fundo branco fixo (`--logo-bg`) para logos escuros não sumirem no tema escuro.
- 04/11/2026: notícias com foto e destaque, a pedido. Foto só do que o feed fornece (`media:content`, `mediaurl` ou a primeira `<img>` do conteúdo que não esteja num link para outra matéria); Folha e Money Times não trazem foto (bloco neutro com o nome do veículo). Destaque = assunto publicado por mais veículos (manchetes com palavras-chave em comum, até 12 h de diferença), com desconto pela idade, e que tenha foto.
- 04/11/2026: depois de uma falha passageira, as telas consultam de novo em 2,5 min (o servidor responde do cache até tentar a fonte de novo, em 5 min).
- 04/11/2026: histórico das taxas do Tesouro na Renda Fixa, a pedido: do mesmo CSV oficial (diário desde 2002), por título ainda negociado, via `/api/treasury-history/[id]` (cache de 6 h; a primeira leitura do dia leva ~15 s). Compara a taxa de hoje com média, mínima, máxima e percentil do período (1A/2A/5A/Tudo); clicar num título da tabela abre o histórico. CDB ficou de fora: não há fonte oficial atual e gratuita (a série SGS 28663, taxa média de CDB pós, para em jan/2024).
- 04/11/2026 (ampliado em 05/11/2026, ver abaixo): selo "Resultado 3T26" ao lado do ticker por 7 dias após a divulgação, a pedido. Fontes: data de entrega do ITR/DFP nos dados abertos da CVM (oficial, mas atualizada só 1 vez por semana; zip lido com `lib/server/unzip.ts`, sem dependência) + manchetes do dia (ticker + palavra de resultado; ou nome em `companyAliases` + trimestre explícito, sem ticker de outra empresa, e trimestre plausível para a data). Com os dois para o mesmo trimestre, vale a data da CVM.
- 04/11/2026: comparador de renda fixa, a pedido, como aba da Renda Fixa. Regras em `config/fixed-income.ts` (IR regressivo 22,5/20/17,5/15%; LCI, LCA, CRI, CRA e debêntures incentivadas isentos; custódia B3 0,20% a.a. no Tesouro, Tesouro Selic isento até R$ 10 mil); contas puras em `lib/fixed-income-calc.ts`, testadas à parte. Premissas: CDI/IPCA/Selic constantes (preenchidos do BC, editáveis), % do CDI sobre o CDI diário, Selic efetiva = meta − 0,10, sem IOF, sem cupom. Poupança ficou para depois. Regras conferidas em 04/11/2026: a MP 1.303 caducou e nada mudou na tributação.
- 04/11/2026: site publicado na Vercel (painel-mercado-eta.vercel.app), com deploy automático a cada push na `main`.
- 04/11/2026, a pedido:
  - Comparador: cards de resumo por investimento (rentabilidade líquida a.a., período, faixa do IR, alíquota ou isenção, custódia e valor final), com o selo "Rende mais".
  - Cards do topo da Visão Geral clicáveis. Índices abrem `/acoes/[ticker]`; dólar e euro abrem `/cambio/[par]`, com histórico diário de 5 anos da PTAX de venda (SGS 1 e 21619, cache de 1 h).
- 04/11/2026: contra o "indisponível":
  - No build, cotações e aba Mundo não consultam a brapi (o Next monta as rotas mais de uma vez e estourava o limite de 20/min); a primeira consulta é no acesso seguinte, 1 min depois. O câmbio (PTAX) e a lista da B3 seguem no build.
  - O servidor (memória da instância) e o navegador (`localStorage`, chave `painel:ultimos-valores:v1`) guardam o último valor bom de cotações, câmbio e indicadores do BC. Numa falha passageira, mostram esse valor com o horário original e "último dado de …".
  - Não rodar build local com o token logo antes de publicar.
- 04/11/2026: histórico longo da B3, a pedido. Fonte: arquivos oficiais COTAHIST (Séries Históricas, gratuitos; ~95 MB por ano). Como funciona:
  - `scripts/b3-historico.mjs` lê os arquivos anuais dos últimos 5 anos, só mercado à vista. Grava o fechamento diário de ~2.100 ações, FIIs, ETFs e BDRs em `data/b3-historico/{TICKER}.json` (~16 MB). Direitos de subscrição e recibos ficam de fora.
  - O GitHub Actions (`.github/workflows/b3-historico.yml`) roda o script no dia 2 de cada mês e faz commit; a Vercel publica sozinha.
  - Os últimos 3 meses seguem na brapi (30 min). `lib/server/b3-history.ts` junta as fontes e, no primeiro dia em comum, reescala a parte da B3 se as duas diferirem mais de 2%.
  - Página do ativo: 6M/1A/5A com B3 + brapi. Watchlist: variação de 12 meses com o fechamento de 1 ano atrás vindo da B3.
  - Preços não ajustados por dividendos. A brapi Gratuita também não ajusta desdobramentos.
  - Desdobramentos e grupamentos são detectados pelo salto para um fator exato, com o preço firme no novo patamar. Não são detectados em dias com o BOVA11 variando mais de 4% (ex.: 26/10/2026, após o 2º turno), nem abaixo de R$ 0,10, nem com dois eventos a menos de 15 pregões. É uma estimativa, avisada na página.
  - Índices (Ibovespa, IFIX) não estão no COTAHIST.
- 03/11/2026: horários e feriados da B3 ficam em `config/b3-calendario.ts`, a partir dos comunicados oficiais da B3; atualizar a cada ano e a cada mudança de horário (horário de verão dos EUA).
- 05/11/2026, a pedido:
  - **Selos de resultado para todas as empresas.** Fontes oficiais da CVM (dados abertos, atualizados aos domingos): IPE (releases como "Release de Resultados 3T26", com o link do documento; é o mesmo do site de RI), ITR e DFP. Cada empresa é ligada aos tickers pelo CNPJ, no cadastro FCA.
  - Ficam de fora prévias, agendas, "datas de divulgação" e documentos de menos de 10 dias após o fim do trimestre.
  - No mesmo dia, valem as manchetes: um ticker só + palavra de resultado; ou o nome da empresa (`companyAliases` e `config/search-aliases.ts`) + "trimestre"/"3T26", sem outro ticker.
  - Os sites de RI não são lidos: seria scraping, e o conteúdo é o mesmo da CVM.
  - **Busca:** casa palavra por palavra com o nome e os apelidos de `config/search-aliases.ts`, expandindo as abreviações da B3 (BCO → banco). Esconde os tickers do fracionário (com F). Botão no cabeçalho de todas as páginas (atalho "/").
  - **Watchlist editável:**
    - Lista no Upstash Redis (`KV_REST_API_URL`/`KV_REST_API_TOKEN`, criadas pela Vercel), chave `painel:watchlist:v1`. Sem banco, vale `config/watchlist.ts`; em desenvolvimento sem as variáveis, usa um banco em memória.
    - Senha única `WATCHLIST_PASSWORD` (na Vercel; a de teste local fica no `.env.local`). Cookie `painel_sessao` assinado com HMAC, 90 dias. Bloqueio de 15 min após 5 erros por IP.
    - Máximo de 20 ativos, por causa da cota da brapi (~73% dela com 20). Com mais de 15 ativos, a rodada espera vagas no limite de 20/min (até 75 s por chamada; `useCacheTimeout` 130 s e `maxDuration` 120 s em `/api/quotes`).
    - Mudou a lista → `revalidateTag("quotes")` renova as cotações.
