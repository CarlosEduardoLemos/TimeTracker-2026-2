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
| **Vite**             |      5.0.8 | Servidor de desenvolvimento e build da aplicação           |
| **Tailwind CSS**     |     3.4.17 | Estilização e responsividade                               |
| **Recharts**         |     2.10.3 | Construção de gráficos e visualizações                     |
| **PostCSS**          |     8.4.32 | Processamento dos arquivos CSS                             |
| **Autoprefixer**     |    10.4.16 | Compatibilidade CSS entre navegadores                      |

### Testes

| Tecnologia                | Versão | Utilização                                |
| ------------------------- | -----: | ----------------------------------------- |
| **Vitest**                |  3.2.4 | Execução dos testes automatizados         |
| **React Testing Library** | 16.3.0 | Testes dos componentes React              |
| **Jest DOM**              |  6.8.0 | Matchers adicionais para validação do DOM |
| **User Event**            | 14.6.1 | Simulação de interações do usuário        |
| **jsdom**                 | 26.1.0 | Simulação do ambiente de navegador        |
| **V8 Coverage**           |  3.2.4 | Cobertura dos testes                      |

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
├── legacy/
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

---

## Requisitos

Para executar o frontend localmente:

* Node.js 20 ou superior
* npm

---

## Instalação

Acesse o diretório do frontend:

```bash
cd FrontEnd
```

Instale as dependências:

```bash
npm install
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

## Legacy

O diretório:

```text
legacy/
```

contém implementações e protótipos históricos do projeto.

Esse conteúdo **não faz parte do build atual do frontend**, que utiliza React e Vite.

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
