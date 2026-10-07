# Contratos da API do Frontend

Este documento registra as rotas que o frontend consome e o comportamento implementado pelo cliente HTTP. Os contratos foram conferidos em `src/shared/api/api.js`, `src/shared/api/contracts.js`, `src/shared/api/validators.js` e na API backend atual. Requisitos funcionais descrevem necessidades do produto, mas não comprovam que exista um endpoint correspondente.

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

## Tasks e jornada diária — contratos ausentes

Reinspeção em **07/10/2026** de `backend/app/models.py`, `schemas.py`, `crud.py` e dos routers não encontrou modelo/schema de Task, consulta/criação de Tasks, nem endpoint ou campos de primeiro/último registro diario. A API expõe `GET /activities/realtime` e `GET /dashboard/summary`; nenhum deles fornece os extremos da jornada. `categories` representa classificação de atividade e não e substituto para Tasks. O Agent também não inclui `task_id` no payload de atividade nem recebe comandos de Task.

O frontend não envia chamadas para contratos presumidos. A jornada diária so poderá ser integrada após o backend confirmar endpoint, schema e agrupamento em `America/Sao_Paulo`; o formato ilustrativo e seus impactos estão em [Pendencias](PENDENCIAS.md). `captured_at` enviado pelo Agent como UTC não prova que `date(captured_at)` seja agrupado por Brasília. O `realtime` não deve ser apresentado como entrada/saída.

## Código de associação — ainda sem integração

O backend consultado não fornece `association_code`, `GET /auth/me` ou `GET /manager/association-code`, e o frontend não possui sessão autenticada do gestor. A issue #113 é a dependência para definir e fornecer o contrato; I-01 registra a dependência de autenticação. O estado remoto atual da issue #113 não pôde ser confirmado nesta revisão.

`AssociationCodeCard` é somente uma interface visual e recebe `code`, `loading` e `error` por props. Quando integrado, o valor deverá chegar como string numérica de seis dígitos, validada no limite da API; nenhum contrato, endpoint ou validator de associação foi adicionado sem uma resposta real do backend. O card não faz `fetch` e não usa os filtros analíticos.

## Erros, validação e cancelamento

`api.js` produz `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. O corpo JSON de falhas HTTP é lido para exibir `detail` do FastAPI; sem `detail`, a mensagem usa o status. `type` distingue `client` (4xx), `server` (5xx), `network`, `timeout`, `canceled` e `invalid-response`. Detalhes de validação em lista são resumidos pelas mensagens `msg`; o texto exibido é limitado a 500 caracteres.

O timeout de 15 segundos cobre inclusive a leitura do corpo, e cada chamada aceita `AbortSignal` externo. O cancelamento interrompe a espera do cliente; não garante reversão de uma gravação que o servidor já tenha processado. O cliente também recusa sinais já cancelados antes de chamar `fetch` e resultados recebidos depois do cancelamento; timeout é identificado pela origem interna do cancelamento, não pelo texto do motivo externo.

`shared/api/validators.js` valida as respostas antes de exibi-las. Um `2xx` com formato incompatível é tratado como `invalid-response`. A data de resumo/exportação precisa ser real em `AAAA-MM-DD`; `isIsoDate` também é usado para validar parâmetros HTTP. Campos de texto opcionais aceitam ausência ou nulo, enquanto nomes duplicados e durações negativas ou fora da precisão segura são recusados.

O download aceita apenas `csv`/`pdf`, exige o tipo de conteúdo correspondente mesmo quando o cabeçalho estiver ausente, e `ReportsPage` rejeita blob vazio. Não há cabeçalho de autenticação, cookie de sessão administrado pela aplicação, cache persistente de dados da API nem endpoint criado localmente. O backend também expõe categorias e regras, mas a interface atual não as consome; essas categorias não equivalem a aplicações produtivas de uma task.

## Ao alterar um contrato

Conferir a rota e o schema no backend antes de modificar `shared/api/api.js`; ajustar a validação correspondente em `shared/api/validators.js`; preservar estados de carregamento, vazio e falha; acrescentar regressão apenas para o comportamento novo ou corrigido. Atualizar [Funcionalidades](FUNCIONALIDADES.md) quando a tela mudar, [Pendências](PENDENCIAS.md) quando um bloqueio for resolvido ou surgir, e [Testes](TESTES.md) com a evidência realmente executada. Não tratar descrições de requisitos como prova de um endpoint existente.

Consulte [Arquitetura](ARQUITETURA.md) para as camadas e o fluxo de dados da aplicação.
