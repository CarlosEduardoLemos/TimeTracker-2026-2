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

## Erros, validação e cancelamento

`api.js` produz `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. O corpo JSON de falhas HTTP é lido para exibir `detail` do FastAPI; sem `detail`, a mensagem usa o status. `type` distingue `client` (4xx), `server` (5xx), `network`, `timeout`, `canceled` e `invalid-response`. Detalhes de validação em lista são resumidos pelas mensagens `msg`; o texto exibido é limitado a 500 caracteres.

O timeout de 15 segundos cobre inclusive a leitura do corpo, e cada chamada aceita `AbortSignal` externo. O cancelamento interrompe a espera do cliente; não garante reversão de uma gravação que o servidor já tenha processado. O cliente também recusa sinais já cancelados antes de chamar `fetch` e resultados recebidos depois do cancelamento; timeout é identificado pela origem interna do cancelamento, não pelo texto do motivo externo.

`shared/api/validators.js` valida as respostas antes de exibi-las. Um `2xx` com formato incompatível é tratado como `invalid-response`. A data de resumo/exportação precisa ser real em `AAAA-MM-DD`; `isIsoDate` também é usado para validar parâmetros HTTP. Campos de texto opcionais aceitam ausência ou nulo, enquanto nomes duplicados e durações negativas ou fora da precisão segura são recusados.

O download aceita apenas `csv`/`pdf`, exige o tipo de conteúdo correspondente mesmo quando o cabeçalho estiver ausente, e `ReportsPage` rejeita blob vazio. Não há cabeçalho de autenticação, cookie de sessão administrado pela aplicação, cache persistente de dados da API nem endpoint criado localmente. O backend também expõe categorias e regras, mas a interface atual não as consome; essas categorias não equivalem a aplicações produtivas de uma task.

## Ao alterar um contrato

Conferir a rota e o schema no backend antes de modificar `shared/api/api.js`; ajustar a validação correspondente em `shared/api/validators.js`; preservar estados de carregamento, vazio e falha; acrescentar regressão apenas para o comportamento novo ou corrigido. Atualizar [Funcionalidades](FUNCIONALIDADES.md) quando a tela mudar, [Pendências](PENDENCIAS.md) quando um bloqueio for resolvido ou surgir, e [Testes](TESTES.md) com a evidência realmente executada. Não tratar descrições de requisitos como prova de um endpoint existente.

Consulte [Arquitetura](ARQUITETURA.md) para as camadas e o fluxo de dados da aplicação.
