# Testes e validação do frontend

Este guia distingue verificação automatizada, build e verificações manuais ainda pendentes. Os resultados abaixo foram confirmados em 28/09/2026; o inventário completo das alterações está em [Alterações](ALTERACOES.md).

## Preparação e comandos

Execute na pasta `FrontEnd` com as dependências do `package-lock.json` instaladas:

```powershell
cd FrontEnd
npm ci
npm.cmd run check
$env:PLAYWRIGHT_CHANNEL = 'chrome' # se usar Chrome instalado em vez do Chromium do Playwright
npm.cmd run check:full
```

`npm.cmd run check` executa lint, verificação de formatação, checagem estática dos contratos, testes com cobertura e build em sequência. `npm.cmd run check:full` acrescenta o E2E; `npm.cmd run test:e2e` executa somente o E2E. Para desenvolvimento, `npm.cmd run test:watch` mantém Vitest em observação. `npm.cmd run typecheck` usa `checkJs` no cliente e nos contratos da API, sem exigir tipagem de todas as telas JSX. `npm.cmd run test:coverage` gera cobertura V8 em texto e HTML e exige mínimos globais de 85% para statements, functions e lines, e 80% para branches. Os diretórios `shared/api`, `shared/lib`, `features/dashboard/hooks` e `features/reports/hooks` exigem, cada um, 90% para statements, functions e lines e 85% para branches; os arquivos críticos já existentes também têm esses limites individualmente. `npm.cmd run format` aplica Prettier ao código e Markdown; lockfile e artefatos gerados estão em `.prettierignore`. `git diff --check` verifica whitespace e `git status --short` confirma o escopo. `npm.cmd run dev` inicia Vite na porta 5173; os comandos do Vite usam `--configLoader runner` para compatibilidade com o Windows deste ambiente.

`vitest.config.js` usa `jsdom`, plugin React e `src/testing/setup.js` com `@testing-library/jest-dom`; só inclui `src/**/*.test.{js,jsx}`. A cobertura configura `src/**/*.{js,jsx}` e exclui `src/testing/**`. Playwright gera o build, sobe o preview, executa os testes no Chrome/Chromium e encerra o servidor. O executor fixa `VITE_API_URL=http://localhost:8000` nos E2E simulados; com `RUN_REAL_API=1`, respeita a origem configurada. Para instalar o Chromium gerenciado pelo Playwright, execute `npx playwright install chromium`; em máquina com Chrome instalado, defina `PLAYWRIGHT_CHANNEL=chrome`. `PLAYWRIGHT_CHANNEL` pode ser removida quando o Chromium gerenciado estiver disponível.

Para executar os testes com FastAPI real, inicie a API e o banco de dados separadamente, configure `VITE_API_URL` para a origem correta, defina `RUN_REAL_API=1` e rode `npm.cmd run test:e2e:real`. Os testes não enviam POST/PUT; GET /config/ pode inicializar configurações no servidor se ainda não existirem. Eles verificam painel, CORS observado no navegador, GET de configurações, erros de página e downloads CSV/PDF reais com status, MIME e assinatura/conteúdo básico. A comparação dos valores exportados com registros conhecidos continua manual.

## Problemas comuns

| Sintoma                                               | Verificação e ação                                                                                                                                                                                                |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| API não responde ou telas mostram dados indisponíveis | Confira `VITE_API_URL` em `.env` (padrão `http://localhost:8000`), inicie FastAPI e banco e reinicie o Vite após mudar `.env`. Confira a chamada com falha na aba Rede do navegador.                              |
| Erro de CORS no navegador                             | Confira se o backend permite a origem exata do frontend, incluindo protocolo e porta (`http://localhost:5173` no desenvolvimento; `http://127.0.0.1:5173` no preview dos E2E). A configuração é feita no backend. |
| Playwright não encontra o navegador                   | Execute `npx playwright install chromium`. Se usar Chrome já instalado, defina `$env:PLAYWRIGHT_CHANNEL = 'chrome'` antes do comando de teste.                                                                    |
| `test:e2e:real` aparece como ignorado                 | Inicie FastAPI e banco, configure `VITE_API_URL`, defina `$env:RUN_REAL_API = '1'` e execute `npm.cmd run test:e2e:real` novamente. Sem essa variável, o teste real é ignorado de propósito.                      |
| Preview E2E não inicia                                | Libere a porta `5173`: o executor usa `127.0.0.1:5173` com `--strictPort`.                                                                                                                                        |

Os E2E regulares interceptam as respostas HTTP; para conferir API e CORS reais, use o teste opt-in e os roteiros manuais abaixo.

## Resultado automatizado registrado

| Verificação                      | Resultado                                                                                                  | O que comprova                                                                |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `npm.cmd run check`              | **Concluído** em 28/09/2026                                                                                | Executa lint, formatação, typecheck, cobertura e build em sequência           |
| `npm.cmd run check:full`         | **Concluído** anteriormente em 28/09/2026                                                                  | Executa `check` e a suíte E2E no Chrome                                       |
| `npm.cmd run test:coverage`      | **136 testes em 38 arquivos passaram**; 95,6% statements, 93,78% branches, 95,95% functions e 97,47% lines | Cobertura V8 acima dos mínimos globais e dos limites críticos                 |
| `npm.cmd run typecheck`          | **Concluído**                                                                                              | JSDoc e `checkJs` na camada de contratos da API                               |
| `npm.cmd run lint`               | **Concluído**                                                                                              | Regras JS, React, Hooks, JSX a11y e fronteiras de camadas                     |
| `npm.cmd run format:check`       | **Concluído**                                                                                              | Código sob Prettier consistente                                               |
| `npm.cmd run test:e2e` no Chrome | **26 passaram; 2 testes reais ignorados sem `RUN_REAL_API`**                                               | Fluxos no navegador, seis larguras, ampliação CSS e análise WCAG automatizada |
| `npm.cmd run build`              | **Concluído** pelo Vite 6.4.3                                                                              | Imports, JSX, CSS e geração dos chunks das páginas                            |
| `git diff --check`               | **Sem erros**                                                                                              | Ausência de erros de whitespace no diff                                       |
| `git status --short`             | **Somente `FrontEnd/`**                                                                                    | Escopo das alterações registradas no Git                                      |

Build bem sucedido não comprova disponibilidade da API, layout em navegador ou ausência de erro no console durante uso real.

## Inventário dos testes existentes

Os caminhos abaixo refletem a estrutura atual. Os testes específicos continuam próximos do código testado.

| Arquivo(s)                                                                                                      | Comportamento protegido                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/App.test.jsx`                                                                                          | Entrada direta em rotas com tema salvo, fallback de carregamento, link de salto, foco após navegação, 404 e título                                  |
| `src/shared/api/api.test.js`                                                                                    | Codificação do usuário, erro HTTP, cancelamento externo, timeout na leitura, formatos de exportação, data inválida e MIME ausente ou incorreto      |
| `src/shared/api/validators.test.js`                                                                             | Contratos válidos e inválidos de usuários, realtime, resumo e configurações                                                                         |
| `src/shared/api/errorMessage.test.js`, `src/shared/lib/requestFailure.test.js`                                  | Mensagens seguras para erros, cancelamento, falha de contrato e rejeição por fonte                                                                  |
| `src/features/dashboard/hooks/useDashboardData.test.js`                                                         | Três fontes, horário de atualização, dados mantidos no refresh, falha parcial e data divergente                                                     |
| `src/app/hooks/useHashRoute.test.js`                                                                            | Hash desconhecido e reação a `hashchange`                                                                                                           |
| `src/app/hooks/useTheme.test.js`                                                                                | Preferência do sistema, preferência salva, alternância, classe/documento e `localStorage`                                                           |
| `src/features/dashboard/hooks/useAutoRefresh.test.js`                                                           | Intervalo, desativação, pausa na aba oculta e atualização ao retornar; usado pelo painel                                                            |
| `src/features/dashboard/pages/DashboardPage.test.jsx`                                                           | Loading, indicadores baseados na API, falha de realtime, filtro de usuário e contagem de cadastrados independente do realtime                       |
| `src/features/collaborators/pages/CollaboratorsPage.test.jsx`                                                   | Duas fontes de dados, cards e tabela, falhas parciais e totais, lista vazia, retry e cancelamento ao desmontar                                      |
| `src/features/dashboard/components/DashboardFilters.test.jsx`, `LastActivityTable.test.jsx`                     | Mudança/limpeza dos filtros; status, carregamento, vazio e indisponibilidade da atividade                                                           |
| `src/features/dashboard/components/DashboardMetrics.test.jsx`, `DashboardStatusNotice.test.jsx`                 | Indicadores com dados disponíveis/indisponíveis e aviso sobre limites dos dados do agente                                                           |
| `src/testing/frontendRevision.test.jsx`                                                                         | Falha parcial, resposta antiga, resumo malformado, configuração indisponível/inválida, cancelamento de gravação e exportação, erro HTTP no download |
| `src/features/reports/pages/ReportsPage.test.jsx`                                                               | Loading/vazio/retry, envio duplicado, filtros bloqueados, download iniciado, liberação da URL de objeto e arquivo vazio                             |
| `src/features/settings/pages/SettingsPage.test.jsx`                                                             | Alterações pendentes, restauração, proteção de saída, edição simultânea dos campos e salvamento sem envio duplicado                                 |
| `src/features/reports/components/ReportFilters.test.jsx`, `ReportUsersState.test.jsx`, `ExportActions.test.jsx` | Atalhos de filtro, usuários indisponíveis, loading, retry e feedback das ações de exportação                                                        |
| `src/features/reports/hooks/useReportExport.test.js`                                                            | Exportação, prevenção de envio simultâneo, URL de objeto, sucesso, falha, arquivo vazio e cancelamento ao desmontar                                 |
| `src/features/auth/pages/AuthPage.test.jsx`, `src/features/tasks/pages/TasksPage.test.jsx`                      | Páginas bloqueadas explicam a dependência sem coletar credenciais nem task local                                                                    |
| `src/app/layout/Sidebar.test.jsx`                                                                               | Navegação, rota ativa, diálogo móvel, Tab, Escape, foco, histórico, rolagem e mudança para desktop                                                  |
| `src/app/ErrorBoundary.test.jsx`                                                                                | Mensagem segura após exceção e ausência de log de payload em produção                                                                               |
| `src/app/PageErrorBoundary.test.jsx`                                                                            | Isolamento da falha e nova tentativa na página                                                                                                      |
| `src/features/dashboard/components/CategorySummary.test.jsx`                                                    | Duração e percentual de categoria com dados do resumo                                                                                               |
| `src/features/reports/lib/exportFilename.test.js`                                                               | Nome seguro do download com filtro de usuário                                                                                                       |
| `src/shared/components/MetricCard.test.jsx`, `PageHeader.test.jsx`, `IntegrationNotice.test.jsx`                | Indicadores, título/descrição/ações do cabeçalho e conteúdo dos avisos de integração                                                                |
| `src/shared/components/AsyncFeedback.test.jsx`, `ActivityStatusBadge.test.jsx`                                  | Anúncios, retry, toast temporário, skeletons e rótulos de status                                                                                    |
| `src/shared/lib/dashboard.test.js`                                                                              | Formatação de tempo/data, agregação de categorias, filtros e contagens sem alterar a lista original                                                 |
| `src/shared/lib/routeLeaveGuard.test.js`, `activityStatus.test.js`                                              | Registro/remoção da proteção de saída e rótulos de status da atividade                                                                              |
| `src/testing/architecture.test.js`                                                                              | Imports válidos e violações de camadas em imports, reexports e imports dinâmicos                                                                    |

Playwright cobre retry de Colaboradores, leitura e gravação de Configurações, confirmação ao sair com alterações pendentes, CSV/PDF, alternância entre cards e tabelas em 375/768/1366 px, menu móvel, estados offline e erro do servidor. Os dois testes de FastAPI real são opt-in e foram ignorados sem `RUN_REAL_API`. Veja [Pendências](PENDENCIAS.md).

## Cenários críticos a manter em futuras mudanças

- Diferenciar **lista vazia válida** de falha/JSON inválido em cada fonte.
- Impedir que resposta de consulta anterior ou de outra data substitua o filtro atual.
- Impedir que uma falha de realtime apareça como zero de usuários online.
- Cancelar solicitações quando filtros mudam ou a página sai de cena; encerrar timeout e listeners.
- Validar inteiros positivos antes de gravar configurações e não anunciar sucesso quando a resposta for inválida.
- Não baixar HTML, arquivo vazio ou resposta HTTP de erro como CSV/PDF.
- Garantir navegação por teclado, foco no conteúdo após troca de rota, foco restaurado no menu móvel, rota 404 e tema na entrada direta.
- Continuar sem testes que pressupõem login ou tasks funcionais antes de existir contrato real.

## Validação manual pendente

Os itens abaixo **não foram comprovados** pelos testes automatizados. Executar em navegador com backend disponível e também com API indisponível. As áreas de jornada, relatórios e Dashboard se relacionam com [CA-06](../../requisitos/requisitos/ca.md#ca-06--jornada-e-inatividade), [CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação) e [CA-10](../../requisitos/requisitos/ca.md#ca-10--dashboard-analítico); teclado e telas menores são tratados em [Responsividade](../../requisitos/responsividade.md#6-critérios). Esses critérios descrevem o produto alvo e continuam sem aceite automático por causa dos contratos ausentes:

| Área                   | Verificação manual                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navegação              | Acesso direto por hash, voltar/avançar, 404, título da aba, carregamento de chunks e link de salto                                                            |
| Teclado/leitor de tela | Ordem de Tab, foco visível, Escape no menu, anúncio de erros/loading, leitura dos cabeçalhos e `caption` de tabelas                                           |
| Responsividade         | Inspecionar dispositivos reais e zoom nativo de 200%; Playwright já verificou 375×667, 390×844, 768×1024, 1366×768 e 1920×1080, além de ampliação CSS de 200% |
| Dados                  | Resumo com e sem registros, filtro de usuário, falha isolada de uma fonte, retry de Colaboradores, refresh do painel e mudança de data                        |
| Configurações          | Leitura, valores inválidos, salvamento, erro 4xx/5xx, queda de rede e saída durante operação                                                                  |
| Exportação             | CSV/PDF reais, nome e conteúdo do arquivo, falha/timeout, ausência de usuários e cancelamento ao sair                                                         |
| Console e rede         | Exceções de renderização, rejeições não tratadas, requests inesperados e mensagens de CORS                                                                    |

### Roteiros para fluxos críticos

Estes roteiros ainda **precisam ser executados manualmente** no ambiente alvo. Registre navegador, data, resultado e eventuais erros de Console/Rede ao executá-los. Use dados de teste e não altere configurações de produção.

#### Saída com alterações não salvas

**Pré-condições:** frontend e backend em execução; `GET /config/` responde com os dois valores globais.

1. Abra `#/configuracoes` e aguarde os campos aparecerem.
2. Altere **Intervalo de captura (segundos)** para outro inteiro positivo, sem salvar.
3. Confirme que aparece **Alterações não salvas** e clique em **Painel**.
4. Cancele o diálogo de saída; confirme que a página e o valor editado permanecem.
5. Clique novamente em **Painel** e confirme a saída.

**Resultado esperado:** o diálogo pergunta se deseja sair sem salvar; cancelar mantém Configurações e confirmar abre o Painel. Ao reabrir Configurações, o valor original continua salvo. Confira também **Restaurar**: ele deve repor o valor e remover o aviso sem gravar.

#### Falha isolada da atividade no Painel

**Pré-condições:** `GET /users/` e `GET /dashboard/summary` respondem; há pelo menos um usuário cadastrado. No navegador, bloqueie temporariamente apenas a requisição `/activities/realtime` pela ferramenta de rede.

1. Abra `#/painel` ou clique em **Atualizar** depois de ativar o bloqueio.
2. Aguarde o fim da consulta e observe o alerta, os indicadores e **Última atividade**.
3. Remova o bloqueio e clique em **Tentar novamente** no alerta, ou em **Atualizar**.

**Resultado esperado:** o alerta identifica a falha de **Atividade**; **Online**, **Ausentes** e **Sem leitura recente** mostram `—`, e a última atividade fica indisponível. **Usuários cadastrados** e **Tempo registrado** continuam usando suas fontes disponíveis. Após a nova consulta, os dados de atividade voltam se a API responder. Falha de realtime não deve aparecer como zero pessoas online.

#### Exportação com dados reais

**Pré-condições:** backend e banco em execução; data com registros conhecidos; navegador permite downloads. Este roteiro não é coberto pelo E2E simulado.

1. Abra `#/relatorios`, escolha a data conhecida e, se necessário, um usuário.
2. Clique em **Exportar CSV** e aguarde o aviso de download iniciado.
3. Abra o arquivo: confira nome, codificação, colunas `username,category,total_seconds` e valores contra a resposta real da API.
4. Clique em **Exportar PDF**; abra o arquivo e confira data, usuário, total e categorias contra a mesma fonte.
5. Na aba Rede, confira status 200 e tipos `text/csv` e `application/pdf` nas respectivas respostas.

**Resultado esperado:** cada ação produz um arquivo não vazio do formato escolhido, referente aos filtros selecionados. O aviso na tela significa apenas que o download começou; confirme o conteúdo no arquivo aberto.

#### Menu móvel por teclado e leitor de tela

**Pré-condições:** navegador em largura menor que `1024px`; leitor de tela disponível para a segunda parte.

1. Com Tab, foque **Abrir menu** e ative com Enter ou Espaço.
2. Percorra os links com Tab e Shift+Tab; use Escape para fechar.
3. Abra novamente, escolha **Relatórios** e observe o foco após a navegação.
4. Repita com leitor de tela, verificando nome do diálogo, rota ativa e anúncio dos títulos e erros.

**Resultado esperado:** o foco permanece no diálogo aberto; Escape devolve o foco a **Abrir menu**; a navegação fecha o menu e leva o foco ao conteúdo principal da nova página. O leitor de tela deve anunciar os controles e mensagens sem depender apenas de cor.

Vitest usa mocks de `fetch` e jsdom. Playwright usa Chrome com respostas HTTP simuladas e downloads reais do navegador, mas não valida banco, autorização, CORS de implantação nem conteúdo produzido pelo FastAPI. axe-core detecta apenas parte dos problemas de acessibilidade; leitor de tela e inspeção humana continuam necessários. O `typecheck` cobre a camada de contratos da API e seus imports, não todo o código JavaScript/JSX.

## Cobertura adicional confirmada em 26/09/2026

- `src/features/settings/pages/SettingsPage.test.jsx`: sucesso, dois submits no mesmo evento, bloqueio/liberação de campos, falha de rede, limpeza de erro e nova tentativa.
- `src/shared/api/api.test.js`: sinal já cancelado sem rede, cancelamento após leitura iniciada, distinção de timeout externo/interno e MIME com sufixo inválido.
- `src/shared/lib/dashboard.test.js`: textos malformados, identidades duplicadas, tempo negativo/fracionário, data inexistente e duração acima da precisão segura.
- `src/features/dashboard/hooks/useDashboardData.test.js`: resumo de outro usuário e horário sem dados após falha de todas as fontes.
- `src/features/dashboard/pages/DashboardPage.test.jsx`: usuário selecionado continua visível sem lista disponível.
- `src/app/hooks/useTheme.test.js`: leitura e gravação bloqueadas no localStorage não impedem a alternância.
- `e2e/app.spec.js` e `e2e/accessibility.spec.js`: anúncio do download, orientação horizontal de 667×320 px, menu/erros de exportação no escuro com axe-core sem violações detectadas.

O healthcheck da API em `http://localhost:8000/` não respondeu. O teste real permaneceu ignorado; nenhuma inicialização de backend, seed ou banco foi feita. Os dados simulados existem exclusivamente nas suites de teste. As falhas iniciais de data fixa, contraste e formatação foram corrigidas, sem remover as verificações.

## Validação da refatoração da estrutura — 26/09/2026

Após a reorganização em `app/`, `features/`, `shared/` e `testing/`:

- `npm.cmd test`: 103 testes passaram em 22 arquivos, incluindo os componentes preservados.
- `npm.cmd run lint` e `npm.cmd run format:check`: passaram.
- `npm.cmd run test:e2e` com `PLAYWRIGHT_CHANNEL=chrome`: build de produção concluído, 22 cenários passaram e 1 teste de API real foi ignorado sem `RUN_REAL_API`.
- `git diff --check`: sem erros; alterações restritas a `FrontEnd/`.

Os fluxos de navegação e imports dinâmicos, filtros, configurações, downloads, tema, menu móvel, responsividade e acessibilidade automatizada passaram com os novos caminhos. O teste opt-in com API real não foi executado nesta refatoração.
