# Testes e validação do frontend

Este guia distingue verificação automatizada, build e verificações manuais ainda pendentes. Os resultados abaixo foram confirmados em 26/09/2026; o inventário completo das alterações está em [Alterações](ALTERACOES.md).

## Preparação e comandos

Execute na pasta `FrontEnd` com as dependências do `package-lock.json` instaladas:

```powershell
cd FrontEnd
npm ci
npm.cmd test
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome' # se usar Chrome instalado em vez do Chromium do Playwright
npm.cmd run test:e2e
```

Para desenvolvimento, `npm.cmd run test:watch` mantém Vitest em observação. `npm.cmd run test:coverage` gera cobertura V8 em texto e HTML; uma meta numérica não foi definida. `npm.cmd run format` aplica Prettier ao código e Markdown; lockfile e artefatos gerados estão em `.prettierignore`. `git diff --check` verifica whitespace e `git status --short` confirma o escopo. `npm.cmd run dev` inicia Vite na porta 5173; os comandos do Vite usam `--configLoader runner` para compatibilidade com o Windows deste ambiente.

`vitest.config.js` usa `jsdom`, plugin React e `src/testing/setup.js` com `@testing-library/jest-dom`; só inclui `src/**/*.test.{js,jsx}`. A cobertura configura `src/**/*.{js,jsx}` e exclui `src/testing/**`. Playwright gera o build, sobe o preview, executa os testes no Chrome/Chromium e encerra o servidor. O executor fixa `VITE_API_URL=http://localhost:8000` nos E2E simulados; com `RUN_REAL_API=1`, respeita a origem configurada. Para instalar o Chromium gerenciado pelo Playwright, execute `npx playwright install chromium`; em máquina com Chrome instalado, defina `PLAYWRIGHT_CHANNEL=chrome`. `PLAYWRIGHT_CHANNEL` pode ser removida quando o Chromium gerenciado estiver disponível.

Para executar o teste de leitura com FastAPI real, inicie a API e o banco de dados separadamente, configure `VITE_API_URL` para a origem correta, defina `RUN_REAL_API=1` e rode `npm.cmd run test:e2e:real`. O teste não envia POST/PUT; GET /config/ pode inicializar configurações no servidor se ainda não existirem: verifica painel, CORS observado no navegador, GET de configurações e erros de página. Exporte CSV/PDF com dados reais e confira conteúdo manualmente; o E2E regular valida o mecanismo de download com respostas HTTP simuladas.

## Resultado automatizado registrado

| Verificação                      | Resultado                                                 | O que comprova                                                                 |
| -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm.cmd test`                   | **103 testes passaram em 22 arquivos** em 26/09/2026      | Comportamentos cobertos pelos mocks e por jsdom                                |
| `npm.cmd run lint`               | **Concluído**                                             | Regras JS, React, Hooks e JSX a11y                                             |
| `npm.cmd run format:check`       | **Concluído**                                             | Código sob Prettier consistente                                                |
| `npm.cmd run test:e2e` no Chrome | **22 passaram; 1 teste real ignorado sem `RUN_REAL_API`** | Fluxos no navegador, cinco larguras, ampliação CSS e análise WCAG automatizada |
| `npm.cmd run build`              | **Concluído** pelo Vite 6.4.3                             | Imports, JSX, CSS e geração dos chunks das páginas                             |
| `git diff --check`               | **Sem erros**                                             | Ausência de erros de whitespace no diff                                        |
| `git status --short`             | **Somente `FrontEnd/`**                                   | Escopo das alterações registradas no Git                                       |

Build bem sucedido não comprova disponibilidade da API, layout em navegador ou ausência de erro no console durante uso real.

## Inventário dos testes existentes

Os caminhos abaixo refletem a estrutura após a refatoração. Os testes específicos continuam próximos do código testado, incluindo aqueles em `src/legacy/`.

| Arquivo(s)                                                                                                                          | Comportamento protegido                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/App.test.jsx`                                                                                                              | Entrada direta em rotas com tema salvo, fallback de carregamento, link de salto, 404 e título                                                       |
| `src/shared/api/api.test.js`                                                                                                        | Codificação do usuário, erro HTTP, cancelamento externo, timeout na leitura, formatos de exportação, data inválida e HTML recebido como CSV         |
| `src/features/dashboard/hooks/useDashboardData.test.js`                                                                             | Três fontes, horário de atualização, dados mantidos no refresh, falha parcial e data divergente                                                     |
| `src/app/hooks/useHashRoute.test.js`                                                                                                | Hash desconhecido e reação a `hashchange`                                                                                                           |
| `src/app/hooks/useTheme.test.js`                                                                                                    | Preferência do sistema, preferência salva, alternância, classe/documento e `localStorage`                                                           |
| `src/legacy/hooks/useAutoRefresh.test.js`                                                                                           | Intervalo, desativação e atualização ao retornar à aba; protege um hook preservado, sem consumidor no fluxo ativo                                   |
| `src/features/dashboard/pages/DashboardPage.test.jsx`                                                                               | Loading, indicadores baseados na API, falha de realtime, filtro de usuário e contagem de cadastrados independente do realtime                       |
| `src/testing/frontendRevision.test.jsx`                                                                                             | Falha parcial, resposta antiga, resumo malformado, configuração indisponível/inválida, cancelamento de gravação e exportação, erro HTTP no download |
| `src/features/reports/pages/ReportsPage.test.jsx`                                                                                   | Loading/vazio/retry, envio duplicado, filtros bloqueados, download iniciado, liberação da URL de objeto e arquivo vazio                             |
| `src/features/auth/pages/AuthPage.test.jsx`, `src/features/tasks/pages/TasksPage.test.jsx`                                          | Páginas bloqueadas explicam a dependência sem coletar credenciais nem task local                                                                    |
| `src/app/layout/Sidebar.test.jsx`                                                                                                   | Navegação, rota ativa, diálogo móvel, Tab, Escape, foco, histórico, rolagem e mudança para desktop                                                  |
| `src/app/ErrorBoundary.test.jsx`                                                                                                    | Mensagem segura após exceção e ausência de log de payload em produção                                                                               |
| `src/shared/components/MetricCard.test.jsx`, `src/legacy/components/Card.test.jsx`, `src/legacy/components/SectionHeading.test.jsx` | Semântica e apresentação básica de componentes                                                                                                      |
| `src/legacy/components/ActivityChart.test.jsx`, `PeopleCard.test.jsx`, `Header.test.jsx`, `ReportsAndAgent.test.jsx`                | Componentes preservados fora do painel atual; estados, acessibilidade e controles desses componentes isolados                                       |
| `src/shared/lib/dashboard.test.js`                                                                                                  | Formatação de tempo/data, soma, filtros e contagens sem alterar a lista original                                                                    |

Os testes de componentes preservados não significam que gráfico semanal, timeline ou exportação completa estejam ativos na aplicação. Playwright cobre retry de Colaboradores, leitura e gravação de Configurações, CSV/PDF, menu móvel, estados offline e erro do servidor. O teste de FastAPI real foi ignorado porque a API não respondeu em `http://localhost:8000` durante esta revisão. Veja [Pendências](PENDENCIAS.md).

## Cenários críticos a manter em futuras mudanças

- Diferenciar **lista vazia válida** de falha/JSON inválido em cada fonte.
- Impedir que resposta de consulta anterior ou de outra data substitua o filtro atual.
- Impedir que uma falha de realtime apareça como zero de usuários online.
- Cancelar solicitações quando filtros mudam ou a página sai de cena; encerrar timeout e listeners.
- Validar inteiros positivos antes de gravar configurações e não anunciar sucesso quando a resposta for inválida.
- Não baixar HTML, arquivo vazio ou resposta HTTP de erro como CSV/PDF.
- Garantir navegação por teclado, foco restaurado no menu móvel, rota 404 e tema na entrada direta.
- Continuar sem testes que pressupõem login ou tasks funcionais antes de existir contrato real.

## Validação manual pendente

Os itens abaixo **não foram comprovados** pelos testes automatizados. Executar em navegador com backend disponível e também com API indisponível:

| Área                   | Verificação manual                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Navegação              | Acesso direto por hash, voltar/avançar, 404, título da aba, carregamento de chunks e link de salto                                                            |
| Teclado/leitor de tela | Ordem de Tab, foco visível, Escape no menu, anúncio de erros/loading, leitura dos cabeçalhos e `caption` de tabelas                                           |
| Responsividade         | Inspecionar dispositivos reais e zoom nativo de 200%; Playwright já verificou 375×667, 390×844, 768×1024, 1366×768 e 1920×1080, além de ampliação CSS de 200% |
| Dados                  | Resumo com e sem registros, filtro de usuário, falha isolada de uma fonte, retry de Colaboradores, refresh do painel e mudança de data                        |
| Configurações          | Leitura, valores inválidos, salvamento, erro 4xx/5xx, queda de rede e saída durante operação                                                                  |
| Exportação             | CSV/PDF reais, nome e conteúdo do arquivo, falha/timeout, ausência de usuários e cancelamento ao sair                                                         |
| Console e rede         | Exceções de renderização, rejeições não tratadas, requests inesperados e mensagens de CORS                                                                    |

Vitest usa mocks de `fetch` e jsdom. Playwright usa Chrome com respostas HTTP simuladas e downloads reais do navegador, mas não valida banco, autorização, CORS de implantação nem conteúdo produzido pelo FastAPI. axe-core detecta apenas parte dos problemas de acessibilidade; leitor de tela e inspeção humana continuam necessários. Não há `typecheck`, pois o código permanece em JavaScript/JSX.

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

Após a reorganização em `app/`, `features/`, `shared/`, `legacy/` e `testing/`:

- `npm.cmd test`: 103 testes passaram em 22 arquivos, incluindo os componentes preservados.
- `npm.cmd run lint` e `npm.cmd run format:check`: passaram.
- `npm.cmd run test:e2e` com `PLAYWRIGHT_CHANNEL=chrome`: build de produção concluído, 22 cenários passaram e 1 teste de API real foi ignorado sem `RUN_REAL_API`.
- `git diff --check`: sem erros; alterações restritas a `FrontEnd/`.

Os fluxos de navegação e imports dinâmicos, filtros, configurações, downloads, tema, menu móvel, responsividade e acessibilidade automatizada passaram com os novos caminhos. O teste opt-in com API real não foi executado nesta refatoração.
