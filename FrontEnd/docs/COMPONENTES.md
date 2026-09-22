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
