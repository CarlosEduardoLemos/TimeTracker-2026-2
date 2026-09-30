# Pendências do frontend e dependências externas

Revisão: **30/09/2026**. `backend/`, `agent/` e a pasta [requisitos](../../requisitos/visao.md) foram consultados somente para leitura. Nenhum contrato externo foi alterado. Os IDs clicáveis em **Problema/requisito** levam às seções de origem em [RN/RF](../../requisitos/requisitos/rn_rf.md), [RNF](../../requisitos/requisitos/rnf.md) ou [critérios de aceite](../../requisitos/requisitos/ca.md). Situação, prioridade, impacto e contrato necessário são conclusões da revisão do código e da API, não texto dos requisitos. Prioridade alta indica risco de acesso, integridade ou bloqueio funcional; média indica lacuna relevante; baixa indica manutenção.

## Resumo das pendências

| ID   | Pendência                                                         | Área                 | Prioridade | Status                     |
| ---- | ----------------------------------------------------------------- | -------------------- | ---------- | -------------------------- |
| B-01 | Autorização dos endpoints e isolamento dos dados                  | Backend              | Alta       | AGUARDANDO BACKEND         |
| B-02 | CORS e HTTPS por ambiente                                         | Backend              | Alta       | AGUARDANDO BACKEND         |
| B-03 | Seed incompatível com chave UUID                                  | Backend              | Alta       | AGUARDANDO BACKEND         |
| B-04 | Limite salvo não aplicado ao realtime                             | Backend              | Média      | PARCIAL; BACKEND PENDENTE  |
| B-05 | Capturas empatadas no realtime                                    | Backend              | Média      | AGUARDANDO BACKEND         |
| B-06 | Reenvio de atividades sem deduplicação                            | Backend              | Alta       | AGUARDANDO BACKEND         |
| B-07 | Datas futuras e tempo relativo negativo                           | Backend              | Média      | AGUARDANDO BACKEND         |
| B-08 | Segurança e fidelidade dos arquivos exportados                    | Backend              | Média      | AGUARDANDO BACKEND         |
| B-09 | Configuração global sem unicidade garantida                       | Backend              | Média      | AGUARDANDO BACKEND         |
| I-01 | Conta, login e sessão do gestor                                   | Integração           | Alta       | BLOQUEADO                  |
| I-02 | Associação gestor–colaborador e código                            | Integração           | Alta       | BLOQUEADO                  |
| I-03 | Tasks, atribuição, escopo e monitoramento consentido              | Integração           | Alta       | BLOQUEADO                  |
| I-04 | Jornada individual e possível hora extra                          | Integração           | Alta       | BLOQUEADO                  |
| I-05 | Conexão real do agente                                            | Integração           | Média      | BLOQUEADO                  |
| I-06 | Dashboard, timeline e relatórios completos                        | Integração           | Alta       | BLOQUEADO                  |
| I-07 | Referência de fuso e virada do dia                                | Integração           | Média      | BLOQUEADO                  |
| I-08 | Teste de integração com serviço real                              | Integração           | Média      | PENDENTE DE AMBIENTE       |
| F-01 | Integração das telas após contratos                               | Frontend             | Alta       | BLOQUEADO                  |
| F-02 | Instalação PWA e política offline                                 | Frontend             | Média      | FRONTEND FUTURO            |
| F-03 | Validação humana e matriz de navegadores                          | Frontend             | Média      | FRONTEND FUTURO            |
| D-01 | Atualizar [responsividade.md](../../requisitos/responsividade.md) | Documentação externa | Baixa      | AGUARDANDO REVISÃO EXTERNA |

Cada ID identifica uma pendência específica para facilitar referências no texto e na ordem de execução. A letra indica a área: `B` = backend, `I` = integração entre frontend e backend, `F` = frontend e `D` = documentação externa. O número distingue os itens da mesma área; não indica prioridade nem status, que aparecem em colunas próprias.

Os status descrevem a dependência atual; a prioridade indica impacto. Eles não indicam que todo o frontend esteja parado.

| Status                         | Significado                                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BLOQUEADO**                  | A funcionalidade não pode ser concluída com os contratos, dados ou ambiente disponíveis no momento. Depende de uma definição ou implementação externa, como autenticação no backend para o login do gestor. |
| **AGUARDANDO BACKEND**         | A correção precisa ser feita ou garantida no servidor, como a autorização dos endpoints.                                                                                                                    |
| **PARCIAL; BACKEND PENDENTE**  | O Agent já consome a configuração, mas a classificação realtime ainda depende de limites próprios do backend.                                                                                               |
| **PENDENTE DE AMBIENTE**       | O cenário de integração está preparado; falta serviço real, banco, origem configurada e dados autorizados para executá-lo.                                                                                  |
| **FRONTEND FUTURO**            | Trabalho previsto para uma etapa posterior do frontend, como instalação PWA ou validação em dispositivos reais.                                                                                             |
| **AGUARDANDO REVISÃO EXTERNA** | Depende da revisão de um documento fora de `FrontEnd/`; neste caso, `requisitos/responsividade.md`.                                                                                                         |

As seções abaixo trazem requisitos, motivo e trabalho necessário para cada ID. O motivo específico aparece em **Motivo do bloqueio** ou **Motivo da pendência**.

## Pendências do backend

### B-01 — Autorização dos endpoints e isolamento dos dados — Alta

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** ausência de autorização; [RN-15](../../requisitos/requisitos/rn_rf.md#rn-15--controle-de-acesso-aos-dados), [RF-23](../../requisitos/requisitos/rn_rf.md#rf-23--consultar-registros), [CA-09](../../requisitos/requisitos/ca.md#ca-09--privacidade-e-segurança) e [escopo de acesso no RBAC](../../requisitos/rbac.md#5-escopo-de-acesso).
- **Frontend afetado:** todas as páginas com dados, especialmente `SettingsPage`, `DashboardPage`, `CollaboratorsPage` e `ReportsPage`.
- **Backend relacionado:** `app/main.py`, routers `users`, `activities`, `dashboard` e `config`.
- **Atual/impacto:** consultas globais e `PUT /config/` sem verificação de gestor permitem leitura e escrita sem identidade validada.
- **Alteração necessária:** impor identidade, permissões e restrição por equipe no servidor, inclusive nas exportações e no recebimento de atividades.
- **Workaround frontend:** não existe para proteção real; avisos informam a limitação, mas não protegem a API.
- **Motivo do bloqueio:** esconder componentes ou filtrar listas localmente não autoriza nem isola dados no servidor. O fluxo visual de acesso está em I-01.

### B-02 — CORS e HTTPS por ambiente — Alta

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** política de origem ampla e transmissão segura ainda dependente da implantação; [RNF-03](../../requisitos/requisitos/rnf.md#rnf-03--comunicação-segura)/[CA-09](../../requisitos/requisitos/ca.md#ca-09--privacidade-e-segurança).
- **Frontend afetado:** `src/shared/api/api.js` e todas as requisições.
- **Backend relacionado:** `app/main.py`, configuração de serviço/reverse proxy externa.
- **Atual/impacto:** `allow_origins=["*"]` com `allow_credentials=True`; origem padrão de desenvolvimento HTTP. O ambiente real não foi validado.
- **Alteração necessária:** definir origens, credenciais e HTTPS por ambiente; fornecer a origem correta para `VITE_API_URL`.
- **Workaround frontend:** configurar a URL já é possível; isso não cria TLS nem corrige CORS no servidor.
- **Motivo do bloqueio:** infraestrutura e política de resposta HTTP estão fora de `FrontEnd`.

### B-03 — Seed incompatível com chave UUID — Alta

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** `seed.py` usa `SystemSettings.id == 1` e insere `id=1`, enquanto o modelo declara UUID; sem RF específico.
- **Frontend afetado:** `SettingsPage`, leitura/gravação de configurações.
- **Backend relacionado:** `seed.py`, `app/models.py`.
- **Atual/impacto:** incompatibilidade identificada por leitura; pode impedir seed/inicialização. Não foi executado seed nem teste de banco.
- **Alteração necessária:** alinhar seed ao tipo/chave e validar inicialização de configurações.
- **Workaround frontend:** apenas mostrar erro e permitir retry; não corrige inicialização.
- **Motivo do bloqueio:** exige edição e validação de código/banco do backend.

### B-04 — Limite salvo não aplicado ao realtime — Média

- **Status:** PARCIAL; BACKEND PENDENTE.
- **Problema/requisito:** configuração editável não governa o cálculo exibido; [RF-14](../../requisitos/requisitos/rn_rf.md#rf-14--controlar-atividade-e-inatividade)/[RF-21](../../requisitos/requisitos/rn_rf.md#rf-21--configurar-limite-de-inatividade).
- **Frontend afetado:** `SettingsPage`, indicadores do painel e tabela de colaboradores.
- **Backend relacionado:** `app/crud.py:get_realtime_view`, `app/utils.py:MAX_IDLE_SECONDS`, `/config/`.
- **Atual/impacto:** o Agent consulta `/config/` e atualiza periodicamente `capture_interval_seconds` e `idle_timeout_seconds`; a classificação realtime do backend ainda usa limites próprios de 5 e 15 minutos. Salvar não altera esses limites de classificação.
- **Alteração necessária:** backend deve aplicar os limites configurados no realtime e validar a propagação; configuração individual depende de I-04.
- **Workaround frontend:** aviso explícito, já presente. Recalcular status localmente não é aceitável.
- **Motivo do bloqueio:** semântica do status e aplicação da configuração pertencem ao servidor/agente.

### B-05 — Capturas empatadas no realtime — Média

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** join pelo maior `captured_at` pode retornar várias entradas do mesmo usuário; [RF-16](../../requisitos/requisitos/rn_rf.md#rf-16--acompanhar-colaboradores-online)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico).
- **Frontend afetado:** `validRealtime`, `useDashboardData`, `CollaboratorsPage`.
- **Backend relacionado:** `app/crud.py:get_realtime_view`.
- **Atual/impacto:** anteriormente o Map escolhia a última entrada pela ordem da resposta; agora a fonte ambígua é rejeitada e anunciada como inválida. Demais fontes continuam disponíveis.
- **Alteração necessária:** desempate determinístico e uma entrada por usuário no servidor.
- **Workaround frontend:** degradação explícita é aceitável como proteção, mas escolher arbitrariamente uma captura não resolve o problema.
- **Motivo do bloqueio:** o frontend não recebe identificador/ordem que permita identificar a leitura correta.

### B-06 — Reenvio de atividades sem deduplicação — Alta

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** ausência de chave de idempotência/unicidade de reenvio; [RF-19](../../requisitos/requisitos/rn_rf.md#rf-19--sincronizar-registros)/[CA-05](../../requisitos/requisitos/ca.md#ca-05--armazenamento-e-sincronização)/[CA-09](../../requisitos/requisitos/ca.md#ca-09--privacidade-e-segurança).
- **Frontend afetado:** total registrado no painel e arquivos de relatório.
- **Backend relacionado:** `ActivityLogCreate`, `create_activity_log`, modelo `ActivityLog`.
- **Atual/impacto:** o Agent usa fila persistente e retry, enquanto cada POST ainda pode inserir uma atividade; reenvios podem duplicar duração agregada.
- **Alteração necessária:** definir identidade do registro e deduplicação servidor/agente com confirmação de sincronização.
- **Workaround frontend:** não existe; remover totais ou deduplicar agregados no navegador perderia dados legítimos.
- **Motivo do bloqueio:** o dashboard recebe agregados sem identidade dos registros originais.

### B-07 — Datas futuras e tempo relativo negativo — Média

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** `captured_at` aceita data fornecida pelo agente sem política para relógio adiantado; [RF-13](../../requisitos/requisitos/rn_rf.md#rf-13--registrar-períodos-de-utilização)/[RF-16](../../requisitos/requisitos/rn_rf.md#rf-16--acompanhar-colaboradores-online)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico).
- **Frontend afetado:** validação de realtime no painel e colaboradores.
- **Backend relacionado:** `ActivityLogCreate`, `create_activity_log`, `get_realtime_view`.
- **Atual/impacto:** cutoff tem apenas limite inferior; captura futura pode produzir `seconds_since_last_activity < 0` e status online inadequado. O frontend rejeita a fonte inválida em vez de exibir segundos negativos.
- **Alteração necessária:** definir tratamento de clock skew e validar/normalizar captura no servidor, sem perder a data legítima do registro.
- **Workaround frontend:** rejeição com erro é proteção aceitável; truncar para zero esconderia o defeito.
- **Motivo do bloqueio:** a origem e a referência temporal devem ser confiáveis no servidor.

### B-08 — Segurança e fidelidade dos arquivos exportados — Média

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** CSV recebe strings diretamente e PDF chama dados de categoria de produtividade; [RF-25](../../requisitos/requisitos/rn_rf.md#rf-25--exportar-relatórios), [RN-19](../../requisitos/requisitos/rn_rf.md#rn-19--visão-gerencial-do-dashboard)/[CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação).
- **Frontend afetado:** downloads em `ReportsPage`.
- **Backend relacionado:** `app/routers/dashboard.py:export_csv/export_pdf`.
- **Atual/impacto:** `csv.writer` faz escape CSV, mas não neutraliza fórmulas de planilha em textos controlados externamente; título do PDF é “Relatorio de Produtividade” embora o conteúdo seja duração por categoria. Riscos identificados por leitura, sem arquivo real gerado.
- **Alteração necessária:** definir neutralização segura de fórmulas no CSV e título coerente com tempo registrado; validar caracteres Unicode no PDF com dados reais.
- **Workaround frontend:** não existe para corrigir o arquivo de origem sem transformá-lo; o frontend valida MIME/tamanho e explica seu escopo parcial.
- **Motivo do bloqueio:** a geração e a semântica do conteúdo são responsabilidade do backend.

### B-09 — Configuração global sem unicidade garantida — Média

- **Status:** AGUARDANDO BACKEND.
- **Problema/requisito:** `SystemSettings` é descrito como linha única, mas possui somente chave UUID; sem RF específico.
- **Frontend afetado:** `SettingsPage`.
- **Backend relacionado:** `app/models.py:SystemSettings`, `app/crud.py:get_settings/update_settings`.
- **Atual/impacto:** leitura usa `.first()` e insere quando não encontra registro. Inicialização concorrente pode criar várias linhas; não há garantia explícita de qual configuração será editada. É uma possibilidade identificada por leitura, não reproduzida no banco.
- **Alteração necessária:** garantir singleton de forma transacional e determinar registro canônico no servidor; também definir limites superiores dos inteiros compatíveis com as colunas do banco, hoje validados apenas com `ge=1` nos schemas.
- **Workaround frontend:** bloquear envios duplicados protege interações locais, mas não concorrência entre clientes nem validação do armazenamento.
- **Motivo do bloqueio:** unicidade, concorrência e limites do banco precisam ser impostos no backend, sem inventar limites de negócio no navegador.

## Pendências de integração Frontend + Backend

As descrições históricas de [Sprint 1](../../requisitos/sprints/sprint1.md), [Sprint 2](../../requisitos/sprints/sprint2.md) e [EP-01](../../requisitos/epicos/EP-01.md) mencionam dados simulados e monitoramento “fingindo” task. Elas não autorizam mocks em produção nesta revisão: prevalecem as restrições do usuário e as regras atuais de [task ativa](../../requisitos/requisitos/rn_rf.md#rn-05--monitoramento-vinculado-à-task) e [ciência do colaborador](../../requisitos/requisitos/rn_rf.md#rn-06--transparência-e-ciência). Existe também divergência entre a [tela de referência do Dashboard](../../requisitos/screens/dashboard.md#8-regras-gerais) (sem métricas de produtividade) e [RN-19](../../requisitos/requisitos/rn_rf.md#rn-19--visão-gerencial-do-dashboard)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico) (tempo produtivo por escopo); I-06 exige esclarecer a apresentação antes da implementação, sem rankings.

### I-01 — Conta, login e sessão do gestor — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-02](../../requisitos/requisitos/rn_rf.md#rf-02--criar-e-acessar-conta-do-gestor)/[RF-23](../../requisitos/requisitos/rn_rf.md#rf-23--consultar-registros) e [CA-01](../../requisitos/requisitos/ca.md#ca-01--identificação-acesso-e-associação) sem contratos de autenticação.
- **Frontend afetado:** `AuthPage`, `App`, cliente HTTP e navegação.
- **Backend relacionado:** routers/schemas atuais não oferecem conta do gestor, login ou sessão.
- **Atual/impacto:** login/cadastro são páginas informativas, sem coleta de credenciais; não há gestor autenticado.
- **Contrato necessário:** definir cadastro, login/logout, sessão, expiração, erros e proteção contra CSRF conforme a estratégia escolhida; servidor aplica B-01.
- **Workaround frontend:** não existe; formulário visual ou senha local não autentica.
- **Motivo do bloqueio:** implementar o fluxo exige identidade verificável e acordo sobre transporte da sessão.

### I-02 — Associação gestor–colaborador e código — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-03](../../requisitos/requisitos/rn_rf.md#rf-03--disponibilizar-código-de-associação)/[RF-04](../../requisitos/requisitos/rn_rf.md#rf-04--associar-colaborador)/[RF-05](../../requisitos/requisitos/rn_rf.md#rf-05--gerenciar-colaboradores-associados), [CA-01](../../requisitos/requisitos/ca.md#ca-01--identificação-acesso-e-associação)/[CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação) e [associação no RBAC](../../requisitos/rbac.md#6-associação).
- **Frontend afetado:** painel, colaboradores, relatórios e futura exibição do código do gestor.
- **Backend relacionado:** `User` e `/users/`; não há modelo gestor/equipe/código.
- **Atual/impacto:** usuários globais; nenhum código ou vínculo real é exibido. Não é possível representar equipe autorizada.
- **Contrato necessário:** código de seis dígitos validado no servidor, associação persistente e consultas restritas ao gestor; definir ciclo de vida/erros do código e do vínculo com o agente.
- **Workaround frontend:** aviso de lista global, já presente; filtro local não é controle de acesso.
- **Motivo do bloqueio:** dados e regras de vínculo não existem na API.

### I-03 — Tasks, atribuição, escopo e monitoramento consentido — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-06](../../requisitos/requisitos/rn_rf.md#rf-06--criar-e-editar-tasks) a [RF-13](../../requisitos/requisitos/rn_rf.md#rf-13--registrar-períodos-de-utilização), [RF-17](../../requisitos/requisitos/rn_rf.md#rf-17--encerrar-ou-trocar-task), [RN-18](../../requisitos/requisitos/rn_rf.md#rn-18--finalidade-e-minimização) e [CA-02](../../requisitos/requisitos/ca.md#ca-02--tasks-e-início-do-monitoramento)/[CA-03](../../requisitos/requisitos/ca.md#ca-03--monitoramento-da-atividade)/[CA-04](../../requisitos/requisitos/ca.md#ca-04--estado-e-execução-da-task).
- **Frontend afetado:** `TasksPage`, painel e relatórios.
- **Backend relacionado:** modelos/schemas/routers não contêm task; atividades não contêm vínculo, início/fim ou classificação de escopo.
- **Atual/impacto:** tela de tasks informa indisponibilidade; API recebe atividade sem exigir task ativa ou ciência. Categorias não equivalem às aplicações produtivas de uma task.
- **Contrato necessário:** persistência/CRUD de tasks, descrição, colaboradores atribuídos, aplicações do escopo, estados, uma task ativa por colaborador e aviso de alterações ao agente antes da aplicação; confirmação de ciência e regras de autorização.
- **Workaround frontend:** não existe; armazenamento local, CRUD fictício ou reaproveitar categorias violaria a regra de negócio.
- **Motivo do bloqueio:** depende do modelo central de monitoramento e de implementação backend/agente.

### I-04 — Jornada individual e possível hora extra — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-20](../../requisitos/requisitos/rn_rf.md#rf-20--configurar-jornada)/[RF-21](../../requisitos/requisitos/rn_rf.md#rf-21--configurar-limite-de-inatividade)/[RF-22](../../requisitos/requisitos/rn_rf.md#rf-22--identificar-possível-hora-extra) e [CA-06](../../requisitos/requisitos/ca.md#ca-06--jornada-e-inatividade).
- **Frontend afetado:** configurações, painel e relatórios.
- **Backend relacionado:** `SystemSettings` tem somente dois inteiros globais; não há jornada individual.
- **Atual/impacto:** formulário global funcional; dias, entrada/saída, intervalo/carga horária e possível hora extra indisponíveis.
- **Contrato necessário:** jornada/limite por colaborador, validações de horários/fuso, propagação ao agente e cálculo de indicação de possível hora extra a partir das tasks.
- **Workaround frontend:** preservar edição global com aviso; cálculo local ou persistência local não são aceitáveis.
- **Motivo do bloqueio:** faltam persistência e registros necessários para comparar jornada e task.

### I-05 — Conexão real do agente — Média

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-05](../../requisitos/requisitos/rn_rf.md#rf-05--gerenciar-colaboradores-associados)/[RF-16](../../requisitos/requisitos/rn_rf.md#rf-16--acompanhar-colaboradores-online)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico) e [CA-04](../../requisitos/requisitos/ca.md#ca-04--estado-e-execução-da-task) exigem Online enquanto conectado/autenticado.
- **Frontend afetado:** métricas de estado e tabela de última atividade.
- **Backend relacionado:** `/activities/realtime`, estados calculados por tempo desde atividade e retenção de até 24 horas.
- **Atual/impacto:** `online` representa atividade recente, `ausente` mais de 5 minutos sem evento e `offline` mais de 15 minutos sem evento. Ausência do usuário na resposta (sem atividade disponível ou além das 24 horas) não comprova desconexão. O Agent existe, mas não há heartbeat/sessão autenticada; a interface explica essa aproximação.
- **Contrato necessário:** definir heartbeat/sessão autenticada, expiração, estados de conexão e sua relação com atividade/inatividade.
- **Workaround frontend:** mostrar última leitura com aviso é aceitável para o contrato atual; inferir conexão real não é.
- **Motivo do bloqueio:** navegador do gestor não observa diretamente a conexão do agente.

### I-06 — Dashboard, timeline e relatórios completos — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** [RF-24](../../requisitos/requisitos/rn_rf.md#rf-24--gerar-relatórios)/[RF-25](../../requisitos/requisitos/rn_rf.md#rf-25--exportar-relatórios)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico) e [CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação)/[CA-10](../../requisitos/requisitos/ca.md#ca-10--dashboard-analítico).
- **Frontend afetado:** `DashboardPage`, `ReportsPage` e visualizações preservadas.
- **Backend relacionado:** `DailySummaryResponse`, `/dashboard/summary`, `/dashboard/export/csv|pdf`.
- **Atual/impacto:** data única, usuário, duração registrada e categoria; CSV/PDF do mesmo resumo. Sem task ativa, período, produtividade, tempo ativo/inativo agregado, jornada ou timeline confiável.
- **Contrato necessário:** consultas autorizadas por período/colaborador/task; aplicações dentro/fora do escopo, períodos de utilização/inatividade e métricas coerentes com jornada. Exportação deve respeitar exatamente os filtros e as permissões.
- **Workaround frontend:** manter resumo/exportação diária, já funcional. Não inventar série, produtividade ou reconstruir períodos a partir de realtime. Rankings/notas/comparações são proibidos pela [RN-19](../../requisitos/requisitos/rn_rf.md#rn-19--visão-gerencial-do-dashboard).
- **Motivo do bloqueio:** fonte agregada atual não fornece os dados e classificações exigidos.

### I-07 — Referência de fuso e virada do dia — Média

- **Status:** BLOQUEADO.
- **Problema/requisito:** significado do filtro diário e períodos da jornada; [RF-20](../../requisitos/requisitos/rn_rf.md#rf-20--configurar-jornada)/[RF-24](../../requisitos/requisitos/rn_rf.md#rf-24--gerar-relatórios)/[RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico).
- **Frontend afetado:** `todayIso`, filtros de data, resumo e exportação.
- **Backend relacionado:** `captured_at` com timezone e `func.date` em `get_daily_summary`.
- **Atual/impacto:** frontend usa dia local do navegador; agregação usa data de captura no banco. Registros perto da meia-noite podem pertencer a outro dia dependendo do ambiente.
- **Contrato necessário:** definir fuso de referência e semântica do parâmetro `date`, armazenamento/agregação e conversão de horários.
- **Workaround frontend:** não existe correção segura sem definição; conferir a data retornada evita apenas resposta de outra consulta.
- **Motivo do bloqueio:** alterar o fuso no navegador unilateralmente não corrige a agregação do banco.

### I-08 — Teste de integração com serviço real — Média

- **Status:** PENDENTE DE AMBIENTE.
- **Problema/requisito:** confirmar CORS, dados e conteúdo de exportação; [CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação)/[CA-09](../../requisitos/requisitos/ca.md#ca-09--privacidade-e-segurança)/[CA-10](../../requisitos/requisitos/ca.md#ca-10--dashboard-analítico).
- **Frontend afetado:** `e2e/real-api.spec.js` e telas com API.
- **Backend relacionado:** FastAPI/banco em execução com dados de teste; origem configurada.
- **Atual/impacto:** há frontend, backend e Agent para um fluxo ponta a ponta; E2E principal intercepta HTTP somente nos testes. O teste real é opt-in e não escreve dados. Ainda falta serviço real, banco, origem configurada e dados autorizados para comprovar integração/arquivos reais.
- **Contrato/alteração necessária:** disponibilizar ambiente de teste autorizado, dados e origem; executar `RUN_REAL_API=1 npm.cmd run test:e2e:real` e conferir CSV/PDF, falhas e reinício. Sem alteração de endpoints.
- **Workaround frontend:** fixtures de teste protegem comportamento do cliente, mas não comprovam a API real.
- **Motivo da pendência:** o ambiente depende de serviço e banco disponíveis e de dados de teste autorizados; executar o cenário requer o ambiente real configurado.

## Pendências futuras do Frontend

### F-01 — Integração das telas após contratos — Alta

- **Status:** BLOQUEADO.
- **Problema/requisito:** implementar UI real para I-01 a I-07; RFs indicados nesses itens.
- **Frontend afetado:** acesso, colaboradores, tasks, configurações, painel, relatórios e testes.
- **Backend relacionado:** contratos ainda ausentes/desalinhados descritos na seção anterior.
- **Atual/impacto:** funcionalidades indisponíveis são informadas sem inputs de persistência fictícia.
- **Definição necessária:** contratos aprovados e disponíveis, regras de erro/validação e dados para testes.
- **Workaround frontend:** não existe para completar a funcionalidade; páginas informativas são aceitáveis enquanto bloqueada.
- **Motivo do bloqueio:** telas, payloads e métricas não podem ser implementados antes das definições reais.

### F-02 — Instalação PWA e política offline — Média

- **Status:** FRONTEND FUTURO.
- **Problema/requisito:** a [visão do produto](../../requisitos/visao.md#1-visão-geral) e a [diretriz de responsividade](../../requisitos/responsividade.md#1-objetivo) chamam a aplicação de Dashboard PWA, sem detalhar instalação/offline.
- **Frontend afetado:** entrada Vite, recursos estáticos e futura configuração de manifest/service worker.
- **Backend relacionado:** política de sessão, cache e acesso a dados sensíveis ainda indefinida.
- **Atual/impacto:** aplicação web responsiva, sem manifest/service worker; não é instalável como PWA.
- **Definição necessária:** decidir instalação, navegadores, cache permitido, atualização e comportamento offline/logout.
- **Workaround frontend:** acesso web atual; não simular dados offline nem persistir dados corporativos como substituto de backend.
- **Motivo do bloqueio:** exige decisão de produto/segurança antes de escolher cache e comportamento offline.

### F-03 — Validação humana e matriz de navegadores — Média

- **Status:** FRONTEND FUTURO.
- **Problema/requisito:** completar usabilidade de [RNF-12](../../requisitos/requisitos/rnf.md#rnf-12--usabilidade) e as [diretrizes de responsividade](../../requisitos/responsividade.md#6-critérios); a [matriz de navegadores ainda está pendente](../../requisitos/requisitos/rnf.md#4-pontos-pendentes).
- **Frontend afetado:** todas as telas, menu, tabelas, filtros e estados de erro.
- **Backend relacionado:** nenhum contrato novo; serviço real é necessário apenas para validação de dados.
- **Atual/impacto:** teclado, larguras, ampliação CSS, orientação horizontal e axe-core automatizados; leitor de tela, zoom nativo e dispositivos reais não comprovados.
- **Definição necessária:** navegadores/largura mínima suportados e acesso a leitor de tela/dispositivos para inspeção humana.
- **Workaround frontend:** testes automatizados existentes são proteção parcial; não equivalem a inspeção humana.
- **Motivo do bloqueio:** definição de suporte e recursos de validação externos não estão disponíveis nesta tarefa.

## Pendência de documentação externa

### D-01 — Atualizar `requisitos/responsividade.md` — Baixa

- **Status:** AGUARDANDO REVISÃO EXTERNA.
- **Problema/requisito:** [responsividade.md](../../requisitos/responsividade.md) ainda cita Vite 5.0.8, Vitest 3.2.4, Recharts 2.10.3 e `src/index.css`. O frontend atual usa Vite 6.4.3, Vitest 4.1.11, não depende de Recharts e mantém os estilos em `src/app/styles/index.css`.
- **Frontend afetado:** leitores que usam o requisito como referência de implementação.
- **Atual/impacto:** o documento externo pode levar à escolha de dependências e caminhos desatualizados; as diretrizes de responsividade continuam como requisito, mas o inventário técnico não reflete o frontend presente.
- **Alteração necessária:** revisar versões, dependências e caminhos no documento de requisitos quando sua manutenção for autorizada. Para o estado atual, consultar [README](../README.md), [Arquitetura](ARQUITETURA.md) e `package.json`.
- **Motivo da pendência:** o arquivo fica fora de `FrontEnd/` e não foi alterado nesta revisão documental.

## Ordem de execução

1. Proteger dados e gravações (B-01/B-02), corrigir integridade e inicialização (B-03 a B-08).
2. Definir identidade/equipe e task/consentimento (I-01 a I-03).
3. Definir jornada, conexão, consultas completas e fuso (I-04 a I-07).
4. Integrar UI e validar serviço real (F-01/I-08), decidir PWA e matriz de suporte (F-02/F-03).
5. Atualizar o inventário técnico do requisito de responsividade (D-01) com os mantenedores de `requisitos/`.
