# Integração frontend–backend

Este documento registra apenas a perspectiva do frontend. Nenhuma definição abaixo altera ou presume implementação do backend.

[Voltar ao README](../README.md).

- [Configuração](#configuração-atual)
- [Contratos consumidos](#contratos-verificados-no-código-em-23092026)
- [Contratos pendentes](#dados-que-o-frontend-ainda-precisa)
- [Endpoints sem consumidor ativo](#endpoints-existentes-sem-consumidor-ativo-no-react)
- [Persistência](#persistência-e-limite-de-responsabilidade)
- [Problemas externos](#problemas-externos)

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
existentes conferidos diretamente nos routers e schemas estão na seção
[Contratos verificados](#contratos-verificados-no-código-em-23092026).

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
demais consultas degradam isoladamente. Veja [fluxo de dados](ARQUITETURA.md#fluxo-de-dados).

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

## Persistência e limite de responsabilidade

O frontend ativo é React/Vite e está em `FrontEnd/src/`. A implementação da API
está em `backend/`, fora desta pasta: FastAPI, schemas Pydantic, SQLAlchemy e
PostgreSQL. Nas auditorias de origem, essa implementação foi consultada somente para leitura.

Routers FastAPI usam `Depends(get_db)`, de `backend/app/database.py`, para
abrir/fechar sessões SQLAlchemy.
`crud.py` consulta `User`, `ActivityLog` e `Category`; regras de categorização e
`SystemSettings` também existem, mas não são consumidas pelo frontend ativo.
UUIDs relacionam usuários, logs, categorias e regras. `main.py` usa `create_all`,
sem migrations versionadas encontradas. Compose define PostgreSQL, API e seed;
o frontend não participa desse Compose. Não foi encontrada configuração CI/CD.

Na leitura de 21/09/2026, Compose usava PostgreSQL 18 e o Dockerfile Python 3.14.
Datas dos modelos têm timezone; IDs UUID e chaves estrangeiras relacionam as entidades.
O agente desktop era previsto nos requisitos e na ingestão, sem implementação
naquele checkout. O seed popula categorias, regras e configurações, não usuários,
atividades, tasks, jornadas ou timeline. Popular o seed não preenche os indicadores RF-27.

Detalhes adicionais dos contratos registrados em 21/09/2026:

- `date` é alias de `target_date` no resumo; `users` é lista, nunca null.
- PUT `/config/` usa defaults 10/300 quando omitidos os campos de captura/inatividade.
- Categorias têm UUID, name e color com default `#6B7280`; não representam tasks.
- Regras usam `category_id`, keyword e match_field `process/title/both`;
  atualização admite campos opcionais/nullable.
- Ingestão recebe username, hostname, process_name, window_title nullable,
  duration_seconds ≥ 0, is_idle false por padrão e captured_at opcional;
  retorna 201 com IDs UUID e captured_at. Aceitar timestamp passado motiva refresh histórico manual.
- Não há contratos de upload, refresh token ou consentimento nas rotas inspecionadas.
  Erros de query são tratados pelo FastAPI; o frontend não expõe seu corpo interno.

<a id="problemas-externos"></a>

## Problemas externos identificados

Revisão estática de 23/09/2026. Nenhum arquivo externo foi alterado. Severidade
considera impacto potencial se a API for exposta; não presume um deploy público.
Não houve execução do banco, seed ou chamadas mutantes à API.

### Crítico — ausência de autenticação e autorização

- **Local:** `backend/app/main.py`, `backend/app/routers/*.py`, `backend/app/crud.py`.
- **Evidência:** handlers dependem apenas de `get_db`; não existe dependência de
  identidade/permissão. `list_users` retorna todos e `get_daily_summary` filtra
  pelo username enviado, sem vínculo ao gestor. Rotas de escrita também são abertas.
- **Impacto:** filtros e botões desabilitados no React não impedem leitura/escrita
  direta nem asseguram isolamento de equipe previsto em RNF-05.
- **Correção sugerida:** definir contrato de autenticação e impor autorização e
  vínculo de equipe no servidor em todas as leituras/escritas relevantes.
- **Arquivos envolvidos:** routers, schemas, models, crud e main; exigirá desenho
  de persistência e migrations fora do escopo. Não simular proteção no frontend.

### Importante — seed de configurações usa inteiro em coluna UUID

- **Local:** `backend/seed.py:run`, `backend/app/models.py:SystemSettings`.
- **Evidência:** filtro `SystemSettings.id == 1` e criação `id=1`; modelo declara
  `Uuid(as_uuid=True)` com default `uuid.uuid7`.
- **Impacto:** caminho de inicialização é incompatível com o tipo e pode impedir
  o seed de concluir; popular categorias não cria usuários/logs/tasks.
- **Correção sugerida:** localizar a configuração pela regra de singleton e
  deixar o default UUID gerar a chave; revisar idempotência do seed.
- **Arquivos envolvidos:** `backend/seed.py`; eventualmente constraints/models
  e migrations para garantir singleton. Falha identificada estaticamente.

### Importante — configuração salva não determina status realtime

- **Local:** `backend/app/crud.py:get_realtime_view`, `update_settings`, `backend/app/utils.py`.
- **Evidência:** realtime compara tempo com `MAX_IDLE_SECONDS`, lido do ambiente;
  PUT `/config/` grava `SystemSettings.idle_timeout_seconds`, não consultado ali.
- **Impacto:** estado calculado pode divergir da configuração persistida. Além
  disso, online/ausente é calculado por recência/is_idle, não pela conexão
  autenticada do agente exigida em RN-11. Usuários sem logs em 15 minutos somem.
- **Correção sugerida:** esclarecer o contrato de conexão versus atividade e
  unificar a fonte de timeout; fornecer estado de equipe completa conforme domínio.
- **Arquivos envolvidos:** crud, utils, schemas, routers de activities/config e
  modelos pertinentes. O frontend preserva online/ausente sem inventar offline.

### Importante — empates e reenvios podem duplicar dados

- **Local:** `backend/app/crud.py:create_activity_log`, `get_realtime_view`; `backend/app/models.py:ActivityLog`.
- **Evidência:** cada POST cria novo UUID, sem chave de idempotência; índice
  `(user_id, captured_at)` não é único. Realtime junta todos os registros iguais
  ao maior timestamp, sem critério de desempate.
- **Impacto:** reenvios podem inflar totais; empates podem gerar duas linhas para
  o mesmo usuário e inflar contagem online/chaves React duplicadas.
- **Correção sugerida:** definir identidade de registro para sincronização e
  seleção determinística da última leitura. Não deduplicar por suposição na UI.
- **Arquivos envolvidos:** models, schemas, crud e router activities, além de
  migrations e contrato do agente quando disponível.

### Importante — contratos de domínio ainda ausentes

- **Local:** `backend/app/models.py`, `schemas.py`, `routers/`; comparação com
  `requisitos/requisitos/rn_rf.md` e `ca.md`.
- **Evidência:** não há gestor/associação/task/jornada/períodos com início/fim e
  escopo. Exportações só têm date/username e totais por categoria; config é global.
- **Impacto:** login, associação, tasks, jornada, timeline e relatório completo
  não podem ser conectados com os contratos atuais.
- **Correção sugerida:** implementar contratos acordados a partir dos requisitos
  existentes; preservar bloqueios explícitos até então.
- **Arquivos envolvidos:** models, schemas, crud, routers, migrations e agente.
  Nenhum nome de endpoint futuro foi presumido nesta auditoria.

### Melhoria — correspondência BOTH não normaliza o alvo

- **Local:** `backend/app/crud.py:categorize`.
- **Evidência:** keyword é convertida para lowercase; process/title também,
  mas BOTH usa fallback `f"{process_name} {window_title}"` sem lowercase.
- **Impacto:** capitalização pode impedir regra válida de casar e alterar
  categoria dos registros/resumos. A escolha da primeira regra não tem order_by.
- **Correção sugerida:** compor BOTH a partir dos alvos normalizados e definir
  prioridade explícita das regras com testes do contrato.
- **Arquivos envolvidos:** crud e testes backend; schemas/models apenas se uma
  prioridade persistida for aprovada no domínio.

### Observações de implantação e dados a confirmar

- `backend/app/main.py` combina CORS wildcard e credentials habilitadas. Não há
  sessão hoje; restringir origens conforme deploy/contrato futuro exige mudança
  externa. CORS não substitui autorização.
- `crud.get_daily_summary` usa `func.date(captured_at)`; frontend seleciona dia
  local. O fuso de sessão PostgreSQL/deploy não foi confirmado. Definir fuso de
  negócio antes de alterar fronteiras de dias (crud/configuração do banco).
- `routers/dashboard.py:export_csv` escreve username/category recebidos sem
  tratamento específico para fórmulas de planilhas; revisar neutralização na
  exportação do servidor antes de disponibilizá-la como relatório. Frontend não
  chama essa rota. Arquivos envolvidos: router dashboard e testes de exportação.
- PDF usa fonte Helvetica sem fonte Unicode incorporada: revisar nomes fora do
  conjunto suportado no router dashboard e dependências/assets de fontes.
- `main.py` usa create_all no startup, sem histórico de migrations; estratégia
  de evolução de schema requer infraestrutura/backend. Docker/banco não foram
  iniciados nesta revisão; configurações operacionais não foram certificadas.

### Complementos da auditoria de 21/09/2026

As severidades originais foram: controle de acesso crítico; contratos ausentes e
CSV condicionado ao conteúdo altos; inatividade, BOTH, empates e definição do dia
médios. A revisão de 23/09 acima reorganizou esses achados por prioridade.

Escape por `csv.writer` não neutraliza fórmulas de planilha em username/category;
sanitizar apenas no cliente não protege consumidores diretos. Ao corrigir BOTH,
avaliar dados já classificados e não só novas regras. Para datas, definir limites
inclusivo/exclusivo e testar meia-noite antes de deslocar dias no cliente.
Categoria, is_idle e duração total não substituem tasks ou timeline histórica.
Não recalcular status ou deduplicar máquinas arbitrariamente para esconder erros
de origem. Esses cenários foram identificados estaticamente, sem testes de invasão,
execução do banco ou certificação de infraestrutura.

O antigo protótipo Blazor nunca forneceu os endpoints do React e foi removido;
o [histórico de refatoração](REFATORACAO.md#limpeza-legado) registra a decisão.
