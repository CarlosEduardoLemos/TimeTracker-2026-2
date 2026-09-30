# Alterações do frontend

Changelog por data, em ordem da mais recente para a mais antiga. As entradas de 25 e 26/09/2026 preservam os caminhos usados na época. Consulte [Arquitetura](ARQUITETURA.md) para os caminhos atuais e [Testes](TESTES.md) para os resultados automatizados mais recentes; os números de execuções intermediárias não são reproduzidos aqui.

## 30/09/2026

### Compatibilidade com o realtime atualizado

- `validRealtime` e o contrato JSDoc agora aceitam `offline`; o validator continua rejeitando estados desconhecidos. Testes de API, Dashboard, Colaboradores e E2E cobrem o novo estado.
- `deriveTeam` preserva `offline` retornado pelo backend e usa `no-data` quando o usuário não aparece no realtime. A interface mostra “Offline (API)” e “Sem dados” como situações distintas.
- O Dashboard explica os estados como valores calculados pela API, sem tratar `offline` como falha de conexão do Agent. A tabela formata a última leitura em segundos, minutos e horas.
- `PENDENCIAS.md` registra o consumo periódico de `/config/` pelo Agent, mantém B-04 como parcialmente normalizada com trabalho pendente no backend, mantém I-05 bloqueada e deixa I-08 pendente do ambiente real.
- Arquitetura, funcionalidades e roteiros de teste documentam os estados `online`/`ausente`/`offline`, retenção de até 24 horas e ausência de heartbeat autenticado.
- Os detalhes do Dashboard e de Colaboradores não atribuem limites fixos ou desconexão ao estado `offline`; B-10 registra a classificação de inatividade como pendência do backend.

## 28/09/2026

### Garantias automatizadas adicionais

- ESLint passou a impedir imports e reexports relativos que violam as camadas `app`, `features` e `shared`, inclusive imports dinâmicos literais; a regra tem testes próprios.
- Colaboradores e leitura de usuários dos Relatórios agora combinam cancelamento com identificador de sequência. Testes simulam respostas tardias que ignoram `AbortSignal`.
- `PageHeader` e `IntegrationNotice` ganharam testes diretos de conteúdo e ações, sem verificar classes de estilo.
- JSDoc documenta contratos consumidos da API em `shared/api/contracts.js`. `npm run typecheck` usa TypeScript com `checkJs` nessa camada e integra o script `check`.
- Vitest exige cobertura agregada maior para API, biblioteca compartilhada e hooks de Painel/Relatórios. O E2E opt-in com FastAPI real também verifica status, MIME e bytes básicos de CSV/PDF.
- O teste E2E de saída de Configurações passou a aguardar a aceitação ou recusa do diálogo antes de concluir a interação, eliminando uma corrida do Playwright.

### Adicionado

- Os scripts `check` e `check:full` reúnem lint, formatação, cobertura, build e, no segundo caso, Playwright. O Vitest passou a exigir cobertura global mínima de 85% para statements, functions e lines e 80% para branches.
- Testes diretos para `useReportExport`, componentes de Relatórios, `routeLeaveGuard`, `activityStatus`, filtros, indicadores, mensagens de erro, validação de respostas e fluxos de Colaboradores. O E2E cobre larguras de 375/768/1366 px, foco entre rotas, MIME ausente e pausa do temporizador.
- Metadados e componentes das rotas em `src/app/routes.js`, com barreira de erro por página. Os estados de atividade receberam formatação compartilhada e badges.
- `TESTES.md` ganhou roteiros manuais reproduzíveis para saída de Configurações, falha parcial do Painel, exportação real e menu móvel, além de uma tabela de problemas comuns. `ARQUITETURA.md` reúne os motivos das principais decisões de rota, estado, contratos, validação e cancelamento.
- As referências a RF, RN, RNF e CA em `FUNCIONALIDADES.md`, `PENDENCIAS.md` e `AUDITORIA.md` agora apontam para as seções de origem em `requisitos/`; os demais guias identificam as fontes de sitemap, Dashboard e responsividade.

### Alterado

- Configurações indicam alterações pendentes, permitem restauração, evitam `PUT` sem mudanças e pedem confirmação ao sair com valores alterados, inclusive ao atualizar ou fechar a aba.
- `ReportsPage` foi dividido em filtros, estados, ações e `useReportExport`. O download inclui o usuário filtrado no nome; o toast de sucesso fecha após cinco segundos.
- O painel foi dividido em filtros, indicadores, atividade, categorias e avisos. Atividade e colaboradores usam cards em telas pequenas; barras de categoria decorativas não repetem valores para leitores de tela.
- Validação de respostas passou para `src/shared/api/validators.js`; mensagens de erro e feedback de requisição usam componentes e helper compartilhados. `AsyncFeedback.jsx` mantém os imports de hooks React no início do arquivo.
- `useAutoRefresh` e seu teste foram movidos para `src/features/dashboard/hooks/`; o painel usa o hook, pausa a atualização de 30 segundos quando a aba fica oculta e a retoma ao voltar. `useDashboardData` deixou de agendar atualizações em paralelo.
- Rotas comuns e de autenticação mantêm um `<main>` focalizável, e a troca de rota direciona o foco ao novo conteúdo. Tasks e acesso exibem estados informativos sem simular contratos ausentes.
- A API rejeita CSV/PDF com `Content-Type` ausente ou incorreto. Helpers existentes passaram a filtrar usuários e contar status no painel. Botões desabilitados mantêm contraste no tema claro e escuro.
- A auditoria passou a separar o registro de 25/09 dos guias atuais; este changelog foi agrupado por data. Pendências ganharam resumo, status e registro da divergência em [responsividade.md](../../requisitos/responsividade.md).
- `SettingsPage` compartilha a atualização dos campos com `setForm` funcional. Nomes locais no painel, em Configurações e na API ficaram mais explícitos; comentários curtos explicam o timeout e o foco do menu móvel.

### Removido

- `recharts` saiu de `package.json` e `package-lock.json` por não ter imports na aplicação.
- `src/legacy/` e seus testes isolados foram removidos após verificação de consumidores. Os helpers `formatDuration` e `formatDashboardReferenceDate` saíram do painel junto dos testes exclusivos.
- A prop `activeSection` saiu da `Sidebar`; o aplicativo e os testes usam `route`.

### Testes e validação

As rodadas de testes diretos, cobertura, lint, build, formatação e E2E estão registradas em [Testes](TESTES.md). O teste opt-in com API real exige `RUN_REAL_API` e ambiente disponível; a validação manual de leitor de tela e dispositivos reais continua em [Pendências](PENDENCIAS.md).

## 26/09/2026

### Revisão complementar

A revisão de 26/09 mantém os contratos e altera exclusivamente `FrontEnd`. O estado inicial estava limpo. Os resultados e inventário de 25/09 abaixo são históricos; os resultados mais recentes estão em [Testes](TESTES.md).

| Arquivos (relativos a FrontEnd)                                                                         | Melhoria e justificativa                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/services/api.js`, `src/services/api.test.js`                                                       | Não envia sinal já cancelado, descarta leitura após cancelamento, distingue timeout interno de motivo externo homônimo e confere MIME exato com parâmetros permitidos. Testes protegem esses limites.                                                                             |
| `src/utils/dashboard.js`, `src/utils/dashboard.test.js`                                                 | Compartilha validação real de data; valida campos de texto exibidos, identidades únicas e durações inteiras seguras. Rejeita realtime ambíguo/negativo sem inventar desempate ou normalizar dados defeituosos.                                                                    |
| `src/hooks/useDashboardData.js`, `src/hooks/useDashboardData.test.js`                                   | Exige que o usuário retornado corresponda ao filtro e limpa horário de atualização quando todas as fontes falham e os dados são removidos.                                                                                                                                        |
| `src/pages/DashboardPage.jsx`, `src/pages/DashboardPage.test.jsx`                                       | Mantém visível o usuário selecionado se a lista ficar indisponível; evita aparência de filtro geral enquanto a consulta permanece individual.                                                                                                                                     |
| `src/pages/ReportsPage.jsx`, `src/pages/ReportsPage.test.jsx`                                           | Bloqueio síncrono de envios duplicados, filtros desabilitados durante exportação, loading/vazio da lista, sucesso preciso de download iniciado, erros com contraste no tema escuro e limpeza de feedback ao alterar filtros. Preserva seleção ao perder a lista.                  |
| `src/pages/SettingsPage.jsx`, novo `src/pages/SettingsPage.test.jsx`                                    | Impede dois submits no mesmo evento antes do próximo render, libera bloqueio ao concluir, limpa erro ao editar e mantém fallback legível para rejeição sem objeto Error. Testa sucesso, falha e retry.                                                                            |
| `src/hooks/useTheme.js`, `src/hooks/useTheme.test.js`                                                   | Falha de leitura/escrita de localStorage deixa de interromper renderização e alternância do tema; permanece apenas preferência de apresentação em memória.                                                                                                                        |
| `src/components/Sidebar.jsx`                                                                            | Rolagem vertical em menus de pouca altura e contraste da marca no tema escuro, confirmado por falha real de axe-core.                                                                                                                                                             |
| `e2e/app.spec.js`, `e2e/accessibility.spec.js`                                                          | Confirma anúncio do download, acesso ao último link em orientação horizontal e contraste dos erros/retry de relatórios no tema escuro. Mantém os cenários existentes.                                                                                                             |
| `src/test/frontendRevision.test.jsx`                                                                    | Resposta simulada acompanha a data solicitada; remove dependência acidental do dia 25/09 sem afrouxar a validação de resposta divergente.                                                                                                                                         |
| `docs/PENDENCIAS.md`                                                                                    | Reorganiza todos os bloqueios em backend, integração e frontend futuro, com requisito, locais afetados, comportamento, impacto, alteração necessária, workaround, prioridade e motivo. Acrescenta captura futura/tempo negativo, exportação CSV/PDF e unicidade de configurações. |
| `docs/ARQUITETURA.md`, `docs/FUNCIONALIDADES.md`, `docs/TESTES.md`, `docs/AUDITORIA.md`, este documento | Atualiza ciclos, testes, limites, resultados e inventário das mudanças.                                                                                                                                                                                                           |
| `README.md`, `src/index.css` e formatação dos documentos acima                                          | Corrige falhas reais da checagem Prettier já presentes no checkout; sem alteração visual ou funcional no CSS. Nenhum arquivo foi excluído da checagem para fazê-la passar.                                                                                                        |

Não foram removidos componentes preservados pela auditoria anterior: não são importados pela aplicação ativa e vários possuem testes consumidores; não há economia de bundle ao excluí-los. Nenhum endpoint, campo, métrica, login ou task foi inventado. Mocks existem somente nos testes.

O healthcheck `GET http://localhost:8000/` não respondeu nesta revisão. Não foram iniciados backend, banco ou seeds. O E2E real permanece opt-in, e cancelamento de PUT no cliente não garante rollback de gravação processada pelo servidor.

### Refatoração da estrutura

Reorganizados 52 arquivos de código e testes por responsabilidade, preservando o comportamento e os contratos existentes:

| Destino         | Arquivos e responsabilidade                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/`      | `App`, `ErrorBoundary`, `layout/Sidebar`, hooks de rota e tema e `styles/index.css`                                                 |
| `src/features/` | Páginas de acesso, colaboradores, painel, relatórios, configurações e tasks; hook `useDashboardData` junto do painel                |
| `src/shared/`   | `api/api.js`, componentes `MetricCard`, `PageHeader`, `IntegrationNotice` e funções de `lib/` usadas por diferentes funcionalidades |
| `src/legacy/`   | Componentes, hook `useAutoRefresh` e constantes preservados fora da aplicação ativa, com seus testes                                |
| `src/testing/`  | Setup do Vitest e teste transversal `frontendRevision.test.jsx`                                                                     |

Atualizados imports relativos, imports dinâmicos das páginas, mocks e configuração de setup/cobertura do Vitest. Os testes específicos acompanham o código; os padrões recursivos de Vite, Tailwind e ESLint continuam abrangendo a nova árvore. README, arquitetura, inventário dos testes e pendências documentaram os novos locais à época. Não foram adicionadas dependências ou arquivos de reexportação. Consulte [Testes](TESTES.md) para a validação desta refatoração.

## 25/09/2026

### Escopo

Esta revisão alterou somente `FrontEnd/`. `backend/` e `requisitos/` foram consultados; nenhuma alteração foi feita neles. Dependências externas e verificações que exigem serviços ausentes estão em [Pendências](PENDENCIAS.md).

### Alterações funcionais e técnicas

| Arquivos                                                                                                                                 | Motivo e implementação                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`, `package-lock.json`, `eslint.config.js`                                                                                  | Instalados ESLint, `@eslint/js`, plugins React, Hooks e JSX a11y, `globals`, Prettier, Playwright e axe-core; criados `lint`, `format`, `format:check`, `test:e2e` e `test:e2e:real`. ESLint usa configuração plana. PropTypes, regra de estado em efeito e foco em contêiner não interativo foram ajustados às escolhas atuais do projeto, mantendo as demais regras recomendadas. |
| `.prettierrc.json`, `.prettierignore`                                                                                                    | Definido estilo consistente de código. Documentação e artefatos gerados ficam fora da formatação automática.                                                                                                                                                                                                                                                                        |
| `.gitignore`                                                                                                                             | Ignorados relatório e resultados do Playwright.                                                                                                                                                                                                                                                                                                                                     |
| `vite.config.js`, `vitest.config.js`, `package.json`                                                                                     | Vite usa `--configLoader runner` nos scripts para funcionar no Windows deste ambiente. Vitest inclui somente arquivos `src/**/*.test.{js,jsx}`, evitando recolher suites Playwright.                                                                                                                                                                                                |
| `playwright.config.js`, `e2e/run.mjs`                                                                                                    | Playwright usa Chrome/Chromium; o executor constrói o frontend, inicia o preview em `127.0.0.1:5173`, espera a porta, executa o navegador e encerra o servidor. E2E simulado fixa a origem da API em `localhost:8000`; com `RUN_REAL_API=1`, respeita `VITE_API_URL`. `PLAYWRIGHT_CHANNEL=chrome` permite o Chrome local.                                                           |
| `e2e/app.spec.js`                                                                                                                        | Testes de painel, filtros, navegação/404, erros 503 e de rede, retry, GET/PUT de configurações, downloads CSV/PDF, tema, menu móvel, larguras 375/390/768/1366/1920 px, outras telas em 390 px e ampliação CSS de 200%. A API é simulada na camada HTTP do navegador; os fluxos de download e layout usam Chrome real.                                                              |
| `e2e/accessibility.spec.js`                                                                                                              | axe-core verifica regras WCAG detectáveis em Painel, Colaboradores, Relatórios, Configurações e menu móvel no tema escuro. O teste também verifica foco inicial do diálogo.                                                                                                                                                                                                         |
| `e2e/real-api.spec.js`                                                                                                                   | Teste opt-in sem mocks, para leitura do painel e configurações com FastAPI real. Exige `RUN_REAL_API=1`, backend e banco em execução. Não grava configurações nem cria dados.                                                                                                                                                                                                       |
| `src/services/api.js`, `src/services/api.test.js`                                                                                        | Introduzido `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. Erros HTTP leem `detail` do FastAPI; timeout, cancelamento, rede, 4xx, 5xx e resposta inválida são diferenciados. Mantidos timeout durante leitura, validação de data e formato de exportação. Testes cobrem essas diferenças.                                                                       |
| `src/utils/requestFailure.js`, `src/hooks/useDashboardData.js`, `src/hooks/useDashboardData.test.js`, `src/pages/CollaboratorsPage.jsx`  | Falhas parciais do painel e de Colaboradores passam a informar a fonte e o motivo, sem trocar lista vazia válida por erro nem perder dados ainda disponíveis. O helper reduz duplicação dos dois fluxos paralelos.                                                                                                                                                                  |
| `src/pages/ReportsPage.jsx`                                                                                                              | Falha na lista de usuários agora mostra motivo e botão de retry; exportação geral continua disponível. A consulta anterior é cancelada antes de nova tentativa.                                                                                                                                                                                                                     |
| `src/pages/DashboardPage.jsx`                                                                                                            | `min-w-0` no cartão da tabela mantém a rolagem dentro dele em 375/390 px, eliminando rolagem horizontal da página.                                                                                                                                                                                                                                                                  |
| `src/index.css`                                                                                                                          | Texto secundário mais escuro no tema claro e links com contraste maior no tema escuro; violações de contraste encontradas pelo axe-core foram eliminadas nos cenários cobertos.                                                                                                                                                                                                     |
| `src/components/Sidebar.jsx`                                                                                                             | Mantido fechamento por navegação/histórico; removido efeito redundante dependente de rota e marcado o fundo clicável do diálogo como apresentação para a regra JSX a11y.                                                                                                                                                                                                            |
| `README.md`, `docs/ARQUITETURA.md`, `docs/FUNCIONALIDADES.md`, `docs/TESTES.md`, `docs/AUDITORIA.md`, `docs/PENDENCIAS.md`, este arquivo | Atualizados comandos, contratos de erro, resultados, limitações, pendências externas e decisões. Removida menção incorreta a ranking como recurso necessário.                                                                                                                                                                                                                       |

### Formatação de código

Prettier foi aplicado uma vez ao código existente para que `format:check` passe desde esta revisão. Além dos arquivos funcionais acima, foram modificados **somente na apresentação do código**:

- Raiz: `index.html`, `postcss.config.js`, `tailwind.config.js`, `vite.config.js`.
- Entrada e apoio: `src/App.jsx`, `src/App.test.jsx`, `src/main.jsx`, `src/constants/ui.js`, `src/test/setup.js`.
- Componentes e testes: `src/components/ActivityChart`, `Card`, `EmptyState`, `ErrorBoundary`, `Header`, `IntegrationNotice`, `MetricCard`, `PageHeader`, `PeopleCard`, `ReportsAndAgent`, `SectionHeading`, `Sidebar`, `TimelineCard` (arquivos `.jsx` e respectivos `.test.jsx` existentes). A mudança funcional de `Sidebar.jsx` está descrita acima.
- Hooks e testes: `src/hooks/useAutoRefresh`, `useHashRoute`, `useTheme` (arquivos `.js` e respectivos `.test.js`); `useDashboardData` também foi formatado, com mudança funcional descrita acima.
- Páginas e testes: `src/pages/AuthPage`, `DashboardPage`, `ReportsPage`, `TasksPage`, `CollaboratorsPage`, `SettingsPage` (arquivos `.jsx` e respectivos `.test.jsx` existentes), mais `src/test/frontendRevision.test.jsx`. As mudanças funcionais estão na tabela anterior.
- Serviço e utilitários: `src/services/api.js`, `src/services/api.test.js`, `src/utils/dashboard.js`, `src/utils/dashboard.test.js`; a alteração funcional do serviço está descrita acima.

Esta passagem de formatação amplia o diff, mas deixa os scripts de verificação utilizáveis para novas alterações.

### Verificação e limites

| Verificação                                            | Resultado                                                              |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `npm.cmd run lint`                                     | Passou                                                                 |
| `npm.cmd run format:check`                             | Passou                                                                 |
| `npm.cmd test`                                         | Passou na revisão histórica                                            |
| `npm.cmd run build`                                    | Passou                                                                 |
| `npm.cmd run test:e2e` com `PLAYWRIGHT_CHANNEL=chrome` | Passou; o teste de backend real opt-in foi ignorado sem `RUN_REAL_API` |

O endereço `http://localhost:8000/config/` não respondeu durante esta revisão. Por isso o teste sem mocks não foi executado; os E2E regulares interceptam respostas HTTP, e não comprovam CORS ou conteúdo do FastAPI. A ampliação de 200% usa CSS no Chrome e não equivale a zoom nativo. axe-core não substitui leitor de tela ou inspeção humana. Os componentes preservados fora da árvore ativa não foram removidos; a decisão permanece em [Pendências](PENDENCIAS.md).
