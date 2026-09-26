# TimeTrack — Frontend

Frontend do **TimeTrack**, responsável pela interface web do Dashboard PWA. A aplicação consulta os dados disponíveis na API FastAPI e utiliza navegação por hash, sem React Router.

> **Escopo atual:** autenticação, associação de equipe, tasks e alguns filtros/indicadores previstos nos requisitos dependem de contratos de backend que ainda não estão disponíveis. O frontend sinaliza essas limitações na interface em vez de simular dados.

## Tecnologias e recursos

### Runtime e aplicação
- **React 18.2.0** — biblioteca principal para construção da interface.
- **React DOM 18.2.0** — renderização da aplicação no navegador.
- **JavaScript + JSX** — linguagem e sintaxe dos componentes.
- **Vite 6.4.3** — servidor de desenvolvimento e processo de build.
- **Hash routing próprio** — navegação entre telas sem dependência de React Router.
- **React.lazy/Suspense** — carregamento sob demanda das páginas.

### Interface e visual
- **Tailwind CSS 3.4.17** — classes utilitárias e composição visual.
- **CSS global (`src/index.css`)** — tokens de cor, componentes compartilhados, estados de foco, responsividade e suporte a movimento reduzido.
- **PostCSS 8.5.28** — processamento do CSS.
- **Autoprefixer 10.4.16** — compatibilidade de propriedades CSS.
- **Recharts 2.10.3** — gráficos e visualizações do dashboard.

### Recursos do navegador
- **Fetch API** — chamadas HTTP encapsuladas em `src/services/api.js`.
- **AbortController** — cancelamento de consultas quando filtros mudam ou páginas são desmontadas.
- **URLSearchParams** — montagem segura de parâmetros da API.
- **localStorage e `prefers-color-scheme`** — persistência e detecção da preferência de tema.
- **Blob e URL de objeto** — download dos relatórios CSV e PDF devolvidos pela API.
- **Hash da URL (`location.hash`)** — navegação interna, implementada em `src/hooks/useHashRoute.js`.

Não há React Router, biblioteca de formulários, biblioteca de ícones ou gerenciador externo de estado. O estado das telas é mantido com os hooks do React; os ícones usados são SVG inline.

### Qualidade e testes
- **Vitest 4.1.11** — testes unitários e de componentes.
- **@vitest/coverage-v8 4.1.11** — geração de cobertura para Vitest usando V8.
- **React Testing Library 16.3.0** — renderização e testes de comportamento da interface.
- **@testing-library/jest-dom 6.8.0** — matchers para DOM.
- **@testing-library/user-event 14.6.1** — simulação de interações do usuário.
- **jsdom 26.1.0** — ambiente de navegador para os testes.
- **Playwright 1.63.0** — testes end-to-end.
- **@axe-core/playwright 4.13.0** — validações automatizadas de acessibilidade.
- **@vitejs/plugin-react 4.7.0** — integração de React e JSX com Vite.
- **ESLint 9.39.5** — análise estática do código.
- **@eslint/js e globals** — regras base e globais de ambiente para a configuração flat do ESLint.
- **eslint-plugin-react, eslint-plugin-react-hooks e eslint-plugin-jsx-a11y** — regras específicas para React, hooks e acessibilidade.
- **Prettier 3.9.9** — formatação padronizada.

## Organização

A pasta mantém cada responsabilidade em seu local:

```text
FrontEnd/
├── docs/                 # Documentação específica do frontend
├── e2e/                  # Testes end-to-end
├── src/
│   ├── components/       # Componentes reutilizáveis da interface
│   ├── constants/        # Constantes visuais e de domínio do frontend
│   ├── hooks/            # Hooks reutilizáveis
│   ├── pages/            # Telas e páginas da aplicação
│   ├── services/         # Comunicação com a API
│   ├── test/             # Setup e testes transversais
│   └── utils/            # Funções auxiliares e transformação de dados
├── .env.example
├── index.html
├── package.json
├── package-lock.json     # Lockfile para instalação reproduzível com npm ci
├── vite.config.js
├── vitest.config.js
├── playwright.config.js
├── tailwind.config.js
├── postcss.config.js
└── eslint.config.js
```

Testes específicos de componentes permanecem próximos ao código que validam. O teste transversal de revisão do frontend fica em `src/test/`. Arquivos gerados por build, cobertura e Playwright (`dist/`, `coverage/`, `test-output/` e `test-results/`) são saídas locais e estão no `.gitignore`; não fazem parte da árvore de código-fonte.

## Executar

```powershell
cd FrontEnd
npm ci
Copy-Item .env.example .env
npm.cmd run dev
```

`VITE_API_URL` define a origem da API; o padrão é `http://localhost:8000`. O backend precisa estar em execução e permitir a origem do frontend em CORS.

## Validar

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm.cmd run test:e2e
```

Para usar o Chromium gerenciado pelo Playwright:

```powershell
npx playwright install chromium
```

Um teste separado consulta a API real. Inicie a API e o banco, defina `RUN_REAL_API=1` e execute `npm.cmd run test:e2e:real`. Consulte [Testes](docs/TESTES.md) para os detalhes.

## Documentação

- [Arquitetura](docs/ARQUITETURA.md)
- [Funcionalidades](docs/FUNCIONALIDADES.md)
- [Testes](docs/TESTES.md)
- [Auditoria](docs/AUDITORIA.md)
- [Alterações](docs/ALTERACOES.md)
- [Pendências](docs/PENDENCIAS.md)
