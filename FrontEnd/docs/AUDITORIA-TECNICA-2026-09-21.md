# Auditoria técnica completa — alterações restritas ao FrontEnd

Data local: 21/09/2026. Escopo de escrita: exclusivamente `FrontEnd/`.
O checkout estava sem alterações no início. Backend, banco, requisitos e
configurações externas foram consultados somente para leitura. Esta revisão
complementa, sem atribuir a si, correções registradas em relatórios anteriores.

## 1. Visão geral e método

- **Frontend ativo:** JavaScript/JSX, React 18.2, React DOM, Vite, Tailwind,
  PostCSS, Autoprefixer e Recharts. Navegação por hash, sem React Router.
  `main.jsx` monta `App` em StrictMode; páginas usam componentes, hooks e um
  serviço HTTP central. Sem Context global, TypeScript ou Axios.
- **Fluxo operacional:** painel seleciona data/username → `useDashboardData`
  coordena estado e cancelamento → `api.js` consulta resumo, realtime e usuários
  → componentes exibem dados confirmados. Polling de 30 s pausa em aba oculta.
  Histórico de seis dias é reutilizado no polling; atualização manual reconsulta
  tudo. Nove consultas no carregamento completo, três no polling com cache válido.
- **Backend:** Python, FastAPI, Pydantic e SQLAlchemy síncrono; routers delegam a
  `crud.py`, com sessões fornecidas por `database.py`. CORS é o middleware
  explicitamente configurado. Não há middleware/dependência de autenticação.
- **Banco:** PostgreSQL 18 no Compose. Entidades User, Category,
  CategorizationRule, ActivityLog e SystemSettings. IDs UUID, relações por chaves
  estrangeiras, datas com timezone. Inicialização por `create_all`, seed separado;
  não há migrations versionadas neste checkout.
- **Infraestrutura:** Dockerfile Python 3.14 e Compose para API, seed e banco;
  nenhum pipeline CI/CD versionado encontrado. Não foram iniciados backend,
  containers ou banco, pois a inicialização da API cria tabelas.
- **Legado:** protótipo Blazor/C# .NET 10 em `FrontEnd/legacy/blazor`, com CSS/JS
  próprios e dados demonstrativos. Há instruções de consulta em `docs/BACKEND.md`;
  não integra o build React e foi preservado.
- **Integrações:** REST JSON por fetch; Google Fonts no HTML; agente desktop
  previsto pelos requisitos e pelo endpoint de ingestão, sem implementação neste
  checkout. A SPA atual não possui manifest/service worker de PWA.
- **Testes:** Vitest, Testing Library, jest-dom, jsdom e cobertura V8. Sem E2E,
  lint ou type-check configurados. Testes não validam um servidor real.

Inspeção: árvore e arquivos versionados/ocultos relevantes, fontes ativas, routers,
schemas, modelos, CRUD, configuração, documentação, legado e requisitos.
Imports foram verificados também por AST com o parser já instalado. Entradas de
build, barrels, estilos, testes e referências indiretas foram considerados antes
de remover código. Nenhum arquivo foi removido por mera ausência de import.

## 2. Diagnóstico e alterações implementadas

Cada linha contém problema, arquivo, impacto, motivo, solução e benefício.
Os caminhos abaixo são relativos a `FrontEnd/`.

| Arquivo | Problema / impacto | Alteração, justificativa e benefício |
| --- | --- | --- |
| `src/services/api.js` | **Alto:** JSON de resumo inválido era normalizado para `users: []`; data incorreta podia quebrar o gráfico e arrays com `null` podiam quebrar componentes. | Validar data esperada e os campos efetivamente consumidos: username/string, total_seconds/inteiro seguro, estado online/ausente, process_name/string e seconds_since_last_activity/inteiro seguro. full_name continua nullable. Resumo principal inválido vira erro; fontes opcionais inválidas ficam indisponíveis, sem simular zero. Campos adicionais permanecem preservados. |
| `src/services/api.js` | **Médio:** uma consulta sem resposta mantinha o painel carregando, sem prazo próprio; o próximo polling podia simplesmente abortar e repetir. | Timeout de 15 s por requisição, cobrindo fetch e corpo JSON, com AbortController local, propagação do cancelamento externo e limpeza de timer/listener no finally. Timeout é distinguido de cancelamento de navegação. Não há retry automático de mutações ou loops de retry. |
| `src/services/api.js` | **Baixo:** logs opcionais incluíam o objeto de erro, potencialmente com URL/contexto de transporte. | Avisos fixos sem objeto de erro nem corpo de resposta. Status HTTP permanece no erro interno; a interface mantém sua mensagem segura. |
| `src/hooks/useDashboardData.js` | **Médio:** atualizar manualmente mantinha o histórico em cache indefinidamente, embora a ingestão aceite captured_at antigo. | Separar callback periódico e atualização manual; a manual limpa o cache. Preserva economia de rede no polling e permite recuperar dados sincronizados com atraso. Cancelamento e proteção contra respostas obsoletas existentes foram mantidos. |
| `src/App.jsx` | **Médio:** o link de salto alterava o hash para um fragmento que o roteador não reconhece e voltava ao painel. | Prevenir a navegação do link e focar o main já focável. Usuário de teclado permanece na tela escolhida. |
| `src/components/Header.jsx` | **Médio:** quando a lista de usuários sumia durante troca de filtro/falha opcional, o select podia mostrar “Toda a equipe” enquanto o filtro continuava individual. | Manter uma opção com o username selecionado quando ele não existe na lista recebida. Evita discrepância entre filtro visível e consulta. |
| `src/components/Sidebar.jsx` | **Médio:** ao atravessar o breakpoint desktop, o modal era ocultado por CSS, mas seu estado e contenção de foco continuavam ativos. Em telas baixas faltava rolagem interna. | Fechar o modal em mudança de matchMedia e remover o listener ao desmontar; adicionar overflow-y-auto ao painel. Evita retenção de foco em conteúdo invisível e permite alcançar os links inferiores. |
| `vite.config.js` | **Baixo:** `build.esbuild` não é opção de BuildOptions; `__APP_VERSION__` não tinha consumidor. | Remover configuração ineficaz e define morto. A opção esbuild pertence ao nível superior, conforme tipos da versão instalada; não foi movida para apagar logs úteis inadvertidamente. |
| `vitest.config.js` | **Médio:** cobertura contabilizava bundles gerados, configurações e JS do protótipo Blazor. | Delimitar include a `src/**/*.{js,jsx}`, mantendo exclusão de setup e exclusões padrão de testes. Métrica reproduzível do aplicativo ativo, incluindo código src sem testes. |
| `.gitignore`, `package-lock.json` | **Médio:** lockfile do frontend era ignorado, impedindo instalação reproduzível a partir de checkout limpo. | Remover a exclusão do package-lock, incluir o lockfile atualizado e ignorar o cache npm local. Lockfile global da raiz permanece intacto. |
| `package.json`, `package-lock.json` | **Crítico/Alto nos advisories:** versões antigas de ferramentas de desenvolvimento apresentavam vulnerabilidades conhecidas. | Atualizar Vite 5.0.8 → 5.4.21, Vitest/coverage 3.2.4 → 3.2.7 e PostCSS 8.4.32 → 8.5.28. Sem mudança de major ou novas dependências diretas. Conferidas notas/advisories e compatibilidade por instalação, testes, cobertura e build. Riscos residuais estão abaixo. |
| `src/App.test.jsx`, testes de API, hook, Header e Sidebar | **Médio:** faltavam regressões dos comportamentos acima; fixture aceitava users:null apesar do schema não nullable. | Adicionar casos de navegação/foco, filtro sem usuários, resize, cache manual, payload inválido, timeout do corpo, cancelamento e HTTP 422; corrigir fixture para lista válida. |
| README, relatório anterior e docs de arquitetura/hooks/testes/refatoração | **Baixo:** instruções não refletiam lockfile, versões, cache manual, timeout ou validação desta revisão. | Atualizar documentação ativa, apontar relatório atual e preservar relatórios anteriores como histórico. |

### Pontos auditados e preservados

- Componentes e páginas têm tamanho administrável. Não houve justificativa para
  adicionar camadas, Context, gerenciador de cache ou migrar para TypeScript.
- Não foram encontrados imports não usados nos 50 módulos JS/JSX de `src`.
  As dependências diretas têm consumidores no app, ferramentas, testes ou config.
- Não há inserção de HTML com dangerouslySetInnerHTML no app ativo. Campos API
  são renderizados como texto React. localStorage guarda apenas o tema; não há
  sessão/token de autenticação implementado ou persistido pelo frontend.
- Não foram identificados segredos hardcoded no código ativo do frontend nem
  arquivo `.env` real versionado. `.env.example` contém URL pública de API.
  Isso não equivale a uma varredura de histórico Git ou de credenciais externas.
- A tabela acessível do gráfico, labels, mensagens de erro, estados vazios,
  reduced-motion e cancelamento em mudança de filtro já existiam e foram mantidos.
- Não foram aplicados memoizações, virtualização ou lazy loading sem medição que
  justificasse a mudança. O build já separa gráficos e vendor em chunks.
- O fonte contém poucas repetições de layout; não foi criada abstração só para
  uniformizar classes. Protótipos e documentos históricos não são código morto.

## 3. Mapa Frontend ↔ Backend

Fonte da verdade: `backend/app/routers/*.py`, `schemas.py`, `models.py` e `crud.py`.
Compatibilidade confirmada por leitura do código e testes frontend; não por
execução do backend ou consulta a um ambiente remoto.

| Endpoint / método | Request e response reais | Uso/decisão no frontend |
| --- | --- | --- |
| `GET /dashboard/summary` | Query `date` obrigatória AAAA-MM-DD (alias de target_date), username opcional. `{date, users:[{username,total_seconds,by_category:[{category,color,total_seconds}]}]}`. users é lista, não null. | Resumo diário e sete dias. Mantém snake_case, codificação de query e segundos; valida os campos usados. Não converte total registrado em produtividade ou tempo ativo. |
| `GET /activities/realtime` | Lista de `{username,hostname,process_name,window_title,category,is_idle,seconds_since_last_activity,status}`. window_title/category nullable. Janela de 15 min; status produzido é online ou ausente. | Exibe username, aplicação, status e tempo desde leitura. Não interpreta ausente como offline. Resposta é atual, não histórica: não aceita date/username; filtro username é aplicado localmente. |
| `GET /users/` | Lista de `{id,username,full_name,department,created_at}`. id UUID string no JSON; nome/departamento nullable. Sem paginação. | Usa username como chave de filtro, full_name com fallback. Não inventa relação gestor-equipe. |
| `GET /dashboard/export/csv`, `/pdf` | Query date obrigatória e username opcional; conteúdo binário/texto de resumo diário por categoria. | Endpoints existem, mas não satisfazem relatório por período/task/jornada. Botões continuam desabilitados conforme estado anterior e requisitos. |
| `GET/PUT /config/` | capture_interval_seconds e idle_timeout_seconds inteiros >=1; updated_at nullable. PUT usa defaults 10/300 se omitidos. Configuração global. | Não substitui configuração por colaborador. Formulário existente permanece bloqueado; nenhuma mutação nova foi adicionada. |
| `GET/POST /categories/` | UUID, name e color (default #6B7280). | Sem consumidor ativo; não é API de tasks. |
| `GET/POST /categories/rules`, `PUT/DELETE /categories/rules/{rule_id}` | category_id UUID, keyword e match_field process/title/both; update com campos opcionais/nullable; delete 204, inexistente 404. | Nenhuma chamada ativa. Não renomear categoria para task ou reinterpretar IDs. |
| `POST /activities/` | username, hostname, process_name; window_title nullable; duration_seconds >=0; is_idle default false; captured_at opcional. Response 201 com IDs UUID e captured_at. | Exclusivo da ingestão do agente. Aceita timestamp passado, motivo para permitir revalidar histórico no painel. |

Não há endpoints de autenticação, refresh token, sessão, upload, associação,
tasks, jornada por colaborador ou Activity Timeline. Não há paginação nas listas
atuais. Erros de query são tratados pelo FastAPI; o frontend mantém feedback
genérico de erro HTTP sem expor corpo interno.

**Inconsistências corrigidas no frontend:** resumo tolerava campo não nullable
como se fosse vazio; listas só validavam o contêiner; filtro visível podia divergir
do username enviado; cache pressupunha histórico imutável. Não foi encontrado
problema de endpoint ou nome snake_case/camelCase nas consultas ativas. Datas são
enviadas como chaves de calendário, sem conversão de fuso inventada no cliente.

## 4. Refatorações

- Validação concentrada na fronteira de rede, antes de dados chegarem aos componentes.
- Função única de consulta mantém timeout, erro HTTP e cleanup; funções opcionais
  convertem indisponibilidade em flags sem encobrir falha principal.
- Separação mínima entre refresh manual e periódico, sem biblioteca de cache.
- Eliminação de normalizações redundantes após a validação dos resultados.
- Remoção de configuração sem efeito e escopo explícito da cobertura.

## 5. Código removido e critérios

- Funções `normalizeSummary` (substituída por validação) e `asArray` (redundante
  após validação/fallback) em `src/services/api.js`.
- Ramificação duplicada que reconstruía fallback histórico já produzido pela consulta opcional.
- Define `__APP_VERSION__`: busca nos fontes e configurações não encontrou consumidor.
- Bloco `build.esbuild`: posição não suportada pela configuração instalada.
- Nenhum import, componente, arquivo de código, asset ou dependência direta removido.
  O npm removeu três pacotes transitivos ao resolver as atualizações; isso não foi
  tratado como evidência de bibliotecas diretas sem uso.
- Sem imports dinâmicos/import.meta.glob no app atual; barrels têm uso efetivo.
  O legado continua com entrada .NET própria e referência documental.

## 6. Dependências e segurança residual

O `npm audit` inicial encontrou **6 pacotes afetados: 2 críticos, 2 altos e 2
moderados**, incluindo efeitos transitivos. Após as atualizações: **6 pacotes,
0 críticos, 1 alto e 5 moderados**. O número de pacotes não é número de falhas
independentes. `npm audit --omit=dev` terminou com **zero ocorrências conhecidas**.

Restam Vite (alto), esbuild, @vitejs/plugin-react, Vitest, @vitest/mocker e
@vitest/coverage-v8 (moderados, alguns por propagação). Ferramentas de build/teste
nunca devem ser confundidas com proteção de produção. A correção integral indicada
pelo registro exige mudança de major; não foi usado `npm audit fix --force` nem
override de transitive sem compatibilidade comprovada.

Fontes consultadas:

- [Advisory oficial Vitest GHSA-5xrq-8626-4rwp](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp): exploração condicionada a UI/API/Browser Mode, incluindo cenários Windows. A configuração deste projeto usa jsdom e não habilita servidor UI/API público.
- [Release Vitest 3.2.7](https://github.com/vitest-dev/vitest/releases/tag/v3.2.7): backport de verificação de acesso a arquivos no browser.
- [Advisory oficial Vite GHSA-fx2h-pf6j-xcff](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff): problema de acesso a arquivos em caminhos alternativos Windows; a versão 5 permanece afetada no audit.
- [Changelog Vite 5.4.21](https://github.com/vitejs/vite/blob/v5.4.21/packages/vite/CHANGELOG.md) e [release PostCSS 8.5.28](https://github.com/postcss/postcss/releases/tag/8.5.28).

As atualizações mantêm os majors e passaram pelo build/testes locais, mas isso
não comprova compatibilidade com todas as instalações/integrações externas.
Não há evidência de exploração no repositório; não se afirma ausência de risco.

## 7. Problemas externos identificados — nenhum arquivo externo alterado

### Problema externo identificado — controle de acesso (Crítico)

**Local:** `backend/app/main.py`, `backend/app/routers/*.py`, `backend/app/crud.py`.

**Problema:** rotas de leitura e escrita não exigem identidade/permissão, consultas
não restringem equipe por gestor e CORS permite qualquer origem com credentials.

**Impacto no frontend:** login é apenas estrutura visual; filtrar username na UI
não implementa o RBAC exigido nem impede acesso direto aos dados.

**Possível contorno no frontend:** nenhum que constitua autorização real.
Preservadas ações não integradas como desabilitadas; não criada sessão fictícia.

**Recomendação para a equipe responsável:** implementar autenticação, autorização
por recurso e relação gestor-colaborador, e definir origens CORS/HTTPS de implantação.

### Problema externo identificado — contratos funcionais ausentes (Alto)

**Local:** `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/`.

**Problema:** API por categorias não implementa tasks, associação, jornadas,
períodos de atividade, consentimento nem relatórios completos dos requisitos atuais.

**Impacto no frontend:** páginas e métricas correspondentes permanecem indisponíveis.

**Possível contorno no frontend:** estados explícitos já existentes; categorias,
is_idle e duração total não substituem tasks, timeline ou métricas históricas.

**Recomendação para a equipe responsável:** acordar DTOs, permissões e persistência
antes de habilitar os formulários e exportações completos.

### Problema externo identificado — configuração de inatividade (Médio)

**Local:** `backend/app/crud.py:get_realtime_view`, `update_settings`, `utils.py`.

**Problema:** atualização salva idle_timeout_seconds no banco, mas realtime usa
MAX_IDLE_SECONDS carregado do ambiente, sem ler a configuração persistida.

**Impacto no frontend:** status pode divergir do limite configurado globalmente.

**Possível contorno no frontend:** exibir status fornecido; recalculá-lo esconderia
a divergência e não corrigiria o agente nem outros consumidores.

**Recomendação para a equipe responsável:** unificar a fonte de configuração e
testar alteração do limite com o cálculo de status.

### Problema externo identificado — classificação both (Médio)

**Local:** `backend/app/crud.py:categorize`.

**Problema:** keyword e campos individuais são convertidos para minúsculas, mas
o fallback usado em match_field=both concatena os valores originais.

**Impacto no frontend:** categoria e totais podem não refletir a regra pretendida
quando processo/título têm maiúsculas.

**Possível contorno no frontend:** nenhum seguro para dados agregados já gravados.

**Recomendação para a equipe responsável:** normalizar o alvo de both e avaliar
o tratamento de dados classificados anteriormente.

### Problema externo identificado — empates no realtime (Médio)

**Local:** `backend/app/crud.py:get_realtime_view`, `backend/app/models.py:ActivityLog`.

**Problema:** join pela maior captured_at pode selecionar várias linhas do mesmo
usuário em empate; não há desempate nem chave única de ingestão.

**Impacto no frontend:** contagem pode duplicar pessoas e keys por username da
tabela podem colidir. É um cenário possível pela consulta, não reproduzido em banco.

**Possível contorno no frontend:** deduplicar arbitrariamente descartaria informações
de máquinas/status; não foi aplicado.

**Recomendação para a equipe responsável:** definir identidade da linha, desempate
determinístico e idempotência da ingestão; então testar contagem/status na UI.

### Problema externo identificado — definição do dia (Médio)

**Local:** `backend/app/crud.py:get_daily_summary`, `backend/app/database.py`.

**Problema:** agrupamento usa date(captured_at) sobre timestamp com timezone;
não há política explícita de fuso do negócio/sessão no código inspecionado.

**Impacto no frontend:** registros próximos da meia-noite podem pertencer a um dia
diferente daquele esperado no navegador. Depende da configuração real do banco.

**Possível contorno no frontend:** continuar enviando AAAA-MM-DD; deslocar datas
no cliente sem contrato seria incorreto.

**Recomendação para a equipe responsável:** definir fuso, limites inclusivo/exclusivo
das consultas e testes de fronteira temporal.

### Problema externo identificado — exportação CSV (Alto, condicionado ao conteúdo)

**Local:** `backend/app/routers/dashboard.py:export_csv`.

**Problema:** username e categoria entram diretamente em células via csv.writer;
escape de CSV não neutraliza interpretação de fórmulas pela planilha.

**Impacto no frontend:** um arquivo do endpoint pode carregar fórmulas caso os
campos contenham entradas interpretadas como tal. Exportação atual da UI permanece bloqueada.

**Possível contorno no frontend:** não reativar a exportação como relatório completo;
sanitização só na UI não protege consumidores diretos da API.

**Recomendação para a equipe responsável:** estabelecer política de exportação
segura para planilhas, testar caracteres especiais e revisar o PDF para Unicode.

Não foram alterados Docker, configuração de banco, migrations, seed ou requisitos.
Não se fez auditoria dinâmica de infraestrutura ou testes de invasão.

## 8. Validação

Ambiente: Windows, Node 24.18.0, npm 11.16.0. Comandos executados em `FrontEnd/`.

| Verificação | Resultado |
| --- | --- |
| Baseline `npm test` | 18 arquivos, 57 testes aprovados antes das alterações. |
| Dependências | npm install direcionado com versões exatas e ignore-scripts; npm ls --depth=0 sem dependências ausentes/inválidas. |
| Testes finais `npm run test:coverage` | **19 arquivos, 70 testes aprovados** com Vitest 3.2.7, incluindo DTOs completos, nullables e username com caracteres especiais. |
| Cobertura ativa | **88,10% linhas/statements, 87,58% branches, 82,43% funções**. API e useDashboardData: 100% linhas. Não é cobertura E2E. |
| Build `npm run build` | **Aprovado**, Vite 5.4.21, 866 módulos; sem warnings de compilação/chunk. JS: app 42,82 kB, vendor 171,97 kB, charts 326,91 kB; CSS 29,16 kB, antes de gzip. |
| Imports/sintaxe | AST de 50 módulos JS/JSX: nenhum import sem uso; build resolveu imports do aplicativo. |
| Lint | **Não configurado**; nenhum script/dependência de lint foi inventado como substituto. |
| Type-check | **Não configurado**, projeto JavaScript; validação runtime de campos não equivale a type-check. |
| Audit completo | **Pendências:** 1 alto e 5 moderados, 0 críticos. Código de saída 1 esperado por vulnerabilidades restantes. |
| Audit produção | **Zero ocorrências conhecidas**, saída 0. |
| Whitespace/escopo | git diff --check e comparação de caminhos; alterações restritas a FrontEnd. |

Testes/build precisaram de execução autorizada fora do sandbox por acesso negado
do esbuild ao resolver diretórios superiores. Rede npm também exigiu autorização.
Artefatos `dist`, `coverage`, `node_modules` e `.npm-cache` ficam dentro de FrontEnd
e são ignorados pelo Git. Nenhum browser/E2E ou API real foi utilizado; responsividade
foi inspecionada em classes/layout e resize simulado em jsdom, sem comprovação visual
em dispositivos. Avisos do Git sobre LF/CRLF são conversão local de Windows.

## 9. Arquivos modificados ou adicionados nesta revisão

Todos os caminhos abaixo pertencem à pasta autorizada:

```text
FrontEnd/.gitignore
FrontEnd/README.md
FrontEnd/RELATORIO-AUDITORIA-FRONTEND.md
FrontEnd/docs/ARQUITETURA.md
FrontEnd/docs/AUDITORIA-TECNICA-2026-09-21.md (novo)
FrontEnd/docs/HOOKS.md
FrontEnd/docs/README.md
FrontEnd/docs/REFACTORING.md
FrontEnd/docs/TESTES.md
FrontEnd/package.json
FrontEnd/package-lock.json (passa a ser versionado)
FrontEnd/src/App.jsx
FrontEnd/src/App.test.jsx (novo)
FrontEnd/src/components/Header.jsx
FrontEnd/src/components/Header.test.jsx
FrontEnd/src/components/Sidebar.jsx
FrontEnd/src/components/Sidebar.test.jsx
FrontEnd/src/hooks/useDashboardData.js
FrontEnd/src/hooks/useDashboardData.test.js
FrontEnd/src/services/api.js
FrontEnd/src/services/api.test.js
FrontEnd/vite.config.js
FrontEnd/vitest.config.js
```

## 10. Recomendações futuras

1. **Fora do escopo:** priorizar autenticação/autorização, contratos e problemas
   de dados listados na seção 7. O frontend não pode garantir isolamento de equipe.
2. **Migração com risco:** planejar atualização dos majors Vite/Vitest e plugins
   compatíveis para eliminar advisories residuais; validar versão Node, HMR,
   publicação sob subpath e comportamento real do navegador. Não expor servidores
   de desenvolvimento/teste como infraestrutura de produção.
3. **Decisão de equipe:** introduzir lint (incluindo regras de hooks), considerar
   tipos gerados de OpenAPI/JSDoc ou TypeScript, sem reescrita automática nesta auditoria.
4. **Validação visual/E2E:** cobrir navegação, teclado/leitor de tela, telas baixas,
   alto zoom, contraste, gráfico e falhas de rede em browser real. Há cobertura
   baixa nas páginas de integração pendente e no TimelineCard ainda sem dados reais.
5. **Contrato/escala:** definir paginação para usuários/realtime, fuso horário e
   atualização automática de histórico quando forem conhecidos os requisitos de
   sincronização. Hoje a revalidação histórica completa é manual ou por mudança de filtro.
6. **Implantação/produto:** resolver HTTPS, política de fontes externas e eventual
   PWA. Nenhuma dessas decisões foi simulada nesta revisão.

## Sugestão de commit

**Título:** `fix(frontend): harden API handling and dashboard navigation`

**Descrição:**

```text
Validate consumed API fields and bound requests to 15 seconds with cancellation.
Revalidate history on manual refresh and preserve selected user filters.
Fix skip-link routing and mobile navigation across desktop breakpoints.
Apply same-major security updates and track the frontend lockfile.
Remove redundant normalization and ineffective Vite configuration.
Scope coverage to src and document API contracts and external blockers.

Validation: 70 tests passing; production build passing; imports checked.
Lint/type-check are not configured. Audit still reports 1 high and 5 moderate.
All changes are restricted to FrontEnd/.
```

## Sugestão de Pull Request

**Título:** Corrige resiliência da API e navegação do frontend

### Contexto

Auditoria do repositório para corrigir falhas verificáveis no frontend preservando
o contrato atual do servidor e as funcionalidades ainda dependentes de integração.

### Problemas encontrados

Respostas inválidas eram aceitas como vazio, consultas não tinham timeout,
atualização manual não revalidava histórico, filtro selecionado podia desaparecer,
link de salto trocava a rota e modal mobile permanecia ativo após resize.
Havia ferramentas vulneráveis, lockfile ignorado e cobertura incluindo artefatos.

### Alterações realizadas

Validação de campos e prazo/cancelamento no serviço; revalidação manual; correções
de navegação e filtros; updates dentro dos majors atuais; lockfile versionado;
remoção de normalização redundante/configuração ineficaz; testes e documentação.

### Integração com backend

Mantidos endpoints, snake_case, username, datas e valores nullable reais. Falhas
opcionais continuam degradando apenas sua fonte. Registro atrasado pode ser
recuperado por refresh manual. Autenticação, tasks, jornadas e relatórios completos
continuam pendentes de backend; nenhum contrato foi inventado.

### Escopo

Todas as alterações deste Pull Request estão restritas à pasta do frontend.
Backend, banco de dados e demais áreas do projeto foram utilizados exclusivamente
como referência e não foram modificados.

### Validação

- Build: aprovado.
- Testes: 70 aprovados em 19 arquivos; cobertura de linhas 88,10% de src.
- Lint: não configurado.
- Type-check: não configurado.
- Imports: AST e build aprovados.
- Audit: zero críticos; permanecem 1 alto e 5 moderados em ferramentas; produção sem ocorrências conhecidas.
- Backend real e browser/E2E: não executados.

Commit e PR são sugestões: não foram criados ou publicados.
