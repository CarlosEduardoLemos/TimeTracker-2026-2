# Auditorias do frontend

[Voltar ao README](../README.md). Evidências consolidadas das revisões existentes.
Datas, contagens, advisories e limitações pertencem à execução indicada, sem nova
certificação de segurança, backend ou testes nesta edição documental.

- [Revisão completa de 25/09/2026](#auditoria-25)
- [Organização e navegação de 25/09/2026](#organizacao-25)
- [Revisão de 23/09/2026](#auditoria-23)
- [Revisão de 21/09/2026](#auditoria-21)
- [Mapa da consolidação documental](#consolidacao)

Contratos e problemas externos têm sua descrição canônica em [Integração](INTEGRACAO.md).
Decisões, remoções e entregas iniciais estão em [Refatoração](REFATORACAO.md).

<a id="auditoria-25"></a>

## Revisão completa — 25/09/2026

Escopo de escrita exclusivamente `FrontEnd/`, checkout inicialmente limpo;
backend consultado apenas para contratos. Esta é a revisão técnica mais recente
dos documentos de origem, posterior à organização e navegação da mesma data.

### Resumo geral

A base é pequena e bem separada, com tratamento de falhas mais maduro que as
integrações de negócio. O painel consulta dados reais; as demais telas são
estruturas explícitas de integração pendente. Não há justificativa para migrar
framework, introduzir store global ou reorganizar tudo por features neste tamanho.

| Área revisada | Estado e avaliação |
| --- | --- |
| Framework/linguagem | React 18.2, React DOM, JavaScript/JSX ESM; sem TypeScript ou interfaces estáticas |
| Build/pacotes | npm com lockfile; Vite, plugin React, PostCSS, Autoprefixer, Tailwind 3; versões corrigidas abaixo |
| Rotas | Hash próprio com sete destinos: painel, colaboradores, tasks, relatorios, configuracoes, login, cadastro; hash desconhecido cai no painel, sem 404 dedicada |
| Estado | useState local; tema em App; dados/cache em useDashboardData; sem Context/Redux ou persistência de dados operacionais |
| Hooks | Consulta/cancelamento/cache, polling com pausa por visibilidade, tema, hash; efeitos com cleanup; sem quebra de regras de hooks identificada na leitura |
| Componentes | Layout, cards, cabeçalhos, gráfico, tabela, timeline, avisos e ErrorBoundary; páginas com composição explícita e imports lazy |
| API | fetch centralizado, VITE_API_URL, timeout de 15 s, abort por lote/request, HTTP/JSON validados, degradação de fontes opcionais e retry manual/polling |
| Contratos | Conferidos schemas, routers e CRUD de summary, realtime e users; filtros codificados; realtime não recebe data histórica |
| Autenticação | Não implementada no servidor nem no cliente. Sem tokens/refresh/session; login/cadastro não enviam dados |
| Formulários | Labels e validação local; submits de negócio bloqueados por falta de contrato. Não existe escrita HTTP ativa ou risco atual de duplo envio |
| Estilos/assets | Tailwind, tokens e classes comuns; Google Fonts externas com fallback; sem imagens locais grandes ou assets operacionais órfãos |
| Acessibilidade | Skip link, títulos, labels, tabela alternativa do gráfico, teclado no menu e reduced-motion existentes; contraste e navegação mobile melhorados |
| Testes | Vitest/Testing Library/jsdom, 20 arquivos; bons cenários de API, cancelamento, cache, estados e componentes; sem E2E |
| Qualidade automática | EditorConfig; ausência de ESLint, Prettier executável, Husky, lint-staged, typecheck e CI |
| Organização | components/pages/hooks/services/utils/constants/data/test adequados; sem diretórios vazios novos ou divisão artificial de componentes |
| Código morto | Análise AST de 52 módulos: nenhum import relativo quebrado ou import sem referência; todos os módulos runtime alcançáveis por main.jsx; nenhuma duplicação exata runtime |
| Git/segredos | Sem .env real, node_modules, dist ou coverage versionados no frontend; busca nos fontes não encontrou credenciais. localStorage contém somente tema |
| Logs | Sem console.log/debug operacionais; warnings de API não incluem payload; ErrorBoundary agora restringe detalhes a desenvolvimento |

SOLID/DRY/KISS foram avaliados pragmaticamente: componentes pequenos repetindo
layout não exigem novas abstrações. Não foram encontrados processamentos que
justifiquem memoização adicional. Listas ainda não têm paginação/virtualização;
dimensionamento exige volume real antes de introduzir essas estratégias.

### Problemas críticos

| Severidade | Achado, evidência e impacto | Resultado |
| --- | --- | --- |
| 🔴 CRÍTICO | Routers FastAPI dependem de get_db, sem identidade/autorização; users é global e summary aceita username arbitrário. Se a API estiver acessível, filtros visuais não isolam dados do gestor | Pendente fora do escopo; não foi criada proteção fictícia no React |
| 🟠 ALTO | npm audit inicial: 6 ocorrências (1 alta, 5 moderadas), incluindo bypass de proteção de arquivos do Vite no Windows quando servidor de desenvolvimento é exposto | Corrigido por atualização de ferramentas; audit final sem advisories |
| 🟠 ALTO | .gitignore cobria apenas algumas variantes de .env; .env.staging e .env.test podiam ser adicionados por engano | Corrigido com .env.* e exceção explícita para .env.example; nenhum vazamento atual encontrado |
| 🟡 MÉDIO | ErrorBoundary enviava objetos de exceção e stack ao console também em produção, podendo carregar detalhes de dados | Log detalhado condicionado a import.meta.env.DEV; regressão cobre ausência do log em produção |

Fontes primárias das correções: [advisory Vite](https://github.com/vitejs/vite/security/advisories/GHSA-fx2h-pf6j-xcff)
e [advisory Vitest](https://github.com/vitest-dev/vitest/security/advisories/GHSA-82fw-gwwq-j7x9).
A contagem npm inclui dependências afetadas por transitividade, não seis falhas
independentes na aplicação publicada. Zero advisories não certifica segurança absoluta.

### Melhorias importantes

| Severidade | Achado | Resultado |
| --- | --- | --- |
| 🟡 MÉDIO | Drawer não fechava ao mudar hash pelo histórico, deixando rolagem bloqueada; Tab não recuperava foco que escapasse por outro mecanismo | Listener hashchange com cleanup e recuperação de foco; duas regressões |
| 🟡 MÉDIO | Texto muted #7b8098 sobre branco: 3,90:1; cabeçalhos slate-400: 2,56:1; status verde/âmbar: 3,77:1 e 3,19:1 | Token muted por tema, cabeçalhos/placeholder/eixo do gráfico usam token; status usam tons 700 no claro e 400 no escuro |
| 🟡 MÉDIO | Ausência de lint e regras automáticas de hooks/imports | Registrada; análise AST pontual não substitui lint. Não foi acrescentada cadeia de ferramentas para mascarar esse resultado |
| 🟡 MÉDIO | Testes de integração usam mocks e não cobrem API real, layout ou acessibilidade completa | Registrado; cobertura unitária não foi tratada como certificação E2E |
| 🟢 BAIXO | Requisitos de Node e versões documentadas ficariam incorretos após atualização | README atualizado, inclusive orientação npm.cmd no PowerShell |

O novo muted claro é #475569 e o escuro #94a3b8. Foram escolhidos para superar
4,5:1 nos fundos de texto secundário usados no projeto. Critério de referência:
[WCAG 2.2, contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
O cálculo de cores não substitui inspeção de todos os estados renderizados.

### Melhorias opcionais

- 🔵 SUGESTÃO: implantar ESLint com regras React/hooks e validação CI em uma entrega dedicada.
- 🔵 SUGESTÃO: contratos JSDoc ou TypeScript incremental quando a API de negócio estabilizar.
- 🔵 SUGESTÃO: página 404, título de documento por rota e anúncio/foco de navegação SPA; fallback atual foi preservado.
- 🔵 SUGESTÃO: auto-hospedar fontes caso seja necessário remover dependência de rede externa.
- 🔵 SUGESTÃO: medir tamanho real da equipe e custo de renderização antes de paginação/virtualização.
- Consolidação documental realizada posteriormente; veja o [mapa de origem e destino](#consolidacao).

### Arquivos alterados

Caminhos relativos a `FrontEnd/`.

| Arquivo | Alteração | Motivo |
| --- | --- | --- |
| .gitignore | Ignora todas as variantes .env, preserva exemplo | Evitar versionamento acidental de configuração sensível |
| package.json | Atualiza quatro ferramentas já usadas | Corrigir advisories com versões compatíveis |
| package-lock.json | Regenera árvore resolvida | Reprodutibilidade das versões corrigidas |
| src/components/Sidebar.jsx | Fecha em hashchange, recupera foco externo, limpa listener | Navegação mobile consistente pelo histórico/teclado |
| src/components/Sidebar.test.jsx | Dois cenários de regressão | Proteger fechamento, rolagem e foco |
| src/components/ErrorBoundary.jsx | Detalhes de erro somente em desenvolvimento | Reduzir exposição de payloads no console de produção |
| src/components/ErrorBoundary.test.jsx | Testa produção e intercepta somente o erro intencional do teste no jsdom | Verificar proteção sem ruído de exceção esperada no Vitest 4 |
| src/index.css | Token muted por tema, eyebrow e placeholder usam token | Contraste de texto secundário |
| tailwind.config.js | Cor muted referencia variável CSS | Centralizar contraste para os dois temas |
| src/components/Header.jsx | Status com cores por tema | Legibilidade do estado da API |
| src/components/PeopleCard.jsx | Cabeçalhos e status com contraste melhor | Legibilidade da tabela |
| src/components/ActivityChart.jsx | Eixo usa token muted | Legibilidade das legendas nos dois temas |
| README.md | Versões, Node, revisão e configuração segura | Instruções reproduzíveis e limites explícitos |
| Índice técnico, hoje no README principal | Link para esta auditoria | Descoberta do relatório |
| Guia de estilos, hoje em docs/ARQUITETURA.md | Documenta histórico do menu e contraste | Manter guia alinhado ao código |

Nenhum arquivo de autoria foi removido nessa revisão. A atualização npm retirou
transitivos como consequência da árvore resolvida; componentes pendentes,
barrels, configurações e testes mantinham consumidores/finalidade. Foi criado
o relatório desta revisão; build e cobertura eram saídas locais ignoradas.

### Dependências

Nenhuma dependência direta adicionada ou removida. Todas as diretas têm uso em
runtime, testes, configuração ou scripts; não há duplicação de bibliotecas de estado/HTTP.

| Dependência de desenvolvimento | Antes | Depois | Motivo |
| --- | --- | --- | --- |
| vite | 5.4.21 | 6.4.3 | Versão corrigida, mantendo a linha mais próxima compatível |
| @vitejs/plugin-react | 4.2.1 | 4.7.0 | Compatibilidade declarada com Vite 6 |
| vitest | 3.2.7 | 4.1.11 | Correção de traversal no mocker |
| @vitest/coverage-v8 | 3.2.7 | 4.1.11 | Mesma versão do runner e correção da cadeia |

A mudança de major é justificada pelos advisories, com conferência dos peers,
engines e validação de testes/build/cobertura. React/React DOM/Recharts/Tailwind
foram preservados. Evoluções de major dessas bibliotecas são opcionais e exigem
revisão visual; o audit não identificou atualização de segurança adicional obrigatória.
Node validado: 24.18.0; engines do runner aceitam 20.x, 22.x ou 24+.

A estrutura `components/pages/hooks/services/utils/constants/data/test` foi
mantida, com testes ao lado dos módulos. Não foram criadas pastas vazias de
contexts/types/features/assets/layouts/routes por não haver responsabilidade
que justificasse a mudança. Veja [Arquitetura](ARQUITETURA.md).

### Validação

| Verificação | Resultado |
| --- | --- |
| Baseline npm.cmd test | 86/86, 20 arquivos |
| Instalação/atualização npm | Concluída; npm ls --depth=0 sem dependências inválidas |
| Final npm.cmd run test:coverage | 89/89, 20 arquivos |
| Cobertura V8 | 92,20% statements; 84,35% branches; 86,86% functions; 94,20% lines |
| npm.cmd run build | OK, 674 módulos; páginas, vendor e charts em chunks |
| npm.cmd audit --json | 0 vulnerabilidades conhecidas; antes 6 |
| npm.cmd run lint | Indisponível: Missing script: lint; ESLint não instalado |
| npm.cmd run typecheck | Indisponível: Missing script: typecheck; projeto JavaScript sem checagem estática configurada |
| AST / links locais | 52 módulos; zero imports quebrados/sem uso, zero runtime órfão, zero links Markdown locais ausentes |
| Preview HTTP | HTML e três assets referenciados responderam 200 em loopback; servidor encerrado normalmente |
| Git | diff --check sem erro; alterações somente FrontEnd; .env.test/.env.staging ignorados, exemplo preservado |
| Navegador/API real | Não executados; não há ferramenta de navegador disponível nesta sessão |

O PowerShell bloqueia npm.ps1; npm.cmd foi usado sem mudar a política do sistema.
O sandbox bloqueou esbuild ao ler diretórios superiores e o registry; validações
foram executadas com a elevação autorizada, sem mudar configuração para contornar testes.
O npm avisou que o postinstall de esbuild não estava coberto por allowScripts;
nenhuma aprovação global de scripts foi adicionada e o build executou com sucesso.
O erro intencional do teste de ErrorBoundary passou a ser tratado localmente no
teste, sem suprimir falhas globais. Avisos Git de LF/CRLF são normalização de linha,
não warnings de compilação. Não há warnings no build final.

### Pendências

- 🔴 CRÍTICO: autenticação/autorização e isolamento de equipe no backend antes de exposição de dados reais. CORS amplo também requer configuração de deploy.
- 🟠 ALTO: contratos de associação, tasks, jornada, timeline e relatório completo. Exportações existentes são diárias por categoria e não equivalem às telas previstas.
- 🟡 MÉDIO: empates em captured_at no CRUD podem duplicar linhas realtime/contagens; resolver seleção determinística no servidor, sem escolher arbitrariamente um registro no frontend.
- 🟡 MÉDIO: definir fuso de negócio entre data local do filtro e agregação SQL; realtime continua sempre recente, independentemente do filtro histórico.
- 🟡 MÉDIO: executar testes com API real, navegação em navegador, responsividade, contraste completo e leitor de tela; preview 200 e jsdom não comprovam toda a experiência.
- 🟡 MÉDIO: lint/CI e cobertura de fluxos reais; TimelineCard/CollaboratorsPage sem execução direta na cobertura, SettingsPage parcial. Não foram criados testes artificiais somente para subir percentual.
- 🔵 SUGESTÃO: acompanhar tamanho do chunk charts (aproximadamente 337 kB bruto/95 kB gzip) ao evoluir relatórios. Já é separado; não se justificou trocar Recharts.

Os demais riscos backend históricos estão em [INTEGRACAO.md](INTEGRACAO.md#problemas-externos).
Esta revisão preserva os contratos e comportamentos operacionais existentes;
não certifica funcionamento end-to-end sem API e navegador reais.

<a id="organizacao-25"></a>

## Organização e navegação — 25/09/2026

Esta revisão precede a auditoria completa acima. Moveu os dois relatórios da
raiz para `docs/`, preservou `README.md` como entrada e reuniu o índice antigo
`README-FRONTEND.md` no então índice de docs, pois continha somente links repetidos.
Os demais históricos foram preservados naquela etapa. Não mudou arquitetura,
rotas, bibliotecas ou HTTP; manteve fontes e testes em seus diretórios originais.
README e guias passaram a descrever ErrorBoundary e lazy imports já existentes.

Foram revisados entrada, páginas, componentes, hooks, HTTP, utils, menu, CSS,
configs, imports/reexports estáticos/dinâmicos, dependências/lockfile, duplicação,
artefatos, links e cobertura funcional. Correções de foco ao fechar links/logo/
sessão e bloqueio/cleanup da rolagem estão em [Refatoração](REFATORACAO.md#revisao-25).

Todos os 32 arquivos de runtime (31 JS/JSX e um CSS) são alcançáveis a partir de
`src/main.jsx`; não foram encontrados imports não utilizados ou arquivos de
autoria idênticos. `data/dashboardData.js` contém o menu consumido pela Sidebar,
e os barrels são usados pelo painel. TimelineCard e páginas com integração
pendente continuam renderizados; ausência de backend não os torna código morto.
`node_modules/`, `.npm-cache/`, `dist/` e `coverage/` são artefatos locais ignorados;
nenhum arquivo versionado corresponde às regras de ignore atuais. Não foram
apagados caches/dependências para produzir uma limpeza apenas visual.

### Validação desta revisão

| Verificação | Resultado |
| --- | --- |
| Baseline: npm.cmd test | 84 testes aprovados, 20 arquivos |
| Final: npm.cmd test | 86 testes aprovados, 20 arquivos |
| npm.cmd run build | Aprovado; 868 módulos, páginas/charts/vendor em chunks |
| Análise AST | 52 módulos JS/JSX; nenhum import relativo quebrado ou import não usado |
| Manifest/lockfile | Dependências e devDependencies diretas coincidem; sem mudanças |
| Links Markdown locais | Nenhum destino de arquivo ausente |
| git diff --check | Sem erros de whitespace |
| Escopo | Todas as alterações pertencem a FrontEnd/ |
| Inicialização Vite | HTML, main.jsx e App.jsx responderam HTTP 200 em loopback |
| Lint/typecheck | Não configurados; não apresentados como aprovados |
| Cobertura | Não recalculada nesta revisão; percentuais históricos não são resultados atuais |
| Navegador real/backend/E2E | Não executados |

O sandbox bloqueou a leitura de diretórios superiores pelo esbuild. Testes e
build passaram na execução autorizada fora dele, sem alterar configurações.
Na checagem programática do Vite, o servidor respondeu normalmente, mas o
encerramento aguardou a otimização de dependências: houve aviso de await pendente
na primeira tentativa e cancelamento do build de dependências na segunda; o
processo de checagem foi interrompido. Isso limita a certificação do encerramento
do servidor, não o resultado do build de produção ou dos testes.

Contratos externos, seed, idempotência, timezone e exportação não foram corrigidos
nem certificados com banco. Continuavam pendentes validação visual/contraste,
teclado/leitor, mobile/desktop, API real e testes diretos de SettingsPage,
CollaboratorsPage e TimelineCard. Esta revisão não consultou advisories nem
executou npm audit; a análise de segurança posterior está no início deste guia.

<a id="auditoria-23"></a>

## Auditoria técnica — 23/09/2026

Estado histórico: React 18.2/JSX, Vite 5.4.21, Tailwind 3.4.17, Recharts 2.10.3;
Blazor ainda preservado, posteriormente removido. Checkout inicialmente limpo,
sem alterações externas, complementando 21/09 sem reivindicar correções anteriores.

### Escopo e método

Inventariados fontes/testes/configurações, entrada HTML, estilos, documentação,
legado Blazor, manifests/lockfile, backend, requisitos e infraestrutura. Arquivos
gerados (`node_modules`, dist, coverage, cache npm) não são fontes de autoria nem
foram refatorados. O legado possui execução documentada e permanece fora do build.

Antes das mudanças foram conferidos routers, schemas, CRUD, estados, componentes,
rotas, efeitos/listeners e contratos. Depois das mudanças: testes com cobertura,
build, análise AST/imports, revisão do diff e dos links documentais. A integração
foi verificada estaticamente e com fixtures de contratos, sem iniciar banco/API.

Os achados foram tema ignorado em entrada direta, loading/falha confundidos com
vazio, dados retidos sem explicação e lote HTTP que continuava após falha principal.
Cancelamento customizado também gerava warnings indevidos. Soluções, arquivos,
motivos e riscos estão em [Refatoração](REFATORACAO.md#revisao-23).
Foram corrigidas descrições de pill e PWA; autenticação, seed UUID, configuração
de timeout e reenvios/empates permaneciam problemas externos.

### Alterações e justificativas

| Arquivos de aplicação modificados | Mudança |
| --- | --- |
| `src/App.jsx`, `src/pages/DashboardPage.jsx` | Tema pertence a App; props ao painel; estados de carga/falha e alerta de dados anteriores |
| `src/components/PeopleCard.jsx`, `src/components/ActivityChart.jsx` | Props loading/unavailable; mensagens específicas sem falsos vazios |
| `src/services/api.js` | Controller do lote e cleanup em finally; cancelamento customizado não vira degradação |
| `src/hooks/index.js` | Remoção de reexport useTheme sem consumidor após mudança para import direto em App |

Testes modificados: `src/App.test.jsx`, `src/pages/DashboardPage.test.jsx`,
`src/components/PeopleCard.test.jsx`, `src/components/ActivityChart.test.jsx`,
`src/services/api.test.js`. Doze casos adicionais; testes anteriores preservados.

**Arquivos removidos:** nenhum. A remoção de código limita-se ao reexport sem
consumidor e ao mock de useTheme obsoleto no teste de DashboardPage. Foram
conferidos imports estáticos/dinâmicos, barrels, rotas e configurações; não há
carregamento por convenção no React atual. Não foram removidos arquivos históricos
por mera ausência de import.

**Refatoração estrutural:** ownership do tema passa de página para aplicação;
cancelamento ganha escopo do lote dentro do serviço existente. Não foram criados
stores, contexts, wrappers ou camadas artificiais. Detalhes, impacto e risco por
mudança estão em [REFATORACAO.md](REFATORACAO.md).

### Dependências, segurança e desempenho

- React/React DOM, Recharts e ferramentas de build/teste têm consumidores reais.
  package.json e lockfile conferidos; sem mudança de dependências ou versões.
- Não há HTML bruto/eval no frontend ativo; textos da API passam pelo escape React.
  Não há credenciais persistidas: localStorage contém somente preferência de tema.
  Variáveis VITE são públicas e .env.example só define URL de API.
- Google Fonts é uma dependência externa do HTML. Assets e estilos do legado
  não integram o build React. Não foram introduzidos assets novos.
- Cleanup de intervalos/listeners já existia; melhora de rede elimina requests
  sem consumidor em erro obrigatório. Polling continua 30s, cache 9→3 GETs quando
  histórico completo, com invalidação manual. Sem memoização especulativa.
- Repetições curtas de layout não justificam abstrações. Componentes já possuem
  responsabilidades delimitadas. Não houve reorganização cosmética de diretórios.
- Esta revisão não consultou advisories atualizados nem executou npm audit;
  números de vulnerabilidades de documentos anteriores não são uma certificação atual.

### Validações

| Verificação | Resultado |
| --- | --- |
| Baseline `npm.cmd test` | 70 testes / 19 arquivos aprovados |
| Final `npm.cmd run test:coverage` | 82 testes / 19 arquivos aprovados |
| Cobertura | Linhas/statements 92,46%; branches 91,77%; funções 82,89% |
| `npm.cmd run build` | Aprovado, 866 módulos; index JS 43,44 kB, vendor 171,97 kB, charts 326,91 kB; CSS 29,16 kB antes de gzip |
| AST de src | 50 módulos analisados, sem imports quebrados ou não usados |
| Manifests | Dependências diretas coerentes entre package.json e lockfile |
| Revisão final | git diff --check sem erros; links relativos dos documentos alterados válidos; 27 arquivos modificados e 3 criados, todos em FrontEnd |
| Lint / typecheck | Não configurados; não executados |
| Backend real / E2E / revisão visual em navegador | Não executados |

O primeiro teste foi bloqueado pela leitura de diretórios superiores do esbuild
no sandbox. A execução autorizada fora dele passou; não se alterou Vite/Vitest
para contornar o ambiente. Artefatos de testes/build ficaram no FrontEnd ignorado.

### Riscos e pendências

Conectividade, CORS real, timezone da agregação, fontes PDF, comportamento de
exportação e layout entre navegadores não foram certificados. Não existe suíte
E2E ou pipeline CI/CD neste checkout. Validar visualmente mobile/desktop, tema e
estados de API em ambiente integrado continua necessário antes de uma publicação.

As validações mínimas existentes de senha (8) e descrição (3–500) foram
preservadas; não definem política definitiva de backend. Sem requisito suficiente,
não se alterou formato da timeline proposta, cache histórico, retenção de dados
ou domínio de autenticação. Problemas externos estão detalhados com locais,
evidências, impactos, correções sugeridas e arquivos envolvidos em Integração, seção Problemas externos.

<a id="auditoria-21"></a>

## Auditoria técnica — 21/09/2026

Checkout inicialmente limpo; escrita somente em `FrontEnd/`. Backend, banco,
requisitos, configuração e legado consultados por leitura. Inspeção incluiu
árvore/ocultos, fontes, routers, schemas, modelos, CRUD, infraestrutura e AST
com parser instalado. Entradas, barrels, estilos, testes e referências indiretas
foram considerados; nenhum arquivo foi removido apenas por falta de import.
API/containers/banco não foram iniciados, pois startup da API cria tabelas.

O protótipo Blazor e a ausência de lazy imports descritos nesta data são estados
históricos, superados pelas entregas em [Refatoração](REFATORACAO.md).
Os contratos conferidos estaticamente, incluindo defaults, nulabilidade e
limites de segurança, estão consolidados em [Integração](INTEGRACAO.md).

### Diagnóstico e alterações implementadas

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

#### Pontos auditados e preservados

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

### Código removido e critérios

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

### Dependências e segurança residual

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

### Validação

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

Arquivos afetados: `.gitignore`, manifests/lockfile, Vite/Vitest, App e seu teste
novo, Header, Sidebar, useDashboardData, api e testes correspondentes; README,
relatórios e guias foram atualizados. O lockfile da raiz permaneceu intacto.
Normalização redundante foi substituída por validação na fronteira; refresh
manual/periódico foi separado sem biblioteca adicional.

### Recomendações futuras

1. **Fora do escopo:** priorizar autenticação/autorização, contratos e problemas
   de dados consolidados em [Integração](INTEGRACAO.md#problemas-externos).
   O frontend não pode garantir isolamento de equipe.
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

O relatório original sugeria commit `fix(frontend): harden API handling and dashboard navigation`
e PR “Corrige resiliência da API e navegação do frontend”, sem criá-los ou publicá-los.
Seus textos repetiam as mudanças, limites e resultados preservados nesta seção.

<a id="consolidacao"></a>

## Consolidação documental — 25/09/2026

Os 23 Markdown de autoria foram lidos e reunidos em sete arquivos: README e seis
guias. Os 338 Markdown encontrados em `node_modules/` pertencem a dependências
instaladas e foram preservados. Não havia outros Markdown de autoria nas subpastas.
Esta consolidação não altera código, dependências ou backend.

O mapa abaixo registra nomes antigos como proveniência, não como caminhos ativos.
Índices duplicados, descrições repetidas de contratos/arquitetura, instruções de
aplicação de pacotes já incorporados e modelos de commit/PR foram substituídos
pelas seções canônicas. Datas, evidências, decisões, riscos, alterações e limites
das validações históricas foram preservados. O guia de testes foi alinhado ao
Vitest 4.1.11 do manifest; versões antigas permanecem apenas no histórico.

| Origem em FrontEnd (docs/ salvo indicação) | Destino e conteúdo preservado |
| --- | --- |
| `README.md` da raiz; `docs/README.md` | [README principal](../README.md): visão geral, ambiente, configuração, comandos e índice único |
| `ARQUITETURA.md`, `COMPONENTES.md`, `HOOKS.md`, `DATA-FLOW.md`, `STYLES.md`, `CONTRIBUTING.md` | [Arquitetura](ARQUITETURA.md): responsabilidades, props, hooks, estados, estilos e contribuição |
| `FUNCIONALIDADES.md`, `IMPLEMENTACAO-REQUISITOS-FRONTEND.md` | [Funcionalidades](FUNCIONALIDADES.md): rotas, bloqueios, matriz RF/RNF/CA e histórico de adequação |
| `INTEGRACAO-FRONTEND-BACKEND.md`, `EXTERNAL-ISSUES.md`, `BACKEND.md` | [Integração](INTEGRACAO.md): contratos, persistência, problemas externos; remoção do Blazor em [Refatoração](REFATORACAO.md#limpeza-legado) |
| `REFACTORING.md`, `REFATORACAO-CLEAN-CODE.md`, `RELATORIO-REFATORACAO-FRONTEND-2026-09-21.md`, `MELHORIAS-FRONTEND-2026-09-23.md`, `RELATORIO.md` | [Refatoração](REFATORACAO.md): decisões, matrizes, correções, remoções e melhorias por entrega |
| `AUDITORIA-TECNICA-2026-09-21.md`, `AUDITORIA-TECNICA-2026-09-23.md`, `AUDITORIA-COMPLETA-2026-09-25.md` | Este guia: achados, escopo, dependências, evidências e resultados por data; detalhes de contrato em Integração |
| `RELATORIO-AUDITORIA-FRONTEND.md` | Este guia: organização/validação de 25/09; [Refatoração](REFATORACAO.md#acessibilidade-inicial): acessibilidade, regressões e limpeza de artefatos anteriores |
| `TESTES.md` | [Testes](TESTES.md): ferramentas, comandos, casos relevantes e limites; números por execução neste guia |
