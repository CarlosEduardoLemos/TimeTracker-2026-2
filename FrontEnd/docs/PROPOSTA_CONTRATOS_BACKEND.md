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

## Rastreabilidade e questões para confirmação

| Proposta                               | Pendências relacionadas      | Requisitos relacionados                                              |
| -------------------------------------- | ---------------------------- | -------------------------------------------------------------------- |
| Tasks, edição e `task_id` em atividade | I-03, B-01, B-06             | RN-03, RN-04, RN-05, RN-09, RN-15; RF-06, RF-07, RF-08, RF-13, RF-23 |
| Jornada diária e fuso                  | I-06, I-07, I-04, B-01, B-07 | RN-09, RN-13, RN-14, RN-19; RF-13, RF-20, RF-22, RF-24, RF-27        |
| Horas agregadas por Task, sem ranking  | I-06, I-03, B-01, B-06       | RN-03, RN-05, RN-08, RN-09, RN-19; RF-06, RF-13, RF-24, RF-27        |
| Conexão do Agent                       | B-10, I-05, B-01, B-06       | RN-10, RN-11, RN-15; RF-14, RF-15, RF-16, RF-23                      |

Antes de implementação, Backend e liderança precisam confirmar: limite máximo da descrição; quais campos adicionais tornam uma Task pronta para atribuição; a implantação coordenada de `task_id`; inclusão de usuários sem registro na resposta diária; semântica para datas futuras; a definição de duração por Task; a identidade persistente do Agent; e o tratamento de um colaborador com vários Agents. As decisões pendentes permanecem abertas em [PENDENCIAS.md](PENDENCIAS.md). A tabela não marca nenhuma dependência como resolvida.
