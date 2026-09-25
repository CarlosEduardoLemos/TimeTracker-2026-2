# Auditoria técnica do frontend — 25/09/2026

## Escopo e método

Foram lidos arquivos de entrada, páginas, componentes, hooks, serviço, utilitários, testes, configurações e documentação em `FrontEnd`. Requisitos em `requisitos/` e rotas, schemas, modelos, CRUD e inicialização em `backend/` foram consultados somente para entender contratos. A árvore de imports, scripts e rotas foi comparada com os arquivos existentes. O estado Git estava limpo antes da revisão. Todas as alterações ficaram em `FrontEnd/`.

Este registro foi complementado após a consolidação inicial dos guias. O inventário de telas, contratos, testes e pendências agora está detalhado nos demais documentos desta pasta. Informações históricas de versões anteriores continuam acessíveis no Git, mas não são tratadas como descrição da aplicação presente.

### Evidência consultada

| Fonte | O que foi confirmado |
| --- | --- |
| `FrontEnd/index.html`, `src/main.jsx`, `src/App.jsx`, `src/hooks/useHashRoute.js` | Entrada React, rotas por hash, carregamento de páginas, tema e ErrorBoundary |
| `FrontEnd/src/pages`, `src/components`, `src/hooks`, `src/utils`, `src/services` | Caminho de renderização ativo, funções usadas, estados de requisição e componentes preservados |
| `FrontEnd/package.json`, `vitest.config.js`, `vite.config.js`, `tailwind.config.js` | Scripts, dependências, testes, build e estilos |
| `requisitos/visao.md`, `requisitos/requisitos/rn_rf.md`, `requisitos/responsividade.md` | Requisitos de gestor, colaborador, task, relatórios, dashboard e responsividade |
| `backend/app/routers`, `backend/app/schemas.py`, `crud.py`, `models.py`, `main.py`, `seed.py` | Métodos, parâmetros, respostas, ausência de autenticação/task, semântica realtime e riscos externos |

### Comparação com os requisitos

| Área | O que existe hoje | Lacuna verificada |
| --- | --- | --- |
| Acesso do gestor (RF-02/RF-23) | Página informativa de login/cadastro; endpoints globais acessados sem sessão | Cadastro, autenticação, autorização e isolamento dos dados pelo servidor |
| Associação e equipe (RF-03/RF-05/RF-16) | `/users/` lista usuários globais; `/activities/realtime` informa leitura recente | Código e vínculo de equipe, lista restrita e conexão real do agente |
| Tasks (RF-06/RF-11) | Página de dependência, sem formulário local | Modelo, CRUD, associações, escopo e autorização |
| Jornada (RF-20/RF-22) | Dois valores globais em `/config/` | Jornada por colaborador e identificação de possível hora extra |
| Dashboard (RF-27) | Resumo diário, última leitura, categorias e estados aproximados | Task ativa, tempo produtivo, ranking, série histórica e timeline com fonte confiável |
| Relatórios (RF-24/RF-25) | Exportação CSV/PDF do resumo de um dia | Filtros de período/task e conteúdo completo por aplicação, escopo e jornada |

O backend expõe categorias e regras de categorização, mas não há contrato que as transforme em aplicações produtivas de uma task. Por isso não foram usadas para simular escopo de trabalho. O resumo diário soma duração de registros; a palavra “produtividade” na descrição do endpoint não altera o conteúdo efetivamente retornado.

## Prioridades encontradas

| Prioridade | Achado | Decisão |
| --- | --- | --- |
| Alta | `ErrorBoundary` existia, mas `main.jsx` não o montava | Montado na entrada para evitar tela em branco em falha inesperada de renderização |
| Alta | Resumo válido de outra data podia ser apresentado como resposta da data selecionada | Data de resposta conferida no hook |
| Alta | Configuração podia mostrar sucesso para resposta inválida; gravação não era cancelada ao desmontar | Validação de leitura/gravação e cancelamento no ciclo de vida |
| Alta | Login e tasks recebiam dados em formulários sem endpoint de persistência | Entradas removidas; dependências explicadas sem simular fluxo |
| Média | Rota desconhecida abria painel, ocultando erro de navegação | Estado de página não encontrada, retorno ao painel e título atualizado |
| Média | Exportação não era cancelada ao sair e não detectava arquivo vazio | Cancelamento, validação e estado de progresso |
| Média | Colaboradores não tinha ação de repetir consulta após falha | Botão de retry, cancelamento da anterior e feedback de carregamento |
| Média | Tabela de atividade não anunciava carregamento, e tabelas largas careciam de nome para a rolagem | Status, `caption`, foco e região nomeada |
| Média | Documentação histórica descrevia arquitetura e testes de versões anteriores | Consolidação em guias correntes e registro desta auditoria |
| Baixa | Dois reexports e uma lista de navegação não tinham consumidores | Arquivos removidos após busca de imports e entradas |
| Alta | Com usuário filtrado, “Usuários cadastrados” dependia da lista combinada com realtime; falha isolada podia resultar em zero incorreto | O indicador passou a contar somente `/users/`, com regressão para falha parcial |

## Alterações realizadas

| Arquivo | Problema | Alteração e motivo |
| --- | --- | --- |
| `src/main.jsx` | Boundary sem uso | Montado `ErrorBoundary` em torno de `App` |
| `src/App.jsx` | Leitura de rota duplicada; fallback silencioso; título estático | Passa a usar `useHashRoute`, mostra página não encontrada e atualiza `document.title` |
| `src/hooks/useHashRoute.js` | Rota inválida convertida em painel | Retorna `notFound` para hash desconhecido, preservando painel como rota padrão |
| `src/hooks/useDashboardData.js` | Aceitava resumo de data diferente | Exige que `summary.date` coincida com o filtro antes de disponibilizar o dado |
| `src/services/api.js` | Datas inválidas poderiam chegar à API; falha síncrona divergente do contrato assíncrono; HTML poderia ser baixado como CSV/PDF | Valida data real, mantém rejeição por Promise em `summary` e confere tipo de resposta de exportação |
| `src/pages/SettingsPage.jsx` | Salvamento sem validação de resposta/cancelamento; campos disponíveis durante envio | Valida inteiros positivos no GET/PUT, cancela operações, desabilita campos ao salvar e conserva feedback de erro/sucesso correto |
| `src/pages/ReportsPage.jsx` | Download podia continuar após desmontagem e aceitar arquivo vazio | Cancela exportação, rejeita blob vazio/inválido, anuncia progresso e impede data vazia |
| `src/pages/CollaboratorsPage.jsx` | Falha sem retry; dados antigos poderiam aparecer durante nova consulta | Retry com cancelamento, status de loading e tabela com `caption`/rolagem nomeada |
| `src/pages/DashboardPage.jsx` | Data vazia acionava consulta inválida; tabela sem loading legível; contador de cadastrados dependia do realtime | Mantém data válida, anuncia carregamento, nomeia tabela/rolagem e conta cadastrados pela fonte correta |
| `src/pages/AuthPage.jsx` | Inputs de credenciais indisponíveis sugeriam fluxo funcional | Remove campos e estado local; explica contrato ausente e oferece retorno ao painel |
| `src/pages/TasksPage.jsx` | Formulário local não persistia task | Remove campos e estado descartável; explica o bloqueio por contrato ausente |
| `src/components/MetricCard.jsx` | Código compactado e número anunciado como título sem ser seção | Formatação legível e valor como texto |
| `src/components/PageHeader.jsx`, `src/components/IntegrationNotice.jsx` | JSX compactado dificultava revisão | Formatação legível sem mudar contrato visual |
| `src/index.css` | Regras comprimidas; regiões com rolagem via teclado sem foco visível | Formatação e contorno de foco para `tabIndex=0` |
| `src/App.test.jsx`, `src/hooks/useHashRoute.test.js` | Testes esperavam fallback antigo | Cobrem 404, retorno e título da página |
| `src/hooks/useDashboardData.test.js`, `src/services/api.test.js` | Datas incorretas e formato de resposta da exportação não tinham regressão | Cobrem resposta com data divergente, rejeição de data inválida sem rede e HTML recebido como CSV |
| `src/pages/frontendRevision.test.jsx` | Salvamento inválido e saída durante escrita/download sem regressão | Exige erro sem mensagem falsa de sucesso e cancelamento ao sair das páginas |
| `src/components/MetricCard.test.jsx` | Teste exigia valor numérico como título | Verifica o valor visível com semântica de texto |
| `src/pages/AuthPage.test.jsx`, `src/pages/TasksPage.test.jsx` | Testavam formulários sem persistência | Cobrem explicação do bloqueio e ausência de coleta de dados |
| `src/pages/DashboardPage.test.jsx` | Faltava regressão para contagem filtrada com falha de realtime | Confirma usuário cadastrado pela lista global e estados realtime indisponíveis |
| `README.md`, `docs/ARQUITETURA.md`, `docs/FUNCIONALIDADES.md`, `docs/PENDENCIAS.md`, `docs/TESTES.md` | Informações repetidas ou defasadas | Reescritos para refletir caminhos de execução e contratos atuais; este arquivo reúne auditoria e decisões |

## Arquivos removidos

| Arquivo | Evidência de remoção segura |
| --- | --- |
| `src/components/index.js`, `src/hooks/index.js` | Reexports sem imports no código ativo, entrada ou configuração; consumidores usam imports diretos. Os componentes e hooks foram mantidos. |
| `src/data/dashboardData.js` | `navItems` não era importado; Sidebar mantém sua própria lista usada na interface. |
| `docs/INTEGRACAO.md`, `docs/REFATORACAO.md` | Misturavam histórico e instruções de versões anteriores; contratos e decisões atuais foram consolidados em Arquitetura, Pendências e Auditoria. Histórico detalhado continua no Git. |

Componentes sem uso no caminho atual, mas com possível função nas integrações planejadas, foram preservados e estão descritos em [Arquitetura](ARQUITETURA.md). Não foram inventados endpoints, métricas, usuários ou permissões.

## Decisões de preservação

- A integração HTTP permanece centralizada em `src/services/api.js`, pois há poucos contratos realmente consumidos. Não foi criada camada adicional de estado ou cliente externo.
- O painel continua apresentando categorias e tempo **registrado** do resumo; nenhuma categoria é rotulada como produtividade de task.
- O roteamento por hash e o design Tailwind foram mantidos. Não houve migração de framework, linguagem ou biblioteca de roteamento.
- `ActivityChart`, `Header`, `PeopleCard`, `ReportsAndAgent`, `TimelineCard`, `useAutoRefresh` e componentes auxiliares isolados foram mantidos por possível uso futuro, sem anunciá-los como funções ativas.
- Login e tasks não recebem entrada do usuário enquanto faltam contratos. Configurações e exportação conservam seus endpoints atuais e descrevem explicitamente seu escopo global/parcial.

## Qualidade, UX e acessibilidade

As correções práticas abrangeram carregamento, falha parcial, retry, cancelamento, validação de data/resposta, download, foco de tabelas, semântica de métricas e rota inexistente. O menu móvel já possuía controle de foco e rolagem; os testes existentes foram preservados. `index.css` mantém contraste por tema, foco visível e redução de movimento. Não foi adicionada biblioteca de lint/formatador sem uma necessidade concreta de instalação nesta entrega. O projeto continua sem E2E e sem validação visual automatizada.

O comportamento em navegador real, leitor de tela e diferentes resoluções permanece pendente. O teste automatizado comprova apenas o comportamento observado em jsdom e mocks; veja o roteiro em [Testes](TESTES.md).

## Validação

- `npm.cmd test`: **86 testes passaram em 21 arquivos**.
- `npm.cmd run build`: **concluído**, com chunks por página.
- `git diff --check`: sem erros de whitespace; Git informou apenas conversão futura de LF para CRLF no checkout Windows.
- `git status --short`: apenas caminhos sob `FrontEnd/` foram modificados ou removidos.

O ambiente jsdom não substitui inspeção visual, console de navegador, responsividade real ou teste contra backend em execução. Essas verificações continuam em [Testes](TESTES.md). Contratos externos e próximos passos estão em [Pendências](PENDENCIAS.md).
