# Catálogo de componentes — TimeTrack Frontend

Este documento descreve os componentes reutilizáveis da implementação atual. As telas completas ficam em `src/pages/`.

## Componentes compartilhados

### `Card`
Contêiner visual reutilizável para conteúdo do dashboard.

### `SectionHeading`
Título/descrição de seções internas existentes.

### `PageHeader`
Cabeçalho padrão das páginas administrativas, com título, descrição e ação opcional.

### `EmptyState`
Estado vazio reutilizável para telas sem dados/integração disponível.

### `IntegrationNotice`
Aviso visual usado quando a interface já está estruturada, mas a ação depende de contrato externo.

## Navegação

### `Sidebar`

Navegação principal desktop/mobile para Painel, Colaboradores, Tasks, Relatórios e Configurações. Usa links por hash e `aria-current="page"`. No mobile, o drawer possui fechamento por botão, backdrop ou `Escape` e contenção de foco.

## Dashboard

### `Header`
Filtro de data e colaborador, tema, refresh manual, última atualização e estado da API. Diferencia `online`, `offline`, `loading` e `degraded` para não apresentar integração parcial como totalmente saudável.

### `MetricCard`
Cartão dos seis indicadores previstos pelo RF-27. Ícones são decorativos para tecnologias assistivas; valores sem suporte de API permanecem `—`.

### `ActivityChart`
Gráfico do tempo registrado disponível. Dias históricos cuja consulta falhou são apresentados como indisponíveis na alternativa acessível, e não como zero horas.

### `TimelineCard`
Estrutura para Activity Timeline. Aguarda contrato que forneça aplicação, início, fim, duração, estado, task e classificação dentro/fora do escopo.

### `PeopleCard`
Tabela de acompanhamento da equipe com dados minimizados. O status `ausente` retornado pelo backend é mapeado explicitamente. A tabela possui `caption` e cabeçalhos com `scope="col"`.

### `ReportsAndAgent`
Mantém preferência de atualização automática e informação de exportação. CSV/PDF ficam desabilitados enquanto o contrato de relatório completo não estiver disponível.

`AppsCard` e `CategoryChart` foram removidos porque não eram renderizados pelo frontend ativo e mantinham apenas compatibilidade com uma estrutura anterior.

## Páginas

`AuthPage`, `CollaboratorsPage`, `TasksPage`, `SettingsPage`, `ReportsPage` e `DashboardPage` permanecem as páginas atuais. Ações que dependem de contratos ainda inexistentes continuam explicitamente desabilitadas, sem mocks operacionais.

## Contratos e dependências para manutenção

Componentes abaixo ficam em `src/components/<Nome>.jsx`, salvo páginas em
`src/pages/`. Props opcionais possuem defaults no código. Não há acesso HTTP
direto em componentes visuais.

| Componente | Props / dados / eventos | Consumidores e dependências |
| --- | --- | --- |
| Card | children, className, id; article sem evento próprio | MetricCard, ActivityChart, TimelineCard, PeopleCard; estilos Tailwind |
| SectionHeading | title, description, action | ActivityChart, TimelineCard, PeopleCard |
| PageHeader | eyebrow, title, description, actions | CollaboratorsPage, TasksPage, ReportsPage, SettingsPage |
| EmptyState | title, description, action | CollaboratorsPage e TasksPage |
| IntegrationNotice | title, children; role status | AuthPage, CollaboratorsPage, TasksPage, ReportsPage, SettingsPage |
| Sidebar | activeSection, items (default navItems); cliques mudam hash; estado mobileOpen | App; dashboardData, matchMedia, refs e listener de teclado; Escape/Tab controlam foco |
| Header | formattedDate, dark, toggleTheme, selectedDate/setSelectedDate, selectedUsername/setSelectedUsername, users, apiStatus, refreshing, onRefresh, updatedAt | DashboardPage; API_STATUS_LABELS e safeIsoDate; controla filtros, tema e refresh |
| MetricCard | icon, tone, label, value, detail | DashboardPage; Card; seis indicadores, cinco ainda sem dados de contrato |
| ActivityChart | weeklySummaries, loading, unavailable; totais por data | DashboardPage; Recharts, Card, SectionHeading, getSummaryTotalSeconds; tabela acessível equivalente |
| PeopleCard | realtimePeople, loading, unavailable; usuário/processo/status/tempo | DashboardPage; Card, SectionHeading, constantes e formatRelativeActivityTime |
| TimelineCard | activities (default []); id, application, startedAt, endedAt, durationSeconds, state, task, inScope são props locais propostas, não DTO da API | DashboardPage sempre passa []; Card, SectionHeading, formatDuration |
| ReportsAndAgent | autoRefresh, setAutoRefresh; checkbox altera polling, CSV/PDF disabled | DashboardPage; não controla nem instala agente desktop |
| DashboardPage | dark, toggleTheme vindos de App; data/usuário/autoRefresh em useState | App; useDashboardData, utils e componentes do painel |
| AuthPage | mode: login/cadastro; e-mail/senha em memória, validação local | App; IntegrationNotice; submit preventDefault e botão disabled |
| TasksPage | Sem props; description/services em memória; Limpar reseta ambos | App; PageHeader, IntegrationNotice, EmptyState; nenhum POST |
| CollaboratorsPage | Sem props; associação e listagem bloqueadas | App; PageHeader, IntegrationNotice, EmptyState |
| ReportsPage | Sem props; filtros e exportações desabilitados | App; PageHeader e IntegrationNotice |
| SettingsPage | Sem props; jornada/inatividade desabilitadas | App; PageHeader e IntegrationNotice |

`loading` e `unavailable` distinguem consulta pendente e falha de uma resposta
vazia em PeopleCard/ActivityChart. Dados anteriores do mesmo filtro são mantidos
durante refresh; o alerta do painel identifica dados retidos após falha.
Alterações nos componentes base afetam todos os consumidores da tabela; alterações
no cliente HTTP devem ser verificadas também no hook, painel e testes dos cards.
