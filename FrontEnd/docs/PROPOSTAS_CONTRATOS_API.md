# Propostas de contratos para integração Frontend/Backend

Revisão: **13/10/2026**. Este documento complementa [Pendências](PENDENCIAS.md) e [Contratos da API](CONTRATOS_API.md). A inspeção de backend/app/, agent/, requisitos/ e dos documentos existentes foi somente para leitura.

> **Todos os endpoints e schemas apresentados como proposta estão marcados como PROPOSTA — NÃO IMPLEMENTADO.** Os exemplos descrevem contratos candidatos para discussão; não autorizam chamadas no frontend nem alteram o MVP. Não foram criados endpoints funcionais, mocks ou comportamento simulado.

## O que já existe e o que falta

| Área | Contrato observado neste checkout | Lacuna ou incompatibilidade |
| --- | --- | --- |
| Autenticação do gestor | POST /auth/register, POST /auth/login e GET /auth/me. A última rota exige JWT de gestor e retorna id, email e created_at. | A autenticação não está integrada à experiência do frontend aprovada para o MVP. O ManagerOut não inclui código de associação. |
| Colaboradores | GET /users/ retorna todos os usuários como UserOut. | Não exige identidade e não filtra colaboradores por gestor; não existe associação persistida gestor–colaborador nos modelos inspecionados. |
| Atividades e realtime | POST /activities/, GET /activities/realtime, resumo diário e exportações existem. ActivityLogCreate não contém task_id; captured_at aceita datetime opcional. | As rotas de dados não exigem JWT. O realtime não representa entrada/saída diária. O resumo atual agrega duration_seconds por categoria usando date(captured_at). |
| Tasks e atribuição | Não foi encontrado modelo, schema ou router de Tasks. | Não existem criação/consulta/edição persistentes, escopo de aplicações por Task nem atribuição de colaboradores. Categorias atuais não substituem o escopo de uma Task. |
| Associação pelo Agent | O cliente Agent da PR #122 envia POST /associate/ com code, username e hostname; aceita token ou access_token na resposta. | A rota, a validação do código, a persistência do vínculo e a emissão de credencial de Agent não foram encontrados no backend. |
| Fuso horário | O Agent serializa captured_at em UTC. O resumo do backend filtra date(captured_at) sem declarar um fuso. | A data do resumo pode divergir do dia de Brasília; o backend não declara timezone no contrato. |
| Configuração | GET/PUT /config/ usa capture_interval_seconds e idle_timeout_seconds. | A configuração é global e as rotas não exigem identidade. Não é uma configuração de jornada por colaborador. |

## Requisitos e decisões usados

- **Tasks e escopo:** RF-06 e RF-11; RN-03 e RN-04; CA-02 a CA-04; pendência I-03.
- **Associação de colaboradores e código:** RF-03, RF-04 e RF-05; CA-01; RBAC, seção 6; Sprint 2 US-06 e US-08; issues #113 e #114; pendência I-02.
- **Jornada diária e relatórios:** RF-13, RF-19, RF-24 e RF-27; CA-07 e CA-10; pendências I-04 e I-06.
- **Autorização e isolamento:** RN-15, RF-23, CA-09 e RBAC, seção 5; pendência B-01.
- **Data e fuso:** RF-20, RF-24 e RF-27; pendência I-07.
- **Direção da liderança:** o Dashboard deve apresentar horas gastas por Task e não deve apresentar rankings, notas ou comparações de desempenho. Essa regra consta em RN-19 e no alinhamento de I-06 em [Pendências](PENDENCIAS.md). As telas de referência e outras descrições mais amplas precisam ser alinhadas fora de FrontEnd/ quando conflitarem com essa decisão.

## Convenções candidatas

As convenções abaixo também são **PROPOSTA — NÃO IMPLEMENTADO** e precisam ser confirmadas pelo Backend:

- IDs persistidos são UUIDs, seguindo os modelos atuais.
- Erros mantêm o envelope FastAPI atual, por exemplo { "detail": "..." }; não se propõe um novo envelope nesta etapa.
- Para endpoints gerenciais, a identidade vem de Authorization: Bearer <JWT_DO_GESTOR>. O servidor deriva o gestor do token; nunca confia em manager_id enviado pelo browser.
- Respostas de data/hora usam ISO 8601 com offset explícito; registros instantes são serializados em UTC com Z. Datas de calendário são AAAA-MM-DD.
- Erros de escopo não devem revelar a existência de recursos pertencentes a outro gestor. A proposta usa 404 para recurso fora do escopo e 401 para token ausente ou inválido.

## 1. Criar, consultar e gerenciar Tasks

### Necessidade e referência

O RF-06 requer criação e edição pelo Dashboard, descrição, colaboradores e aplicações pertencentes ao escopo. A consulta persistente também é necessária para a tela Tasks. A pendência é I-03. Criar ou editar uma Task não inicia monitoramento: início, encerramento, ciência do colaborador e envio de task_id dependem de contratos próprios do Agent.

### Endpoints — PROPOSTA — NÃO IMPLEMENTADO

| Método | Endpoint candidato | Uso |
| --- | --- | --- |
| GET | /tasks | Listar Tasks pertencentes ao gestor autenticado. |
| POST | /tasks | Criar uma Task persistente. |
| GET | /tasks/{task_id} | Consultar uma Task pertencente ao gestor autenticado. |
| PATCH | /tasks/{task_id} | Editar campos da Task; não inicia monitoramento. |
| PUT | /tasks/{task_id}/scope | Substituir a lista de aplicações do escopo. |

Não se propõe exclusão física. A retenção de registros e o comportamento de arquivamento precisam ser decididos antes de expor exclusão ou estados de ciclo de vida.

### Parâmetros e schemas — PROPOSTA — NÃO IMPLEMENTADO

- task_id: UUID no caminho.
- GET /tasks: sem filtro obrigatório nesta proposta. Paginação, ordenação e filtros por estado ainda precisam ser definidos.
- POST /tasks recebe uma descrição. PATCH aceita a descrição e exige ao menos um campo alterável.
- PUT /tasks/{task_id}/scope substitui o conjunto completo do escopo; não é uma operação incremental.

Requisição de criação:

    {
      "description": "Revisar o relatório mensal"
    }

Requisição de edição:

    {
      "description": "Revisar e publicar o relatório mensal"
    }

Requisição para substituir o escopo:

    {
      "applications": [
        { "process_name": "EXCEL.EXE" },
        { "process_name": "POWERPNT.EXE" }
      ]
    }

Resposta candidata, usada tanto na consulta individual como nos itens da listagem:

    {
      "id": "6e7b94da-5651-46a0-bf28-fcb8f4f14c04",
      "description": "Revisar o relatório mensal",
      "applications": [
        { "process_name": "EXCEL.EXE" },
        { "process_name": "POWERPNT.EXE" }
      ],
      "created_at": "2026-10-13T14:20:00Z",
      "updated_at": "2026-10-13T14:20:00Z"
    }

A resposta de listagem candidata é um array desses objetos. Os nomes e campos acima são **schema proposto — não implementado**.

### Validação, autorização e erros

- A descrição não pode ser vazia após remover espaços. O limite máximo de caracteres deve ser definido e aplicado pelo Backend; não se inventa aqui um limite de negócio.
- Cada item do escopo precisa identificar uma aplicação de modo estável; duplicatas e entradas vazias devem ser rejeitadas. Se a aplicação será identificada por nome de processo, executável, padrão ou outra chave é uma decisão pendente.
- task_id precisa ter formato UUID. O servidor valida que a Task pertence ao gestor autenticado.
- Todas as rotas exigem JWT de gestor e restringem consulta e escrita às Tasks do gestor. IDs enviados pelo browser não concedem acesso.
- 201 na criação; 200 em consulta/edição; 401 sem autenticação; 404 inexistente ou fora do escopo; 409 para conflito de estado (por exemplo, alteração incompatível com uma execução ativa, cuja regra ainda precisa ser acordada); 422 para payload inválido; 5xx para indisponibilidade.

### Impacto no frontend e dependências

TasksPage poderia passar de informativa para CRUD somente após o contrato ser implementado e publicado. O frontend precisaria validar os schemas, apresentar erros de validação e distinguir carregamento, lista vazia e falha. Nenhuma chamada será adicionada nesta proposta.

**Backend:** modelo e migração de Task; schemas; router; relação com gestor; persistência do escopo; regras de transação e histórico. **Agent:** separado deste CRUD; precisa receber lista/escopo e só registrar atividade durante uma execução consentida. **Liderança:** definir identidade e correspondência de aplicações, campos obrigatórios, limite de descrição, arquivamento/exclusão e efeito de alteração de escopo durante uma Task ativa.

## 2. Associar colaboradores às Tasks

### Necessidade e referência

O RF-06 exige atribuição pelo gestor; RF-07 restringe a lista de Tasks do Agent às Tasks do colaborador; RN-04 limita acesso às Tasks atribuídas. A pendência I-03 depende primeiro da associação gestor–colaborador de I-02.

### Endpoints e schemas — PROPOSTA — NÃO IMPLEMENTADO

| Método | Endpoint candidato | Uso |
| --- | --- | --- |
| GET | /tasks/{task_id}/collaborators | Consultar colaboradores atribuídos a uma Task do gestor. |
| PUT | /tasks/{task_id}/collaborators | Substituir o conjunto completo de colaboradores atribuídos. |

Requisição candidata de substituição:

    {
      "collaborator_ids": [
        "d94a4d6c-8542-4c3e-889b-89db302ef4cc",
        "52ba0ef0-0c95-4cbf-b5a8-897b0b93ef27"
      ]
    }

Resposta candidata:

    {
      "task_id": "6e7b94da-5651-46a0-bf28-fcb8f4f14c04",
      "collaborators": [
        {
          "id": "d94a4d6c-8542-4c3e-889b-89db302ef4cc",
          "username": "ana",
          "full_name": "Ana Souza"
        }
      ]
    }

O corpo collaborator_ids e o schema de resposta são **proposta — não implementado**. A lista de opções pode vir de GET /users/ depois que essa rota for protegida e filtrada por gestor; hoje ela é global e aberta.

### Parâmetros, validação, autorização e erros

- task_id e cada item de collaborator_ids são UUIDs.
- A lista deve rejeitar IDs duplicados e colaboradores não associados ao gestor. Se [] remove todas as atribuições ou se é inválido, a liderança precisa definir; a semântica de substituição aqui pressupõe que [] remove todas.
- A associação não pode vincular colaborador de outro gestor, mesmo que o cliente conheça seu UUID.
- O gestor precisa possuir a Task e cada colaborador precisa pertencer à sua equipe. Para o Agent, a autorização da Task deve ser verificada no servidor por credencial própria do colaborador.
- 200 em consulta/substituição; 401 sem JWT; 404 para Task ou colaborador fora do escopo; 409 se uma alteração conflitar com execução ativa; 422 para UUID/lista inválida; 5xx para falha do serviço.

### Impacto no frontend e dependências

O formulário de Task depende de colaboradores carregados com isolamento real; não é seguro usar a resposta global atual de /users/. A interface deve apresentar os associados à Task e tratar falha de carregamento separadamente de lista vazia.

**Backend:** associação gestor–colaborador, relação muitos-para-muitos Task–colaborador, verificação transacional do escopo e proteção da listagem. **Agent:** GET de Tasks disponíveis para o colaborador, seleção/início/fim e tratamento de alterações de atribuição ainda não existem no contrato observado. **Liderança:** definir se uma Task pode ter vários colaboradores, o efeito de remover alguém durante execução e a permissão para lista vazia.

## 3. Primeiro e último registro diário por colaborador

### Necessidade e referência

O painel precisa exibir o primeiro e o último registro do dia sem inferir jornada a partir do realtime. RF-13, RF-24 e RF-27; CA-07 e CA-10; pendências I-06 e I-07.

A pendência I-06 já contém o endpoint ilustrativo e o schema-base abaixo. Esta seção detalha esse rascunho; não cria uma rota confirmada.

### Endpoint e schema — PROPOSTA — NÃO IMPLEMENTADO

**GET /dashboard/attendance?date=AAAA-MM-DD&username=<opcional>**. A resposta candidata:

    {
      "date": "2026-10-13",
      "timezone": "America/Sao_Paulo",
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

O nome do endpoint e os campos date, timezone, users, username, first_activity_at e last_activity_at são **proposta — não implementado**. Os timestamps representam o primeiro e o último captured_at efetivamente persistido no dia de negócio; não confirmam início/fim de jornada nem saída do colaborador.

### Parâmetros, validação, autorização e erros

- date é obrigatório e deve ser uma data válida AAAA-MM-DD; o dia é interpretado no timezone informado na resposta.
- username é opcional, mantém compatibilidade com os filtros atuais e só pode selecionar colaborador associado ao gestor.
- Os timestamps são instantes RFC 3339/ISO 8601 em UTC. Sem registros no dia, os timestamps são null; falha da consulta deve continuar sendo erro HTTP, nunca ser convertida em null.
- O servidor deriva a equipe do JWT do gestor. Não recebe manager_id do cliente.
- 200 com um item por colaborador no escopo consultado; 401 sem autenticação; 404 se o filtro apontar para usuário fora do escopo; 422 para data/filtro malformado; 5xx para indisponibilidade.

### Impacto no frontend e dependências

DashboardPage poderá exibir “Primeiro registro” e “Último registro”. O último não deve ser rotulado como saída definitiva, e dia em andamento não deve ser apresentado como jornada encerrada. A tela precisa distinguir timestamps nulos de erro da fonte e cancelar/repetir consultas conforme os filtros mudem.

**Backend:** agregação min/max(captured_at) com limite diário convertido corretamente, filtro de gestor e resposta com timezone. **Agent:** garantir timestamps consistentes e sincronização sem duplicidades; idempotência pendente em B-06. **Liderança:** confirmar se a resposta inclui todos os colaboradores associados com valores nulos ou somente quem possui registro; a amostra pressupõe todos, e confirmar os rótulos funcionais. A semântica de evento de entrada/saída explícito não está definida.

## 4. Agregação de horas por Task

### Necessidade e referência

RN-19/RF-27 e RF-24 requerem dados por Task e filtros. A direção aprovada pela liderança é apresentar horas gastas por tarefa, sem rankings, notas ou comparação de colaboradores. Pendência I-06. O resumo atual agrupa por categoria e não pode ser reaproveitado como se fosse tempo por Task.

### Endpoint e schema — PROPOSTA — NÃO IMPLEMENTADO

**GET /dashboard/task-hours?start_date=AAAA-MM-DD&end_date=AAAA-MM-DD&username=<opcional>&task_id=<opcional>**.

Resposta candidata:

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

Endpoint, query e todos os campos da resposta são **proposta — não implementado**. total_seconds é um nome candidato para duração agregada de atividade vinculada à Task; a regra exata de inclusão de períodos inativos ou fora do escopo ainda requer aprovação.

### Parâmetros, validação, autorização e erros

- start_date e end_date são obrigatórios, válidos, inclusivos e interpretados no timezone declarado.
- username e task_id são filtros opcionais; cada filtro precisa pertencer ao gestor autenticado. task_id é UUID.
- end_date não pode anteceder start_date. Limite máximo do período deve ser definido no Backend para controlar custo da consulta.
- O backend agrega registros que tenham vínculo persistido com Task. Não deduz task_id por categoria, aplicação, janela ativa ou estado realtime.
- A resposta deve seguir ordem estável por descrição/identificador, nunca ordenar por maior duração para formar ranking. Não incluir pontuação nem comparar desempenho entre colaboradores.
- 200 com tasks: [] para consulta válida sem registros; 401 sem autenticação; 404 para filtro fora do escopo; 422 para período/UUID inválido; 5xx para indisponibilidade.

### Impacto no frontend e dependências

O Dashboard só poderá mostrar horas reais por Task quando cada registro estiver ligado à Task correta e a regra de duração estiver aprovada. A visualização deve respeitar os filtros de período, colaborador e Task; não será criado ranking.

**Backend:** Task e vínculo gestor–colaborador, persistência de task_id nos registros ou em períodos de execução, agregação autorizada e idempotência para evitar duplicidade. **Agent:** seleção/início/fim de Task com ciência do colaborador e envio do identificador correto; o DTO e o payload atuais não têm task_id. **Liderança:** definir se “horas gastas” inclui tempo inativo, atividades fora do escopo e períodos sem atividade, e se Tasks sem registro entram com zero ou são omitidas.

## 5. Consultar código de associação do gestor

### Necessidade e referência

RF-03, CA-01, Sprint 2 US-06, issue #113 e pendência I-02. O Dashboard precisa consultar o código do gestor autenticado. GET /auth/me existe, mas seu ManagerOut não tem association_code; não se deve assumir que o endpoint atual já fornece o código.

### Consulta do código — PROPOSTA — NÃO IMPLEMENTADO

Sugestão de **GET /auth/association-code** com JWT de gestor:

    GET /auth/association-code
    Authorization: Bearer <JWT_DO_GESTOR>

Resposta candidata:

    {
      "code": "012345"
    }

Endpoint e schema são **proposta — não implementado**. code é string de seis algarismos para preservar zeros à esquerda. A resposta não inclui prazo até que validade e rotação sejam definidas.

### Associação do Agent — PROPOSTA — NÃO IMPLEMENTADO

A PR #122 do Agent espera **POST /associate/**, mas o backend inspecionado não declara essa rota. O payload candidato mantém o que o cliente envia:

    {
      "code": "012345",
      "username": "colaborador",
      "hostname": "ESTACAO-01"
    }

Resposta candidata compatível com o cliente:

    {
      "access_token": "<JWT_DO_AGENT>",
      "token_type": "bearer",
      "expires_in": 3600
    }

O endpoint e os schemas de associação são **proposta — não implementado**. O JWT de Agent deve ter audiência/finalidade próprias; não deve ser aceito como JWT de gestor. O Agent atual tolera a propriedade token como alternativa a access_token.

### Parâmetros, validação, autorização e erros

- Consulta do código exige gestor autenticado. A associação aceita o código como prova de vínculo, valida formato de seis algarismos e deve aplicar limite de tentativas.
- O código nunca é enviado como número, para preservar zeros à esquerda.
- A identidade representada por username e hostname precisa ser validada e associada de forma estável. A segurança de depender somente desses campos ainda precisa de análise.
- Para a consulta: 401 sem JWT; 404 ou 409 se não houver código ativo, conforme decisão de produto; 5xx em falha do serviço.
- Para associação: 422 para payload malformado; 404 ou 410 para código inválido/expirado; 409 para vínculo já existente ou conflito; 429 para excesso de tentativas; 5xx em falha. O Agent já mapeia vários desses status como código inválido, mas essa tolerância do cliente não define o contrato do servidor.
- A associação válida deve persistir o vínculo e emitir credencial de Agent. Um código inválido não pode criar usuário, associação ou sessão.

### Impacto no frontend e dependências

O card visual existente permanece fora do MVP e sem chamada de API. Depois de aprovada a sessão de gestor, o frontend poderia chamar o endpoint e tratar código indisponível, erro e cópia. O frontend nunca reutiliza o token do Agent.

**Backend:** campo/entidade para código, geração segura, endpoint autenticado, endpoint /associate/, vínculo persistente e credenciais distintas por tipo de cliente. **Agent:** o cliente já envia o payload indicado e persiste token protegido via DPAPI; precisa alinhar o schema final de resposta com o Backend. **Liderança:** definir geração (cadastro ou sob demanda), expiração, rotação, revogação, reutilização/uso único, limite de tentativas, troca de gestor e identidade duradoura do Agent.

## 6. Autorização e isolamento por gestor

### Necessidade e referência

RN-15, RF-23, CA-09, RBAC seção 5 e pendência B-01. É uma condição transversal para todos os contratos acima. get_current_manager existe e protege somente GET /auth/me; ele não protege automaticamente outros routers.

### Política por rota — PROPOSTA — NÃO IMPLEMENTADO

Não é necessário criar uma rota de autorização separada. A proposta é aplicar autenticação e filtro no servidor a estes recursos gerenciais existentes ou futuros:

- GET /users/, GET /activities/realtime, GET /dashboard/summary, GET /dashboard/export/csv, GET /dashboard/export/pdf;
- GET/PUT /config/ após decidir se a configuração continua global ou passa a ser propriedade do gestor;
- os endpoints de Tasks, atribuições, jornada, registros diários e horas por Task descritos neste documento.

Exemplo de chamada futura a endpoint protegido:

    GET /users/
    Authorization: Bearer <JWT_DO_GESTOR>

Resposta candidata: array de UserOut limitado aos colaboradores associados ao gestor autenticado. O método/rota GET /users/ já existe, mas a exigência de JWT e o filtro por equipe são **proposta — não implementado**.

POST /activities/ é usado pelo Agent e precisa de autenticação de Agent, validação da identidade associada e autorização do vínculo. Não se deve proteger essa rota com o JWT de gestor sem definir um fluxo Agent compatível. Categorias e configuração global também requerem decisão de propriedade antes de receber filtros improvisados.

### Validação, autorização e erros

- O servidor deriva manager_id dos claims validados do JWT; rejeita manager_id fornecido pelo cliente e filtra em toda leitura, escrita e exportação.
- Operações sobre IDs de Task, usuário ou registro verificam o vínculo no banco em cada requisição, inclusive nas relações aninhadas.
- O token de gestor atual tem audiência de gestor. O token de Agent proposto terá audiência distinta e direitos mínimos para a identidade associada.
- 401 para token ausente/inválido/expirado; 403 para identidade autenticada sem a função exigida; 404 para recurso fora do escopo, para não revelar existência; 422 para filtro/payload inválido.
- Exportações e filtros por username, task_id e data são escopos de consulta, nunca mecanismos de autorização.

### Impacto no frontend e dependências

O MVP aprovado segue sem login e as chamadas atuais permanecem inalteradas até a próxima etapa. Antes de integrar sessão, o Backend precisa proteger as rotas e isolar dados; após decisão de produto, o frontend implementaria autenticação, envio de Bearer, expiração, logout e tratamento de 401. O status atual não deve ser descrito como protegido apenas por esconder páginas ou filtrar tabelas localmente.

**Backend:** relações Manager–User–Task–Activity, dependências de autorização nos routers, isolamento nas exportações, testes de acesso cruzado, e decisão sobre /config/ e categorias globais. **Agent:** identidade/autorização própria para associação e atividade. **Liderança:** aprovar estratégia de sessão para etapa posterior ao MVP e confirmar política de configuração global/por gestor e de códigos/credenciais.

## 7. Datas e fusos horários

### Necessidade e referência

RF-20, RF-24, RF-27 e pendência I-07. A liderança definiu Brasília, timezone IANA America/Sao_Paulo, como referência para dia de negócio. Foi registrada a intenção de permitir configuração futura por região; nome e mecanismo da variável de ambiente ainda não foram definidos.

### Regras transversais — PROPOSTA — NÃO IMPLEMENTADO

Não se propõe uma rota exclusiva para fuso. Os endpoints diários e de período deste documento devem devolver o timezone usado no agrupamento. Exemplo:

    GET /dashboard/attendance?date=2026-10-13

    {
      "date": "2026-10-13",
      "timezone": "America/Sao_Paulo",
      "users": []
    }

O endpoint e schema desse exemplo são **proposta — não implementado**, conforme a seção 3. A mesma regra se aplica à agregação por Task da seção 4.

### Parâmetros, validação, autorização e erros

- Datas de filtro são datas de calendário AAAA-MM-DD no timezone configurado pelo Backend, não datas UTC nem o dia local arbitrário do browser.
- Instantes são retornados com offset explícito, preferencialmente UTC com sufixo Z. O timezone identifica a regra de agrupamento e formatação, não altera o instante.
- O Agent já envia captured_at em UTC quando presente. Como proposta, o Backend normaliza instantes com offset para UTC; timestamp sem offset deve ser rejeitado com 422 ou interpretado por regra explícita aprovada. Se captured_at for omitido, o backend atual usa o horário UTC de recebimento.
- O início do dia local deve ser convertido para o instante UTC correspondente antes da consulta; o fim do intervalo deve ser exclusivo no dia seguinte para evitar dupla contagem na fronteira.
- Timezone não reconhecido ou data inválida resulta em 422. Dados fora do escopo seguem 404; falha de consulta permanece 5xx, sem conversão para data vazia.

### Impacto no frontend e dependências

O frontend deve formatar timestamps usando o timezone declarado pela API, e não reagrupar atividades ou corrigir diferença causada por cálculo do servidor. O dia inicial do Dashboard precisa usar a mesma configuração de negócio após sua origem ser confirmada.

**Backend:** configurar timezone IANA e aplicá-lo nas agregações, filtros, exportações e validações; expor o timezone nas respostas diárias. **Agent:** manter timestamps com offset/UTC e evitar relógio local sem zona. **Frontend:** consumir o timezone confirmado para datas e apresentação. **Liderança:** confirmar nome da variável de ambiente, se cada instalação terá um timezone ou se haverá configuração por gestor/região, política para timestamp sem offset e apresentação dos dias históricos em fusos diferentes.

## Dependências externas consolidadas

| Responsável | Dependências para viabilizar os contratos |
| --- | --- |
| Backend | Persistir Tasks, escopo, atribuições, vínculo gestor–colaborador e vínculo de atividades com Task; implementar rotas/schemas; proteger e filtrar por identidade; agregar diário e por Task; aplicar timezone; definir idempotência de atividades e erros. |
| Agent | Consumir associação real e credencial apropriada; listar Tasks autorizadas; exigir ciência antes do monitoramento; enviar task_id e timestamps consistentes; encerrar/trocar execução sem sobreposição. O payload atual de atividade ainda não envia task_id. |
| Liderança/produto | Decidir os itens abertos de semântica, ciclo de vida, associação, duração agregada, sessão, timezone e configuração global abaixo. |
| Frontend, após contratos disponíveis | Integrar somente endpoints e schemas confirmados, com estados de erro/vazio/carregamento. A proposta atual não adiciona chamadas nem muda a apresentação aprovada do MVP. |

## Questões para decisão da liderança

1. Quais campos definem uma Task e qual o limite de descrição? A Task padrão solicitada para a Sprint 2 será seed, configuração ou registro operacional? Como identificar uma aplicação do escopo (nome exato de processo, executável ou regra)? Como arquivar ou excluir Task com histórico?
2. Uma Task aceita vários colaboradores? O que acontece com uma execução ativa ao alterar escopo ou remover colaborador? O Agent deve receber uma atualização pendente de ciência?
3. “Horas gastas por Task” inclui tempo inativo, aplicação fora do escopo e intervalos sem atividade? Tasks sem registro devem aparecer com zero? Manter a listagem sem ordenação por duração atende à decisão de não usar rankings?
4. A consulta diária deve incluir todos os colaboradores associados sem registro, com timestamps nulos, ou apenas colaboradores com eventos? O produto quer apenas primeiro/último registro ou eventos explícitos de entrada e saída?
5. O código de associação expira, é rotativo, reutilizável ou de uso único? Qual o limite de tentativas? username e hostname identificam o Agent de modo suficiente ou é necessário identificador persistente?
6. Qual estratégia de sessão do gestor será usada após o MVP? A configuração global e as categorias permanecem globais ou passam a pertencer a cada gestor?
7. O timezone America/Sao_Paulo vale por instalação ou por gestor? Qual variável de ambiente será adotada? Como tratar captured_at sem offset?
8. Qual política de conflito e de status deve ser usada nos erros 403/404/409 dos endpoints aninhados?

## Arquivos relacionados

- [Pendências](PENDENCIAS.md): IDs I-02, I-03, I-04, I-06, I-07 e B-01; inclui decisões anteriores da liderança e o rascunho de consulta diária.
- [Contratos da API](CONTRATOS_API.md): contratos existentes neste checkout e comportamento atual do cliente HTTP.
- [Requisitos funcionais e regras de negócio](../../requisitos/requisitos/rn_rf.md), [critérios de aceite](../../requisitos/requisitos/ca.md), [RBAC](../../requisitos/rbac.md) e [Sprint 2](../../requisitos/sprints/sprint2.md).
