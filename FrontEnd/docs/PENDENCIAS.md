# Pendências do frontend e dependências externas

Revisão: **26/09/2026**. `backend/` e `requisitos/` foram consultados somente para leitura. Nenhum contrato foi alterado. Os itens abaixo distinguem correções do servidor, integração das equipes e trabalho futuro no frontend. Prioridade alta indica risco de acesso, integridade ou bloqueio funcional; média indica lacuna relevante; baixa indica manutenção.

## Pendências do backend

### B-01 — Autorização dos endpoints e isolamento dos dados — Alta

- **Problema/requisito:** ausência de autorização; RN-15, RF-23, CA-09.
- **Frontend afetado:** todas as páginas com dados, especialmente `SettingsPage`, `DashboardPage`, `CollaboratorsPage` e `ReportsPage`.
- **Backend relacionado:** `app/main.py`, routers `users`, `activities`, `dashboard` e `config`.
- **Atual/impacto:** consultas globais e `PUT /config/` sem verificação de gestor permitem leitura e escrita sem identidade validada.
- **Alteração necessária:** impor identidade, permissões e restrição por equipe no servidor, inclusive nas exportações e no recebimento de atividades.
- **Workaround frontend:** não existe para proteção real; avisos informam a limitação, mas não protegem a API.
- **Motivo do bloqueio:** esconder componentes ou filtrar listas localmente não autoriza nem isola dados no servidor. O fluxo visual de acesso está em I-01.

### B-02 — CORS e HTTPS por ambiente — Alta

- **Problema/requisito:** política de origem ampla e transmissão segura ainda dependente da implantação; RNF-03/CA-09.
- **Frontend afetado:** `src/services/api.js` e todas as requisições.
- **Backend relacionado:** `app/main.py`, configuração de serviço/reverse proxy externa.
- **Atual/impacto:** `allow_origins=["*"]` com `allow_credentials=True`; origem padrão de desenvolvimento HTTP. O ambiente real não foi validado.
- **Alteração necessária:** definir origens, credenciais e HTTPS por ambiente; fornecer a origem correta para `VITE_API_URL`.
- **Workaround frontend:** configurar a URL já é possível; isso não cria TLS nem corrige CORS no servidor.
- **Motivo do bloqueio:** infraestrutura e política de resposta HTTP estão fora de `FrontEnd`.

### B-03 — Seed incompatível com chave UUID — Alta

- **Problema/requisito:** `seed.py` usa `SystemSettings.id == 1` e insere `id=1`, enquanto o modelo declara UUID; sem RF específico.
- **Frontend afetado:** `SettingsPage`, leitura/gravação de configurações.
- **Backend relacionado:** `seed.py`, `app/models.py`.
- **Atual/impacto:** incompatibilidade identificada por leitura; pode impedir seed/inicialização. Não foi executado seed nem teste de banco.
- **Alteração necessária:** alinhar seed ao tipo/chave e validar inicialização de configurações.
- **Workaround frontend:** apenas mostrar erro e permitir retry; não corrige inicialização.
- **Motivo do bloqueio:** exige edição e validação de código/banco do backend.

### B-04 — Limite salvo não aplicado ao realtime — Média

- **Problema/requisito:** configuração editável não governa o cálculo exibido; RF-14/RF-21.
- **Frontend afetado:** `SettingsPage`, indicadores do painel e tabela de colaboradores.
- **Backend relacionado:** `app/crud.py:get_realtime_view`, `app/utils.py:MAX_IDLE_SECONDS`, `/config/`.
- **Atual/impacto:** GET/PUT persiste valores globais, mas realtime usa constante do processo. Salvar não altera esse cálculo.
- **Alteração necessária:** backend/agente devem usar a configuração aplicável e testar sua propagação; configuração individual depende de I-04.
- **Workaround frontend:** aviso explícito, já presente. Recalcular status localmente não é aceitável.
- **Motivo do bloqueio:** semântica do status e aplicação da configuração pertencem ao servidor/agente.

### B-05 — Capturas empatadas no realtime — Média

- **Problema/requisito:** join pelo maior `captured_at` pode retornar várias entradas do mesmo usuário; RF-16/RF-27.
- **Frontend afetado:** `validRealtime`, `useDashboardData`, `CollaboratorsPage`.
- **Backend relacionado:** `app/crud.py:get_realtime_view`.
- **Atual/impacto:** anteriormente o Map escolhia a última entrada pela ordem da resposta; agora a fonte ambígua é rejeitada e anunciada como inválida. Demais fontes continuam disponíveis.
- **Alteração necessária:** desempate determinístico e uma entrada por usuário no servidor.
- **Workaround frontend:** degradação explícita é aceitável como proteção, mas escolher arbitrariamente uma captura não resolve o problema.
- **Motivo do bloqueio:** o frontend não recebe identificador/ordem que permita identificar a leitura correta.

### B-06 — Reenvio de atividades sem deduplicação — Alta

- **Problema/requisito:** ausência de chave de idempotência/unicidade de reenvio; RF-19/CA-05/CA-09.
- **Frontend afetado:** total registrado no painel e arquivos de relatório.
- **Backend relacionado:** `ActivityLogCreate`, `create_activity_log`, modelo `ActivityLog`.
- **Atual/impacto:** cada POST insere uma atividade; reenvios podem duplicar duração agregada.
- **Alteração necessária:** definir identidade do registro e deduplicação servidor/agente com confirmação de sincronização.
- **Workaround frontend:** não existe; remover totais ou deduplicar agregados no navegador perderia dados legítimos.
- **Motivo do bloqueio:** o dashboard recebe agregados sem identidade dos registros originais.

### B-07 — Datas futuras e tempo relativo negativo — Média

- **Problema/requisito:** `captured_at` aceita data fornecida pelo agente sem política para relógio adiantado; RF-13/RF-16/RF-27.
- **Frontend afetado:** validação de realtime no painel e colaboradores.
- **Backend relacionado:** `ActivityLogCreate`, `create_activity_log`, `get_realtime_view`.
- **Atual/impacto:** cutoff tem apenas limite inferior; captura futura pode produzir `seconds_since_last_activity < 0` e status online inadequado. O frontend rejeita a fonte inválida em vez de exibir segundos negativos.
- **Alteração necessária:** definir tratamento de clock skew e validar/normalizar captura no servidor, sem perder a data legítima do registro.
- **Workaround frontend:** rejeição com erro é proteção aceitável; truncar para zero esconderia o defeito.
- **Motivo do bloqueio:** a origem e a referência temporal devem ser confiáveis no servidor.

### B-08 — Segurança e fidelidade dos arquivos exportados — Média

- **Problema/requisito:** CSV recebe strings diretamente e PDF chama dados de categoria de produtividade; RF-25, RN-19/CA-07.
- **Frontend afetado:** downloads em `ReportsPage`.
- **Backend relacionado:** `app/routers/dashboard.py:export_csv/export_pdf`.
- **Atual/impacto:** `csv.writer` faz escape CSV, mas não neutraliza fórmulas de planilha em textos controlados externamente; título do PDF é “Relatorio de Produtividade” embora o conteúdo seja duração por categoria. Riscos identificados por leitura, sem arquivo real gerado.
- **Alteração necessária:** definir neutralização segura de fórmulas no CSV e título coerente com tempo registrado; validar caracteres Unicode no PDF com dados reais.
- **Workaround frontend:** não existe para corrigir o arquivo de origem sem transformá-lo; o frontend valida MIME/tamanho e explica seu escopo parcial.
- **Motivo do bloqueio:** a geração e a semântica do conteúdo são responsabilidade do backend.

### B-09 — Configuração global sem unicidade garantida — Média

- **Problema/requisito:** `SystemSettings` é descrito como linha única, mas possui somente chave UUID; sem RF específico.
- **Frontend afetado:** `SettingsPage`.
- **Backend relacionado:** `app/models.py:SystemSettings`, `app/crud.py:get_settings/update_settings`.
- **Atual/impacto:** leitura usa `.first()` e insere quando não encontra registro. Inicialização concorrente pode criar várias linhas; não há garantia explícita de qual configuração será editada. É uma possibilidade identificada por leitura, não reproduzida no banco.
- **Alteração necessária:** garantir singleton de forma transacional e determinar registro canônico no servidor; também definir limites superiores dos inteiros compatíveis com as colunas do banco, hoje validados apenas com `ge=1` nos schemas.
- **Workaround frontend:** bloquear envios duplicados protege interações locais, mas não concorrência entre clientes nem validação do armazenamento.
- **Motivo do bloqueio:** unicidade, concorrência e limites do banco precisam ser impostos no backend, sem inventar limites de negócio no navegador.

## Pendências de integração Frontend + Backend

As descrições históricas de Sprint 1/2 e EP-01 mencionam dados simulados e monitoramento “fingindo” task. Elas não autorizam mocks em produção nesta revisão: prevalecem as restrições do usuário e os RFs atuais, que exigem task ativa e ciência. Existe também divergência entre `screens/dashboard.md` (sem métricas de produtividade) e RN-19/RF-27 (tempo produtivo por escopo); I-06 exige esclarecer a apresentação antes da implementação, sem rankings.

### I-01 — Conta, login e sessão do gestor — Alta

- **Problema/requisito:** RF-02/RF-23 e CA-01 sem contratos de autenticação.
- **Frontend afetado:** `AuthPage`, `App`, cliente HTTP e navegação.
- **Backend relacionado:** routers/schemas atuais não oferecem conta do gestor, login ou sessão.
- **Atual/impacto:** login/cadastro são páginas informativas, sem coleta de credenciais; não há gestor autenticado.
- **Contrato necessário:** definir cadastro, login/logout, sessão, expiração, erros e proteção contra CSRF conforme a estratégia escolhida; servidor aplica B-01.
- **Workaround frontend:** não existe; formulário visual ou senha local não autentica.
- **Motivo do bloqueio:** implementar o fluxo exige identidade verificável e acordo sobre transporte da sessão.

### I-02 — Associação gestor–colaborador e código — Alta

- **Problema/requisito:** RF-03/RF-04/RF-05 e CA-01/CA-07.
- **Frontend afetado:** painel, colaboradores, relatórios e futura exibição do código do gestor.
- **Backend relacionado:** `User` e `/users/`; não há modelo gestor/equipe/código.
- **Atual/impacto:** usuários globais; nenhum código ou vínculo real é exibido. Não é possível representar equipe autorizada.
- **Contrato necessário:** código de seis dígitos validado no servidor, associação persistente e consultas restritas ao gestor; definir ciclo de vida/erros do código e do vínculo com o agente.
- **Workaround frontend:** aviso de lista global, já presente; filtro local não é controle de acesso.
- **Motivo do bloqueio:** dados e regras de vínculo não existem na API.

### I-03 — Tasks, atribuição, escopo e monitoramento consentido — Alta

- **Problema/requisito:** RF-06 a RF-13, RF-17, RN-18 e CA-02/CA-03/CA-04.
- **Frontend afetado:** `TasksPage`, painel e relatórios.
- **Backend relacionado:** modelos/schemas/routers não contêm task; atividades não contêm vínculo, início/fim ou classificação de escopo.
- **Atual/impacto:** tela de tasks informa indisponibilidade; API recebe atividade sem exigir task ativa ou ciência. Categorias não equivalem às aplicações produtivas de uma task.
- **Contrato necessário:** persistência/CRUD de tasks, descrição, colaboradores atribuídos, aplicações do escopo, estados, uma task ativa por colaborador e aviso de alterações ao agente antes da aplicação; confirmação de ciência e regras de autorização.
- **Workaround frontend:** não existe; armazenamento local, CRUD fictício ou reaproveitar categorias violaria a regra de negócio.
- **Motivo do bloqueio:** depende do modelo central de monitoramento e de implementação backend/agente.

### I-04 — Jornada individual e possível hora extra — Alta

- **Problema/requisito:** RF-20/RF-21/RF-22 e CA-06.
- **Frontend afetado:** configurações, painel e relatórios.
- **Backend relacionado:** `SystemSettings` tem somente dois inteiros globais; não há jornada individual.
- **Atual/impacto:** formulário global funcional; dias, entrada/saída, intervalo/carga horária e possível hora extra indisponíveis.
- **Contrato necessário:** jornada/limite por colaborador, validações de horários/fuso, propagação ao agente e cálculo de indicação de possível hora extra a partir das tasks.
- **Workaround frontend:** preservar edição global com aviso; cálculo local ou persistência local não são aceitáveis.
- **Motivo do bloqueio:** faltam persistência e registros necessários para comparar jornada e task.

### I-05 — Conexão real do agente — Média

- **Problema/requisito:** RF-05/RF-16/RF-27 e CA-04 exigem Online enquanto conectado/autenticado.
- **Frontend afetado:** métricas de estado e tabela de última atividade.
- **Backend relacionado:** `/activities/realtime`, janela de 15 minutos.
- **Atual/impacto:** status deriva de última leitura e inatividade; ausência na janela não comprova desconexão. A interface explica a aproximação.
- **Contrato necessário:** definir heartbeat/sessão autenticada, expiração, estados de conexão e sua relação com atividade/inatividade.
- **Workaround frontend:** mostrar última leitura com aviso é aceitável para o contrato atual; inferir conexão real não é.
- **Motivo do bloqueio:** navegador do gestor não observa diretamente a conexão do agente.

### I-06 — Dashboard, timeline e relatórios completos — Alta

- **Problema/requisito:** RF-24/RF-25/RF-27 e CA-07/CA-10.
- **Frontend afetado:** `DashboardPage`, `ReportsPage` e visualizações preservadas.
- **Backend relacionado:** `DailySummaryResponse`, `/dashboard/summary`, `/dashboard/export/csv|pdf`.
- **Atual/impacto:** data única, usuário, duração registrada e categoria; CSV/PDF do mesmo resumo. Sem task ativa, período, produtividade, tempo ativo/inativo agregado, jornada ou timeline confiável.
- **Contrato necessário:** consultas autorizadas por período/colaborador/task; aplicações dentro/fora do escopo, períodos de utilização/inatividade e métricas coerentes com jornada. Exportação deve respeitar exatamente os filtros e as permissões.
- **Workaround frontend:** manter resumo/exportação diária, já funcional. Não inventar série, produtividade ou reconstruir períodos a partir de realtime. Rankings/notas/comparações são proibidos pela RN-19.
- **Motivo do bloqueio:** fonte agregada atual não fornece os dados e classificações exigidos.

### I-07 — Referência de fuso e virada do dia — Média

- **Problema/requisito:** significado do filtro diário e períodos da jornada; RF-20/RF-24/RF-27.
- **Frontend afetado:** `todayIso`, filtros de data, resumo e exportação.
- **Backend relacionado:** `captured_at` com timezone e `func.date` em `get_daily_summary`.
- **Atual/impacto:** frontend usa dia local do navegador; agregação usa data de captura no banco. Registros perto da meia-noite podem pertencer a outro dia dependendo do ambiente.
- **Contrato necessário:** definir fuso de referência e semântica do parâmetro `date`, armazenamento/agregação e conversão de horários.
- **Workaround frontend:** não existe correção segura sem definição; conferir a data retornada evita apenas resposta de outra consulta.
- **Motivo do bloqueio:** alterar o fuso no navegador unilateralmente não corrige a agregação do banco.

### I-08 — Teste de integração com serviço real — Média

- **Problema/requisito:** confirmar CORS, dados e conteúdo de exportação; CA-07/CA-09/CA-10.
- **Frontend afetado:** `e2e/real-api.spec.js` e telas com API.
- **Backend relacionado:** FastAPI/banco em execução com dados de teste; origem configurada.
- **Atual/impacto:** E2E principal intercepta HTTP somente nos testes; teste real é opt-in e não escreve dados. Sem serviço disponível não comprova integração/arquivos reais.
- **Contrato/alteração necessária:** disponibilizar ambiente de teste autorizado, dados e origem; executar `RUN_REAL_API=1 npm.cmd run test:e2e:real` e conferir CSV/PDF, falhas e reinício. Sem alteração de endpoints.
- **Workaround frontend:** fixtures de teste protegem comportamento do cliente, mas não comprovam a API real.
- **Motivo do bloqueio:** o ambiente depende de serviço e banco externos; esta revisão não inicia nem modifica backend/banco.

## Pendências futuras do Frontend

### F-01 — Integração das telas após contratos — Alta

- **Problema/requisito:** implementar UI real para I-01 a I-07; RFs indicados nesses itens.
- **Frontend afetado:** acesso, colaboradores, tasks, configurações, painel, relatórios e testes.
- **Backend relacionado:** contratos ainda ausentes/desalinhados descritos na seção anterior.
- **Atual/impacto:** funcionalidades indisponíveis são informadas sem inputs de persistência fictícia.
- **Definição necessária:** contratos aprovados e disponíveis, regras de erro/validação e dados para testes.
- **Workaround frontend:** não existe para completar a funcionalidade; páginas informativas são aceitáveis enquanto bloqueada.
- **Motivo do bloqueio:** telas, payloads e métricas não podem ser implementados antes das definições reais.

### F-02 — Instalação PWA e política offline — Média

- **Problema/requisito:** requisitos chamam a aplicação de Dashboard PWA, sem detalhar instalação/offline.
- **Frontend afetado:** entrada Vite, recursos estáticos e futura configuração de manifest/service worker.
- **Backend relacionado:** política de sessão, cache e acesso a dados sensíveis ainda indefinida.
- **Atual/impacto:** aplicação web responsiva, sem manifest/service worker; não é instalável como PWA.
- **Definição necessária:** decidir instalação, navegadores, cache permitido, atualização e comportamento offline/logout.
- **Workaround frontend:** acesso web atual; não simular dados offline nem persistir dados corporativos como substituto de backend.
- **Motivo do bloqueio:** exige decisão de produto/segurança antes de escolher cache e comportamento offline.

### F-03 — Validação humana e matriz de navegadores — Média

- **Problema/requisito:** completar acessibilidade/responsividade e compatibilidade previstas em RNF e `responsividade.md`.
- **Frontend afetado:** todas as telas, menu, tabelas, filtros e estados de erro.
- **Backend relacionado:** nenhum contrato novo; serviço real é necessário apenas para validação de dados.
- **Atual/impacto:** teclado, larguras, ampliação CSS, orientação horizontal e axe-core automatizados; leitor de tela, zoom nativo e dispositivos reais não comprovados.
- **Definição necessária:** navegadores/largura mínima suportados e acesso a leitor de tela/dispositivos para inspeção humana.
- **Workaround frontend:** testes automatizados existentes são proteção parcial; não equivalem a inspeção humana.
- **Motivo do bloqueio:** definição de suporte e recursos de validação externos não estão disponíveis nesta tarefa.

### F-04 — Componentes preservados sem uso na aplicação ativa — Baixa

- **Problema/requisito:** decidir reaproveitamento/remoção conforme desenho futuro de RF-27, sem implementar visualizações fictícias.
- **Frontend afetado:** `ActivityChart`, `Header`, `PeopleCard`, `ReportsAndAgent`, `TimelineCard`, `useAutoRefresh` e componentes auxiliares.
- **Backend relacionado:** novas fontes de I-05/I-06 e definições de produto.
- **Atual/impacto:** fora da árvore ativa; vários possuem consumidores em testes. Busca de imports/entradas confirmou que não são carregados no build atual. Não há ganho de bundle ao removê-los.
- **Definição necessária:** confirmar visualizações futuras e política de preservação; depois reaproveitar ou remover arquivos e testes que percam finalidade.
- **Workaround frontend:** mantê-los isolados é aceitável; não foram conectados a dados inexistentes.
- **Motivo do bloqueio:** remover código explicitamente preservado pela auditoria anterior sem decisão sobre seu destino seria mudança sem benefício funcional comprovado.

## Ordem de execução

1. Proteger dados e gravações (B-01/B-02), corrigir integridade e inicialização (B-03 a B-08).
2. Definir identidade/equipe e task/consentimento (I-01 a I-03).
3. Definir jornada, conexão, consultas completas e fuso (I-04 a I-07).
4. Integrar UI e validar serviço real (F-01/I-08), decidir PWA e matriz de suporte (F-02/F-03).
5. Revisitar componentes preservados (F-04).
