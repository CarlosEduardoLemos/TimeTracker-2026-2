# Visão do Produto — Time Tracker

**Versão:** 1.0.0  
**Status:** Rascunho  
**Data:** Setembro de 2026

---

## 1. O que é o Time Tracker

O **Time Tracker** é uma solução open source corporativa para acompanhamento de:

- tasks;
- atividade e inatividade;
- tempo de utilização;
- jornada de trabalho.

O sistema possui dois perfis:

- **Colaborador:** executa tasks e acompanha seus próprios registros;
- **Gestor:** organiza sua equipe, cria tasks, define o monitoramento e consulta relatórios.

A solução é composta por:

```text
Agente Desktop
      ↓
Backend / API
      ↓
Dashboard PWA
```

O **Agente Desktop** é utilizado pelo colaborador.

O **Dashboard PWA** é utilizado pelo gestor.

---

## 2. Contas e associação

O colaborador utiliza o Agente Desktop.

Caso não exista um usuário registrado na estação, o agente permite criar uma conta de colaborador.

O gestor possui no Dashboard a opção de criar uma conta utilizando e-mail.

A associação inicial entre colaborador e gestor é realizada através de um **código de 6 dígitos**.

```text
GESTOR
  ↓
gera código
  ↓
COLABORADOR
  ↓
informa código
  ↓
associação
```

Após a associação, o gestor poderá adicionar o colaborador às suas tasks.

---

## 3. Monitoramento baseado em tasks

A **task é a unidade central do monitoramento**.

Não existe monitoramento sem uma task ativa.

O gestor define para cada task:

- descrição;
- colaboradores associados;
- serviços ou aplicações monitorados.

O colaborador visualiza somente as tasks às quais estiver associado.

---

## 4. Transparência

Antes de iniciar uma task, o colaborador deve visualizar:

- a task selecionada;
- os serviços monitorados;
- as informações registradas;
- como atividade e inatividade são identificadas.

```text
Selecionar Task
      ↓
Visualizar condições
      ↓
[ Cancelar ]
[ Estou ciente e iniciar ]
```

O monitoramento somente começa após a confirmação de ciência do colaborador.

Alterações no escopo de uma task ativa devem ser informadas antes de serem aplicadas.

---

## 5. Informações registradas

Durante uma task poderão ser registrados:

- colaborador;
- usuário Windows;
- task;
- serviço ou aplicação monitorada;
- início;
- término;
- duração;
- estado Ativo/Inativo.

Mouse e teclado são utilizados somente para verificar se houve interação recente.

```text
Interação recente?
      ↓
   sim / não
      ↓
Ativo / Inativo
```

O conteúdo das interações não deve ser coletado.

Também não fazem parte do monitoramento:

- teclas digitadas;
- senhas;
- screenshots;
- áudio;
- câmera;
- conteúdo de mensagens ou arquivos.

---

## 6. Execução da task

```text
Login
  ↓
Selecionar Task
  ↓
Confirmar ciência
  ↓
Iniciar Task
  ↓
Online
```

O colaborador não pode possuir duas tasks ativas simultaneamente.

Ao trocar ou encerrar a task, o monitoramento atual deve ser finalizado.

---

## 7. Registro e sincronização

As atividades são registradas como períodos de utilização.

```text
VS Code
10:00 → 10:32

Chrome
10:32 → 10:48
```

Os registros são armazenados localmente antes da transmissão.

```text
Registro
   ↓
JSON
   ↓
Backend
   ↓
PostgreSQL
```

Em caso de falha de comunicação, os registros permanecem localmente até que possam ser sincronizados.

---

## 8. Jornada e configurações

O gestor configura:

- dias de trabalho;
- horário de entrada;
- horário de saída;
- intervalo;
- carga horária;
- limite de inatividade.

Atividades realizadas após o término previsto da jornada poderão ser identificadas como **possível hora extra**.

---

## 9. Dashboard e relatórios

O gestor utiliza o Dashboard para:

- acompanhar sua equipe;
- criar e editar tasks;
- associar colaboradores;
- definir serviços monitorados;
- consultar atividade e inatividade;
- acompanhar jornadas;
- consultar possíveis horas extras;
- gerar relatórios.

Os relatórios podem apresentar:

- tasks;
- tempo por task;
- serviços monitorados;
- tempo ativo/inativo;
- jornada;
- possíveis horas extras.

A tela de relatórios possui um **botão de exportação**, permitindo escolher entre:

- CSV;
- PDF.

O gestor visualiza somente os colaboradores associados a ele.

---

## 10. Histórico do colaborador

O colaborador pode consultar pela **System Tray** um histórico em formato TXT.

Esse histórico apresenta somente as informações que foram efetivamente enviadas ao sistema.

```text
10:00 → VS Code → Ativo → enviado
10:32 → Chrome  → Ativo → enviado
```

---

## 11. Princípios do produto

### Transparência

O colaborador deve saber quando e sobre quais atividades está sendo monitorado.

### Escopo limitado

Somente serviços definidos na task devem ser monitorados.

### Minimização

Somente informações necessárias devem ser coletadas.

### Segurança

Os dados devem ser protegidos durante armazenamento, transmissão e consulta.

### Controle de acesso

O colaborador acessa seus próprios dados.

O gestor acessa somente os dados dos colaboradores associados a ele.

### Atividade não significa produtividade

O Time Tracker registra atividade, tempo, tasks e jornada.

Esses dados podem auxiliar análises, mas não representam automaticamente produtividade.

---

## 12. Fluxo Geral

```text
GESTOR
  ↓
cria conta
  ↓
gera código
  ↓
COLABORADOR
  ↓
cria/acessa conta
  ↓
associa-se ao gestor
  ↓
recebe Tasks
  ↓
seleciona Task
  ↓
visualiza condições
  ↓
confirma ciência
  ↓
inicia Task
  ↓
monitoramento
  ↓
registros
  ↓
Dashboard
```

---

## 13. Direção do produto

O Time Tracker não deve ser uma ferramenta de monitoramento indiscriminado da estação do colaborador.

Sua finalidade é apoiar:

- organização do trabalho;
- acompanhamento de tasks;
- acompanhamento da jornada;
- análise de atividade;
- geração de relatórios.

> **O monitoramento deve ocorrer somente dentro de uma task, com escopo definido e conhecido pelo colaborador.**