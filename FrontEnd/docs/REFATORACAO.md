# Refatorações, melhorias e decisões técnicas

[Voltar ao README](../README.md). Os registros abaixo descrevem suas respectivas
entregas; verificações antigas não são testes executados nesta consolidação.

- [Decisões em vigor](#decisoes)
- [Alinhamento dos controles](#alinhamento)
- [Entrega Clean Code](#clean-code)
- [Acessibilidade e respostas obsoletas](#acessibilidade-inicial)
- [Refatoração de 21/09](#refatoracao-21)
- [Limpeza de artefatos de 21/09](#limpeza-21)
- [Tema, estados e lote HTTP de 23/09](#revisao-23)
- [Remoção posterior do legado](#limpeza-legado)
- [ErrorBoundary e carregamento por página](#melhorias-23)
- [Navegação e qualidade de 25/09](#revisao-25)

<a id="decisoes"></a>

## Decisões em vigor

- React/Vite é o frontend ativo; o protótipo Blazor foi removido.
- A aplicação possui páginas em `src/pages/` e navegação por hash via `useHashRoute`.
- `App.jsx` funciona como bootstrap/layout; `DashboardPage.jsx` compõe o dashboard.
- O cliente HTTP permanece centralizado em `src/services/api.js`; não foi criada uma camada de repositories sem necessidade.
- O frontend não gera mocks operacionais em falha de API.
- Funcionalidades dependentes de persistência permanecem bloqueadas até contrato oficial.

Hash routing atende às rotas existentes sem nova dependência. O hook de dados
orquestra estado/cache, enquanto `useAutoRefresh` isola o agendamento. Funções
puras usam os utilitários existentes. Repetições curtas de layout não justificam
componentes genéricos, stores, contexts ou repositories adicionais.
Contratos e bloqueios funcionais estão em [Integração](INTEGRACAO.md).

<a id="alinhamento"></a>

## Alinhamento dos controles — registro inicial

Base: `main`, commit `87938499a1feec72ecca32be049343a3d0ce0a0e`.
Os labels de data/colaborador em `Header.jsx` usavam `control` (flex, 40 px),
sem alinhamento vertical. Foi adicionado `items-center`, já usado em outro
controle do projeto, sem alterar filtros ou contratos. Campos sem dados foram
atribuídos ao seed e aos contratos ausentes, detalhados em [Integração](INTEGRACAO.md).

Testes/build não puderam rodar nesse ambiente: clone pela rede e dependências
indisponíveis. A revisão visual recomendada cobria alinhamento de tema/refresh/
data/colaborador, temas claro/escuro, desktop/mobile e troca funcional de filtros.
Somente `Header.jsx` mudou; backend permaneceu intacto.

<a id="clean-code"></a>

## Entrega Clean Code — após adequação aos requisitos

Escopo exclusivamente frontend, sem alteração dos contratos ou funcionalidades.
Esta entrega precede remoções e validações posteriores descritas abaixo.

### Matriz rastreável

| Arquivo | Função/Componente | Problema encontrado | Alteração realizada | Motivo | Impacto | Validação |
| --- | --- | --- | --- | --- | --- | --- |
| `FrontEnd/src/hooks/useDashboardData.js` | `useDashboardData` | O hook acumulava consulta HTTP, estado, timer de 30s e tratamento da Visibility API | O agendamento automático foi extraído para `useAutoRefresh`; helpers locais passaram a construir estados de loading/erro | Separar responsabilidades distintas e facilitar teste isolado do agendamento | Comportamento de consulta, cancelamento e refresh é preservado; hook principal ficou focado no ciclo de dados | `node --check`; revisão de dependências; teste dedicado do novo hook |
| `FrontEnd/src/hooks/useAutoRefresh.js` | `useAutoRefresh` | Lógica de timer/visibilidade estava acoplada ao hook de dados | Novo hook encapsula iniciar/parar intervalo, pausa em aba oculta e refresh imediato ao retornar | Responsabilidade única e reutilização do comportamento temporal | Sem mudança de contrato da API; reduz complexidade de `useDashboardData` | `node --check`; `useAutoRefresh.test.js` |
| `FrontEnd/src/hooks/useAutoRefresh.test.js` | testes do hook | Não havia teste isolado para pausa/agendamento de refresh | Criados casos de intervalo ativo, modo desabilitado e retorno à aba visível | Proteger comportamento extraído contra regressão | A lógica temporal passa a ser verificável sem depender de requisições reais | Revisão estática + sintaxe; execução Vitest pendente do ambiente local completo |
| `FrontEnd/src/services/api.js` | `fetchDashboardData` e helpers HTTP | Construção de query, fallback de requests opcionais e normalização estavam duplicados/mesclados | Criados helpers internos `buildDashboardFilterQuery`, `normalizeSummary`, `requestOptionalJson` e `fetchPreviousSummaries`; fluxo principal passou para `async/await` | Reduzir duplicação e deixar explícito o que é requisição principal vs. opcional | Mesmos endpoints, parâmetros e formato de retorno; nenhuma alteração de contrato | `node --check`; testes de URL, datas e degradação segura |
| `FrontEnd/src/services/api.js` | `getPreviousDateKeys` | Existiam verificações inalcançáveis depois de `safeIsoDate`, que já garante data válida | Removidos ramos mortos e mantido cálculo UTC | Eliminar código morto e tornar a intenção do método clara | Resultado para datas válidas permanece igual | Testes existentes de datas e mudança de mês |
| `FrontEnd/src/services/api.test.js` | testes do serviço | A resiliência das chamadas opcionais não era coberta | Adicionado teste com falha de realtime, payload inválido de usuários e normalização semanal | Garantir que falhas secundárias não derrubem o resumo principal | Maior proteção contra regressões do cliente HTTP | Teste automatizado criado; execução final pendente do checkout com dependências |
| `FrontEnd/src/utils/dashboard.js` | helpers de apresentação | `DashboardPage` fazia filtro, contagem e formatação de data dentro da página | Criados `filterRealtimePeople`, `countPeopleByStatus` e `formatDashboardReferenceDate` | Tirar transformação de dados da composição visual e facilitar teste unitário | Nenhuma mudança visual esperada | `node --check`; novos casos em `dashboard.test.js` |
| `FrontEnd/src/utils/dashboard.test.js` | testes dos helpers | Transformações usadas na página não possuíam testes unitários | Adicionados testes de filtro, contagem por status e data formatada | Cobrir a lógica extraída da página | Reduz risco de regressão em filtros/indicador Online | Sintaxe validada; execução Vitest pendente do ambiente completo |
| `FrontEnd/src/pages/DashboardPage.jsx` | `DashboardPage` | Página misturava composição visual com transformação dos dados retornados | Passou a consumir helpers de `utils/dashboard`; removidos props que `ReportsAndAgent` não utiliza | Aumentar coesão da página e eliminar parâmetros desnecessários | UI e integração existentes preservadas | Parse JSX com TypeScript; revisão das props e imports |
| `FrontEnd/src/components/ActivityChart.jsx` | `ActivityChart` | Preparação da série e cálculo de domínio estavam no corpo do componente | Extraídos helpers locais `buildRegisteredTimeChartData` e `getChartMaximum`; nomes internos ficaram mais descritivos | Separar preparação de dados da renderização sem criar nova camada | Mesmo gráfico e mesma unidade de dados | Parse JSX com TypeScript; revisão de equivalência |
| `FrontEnd/src/components/PeopleCard.jsx` | `PeopleCard` | Transformação do DTO realtime e renderização estavam misturadas; nomes `updated`/`application` eram genéricos | Extraído `buildPeopleRows`; adotados `applicationName` e `lastActivityLabel` | Melhorar intenção dos nomes e reduzir lógica dentro do JSX | Mesmos dados exibidos; campos sensíveis continuam não renderizados | Parse JSX com TypeScript; testes existentes preservados |

### Critérios e preservações da entrega

O hook continuou orquestrador, com helpers internos no único cliente HTTP;
filtro, contagem e data saíram de DashboardPage por serem funções puras.
Card, MetricCard, PageHeader, SectionHeading, EmptyState, IntegrationNotice,
AuthPage, ReportsPage, SettingsPage, TasksPage, CollaboratorsPage, Header,
TimelineCard e ReportsAndAgent foram preservados por já terem responsabilidades claras.

### Código legado/candidatos a remoção preservados

Os seguintes arquivos possuem uso reduzido ou histórico, mas **não foram removidos nesta entrega**:

- `src/hooks/useActiveSection.js` — documentado como compatibilidade/histórico;
- `src/hooks/useDashboard.js` — barrel de retrocompatibilidade;
- `src/components/CategoryChart.jsx` — placeholder legado já fora do fluxo principal;
- `src/components/AppsCard.jsx` — não renderizado hoje, mas compatível com a futura classificação dentro/fora do escopo exigida por RF-27;
- `src/utils/report.js` e `report.test.js` — utilitários antigos de exportação local não são usados pelo fluxo atual, porém a remoção foi adiada para não introduzir quebra de compatibilidade sem uma decisão explícita do time.

Naquela entrega, a remoção foi adiada até confirmar a ausência de consumidores
externos ou branches dependentes; a preservação não alterava o fluxo da aplicação.

Esses candidatos foram removidos na revisão seguinte; a lista acima registra
a decisão daquela entrega e não instrui a mantê-los no checkout atual.

### Validação desta refatoração

#### Executada neste ambiente

- `node --check` nos arquivos JavaScript alterados: OK;
- parse dos arquivos JSX alterados usando o parser TypeScript disponível no ambiente: OK;
- checagem de imports relativos dos arquivos entregues contra a estrutura do projeto: OK;
- busca estática por arquivos fora de `FrontEnd/` no pacote final: nenhum encontrado;
- revisão de equivalência dos contratos públicos de `fetchDashboardData`, `getReportUrl`, `useDashboardData`, `ActivityChart` e `PeopleCard`.

#### Não disponível neste ambiente

O `package.json` do projeto não define script de lint, portanto não existe comando oficial `npm run lint` a executar sem adicionar ferramenta/dependência fora do objetivo desta refatoração.

O ambiente de execução desta análise não possui `node_modules`, logo a suíte Vitest e o build Vite completos devem ser executados no checkout local:

```powershell
cd FrontEnd
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Não foi adicionada uma ferramenta de lint apenas para satisfazer a validação, pois isso seria mudança de dependência sem requisito técnico do projeto.

<a id="acessibilidade-inicial"></a>

## Acessibilidade e respostas obsoletas — entrega inicial de 21/09/2026

Repositório registrado: `CarlosEduardoLemos/TimeTracker-2026-2`.

### Melhorias realizadas

#### `FrontEnd/src/components/Sidebar.jsx`

- **Problema:** o menu mobile usa `role="dialog"` e move o foco ao abrir, mas permitia que a navegação por `Tab` escapasse do modal.
- **Alteração:** inclusão de referência para o painel mobile e contenção de foco entre o primeiro e o último elemento focável; `Escape` continua fechando o menu e devolvendo o foco ao botão de abertura.
- **Motivo:** corrigir uma lacuna real de acessibilidade por teclado sem alterar navegação ou layout.
- **Benefício:** navegação previsível para usuários de teclado e tecnologias assistivas.

#### `FrontEnd/src/components/ActivityChart.jsx`

- **Problema:** o gráfico Recharts era essencialmente visual; leitores de tela não tinham uma representação tabular equivalente dos valores.
- **Alteração:** o gráfico visual foi marcado como decorativo para tecnologias assistivas e foi adicionada uma tabela `sr-only` com dia e tempo registrado.
- **Motivo:** fornecer alternativa textual/semântica equivalente aos dados do gráfico.
- **Benefício:** os mesmos dados ficam disponíveis para leitores de tela sem duplicar informação visual.

#### `FrontEnd/src/pages/AuthPage.jsx`

- **Problema:** o campo de e-mail marcava `aria-invalid`, porém a mensagem de erro não estava vinculada ao campo. O campo de senha também podia ficar inválido sem apresentar uma mensagem de erro específica.
- **Alteração:** inclusão de `aria-describedby` condicionado ao erro, IDs estáveis, mensagens com `role="alert"` e feedback explícito para senha com menos de 8 caracteres.
- **Motivo:** tornar validações compreensíveis e anunciáveis por tecnologia assistiva.
- **Benefício:** melhor acessibilidade e comportamento de formulário mais claro, sem habilitar autenticação ainda não integrada.

#### `FrontEnd/src/hooks/useDashboardData.js`

- **Problema:** o hook dependia do comportamento de abort do `fetch` para impedir que uma resposta antiga atualizasse o estado após troca de filtro/desmontagem.
- **Alteração:** adicionado `controller.signal.aborted` antes de atualizar estado tanto na resolução quanto no tratamento de erro.
- **Motivo:** tornar o hook resistente a clientes/mocks/adapters que possam resolver uma Promise mesmo depois do cancelamento.
- **Benefício:** reduz risco de race condition e de dados antigos sobrescreverem o filtro atual.

### Testes

#### Testes existentes identificados

O frontend já possui Vitest + Testing Library e testes para componentes, hooks, serviços e utilitários, incluindo `Header`, `Sidebar`, `PeopleCard`, `ReportsAndAgent`, `useAutoRefresh`, `useHashRoute`, `useTheme`, `api`, `dashboard` e `report`.

#### Testes adicionados/expandidos

- `FrontEnd/src/components/ActivityChart.test.jsx`
  - valida alternativa acessível tabular do gráfico;
  - valida estado vazio.
- `FrontEnd/src/components/Sidebar.test.jsx`
  - mantém os testes existentes;
  - valida retorno de foco após `Escape`;
  - valida focus trap com `Tab` e `Shift+Tab`.
- `FrontEnd/src/pages/AuthPage.test.jsx`
  - valida estrutura de login/cadastro ainda desabilitada;
  - valida associação do erro de e-mail ao campo;
  - valida feedback acessível de senha.
- `FrontEnd/src/hooks/useDashboardData.test.js`
  - valida carregamento e timestamp;
  - valida refresh sem apagar dados já exibidos;
  - valida estado de erro;
  - valida que resposta antiga não sobrescreve dados após mudança de filtro.

#### Execução

Os testes **não puderam ser executados neste ambiente** porque a conexão GitHub disponível é somente leitura e o ambiente local não possui `node_modules`; também não há acesso de rede para instalar as dependências do projeto.

Foi possível verificar sintaxe dos módulos JavaScript sem JSX com o runtime Node disponível. A execução completa recomendada após aplicar os arquivos é:

```bash
cd FrontEnd
npm ci
npm test
npm run build
```

Pacote histórico: oito arquivos (quatro de aplicação, quatro de testes), sem
mudanças externas. O Blazor foi preservado nessa etapa: ausência de referência
textual não era prova suficiente para excluir um protótipo de valor histórico.
Não houve nova abstração, movimentação estética ou substituição de placeholders.
O pacote era distribuído por ZIP para sobreposição no checkout e validação antes do commit.

<a id="refatoracao-21"></a>

## Refatoração de 21/09/2026 — degradação, cache e código sem uso

### O que foi alterado

A refatoração concentrou mudanças onde havia benefício técnico verificável: cliente HTTP/dashboard, tratamento de degradação parcial, cache de histórico, componentes do painel, acessibilidade, remoção de código morto, utilitários e testes. Não foram adicionadas funcionalidades de produto, bibliotecas ou camadas arquiteturais novas.

#### Rede e confiabilidade

- `services/api.js` passou a diferenciar requisição principal de chamadas opcionais com estado de disponibilidade.
- Payloads opcionais que deveriam ser arrays (`/activities/realtime` e `/users/`) são validados antes de serem aceitos.
- Falha de um dia histórico gera `unavailable: true` em vez de um resumo vazio indistinguível de zero atividade.
- `fetchDashboardData` aceita resumos históricos previamente confirmados e reutiliza somente os dias válidos.
- O primeiro carregamento continua podendo realizar 9 chamadas; refreshes do mesmo filtro caem para 3 quando os seis dias anteriores foram carregados com sucesso.
- Histórico que falhou não entra no cache e é tentado novamente.

#### Estado do Dashboard

- `useDashboardData` renomeou o estado interno `dataDate` para `filterKey`, que representa corretamente data + colaborador.
- O hook mantém um cache em memória apenas dos seis resumos históricos do filtro atual.
- Respostas obsoletas continuam bloqueadas por `AbortController` e verificação de `signal.aborted`.
- `DashboardPage` diferencia API online, offline e parcialmente disponível.
- Falha do realtime não é mais apresentada como `0` colaboradores online.

#### Componentes e acessibilidade

- `MetricCard`: removida prop `positive`, que não possuía consumidores; ícone marcado como decorativo.
- `ActivityChart`: removida representação interna em décimos de hora; o gráfico trabalha diretamente em horas e diferencia ausência de dado de zero real.
- `PeopleCard`: removida sanitização duplicada de segundos, status `ausente` alinhado ao backend, uso de status bruto para cor, `caption` na tabela e `scope="col"` nos cabeçalhos.
- `Header`: adicionado estado visual/semântico `degraded`; offline passa a ter tom de erro distinto.
- `constants/ui.js`: removidos comentários excessivos e corrigido o mapeamento `idle` → `ausente` conforme o contrato atual.

#### Código morto removido

- `src/components/AppsCard.jsx`
- `src/components/CategoryChart.jsx`
- `src/hooks/useActiveSection.js`
- `src/hooks/useDashboard.js`
- `src/utils/report.js`
- `src/utils/report.test.js`
- exportações correspondentes em `components/index.js` e `hooks/index.js`
- `getReportUrl` em `services/api.js`, sem consumidor enquanto a exportação oficial permanece bloqueada
- `getLocalIsoDate` em `utils/dashboard.js`, sem consumidor
- classes CSS antigas sem referências no frontend ativo (`notification-dot`, `legend-dot`, `pill*`, `online-badge`) e media query redundante de layout mobile

### Como o código foi simplificado

- cache limitado ao dado estável já existente, sem biblioteca de estado/cache;
- serviço HTTP continua em um único arquivo porque o número de contratos ativos ainda é pequeno;
- lógica de disponibilidade usa três flags simples (`realtime`, `users`, `history`);
- horas do gráfico não usam mais escala intermediária em décimos;
- `PeopleCard` reutiliza a sanitização já existente em `formatRelativeActivityTime`;
- barrels deixaram de exportar módulos obsoletos;
- nenhum componente base genérico ou abstração sem consumidor foi criado.

### Duplicidades eliminadas

- sanitização de `seconds_since_last_activity` em `PeopleCard` duplicava a proteção de `formatRelativeActivityTime`;
- representação de tempo em décimos de hora no gráfico exigia multiplicação/divisão desnecessárias;
- módulos antigos de relatório local duplicavam uma responsabilidade que hoje deve ser atendida pelo contrato oficial de relatório;
- hooks/componentes de compatibilidade permaneciam ao lado do fluxo atual sem consumidor.

### Testes adicionados/ajustados

- `api.test.js`: degradação parcial, payload opcional inválido, dia histórico indisponível e redução de 9 para 3 chamadas com histórico reutilizado.
- `useDashboardData.test.js`: verifica passagem do cache histórico no refresh, além dos casos já existentes.
- `ActivityChart.test.jsx`: distingue indisponibilidade de zero real.
- `Header.test.jsx`: cobre estado `degraded`.
- `PeopleCard.test.jsx`: cobre status `ausente` e semântica da tabela.
- `MetricCard.test.jsx`: cobre ícone decorativo.
- `DashboardPage.test.jsx`: garante que falha de realtime não seja exibida como zero usuários online.
- `report.test.js` removido junto com o módulo morto.

Sidebar, useAutoRefresh, useTheme, useHashRoute e páginas administrativas foram
preservados nessa revisão por coesão; não houve dependência nova nem mudança no
backend. O Blazor ainda foi mantido por valor histórico. As mudanças evitaram
informação enganosa, reduziram carga de rede e removeram manutenção de código sem uso.
Os arquivos runtime afetados são os módulos citados acima, barrels,
`constants/ui.js`, `utils/dashboard.js` e `index.css`; guias foram alinhados a eles.

### Validação possível neste ambiente

O ambiente não possui acesso de rede ao npm/GitHub para instalar `node_modules`; portanto Vitest/Vite não puderam ser executados aqui. Os arquivos JavaScript/JSX alterados foram validados sintaticamente com o parser TypeScript disponível no ambiente. No checkout completo, a validação final deve ser:

```powershell
cd FrontEnd
npm ci
npm test
npm run build
```

O endurecimento posterior de DTOs, timeout, cache manual, filtros e skip link
está na [auditoria de 21/09](AUDITORIA.md#auditoria-21), com resultados próprios.

<a id="limpeza-21"></a>

## Limpeza de arquivos sem uso — 21/09/2026

Esta revisão é posterior à auditoria acima e se refere ao checkout do projeto.
Foram conferidos os imports e reexports de `src/`, a entrada `index.html`, os scripts
do `package.json`, as configurações de Vite, Vitest, PostCSS e Tailwind e as
referências textuais no repositório, incluindo arquivos ocultos e o legado.
Dependências instaladas, saídas de build e metadados do Git foram excluídos da
busca de consumidores no código e na documentação.

| Arquivo removido (relativo a `FrontEnd/`) | Evidência |
| --- | --- |
| `frontend-alignment-fix.patch` | As duas alterações `control items-center gap-2` já estão em `src/components/Header.jsx`. Nenhum script ou documento referencia o patch. |
| `README-APLICACAO.md` | Instruções avulsas de extração/sobreposição de um pacote já incorporado ao checkout, sem referências no repositório. Os comandos de instalação e validação continuam documentados em `README.md` e `docs/ARQUITETURA.md`. |
| `docs/screenshots/dashboard-dark.png` | Captura da interface anterior, inspecionada visualmente, sem referências em código, CSS, HTML, testes ou documentação. Fora das entradas e dos recursos públicos do Vite. |
| `docs/screenshots/dashboard-desktop.png` | Mesma verificação: captura antiga sem consumidores ou links no projeto. |
| `docs/screenshots/file.jpg` | Recorte da interface anterior, também inspecionado e sem consumidores ou links no projeto. |

Nenhum módulo de aplicação ou teste foi removido. Os barrels `components/index.js`
e `hooks/index.js` são consumidos pelo Dashboard. O protótipo `legacy/blazor/`
foi preservado porque `docs/INTEGRACAO.md` documenta sua execução para consulta visual.
Relatórios técnicos foram preservados como registros históricos; ausência de
imports não torna documentação, configurações ou testes descartáveis.
`COMO-APLICAR.txt` e `DELETE_FILES.txt`, citados nas abas do editor, já não existiam
no checkout antes desta limpeza.

Validação após as exclusões: `npm.cmd test` passou (18 arquivos, 57 testes),
`npm.cmd run build` concluiu com sucesso e `git diff --check` não apontou erros
de whitespace. Testes/build precisaram executar fora do sandbox após o esbuild
receber acesso negado ao procurar configuração nos diretórios superiores.

<a id="revisao-23"></a>

## Revisão de 23/09/2026 — tema, estados e lote HTTP

### Revisão de 23/09/2026 — ciclo de tema

- **Problema:** `useTheme` era iniciado apenas em DashboardPage; abrir outra rota
  diretamente não aplicava a preferência persistida.
- **Solução:** App mantém uma única instância do hook e fornece dark/toggleTheme
  ao painel. Removido o reexport sem consumidor em `hooks/index.js` após conferir
  referências, imports, rotas e configurações; o módulo useTheme foi preservado.
- **Arquivos:** App.jsx, pages/DashboardPage.jsx, hooks/index.js e testes de App/painel.
- **Motivo:** preferência do documento pertence ao ciclo de vida da aplicação.
- **Impacto:** todas as rotas restauram tema; botão existente continua no Header.
- **Risco:** baixo, sem nova persistência; testes de entrada direta em três rotas.

### Revisão de 23/09/2026 — estados de dados

- **Problema:** tabela/gráfico sem dados exibiam texto de resultado vazio durante
  carregamento/falha; refresh mal sucedido mantinha dados sem explicá-lo no alerta.
- **Solução:** props loading/unavailable nos dois cards, fornecidas pelo painel;
  alerta identifica dados da última consulta concluída. Detalhe do indicador online
  agora diz “status informado pela API”, pois não comprova conexão autenticada.
- **Arquivos:** DashboardPage, PeopleCard, ActivityChart e respectivos testes.
- **Motivo:** separar ausência confirmada de registros, consulta e indisponibilidade.
- **Impacto:** dados/contratos e retenção durante refresh preservados.
- **Risco:** baixo; regressões cobrem estados e transmissão das props.

### Revisão de 23/09/2026 — encerramento do lote HTTP

- **Problema:** Promise.all rejeitava o resumo obrigatório, mas requisições irmãs
  continuavam até timeout. Cancelamento com motivo customizado gerava warnings
  como se fontes opcionais tivessem falhado.
- **Solução:** controller do lote vinculado ao signal externo, abort/cleanup em
  finally e reconhecimento de signal.aborted nas consultas opcionais.
- **Arquivos:** services/api.js e api.test.js.
- **Motivo:** liberar trabalho sem consumidor e preservar motivo de cancelamento.
- **Impacto:** mesmas queries, payloads e fallback de falhas opcionais; elimina
  requests pendentes ao falhar a consulta obrigatória.
- **Risco:** médio por envolver concorrência. Testes verificam nove requests,
  cancelamento dos pendentes, timers zerados e ausência de warnings de cancelamento.

Nessa revisão foram documentados fluxo e problemas externos; corrigidas referências
a PWA implementada, classe pill removida e localização do backend. Sem upgrades ou
novas bibliotecas. A [auditoria de 23/09](AUDITORIA.md#auditoria-23) reúne validações.

<a id="limpeza-legado"></a>

## Limpeza posterior à auditoria — código sem uso

- Removida a pasta `legacy/blazor` por solicitação do usuário: nove arquivos
  versionados (Razor, C#, csproj, CSS e JS) e artefatos locais bin/obj.
- Conferidos entrada HTML, imports/reexports, rotas, scripts npm, Vite, Vitest,
  Tailwind e referências no repositório. Nenhum consumidor ativo do legado.
- Removidos seis reexports sem consumidores de `components/index.js`: Card,
  EmptyState, IntegrationNotice, PageHeader, SectionHeading e Sidebar. Os
  componentes continuam usados por imports diretos e foram preservados.
- Removidas opções Tailwind sem referências: font-mono/Fira Code, fade-in e
  seus keyframes, shadow-soft e shadow-medium. Estilos usados foram mantidos.
- Os 30 módulos de aplicação em src continuam alcançáveis pela entrada React.
  Testes, documentação e telas com integração pendente continuam necessários.
- README, arquitetura e guia do backend atualizados. As decisões abaixo sobre
  preservação do legado descrevem o estado anterior a esta limpeza.

Benefício: elimina um projeto independente sem uso e declarações mortas, sem
alterar funcionalidades. Risco limitado à resolução de imports/configuração,
verificado por testes e build. O legado pode ser recuperado pelo histórico Git.

Validação da limpeza: 82 testes aprovados em 19 arquivos, build Vite concluído
e `git diff --check` sem erros. Nenhuma alteração fora de `FrontEnd/`.

O protótipo usava Blazor/C# .NET 10 e dados visuais estáticos; nunca forneceu
endpoints ao React. A aplicação atual não depende de .NET.

<a id="melhorias-23"></a>

## Melhorias de 23/09/2026 — ErrorBoundary e carregamento por página

### Alterações implementadas

#### Error Boundary global

Foi criado `src/components/ErrorBoundary.jsx` e a aplicação passou a ser envolvida por essa barreira em `src/main.jsx`.

Objetivo:

- impedir tela branca quando um componente lança uma exceção inesperada durante a renderização;
- apresentar uma mensagem segura e uma ação para recarregar a aplicação;
- não expor a mensagem interna da exceção ao usuário;
- manter erros de API sob responsabilidade dos estados já existentes nos hooks e páginas.

Também foi adicionado `ErrorBoundary.test.jsx` para proteger esse comportamento.

#### Lazy loading por página

As páginas passaram a utilizar `React.lazy` e `Suspense` em `src/App.jsx`.

Rotas contempladas:

- Painel;
- Colaboradores;
- Tasks;
- Relatórios;
- Configurações;
- Login/Cadastro.

Benefícios:

- separação das páginas em chunks pelo Vite;
- evita carregar antecipadamente telas que o usuário ainda não abriu;
- reduz o trabalho inicial principalmente em acessos diretos a login, cadastro ou páginas secundárias;
- mantém o hash routing existente, sem adicionar React Router ou alterar a arquitetura de navegação.

Foi incluído um estado de carregamento acessível com `role="status"`, `aria-live` e `aria-busy`.

#### Testes ajustados

`src/App.test.jsx` foi atualizado para considerar o carregamento assíncrono das páginas e recebeu cobertura do fallback de rota.

### Itens de FrontEnd deliberadamente não incluídos

#### ESLint

Não foi acrescentado neste pacote porque exigiria novas dependências e atualização correta do `package-lock.json`. O pacote foi preparado sem introduzir uma alteração que pudesse fazer `npm ci` falhar. Recomenda-se adicioná-lo em uma tarefa específica quando o ambiente puder instalar as dependências e regenerar o lockfile.

#### GitHub Actions

Um workflow funcional precisa residir em `.github/workflows/` na raiz do repositório. Como o escopo de escrita desta entrega é exclusivamente `FrontEnd/`, nenhum workflow foi criado em local incorreto apenas para aparentar CI.

#### Playwright / E2E

Não foi adicionado porque implicaria novas dependências, atualização do lockfile e instalação de browsers. Os testes existentes em Vitest foram preservados e ampliados.

#### TypeScript

Não foi realizada migração porque seria uma mudança transversal de alto volume sem necessidade imediata. O projeto atual está funcional em JavaScript/JSX e essa migração deve ser planejada separadamente.

Arquivos: `App.jsx`, `App.test.jsx`, `main.jsx`, `components/ErrorBoundary.jsx`
e `components/ErrorBoundary.test.jsx`, além do registro documental desta entrega.
A validação recomendada era ci, testes, cobertura e build, seguida de acesso
direto a login/tasks/relatórios/configurações, navegação pelo menu, tema após
carregamento, foco do skip link e confirmação dos chunks de página.

<a id="revisao-25"></a>

## Revisões de 25/09/2026 — navegação e qualidade

| Local | Problema | Alteração e motivo | Benefício |
| --- | --- | --- | --- |
| src/components/Sidebar.jsx | Links fechavam o drawer removendo o elemento focado sem devolver o foco | Links, logo e ações de sessão reutilizam closeMobile; retorno síncrono ao botão somente quando o menu está aberto | Evita perda de foco no menu e elimina callbacks repetidos de fechamento; navegação desktop não move foco para botão oculto |
| src/components/Sidebar.jsx | Fundo permanecia rolável enquanto o diálogo mobile estava aberto | Efeito guarda overflow anterior do body, bloqueia rolagem e restaura no cleanup | Mantém a interação no menu e restaura a página ao fechar, mudar para desktop ou desmontar |
| src/components/Sidebar.test.jsx | Faltavam regressões para navegação e ciclo da rolagem | Dois casos verificam foco após link, destino preservado, fechamento e desmontagem | Protege os comportamentos corrigidos sem testes artificiais de estrutura |

A revisão completa posterior corrigiu fechamento pelo histórico e recuperação de
foco externo no drawer, restringiu logs do ErrorBoundary a desenvolvimento,
melhorou contraste e atualizou ferramentas. Evidências, arquivos, versões,
resultados e limites estão na [auditoria de 25/09](AUDITORIA.md#auditoria-25).
