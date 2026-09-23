# Guia de testes automatizados — TimeTrack Frontend

## Ferramentas

- Vitest 3.2.x
- React Testing Library 16.x
- jest-dom 6.x
- jsdom 26.x
- coverage-v8

A cobertura inclui somente `src/**/*.{js,jsx}`. Build, configurações e protótipo
Blazor não são contabilizados como código da aplicação React.

## Execução

```powershell
cd FrontEnd
npm.cmd test
npm.cmd run test:watch
npm.cmd run test:coverage
npm.cmd run build
```

## Cobertura relevante

### Componentes

- `Card.test.jsx`
- `Header.test.jsx`: inclui estado parcial/degradado e preservação do filtro sem lista de usuários.
- `MetricCard.test.jsx`: inclui semântica do ícone decorativo.
- `PeopleCard.test.jsx`: inclui status `ausente` e semântica da tabela.
- `ActivityChart.test.jsx`: diferencia dia indisponível de zero real.
- `ReportsAndAgent.test.jsx`
- `SectionHeading.test.jsx`
- `Sidebar.test.jsx`: teclado, Escape e fechamento ao atingir o breakpoint desktop.

### Hooks

- `useTheme.test.js`
- `useHashRoute.test.js`
- `useAutoRefresh.test.js`
- `useDashboardData.test.js`: loading, refresh, erro, resposta obsoleta, cache no polling e invalidação manual.

### Páginas

- `App.test.jsx`: link de salto preserva a rota e move o foco ao conteúdo.

- `DashboardPage.test.jsx`: garante que falha do realtime não seja exibida como zero usuários online.
- `AuthPage.test.jsx`
- `TasksPage.test.jsx`
- `ReportsPage.test.jsx`

### Serviços/utilitários

- `api.test.js`: datas, degradação parcial, contratos inválidos, timeout inclusive no corpo, cancelamento, erro HTTP e histórico reutilizado.
- `dashboard.test.js`: formatação, totais, filtros e contagem por status.

Os testes de `utils/report.js` foram removidos junto com o módulo, que não possuía consumidores no fluxo atual.

## Execução em 23/09/2026

- Baseline: `npm.cmd test`, 19 arquivos e 70 testes aprovados.
- Após mudanças: `npm.cmd run test:coverage`, 19 arquivos e 82 testes aprovados.
- Cobertura V8 de src: linhas/statements 92,46%; branches 91,77%; funções 82,89%.
- `npm.cmd run build`: aprovado, 866 módulos transformados.
- Análise AST dos 50 módulos JS/JSX: imports resolvidos e nenhum import não usado.
- Não há scripts lint/typecheck; não foram tratados como checks aprovados.

Novas regressões: tema salvo em entrada direta nas rotas, cards em loading/falha,
propagação desses estados pelo painel, aviso de dados retidos após falha de refresh,
cancelamento do lote e cancelamento com motivo customizado. Os mocks existentes
de Recharts e rede continuam limitando o alcance: isto não valida layout real ou
backend/banco. A cobertura geral não implica cobertura completa de TimelineCard,
CollaboratorsPage ou bootstrap de main.jsx.

Ambiente: Node 24.18.0, npm 11.16.0. O primeiro teste no sandbox falhou porque
esbuild não podia ler diretórios superiores ao carregar configuração. Testes e
build passaram com a execução autorizada fora do sandbox, sem alterar configuração.

### Integração real pendente

Quando os contratos backend estiverem disponíveis, adicionar testes de integração/E2E para login, autorização, associação, CRUD de tasks, jornada, filtros completos do RF-27 e exportação real.
