# Proposta de contratos para o Backend

> **PROPOSTAS — NÃO SÃO CONTRATOS EXISTENTES.** As rotas, schemas, validações e exemplos deste documento são sugestões para discussão e implementação pelo responsável do Backend. A inspeção de `backend/`, `agent/` e `requisitos/` foi somente para leitura. Nenhuma chamada HTTP de produção foi adicionada ao frontend.

Revisão: **13/10/2026**. Este recorte trata de Tasks, jornada diária, horas por Task e conexão do Agent. Consulte também [Contratos existentes](CONTRATOS_API.md), [propostas de integração](PENDENCIAS.md#propostas-de-contratos-de-integracao) e [Pendências](PENDENCIAS.md).

> Este documento registra o recorte histórico de propostas de 13/10/2026. Para evitar contratos divergentes e conteúdo duplicado, consulte [Pendências](PENDENCIAS.md#propostas-de-contratos-de-integracao) como fonte canônica atualizada para CRUD de Tasks, resumo por Task e demais propostas. Nenhuma das rotas candidatas nesta página foi implementada no Backend.

## Situação observada

- O backend deste checkout não declara modelo, schema ou router de Tasks. `ActivityLogCreate` e `ActivityLog` não possuem `task_id`.
- `GET /dashboard/summary` agrega duração por categoria e filtra pela data de `captured_at`; não responde a jornada nem a duração por Task e não declara fuso.
- `GET /activities/realtime` descreve atividade recente. A classificação atual pode retornar `offline` por `is_idle=true`; portanto, não comprova desconexão do Agent.
- Os routers de usuários, atividades e dashboard não exigem autenticação nem isolam dados por gestor. As propostas abaixo dependem da resolução de B-01 antes de uso real.

## Convenções propostas

As respostas de erro mantêm o envelope FastAPI observado (`{"detail":"..."}`). Rotas gerenciais exigiriam JWT de gestor, derivariam a equipe da identidade autenticada e nunca aceitariam `manager_id` como autorização enviada pelo cliente. Datas usam `AAAA-MM-DD`; instantes usam ISO 8601/RFC 3339 com offset explícito, preferencialmente UTC com `Z`. `401` indica identidade ausente ou inválida, `404` recurso inexistente ou fora do escopo, `422` parâmetro/payload inválido e `5xx` falha de serviço. Esses códigos são sugestões, não comportamento do backend atual.

## 1. Tasks — I-03

**Atualização F-04 — 21/10/2026:** a proposta detalhada e vigente em [Pendências](PENDENCIAS.md#propostas-de-contratos-de-integracao) usa `/tasks/` para GET/POST da coleção, alinhada à issue #133 e ao cliente demonstrativo corrigido. A tabela abaixo é o recorte histórico de 13/10 e conserva suas rotas `/tasks` sem barra; ela não descreve o caminho atual do mock nem um contrato de produção publicado.

### Rotas propostas

| Método  | Rota               | Uso proposto                                           |
| ------- | ------------------ | ------------------------------------------------------ |
| `GET`   | `/tasks`           | Lista as Tasks persistidas do gestor autenticado.      |
| `POST`  | `/tasks`           | Cria uma Task persistida.                              |
| `PATCH` | `/tasks/{task_id}` | Altera parcialmente a descrição de uma Task do gestor. |

Não há exclusão nesta proposta. A atribuição de colaboradores e o escopo de aplicações precisam de contratos próprios; a proposta detalhada está em [proposta de atribuição de colaboradores](PENDENCIAS.md#proposta-task-collaborators). Criar ou editar a Task não inicia monitoramento.

### Schemas candidatos

Descrição do corpo de `POST /tasks`:

```json
{
  "description": "Revisar o relatório mensal"
}
```

description é obrigatório e deve permanecer não vazio após remover espaços externos. O limite máximo deve ser definido pelo produto e aplicado no Backend; nenhum valor numérico está confirmado.

Corpo de `PATCH /tasks/{task_id}`: objeto JSON com `description` opcional. Se enviado, deve obedecer à mesma validação do `POST`. O objeto deve conter ao menos um campo alterável; `null`, string vazia e corpo vazio são inválidos. `task_id` deve ser UUID.

Resposta de item, usada por `GET /tasks` (array de itens), `POST` e `PATCH`:

```json
{
  "id": "6e7b94da-5651-46a0-bf28-fcb8f4f14c04",
  "description": "Revisar o relatório mensal",
  "created_at": "2026-10-13T14:20:00Z",
  "updated_at": "2026-10-13T14:20:00Z"
}
```

`id` é UUID; `created_at` e `updated_at` são instantes ISO 8601 com fuso. `GET /tasks` responde `[]` quando a lista válida está vazia. `POST` responde `201`; `PATCH` responde `200`. Erros propostos: `401` sem JWT válido; `404` para ID inexistente ou fora da equipe; `422` para UUID ou corpo inválido; `5xx` para indisponibilidade. `409` só deve ser adotado depois de definida uma regra concreta de conflito com Task em execução.

### Relação com `task_id` nos registros de atividade

Propõe-se incluir `task_id` UUID como chave estrangeira na persistência da atividade e no schema recebido pelo Agent. Cada novo registro produzido durante monitoramento deve carregar a Task selecionada e atribuída ao colaborador. O Agent ainda precisa implementar seleção, início/fim e ciência antes do monitoramento; `task_id` isolado não prova que a execução está ativa nem que houve consentimento.

Registros históricos não devem receber uma Task inferida por categoria, processo, título de janela ou horário. Uma migração deve preservar esses registros sem vínculo. Tornar `task_id` obrigatório para novos eventos requer implantação coordenada entre Backend e Agent, para não rejeitar clientes anteriores; formato de versão/transição permanece em aberto.

## 2. Jornada diária — I-06/I-07

### Rota e resposta propostas

```http
GET /dashboard/attendance?date=2026-10-13&username=ana
```

`date` é obrigatório. `username` é opcional e só pode filtrar colaborador associado ao gestor autenticado. Exemplo de resposta:

```json
{
  "date": "2026-10-13",
  "timezone": "America/Sao_Paulo",
  "as_of": "2026-10-13T19:50:00Z",
  "users": [
    {
      "username": "ana",
      "first_activity_at": "2026-10-13T11:15:00Z",
      "last_activity_at": "2026-10-13T19:42:00Z"
    },
    {
      "username": "bruno",
      "first_activity_at": null,
      "last_activity_at": null
    }
  ]
}
```

O servidor agrupa por dia civil em `America/Sao_Paulo`: converte o início do dia local para UTC e consulta o intervalo semiaberto até o início do dia seguinte. `as_of` é o instante UTC da consulta e permite avaliar se a data selecionada é a data corrente do servidor. Os timestamps de retorno representam primeiro e último registros persistidos, não confirmação de entrada, saída ou jornada cumprida.

### Estados e falhas

- **Sem registro:** resposta válida `200` com `first_activity_at` e `last_activity_at` nulos para aquele colaborador. A decisão sobre incluir todos os colaboradores associados, inclusive quem não registrou atividade, ainda precisa ser confirmada.
- **Dia em andamento:** se `date` for o dia corrente segundo o relógio do servidor em `America/Sao_Paulo` e houver registro, a interface pode identificar o dia como em andamento. `last_activity_at` continua sendo apenas o registro mais recente; não deve ser apresentado como saída definitiva.
- **Fonte indisponível:** falha de rede ou resposta HTTP de erro deve permanecer falha da fonte, com retry na interface. O backend não deve converter erro de consulta em campos nulos nem em lista vazia.
- A semântica para datas futuras e seus erros permanece pendente em B-07; não se presume que data futura signifique “sem registro”.

Erros propostos: `401` sem autenticação válida; `404` para colaborador fora do escopo; `422` para data inválida; `5xx` para indisponibilidade. A resposta deve identificar sempre o fuso efetivamente usado.

## 3. Horas por Task — I-06

Propõe-se uma agregação sem ranking:

```http
GET /dashboard/task-hours?start_date=2026-10-01&end_date=2026-10-13&username=ana
```

`start_date` e `end_date` são obrigatórias, válidas e inclusivas no fuso informado. `username` e `task_id` UUID são filtros opcionais, ambos limitados ao escopo do gestor autenticado. `end_date` não pode anteceder `start_date`.

```json
{
  "start_date": "2026-10-01",
  "end_date": "2026-10-13",
  "timezone": "America/Sao_Paulo",
  "tasks": [
    {
      "task_id": "6e7b94da-5651-46a0-bf28-fcb8f4f14c04",
      "description": "Revisar o relatório mensal",
      "total_seconds": 28800
    }
  ]
}
```

`total_seconds` é a soma proposta da duração dos registros vinculados à Task no intervalo. O que conta como duração (tempo inativo, aplicativo fora do escopo e períodos sem captura) ainda requer decisão de produto e contrato do Agent. A lista deve ter ordenação estável por descrição e ID; não ordenar por duração, comparar pessoas, pontuar ou apresentar ranking. Uma consulta válida sem registros retorna `tasks: []`. O limite máximo do intervalo, inclusão de Tasks com zero duração e tratamento de registro sem `task_id` precisam ser definidos pelo Backend/produto. Erros propostos: `401`, `404` para filtro fora do escopo, `422` para datas/UUID inválidos e `5xx` para indisponibilidade.

## 4. Conexão do Agent separada de `is_idle` — B-10/I-05

Propõe-se expor `GET /agents/status?username=ana`, com filtro opcional por colaborador, resposta por máquina identificada por usuário e hostname:

```json
{
  "agents": [
    {
      "username": "ana",
      "hostname": "ESTACAO-01",
      "last_record_at": "2026-10-13T19:42:00Z",
      "connection_status": "online"
    }
  ]
}
```

Valores candidatos de `connection_status`: `online`, `offline` ou `unknown`. Regra acordada pela liderança: `offline` somente quando decorrerem **mais de 15 minutos (900 segundos)** sem novo registro salvo para aquela máquina; até 900 segundos, `online`. Sem qualquer registro para identificar atividade recente, usar `unknown` até decisão de produto. A falha da própria consulta é erro HTTP/rede, não `unknown`.

`is_idle` descreve inatividade de uso e não altera `connection_status`. Para que eventos antigos sincronizados posteriormente não mudem o relógio de conexão, `last_record_at` deve refletir o instante de recebimento/persistência no servidor, não apenas `captured_at` do relógio do Agent; o modelo atual não expõe esse instante separadamente. A autenticação da máquina, a autorização para receber atividade e o vínculo gestor–colaborador são dependências de B-01/I-05. Se houver mais de um Agent por colaborador, a forma de resumir os estados por pessoa na interface também precisa ser definida.

## Ampliação das propostas por dependência

Revisão documental em 21/10/2026. Os itens abaixo permanecem **PROPOSTA — NÃO IMPLEMENTADO**. A especificação detalhada dos critérios, exemplos, códigos de erro e decisões em aberto fica centralizada nos IDs correspondentes em [Pendências](PENDENCIAS.md#propostas-de-contratos-de-integracao); esta seção resume motivação, impacto entre componentes, riscos e validação para facilitar uma revisão conjunta.

### Tasks, atribuições e remoção

- **Problema e motivação:** o Frontend só possui CRUD volátil de demonstração; sem persistência e escopo de gestor, uma lista de Tasks não é compartilhável nem autorizada. Excluir uma Task pode invalidar registros históricos e atribuições ativas.
- **Contrato candidato:** GET/POST /tasks/ para coleção; GET/PUT/DELETE /tasks/{task_id} para um item; as rotas exigem identidade do gestor e filtram pelo seu escopo. A proposta principal inclui collaborator_ids no POST/PUT; rotas separadas de atribuição são uma alternativa, não devem coexistir como contratos duplicados. Arquivamento pode substituir exclusão física se o histórico exigir retenção.
- **Justificativa e efeitos:** o Frontend já possui formulário, lista, validação e estados de erro; o Backend precisa persistir Task, escopo e relações; o Agent precisa consultar somente as Tasks atribuídas e lidar com mudanças de atribuição. Nenhuma operação de CRUD deve iniciar monitoramento.
- **Riscos e alternativas:** IDs conhecidos não podem conceder acesso cruzado; lista vazia, edição durante execução, arquivamento e exclusão exigem decisão de produto. Alternativas: atribuições no payload integral ou recurso separado; arquivar ou excluir após avaliar retenção.
- **Aceite e testes:** provar isolamento entre dois gestores, UUID/payload inválido, conflito com execução ativa, lista vazia e remoção de Task com registros vinculados; API responde 401/404/409/422 conforme regra aprovada. Manter a tela de produção desabilitada até essa validação.
- **Rastreabilidade:** issues #129/#130/#133/#134/#135, requisitos RF-06 a RF-11 e I-03; proposta detalhada em [CRUD e atribuições](PENDENCIAS.md#proposta-tasks-crud).

### Associação gestor–colaborador e identidade do Agent

- **Problema e motivação:** a PR #122 implementa o cliente de associação do Agent, mas o Backend não possui código, rota, vínculo ou emissão de credencial própria. O gestor também precisa consultar o código sem confundi-lo com seu JWT.
- **Contrato candidato:** GET /auth/association-code autenticado por JWT do gestor; POST /associate/ recebe code como string, username e hostname, persiste o vínculo e emite um token de Agent com audiência/finalidade próprias. A resposta sugerida usa access_token, token_type e expires_in, respeitando a tolerância do Agent atual.
- **Justificativa e efeitos:** o Frontend pode então mostrar o código real e filtrar a equipe; o Backend controla geração, expiração, tentativas e uso; o Agent já envia o código e protege o token com DPAPI. O token de gestor não deve ser aceito como identidade do Agent, nem o token do Agent como identidade do gestor.
- **Riscos e alternativas:** decidir validade, rotação, uso único, revogação, limite de tentativas e se username/hostname bastam como identidade durável. Códigos numéricos devem ser tratados como texto para preservar zeros à esquerda.
- **Aceite e testes:** associação válida cria exatamente um vínculo e credencial de Agent; código inválido/expirado/consumido não cria registro; testar 401/404/409/410/422/429, reuso, concorrência, isolamento entre gestores e persistência protegida no Agent.
- **Rastreabilidade:** issues #105/#106/#113–#116, RF-03/RF-04/RF-05, CA-01 e I-02; propostas em [código e associação](PENDENCIAS.md#proposta-association-code).

### Autorização, sessão e expiração

- **Problema e motivação:** as rotas de dados atuais não verificam JWT nem filtram por gestor. A guarda React e o Bearer que o cliente envia não protegem dados no servidor.
- **Contrato candidato:** as rotas de leitura/escrita gerenciais exigem JWT de gestor e derivam manager_id exclusivamente do token validado. POST /activities/ usa identidade de Agent e escopo mínimo separado. 401 indica credencial ausente/inválida/expirada; 404 pode ocultar recurso fora do escopo; 403 fica para papel sem permissão.
- **Justificativa e efeitos:** o Frontend mantém seus guards e trata 401 limpando a sessão, mas autorização efetiva pertence ao Backend. O Agent deve preservar sua fila e solicitar reassociação/renovação conforme regra explícita. Não há refresh token nem revogação confirmados.
- **Riscos e alternativas:** ainda é decisão se a sessão web permanece em sessionStorage ou migra a cookie HttpOnly com proteção CSRF; adicionar refresh sem rotação/revogação seria insuficiente. Rejeitar manager_id enviado pelo cliente e testar relações aninhadas em cada rota.
- **Aceite e testes:** duas contas de gestores não podem ler/escrever dados uma da outra; testar token ausente, inválido, expirado, token de audiência errada, 403/404, logout, 401 no Frontend e recuperação do Agent sem perda de fila.
- **Rastreabilidade:** issues #131/#137/#138/#139, RN-15/RNF-04/RNF-05, B-01/I-01 e [proposta de autorização](PENDENCIAS.md#proposta-authorization).

### Sincronização de atividades, TaskId, jornada e fuso

- **Problema e motivação:** ActivityLogCreate não contém task_id e captured_at isoladamente não define a data de negócio em Brasília. Reenvios da fila também podem duplicar eventos; realtime não representa entrada/saída.
- **Contrato candidato:** incluir um identificador de evento idempotente e task_id conforme estado de execução acordado; expor consultas diárias de primeiro/último registro e resumo por Task com date, timezone IANA America/Sao_Paulo, filtros autorizados e duração definida. O primeiro/último registro deve ser descrito como leitura capturada, não como jornada formal, até haver eventos explícitos.
- **Justificativa e efeitos:** o Agent persiste IDs na fila e reenvia com segurança; o Backend deduplica e agrupa eventos por limites do dia no timezone escolhido; o Frontend apresenta carregamento, vazio, falha parcial e valores retornados sem inferir dados.
- **Riscos e alternativas:** duração pode incluir inatividade, apps fora do escopo ou lacunas de captura; a liderança precisa decidir. Intervalo de datas, tarefa removida, atividade sem Task e resposta para Task sem registros também precisam de definição.
- **Aceite e testes:** reenviar o mesmo evento não duplica duração; atravessar meia-noite de São Paulo não duplica nem perde evento; validar data inválida/futura, task_id ausente/removido, Task sem atividade, consulta parcial e diferença entre erro e lista vazia.
- **Rastreabilidade:** issues #107/#117/#118/#136/#140, RF-12/RF-13/RF-19/RF-24/RF-27, B-06 e I-06/I-07; propostas em [jornada](PENDENCIAS.md#proposta-attendance), [horas por Task](PENDENCIAS.md#proposta-task-hours) e [fuso horário](PENDENCIAS.md#proposta-timezone).

### Erros, remoção, homologação e observabilidade

- **Problema e motivação:** contratos ausentes podem gerar tratamentos divergentes no Frontend/Backend/Agent; sem ambiente de homologação, testes com mocks não provam integração, autorização ou transporte seguro.
- **Contrato candidato:** manter o envelope FastAPI { "detail": "..." } para erros observados e padronizar 401/403/404/409/410/422/429/5xx por operação. Documentar comportamento após exclusão/arquivamento de Task, expiracão de token e retry de evento.
- **Justificativa e efeitos:** o Frontend já transforma status HTTP em erros tipados e diferencia resposta vazia; o Backend deve tornar mensagens previsíveis sem expor dados de outro gestor; o Agent precisa distinguir erro transitório de credencial rejeitada e conservar a fila offline.
- **Riscos e alternativas:** não converter falha HTTP em lista vazia, nem tratar 403 como token expirado sem contrato; logs não devem conter senha, JWT ou título de janela desnecessário. Homologação usa conta descartável e rede autorizada.
- **Aceite e testes:** matriz de status por endpoint, testes negativos de autorização, retry/idempotência, verificação de logs sem segredo, HTTPS e E2E entre Frontend/Backend/Agent em ambiente de homologação; registrar ambiente, commit, comando e resultado.
- **Rastreabilidade:** issues #118/#137/#139/#141, B-01/B-06/I-08 e itens relacionados em [Pendências](PENDENCIAS.md).

## Rastreabilidade e questões para confirmação

| Proposta                               | Pendências relacionadas      | Requisitos relacionados                                              |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Tasks, edição e `task_id` em atividade | I-03, B-01, B-06             | RN-03, RN-04, RN-05, RN-09, RN-15; RF-06, RF-07, RF-08, RF-13, RF-23 |
| Jornada diária e fuso                  | I-06, I-07, I-04, B-01, B-07 | RN-09, RN-13, RN-14, RN-19; RF-13, RF-20, RF-22, RF-24, RF-27        |
| Horas agregadas por Task, sem ranking  | I-06, I-03, B-01, B-06       | RN-03, RN-05, RN-08, RN-09, RN-19; RF-06, RF-13, RF-24, RF-27        |
| Conexão do Agent                       | B-10, I-05, B-01, B-06       | RN-10, RN-11, RN-15; RF-14, RF-15, RF-16, RF-23                      |

Antes de implementação, Backend e liderança precisam confirmar: limite máximo da descrição; quais campos adicionais tornam uma Task pronta para atribuição; a implantação coordenada de `task_id`; inclusão de usuários sem registro na resposta diária; semântica para datas futuras; a definição de duração por Task; a identidade persistente do Agent; e o tratamento de um colaborador com vários Agents. As decisões pendentes permanecem abertas em [PENDENCIAS.md](PENDENCIAS.md). A tabela não marca nenhuma dependência como resolvida.
