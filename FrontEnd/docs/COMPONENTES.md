# Catálogo de componentes — TimeTrack Frontend

Este documento descreve os componentes reutilizáveis da implementação atual. As telas completas ficam em `src/pages/`.

## Componentes compartilhados

### `Card`
Contêiner visual reutilizável para conteúdo do dashboard.

### `SectionHeading`
Título/descrição de seções internas existentes.

### `PageHeader`
Cabeçalho padrão das novas páginas administrativas, com título, descrição e ação opcional.

### `EmptyState`
Estado vazio reutilizável para telas sem dados/integracão disponível.

### `IntegrationNotice`
Aviso visual usado quando a interface já está estruturada, mas a ação depende de contrato externo. Evita apresentar funcionalidade simulada como pronta.

## Navegação

### `Sidebar`

Navegação principal desktop/mobile para:

- Painel;
- Colaboradores;
- Tasks;
- Relatórios;
- Configurações.

Usa links por hash e `aria-current="page"`. No mobile, o drawer pode ser fechado por botão, clique no backdrop ou tecla `Escape`; ao fechar por teclado, o foco retorna ao botão de abertura.

A Sidebar não exibe mais identidade fictícia de gestor. Login/Cadastro são apresentados enquanto a sessão real não existe.

## Dashboard

### `Header`
Filtro de data de referência e colaborador, status da API, tema, refresh manual e última atualização.

### `MetricCard`
Cartão de indicador. No RF-27 é usado para Online, Offline, Tasks ativas, Tempo ativo, Tempo inativo e Possível hora extra. Valores sem suporte de API permanecem `—`.

### `ActivityChart`
Gráfico baseado no tempo registrado disponível. Não calcula nem compara produtividade.

### `TimelineCard`
Estrutura para Activity Timeline. Deve receber aplicação, início, fim, duração, estado Ativo/Inativo, task e classificação dentro/fora do escopo quando a API disponibilizar esses campos.

### `PeopleCard`
Tabela de acompanhamento da equipe com dados minimizados. Não apresenta `window_title`, hostname ou categorias de produtividade. O contrato atual ainda não permite preencher todos os campos previstos pelo RF-27.

### `AppsCard`
Componente mantido para compatibilidade, sem ranking de aplicativos. O domínio correto é classificação de aplicações dentro/fora do escopo da task.

### `CategoryChart`
Componente legado do modelo anterior. Não é utilizado pelo `DashboardPage` atual porque categorias de produtividade não fazem parte do RF-27.

### `ReportsAndAgent`
Mantém preferência de atualização automática e informação de exportação. CSV/PDF ficam desabilitados enquanto o contrato de relatório completo não estiver disponível.

## Páginas

### `AuthPage`
Login/Cadastro do gestor com validação local. Sem persistência de credenciais e sem chamada a endpoint inventado.

### `CollaboratorsPage`
Estrutura de equipe e associação por código. Ação de geração depende de API e regras ainda pendentes.

### `TasksPage`
Formulário de task com descrição, serviços/aplicações e espaço para colaboradores. Validação local implementada; persistência bloqueada.

### `SettingsPage`
Jornada semanal e limite de inatividade por colaborador. Persistência depende do backend.

### `ReportsPage`
Filtros por período, colaborador e task e ações CSV/PDF. Exportação permanece bloqueada até contrato compatível com RF-24/RF-25.

### `DashboardPage`
Orquestra o dashboard existente e concentra os hooks/estado que antes estavam em `App.jsx`.
