# Arquitetura e contratos do frontend

Este documento descreve o código executado atualmente em `FrontEnd/`. [Funcionalidades](FUNCIONALIDADES.md) descreve o que aparece ao usuário; [Pendências](PENDENCIAS.md) separa o que requer novos contratos do backend.

## Plataforma e entrada

- React 18 com JavaScript/JSX, Vite 6, Tailwind CSS 3 e CSS local. Vitest e React Testing Library são usados nos testes. `recharts` permanece instalado porque existe um componente de gráfico preservado, mas o painel atual não o renderiza.
- `index.html` declara `lang="pt-BR"`, viewport e `#root`. `src/main.jsx` monta `App` sob `React.StrictMode` e `ErrorBoundary`.
- `ErrorBoundary` mostra uma mensagem e opção de recarregar após exceção de renderização. Falhas HTTP são tratadas nas páginas e no hook de dados; a barreira não as substitui. Detalhes da exceção só são registrados no console durante desenvolvimento.
- `src/App.jsx` compõe `Sidebar`, conteúdo principal e páginas carregadas com `React.lazy`/`Suspense`. `src/hooks/useHashRoute.js` observa `hashchange`. Hash vazio abre o painel; hash desconhecido produz a página não encontrada. `#/login` e `#/cadastro` usam o layout próprio de `AuthPage`.
- `App` ajusta `document.title` por rota e mantém uma única instância de `useTheme`. O hook usa a chave `timetracker-theme` no `localStorage`; sem preferência salva, consulta `prefers-color-scheme`.

## Mapa do código

| Caminho | Responsabilidade atual |
| --- | --- |
| `src/services/api.js` | Origem da API, `fetch`, timeout, cancelamento, parâmetros e download. É o único cliente HTTP usado pelas páginas. |
| `src/hooks/useDashboardData.js` | Estado e atualização das três fontes do painel: resumo, usuários e realtime. |
| `src/utils/dashboard.js` | Validação dos objetos recebidos e cálculo/apresentação de duração, categorias e status derivados. |
| `src/pages/DashboardPage.jsx` | Filtros, indicadores e tabelas do painel. |
| `src/pages/CollaboratorsPage.jsx` | Listagem global de usuários combinada, quando possível, com última atividade. |
| `src/pages/SettingsPage.jsx` | Leitura e atualização dos dois parâmetros globais de `/config/`. |
| `src/pages/ReportsPage.jsx` | Seleção de data/usuário e download do resumo diário em CSV/PDF. |
| `src/pages/AuthPage.jsx`, `TasksPage.jsx` | Mensagens de indisponibilidade; não coletam credenciais nem dados de task. |
| `src/components/Sidebar.jsx` | Navegação desktop e diálogo móvel. |
| `src/index.css`, `tailwind.config.js` | Estilos base, tokens de cor, tema, foco e adaptação de layout. |

## Cliente HTTP

`VITE_API_URL` em `.env` determina a origem da API; na ausência dela, o cliente usa `http://localhost:8000`. `.env.example` documenta esse valor. O serviço remove uma barra final da origem e monta os caminhos abaixo. O valor de `username` é codificado por `URLSearchParams`.

| Método e rota consumida | Parâmetros/corpo | Resposta contratada pelo backend | Consumidor |
| --- | --- | --- | --- |
| `GET /users/` | Nenhum | Array de `UserOut`: `id`, `username`, `full_name?`, `department?`, `created_at` | Painel, Colaboradores, Relatórios |
| `GET /activities/realtime` | Nenhum | Array de `RealtimeEntry`: `username`, `hostname`, `process_name`, `window_title?`, `category?`, `is_idle`, `seconds_since_last_activity`, `status` | Painel, Colaboradores |
| `GET /dashboard/summary` | `date` obrigatório em `AAAA-MM-DD`; `username` opcional | `{ date, users: [{ username, total_seconds, by_category: [{ category, color, total_seconds }] }] }` | Painel |
| `GET /dashboard/export/csv` | Mesmos filtros do resumo | `text/csv`, colunas `username,category,total_seconds` | Relatórios |
| `GET /dashboard/export/pdf` | Mesmos filtros do resumo | `application/pdf`, total e categorias de cada usuário | Relatórios |
| `GET /config/` | Nenhum | `{ capture_interval_seconds, idle_timeout_seconds, updated_at? }` | Configurações |
| `PUT /config/` | JSON com os dois inteiros positivos | Mesmo objeto de configuração | Configurações |

`api.js` produz `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. O corpo JSON de falhas HTTP é lido para exibir `detail` do FastAPI; sem `detail`, a mensagem usa o status. `type` distingue `client` (4xx), `server` (5xx), `network`, `timeout`, `canceled` e `invalid-response`. Detalhes de validação em lista são resumidos pelas mensagens `msg`; o texto exibido é limitado a 500 caracteres. O timeout de 15 segundos cobre inclusive a leitura do corpo, e cada chamada aceita `AbortSignal` externo. A data de resumo/exportação precisa ser real em `AAAA-MM-DD`. O download aceita apenas `csv`/`pdf`, valida o tipo de conteúdo e `ReportsPage` rejeita blob vazio.

Não há cabeçalho de autenticação, cookie de sessão administrado pela aplicação, cache persistente de dados da API nem endpoint criado localmente. O backend também expõe categorias e regras, mas a interface atual não as consome: essas categorias não equivalem a aplicações produtivas de uma task.

## Ciclo de dados do painel

1. `DashboardPage` inicia com a data local do navegador e usuário vazio. A mudança de data ou usuário altera os argumentos de `useDashboardData`.
2. O hook cancela a consulta anterior, incrementa um identificador de sequência e solicita resumo, usuários e realtime em paralelo com `Promise.allSettled`.
3. `validSummary`, `validUsers` e `validRealtime` verificam a estrutura necessária à interface. O resumo também precisa corresponder à data solicitada. Cada fonte recebe sua própria flag em `availability`.
4. Mudança de filtro limpa os dados anteriores. Uma atualização do mesmo filtro mantém os dados durante `refreshing`. Uma resposta cancelada ou de sequência antiga não substitui a atual.
5. Se alguma fonte falhar ou vier inválida, `requestFailure` compõe um alerta com a fonte e o motivo; apenas a parte dependente dessa fonte fica indisponível. Lista vazia válida permanece distinta de falha. `updatedAt` indica a última consulta em que ao menos uma fonte foi válida.
6. Há atualização manual e consulta a cada 30 segundos enquanto a aba está visível. Ao voltar para a aba, ocorre atualização imediata. O intervalo e o listener são limpos quando o hook desmonta.

`deriveTeam` une `/users/` com `/activities/realtime` por `username`. O backend devolve `online` ou `ausente` somente para usuários com leitura nos últimos 15 minutos. Para usuário cadastrado sem entrada nessa janela, o frontend deriva `offline` e apresenta “Sem leitura recente”. Isso não comprova desconexão do agente. O filtro de data afeta somente `/dashboard/summary`; o filtro de usuário é enviado ao resumo e aplicado localmente à lista de última atividade. `categoryTotals` soma a duração de cada categoria dos usuários presentes no resumo; não há cálculo de produtividade por task.

## Ciclos das demais páginas

- **Colaboradores:** consulta usuários e realtime em paralelo, valida cada resposta e permite tentar novamente. Se apenas realtime falhar, a lista de usuários ainda aparece com última atividade indisponível. Uma nova consulta cancela a anterior; saída da página também cancela.
- **Configurações:** lê antes de exibir o formulário. Os dois valores precisam ser inteiros positivos seguros tanto na resposta de leitura quanto na de gravação. Durante o `PUT`, campos e botão são desabilitados; uma resposta inválida não produz sucesso. Há retry da leitura e cancelamento da operação ao sair.
- **Relatórios:** lê usuários para preencher o filtro opcional. Falha nessa lista mostra o motivo e permite retry, preservando a exportação geral. Cada download usa o filtro selecionado, impede outro download simultâneo, cancela ao sair e cria temporariamente uma URL de objeto para salvar `resumo_<data>.csv` ou `.pdf`.

## Interface, acessibilidade e responsividade

O layout usa `sm`, `lg` e `xl` do Tailwind. O menu lateral fixo aparece no desktop; no mobile, o botão abre um diálogo com foco inicial, ciclo de Tab, fechamento por Escape ou clique externo, bloqueio da rolagem do fundo e restauração do foco. O link “Pular para o conteúdo principal” foca o `<main>` sem trocar o hash. Filtros têm labels; erros usam `role="alert"`, carregamento usa `role="status"`, e tabelas largas têm `caption` e contêiner focalizável para rolagem horizontal. `index.css` oferece foco visível e respeita `prefers-reduced-motion`.

Playwright executa os fluxos principais no Chrome, testa larguras de 375 a 1920 px e ampliação CSS de 200%; axe-core verifica violações WCAG detectáveis automaticamente em quatro telas e no menu móvel escuro. O painel recebeu `min-w-0` para conter a tabela rolável no mobile; textos secundários e links escuros receberam contraste maior. Leitor de tela, zoom nativo e backend real ainda exigem inspeção. Consulte [Testes](TESTES.md).

## Qualidade automatizada

`eslint.config.js` combina regras de JavaScript, React, Hooks e JSX a11y. `react/prop-types` fica desativada porque o projeto não usa PropTypes, `react-hooks/set-state-in-effect` porque a leitura inicial ocorre em efeitos, e `jsx-a11y/no-noninteractive-tabindex` porque os contêineres das tabelas precisam receber foco para rolagem por teclado. Prettier formata código e configuração; `.prettierignore` exclui documentação e arquivos gerados. `vitest.config.js` inclui apenas testes em `src`, separando-os do Playwright. O script `e2e/run.mjs` gera o build, sobe o preview local, executa Chrome e encerra o servidor. `e2e/real-api.spec.js` só roda com `RUN_REAL_API=1` e FastAPI disponível. Consulte [Alterações](ALTERACOES.md) para o inventário dos arquivos.

## Código preservado fora do caminho atual

`ActivityChart`, `Header`, `PeopleCard`, `ReportsAndAgent`, `TimelineCard`, `Card`, `SectionHeading`, `EmptyState`, `useAutoRefresh` e algumas funções de `utils/dashboard.js` são usados apenas por componentes preservados ou testes, sem consumidor na árvore ativa de `App`. Eles não comprovam que histórico semanal, timeline, task ativa ou controle de polling por checkbox estejam disponíveis hoje. Permanecem para decisão posterior sobre reutilização, pois a intenção futura é plausível; veja [Pendências](PENDENCIAS.md).

## Ao alterar um contrato

Conferir a rota e o schema no backend antes de modificar `api.js`; ajustar a validação correspondente em `utils/dashboard.js` ou na página consumidora; preservar estados de carregamento, vazio e falha; acrescentar regressão apenas para o comportamento novo ou corrigido. Atualizar [Funcionalidades](FUNCIONALIDADES.md) quando a tela mudar, [Pendências](PENDENCIAS.md) quando um bloqueio for resolvido ou surgir, e [Testes](TESTES.md) com a evidência realmente executada. Não tratar componentes isolados ou descrições de requisitos como prova de um endpoint existente.
