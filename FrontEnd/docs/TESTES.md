# Guia de testes automatizados — TimeTrack Frontend

## Ferramentas

- Vitest 3.2.x
- React Testing Library 16.x
- jest-dom 6.x
- jsdom 26.x
- coverage-v8

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
- `Header.test.jsx`: inclui estado parcial/degradado da API.
- `MetricCard.test.jsx`: inclui semântica do ícone decorativo.
- `PeopleCard.test.jsx`: inclui status `ausente` e semântica da tabela.
- `ActivityChart.test.jsx`: diferencia dia indisponível de zero real.
- `ReportsAndAgent.test.jsx`
- `SectionHeading.test.jsx`
- `Sidebar.test.jsx`

### Hooks

- `useTheme.test.js`
- `useHashRoute.test.js`
- `useAutoRefresh.test.js`
- `useDashboardData.test.js`: loading, refresh, erro, resposta obsoleta e reutilização do histórico.

### Páginas

- `DashboardPage.test.jsx`: garante que falha do realtime não seja exibida como zero usuários online.
- `AuthPage.test.jsx`
- `TasksPage.test.jsx`
- `ReportsPage.test.jsx`

### Serviços/utilitários

- `api.test.js`: datas, degradação parcial, histórico indisponível e redução de chamadas com histórico reutilizado.
- `dashboard.test.js`: formatação, totais, filtros e contagem por status.

Os testes de `utils/report.js` foram removidos junto com o módulo, que não possuía consumidores no fluxo atual.

## Pendências

Quando os contratos backend estiverem disponíveis, adicionar testes de integração/E2E para login, autorização, associação, CRUD de tasks, jornada, filtros completos do RF-27 e exportação real.
