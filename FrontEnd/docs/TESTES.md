# Guia de testes automatizados — TimeTrack Frontend

## Validação desta revisão

Em 25/09/2026, `npm.cmd test` passou com **80 testes em 21 arquivos**;
`npm.cmd run build` também passou. A suíte foi alinhada ao código atual e
inclui falha parcial da API, resposta obsoleta, timeout durante leitura do
corpo, exportação com erro HTTP, navegação por teclado e formulários bloqueados
por contratos de backend ainda ausentes. O script de teste usa
`--configLoader runner` para funcionar neste ambiente Windows.

[Voltar ao README](../README.md).

## Ferramentas

- Vitest 4.1.11
- React Testing Library 16.x
- jest-dom 6.x
- jsdom 26.x
- @vitest/coverage-v8 4.1.11

A cobertura inclui somente `src/**/*.{js,jsx}`, excluindo `src/test/`.
Build e configurações não são contabilizados como código da aplicação React.

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
- `Sidebar.test.jsx`: teclado, Escape, breakpoint desktop, foco após navegação e restauração da rolagem ao fechar/desmontar.
- `ErrorBoundary.test.jsx`: fallback seguro e ação de recarregar após falha de renderização.

### Hooks

- `useTheme.test.js`
- `useHashRoute.test.js`
- `useAutoRefresh.test.js`
- `useDashboardData.test.js`: carregamento, atualização manual e falha parcial.

### Páginas

- `App.test.jsx`: link de salto preserva a rota e move o foco ao conteúdo.

- `DashboardPage.test.jsx`: garante que falha do realtime não seja exibida como zero usuários online.
- `frontendRevision.test.jsx`: falha parcial, resposta antiga, resumo inválido,
  configuração indisponível e erro de exportação.
- `AuthPage.test.jsx`
- `TasksPage.test.jsx`
- `ReportsPage.test.jsx`

### Serviços/utilitários

- `api.test.js`: filtros codificados, timeout inclusive no corpo, cancelamento,
  erro HTTP e formatos de exportação.
- `dashboard.test.js`: formatação, totais, filtros e contagem por status.

Os testes de `utils/report.js` foram removidos junto com o módulo, que não possuía consumidores no fluxo atual.

## Resultados e limites da validação

Execuções históricas ficam em [Auditoria](AUDITORIA.md), com datas e ambientes.
A revisão histórica anterior registrou 89 testes em 20 arquivos. A suíte desta
revisão foi ajustada aos contratos e componentes atualmente usados, com o
resultado novo indicado acima.

As regressões de 23/09 cobriram tema salvo em entrada direta, loading/falha nos
cards e propagação pelo painel, retenção de dados após refresh e cancelamento
do lote, inclusive motivo customizado. Recharts/rede são mockados: testes jsdom
não validam layout, servidor/banco, contraste completo ou leitor de tela.
Na última cobertura registrada, TimelineCard/CollaboratorsPage não tinham
execução direta e SettingsPage tinha cobertura parcial; bootstrap também não
deve ser considerado integralmente coberto a partir do percentual geral.

Não existem scripts de lint/typecheck; build e testes não os substituem.
O ambiente registrado era Node 24.18.0/npm 11.16.0. Bloqueios do esbuild no
sandbox e limites de cada execução estão descritos junto aos resultados históricos.

## Validação manual e integração real pendentes

Revisar temas claro/escuro, mobile/tablet/desktop, telas baixas, alto zoom,
teclado/foco/leitor de tela, contraste, gráfico e falhas de rede em navegador.
Testar navegação direta e pelo histórico, skip link, carregamento lazy e
restauração de rolagem do drawer.

Quando os contratos backend estiverem disponíveis, adicionar integração/E2E
para login, autorização, associação, CRUD de tasks, jornada, filtros completos
do RF-27 e exportação real. As dependências estão em [Integração](INTEGRACAO.md).
