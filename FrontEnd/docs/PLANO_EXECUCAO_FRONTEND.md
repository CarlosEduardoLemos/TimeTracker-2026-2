# Plano de execução do Frontend

Revisão iniciada em **21/10/2026**. Este documento registra o diagnóstico antes das mudanças e o trabalho executado nesta rodada. Todas as escritas desta revisão permanecem em `FrontEnd/`.

## Escopo e fontes

- Checkout local: `C:/Users/User/Documents/TimeTracker-2026-2`.
- Branch inicial: `main`; commit inicial: `eb099637c0c8b878386d79fffa780ef41843d02c`.
- `origin` aponta para `CarlosEduardoLemos/TimeTracker-2026-2`; `upstream` aponta para `fabrica-bayarea/TimeTracker-2026-2`.
- A árvore estava limpa antes da revisão. O commit local correspondia a `origin/main` e estava cinco commits à frente de `upstream/main` (`230fc7fac1374941dcb26b1d507494aa6450234f`). Essa diferença é a PR #128, aberta, com cinco commits e alterações somente em `FrontEnd/`; não foi incorporada ao repositório oficial durante esta execução.
- Issues oficiais consultadas: 38 (35 abertas, 3 fechadas), incluindo descrições, labels, responsáveis e comentários existentes. PRs recentes consultadas: 15, incluindo #128 aberta e #125/#124/#121/#120/#119 integradas.
- Requisitos consultados: visão, sitemap, RBAC, critérios de aceite, regras funcionais/não funcionais, épicos, sprints e telas.
- Backend e Agent foram examinados somente para leitura. Não há routers de Tasks ou associação no Backend atual. `GET /auth/me` exige JWT; as rotas de dados de usuários, realtime, resumo/exportação e configuração não exigem JWT nem filtram por gestor.

## Diagnóstico inicial

O frontend é React 18/Vite, com rotas por hash, lazy loading, cliente HTTP compartilhado, validadores de resposta, hooks de dados e cobertura unitária/E2E. `FrontEnd/package.json` disponibiliza `lint`, `format:check`, `typecheck`, `test`, `test:coverage`, `build`, `test:bundle`, `test:e2e`, `test:e2e:real`, `check` e `check:full`.

As páginas de Painel, Colaboradores, Tasks, Relatórios e Configurações já estavam estruturadas. Painel/Colaboradores usam `/users/`, `/activities/realtime` e `/dashboard/summary`; relatórios/exportações refletem somente o resumo diário disponível. A página de Tasks é informativa em produção, com demonstração isolada de desenvolvimento. A PR #128 já trazia busca/ordenação local de Tasks, filtro por aplicativo, acompanhamento de leituras realtime, documentação e testes, mas ainda estava aberta e ausente de `upstream/main`.

O backend tinha contratos verificáveis para registro, login e identidade do gestor (`POST /auth/register`, `POST /auth/login`, `GET /auth/me`). Antes desta rodada, os métodos HTTP de auth existiam, mas `AuthPage` era informativa, não havia sessão, logout nem guardas. A issue #138, aberta em 21/10/2026, e o texto de execução autorizam essa integração, embora um alinhamento anterior tenha adiado login para o MVP de 13/10. A decisão mais recente foi implementar no frontend e preservar no relatório a limitação do servidor.

## Matriz de issues

A [Matriz de issues](MATRIZ_ISSUES_FRONTEND.md) classifica cada uma das 38 issues por status oficial, classificação técnica, área, evidência, contribuição do frontend, dependência, teste e aceite. A contagem não duplica issues entre as quatro classificações principais:

| Classificação técnica                                  | Quantidade |
| ------------------------------------------------------ | ---------: |
| Concluída no escopo original, com evidência registrada |         10 |
| Parcial                                                |         12 |
| Implementada, aguardando validação real                |          3 |
| Pendente ou bloqueada por outra área                   |         13 |

O estado oficial continua independente: **35 abertas e 3 fechadas**. Issues fechadas #112 e #118 não foram automaticamente tratadas como tecnicamente completas; a #118 descreve recebimento autenticado, mas a rota local atual não exige credencial.

## Dependências principais

| Área/issue                    | Evidência no checkout                                                                                                            | Efeito no frontend                                                                     | Condição de desbloqueio                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Backend #137 / B-01           | Só `/auth/me` usa `get_current_manager`; rotas de usuários, atividade, resumo, exportação e configuração não filtram por gestor. | O frontend valida a sessão e envia Bearer, mas os dados continuam sem isolamento real. | Proteger cada rota, filtrar pelo gestor autenticado e testar isolamento entre gestores.      |
| Backend #113/#115; Agent #116 | Não existe rota/schema de código, associação ou vínculo gestor–colaborador no backend.                                           | Código permanece oculto; a integração do Agent não pode ser validada de ponta a ponta. | Definir contrato de geração/consulta, associação, validade, erros e persistência do vínculo. |
| Backend #133; Agent #135/#136 | Sem modelo/router/schema de Tasks no backend; DTOs/rotinas do Agent não carregam task ativa/TaskId.                              | Gestão persistida, atribuição e início do monitoramento não podem ser afirmados.       | CRUD autorizado, atribuições e protocolo de início/troca/fim com TaskId.                     |
| Backend #140                  | Não existe agregação de tempo por Task nem campo de Task nos registros.                                                          | Sem indicadores reais de tempo por Task.                                               | Persistir TaskId no registro e disponibilizar agregação filtrada por período/equipe.         |
| Infra #141                    | Docker Compose local existe, mas não configura túnel HTTPS ou homologação distribuída.                                           | E2E real e comportamento de produção não foram exercitados.                            | Ambiente HTTPS autorizado, conta/dados de teste e roteiro em redes distintas.                |

Os detalhes e contratos ainda propostos estão preservados em [Pendências](PENDENCIAS.md). Nenhuma rota de Tasks, associação, jornada, conexão do Agent ou agregação foi inventada.

## Ordem de execução e arquivos

1. **Segurança do frontend (#112/#138):** formulário real, validação conforme schemas, sessão em `sessionStorage`, restauração por `/auth/me`, proteção das páginas, logout e handling distinto de `401`/`403`. Arquivos: `src/shared/auth/`, `src/shared/api/api.js`, `src/app/App.jsx`, `src/app/routes.js`, `src/app/layout/Sidebar.jsx`, `src/features/auth/pages/AuthPage.jsx`.
2. **Regressão e qualidade:** testes de API, formulário, guarda, navegação e menu; E2E mockado com `/auth/me`; teste real somente com serviço e conta configurados. Arquivos de teste em `src/` e `e2e/`.
3. **Rastreabilidade:** atualizar contratos, funcionalidades, arquitetura, pendências e testes; criar matriz e relatório final.
4. **Revisão final:** validar comandos disponíveis, revisar diff, untracked, segredo e escopo restrito a `FrontEnd/`.

## Riscos técnicos

- `sessionStorage` é legível por JavaScript e suscetível a XSS; evita persistência além da aba, não elimina o risco. Não armazenamos senha ou imprimimos token.
- Não há refresh/revogação de JWT. Logout remove a cópia local e o token segue válido no servidor até expirar.
- Guardas React protegem a apresentação, não os dados. Até #137 ser entregue, a API continua acessível sem token e sem isolamento.
- O card de associação fica oculto sem contrato real; a resposta `ManagerOut` não contém código.
- A implementação nova muda o fluxo anterior sem login previsto para apresentação de 13/10. A issue #138 aberta e o pedido atual orientam o avanço, mas o status histórico do MVP foi preservado.
- O checkout tem modificações pessoais prévias em PR #128. Essas alterações foram mantidas; nenhuma edição foi feita em Backend, Agent, requisitos, raiz do repositório ou Git remoto.

## Critérios e estratégia de validação

- `npm run lint`, `npm run format:check` e `npm run typecheck` verificam estilo, lint e contratos JS.
- `npm run test:coverage` cobre cliente, fluxo de autenticação, `401`/`403`, sessão, validações e componentes.
- `npm run build` mais `npm run test:bundle` verifica compilação e exclusão de mocks de produção.
- `npm run test:e2e` verifica rotas protegidas e telas com mocks do navegador; `npm run test:e2e:real` exige API, `RUN_REAL_API=1` e credenciais de teste definidas fora dos arquivos.
- `npm run check` reúne lint, formatação, typecheck, cobertura e build; `npm run check:full` inclui E2E.
- Não executar chamada que escreva em API real sem ambiente e conta de teste autorizados. A validação real do backend e do Agent permanece condicionada ao ambiente.

## Estado da execução

A autenticação do gestor está implementada no frontend. Nesta continuação, a interface de CRUD de Tasks e o card de horas por Task foram concluídos como demonstrações explicitamente isoladas; a versão de produção segue desabilitada até haver contrato. O principal bloqueio externo permanece B-01/#137; Tasks reais, associação, jornada, atividade por Task e deploy dependem de Backend, Agent ou DevOps. Resultados integrais das validações ficam no [Relatório](RELATORIO_EXECUCAO_FRONTEND.md).

## Continuação — conclusão da interface de Tasks, 21/10/2026

- **Linha de base desta continuação:** checkout `main` em `6358a219536a0afa537b890a091b26a15360fbc5`, limpo no início e igual a `origin/main`; cinco commits à frente de `upstream/main` (`230fc7fac1374941dcb26b1d507494aa6450234f`). PR #128 permanece aberta. As alterações desta continuação estão limitadas a `FrontEnd/`.
- **Tasks (#134):** formulário e lista com título, descrição e seleção múltipla de colaboradores; criar/editar/excluir somente no serviço de desenvolvimento, busca, ordenação, estados de erro/carregamento/vazio e prévia desabilitada em produção.
- **Dashboard (#98/#140):** filtro e card de resumo por Task usam serviço de demonstração isolado e resposta vazia; não afetam indicadores gerais/categorias nem fabricam horas. A API real ainda não tem CRUD nem agregação por Task.
- **Regressão de autenticação (#138):** handlers locais de register/login/me permitem exercitar páginas protegidas no modo mock. O aviso global identifica que autenticação, colaboradores, Tasks e jornada dessa execução são dados de demonstração.
- **Classificação técnica atualizada:** issue #134 permanece parcial até existir integração real. #98 e #140 também permanecem parciais; o filtro e card são interface pronta, mas sem dados de API. #114 permanece bloqueada por falta de contrato de código.
- **Contratos candidatos:** centralizados em [Pendências](PENDENCIAS.md), com métodos de CRUD, `title`, `description`, `collaborator_ids` e proposta de `/dashboard/tasks-summary`. A documentação separa as rotas MSW de endpoints reais.

## Auditoria final — formulário, sincronização e segurança — 21/10/2026

- **Base verificada:** branch local `main`, checkout inicial limpo em `e14d831b973f9160c2ff3434b9c53578f90bc156`. A branch oficial consultada pelo GitHub estava em `230fc7fac1374941dcb26b1d507494aa6450234f`; comparação confirma sete commits locais à frente. PR #128 continuava aberta.
- **Tasks (#134):** validação exige catálogo de colaboradores concluído e IDs existentes; retry continua habilitado após falha; criação limpa os campos; erro preserva o rascunho; edição da mesma identidade acompanha mudanças externas só quando o formulário está limpo. A listagem ignora consulta anterior à mutação e limpa IDs removidos.
- **Dashboard (#98/#140):** respostas fora de data não são mostradas; catálogo e resumo usam cancelamento e atualização de 30 segundos do Dashboard apenas no serviço demonstrativo; filtro removido é limpo; indicadores gerais ficam independentes. Atividade geral tem rótulo “Sem Task / Atividades Gerais” e sem valores fictícios.
- **Sessão (#138):** token malformado é descartado antes de consultar `/auth/me`; login e validação recebem cancelamento; logout cancela login pendente. `401` expira sessão e `403` a mantém.
- **MSW/contrato:** rotas da demonstração exigem Bearer simulado e Tasks usam `/tasks/`, conforme o caminho da issue #133. Uma identidade fixa é suficiente só para demonstração e não simula autorização entre gestores. Nenhuma rota de produção foi presumida ou habilitada.
- **Estado de issues:** #129 e #133 bloqueadas por dependências; #134, #98, #140 e #138 parciais; #137 bloqueada por Backend; #112 fechada oficialmente, com API real ainda não homologada; #105/#113/#114/#115 dependem de código de associação no Backend. O estado oficial permanece separado do técnico na [Matriz](MATRIZ_ISSUES_FRONTEND.md).
- **Validação:** `check` e `check:full` passaram; 295 testes Vitest em 58 arquivos e 30 cenários Playwright passaram, com dois testes de API real ignorados. Cobertura detalhada e limites estão em [Testes](TESTES.md).
- **Próxima fase:** aguardar CRUD autenticado `/tasks/`, proteção/isolamento #137, `task_id` persistido para #140 e contrato de associação; integrar apenas após testes negativos de autorização e ambiente de homologação. Critérios completos em [Pendências](PENDENCIAS.md#auditoria-de-continuacao--21102026).
