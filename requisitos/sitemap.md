# Sitemap — Time Tracker

**Projeto:** Time Tracker Open Source  
**Versão:** 1.0.0  
**Status:** Rascunho  
**Data:** Setembro de 2026

---

## 1. Perfis

O sistema possui dois perfis:

| Perfil | Acesso principal |
| --- | --- |
| Gestor | Dashboard PWA |
| Colaborador | Agente Desktop |

---

## 2. Dashboard PWA — Gestor

O Dashboard é utilizado pelo gestor para organizar sua equipe, criar tasks e consultar registros.

```text
Dashboard PWA
│
├── Criar conta
├── Login
│
├── Painel
├── Colaboradores
├── Tasks
├── Relatórios
└── Configurações
```

A criação da conta do gestor deve estar sempre disponível através de **e-mail**.

---

## 3. Painel

O painel apresenta uma visão rápida da equipe.

```text
Painel

├── Colaboradores Online/Offline
├── Estado Ativo/Inativo
├── Task ativa
├── Serviço monitorado atual
├── Tempo registrado
└── Possíveis horas extras
```

O gestor visualiza somente colaboradores associados a ele.

---

## 4. Colaboradores

```text
Colaboradores

├── Lista da equipe
├── Código de associação
│
└── Colaborador
    ├── Status
    ├── Task atual
    ├── Atividade/Inatividade
    ├── Jornada
    ├── Histórico
    └── Possível hora extra
```

### Associação

A associação inicial entre gestor e colaborador é realizada através de um **código de 6 dígitos**.

```text
GESTOR
  ↓
gera código
  ↓
123456
  ↓
COLABORADOR
  ↓
informa código
  ↓
associação concluída
```

Após a associação, o gestor poderá adicionar o colaborador às suas tasks.

---

## 5. Tasks

```text
Tasks

├── Visualizar
├── Criar
├── Editar
├── Associar colaboradores
└── Definir serviços monitorados
```

Cada task define quais colaboradores poderão executá-la e quais serviços serão monitorados.

---

## 6. Relatórios

```text
Relatórios

├── Filtros
│   ├── Período
│   ├── Colaborador
│   └── Task
│
├── Tempo por task
├── Tempo ativo/inativo
├── Serviços monitorados
├── Jornada
├── Possíveis horas extras
│
└── Exportar
    ├── CSV
    └── PDF
```

A tela deve possuir um **botão de exportação**, permitindo ao gestor escolher entre os formatos CSV e PDF.

Os relatórios respeitam o escopo de acesso do gestor.

---

## 7. Configurações

As configurações de acompanhamento são definidas pelo gestor.

```text
Configurações

├── Jornada
│   ├── Dias de trabalho
│   ├── Entrada
│   ├── Saída
│   ├── Intervalo
│   └── Carga horária
│
└── Limite de inatividade
```

---

## 8. Agente Desktop — Colaborador

Ao iniciar o Agente Desktop, o sistema verifica se já existe um registro de usuário na estação.

```text
Agente Desktop
      ↓
Existe usuário registrado?
   │
   ├── Não → Criar conta
   │
   └── Sim → Acessar conta
```

A criação de conta pelo Agente é destinada ao **Colaborador**.

---

## 9. Associação ao Gestor

Caso o colaborador ainda não esteja associado a um gestor, deverá informar o código de 6 dígitos recebido.

```text
Conta do colaborador
        ↓
Código do gestor
        ↓
Associação
        ↓
Minhas Tasks
```

Somente após essa associação o colaborador poderá ser incluído nas tasks do gestor.

---

## 10. Início da Task

```text
Minhas Tasks
     ↓
Selecionar Task
     ↓
Condições de monitoramento
     ↓
Confirmar ciência
     ↓
Iniciar Task
     ↓
Online
```

Antes do início, devem ser apresentados:

- descrição da task;
- serviços monitorados;
- informações registradas;
- atividade/inatividade.

O monitoramento somente começa após a confirmação do colaborador.

---

## 11. Task ativa

Durante a execução:

```text
Task ativa

├── Serviços monitorados
├── Estado Ativo/Inativo
├── Tempo registrado
├── Trocar task
└── Encerrar task
```

O colaborador não pode possuir duas tasks ativas simultaneamente.

Ao encerrar a task, o monitoramento também é encerrado.

---

## 12. System Tray

A System Tray funciona como ponto principal de acompanhamento do Agente.

```text
System Tray

├── Task ativa
├── Status Online/Offline
├── Estado Ativo/Inativo
├── Serviços monitorados
├── Histórico
├── Trocar task
└── Encerrar task
```

### Histórico

O colaborador poderá consultar um histórico em formato **TXT**.

Esse histórico deve apresentar somente as informações efetivamente enviadas ao sistema.

```text
Histórico

10:00 → VS Code → Ativo → enviado
10:32 → Chrome  → Ativo → enviado
10:48 → VS Code → Inativo → enviado
```

---

## 13. Fluxos internos

### Registro e sincronização

```text
Serviço monitorado
        ↓
Registro
        ↓
JSON
        ↓
Backend
```

Caso a comunicação falhe, os registros permanecem localmente até a sincronização.

### Atividade e inatividade

```text
Interação recente
      ↓
    Ativo

Sem interação acima do limite
      ↓
   Inativo
```

O limite é configurado pelo gestor.

---

## 14. Visão Geral

```text
TIME TRACKER
│
├── Dashboard PWA — Gestor
│   │
│   ├── Criar conta / Login
│   ├── Painel
│   ├── Colaboradores
│   │   └── Código de associação
│   ├── Tasks
│   ├── Relatórios
│   │   └── Exportar CSV/PDF
│   └── Configurações
│       ├── Jornada
│       └── Inatividade
│
└── Agente Desktop — Colaborador
    │
    ├── Criar conta / Acessar
    ├── Associar ao gestor
    ├── Minhas Tasks
    ├── Condições da Task
    └── Task ativa
        └── System Tray
            └── Histórico TXT
```