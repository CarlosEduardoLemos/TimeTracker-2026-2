# Arquitetura e contratos do frontend

Este documento descreve o código executado atualmente em `FrontEnd/`. [Funcionalidades](FUNCIONALIDADES.md) descreve o que aparece ao usuário; [Pendências](PENDENCIAS.md) separa o que requer novos contratos do backend.

## Plataforma e entrada

- React 18 com JavaScript/JSX, Vite 6, Tailwind CSS 3 e CSS local. Vitest e React Testing Library são usados nos testes. As barras de tempo por categoria usam CSS e os dados do resumo diário.
- `index.html` declara `lang="pt-BR"`, viewport e `#root`. `src/main.jsx` monta `App` sob `React.StrictMode` e `ErrorBoundary`.
- `ErrorBoundary` global mostra uma mensagem e opção de recarregar após exceção de renderização. `PageErrorBoundary` isola cada rota e permite nova tentativa na tela. Falhas HTTP são tratadas nas páginas e no hook de dados.
- `src/app/App.jsx` compõe `Sidebar`, conteúdo principal e páginas carregadas com `React.lazy`/`Suspense`. `src/app/routes.js` reúne label, título, menu e componente de cada rota. `src/app/hooks/useHashRoute.js` observa `hashchange` e consulta o guarda de saída quando há alterações não salvas. Hash vazio abre o painel; hash desconhecido produz a página não encontrada. `#/login` e `#/cadastro` usam o layout próprio de `AuthPage`.
- `App` ajusta `document.title` por rota e mantém uma única instância de `useTheme`. O hook usa a chave `timetracker-theme` no `localStorage`; sem preferência salva, consulta `prefers-color-scheme`.

## Mapa do código

A organização segue as responsabilidades abaixo:

- `app/`: composição das páginas, layout, navegação por hash, tema, barreira de erro e estilos globais. `src/main.jsx` permanece como entrada do Vite.
- `features/`: funcionalidades `auth`, `collaborators`, `dashboard`, `reports`, `settings` e `tasks`. O painel e os relatórios organizam componentes e hooks próprios ao lado das páginas.
- `shared/`: cliente HTTP, componentes usados nas telas e funções comuns de validação/apresentação. `shared/lib/dashboard.js` atende painel, colaboradores, relatórios e cliente HTTP, por isso permanece compartilhado.
- `testing/`: setup do Vitest e testes que atravessam mais de uma funcionalidade; testes específicos ficam junto do arquivo testado.

`app` pode importar `features` e `shared`; cada funcionalidade pode importar `shared` e seus próprios arquivos. `shared` não deve depender de `app` ou `features`. Os componentes antigos sem consumidores foram removidos de `src/legacy`. Use imports diretos, incluindo os imports dinâmicos das páginas, sem arquivos de reexportação.

| Caminho                                                                                       | Responsabilidade atual                                                                                            |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `src/shared/api/api.js`                                                                       | Origem da API, `fetch`, timeout, cancelamento, parâmetros e download. É o único cliente HTTP usado pelas páginas. |
| `src/features/dashboard/hooks/useDashboardData.js`                                            | Estado e atualização das três fontes do painel: resumo, usuários e realtime.                                      |
| `src/features/dashboard/hooks/useAutoRefresh.js`                                              | Agenda consultas somente com a aba visível e atualiza ao retornar.                                                |
| `src/shared/api/validators.js`                                                                | Validação das respostas de usuários, realtime, resumo e configurações.                                            |
| `src/shared/lib/dashboard.js`, `src/shared/lib/activityStatus.js`                             | Duração, categorias, contagens e rótulos de status derivados.                                                     |
| `src/features/dashboard/pages/DashboardPage.jsx`                                              | Composição dos componentes de filtros, indicadores, atividade e categorias do painel.                             |
| `src/features/collaborators/pages/CollaboratorsPage.jsx`                                      | Listagem global de usuários combinada, quando possível, com última atividade.                                     |
| `src/features/settings/pages/SettingsPage.jsx`                                                | Leitura e atualização dos dois parâmetros globais de `/config/`.                                                  |
| `src/features/reports/pages/ReportsPage.jsx`, `src/features/reports/hooks/useReportExport.js` | Filtros de data/usuário e ciclo do download diário em CSV/PDF.                                                    |
| `src/features/auth/pages/AuthPage.jsx`, `src/features/tasks/pages/TasksPage.jsx`              | Mensagens de indisponibilidade; não coletam credenciais nem dados de task.                                        |
| `src/app/layout/Sidebar.jsx`                                                                  | Navegação desktop e diálogo móvel.                                                                                |
| `src/app/styles/index.css`, `tailwind.config.js`                                              | Estilos base, tokens de cor, tema, foco e adaptação de layout.                                                    |

## Cliente HTTP

`VITE_API_URL` em `.env` determina a origem da API; na ausência dela, o cliente usa `http://localhost:8000`. `.env.example` documenta esse valor. O serviço remove uma barra final da origem e monta os caminhos abaixo. O valor de `username` é codificado por `URLSearchParams`.

| Método e rota consumida     | Parâmetros/corpo                                        | Resposta contratada pelo backend                                                                                                                   | Consumidor                        |
| --------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `GET /users/`               | Nenhum                                                  | Array de `UserOut`: `id`, `username`, `full_name?`, `department?`, `created_at`                                                                    | Painel, Colaboradores, Relatórios |
| `GET /activities/realtime`  | Nenhum                                                  | Array de `RealtimeEntry`: `username`, `hostname`, `process_name`, `window_title?`, `category?`, `is_idle`, `seconds_since_last_activity`, `status` | Painel, Colaboradores             |
| `GET /dashboard/summary`    | `date` obrigatório em `AAAA-MM-DD`; `username` opcional | `{ date, users: [{ username, total_seconds, by_category: [{ category, color, total_seconds }] }] }`                                                | Painel                            |
| `GET /dashboard/export/csv` | Mesmos filtros do resumo                                | `text/csv`, colunas `username,category,total_seconds`                                                                                              | Relatórios                        |
| `GET /dashboard/export/pdf` | Mesmos filtros do resumo                                | `application/pdf`, total e categorias de cada usuário                                                                                              | Relatórios                        |
| `GET /config/`              | Nenhum                                                  | `{ capture_interval_seconds, idle_timeout_seconds, updated_at? }`                                                                                  | Configurações                     |
| `PUT /config/`              | JSON com os dois inteiros positivos                     | Mesmo objeto de configuração                                                                                                                       | Configurações                     |

`api.js` produz `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. O corpo JSON de falhas HTTP é lido para exibir `detail` do FastAPI; sem `detail`, a mensagem usa o status. `type` distingue `client` (4xx), `server` (5xx), `network`, `timeout`, `canceled` e `invalid-response`. Detalhes de validação em lista são resumidos pelas mensagens `msg`; o texto exibido é limitado a 500 caracteres. O timeout de 15 segundos cobre inclusive a leitura do corpo, e cada chamada aceita `AbortSignal` externo. A data de resumo/exportação precisa ser real em `AAAA-MM-DD`. O download aceita apenas `csv`/`pdf`, exige o tipo de conteúdo correspondente mesmo quando o cabeçalho estiver ausente, e `ReportsPage` rejeita blob vazio.

Não há cabeçalho de autenticação, cookie de sessão administrado pela aplicação, cache persistente de dados da API nem endpoint criado localmente. O backend também expõe categorias e regras, mas a interface atual não as consome: essas categorias não equivalem a aplicações produtivas de uma task.

## Ciclo de dados do painel

1. `DashboardPage` inicia com a data local do navegador e usuário vazio. A mudança de data ou usuário altera os argumentos de `useDashboardData`.
2. O hook cancela a consulta anterior, incrementa um identificador de sequência e solicita resumo, usuários e realtime em paralelo com `Promise.allSettled`.
3. O cliente HTTP usa `shared/api/validators.js` para verificar a estrutura necessária à interface: nomes não vazios e únicos por fonte, campos textuais exibidos e durações inteiras seguras não negativas. Campos de texto opcionais aceitam ausência/nulo. O hook também confere data e usuário solicitados; resposta vazia continua válida. Cada fonte recebe sua própria flag em `availability`.
4. Mudança de filtro limpa os dados anteriores. Uma atualização do mesmo filtro mantém os dados durante `refreshing`. Uma resposta cancelada ou de sequência antiga não substitui a atual.
5. Se alguma fonte falhar ou vier inválida, `requestFailure` compõe um alerta com a fonte e o motivo; apenas a parte dependente dessa fonte fica indisponível. Lista vazia válida permanece distinta de falha. `updatedAt` acompanha os dados disponíveis e fica nulo quando todas as fontes falham e seus dados são removidos. O filtro selecionado permanece visível mesmo se a lista falhar ou deixar de conter aquele usuário.
6. Há atualização manual e consulta a cada 30 segundos enquanto a aba está visível. `useAutoRefresh` suspende o intervalo na aba oculta e faz uma consulta imediata ao retornar. O intervalo e o listener são limpos quando o hook desmonta.

`deriveTeam` une `/users/` com `/activities/realtime` por `username`. O backend devolve `online` ou `ausente` somente para usuários com leitura nos últimos 15 minutos. Para usuário cadastrado sem entrada nessa janela, o frontend deriva `offline` e apresenta “Sem leitura recente”. Isso não comprova desconexão do agente. O filtro de data afeta somente `/dashboard/summary`; o filtro de usuário é enviado ao resumo e aplicado localmente à lista de última atividade. `categoryTotals` soma a duração de cada categoria dos usuários presentes no resumo; não há cálculo de produtividade por task.

## Ciclos das demais páginas

- **Colaboradores:** consulta usuários e realtime em paralelo, valida cada resposta e permite tentar novamente. Se apenas realtime falhar, a lista de usuários ainda aparece com última atividade indisponível. Uma nova consulta cancela a anterior; saída da página também cancela.
- **Configurações:** lê antes de exibir o formulário. Os dois valores precisam ser inteiros positivos seguros tanto na resposta de leitura quanto na de gravação. O formulário indica alterações não salvas, permite restaurar e bloqueia o `PUT` quando os valores não mudaram. Se houver alterações, a troca de rota por hash pede confirmação; refresh e fechamento acionam `beforeunload`. Durante o `PUT`, campos e botão são desabilitados; uma resposta inválida não produz sucesso. Há retry da leitura e cancelamento da operação ao sair.
- **Relatórios:** lê usuários para preencher o filtro opcional, com skeleton e estado vazio. Falha nessa lista mostra motivo e retry, preservando o usuário selecionado e a exportação com os filtros atuais. `useReportExport` bloqueia imediatamente outro envio por referência síncrona, desabilita filtros durante o preparo, cancela ao sair e cria temporariamente uma URL de objeto para salvar `resumo_<usuário>_<data>.csv` ou `.pdf` quando há filtro de usuário. O sucesso anuncia download iniciado em toast temporário, sem afirmar que o usuário salvou o arquivo.

O cancelamento interrompe a espera do cliente; não garante reversão de uma gravação que o servidor já tenha processado. O cliente também recusa sinais já cancelados antes de chamar `fetch` e resultados recebidos depois do cancelamento; timeout é identificado pela origem interna do cancelamento, não pelo texto do motivo externo. `isIsoDate` é compartilhado entre validação de resumo e parâmetros HTTP. A preferência de tema funciona em memória quando o navegador impede acesso ou gravação em `localStorage`.

## Decisões arquiteturais importantes

| Decisão                                                  | Motivo e consequência                                                                                                                                                                                                                                       |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rotas por hash, sem React Router                         | As poucas rotas atuais cabem em `app/routes.js` e `useHashRoute`. O hash permite abrir uma tela diretamente sem depender de regras de reescrita de caminhos no servidor estático. O guarda de alterações pendentes integra a troca de rota.                 |
| Estado com hooks do React, sem Redux                     | O estado de filtros, carregamento e formulários pertence às páginas; tema e navegação têm hooks próprios. Ainda não há estado de negócio global que justifique outro gerenciador.                                                                           |
| Login/cadastro sem formulário e Tasks sem `localStorage` | Faltam contratos de autenticação, sessão, autorização, persistência de tasks e associação ao gestor. Coletar credenciais ou criar tasks só no navegador sugeriria uma funcionalidade que a API ainda não sustenta.                                          |
| `Promise.allSettled` nas consultas independentes         | Resumo, usuários e realtime podem falhar separadamente. O Painel e Colaboradores preservam as partes que responderam, em vez de descartar todos os dados por uma única falha.                                                                               |
| Validators além do tratamento HTTP                       | Uma resposta `2xx` ainda pode ter formato ou valores incompatíveis. Validar antes de exibir distingue lista vazia válida de contrato quebrado e evita mostrar números enganosos.                                                                            |
| `AbortController` por consulta/página                    | Mudança de filtro, nova tentativa e saída da página cancelam trabalho obsoleto; o identificador de sequência do Painel também impede que uma resposta antiga substitua a atual. O cancelamento de um `PUT` não desfaz gravação já processada pelo servidor. |
| Ausência de realtime não prova conexão do Agente         | Uma falha na fonte deixa os estados indisponíveis (`—`), não os transforma em zero. Usuário sem leitura na janela recente recebe o rótulo **Sem leitura recente**; a API ainda não informa se o Agente está conectado.                                      |

Revise estas decisões quando os contratos ou o número de rotas mudarem; os detalhes operacionais permanecem nas seções acima e em [Pendências](PENDENCIAS.md).

## Interface, acessibilidade e responsividade

O layout usa `sm`, `lg` e `xl` do Tailwind. O menu lateral fixo aparece no desktop; no mobile, o botão abre um diálogo com foco inicial, ciclo de Tab, fechamento por Escape ou clique externo, bloqueio da rolagem do fundo e restauração do foco. O link “Pular para o conteúdo principal” foca o `<main>` sem trocar o hash. Após trocar de rota, o foco vai ao `<main>` da nova página, inclusive em login/cadastro. Filtros têm labels; erros usam `role="alert"`, carregamento usa `role="status"` e skeletons, e as tabelas passam a cards nas larguras menores. Status usam rótulo e badge; as barras de categoria são decorativas porque duração e percentual já aparecem em texto. `index.css` oferece foco visível, mantém contraste em botões desabilitados e respeita `prefers-reduced-motion`.

Playwright executa os fluxos principais no Chrome, testa larguras de 375 a 1920 px e ampliação CSS de 200%; axe-core verifica violações WCAG detectáveis automaticamente em quatro telas e no menu móvel escuro. O painel recebeu `min-w-0` para conter a tabela rolável no mobile; textos secundários e links escuros receberam contraste maior. Leitor de tela, zoom nativo e backend real ainda exigem inspeção. Consulte [Testes](TESTES.md).

## Qualidade automatizada

`eslint.config.js` combina regras de JavaScript, React, Hooks e JSX a11y. `react/prop-types` fica desativada porque o projeto não usa PropTypes, `react-hooks/set-state-in-effect` porque a leitura inicial ocorre em efeitos, e `jsx-a11y/no-noninteractive-tabindex` porque os contêineres das tabelas precisam receber foco para rolagem por teclado. Prettier formata código, configuração e Markdown; `.prettierignore` exclui lockfile e arquivos gerados. `vitest.config.js` inclui apenas testes em `src`, separando-os do Playwright. O script `e2e/run.mjs` gera o build, sobe o preview local, executa Chrome e encerra o servidor. `e2e/real-api.spec.js` só roda com `RUN_REAL_API=1` e FastAPI disponível. Consulte [Alterações](ALTERACOES.md) para o inventário dos arquivos.

## Ao alterar um contrato

Conferir a rota e o schema no backend antes de modificar `shared/api/api.js`; ajustar a validação correspondente em `shared/api/validators.js`; preservar estados de carregamento, vazio e falha; acrescentar regressão apenas para o comportamento novo ou corrigido. Atualizar [Funcionalidades](FUNCIONALIDADES.md) quando a tela mudar, [Pendências](PENDENCIAS.md) quando um bloqueio for resolvido ou surgir, e [Testes](TESTES.md) com a evidência realmente executada. Não tratar descrições de requisitos como prova de um endpoint existente.
