# Contratos da API do Frontend

Este documento separa rotas consumidas pelo frontend, possibilidades descritas em requisitos, o endpoint consumido pelo Agent na PR externa #122 e as rotas localizadas no backend deste checkout. A análise da PR usa as informações técnicas fornecidas em 09/10/2026; a PR não está integrada aqui. Requisitos e chamadas de cliente não comprovam implementação do servidor.

## 1. Endpoints consumidos atualmente pelo frontend

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

O frontend não configura autenticação nem envia `Authorization: Bearer`; também não envia cookie de sessão administrado pela aplicação. Não há chamada para associação neste cliente.

## Tasks e jornada diária — contratos ausentes

Reinspeção em **07/10/2026** de `backend/app/models.py`, `schemas.py`, `crud.py` e dos routers não encontrou modelo/schema de Task, consulta/criação de Tasks, nem endpoint ou campos de primeiro/último registro diario. A API expõe `GET /activities/realtime` e `GET /dashboard/summary`; nenhum deles fornece os extremos da jornada. `categories` representa classificação de atividade e não e substituto para Tasks. O Agent também não inclui `task_id` no payload de atividade nem recebe comandos de Task.

O frontend não envia chamadas para contratos presumidos. A jornada diária so poderá ser integrada após o backend confirmar endpoint, schema e agrupamento em `America/Sao_Paulo`; o formato ilustrativo e seus impactos estão em [Pendencias](PENDENCIAS.md). `captured_at` enviado pelo Agent como UTC não prova que `date(captured_at)` seja agrupado por Brasília. O `realtime` não deve ser apresentado como entrada/saída.

## Código de associação — ainda sem integração

### 2. Endpoints previstos nos requisitos/issues

As issues #113 (backend/US-06.1) e #114 (frontend/US-06.2) descrevem geração e consulta autenticada do código e sua exibição. `GET /auth/me` e `GET /manager/association-code` são alternativas citadas para investigação, não caminhos confirmados. A issue #113 permanecia aberta na análise de 09/10/2026. O frontend não implementa essas chamadas.

### 3. Endpoint consumido pelo Agent na PR externa #122

A PR `fabrica-bayarea/TimeTracker-2026-2` #122, commit `ed48ad7cfff9e724406ef9ffffeb6c0f132caf32` (branch `agent/association`), informa o consumo pelo Agent de `POST /associate/`. A rota é configurável no Agent (`Associate = "associate/"`); isso não comprova a existência do endpoint no backend.

Payload enviado pelo Agent, com código como **string** para preservar zeros à esquerda:

```json
{
  "code": "012345",
  "username": "colaborador",
  "hostname": "ESTACAO-01"
}
```

| Campo | Tipo conhecido | Observação |
| --- | --- | --- |
| `code` | string | Código numérico com exatamente seis dígitos; não converter para número. |
| `username` | string | Nome de usuário Windows do colaborador. |
| `hostname` | string | Nome da estação Windows. |

A resposta que o cliente do Agent tenta interpretar contém `token` ou `access_token`; ele escolhe `token ?? access_token` e considera falha uma resposta de sucesso sem token. Isso descreve tolerância do cliente Agent, não um contrato oficial do backend nem suporte confirmado a ambos os nomes. O Agent protege o token local usando DPAPI do usuário Windows e o envia como Bearer em requisições subsequentes. Esse token é credencial do Agent e não deve ser tratado como sessão/JWT do gestor no navegador.

A PR classifica 400, 401, 403, 404, 409, 410 e 422 como possível código inválido/expirado. Essa interpretação é ampla: 401/403 podem representar autenticação/autorização. O backend precisa definir semântica e mensagens por status; o frontend não deve repetir essa classificação nem inferir código inválido a partir de 401/403. Sucesso, falhas, autorização, persistência do vínculo, expiração e isolamento ainda requerem confirmação de servidor.

### 4. Endpoints identificados no backend deste checkout

Na inspeção dos routers atuais, foram identificadas as rotas listadas na primeira tabela (`/users/`, `/activities/realtime`, `/dashboard/*` e `/config/`) e `GET /` para healthcheck. Não foram localizados `POST /associate/`, `association_code`, `GET /auth/me` ou `GET /manager/association-code`. Portanto, não está confirmada no backend a geração/consulta do código, associação, autorização nem persistência do vínculo. Essa inspeção local não afirma nada sobre commits externos que não estejam no checkout.

`AssociationCodeCard` continua sendo apresentação isolada: recebe `code`, `loading` e `error` por props, valida visualmente uma string de seis dígitos e não faz `fetch`. Nenhum endpoint presumido foi adicionado ao cliente de produção.

## Erros, validação e cancelamento

`api.js` produz `ApiError` com `type`, `status`, `statusText`, `detail` e `cause`. O corpo JSON de falhas HTTP é lido para exibir `detail` do FastAPI; sem `detail`, a mensagem usa o status. `type` distingue `client` (4xx), `server` (5xx), `network`, `timeout`, `canceled` e `invalid-response`. Detalhes de validação em lista são resumidos pelas mensagens `msg`; o texto exibido é limitado a 500 caracteres.

O timeout de 15 segundos cobre inclusive a leitura do corpo, e cada chamada aceita `AbortSignal` externo. O cancelamento interrompe a espera do cliente; não garante reversão de uma gravação que o servidor já tenha processado. O cliente também recusa sinais já cancelados antes de chamar `fetch` e resultados recebidos depois do cancelamento; timeout é identificado pela origem interna do cancelamento, não pelo texto do motivo externo.

`shared/api/validators.js` valida as respostas antes de exibi-las. Um `2xx` com formato incompatível é tratado como `invalid-response`. A data de resumo/exportação precisa ser real em `AAAA-MM-DD`; `isIsoDate` também é usado para validar parâmetros HTTP. Campos de texto opcionais aceitam ausência ou nulo, enquanto nomes duplicados e durações negativas ou fora da precisão segura são recusados.

O download aceita apenas `csv`/`pdf`, exige o tipo de conteúdo correspondente mesmo quando o cabeçalho estiver ausente, e `ReportsPage` rejeita blob vazio. Não há cabeçalho de autenticação, cookie de sessão administrado pela aplicação, cache persistente de dados da API nem endpoint criado localmente. O backend também expõe categorias e regras, mas a interface atual não as consome; essas categorias não equivalem a aplicações produtivas de uma task.

## Ao alterar um contrato

Conferir a rota e o schema no backend antes de modificar `shared/api/api.js`; ajustar a validação correspondente em `shared/api/validators.js`; preservar estados de carregamento, vazio e falha; acrescentar regressão apenas para o comportamento novo ou corrigido. Atualizar [Funcionalidades](FUNCIONALIDADES.md) quando a tela mudar, [Pendências](PENDENCIAS.md) quando um bloqueio for resolvido ou surgir, e [Testes](TESTES.md) com a evidência realmente executada. Não tratar descrições de requisitos como prova de um endpoint existente.

Consulte [Arquitetura](ARQUITETURA.md) para as camadas e o fluxo de dados da aplicação.
