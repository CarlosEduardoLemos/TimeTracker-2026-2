# Relatório de execução da auditoria do Frontend

Revisão: **21/10/2026**. Escopo autorizado: auditoria, implementação, documentação e validação dentro de `FrontEnd/`.

## Resultado

O frontend agora integra cadastro e login reais do gestor, valida identidade com `GET /auth/me`, mantém o JWT apenas em `sessionStorage`, restaura e encerra a sessão, protege as cinco páginas do gestor e envia Bearer nas chamadas privadas. O fluxo distingue `401` (sessão encerrada) de `403` (sessão mantida) e não autentica automaticamente após cadastro.

Esta entrega conclui a integração de sessão na camada de frontend. Não conclui autenticação nem isolamento de dados no serviço: no backend deste checkout, apenas `/auth/me` exige gestor autenticado. As rotas de usuários, realtime, resumo/exportação e configurações ainda não protegem nem filtram os dados por gestor. A pendência B-01/#137 continua crítica.

## Estado inicial e rastreabilidade

- Branch inicial `main`, limpa em `eb099637c0c8b878386d79fffa780ef41843d02c`, igual a `origin/main` e cinco commits à frente de `upstream/main` (`230fc7fac1374941dcb26b1d507494aa6450234f`). A diferença corresponde à PR #128, que segue aberta e contém somente alterações de FrontEnd; ela não foi incorporada nem alterada nesta execução.
- Na revisão de autenticação foram conferidas 38 issues oficiais: 35 abertas e 3 fechadas. A classificação técnica daquele momento era 10 concluídas no escopo original, 12 parciais, 3 aguardando validação real e 13 pendentes/bloqueadas. Após a continuação de Tasks, a classificação atualizada está na [Matriz de issues](MATRIZ_ISSUES_FRONTEND.md): 10 concluídas, 13 parciais, 3 aguardando validação real e 12 pendentes/bloqueadas. Status técnico e estado oficial do GitHub permanecem separados.
- Consultados requisitos, documentação da API, backend e Agent em leitura. Não foram encontrados contratos/persistência para Tasks, código de associação, vínculo gestor-colaborador ou agregação de horas por Task. As rotas e as condições para desbloquear essas entregas estão em [Pendências](PENDENCIAS.md).
- O escopo histórico de apresentação aprovado em 13/10 previa acesso sem login. A issue #138 de 21/10 e o pedido desta execução orientaram a integração atual. A alteração do frontend não muda a política de autorização do backend.

## Alterações realizadas

- Criada sessão compartilhada do gestor, com validação de identidade, restauração, logout, tratamento coordenado de `401` e estados de indisponibilidade/repetição.
- Implementados formulários acessíveis de cadastro/login, validação local, erros de API e confirmação de cadastro sem auto-login.
- Adicionados metadados de proteção às rotas de Painel, Colaboradores, Tasks, Relatórios e Configurações; Sidebar identifica o gestor validado e oferece logout.
- Centralizado o envio de Bearer às chamadas privadas. Cadastro/login permanecem públicos e `/auth/me` valida explicitamente o token recebido.
- Adicionados testes de API, sessão, formulários, navegação, menu e fluxos E2E com API simulada.
- Atualizados os documentos de arquitetura, funcionalidades, contratos, pendências, testes, histórico e índice; criados o plano, a matriz de issues e este relatório.

Arquivos de implementação e testes: `src/shared/auth/`, `src/shared/api/`, `src/app/`, `src/features/auth/` e `e2e/`. Documentos: `docs/ALTERACOES.md`, `ARQUITETURA.md`, `CONTRATOS_API.md`, `FUNCIONALIDADES.md`, `MATRIZ_ISSUES_FRONTEND.md`, `PENDENCIAS.md`, `PLANO_EXECUCAO_FRONTEND.md`, `README.md`, `RELATORIO_EXECUCAO_FRONTEND.md` e `TESTES.md`.

## Validação

Resultados obtidos no código desta revisão:

- `npm.cmd run lint`, `npm.cmd run format:check` e `npm.cmd run typecheck`: passaram.
- `npm.cmd run check`: passou; inclui lint, Prettier, typecheck, cobertura, build e teste do bundle.
- `npm.cmd run check:full`: passou após as edições documentais finais, incluindo `check` e Playwright.
- Vitest: **265 testes em 56 arquivos passaram**; cobertura de 93,58% statements, 90,06% branches, 94,35% functions e 95,38% lines.
- Testes focados de auth/API/App/Sidebar: **60 passaram**.
- Playwright `npm.cmd run test:e2e`: **30 passaram, 0 falharam e 2 testes de API real foram ignorados**. Os casos reais foram ignorados porque não havia ambiente e credenciais autorizados configurados.
- `npm.cmd audit --json --cache node_modules/.cache/npm-audit`: inconclusivo; a rede não acessou o endpoint de advisories do registry npm. A fotografia histórica de auditoria em `PENDENCIAS.md` não representa uma verificação atual.

O E2E usa serviços simulados. Não valida JWT assinado nem autorização no backend. Não foram executados testes do backend ou build/execução do Agent, nem chamadas a API real.

## Limitações e próximos bloqueios

1. **B-01/#137 — autorização e isolamento:** backend deve exigir o gestor autenticado nas rotas privadas e limitar cada resultado ao seu escopo; validar isolamento entre gestores. Até então, Bearer e guardas React não protegem respostas do servidor.
2. **Associação (#113–#116):** definir persistência, validade, erros, consulta autenticada do código e vínculo com colaborador; depois integrar o card atualmente oculto e validar o Agent ponta a ponta.
3. **Tasks (#133–#136) e horas (#140):** falta modelo/CRUD autorizado, atribuição, `TaskId` nos registros do Agent e agregação por período/equipe.
4. **Conexão/ambiente (#141):** faltam contrato confiável de conexão, homologação HTTPS e validação em redes distintas.
5. **Auditoria de dependências:** repetir `npm audit` quando o registry estiver acessível.

## Limite de escopo

As alterações persistentes desta execução estão em `FrontEnd/`. Backend, Agent, requisitos, raiz do repositório e remotos não foram editados. Não foram criados commits, enviados pushes, alterados issues/PRs, feitos merges ou deploys. Nenhum segredo ou token real foi usado.

## Continuação — interface de Tasks e resumo por Task — 21/10/2026

Esta continuação partiu do checkout limpo `main` em `6358a219536a0afa537b890a091b26a15360fbc5`, igual a `origin/main` e cinco commits à frente de `upstream/main` (`230fc7fac1374941dcb26b1d507494aa6450234f`). A PR #128 continuou aberta. As alterações desta continuação estão restritas a `FrontEnd/`.

- Implementados componentes de formulário e lista Tasks com título, descrição, seleção múltipla de colaboradores, busca, ordenação, detalhes, confirmação de exclusão e estados de loading/erro/vazio. O hook aceita serviço injetado e controla create/update/delete, erros e cancelamento. Em produção, a tela permanece prévia desabilitada sem chamadas fictícias.
- Adicionado filtro e card de resumo por Task no Dashboard, usando somente serviço de demonstração. O MSW devolve lista vazia, sem gerar horas fictícias; o filtro não altera as métricas gerais ou o resumo por categoria.
- Adicionados handlers MSW de autenticação demonstrativa e catálogo de colaboradores para cobrir navegação autenticada local. O aviso deixa explícito que autenticação, colaboradores, Tasks e jornada são dados demonstrativos.
- Atualizados contratos/validadores candidatos, testes e documentação. A matriz passa a classificar #98, #134 e #140 como parciais; o total atual é 10 concluídas no escopo original, 13 parciais, 3 aguardando validação real e 12 pendentes/bloqueadas. #114 continua bloqueada por contrato; #138 segue coberta pelos testes de sessão.

**Validação final desta continuação:**

- Lint, `format:check` e typecheck passaram.
- Vitest: **282 testes em 58 arquivos passaram**; cobertura de **93,83% statements, 89,47% branches, 94,13% functions e 95,93% lines**.
- Build de produção passou com Vite 6.4.4; 4 verificações do bundle passaram e confirmaram que os mocks não foram incluídos.
- `npm.cmd run check` e `npm.cmd run check:full` passaram. Playwright teve **30 aprovados, 0 falhas e 2 testes reais ignorados** por não haver API configurada.
- `npm.cmd audit --json --cache node_modules/.cache/npm-audit` ficou inconclusivo porque o endpoint do registry npm não respondeu.

A interface de demonstração não comprova CRUD persistido, autorização ou métricas reais. O Backend inspecionado continua sem modelo/rotas de Tasks e sem agregação por Task; o Agent não envia `task_id`. Nenhuma chamada de API real, commit, push, alteração remota ou execução de Agent foi feita.

## Auditoria aprofundada — formulário, Dashboard e segurança — 21/10/2026

### 1. Diagnóstico inicial

- Branch local `main`, HEAD `e14d831b973f9160c2ff3434b9c53578f90bc156`; o checkout estava limpo. A referência oficial consultada no GitHub era `230fc7fac1374941dcb26b1d507494aa6450234f`, sete commits atrás; o compare oficial confirmou `ahead_by=7` e `behind_by=0`. Não foi feito fetch porque atualizaria `.git`, fora do diretório permitido.
- A PR #128 seguia aberta, sem merge. O único comentário recente era do bot de revisão, que não conseguiu revisar por limite de quota do Copilot.
- As issues oficiais #129, #133, #134, #98, #140, #137 e #138 estavam abertas; #112 estava fechada; #105, #113, #114 e #115 abertas. As issues #129–#141 e os requisitos locais foram conferidos; o último commit local que alterou `requisitos/` é de 22/09/2026.
- Causas reproduzidas no Frontend: submissão bem-sucedida não limpava o rascunho de criação; um fieldset desabilitado por erro também bloqueava seu botão de retry; a lista atrasada podia sobrescrever uma mutação; dados atualizados mantendo o ID não sincronizavam formulário limpo; e a sessão não cancelava um login em andamento ao sair. O seletor do Dashboard mantinha opção de Task removida. O resumo precisava do rótulo exato para atividade sem vínculo.
- A inspeção somente de leitura não encontrou modelo, schema ou rota de Tasks/associação/agregação no Backend; o Agent inspecionado ainda não envia `task_id`. A issue #133 especifica `/tasks/`, enquanto a simulação anterior chamava `/tasks`.

### 2. Alterações implementadas

- `TaskForm`: trava envio durante carga/erro de colaboradores, valida IDs contra o catálogo, expõe e permite remover atribuições inexistentes, associa erros aos campos, foca o primeiro campo inválido, impede submissão duplicada e limpa dados depois de criação concluída. Falha conserva o rascunho.
- `TasksPage`/`TaskList`: edição deriva o item atual pelo ID; a forma sincroniza atualização externa se o rascunho estiver limpo; cancelar, atualizar ou remover item não deixa seleção antiga; foco retorna ao botão de edição/lista após cancelar, salvar ou excluir.
- `useTasks`: versão de catálogo impede que leitura iniciada antes de mutação concluída substitua o estado atualizado; IDs de resposta incompatíveis são tratados como falha.
- `useTaskAnalytics`/Dashboard: aborta catálogo e resumo concorrentes; rejeita resumo de data diferente; usa atualização de 30 s e atualização ao voltar à aba, apenas com `devApi`; refresh manual atualiza os dois; Task removida limpa o filtro e não altera métricas gerais.
- `TaskSummaryCard`: atividade nula/excluída recebe “Sem Task / Atividades Gerais”; durações inválidas não aparecem como zero; barras têm nome, escala acessível e valores proporcionais.
- `ManagerSession`/`AuthPage`: token JWT malformado é removido sem consulta; login e validação de identidade usam cancelamento por sequência/`AbortSignal`; logout aborta login pendente, que não pode restaurar sessão depois de sair. Os fluxos de 401/403 permanecem diferenciados.
- MSW exige Bearer demonstrativo nos recursos de dados e CRUD usa `/tasks/`. O build segue excluindo mocks. A simulação representa uma identidade fixa e declara que não oferece isolamento multi-gestor nem simula 403 entre equipes.

### 3. Issues impactadas

| Issue                  | Estado oficial antes/depois | Estado técnico depois                 | Evidência                                                                                                             |
| ---------------------- | --------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| #129                   | Aberta / aberta             | Bloqueada                             | CRUD demonstrativo; produção desabilitada até Backend/Agent.                                                          |
| #133                   | Aberta / aberta             | Dependência externa                   | Backend não tem CRUD; issue pede `/tasks/`, alinhado só no mock local.                                                |
| #134                   | Aberta / aberta             | Parcial                               | Vitest de form/list/hook cobre edição, exclusão, erro, retry, IDs, atualização concorrente; API real ausente.         |
| #98                    | Aberta / aberta             | Parcial                               | Filtros e seleção removida testados; `task_id` real não existe nas atividades.                                        |
| #140                   | Aberta / aberta             | UI demonstrativa parcial              | Cancelamento, ordem, data, atualização e rótulo sem Task testados; falta agregação real no Backend.                   |
| #137                   | Aberta / aberta             | Bloqueada por Backend                 | Bearer React não protege rotas que o Backend ainda não valida/escopa.                                                 |
| #138                   | Aberta / aberta             | Parcial                               | Token malformado e logout durante login pendente adicionados aos testes; falta homologar API real e autorização #137. |
| #112                   | Fechada / fechada           | Frontend implementado; não homologado | API real não foi exercitada.                                                                                          |
| #105, #113, #114, #115 | Abertas / abertas           | Bloqueadas por contrato/Backend       | Nenhum código ou endpoint fictício foi conectado.                                                                     |

Nenhum estado oficial de issue ou PR foi modificado. A [Matriz](MATRIZ_ISSUES_FRONTEND.md) e [Pendências](PENDENCIAS.md) guardam detalhes de critério/dependência por issue.

### 4. Correções de bugs

- O callback da página não devolvia o resultado da mutação; com isso a limpeza pós-criação não podia ser acionada. Agora devolve sucesso explicitamente e o formulário limpa apenas nesse caso.
- Erro de colaboradores desabilitava nativamente todos os controles do fieldset, incluindo “Tentar carregar novamente”. O botão de retry está acessível; controles de seleção seguem desativados durante carga/falha.
- Listagens iniciadas antes de create/update/delete podiam chegar depois e restaurar dado antigo. A versão de mutação é capturada no início da carga e respostas anteriores são ignoradas.
- Alterações de Task com mesmo ID podiam deixar título/descrição antigos. A página resolve a Task atual do catálogo e o formulário sincroniza somente quando não há alterações locais.
- Login pendente podia terminar depois do logout. A sequência/token de cancelamento impede armazenar token ou restaurar sessão depois da saída.
- O filtro mantinha um item inexistente no catálogo e o card não padronizava o grupo sem vínculo. Agora a seleção é invalidada e a interface explicita o agrupamento previsto pela issue #140.

### 5. Melhorias de arquitetura realizadas

- Controle de versão de leitura versus mutação em `useTasks` sem biblioteca de estado global.
- Atualização de Task por ID e rascunho local com proteção contra sobrescrita de digitação.
- Requisições de catálogo/resumo com cancelamento, validação de data e ciclo compartilhado de atualização só na demonstração.
- Rotas simuladas exigem sessão demonstrativa e correspondem ao caminho `/tasks/` registrado na issue. Não habilitam endpoints reais.

### 6. Testes e validação

- `npm.cmd run lint`, `npm.cmd run format:check`, `npm.cmd run typecheck`, `npm.cmd run test:coverage`, `npm.cmd run build`, `npm.cmd run check` e `npm.cmd run check:full`: todos passaram.
- Vitest: **295 testes em 58 arquivos passaram**; cobertura de **93,24% statements, 89,48% branches, 95,06% functions e 95,49% lines**. Os testes de unit, hooks, serviços e componentes são agregados pelo Vitest, não contabilizados separadamente.
- Verificador do bundle: **4 testes passaram**; build Vite 6.4.4 confirmou ausência de handlers, worker e rotas demonstrativas.
- Playwright: **30 passaram, 0 falharam e 2 testes de API real foram ignorados** por falta de ambiente/credenciais autorizadas. E2E usou mocks. Não houve chamada de escrita a serviço real.
- Nenhum teste de Backend ou execução/compilação do Agent foi realizado.

### 7. Pendências externas

- **Backend — #133/#137:** CRUD `/tasks/` autenticado, checagem `manager_id`, validação de colaboradores da equipe, erros 401/403/404/422, isolamento entre dois gestores e decisão de remoção/arquivamento.
- **Agent + Backend — #136/#140:** persistir/enviar `task_id`, definir a duração agregada e validar soma diária por equipe; nulos e Tasks removidas devem retornar em “Sem Task / Atividades Gerais”.
- **Backend/Agent — #105/#113–#115:** geração/consulta segura do código, expiração, associação e respostas válidas/inválidas.
- **Homologação:** testar integração em ambiente autorizado; Bearer, login React e MSW não provam assinatura real, autorização nem privacidade no servidor.

### 8. Arquivos modificados

Lista exata dos 28 arquivos com diff ao final da execução:

- `FrontEnd/docs/CONTRATOS_API.md`, `FrontEnd/docs/MATRIZ_ISSUES_FRONTEND.md`, `FrontEnd/docs/PENDENCIAS.md`, `FrontEnd/docs/PLANO_EXECUCAO_FRONTEND.md`, `FrontEnd/docs/RELATORIO_EXECUCAO_FRONTEND.md`, `FrontEnd/docs/TESTES.md`.
- `FrontEnd/src/dev-mocks/client.js`, `FrontEnd/src/dev-mocks/client.test.js`, `FrontEnd/src/dev-mocks/handlers.js`, `FrontEnd/src/dev-mocks/handlers.test.js`.
- `FrontEnd/src/features/auth/pages/AuthPage.jsx`, `FrontEnd/src/features/auth/pages/AuthPage.test.jsx`.
- `FrontEnd/src/features/dashboard/components/DashboardFilters.jsx`, `FrontEnd/src/features/dashboard/components/DashboardFilters.test.jsx`, `FrontEnd/src/features/dashboard/components/TaskSummaryCard.jsx`, `FrontEnd/src/features/dashboard/components/TaskSummaryCard.test.jsx`, `FrontEnd/src/features/dashboard/hooks/useTaskAnalytics.js`, `FrontEnd/src/features/dashboard/hooks/useTaskAnalytics.test.js`, `FrontEnd/src/features/dashboard/pages/DashboardPage.jsx`, `FrontEnd/src/features/dashboard/pages/DashboardPage.test.jsx`.
- `FrontEnd/src/features/tasks/components/TaskForm.jsx`, `FrontEnd/src/features/tasks/components/TaskList.jsx`, `FrontEnd/src/features/tasks/hooks/useTasks.js`, `FrontEnd/src/features/tasks/hooks/useTasks.test.js`, `FrontEnd/src/features/tasks/pages/TasksPage.jsx`, `FrontEnd/src/features/tasks/pages/TasksPage.test.jsx`.
- `FrontEnd/src/shared/auth/ManagerSession.jsx`, `FrontEnd/src/shared/auth/ManagerSession.test.jsx`.

### 9. Confirmação de permissões

As alterações de código/documentação persistentes foram restritas a `FrontEnd/`. `backend/`, `agent/`, `requisitos/`, `.github/`, `testes/` externo, raiz, issues, PRs e remotos não foram modificados. Sem commit, push, merge, deploy ou alteração remota.

### 10. Próximas ações

1. Aguardar CRUD autenticado e isolamento entre gestores no Backend; manter a tela real desabilitada até contrato e homologação.
2. Coordenar `task_id` e agregação com Agent/Backend e provar valores reais, inclusive vínculos ausentes/excluídos.
3. Definir associação de gestor/colaborador e só então integrar o card/endpoints.
4. Rodar E2E real em ambiente explicitamente autorizado; os dois cenários reais continuaram ignorados nesta execução.

**Escopo observado:** nenhum segredo real foi usado. O único mock de autenticação usa token fixo de demonstração e não está presente no bundle de produção.

## Auditoria e ampliação documental — 21/10/2026

### 17.1 Escopo

- **Commit analisado:** f8556a1114a52ffc5064ab9ab8506a388778561b.
- **Branch e árvore inicial:** main; árvore limpa antes das edições documentais; branch local igual a origin/main.
- **Remotes:** origin aponta para CarlosEduardoLemos/TimeTracker-2026-2; upstream aponta para fabrica-bayarea/TimeTracker-2026-2.
- **Comparação entre repositórios:** GitHub confirmou a main oficial em 230fc7fac1374941dcb26b1d507494aa6450234f; o commit analisado está 8 commits à frente e 0 atrás. A PR #128 permanece aberta com esse head. Não foi feito fetch, push, merge nem alteração remota.
- **Diretórios consultados em leitura:** FrontEnd/src, FrontEnd/e2e, FrontEnd/scripts, FrontEnd/package.json; backend/app e backend/tests; agent/; requisitos/; documentação de issues/PRs do repositório oficial.
- **Documentos revisados:** todos os 11 arquivos existentes em FrontEnd/docs/: ALTERACOES.md, ARQUITETURA.md, CONTRATOS_API.md, FUNCIONALIDADES.md, MATRIZ_ISSUES_FRONTEND.md, PENDENCIAS.md, PLANO_EXECUCAO_FRONTEND.md, PROPOSTA_CONTRATOS_BACKEND.md, README.md, RELATORIO_EXECUCAO_FRONTEND.md e TESTES.md.
- **Permissões:** escritas limitadas aos documentos dentro de FrontEnd/docs/. Código, testes, package/configuração, Backend, Agent, requisitos, raiz, issues, PRs e remotos não foram alterados.

### 17.2 Diagnóstico

- Registros de auditoria anteriores usavam e14d831 e a comparação de sete commits; eram válidos para aquele checkpoint, mas já não descreviam o HEAD atual. Esta seção e a revalidação na matriz passam a identificar f8556a1 e oito commits à frente.
- O índice documental não listava PROPOSTA_CONTRATOS_BACKEND.md nem orientava uma trilha de leitura por público/assunto.
- Naquele checkpoint, a documentação de Tasks afirmava que a string de criação estava alinhada a /tasks/. O código chamava POST /tasks, enquanto GET e handlers MSW usavam /tasks/. Como aquela rodada não executou uma verificação de runtime, registrou a diferença como divergência de grafia e compatibilidade pendente F-04, sem declarar falha reproduzida.
- A descrição da PR #128 ainda informa 254 testes e 29 cenários E2E, enquanto o registro local mais recente em TESTES.md informa 295 testes e 30 cenários Playwright aprovados, além de 2 casos reais ignorados. Os resultados permanecem vinculados às fontes e não foram tratados como uma mesma execução.
- A consulta GitHub nesta data confirmou 38 issues, 35 abertas e 3 fechadas; a PR #128 continua aberta. Estado do GitHub e conclusão técnica continuam separados.
- Os contratos reais de autenticação, dados, configuração e exportação estão documentados, mas os formatos propostos para Tasks, associação, jornada e resumo por Task ainda dependem de implementação e validação externa.

### 17.3 Melhorias implementadas por documento

| Documento                      | Conteúdo anterior preservado                              | Ampliação/documentação realizada                                                                                                                              |
| ------------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| README.md                      | Estado atual e links de navegação existentes              | Índice completo de 11 documentos, ordem de leitura, público, navegação por assunto, estados de evidência e regra de rastreabilidade                           |
| ARQUITETURA.md                 | Arquitetura, fluxos, decisões e estratégia de qualidade   | Diagrama real/mock e tabela de responsabilidade com implementação, testes, requisitos/issues e pendências                                                     |
| FUNCIONALIDADES.md             | Descrição das telas, limites e relação com requisitos     | Matriz por funcionalidade ligando RF/CA, issues, arquivos, testes, contratos e dependências                                                                   |
| CONTRATOS_API.md               | Rotas consumidas, auth, validação e propostas separadas   | Catálogo de rotas do Backend, schemas/status/autorização observados e análise explícita da grafia /tasks versus /tasks/                                       |
| MATRIZ_ISSUES_FRONTEND.md      | As 38 linhas de issues e classificações técnicas          | Revalidação de branch/HEAD/remotes, quantidade e estado oficial, trilhas issue→requisito→código→contrato→teste→pendência e divergência do texto da PR         |
| PENDENCIAS.md                  | Identificadores, histórico e propostas existentes         | Nova pendência F-04 com evidência, impacto, causa provável, solução, aceite, testes e condição de desbloqueio; correção de contexto para o caminho Task atual |
| PLANO_EXECUCAO_FRONTEND.md     | Diagnósticos e marcos anteriores                          | Estado final do checkout e próximas ações para os bloqueios atuais                                                                                            |
| PROPOSTA_CONTRATOS_BACKEND.md  | Propostas de Tasks, jornada, agregação e conexão do Agent | Efeitos por componente, riscos, alternativas, critérios e testes para Tasks/atribuição, associação, autorização, sessão, Agent, datas e homologação           |
| TESTES.md                      | Todos os resultados históricos e roteiros                 | Nota separando esta auditoria documental dos testes de código e mantendo visível a diferença entre números da PR e do registro local                          |
| ALTERACOES.md                  | Histórico cronológico anterior                            | Registro desta ampliação e dos documentos afetados                                                                                                            |
| RELATORIO_EXECUCAO_FRONTEND.md | Relatórios anteriores                                     | Esta seção de auditoria documental, diagnóstico, evidências, melhorias, rastreabilidade, validação e permissões                                               |

Nenhuma seção histórica foi removida; as novas descrições complementam os registros anteriores e identificam quando uma constatação mais recente substitui a fotografia de estado de um checkpoint antigo.

### 17.4 Rastreabilidade

- **Issue → requisito → funcionalidade:** [Matriz de issues](MATRIZ_ISSUES_FRONTEND.md) e a tabela de rastreabilidade em [Funcionalidades](FUNCIONALIDADES.md) conectam RF/CA às issues #94–#141 pertinentes.
- **Funcionalidade → código → teste:** caminhos reais em FrontEnd/src e testes junto às features foram adicionados em [Arquitetura](ARQUITETURA.md) e [Funcionalidades](FUNCIONALIDADES.md).
- **Código → endpoint:** [Contratos da API](CONTRATOS_API.md) separa rotas FastAPI dos clientes simulados MSW; a trilha por Task registra o histórico e a resolução de F-04.
- **Contrato → bloqueio/aceite:** [Pendências](PENDENCIAS.md) e [Proposta de contratos](PROPOSTA_CONTRATOS_BACKEND.md) descrevem dependências do Backend/Agent, riscos e validação necessária.
- **Validação → histórico:** [Testes](TESTES.md), [Plano](PLANO_EXECUCAO_FRONTEND.md) e [Alterações](ALTERACOES.md) mantêm seus resultados associados à data e ao contexto.
- **Fonte oficial:** issues e PRs usam links do repositório fabrica-bayarea; a branch pessoal e a main oficial não foram presumidas como sincronizadas.

### 17.5 Validação documental

- O inventário confirmou exatamente os 11 documentos listados em FrontEnd/docs/; não foi necessário criar arquivo novo.
- Checagem documental estática em 11 arquivos: 368 links locais Markdown resolvidos, incluindo âncoras; 20 exemplos JSON analisados; nenhum caminho local quebrado, âncora sem destino, JSON inválido ou bloco de código sem fechamento. Os 51 links externos foram identificados, mas não foram todos abertos; as consultas oficiais de issues/PRs citadas acima foram feitas em leitura pelo conector GitHub. Blocos Mermaid foram verificados quanto ao fechamento, sem parser Mermaid dedicado.
- git diff --check terminou sem erro de whitespace. git diff --numstat mostra somente adições nos 11 documentos, sem linhas removidas; preservação de conteúdo conferida. Git avisou que CRLF de ALTERACOES.md e PLANO_EXECUCAO_FRONTEND.md será normalizado para LF na próxima operação Git.
- A documentação registra 295 testes Vitest e 30 cenários E2E aprovados mais 2 casos reais ignorados como resultados do histórico local de 21/10. Esta auditoria documental não repetiu Vitest, Playwright, build, lint ou chamadas ao Backend.
- PR #128 e issues foram consultadas em leitura. A descrição da PR não foi alterada, apesar da diferença numérica em relação ao registro local.

### 17.6 Pendências

- **Frontend:** no checkpoint dessa auditoria, F-04 ainda aguardava validação de roteamento. A execução posterior reproduziu 501, corrigiu a chamada para /tasks/ e validou cliente + MSW; consulte a atualização abaixo.
- **Backend/Agent:** autorização e isolamento B-01/#137, Tasks/atribuições I-03/#133, código e vínculo I-02/#113–#116, task_id/#136, resumo por Task/#140, idempotência B-06 e regras de data I-07 continuam dependências externas.
- **Homologação:** não houve instância API real, credenciais de teste, compilação/execução do Agent nem prova ponta a ponta.
- **Resultados de testes:** confirmar/atualizar a descrição da PR #128 pelos mantenedores quando oportuno; o texto remoto segue fora do escopo autorizado.

### 17.7 Permissões

As alterações desta auditoria estão restritas a FrontEnd/docs/. Os arquivos revisados e alterados são os 11 documentos listados na seção 17.1. Nenhum arquivo fora de FrontEnd/docs/ foi editado. Não houve commit, push, merge, deploy, alteração de issue ou de PR.

## Atualização da execução F-04 — 21/10/2026

### Diagnóstico e correção

O checkout começou na branch `main`, HEAD `a20750c25bb24d1665ffb965e14aa80a73f590ae`, com árvore de trabalho limpa. `devApi.createTask()` enviava POST `/tasks`, mas o handler MSW esperava `/tasks/`; a reprodução integrada atingiu o handler curinga e recebeu 501. O cliente foi alinhado a `/tasks/`. Não houve redirecionamento. O matcher MSW não tratou esses caminhos como equivalentes.

### Arquivos alterados e validação

- Código/testes: `src/dev-mocks/client.js`, `src/dev-mocks/client.test.js`, `src/dev-mocks/handlers.test.js`.
- Documentação: Pendências, Contratos da API, Proposta de contratos do Backend, Matriz de issues, Funcionalidades, Testes, Alterações, Plano e este Relatório. O histórico da auditoria anterior foi mantido, identificado pelo HEAD `f8556a1`.
- Testes focados: `npm.cmd run test -- src/dev-mocks/client.test.js src/dev-mocks/handlers.test.js` — 2 arquivos, 18 testes aprovados; os detalhes e status HTTP observados estão em [Testes](TESTES.md).
- Verificações gerais: lint passou; typecheck passou; cobertura passou com 296 testes em 58 arquivos (93,30% statements, 89,55% branches, 95,06% functions e 95,49% lines); build e 4 testes do bundle passaram; E2E teve 30 aprovados, 0 falhas e 2 testes de API real ignorados.
- Limitação da suíte agregada: `format:check` aponta somente `docs/ARQUITETURA.md` e `docs/README.md`, arquivos inalterados fora do escopo desta correção. Por isso `check:full` parou nessa etapa; cobertura, build, testes de bundle e E2E foram executados separadamente. A formatação dos arquivos alterados passou em verificação direcionada.

### Limites e permissões

F-04 resolve apenas a rota da demonstração. As issues #133 e #134 seguem abertas: CRUD persistente e autorização por gestor no Backend, além da integração real da interface, continuam pendentes. A produção não habilita Tasks fictícias. Todas as alterações desta execução estão em `FrontEnd/`; nenhum arquivo fora desse diretório foi modificado e não houve commit, push, merge, deploy ou alteração remota.
