# TimeTracker — Frontend

Frontend da aplicação **TimeTracker**, desenvolvido em **React 18** com **Vite**, **Tailwind CSS** e **Recharts**.

O projeto é responsável pela interface utilizada no gerenciamento e visualização das informações da aplicação, incluindo painel, colaboradores, tarefas, relatórios, configurações, login e cadastro.

---

## Tecnologias utilizadas

| Tecnologia           |     Versão | Utilização                                                 |
| -------------------- | ---------: | ---------------------------------------------------------- |
| **React**            |     18.2.0 | Construção da interface e componentes da aplicação         |
| **React DOM**        |     18.2.0 | Renderização da aplicação React no navegador               |
| **JavaScript / JSX** | ES Modules | Desenvolvimento dos componentes, páginas, hooks e serviços |
| **Vite**             |     6.4.3 | Servidor de desenvolvimento e build da aplicação           |
| **Tailwind CSS**     |     3.4.17 | Estilização e responsividade                               |
| **Recharts**         |     2.10.3 | Construção de gráficos e visualizações                     |
| **PostCSS**          |     8.5.28 | Processamento dos arquivos CSS                             |
| **Autoprefixer**     |    10.4.16 | Compatibilidade CSS entre navegadores                      |

### Testes

| Tecnologia                | Versão | Utilização                                |
| ------------------------- | -----: | ----------------------------------------- |
| **Vitest**                |  4.1.11 | Execução dos testes automatizados         |
| **React Testing Library** | 16.3.0 | Testes dos componentes React              |
| **Jest DOM**              |  6.8.0 | Matchers adicionais para validação do DOM |
| **User Event**            | 14.6.1 | Simulação de interações do usuário        |
| **jsdom**                 | 26.1.0 | Simulação do ambiente de navegador        |
| **V8 Coverage**           |  4.1.11 | Cobertura dos testes                      |

---

## Estrutura do projeto

```text
FrontEnd/
├── src/
│   ├── components/
│   ├── constants/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── test/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── docs/
├── README.md
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── vitest.config.js
```

### Diretórios principais

* `components/`: componentes reutilizáveis da interface.
* `pages/`: páginas principais da aplicação.
* `hooks/`: hooks personalizados utilizados pelo frontend.
* `services/`: comunicação com serviços externos e API.
* `utils/`: funções auxiliares.
* `constants/`: constantes compartilhadas.
* `data/`: dados e configurações internas.
* `test/`: configuração e utilitários relacionados aos testes.

---

## Rotas

Atualmente, a aplicação utiliza navegação baseada em **hash routing**.

Rotas existentes:

```text
#/painel
#/colaboradores
#/tasks
#/relatorios
#/configuracoes
#/login
#/cadastro
```

O projeto não utiliza React Router atualmente.

---

## Integração com a API

A comunicação com o backend é centralizada em:

```text
src/services/
```

A URL base da API pode ser configurada utilizando a variável de ambiente:

```env
VITE_API_URL=http://localhost:8000
```

Existe um arquivo de exemplo:

```text
.env.example
```

Para utilização local, crie um arquivo `.env` a partir dele e ajuste a URL da API conforme necessário.

Em produção, configure `VITE_API_URL` com a URL HTTPS da API antes do build. Variáveis
`VITE_*` são públicas no bundle: não coloque senhas ou tokens nelas. O padrão
`http://localhost:8000` serve para desenvolvimento local.

Cada consulta tem limite de 15 segundos, incluindo leitura do JSON. Respostas
incompatíveis com os campos consumidos são tratadas como falha, não como zero
atividade. A atualização automática reutiliza o histórico; o botão de atualização
manual reconsulta os sete dias para recuperar registros sincronizados com atraso.

---

## Requisitos

Para executar o frontend localmente:

* Node.js 20.x, 22.x ou 24+ (compatibilidade das ferramentas; validado com 24.18.0)
* npm

---

## Instalação

Acesse o diretório do frontend:

```bash
cd FrontEnd
```

Instale as dependências:

```bash
npm ci
```

---

## Executando o projeto

Ambiente de desenvolvimento:

```bash
npm run dev
```

O Vite iniciará o servidor local de desenvolvimento.

---

## Build de produção

Para gerar o build:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

---

## Testes

Executar todos os testes:

```bash
npm test
```

Executar testes em modo watch:

```bash
npm run test:watch
```

Executar testes com cobertura:

```bash
npm run test:coverage
```

---

## Arquitetura

A aplicação segue uma organização baseada em separação de responsabilidades:

```text
Interface
   │
   ▼
Pages
   │
   ▼
Components
   │
   ├── Hooks
   ├── Utils
   └── Data
   │
   ▼
Services
   │
   ▼
Backend API
```

Essa organização evita concentrar toda a lógica da aplicação em um único componente e facilita manutenção, testes e evolução do projeto.

---

## Frontend atual

A aplicação ativa utiliza:

```text
React 18
   │
   ├── JavaScript / JSX
   ├── Tailwind CSS
   ├── Recharts
   │
   ├── Vite
   │   ├── PostCSS
   │   └── Autoprefixer
   │
   └── Testes
       ├── Vitest
       ├── React Testing Library
       └── jsdom
```

---

## Histórico do protótipo

O protótipo Blazor da antiga pasta `legacy/` foi removido por não participar da
aplicação React/Vite. Seu código permanece no histórico do Git.

---

## Status

O frontend possui atualmente estrutura para:

* Dashboard
* Colaboradores
* Tasks
* Relatórios
* Configurações
* Login
* Cadastro

Algumas funcionalidades dependem da disponibilidade dos respectivos contratos e endpoints no backend.

Quando uma funcionalidade ainda não possui integração disponível, o frontend mantém o estado de integração pendente em vez de utilizar endpoints fictícios ou dados operacionais simulados.

## Auditoria técnica

Consulte [a organização e auditoria de 25/09/2026](docs/RELATORIO-AUDITORIA-FRONTEND.md)
para correções, validações e limites desta revisão; o [índice técnico](docs/README.md)
reúne arquitetura, componentes, contratos e manutenção. O lockfile do frontend
é versionado para reproduzir a instalação. Não existem scripts de lint ou
type-check neste projeto JavaScript; build e testes não substituem essas análises.

O painel é a única tela com consultas HTTP ativas. Login/cadastro, associação,
tasks, jornada e exportação completa continuam pendentes de contratos; os botões
de envio permanecem bloqueados. Não existe autenticação nem proteção de rotas.
O tema é inicializado em `App`, inclusive no acesso direto a essas telas.

As páginas são carregadas sob demanda com `React.lazy` e `Suspense`. O
`ErrorBoundary` de `main.jsx` oferece recuperação por recarregamento em falhas de
renderização. Este README é o único Markdown na raiz; guias e relatórios ficam em
`docs/`, com registros históricos identificados no índice.

O Vite usa a porta 5173 e pode escolher outra se estiver ocupada (`strictPort: false`).
Não há proxy de API: o navegador chama `VITE_API_URL` diretamente. O build gera
`dist/`, sem sourcemaps, com chunks de gráficos e React. O projeto não configura
service worker, manifest PWA, lint, formatter executável ou pipeline CI/CD.

## Revisão completa de segurança e qualidade

Consulte [a auditoria completa de 25/09/2026](docs/AUDITORIA-COMPLETA-2026-09-25.md)
para os achados classificados, alterações e validação desta revisão. As ferramentas
foram atualizadas para Vite 6.4.3, plugin React 4.7.0 e Vitest/coverage 4.1.11
para corrigir advisories; as dependências de execução React/Recharts foram preservadas.

Arquivos `.env.*` são ignorados, exceto `.env.example`. O ErrorBoundary registra
detalhes somente em desenvolvimento. O menu mobile fecha também ao navegar pelo
histórico, liberando a rolagem. No PowerShell com scripts bloqueados, use `npm.cmd`
nos comandos acima.
