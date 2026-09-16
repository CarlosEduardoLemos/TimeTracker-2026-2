# Implementação frontend alinhada aos requisitos — TimeTracker 2026-2

Escopo desta alteração: **somente `FrontEnd/`**. Nenhum arquivo de backend, banco, infraestrutura, Docker ou CI/CD foi alterado.

## Alterações realizadas

| Prioridade | Arquivo | O que foi alterado | Requisito relacionado | Por que | Como | Impacto | Validação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 🔴 | `FrontEnd/src/App.jsx` | Remoção de métricas de produtividade e adoção dos seis indicadores previstos no Dashboard | RN-19, RF-27, CA-10 | O frontend exibia `Tempo produtivo` e software mais usado, conceitos não alinhados aos requisitos | Removido `getProductiveSeconds`; grid passa a exibir Online, Offline, Tasks ativas, Tempo ativo, Tempo inativo e Possível hora extra. Valores não disponíveis na API são mostrados como indisponíveis, sem inferência | Evita métricas proibidas e deixa claras as dependências de dados | Inspeção estática; busca por referências de produtividade; smoke test das utils |
| 🔴 | `FrontEnd/src/App.jsx` | Removido fallback automático de dados fictícios quando a API falha | RNF-12, RN-19 | Dados demo poderiam ser confundidos com dados operacionais | Erro passa a exibir `role=alert`, retry e mensagem explícita. Componentes recebem apenas dados reais retornados | Falha de API não produz Dashboard aparentemente válido com dados fictícios | Busca estática por `useDemoData`, `demoPeople`, `Modo demonstração` |
| 🔴 | `FrontEnd/src/components/ActivityChart.jsx` | Gráfico deixou de comparar monitorado × produtivo | RN-19, RF-27, CA-10 | Comparação por produtividade é proibida no Dashboard | Gráfico agora apresenta somente tempo registrado por dia e informa que tempo por task depende de novo contrato de API | Elimina interpretação de produtividade; mantém visualização útil com contrato atual | Busca estática por termos de produtividade |
| 🔴 | `FrontEnd/src/components/AppsCard.jsx` | Removido ranking de aplicativos | RF-27, CA-10 | O componente anterior usava “mais usados” e percentuais de ranking | Componente agora aceita aplicações com `inScope` e apresenta `Dentro/Fora do escopo`, sem ranking; não é renderizado até a API fornecer esses dados | Evita ranking e prepara apresentação exigida pelo RF-27 | Revisão estática do componente |
| 🔴 | `FrontEnd/src/components/TimelineCard.jsx` | Timeline de demo substituída por estrutura semântica compatível com RF-27 | RF-27, CA-10, EP-08 US-03 | A timeline anterior era somente mock e não continha todos os campos exigidos | Novo contrato de props documentado: aplicação, início, fim, duração, Ativo/Inativo, task e dentro/fora do escopo. Sem dados, mostra empty state real | Componente fica pronto para integração futura sem inventar registros | Revisão estática; validação de campos renderizados |
| 🔴 | `FrontEnd/src/components/PeopleCard.jsx` | Tabela da equipe alinhada ao domínio do requisito e redução de dados exibidos | RN-19, RF-27, RN-18, RNF-06 | UI mostrava máquina, título da janela e categoria, enquanto faltava task/status; `window_title` pode conter conteúdo desnecessário | Tabela agora mostra colaborador, status, task ativa (indisponível), aplicação atual e última leitura. `hostname`, `window_title` e categoria deixam de ser exibidos | Menor exposição de informação e melhor alinhamento ao status da equipe | Teste atualizado verifica que `window_title`, hostname e categoria não são renderizados |
| 🔴 | `FrontEnd/src/components/ReportsAndAgent.jsx` | Exportação parcial foi desabilitada até existir contrato compatível | RF-24, RF-25, CA-07 | Exportação antiga não incluía período/task/jornada/overtime/timeline e poderia produzir relatório considerado completo indevidamente | Links ativos foram substituídos por botões desabilitados com explicação da dependência. Auto-refresh foi preservado | Evita download de relatório incompatível com requisitos | Teste atualizado valida CSV/PDF desabilitados e auto-refresh funcional |
| 🟠 | `FrontEnd/src/components/Header.jsx` | Copy e filtros existentes ajustados; limitação de API explicitada | RF-27, CA-10, RNF-12 | Texto anterior falava em “ritmo” e havia risco de interpretação de produtividade; API suporta apenas data única + colaborador | Título atualizado; input renomeado para data de referência; aviso explícito sobre período/task pendentes | Comunicação mais fiel ao sistema atual e aos requisitos | Teste atualizado para heading, data, status, filtros e aviso |
| 🟠 | `FrontEnd/src/data/dashboardData.js` | Remoção das fixtures operacionais antigas | RN-19, RNF-12 | O arquivo continha dados fictícios de produtividade, rankings, pessoas, títulos de janela e categorias | Mantida somente configuração de navegação; fixtures antigas removidas do módulo | Reduz risco de reaproveitamento acidental de dados fictícios em produção | Busca estática por referências demo/produtividade |
| 🟠 | `FrontEnd/src/utils/dashboard.js` | Removida função `getProductiveSeconds` e lista de categorias “não produtivas” | RN-19, RF-27 | A utilidade codificava uma regra de produtividade inexistente/proibida pelos requisitos | Mantidas somente funções neutras: duração, total registrado, tempo relativo e data | Elimina regra de negócio inadequada no frontend | Smoke test executado com Node |
| 🟠 | `FrontEnd/src/utils/dashboard.test.js` | Testes de produtividade removidos e teste de soma neutra mantido | RN-19 | O teste perpetuava a regra removida | Suite atualizada para validar total registrado sem classificação de produtividade | Testes passam a refletir o domínio correto | Conteúdo revisado; execução completa pendente por ausência de dependências instaladas |
| 🟠 | `FrontEnd/src/components/PeopleCard.test.jsx` | Teste passa a validar minimização da UI e ausência de fallback demo | RNF-06, RF-27 | Era necessário garantir que dados desnecessários não voltassem a ser exibidos | Teste verifica nome/status/app e confirma ausência de hostname, título de janela, categoria e usuário demo | Protege contra regressão de privacidade/apresentação | Teste criado/atualizado; execução pendente por dependências |
| 🟠 | `FrontEnd/src/components/ReportsAndAgent.test.jsx` | Teste de exportação antiga substituído por teste de bloqueio seguro | RF-24, RF-25 | Exportação anterior não era compatível com requisitos | Valida botões CSV/PDF desabilitados e comportamento do toggle de atualização | Evita reativação acidental do relatório parcial | Teste atualizado; execução pendente por dependências |
| 🟡 | `FrontEnd/src/components/Header.test.jsx` | Testes adaptados à nova semântica e aviso de dependência | RF-27, RNF-12 | Copy e label da data mudaram | Valida heading, filtro de colaborador, data de referência, refresh, status e aviso de API | Melhora rastreabilidade do comportamento | Teste atualizado; execução pendente por dependências |

## Dependências pendentes do backend/API

### Problema encontrado: Dashboard não possui contrato de período + task
**Local:** integração atual consumida por `FrontEnd/src/services/api.js`  
**Por que não pertence ao frontend:** a API atual aceita `date` e opcionalmente `username`; não existe contrato para intervalo nem task.  
**Impacto no frontend:** RF-27 não pode ser concluído integralmente; o Header mantém somente a data de referência existente.  
**O que o backend precisa fornecer:** consulta com `from`, `to`, identificador de colaborador e `taskId`, com resposta coerente para todos os widgets.

### Problema encontrado: ausência de estado consolidado da equipe associada
**Local:** cards de resumo e `PeopleCard`  
**Por que não pertence ao frontend:** a API atual não garante lista de colaboradores associados ao gestor nem fornece Online/Offline de toda a equipe autorizada.  
**Impacto no frontend:** Online pode ser exibido a partir de realtime; Offline não pode ser calculado com segurança.  
**O que o backend precisa fornecer:** lista autorizada de colaboradores associados com estado de conexão e escopo de acesso já validado.

### Problema encontrado: tasks não fazem parte dos DTOs atuais
**Local:** cards, status da equipe, filtro por task, tempo por task e timeline  
**Por que não pertence ao frontend:** contratos atuais não possuem `taskId`, task ativa ou relação atividade↔task.  
**Impacto no frontend:** Tasks ativas, filtro por task e tempo por task permanecem indisponíveis.  
**O que o backend precisa fornecer:** endpoints/DTOs de tasks e associação dos registros às respectivas tasks.

### Problema encontrado: API não fornece períodos Ativo/Inativo
**Local:** cards Tempo ativo/inativo e `TimelineCard`  
**Por que não pertence ao frontend:** estado agregado e intervalos não podem ser inferidos corretamente apenas do sumário por categoria.  
**Impacto no frontend:** indicadores permanecem sem valor e timeline sem registros reais.  
**O que o backend precisa fornecer:** períodos com início, fim, duração e estado `active|inactive`, associados a colaborador e task.

### Problema encontrado: classificação dentro/fora do escopo ausente
**Local:** `AppsCard` e `TimelineCard`  
**Por que não pertence ao frontend:** a UI não possui a definição dos serviços de cada task nem classificação pronta dos registros.  
**Impacto no frontend:** RF-27/CA-10 não podem exibir a classificação.  
**O que o backend precisa fornecer:** boolean/enum de escopo para cada período (`in_scope` ou equivalente), calculado com base na task.

### Problema encontrado: jornada e possível hora extra ausentes
**Local:** card Possível hora extra e relatórios  
**Por que não pertence ao frontend:** cálculo depende da jornada configurada e dos períodos de task ativa.  
**Impacto no frontend:** frontend não pode calcular nem confirmar horas extras.  
**O que o backend precisa fornecer:** jornada por colaborador e períodos marcados apenas como `possible_overtime`, conforme RF-22.

### Problema encontrado: autenticação/RBAC não disponível no contrato atual utilizado pelo frontend
**Local:** aplicação inteira  
**Por que não pertence ao frontend:** segurança efetiva e escopo de dados precisam ser validados pelo servidor.  
**Impacto no frontend:** não é seguro criar apenas uma tela de login ou esconder itens e considerar RF-02/RNF-05 atendidos.  
**O que o backend precisa fornecer:** cadastro/login do gestor, sessão/token, endpoint do usuário atual e respostas 401/403 com escopo de dados autorizado.

### Problema encontrado: exportação atual não atende RF-24/RF-25
**Local:** `ReportsAndAgent`  
**Por que não pertence ao frontend:** o endpoint atual exporta somente dados diários/categorias e não recebe todos os filtros obrigatórios.  
**Impacto no frontend:** CSV/PDF foram desabilitados para evitar relatório incompleto apresentado como válido.  
**O que o backend precisa fornecer:** exportação CSV/PDF baseada nos filtros correntes, contendo tasks, tempo por task, ativo/inativo, jornada, possível overtime e timeline conforme o formato aplicável.

## Validações realizadas

1. Escopo de arquivos: todos os arquivos desta entrega estão sob `FrontEnd/`.
2. Busca estática por conceitos removidos: nenhum resultado para `getProductive`, `Tempo produtivo`, `categorias produtivas`, `ranking de aplicativos` ou `Relatorio de Produtividade` nos arquivos alterados.
3. Busca estática por fallback demo: nenhum resultado para `demoPeople`, `demoCategories`, `useDemoData` ou `Modo demonstração` nos arquivos alterados.
4. Smoke test das funções puras de `src/utils/dashboard.js` executado via Node: **OK**.
5. Execução de Vitest/build: **não executada**, pois o ambiente de trabalho não possui `node_modules` e não possui acesso direto à internet para instalar dependências. Os testes foram atualizados para refletir as mudanças e devem ser executados no ambiente normal do projeto com `npm ci && npm test && npm run build`.

## Riscos e pontos de atenção

- Esta entrega não altera `FrontEnd/src/services/api.js`; portanto nenhum contrato existente foi quebrado.
- Cards com `—` representam dados realmente indisponíveis, não erro de renderização.
- Exportação ficou temporariamente indisponível até que o backend produza um contrato compatível; isso é intencional para evitar relatório incorreto.
- `CategoryChart` foi mantido como componente legado para não quebrar imports externos, mas não é mais renderizado pelo `App`.
- `AppsCard` foi mantido e alinhado ao conceito de dentro/fora do escopo, porém não é renderizado sem dados reais.
- Login, cadastro, CRUD de tasks, jornada e associação não foram simulados no frontend porque a segurança e persistência dependem de endpoints inexistentes no contrato atualmente consumido.

## Checklist

- [x] Remover métrica de produtividade do Dashboard
- [x] Remover regra `getProductiveSeconds`
- [x] Remover ranking de aplicativos
- [x] Remover fallback automático de dados demo
- [x] Não exibir `window_title` na tabela da equipe
- [x] Exibir os seis indicadores previstos no layout do Dashboard
- [x] Não inventar valores para indicadores sem API
- [x] Preparar Timeline com campos exigidos no RF-27
- [x] Preparar AppsCard para Dentro/Fora do escopo
- [x] Criar empty states explícitos
- [x] Manter retry em erro de API
- [x] Atualizar testes afetados
- [x] Documentar dependências do backend
- [ ] Filtro por período — depende da API
- [ ] Filtro por task — depende da API
- [ ] Offline consolidado — depende da equipe associada na API
- [ ] Tasks ativas — depende da API de tasks
- [ ] Tempo ativo/inativo — depende dos períodos na API
- [ ] Possível hora extra — depende de jornada/overtime na API
- [ ] Timeline real — depende dos registros associados a task
- [ ] Exportação CSV/PDF completa — depende do backend
- [ ] Login/sessão/RBAC — depende do backend de autenticação
- [ ] CRUD de tasks — depende da API de tasks
- [ ] Jornada/inatividade por colaborador — depende da API de configurações
