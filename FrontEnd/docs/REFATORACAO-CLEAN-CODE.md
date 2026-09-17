# Revisão técnica e refatoração Clean Code — Frontend

**Escopo:** somente `FrontEnd/`  
**Base:** frontend após as entregas de adequação aos requisitos e auditoria documental.  
**Objetivo:** melhorar legibilidade, separação de responsabilidades, testabilidade e manutenção sem alterar contratos de API ou funcionalidades do produto.

## Matriz rastreável

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
| `FrontEnd/docs/REFATORACAO-CLEAN-CODE.md` | documentação | A refatoração precisava ser rastreável por arquivo/função | Criado este registro técnico | Atender à exigência de transparência e facilitar manutenção em equipe | Nenhum impacto de runtime | Revisão manual |
| `FrontEnd/docs/ARQUITETURA.md` | arquitetura | Não descrevia a separação do auto-refresh | Atualizada a responsabilidade dos hooks e fluxo de dados | Manter documentação coerente com o código | Facilita onboarding/manutenção | Comparação documentação ↔ implementação |
| `FrontEnd/docs/HOOKS.md` | hooks | `useDashboardData` ainda concentrava, na descrição, agendamento e consulta | Documentado `useAutoRefresh` e a nova divisão de responsabilidades | Evitar documentação desatualizada | Nenhum impacto de runtime | Comparação com os hooks atuais |
| `FrontEnd/docs/TESTES.md` | testes | Não listava o novo hook nem os novos casos do serviço/utilitários | Atualizada cobertura relevante | Manter rastreabilidade dos testes | Nenhum impacto de runtime | Comparação com arquivos `.test.*` entregues |
| `FrontEnd/docs/REFACTORING.md` | histórico | Não registrava esta revisão técnica | Adicionado resumo das decisões e itens preservados | Manter histórico técnico | Nenhum impacto de runtime | Revisão manual |
| `FrontEnd/docs/IMPLEMENTACAO-REQUISITOS-FRONTEND.md` | histórico consolidado | Faltava registrar a refatoração após a entrega funcional | Adicionada seção de revisão técnica e validação | Manter uma linha do tempo única das alterações de frontend | Nenhum impacto de runtime | Revisão manual |

## Decisões de refatoração

### 1. `useDashboardData` continua sendo o orquestrador de dados

Não foi criada uma camada nova de gerenciamento de estado. O hook já é adequado para o escopo atual. A única responsabilidade claramente diferente era o agendamento periódico/Visibility API, que foi isolado em `useAutoRefresh`.

### 2. O cliente HTTP continua em um único serviço

Não foram criados vários arquivos de API ou uma arquitetura de repositories. O projeto ainda possui poucos contratos ativos, então dividir `api.js` em múltiplas camadas aumentaria complexidade sem benefício atual.

Os helpers criados são internos ao serviço e existem apenas para eliminar repetição e explicitar responsabilidades.

### 3. Transformações do Dashboard foram movidas para utilitários existentes

Filtro de colaboradores, contagem por status e formatação da data são funções puras. Elas saíram de `DashboardPage` porque não dependem de React e podem ser testadas isoladamente.

### 4. Componentes simples foram preservados

`Card`, `MetricCard`, `PageHeader`, `SectionHeading`, `EmptyState`, `IntegrationNotice`, `AuthPage`, `ReportsPage`, `SettingsPage`, `TasksPage`, `CollaboratorsPage`, `Header`, `TimelineCard` e `ReportsAndAgent` foram revisados e não receberam refatorações estruturais desnecessárias. Eles já possuem responsabilidade suficientemente clara para o estágio atual.

## Código legado/candidatos a remoção preservados

Os seguintes arquivos possuem uso reduzido ou histórico, mas **não foram removidos nesta entrega**:

- `src/hooks/useActiveSection.js` — documentado como compatibilidade/histórico;
- `src/hooks/useDashboard.js` — barrel de retrocompatibilidade;
- `src/components/CategoryChart.jsx` — placeholder legado já fora do fluxo principal;
- `src/components/AppsCard.jsx` — não renderizado hoje, mas compatível com a futura classificação dentro/fora do escopo exigida por RF-27;
- `src/utils/report.js` e `report.test.js` — utilitários antigos de exportação local não são usados pelo fluxo atual, porém a remoção foi adiada para não introduzir quebra de compatibilidade sem uma decisão explícita do time.

Manter esses arquivos não altera o fluxo atual. A remoção pode ser feita em uma tarefa específica quando a equipe confirmar que não existem consumidores externos/branches dependentes.

## Problemas fora do escopo do frontend

Nenhum código externo foi alterado. Permanecem dependências já conhecidas para autenticação, associação, tasks, jornada/inatividade, Dashboard RF-27 completo e relatórios/exportações. Essas integrações exigem contratos do backend e continuam documentadas em `INTEGRACAO-FRONTEND-BACKEND.md`.

## Validação desta refatoração

### Executada neste ambiente

- `node --check` nos arquivos JavaScript alterados: OK;
- parse dos arquivos JSX alterados usando o parser TypeScript disponível no ambiente: OK;
- checagem de imports relativos dos arquivos entregues contra a estrutura do projeto: OK;
- busca estática por arquivos fora de `FrontEnd/` no pacote final: nenhum encontrado;
- revisão de equivalência dos contratos públicos de `fetchDashboardData`, `getReportUrl`, `useDashboardData`, `ActivityChart` e `PeopleCard`.

### Não disponível neste ambiente

O `package.json` do projeto não define script de lint, portanto não existe comando oficial `npm run lint` a executar sem adicionar ferramenta/dependência fora do objetivo desta refatoração.

O ambiente de execução desta análise não possui `node_modules`, logo a suíte Vitest e o build Vite completos devem ser executados no checkout local:

```powershell
cd FrontEnd
npm.cmd ci
npm.cmd test
npm.cmd run build
```

Não foi adicionada uma ferramenta de lint apenas para satisfazer a validação, pois isso seria mudança de dependência sem requisito técnico do projeto.
