# Integração frontend–backend

Este documento registra apenas a perspectiva do frontend. Nenhuma definição abaixo altera ou presume implementação do backend.

## Configuração atual

O cliente HTTP existente está em `src/services/api.js`. A URL base usa `VITE_API_URL`, com fallback local para `http://localhost:8000`.

Em produção, a comunicação deve utilizar HTTPS conforme RNF-03.

## Contratos atualmente consumidos

| Método/rota atual | Uso atual |
| --- | --- |
| `GET /dashboard/summary?date=...&username=...` | Resumo diário e série histórica disponível |
| `GET /activities/realtime` | Estado/atividade recente disponível |
| `GET /users/` | Opções atuais de colaborador |

Os contratos acima são legados em relação ao domínio novo e não são suficientes para atender integralmente RF-02, RF-03, RF-05, RF-06, RF-20, RF-21, RF-24, RF-25 e RF-27.

## Dados que o frontend ainda precisa

Os contratos pendentes abaixo não são endpoints implementados. Os contratos
existentes conferidos diretamente nos routers e schemas estão detalhados ao final.

### Autenticação do gestor

O frontend precisa de contrato oficial para:

- criar conta do gestor;
- login;
- sessão/usuário atual;
- logout;
- respostas 401/403.

O frontend não deve armazenar senha em texto puro nem criar sessão fictícia.

### Colaboradores e associação

Necessário:

- listar apenas colaboradores associados ao gestor autenticado;
- gerar código de associação de 6 dígitos;
- informar validade/expiração e regras de reutilização/regeneração.

### Tasks

Necessário fornecer estrutura estável para:

- ID;
- descrição;
- colaboradores associados;
- aplicações/serviços monitorados;
- leitura/criação/edição.

### Jornada e inatividade

Necessário ler/gravar por colaborador:

- dias de trabalho;
- entrada/saída;
- intervalo;
- carga horária ou regra de derivação;
- limite de inatividade.

### Dashboard RF-27

O frontend precisa receber, sob os filtros de período/colaborador/task:

- online/offline;
- tasks ativas;
- tempo ativo/inativo;
- tempo por task;
- possíveis horas extras;
- status atual dos colaboradores;
- Activity Timeline;
- aplicação dentro/fora do escopo.

### Relatórios

A API precisa permitir consulta/exportação coerente com os filtros atuais e produzir dados autorizados para CSV/PDF. O frontend não usa mais a exportação parcial existente como relatório oficial.

## Tratamento de erros esperado no frontend

- loading inicial distinto de refresh;
- `AbortError` não apresentado como falha;
- erro de rede/HTTP com feedback e retry quando aplicável;
- 401 deve direcionar ao fluxo de autenticação quando o contrato existir;
- 403 deve informar falta de permissão sem revelar dados;
- respostas vazias devem gerar empty state, não mocks.

## Contratos verificados no código em 23/09/2026

Todas as chamadas partem de `DashboardPage → useDashboardData → fetchDashboardData`.
Não há body, header Authorization, cookie de sessão configurado ou paginação.
O serviço usa fetch nativo e codifica queries com `encodeURIComponent`.

| Método / endpoint | Query e resposta 200 | Backend e persistência | Consumidor |
| --- | --- | --- | --- |
| GET `/dashboard/summary` | `date` obrigatório AAAA-MM-DD, `username` opcional; `{date: string, users: UserDailySummary[]}` | `routers/dashboard.py:daily_summary` → `crud.get_daily_summary`; ActivityLog JOIN User, LEFT JOIN Category, soma por data/usuário/categoria | ActivityChart recebe sete dias; hook mantém resumo/histórico |
| GET `/activities/realtime` | Sem filtros; `RealtimeEntry[]` | `routers/activities.py:realtime_view` → `crud.get_realtime_view`; última captura por usuário nos últimos 15 minutos | PeopleCard e indicador online; filtro por usuário no navegador |
| GET `/users/` | Sem filtros; `UserOut[]`, ordenado por username | `routers/users.py:list_users` → `crud.list_users`; tabela users | Select do Header, exibindo full_name ou username |

Schemas reais de `backend/app/schemas.py`:

| Tipo | Campos |
| --- | --- |
| `UserDailySummary` | username: string; total_seconds: int; by_category: CategorySummary[] |
| `CategorySummary` | category: string; color: string; total_seconds: int |
| `RealtimeEntry` | username, hostname, process_name: string; window_title, category: string ou null; is_idle: boolean; seconds_since_last_activity: int; status: string (CRUD emite online/ausente) |
| `UserOut` | id: UUID como string; username: string; full_name, department: string ou null; created_at: datetime serializado |

O serviço valida data do resumo, array de usuários, username e inteiro seguro de
total_seconds. Realtime valida username, process_name, online/ausente e inteiro
seguro do tempo. Users valida username e full_name opcional/nulo. Campos extras
são preservados, mas não consumidos automaticamente. São validações dos campos
usados, não uma réplica completa de Pydantic. Não há tipagem estática TypeScript.

HTTP fora de 2xx gera erro com status sem ler/logar corpo sensível. JSON inválido
e timeout também falham. 401/403 seguem tratamento genérico; o redirecionamento
descrito anteriormente permanece futuro. O resumo selecionado é obrigatório;
demais consultas degradam isoladamente. Veja [fluxo de dados](DATA-FLOW.md).

## Endpoints existentes sem consumidor ativo no React

| Métodos / status de sucesso | Endpoint | Contrato e limitação |
| --- | --- | --- |
| POST 201 | `/activities/` | ActivityLogCreate → ActivityLogOut; ingestão do agente |
| GET 200 / POST 201 | `/categories/` | CategoryOut[] / CategoryCreate → CategoryOut |
| GET 200 / POST 200 | `/categories/rules` | CategorizationRuleOut[] / CategorizationRuleCreate → CategorizationRuleOut |
| PUT 200 / DELETE 204 | `/categories/rules/{rule_id}` | Atualização parcial / exclusão sem corpo; 404 quando ausente |
| GET / PUT 200 | `/config/` | capture_interval_seconds e idle_timeout_seconds inteiros ≥ 1; updated_at opcional. Configuração global não equivale à jornada individual |
| GET 200 | `/dashboard/export/csv`, `/dashboard/export/pdf` | date obrigatória, username opcional; arquivo diário por categoria, sem task/período/jornada |
| GET 200 | `/` | Healthcheck com status, service e docs; não utilizado pelo painel |

Exportações já bloqueadas continuam bloqueadas. Nenhuma tela de categorias ou
configuração global foi introduzida. `/users/` global não resolve associação ao gestor.
