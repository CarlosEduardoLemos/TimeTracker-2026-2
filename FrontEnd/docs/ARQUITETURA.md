# Arquitetura do frontend

Este documento descreve o código executado atualmente em `FrontEnd/`: estrutura, dependências entre camadas e fluxos de interface. [Funcionalidades](FUNCIONALIDADES.md) relaciona as telas aos requisitos; [Contratos da API](CONTRATOS_API.md) registra rotas, payloads, validação e comportamento HTTP; [Pendências](PENDENCIAS.md) separa o que depende de novos contratos do backend.

## Plataforma e entrada

- React 18 com JavaScript/JSX, Vite 6, Tailwind CSS 3 e CSS local. Vitest e React Testing Library cobrem os componentes e hooks; Playwright verifica fluxos no navegador.
- `index.html` declara `lang="pt-BR"`, viewport e `#root`. `src/main.jsx` monta `App` sob `React.StrictMode` e `ErrorBoundary`.
- `ErrorBoundary` global mostra uma mensagem e opção de recarregar após exceção de renderização. `PageErrorBoundary` isola cada rota. Falhas HTTP são tratadas nas páginas e hooks de dados.
- `src/app/App.jsx` compõe `Sidebar`, conteúdo principal e páginas carregadas com `React.lazy`/`Suspense`. `src/app/routes.js` reúne label, título, menu e componente de cada rota. `useHashRoute` observa `hashchange` e consulta o guarda de saída quando há alterações não salvas. Hash vazio abre o painel; hash desconhecido produz a página não encontrada. `#/login` e `#/cadastro` usam o layout próprio de `AuthPage`.
- `App` ajusta `document.title` por rota e mantém uma única instância de `useTheme`. O hook usa `timetracker-theme` no `localStorage`; sem preferência salva, consulta `prefers-color-scheme`.

## Mapa do código

- `app/`: composição das páginas, layout, navegação por hash, tema, barreiras de erro e estilos globais. `src/main.jsx` permanece como entrada do Vite.
- `features/`: funcionalidades `auth`, `collaborators`, `dashboard`, `reports`, `settings` e `tasks`. Cada funcionalidade mantém componentes, hooks, bibliotecas e páginas próprios quando necessário.
- `shared/`: cliente HTTP, componentes usados por várias telas e funções comuns coesas de validação/apresentação. `shared/lib/` agrupa datas, duração, equipe, status e falhas de requisição; cálculos do resumo ficam em `features/dashboard/lib/summary.js`.
- `testing/`: setup do Vitest e testes que atravessam mais de uma funcionalidade. Testes específicos ficam junto do arquivo testado.

`app` pode importar `features` e `shared`; cada funcionalidade pode importar `shared` e seus próprios arquivos. `shared` não deve depender de `app` ou `features`. A regra local em `lint/architecture.js` verifica imports relativos, reexports e imports dinâmicos literais em `npm run lint`. Imports de pacotes externos ficam fora dessa regra. Use imports diretos, inclusive nos imports dinâmicos das páginas, sem arquivos de reexportação.

| Caminho                                                                          | Responsabilidade                                                            |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `src/shared/api/api.js`                                                          | Cliente HTTP único, timeout, cancelamento, parâmetros e downloads.          |
| `src/shared/api/validators.js`                                                   | Validação das respostas de usuários, realtime, resumo e configurações.      |
| `src/shared/lib/date.js`, `duration.js`, `team.js`, `activityStatus.js`          | Funções reutilizadas para datas, duração, equipe e rótulos de status.       |
| `src/features/dashboard/hooks/useDashboardData.js`                               | Estado e atualização das fontes do painel: resumo, usuários e realtime.     |
| `src/features/dashboard/hooks/useAutoRefresh.js`                                 | Atualização periódica apenas com a aba visível e atualização ao retornar.   |
| `src/features/dashboard/lib/summary.js`                                          | Soma de duração e consolidação de categorias do painel.                     |
| `src/features/dashboard/pages/DashboardPage.jsx`                                 | Composição de filtros, indicadores, atividade e categorias.                 |
| `src/features/dashboard/components/AssociationCodeCard.jsx`                      | Apresentação isolada do código de associação, cópia e estados da interface. |
| `src/features/collaborators/hooks/useCollaboratorsData.js` e `components/`       | Consultas, combinação de usuários/realtime e visualização responsiva.       |
| `src/features/settings/hooks/useSettings.js` e `components/SettingsForm.jsx`     | Leitura, edição, validação, gravação e guarda de alterações não salvas.     |
| `src/features/reports/`                                                          | Página, consulta de usuários e exportação organizadas por responsabilidade. |
| `src/features/auth/pages/AuthPage.jsx`, `src/features/tasks/pages/TasksPage.jsx` | Mensagens de indisponibilidade; não coletam credenciais nem dados de task.  |
| `src/app/layout/Sidebar.jsx`                                                     | Navegação desktop e diálogo móvel.                                          |

## Fluxo de dados do painel

`AssociationCodeCard` não faz parte de `useDashboardData`: sua identidade é independente da data e do usuário selecionados. O card permanece fora do Dashboard do MVP. Quando usado isoladamente sem código, mostra indisponibilidade; hoje não há consulta do gestor porque faltam contrato de associação e sessão autenticada. Uma futura integração deverá buscar o valor por uma camada de dados própria quando o endpoint e a autenticação forem definidos.

Fluxo esperado, ainda não comprovado ponta a ponta:

```text
GESTOR — FRONTEND WEB
        |
        | Consulta autenticada do código
        v
BACKEND — API
        ^
        | POST /associate/
        | code + username + hostname
        |
AGENT — COLABORADOR
```

`POST /associate/` é a rota consumida pelo Agent segundo a PR externa #122; a implementação no backend não foi localizada neste checkout. O fluxo do gestor depende de endpoint de consulta e sessão próprios, ainda não confirmados. Conforme a PR, depois de uma associação bem-sucedida o Agent protege o token local com DPAPI e usa Bearer em chamadas posteriores; o monitoramento só começa se o Agent estiver associado. O backend precisa validar vínculo, identidade e escopo de autorização em cada operação. O token do Agent não é a sessão do gestor. Até existirem contratos e testes integrados, este diagrama descreve a arquitetura esperada, não uma funcionalidade disponível.

1. `DashboardPage` inicia com a data local do navegador e usuário vazio. A mudança de data ou usuário altera os argumentos de `useDashboardData`.
2. O hook cancela a consulta anterior, incrementa um identificador de sequência e solicita resumo, usuários e realtime em paralelo com `Promise.allSettled`.
3. O cliente usa `shared/api/validators.js` para verificar a estrutura necessária à interface. O hook também confere data e usuário solicitados; resposta vazia continua válida. Cada fonte recebe sua própria flag em `availability`.
4. Mudança de filtro limpa os dados anteriores. Uma atualização do mesmo filtro mantém os dados durante `refreshing`. Resposta cancelada ou de sequência antiga não substitui a atual.
5. Se alguma fonte falhar ou vier inválida, `requestFailure` compõe um alerta com a fonte e o motivo; apenas a parte dependente dessa fonte fica indisponível. Lista vazia válida permanece distinta de falha.
6. Há atualização manual e consulta a cada 30 segundos enquanto a aba está visível. `useAutoRefresh` suspende o intervalo na aba oculta e consulta ao retornar. O intervalo e o listener são limpos quando o hook desmonta.

`deriveTeam` une usuários e atividades realtime por `username`. O frontend preserva `online`, `ausente` e `offline` informados pela API. Na regra atual do backend, `offline` pode decorrer de captura inativa (`is_idle=true`) ou de mais de 15 minutos sem evento; não comprova desconexão do Agent. `ausente` e `online` também são estados calculados pela API, não estados de conexão autenticada. Para usuário sem entrada realtime na janela de até 24 horas, o frontend deriva `no-data` e apresenta “Sem dados”. O filtro de data afeta somente o resumo; o filtro de usuário também é aplicado localmente à lista de atividade. `categoryTotals` soma as durações de cada categoria do resumo; não calcula produtividade por task.

## Fluxos das demais páginas

- **Colaboradores:** `useCollaboratorsData` consulta usuários e realtime em paralelo, mantém loading, erro, cancelamento e retry, e combina respostas disponíveis. Se realtime falhar, a lista de usuários ainda aparece com última atividade indisponível. Os componentes exibem cards em telas estreitas e tabela em telas largas.
- **Configurações:** `useSettings` lê antes de exibir o formulário. Os valores precisam ser inteiros positivos seguros na leitura e gravação. O formulário indica alterações não salvas, permite restaurar e bloqueia o `PUT` quando os valores não mudaram. Com alterações, a troca de rota por hash pede confirmação; refresh e fechamento acionam `beforeunload`. Durante o `PUT`, campos e botão são desabilitados; retry da leitura e cancelamento ocorrem ao sair.
- **Relatórios:** lê usuários para preencher o filtro opcional, com skeleton e estado vazio. Falha nessa lista mostra motivo e retry, preservando o usuário selecionado e os filtros atuais. `useReportExport` bloqueia outro envio, desabilita filtros durante o preparo, cancela ao sair e cria temporariamente uma URL de objeto para salvar `resumo_<usuário>_<data>.csv` ou `.pdf`. O sucesso anuncia que o download foi iniciado.

## Decisões arquiteturais

| Decisão                                                  | Motivo e consequência                                                                                                                                                           |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rotas por hash, sem React Router                         | As rotas atuais cabem em `app/routes.js` e `useHashRoute`; o hash permite abrir uma tela sem regras de reescrita no servidor estático.                                          |
| Estado com hooks do React, sem Redux                     | Filtros, carregamento e formulários pertencem às páginas; tema e navegação têm hooks próprios. Ainda não há estado global que justifique outro gerenciador.                     |
| Login/cadastro sem formulário e Tasks sem `localStorage` | Faltam contratos de autenticação, sessão, autorização, persistência de tasks e associação ao gestor.                                                                            |
| `Promise.allSettled` nas consultas independentes         | Resumo, usuários e realtime podem falhar separadamente. Painel e Colaboradores preservam as partes que responderam.                                                             |
| Validadores além do tratamento HTTP                      | Uma resposta `2xx` ainda pode ter formato incompatível. A validação evita exibir dados inválidos e distingue lista vazia de falha.                                              |
| `AbortController` por consulta/página                    | Mudança de filtro, retry e saída cancelam trabalho obsoleto. Uma gravação já processada pelo servidor não é revertida pelo cancelamento do cliente.                             |
| Estado realtime não comprova conexão do Agent            | Falha na fonte deixa os estados indisponíveis; não os transforma em zero. `offline` pode decorrer de `is_idle=true`; sem entrada na janela de 24 horas, exibe-se **Sem dados**. |

Revise estas decisões quando os contratos ou o número de rotas mudarem. Consulte [Contratos da API](CONTRATOS_API.md) e [Pendências](PENDENCIAS.md) para detalhes relacionados.

## Interface, acessibilidade e responsividade

O layout usa os breakpoints `sm`, `lg` e `xl` do Tailwind. O menu lateral fixo aparece no desktop; no mobile, o botão abre um diálogo com foco inicial, ciclo de Tab, fechamento por Escape ou clique externo, bloqueio da rolagem do fundo e restauração do foco. O link “Pular para o conteúdo principal” foca o `<main>` sem trocar o hash. Após trocar de rota, o foco vai ao `<main>` da nova página. Filtros têm labels; erros usam `role="alert"`, carregamento usa `role="status"` e skeletons, e tabelas passam a cards nas larguras menores. Status usam rótulo e badge; barras de categoria são decorativas porque duração e percentual já aparecem em texto. `index.css` oferece foco visível, mantém contraste em botões desabilitados e respeita `prefers-reduced-motion`.

Playwright executa os fluxos principais no Chrome, testa larguras de 375 a 1920 px e ampliação CSS de 200%; axe-core verifica violações WCAG detectáveis automaticamente em quatro telas e no menu móvel escuro. Leitor de tela, zoom nativo e backend real ainda exigem inspeção. Consulte [Testes](TESTES.md).

## Qualidade automatizada

`eslint.config.js` combina regras de JavaScript, React, Hooks, JSX a11y e fronteiras entre `app`, `features` e `shared`. `shared/api/contracts.js` documenta em JSDoc os campos garantidos pelos validadores e métodos do cliente; `npm run typecheck` aplica `checkJs` somente a essa camada e seus imports. Prettier formata código, configuração e Markdown. `vitest.config.js` inclui apenas testes em `src`, separando-os do Playwright, e define limites de cobertura para API, bibliotecas compartilhadas e hooks críticos. `e2e/run.mjs` gera o build, sobe o preview local, executa Chrome e encerra o servidor. `e2e/real-api.spec.js` só roda com `RUN_REAL_API=1` e FastAPI disponível. Consulte [Testes](TESTES.md) para resultados e [Alterações](ALTERACOES.md) para o histórico.
