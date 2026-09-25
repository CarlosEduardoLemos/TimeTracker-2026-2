# TimeTracker — Frontend

Interface do Dashboard do Gestor, em React 18/JavaScript JSX, Vite, Tailwind CSS
e Recharts. O painel é a única tela com consultas HTTP ativas. Login/cadastro,
colaboradores, tasks, relatórios e configurações têm interfaces com integração
pendente; envios ficam bloqueados sem contratos. Não há autenticação, proteção
de rotas, dados operacionais simulados, ranking ou métricas de produtividade.

## Documentação

| Guia | Conteúdo |
| --- | --- |
| [Arquitetura e manutenção](docs/ARQUITETURA.md) | Estrutura, componentes/props, hooks, fluxo, estilos, acessibilidade e contribuição |
| [Funcionalidades e requisitos](docs/FUNCIONALIDADES.md) | Sete rotas, estados, limitações e matriz RF/RNF/CA |
| [Integração](docs/INTEGRACAO.md) | Contratos HTTP, configuração, persistência e problemas externos |
| [Testes](docs/TESTES.md) | Ferramentas, comandos, cenários cobertos e validação pendente |
| [Auditoria](docs/AUDITORIA.md) | Achados e resultados por data, riscos e mapa da consolidação documental |
| [Refatoração e melhorias](docs/REFATORACAO.md) | Decisões, correções, remoções e histórico das entregas |

Este é o índice principal. Guias descrevem o código existente; registros históricos
identificam a data e os limites de cada revisão, sem certificar o estado de um deploy.

## Ambiente e início rápido

Node.js 20.x, 22.x ou 24+ e npm. Ambiente das últimas validações registradas:
Node 24.18.0 e npm 11.16.0. O lockfile do frontend é versionado para `npm ci`.

```bash
cd FrontEnd
npm ci
npm run dev
```

No PowerShell com scripts bloqueados, use `npm.cmd` em vez de `npm`.
Crie `.env` a partir de [.env.example](.env.example) e ajuste:

```env
VITE_API_URL=http://localhost:8000
```

Em produção, configure a URL HTTPS antes do build. Variáveis `VITE_*` são
públicas no bundle; não inclua senhas ou tokens. `.env.*` é ignorado, com
exceção de `.env.example`. O endereço localhost é o padrão de desenvolvimento.
Não há proxy de API: o navegador chama essa URL diretamente.

O Vite usa porta 5173 e pode escolher outra se ocupada (`strictPort: false`).

## Comandos

| Comando | Finalidade |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/`, sem sourcemaps |
| `npm run preview` | Visualização local do build |
| `npm test` | Suíte automatizada |
| `npm run test:watch` | Testes em watch |
| `npm run test:coverage` | Cobertura V8 de src |

Não há scripts de lint/typecheck, formatter executável ou pipeline CI/CD.
Build e testes não substituem essas análises nem validação em navegador/API real.

## Tecnologias

Versões declaradas no [package.json](package.json):

| Tecnologia | Versão | Uso |
| --- | --- | --- |
| React / React DOM | 18.2.0 | Interface/renderização |
| JavaScript / JSX | ES Modules | Componentes, páginas, hooks e serviços |
| Vite / plugin React | 6.4.3 / 4.7.0 | Desenvolvimento e build |
| Tailwind CSS | 3.4.17 | Estilos e responsividade |
| Recharts | 2.10.3 | Gráficos |
| PostCSS / Autoprefixer | 8.5.28 / 10.4.16 | Processamento e compatibilidade CSS |
| Vitest / V8 Coverage | 4.1.11 | Testes/cobertura |
| React Testing Library | 16.3.0 | Testes de componentes |
| Jest DOM / User Event | 6.8.0 / 14.6.1 | Matchers e interações |
| jsdom | 26.1.0 | Ambiente DOM de testes |

## Estrutura e execução

```text
FrontEnd/
├── README.md
├── docs/
│   ├── ARQUITETURA.md
│   ├── FUNCIONALIDADES.md
│   ├── INTEGRACAO.md
│   ├── TESTES.md
│   ├── AUDITORIA.md
│   └── REFATORACAO.md
├── src/
│   ├── components/   # UI reutilizável
│   ├── pages/        # páginas completas
│   ├── hooks/        # estado e efeitos
│   ├── services/     # cliente HTTP
│   ├── utils/        # funções puras
│   ├── constants/    # rótulos e cores
│   ├── data/         # navegação
│   ├── test/         # setup dos testes (casos ficam junto dos módulos)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json, package-lock.json
├── vite.config.js, vitest.config.js
└── tailwind.config.js, postcss.config.js
```

`main → App → páginas/componentes → hooks → services → API` separa interface,
estado e rede. A navegação usa hash, sem React Router; a lista de rotas está em
[Funcionalidades](docs/FUNCIONALIDADES.md#navegação). Páginas usam `React.lazy`
e `Suspense`, com chunks próprios, além de chunks de React e gráficos.
`ErrorBoundary` permite recarregar após falha de renderização e registra detalhes
somente em desenvolvimento. `App` inicializa o tema inclusive em rotas diretas.
O menu mobile fecha também pelo histórico e libera a rolagem.

O cliente central `src/services/api.js` aplica timeout de 15 segundos inclusive
ao JSON e valida campos consumidos. Falha não vira zero atividade. Polling
reutiliza histórico válido; refresh manual reconsulta os sete dias para recuperar
sincronizações tardias. Veja [fluxo e estados](docs/ARQUITETURA.md#fluxo-de-dados).

Não há manifest/service worker de PWA. O protótipo Blazor foi removido após
confirmar ausência de consumidores; está disponível no histórico Git.
Consulte as [convenções de contribuição](docs/ARQUITETURA.md#contribuicao)
e mantenha contratos externos documentados sem inventar integrações.
