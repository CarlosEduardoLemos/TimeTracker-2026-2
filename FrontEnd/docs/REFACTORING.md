# Organização atual e histórico de refatoração

## Limpeza posterior à auditoria — código sem uso

- Removida a pasta `legacy/blazor` por solicitação do usuário: nove arquivos
  versionados (Razor, C#, csproj, CSS e JS) e artefatos locais bin/obj.
- Conferidos entrada HTML, imports/reexports, rotas, scripts npm, Vite, Vitest,
  Tailwind e referências no repositório. Nenhum consumidor ativo do legado.
- Removidos seis reexports sem consumidores de `components/index.js`: Card,
  EmptyState, IntegrationNotice, PageHeader, SectionHeading e Sidebar. Os
  componentes continuam usados por imports diretos e foram preservados.
- Removidas opções Tailwind sem referências: font-mono/Fira Code, fade-in e
  seus keyframes, shadow-soft e shadow-medium. Estilos usados foram mantidos.
- Os 30 módulos de aplicação em src continuam alcançáveis pela entrada React.
  Testes, documentação e telas com integração pendente continuam necessários.
- README, arquitetura e guia do backend atualizados. As decisões abaixo sobre
  preservação do legado descrevem o estado anterior a esta limpeza.

Benefício: elimina um projeto independente sem uso e declarações mortas, sem
alterar funcionalidades. Risco limitado à resolução de imports/configuração,
verificado por testes e build. O legado pode ser recuperado pelo histórico Git.

Validação da limpeza: 82 testes aprovados em 19 arquivos, build Vite concluído
e `git diff --check` sem erros. Nenhuma alteração fora de `FrontEnd/`.

## Revisão de 23/09/2026 — ciclo de tema

- **Problema:** `useTheme` era iniciado apenas em DashboardPage; abrir outra rota
  diretamente não aplicava a preferência persistida.
- **Solução:** App mantém uma única instância do hook e fornece dark/toggleTheme
  ao painel. Removido o reexport sem consumidor em `hooks/index.js` após conferir
  referências, imports, rotas e configurações; o módulo useTheme foi preservado.
- **Arquivos:** App.jsx, pages/DashboardPage.jsx, hooks/index.js e testes de App/painel.
- **Motivo:** preferência do documento pertence ao ciclo de vida da aplicação.
- **Impacto:** todas as rotas restauram tema; botão existente continua no Header.
- **Risco:** baixo, sem nova persistência; testes de entrada direta em três rotas.

## Revisão de 23/09/2026 — estados de dados

- **Problema:** tabela/gráfico sem dados exibiam texto de resultado vazio durante
  carregamento/falha; refresh mal sucedido mantinha dados sem explicá-lo no alerta.
- **Solução:** props loading/unavailable nos dois cards, fornecidas pelo painel;
  alerta identifica dados da última consulta concluída. Detalhe do indicador online
  agora diz “status informado pela API”, pois não comprova conexão autenticada.
- **Arquivos:** DashboardPage, PeopleCard, ActivityChart e respectivos testes.
- **Motivo:** separar ausência confirmada de registros, consulta e indisponibilidade.
- **Impacto:** dados/contratos e retenção durante refresh preservados.
- **Risco:** baixo; regressões cobrem estados e transmissão das props.

## Revisão de 23/09/2026 — encerramento do lote HTTP

- **Problema:** Promise.all rejeitava o resumo obrigatório, mas requisições irmãs
  continuavam até timeout. Cancelamento com motivo customizado gerava warnings
  como se fontes opcionais tivessem falhado.
- **Solução:** controller do lote vinculado ao signal externo, abort/cleanup em
  finally e reconhecimento de signal.aborted nas consultas opcionais.
- **Arquivos:** services/api.js e api.test.js.
- **Motivo:** liberar trabalho sem consumidor e preservar motivo de cancelamento.
- **Impacto:** mesmas queries, payloads e fallback de falhas opcionais; elimina
  requests pendentes ao falhar a consulta obrigatória.
- **Risco:** médio por envolver concorrência. Testes verificam nove requests,
  cancelamento dos pendentes, timers zerados e ausência de warnings de cancelamento.

## Documentação e decisões desta revisão

Atualizados guias existentes; criados DATA-FLOW, EXTERNAL-ISSUES e auditoria datada.
Corrigidas referências ativas a PWA implementado, classe pill e localização do backend.
Não houve remoção de arquivos, bibliotecas novas ou upgrades. O legado Blazor e
documentos históricos possuem uso documental e foram preservados. Repetições
curtas de formulário/layout não justificaram componentes genéricos; cliente HTTP
permanece em um arquivo, sem nova camada de services/repositories.

As seções seguintes registram decisões das revisões anteriores. Resultados da
validação atual estão em [AUDITORIA-TECNICA-2026-09-23.md](AUDITORIA-TECNICA-2026-09-23.md).

## Decisões em vigor

- React/Vite é o frontend ativo; o protótipo Blazor foi removido.
- A aplicação possui páginas em `src/pages/` e navegação por hash via `useHashRoute`.
- `App.jsx` funciona como bootstrap/layout; `DashboardPage.jsx` compõe o dashboard.
- O cliente HTTP permanece centralizado em `src/services/api.js`; não foi criada uma camada de repositories sem necessidade.
- O frontend não gera mocks operacionais em falha de API.
- Funcionalidades dependentes de persistência permanecem bloqueadas até contrato oficial.

## Refatoração atual

- chamadas opcionais da API agora informam degradação parcial em vez de falharem silenciosamente;
- falha de realtime não é convertida em `0` colaboradores online;
- dias históricos indisponíveis não são convertidos em `0h`;
- resumos históricos carregados com sucesso são reutilizados no polling do mesmo filtro, reduzindo-o de 9 para 3 requisições; a atualização manual revalida todos os dias;
- dias históricos que falharam continuam sendo reconsultados;
- status `ausente` foi alinhado explicitamente ao contrato atual do backend;
- `ActivityChart` passou a trabalhar diretamente em horas, removendo a representação intermediária em décimos de hora;
- tabela de equipe ganhou semântica mais completa para tecnologias assistivas;
- prop não utilizada de `MetricCard`, utilitário `getLocalIsoDate` e estilos antigos sem consumidores foram removidos;
- código morto de compatibilidade foi removido: `useActiveSection`, `useDashboard.js`, `AppsCard`, `CategoryChart`, `utils/report.js` e seu teste.

## Preservado conscientemente

- `legacy/blazor` foi preservado nas auditorias anteriores e removido na limpeza posterior descrita acima;
- hash routing: suficiente para as rotas existentes e não justifica adicionar dependência agora;
- `useAutoRefresh`, `useTheme`, `useHashRoute`, Sidebar e páginas administrativas: responsabilidades já estavam claras;
- dependências do projeto: nenhuma biblioteca nova foi adicionada;
- telas e ações ainda bloqueadas por backend: não foram simuladas nem substituídas por contratos inventados.

## Pendências funcionais externas

Autenticação, associação, tasks, jornada por colaborador, relatório completo e dados integrais do RF-27 continuam dependendo de contratos externos. Consulte `INTEGRACAO-FRONTEND-BACKEND.md`.
