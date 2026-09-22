# Organização atual e histórico de refatoração

## Decisões em vigor

- React/Vite é o frontend ativo; Blazor permanece apenas como referência em `legacy/`.
- A aplicação possui páginas em `src/pages/` e navegação por hash via `useHashRoute`.
- `App.jsx` funciona como bootstrap/layout; `DashboardPage.jsx` compõe o dashboard.
- O cliente HTTP permanece centralizado em `src/services/api.js`; não foi criada uma camada de repositories sem necessidade.
- O frontend não gera mocks operacionais em falha de API.
- Funcionalidades dependentes de persistência permanecem bloqueadas até contrato oficial.

## Refatoração atual

- chamadas opcionais da API agora informam degradação parcial em vez de falharem silenciosamente;
- falha de realtime não é convertida em `0` colaboradores online;
- dias históricos indisponíveis não são convertidos em `0h`;
- resumos históricos carregados com sucesso são reutilizados nos refreshes do mesmo filtro, reduzindo o polling normal de 9 para 3 requisições;
- dias históricos que falharam continuam sendo reconsultados;
- status `ausente` foi alinhado explicitamente ao contrato atual do backend;
- `ActivityChart` passou a trabalhar diretamente em horas, removendo a representação intermediária em décimos de hora;
- tabela de equipe ganhou semântica mais completa para tecnologias assistivas;
- prop não utilizada de `MetricCard`, utilitário `getLocalIsoDate` e estilos antigos sem consumidores foram removidos;
- código morto de compatibilidade foi removido: `useActiveSection`, `useDashboard.js`, `AppsCard`, `CategoryChart`, `utils/report.js` e seu teste.

## Preservado conscientemente

- `legacy/blazor`: histórico fora do build ativo; remoção não é necessária para a qualidade do runtime atual;
- hash routing: suficiente para as rotas existentes e não justifica adicionar dependência agora;
- `useAutoRefresh`, `useTheme`, `useHashRoute`, Sidebar e páginas administrativas: responsabilidades já estavam claras;
- dependências do projeto: nenhuma biblioteca nova foi adicionada;
- telas e ações ainda bloqueadas por backend: não foram simuladas nem substituídas por contratos inventados.

## Pendências funcionais externas

Autenticação, associação, tasks, jornada por colaborador, relatório completo e dados integrais do RF-27 continuam dependendo de contratos externos. Consulte `INTEGRACAO-FRONTEND-BACKEND.md`.
