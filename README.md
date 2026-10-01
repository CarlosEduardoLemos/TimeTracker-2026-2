# ⏱️ TimeTracker — BayArea

> **TimeTracker** é um sistema completo e integrado para monitoramento inteligente de atividades, gestão de tempo e análise de produtividade corporativa, desenvolvido no âmbito da **[BayArea](https://bayarea.com.br)** (2º Semestre de 2026).

---

## 👥 Equipe do Projeto

| Papel | Nome | GitHub |
| :--- | :--- | :--- |
| **Líder do Projeto** | **Luan Menezes** | [@Rinosifterino](https://github.com/Rinosifterino) |
| **Desenvolvedor Backend** | **Dannyel** | [@DanFonR](https://github.com/DanFonR) |
| **Desenvolvedor Frontend** | **Carlos Eduardo** | [@CarlosEduardoLemos](https://github.com/CarlosEduardoLemos) |
| **Engenharia de Requisitos** | **Marley Eduardo** | [@marleyedrg](https://github.com/marleyedrg) |

---

## 🏗️ Visão Geral da Arquitetura

O sistema é dividido em três módulos independentes e desacoplados, comunicando-se através de contratos de API REST:

```text
┌──────────────────────────────────────────────────────────┐
│                   Agente Desktop (C#)                    │
│  - Captura janelas ativas (Win32 API)                    │
│  - Detecção de inatividade e monitoramento em segundo plano│
│  - Fila local resiliente a quedas de conexão             │
└────────────────────────────┬─────────────────────────────┘
                             │ POST /activities/
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   Backend API (FastAPI)                  │
│  - Autenticação e gestão de equipe                       │
│  - Processamento e agregação de dados analíticos         │
│  - Banco de dados relacional (SQLAlchemy / PostgreSQL)   │
└────────────────────────────┬─────────────────────────────┘
                             │ GET /dashboard/summary & realtime
                             ▼
┌──────────────────────────────────────────────────────────┐
│                  Dashboard Web (React)                   │
│  - Visão gerencial em tempo real                         │
│  - Métricas, categorização e gráficos responsivos        │
│  - Exportação de relatórios em CSV e PDF                 │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura do Repositório

```text
.
├── FrontEnd/       # Interface web SPA (React, Vite, TailwindCSS, Vitest, Playwright)
├── backend/        # API RESTful (Python 3.11+, FastAPI, SQLAlchemy, SQLite/PostgreSQL)
├── agent/          # Agente nativo Windows (C# / .NET 8, Win32, System Tray)
├── requisitos/     # Especificações de requisitos funcionais, regras de negócio e sprints
└── README.md       # Este documento
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* **Node.js** (versão 20 ou superior)
* **Python** (versão 3.10 ou superior)
* **.NET 8 SDK** (para o Agente Desktop no Windows)
* **Docker e Docker Compose** *(opcional, recomendado para o backend)*

---

### 1. Backend (API FastAPI)

O servidor pode ser executado via Docker ou diretamente no ambiente Python:

#### Opção A: Via Docker (Recomendado)
```bash
cd backend
docker compose up --build
```

#### Opção B: Localmente (Sem Docker)
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn app.main:app --reload --port 8000
```

* **API Base:** `http://localhost:8000`
* **Documentação Swagger Interativa:** `http://localhost:8000/docs`
* **Documentação ReDoc:** `http://localhost:8000/redoc`

---

### 2. Frontend (Dashboard Web)

Interface construída com React e Vite, rápida e responsiva:

```bash
cd FrontEnd
npm install
npm run dev
```

* **Acesso Web:** `http://localhost:5173`
* **Executar Testes Unitários e Cobertura:**
  ```bash
  npm run test:coverage
  ```
* **Verificação Completa de Qualidade (Lint + Tipagem + Testes):**
  ```bash
  npm run check
  ```

---

### 3. Agente Desktop (Windows)

Aplicação executada na bandeja do sistema (System Tray) para captura de atividades:

```bash
cd agent
dotnet build
dotnet run
```

* O agente iniciará silenciosamente na área de notificação do Windows.
* Clique com o botão direito no ícone da bandeja para abrir o painel de status ou encerrar.

---

## 📋 Metodologia e Processos (POP-01 & POP-02)

O desenvolvimento segue rigorosamente os Procedimentos Operacionais Padrão da BayArea:

* **POP-01 (Líderes de Desenvolvimento):** Gestão ágil via Kanban no GitHub Projects, desmembramento estruturado de User Stories (Issues Pai) em tarefas técnicas modulares (Issues Filhas), priorização (`P0`, `P1`, `P2`) e rastreabilidade total.
* **POP-02 (Desenvolvedores):** Padrão de commits semânticos (*Conventional Commits*), desenvolvimento em branches com nomenclatura padronizada e Pull Requests com evidências visuais obrigatórias.

---

## 📄 Licença e Vínculo

Desenvolvido para fins acadêmicos e práticos pela equipe do projeto **TimeTracker** para a **[BayArea](https://bayarea.com.br)**.  
Distribuído sob a licença **MIT**.
