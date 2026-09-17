# TimeTrack — Frontend

Frontend ativo do TimeTrack para o perfil **Gestor**, desenvolvido com React 18, Vite, Tailwind CSS e Recharts. O protótipo em `legacy/blazor/` é histórico e não participa do build Vite.

## Estado atual

O frontend possui navegação por hash entre as áreas previstas no sitemap do projeto:

- `#/painel`
- `#/colaboradores`
- `#/tasks`
- `#/relatorios`
- `#/configuracoes`
- `#/login`
- `#/cadastro`

As telas que dependem de contratos ainda inexistentes no backend exibem estados explícitos de integração pendente. O frontend **não cria dados fictícios nem inventa endpoints** para completar essas funcionalidades.

## Como executar

Pré-requisitos: Node.js 20+ e npm.

```powershell
cd FrontEnd
npm.cmd install
npm.cmd run dev
```

Validação de produção:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

## Configuração

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8000` | URL base da API consumida pelo frontend. |

Em produção, a URL deve utilizar HTTPS conforme RNF-03.

## Arquitetura resumida

```text
src/
├── App.jsx                  # Seleção da rota e shell principal
├── pages/                   # Telas do Dashboard PWA
├── components/              # Componentes visuais reutilizáveis
├── hooks/                   # Dados, tema e roteamento por hash
├── services/api.js          # Cliente HTTP existente
├── utils/                   # Formatação e utilitários
├── data/dashboardData.js    # Configuração de navegação
└── index.css                # Tailwind + estilos compartilhados
```

`App.jsx` não concentra mais o domínio do dashboard. O conteúdo do painel está em `src/pages/DashboardPage.jsx`; as demais áreas possuem páginas próprias.

## Situação funcional

| Área | Estado |
| --- | --- |
| Painel | Parcial: usa os contratos atualmente disponíveis e não inventa indicadores ausentes |
| Login/Cadastro | Estrutura e validação local prontas; envio depende de contrato de autenticação |
| Colaboradores | Estrutura pronta; listagem e código de associação dependem de API |
| Tasks | Formulário e validação local prontos; persistência depende de API |
| Configurações | Estrutura de jornada/inatividade pronta; persistência depende de API |
| Relatórios | Filtros e estrutura prontos; CSV/PDF permanecem bloqueados até contrato completo |

O Dashboard não apresenta rankings nem métricas de produtividade. Dados ausentes são apresentados como indisponíveis/estado vazio em vez de mocks operacionais.

## Documentação

- [Sumário da documentação](docs/README.md)
- [Arquitetura](docs/ARQUITETURA.md)
- [Funcionalidades](docs/FUNCIONALIDADES.md)
- [Componentes](docs/COMPONENTES.md)
- [Hooks](docs/HOOKS.md)
- [Integração frontend–backend](docs/INTEGRACAO-FRONTEND-BACKEND.md)
- [Testes](docs/TESTES.md)
- [Estilos](docs/STYLES.md)
- [Contribuição](docs/CONTRIBUTING.md)
- [Implementação e dependências](docs/IMPLEMENTACAO-REQUISITOS-FRONTEND.md)

## Limitações conhecidas

Dependem de contrato/API oficial: autenticação e sessão, código de associação, listagem autorizada de colaboradores, CRUD de tasks, jornada/inatividade, filtros completos do RF-27, timeline real, tempo ativo/inativo, possível hora extra e exportação completa CSV/PDF.
