# Auditoria completa do frontend — 25/09/2026

Escopo de escrita: `FrontEnd/`, nome real da pasta. Checkout inicialmente limpo.
Backend consultado somente para conferir contratos. Este relatório descreve esta
revisão; relatórios anteriores permanecem como histórico, com seus próprios resultados.

## 1. Resumo geral

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

## 2. Problemas críticos

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

## 3. Melhorias importantes

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

## 4. Melhorias opcionais

- 🔵 SUGESTÃO: implantar ESLint com regras React/hooks e validação CI em uma entrega dedicada.
- 🔵 SUGESTÃO: contratos JSDoc ou TypeScript incremental quando a API de negócio estabilizar.
- 🔵 SUGESTÃO: página 404, título de documento por rota e anúncio/foco de navegação SPA; fallback atual foi preservado.
- 🔵 SUGESTÃO: auto-hospedar fontes caso seja necessário remover dependência de rede externa.
- 🔵 SUGESTÃO: medir tamanho real da equipe e custo de renderização antes de paginação/virtualização.
- 🔵 SUGESTÃO: consolidar futuramente históricos documentais; ausência de import não torna documentação descartável.

## 5. Arquivos alterados

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
| docs/README.md | Link para esta auditoria | Descoberta do relatório atual |
| docs/STYLES.md | Documenta histórico do menu e contraste | Manter guia alinhado ao código |

## 6. Arquivos removidos

Nenhum arquivo de autoria removido. Componentes de funcionalidades pendentes,
barrels, configurações e testes possuem consumidores/finalidade. A atualização
npm removeu pacotes transitivos de node_modules/lockfile como consequência da
nova árvore; isso não é exclusão de código do projeto.

## 7. Arquivos criados

`docs/AUDITORIA-COMPLETA-2026-09-25.md`: evidências, escopo, decisões, validação
e pendências desta revisão. Build/cobertura são saídas locais ignoradas.

## 8. Dependências

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

## 9. Estrutura final

```text
FrontEnd/
  src/
    components/     # UI compartilhada, testes ao lado
    pages/          # sete destinos (AuthPage atende login e cadastro)
    hooks/          # estado/efeitos e testes
    services/       # API e contratos em runtime
    utils/          # funções puras e testes
    constants/      # estados/cores
    data/           # itens de navegação
    test/           # setup do Vitest
    App.jsx, App.test.jsx, main.jsx, index.css
  docs/             # guias atuais e históricos
  README.md, index.html, .env.example, .gitignore, .editorconfig
  package.json, package-lock.json
  vite.config.js, vitest.config.js, tailwind.config.js, postcss.config.js
```

Não foram criadas pastas vazias de contexts/types/features/assets/layouts/routes:
nenhuma responsabilidade atual exige essa movimentação.

## 10. Validação

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

## 11. Pendências

- 🔴 CRÍTICO: autenticação/autorização e isolamento de equipe no backend antes de exposição de dados reais. CORS amplo também requer configuração de deploy.
- 🟠 ALTO: contratos de associação, tasks, jornada, timeline e relatório completo. Exportações existentes são diárias por categoria e não equivalem às telas previstas.
- 🟡 MÉDIO: empates em captured_at no CRUD podem duplicar linhas realtime/contagens; resolver seleção determinística no servidor, sem escolher arbitrariamente um registro no frontend.
- 🟡 MÉDIO: definir fuso de negócio entre data local do filtro e agregação SQL; realtime continua sempre recente, independentemente do filtro histórico.
- 🟡 MÉDIO: executar testes com API real, navegação em navegador, responsividade, contraste completo e leitor de tela; preview 200 e jsdom não comprovam toda a experiência.
- 🟡 MÉDIO: lint/CI e cobertura de fluxos reais; TimelineCard/CollaboratorsPage sem execução direta na cobertura, SettingsPage parcial. Não foram criados testes artificiais somente para subir percentual.
- 🔵 SUGESTÃO: acompanhar tamanho do chunk charts (aproximadamente 337 kB bruto/95 kB gzip) ao evoluir relatórios. Já é separado; não se justificou trocar Recharts.

Os demais riscos backend históricos estão em [EXTERNAL-ISSUES.md](EXTERNAL-ISSUES.md).
Esta revisão preserva os contratos e comportamentos operacionais existentes;
não certifica funcionamento end-to-end sem API e navegador reais.
