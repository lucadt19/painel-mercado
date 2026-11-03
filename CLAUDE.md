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

### 2.4 Notícias (`/noticias`)
- Lista de manchetes agregadas de feeds RSS de veículos de negócios e economia.
- Cada item mostra **apenas** título, veículo, horário e link para a matéria original. Não reproduzir o texto das matérias.
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

- **Sem login e sem senha.** O site fica aberto para quem tiver o endereço (decisão de 03/11/2026).
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

- Watchlist editável pela interface (com Supabase).
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
- 03/11/2026: horários e feriados da B3 ficam em `config/b3-calendario.ts`, a partir dos comunicados oficiais da B3; atualizar a cada ano e a cada mudança de horário (horário de verão dos EUA).
