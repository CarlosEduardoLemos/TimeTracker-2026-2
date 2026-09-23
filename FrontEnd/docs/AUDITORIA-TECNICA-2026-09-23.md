# Auditoria técnica e refatoração — 23/09/2026

> Este relatório descreve a auditoria antes da limpeza posterior autorizada pelo
> usuário. O legado foi removido depois; veja [registro da limpeza](REFACTORING.md).

Escrita exclusivamente em `FrontEnd/`. Checkout inicialmente limpo. Esta revisão
complementa a auditoria de 21/09 e não atribui a si alterações anteriores.

## Visão geral

React 18.2/JavaScript JSX, Vite 5.4.21, Tailwind 3.4.17 e Recharts 2.10.3.
`main → App → páginas/componentes`; rotas por hash, tema global e estados locais.
DashboardPage usa useDashboardData/useAutoRefresh e fetch centralizado em api.js.
Sem TypeScript, context/store global ou router externo.

Backend FastAPI/Pydantic/SQLAlchemy e PostgreSQL no Compose. Leituras do painel:
resumo diário, realtime e usuários; CRUD consulta User/ActivityLog/Category.
Modelos de regras e configuração global não têm consumidores ativos no React.
Login, associação, tasks, jornada, timeline e relatório completo continuam
dependentes de contratos externos. Não há sessão simulada nem proteção de rotas.

## Escopo e método

Inventariados fontes/testes/configurações, entrada HTML, estilos, documentação,
legado Blazor, manifests/lockfile, backend, requisitos e infraestrutura. Arquivos
gerados (`node_modules`, dist, coverage, cache npm) não são fontes de autoria nem
foram refatorados. O legado possui execução documentada e permanece fora do build.

Antes das mudanças foram conferidos routers, schemas, CRUD, estados, componentes,
rotas, efeitos/listeners e contratos. Depois das mudanças: testes com cobertura,
build, análise AST/imports, revisão do diff e dos links documentais. A integração
foi verificada estaticamente e com fixtures de contratos, sem iniciar banco/API.

## Problemas por prioridade

| Prioridade | Achado | Resultado |
| --- | --- | --- |
| Crítico externo | API sem autenticação/autorização de equipe | Evidências e proposta em EXTERNAL-ISSUES; sem alteração externa |
| Importante | Lote HTTP continuava após erro obrigatório | Cancelamento coordenado e regressões |
| Importante | Cards confundiam falha/loading com resultado vazio | Estados explícitos preservando dados confirmados |
| Importante externo | Seed usa inteiro para UUID; timeout salvo não rege realtime; reenvios/empates podem duplicar dados | Documentados para responsáveis pelo backend |
| Melhoria | Tema salvo ignorado na entrada direta fora do painel | Inicialização movida para App |
| Melhoria | Cancelamento customizado gerava warnings de fonte opcional | Reconhecimento por estado do signal |
| Melhoria | Dado retido após refresh não era explicado; online descrito como conexão | Textos alinhados ao comportamento e contrato |
| Observações | Docs descreviam pill removida e PWA não implementada; histórico tinha resultados antigos | Guias ativos corrigidos e registros antigos identificados como históricos |

Não foi encontrado erro de URL, método ou snake_case nas três integrações ativas.
O status online real da API mede recência/is_idle, não conexão autenticada; ausente
não equivale a offline. Filtro de data só afeta resumos; realtime segue atual.

## Alterações e justificativas

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
mudança estão em [REFACTORING.md](REFACTORING.md).

## Dependências, segurança e desempenho

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

## Validações

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

## Documentação desta entrega

Criados: este relatório, [DATA-FLOW.md](DATA-FLOW.md) e
[EXTERNAL-ISSUES.md](EXTERNAL-ISSUES.md).

Atualizados: `../README.md`, `README.md`, `ARQUITETURA.md`, `COMPONENTES.md`,
`INTEGRACAO-FRONTEND-BACKEND.md`, `HOOKS.md`, `REFACTORING.md`, `TESTES.md`,
`STYLES.md`, `FUNCIONALIDADES.md` e `BACKEND.md`. Os históricos
`../RELATORIO.md`, `../RELATORIO-AUDITORIA-FRONTEND.md`,
`AUDITORIA-TECNICA-2026-09-21.md`, `REFATORACAO-CLEAN-CODE.md` e
`RELATORIO-REFATORACAO-FRONTEND-2026-09-21.md` receberam referência à revisão atual,
mantendo o conteúdo histórico.

## Riscos e pendências

Conectividade, CORS real, timezone da agregação, fontes PDF, comportamento de
exportação e layout entre navegadores não foram certificados. Não existe suíte
E2E ou pipeline CI/CD neste checkout. Validar visualmente mobile/desktop, tema e
estados de API em ambiente integrado continua necessário antes de uma publicação.

As validações mínimas existentes de senha (8) e descrição (3–500) foram
preservadas; não definem política definitiva de backend. Sem requisito suficiente,
não se alterou formato da timeline proposta, cache histórico, retenção de dados
ou domínio de autenticação. Problemas externos estão detalhados com locais,
evidências, impactos, correções sugeridas e arquivos envolvidos em EXTERNAL-ISSUES.
