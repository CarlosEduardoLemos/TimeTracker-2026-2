# Melhorias do frontend — 25/09/2026

## Escopo

Esta revisão alterou somente `FrontEnd/`. `backend/` e `requisitos/` foram consultados; nenhuma alteração foi feita neles. Dependências externas e verificações que exigem serviços ausentes estão em [Pendências](PENDENCIAS.md).

## Alterações funcionais e técnicas

| Arquivos | Motivo e implementação |
| --- | --- |
| `package.json`, `package-lock.json`, `eslint.config.js` | Instalados ESLint, `@eslint/js`, plugins React, Hooks e JSX a11y, `globals`, Prettier, Playwright e axe-core; criados `lint`, `format`, `format:check`, `test:e2e` e `test:e2e:real`. ESLint usa configuração plana. PropTypes, regra de estado em efeito e foco em contêiner não interativo foram ajustados às escolhas atuais do projeto, mantendo as demais regras recomendadas. |
| `.prettierrc.json`, `.prettierignore` | Definido estilo consistente de código. Documentação e artefatos gerados ficam fora da formatação automática. |
| `.gitignore` | Ignorados relatório e resultados do Playwright. |
| `vite.config.js`, `vitest.config.js`, `package.json` | Vite usa `--configLoader runner` nos scripts para funcionar no Windows deste ambiente. Vitest inclui somente arquivos `src/**/*.test.{js,jsx}`, evitando recolher suites Playwright. |
| `playwright.config.js`, `e2e/run.mjs` | Playwright usa Chrome/Chromium; o executor constrói o frontend, inicia o preview em `127.0.0.1:5173`, espera a porta, executa o navegador e encerra o servidor. E2E simulado fixa a origem da API em `localhost:8000`; com `RUN_REAL_API=1`, respeita `VITE_API_URL`. `PLAYWRIGHT_CHANNEL=chrome` permite o Chrome local. |
| `e2e/app.spec.js` | Testes de painel, filtros, navegação/404, erros 503 e de rede, retry, GET/PUT de configurações, downloads CSV/PDF, tema, menu móvel, larguras 375/390/768/1366/1920 px, outras telas em 390 px e ampliação CSS de 200%. A API é simulada na camada HTTP do navegador; os fluxos de download e layout usam Chrome real. |
| `e2e/accessibility.spec.js` | axe-core verifica regras WCAG detectáveis em Painel, Colaboradores, Relatórios, Configurações e menu móvel no tema escuro. O teste também verifica foco inicial do diálogo. |
| `e2e/real-api.spec.js` | Teste opt-in sem mocks, para leitura do painel e configurações com FastAPI real. Exige `RUN_REAL_API=1`, backend e banco em execução. Não grava configurações nem cria dados. |
| `src/services/api.js`, `src/services/api.test.js` | Introduzido `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. Erros HTTP leem `detail` do FastAPI; timeout, cancelamento, rede, 4xx, 5xx e resposta inválida são diferenciados. Mantidos timeout durante leitura, validação de data e formato de exportação. Testes cobrem essas diferenças. |
| `src/utils/requestFailure.js`, `src/hooks/useDashboardData.js`, `src/hooks/useDashboardData.test.js`, `src/pages/CollaboratorsPage.jsx` | Falhas parciais do painel e de Colaboradores passam a informar a fonte e o motivo, sem trocar lista vazia válida por erro nem perder dados ainda disponíveis. O helper reduz duplicação dos dois fluxos paralelos. |
| `src/pages/ReportsPage.jsx` | Falha na lista de usuários agora mostra motivo e botão de retry; exportação geral continua disponível. A consulta anterior é cancelada antes de nova tentativa. |
| `src/pages/DashboardPage.jsx` | `min-w-0` no cartão da tabela mantém a rolagem dentro dele em 375/390 px, eliminando rolagem horizontal da página. |
| `src/index.css` | Texto secundário mais escuro no tema claro e links com contraste maior no tema escuro; violações de contraste encontradas pelo axe-core foram eliminadas nos cenários cobertos. |
| `src/components/Sidebar.jsx` | Mantido fechamento por navegação/histórico; removido efeito redundante dependente de rota e marcado o fundo clicável do diálogo como apresentação para a regra JSX a11y. |
| `README.md`, `docs/ARQUITETURA.md`, `docs/FUNCIONALIDADES.md`, `docs/TESTES.md`, `docs/AUDITORIA.md`, `docs/PENDENCIAS.md`, este arquivo | Atualizados comandos, contratos de erro, resultados, limitações, pendências externas e decisões. Removida menção incorreta a ranking como recurso necessário. |

## Formatação de código

Prettier foi aplicado uma vez ao código existente para que `format:check` passe desde esta revisão. Além dos arquivos funcionais acima, foram modificados **somente na apresentação do código**:

- Raiz: `index.html`, `postcss.config.js`, `tailwind.config.js`, `vite.config.js`.
- Entrada e apoio: `src/App.jsx`, `src/App.test.jsx`, `src/main.jsx`, `src/constants/ui.js`, `src/test/setup.js`.
- Componentes e testes: `src/components/ActivityChart`, `Card`, `EmptyState`, `ErrorBoundary`, `Header`, `IntegrationNotice`, `MetricCard`, `PageHeader`, `PeopleCard`, `ReportsAndAgent`, `SectionHeading`, `Sidebar`, `TimelineCard` (arquivos `.jsx` e respectivos `.test.jsx` existentes). A mudança funcional de `Sidebar.jsx` está descrita acima.
- Hooks e testes: `src/hooks/useAutoRefresh`, `useHashRoute`, `useTheme` (arquivos `.js` e respectivos `.test.js`); `useDashboardData` também foi formatado, com mudança funcional descrita acima.
- Páginas e testes: `src/pages/AuthPage`, `DashboardPage`, `ReportsPage`, `TasksPage`, `CollaboratorsPage`, `SettingsPage` (arquivos `.jsx` e respectivos `.test.jsx` existentes), mais `src/test/frontendRevision.test.jsx`. As mudanças funcionais estão na tabela anterior.
- Serviço e utilitários: `src/services/api.js`, `src/services/api.test.js`, `src/utils/dashboard.js`, `src/utils/dashboard.test.js`; a alteração funcional do serviço está descrita acima.

Esta passagem de formatação amplia o diff, mas deixa os scripts de verificação utilizáveis para novas alterações.

## Verificação e limites

| Verificação | Resultado |
| --- | --- |
| `npm.cmd run lint` | Passou |
| `npm.cmd run format:check` | Passou |
| `npm.cmd test` | 88 testes passaram em 21 arquivos |
| `npm.cmd run build` | Passou |
| `npm.cmd run test:e2e` com `PLAYWRIGHT_CHANNEL=chrome` | 20 cenários passaram; 1 teste de backend real foi ignorado sem `RUN_REAL_API` |

O endereço `http://localhost:8000/config/` não respondeu durante esta revisão. Por isso o teste sem mocks não foi executado; os E2E regulares interceptam respostas HTTP, e não comprovam CORS ou conteúdo do FastAPI. A ampliação de 200% usa CSS no Chrome e não equivale a zoom nativo. axe-core não substitui leitor de tela ou inspeção humana. Os componentes preservados fora da árvore ativa não foram removidos; a decisão permanece em [Pendências](PENDENCIAS.md).
