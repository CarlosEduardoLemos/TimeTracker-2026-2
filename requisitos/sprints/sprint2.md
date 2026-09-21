> **Documento de Requisitos — fabrica-bayarea/TimeTracker-2026-2**  
> **responsáveis:** Patricia Pereira Martins e Marley Eduardo Rocha Guedes
> (Time de requisitos e testes) 
> **Data:** 21/setembro/2026
> **Versão:** 1.2 — Sprint 2

# EP-01 (US-01) — US-01 — Criar e acessar conta do gestor
# EP-01 (US-02) — Identificar e autorizar o colaborador no Agente Desktop
# EP-04 — Capturar atividade do colaborador

## User Stories

### US-01 — Criar e acessar conta do gestor

**Prioridade:** P0

**Como** gestor,
**quero** criar uma conta e realizar login no Dashboard,
**para que** eu possa acessar as funcionalidades de gestão do sistema.

#### Escopo

- Criar conta utilizando e-mail e senha.
- Realizar login no Dashboard.
- Manter uma sessão autenticada.

#### Referências específicas

- **Requisito funcional:** RF-02 — Criar e acessar conta do gestor.
- **Critério de aceite:** CA-01 — Identificação, acesso e associação
  (cadastro e login do gestor).
- **Critério de aceite:** CA-09 — Privacidade e segurança
  (proteção da autenticação e da sessão).
---

### US-02 — Identificar e autorizar o colaborador no Agente Desktop

**Prioridade:** P1

**Como** colaborador,  
**quero** autorizar meu primeiro acesso com um código fornecido pelo gestor,  
**para que** eu possa utilizar o Agente Desktop vinculado à minha equipe, sem criar uma conta e com autenticação automática nos acessos seguintes.

#### Escopo

- Disponibilizar a versão inicial do Agente Desktop.
- Identificar localmente o usuário Windows e a estação corporativa.
- Solicitar o código de autorização de 6 dígitos no primeiro acesso.
- Validar o código no backend antes de autorizar o acesso.
- Registrar o colaborador, quando necessário, e associá-lo ao gestor correspondente após a validação.
- Estabelecer uma credencial própria do agente para autenticação nos acessos seguintes.
- Autenticar o agente automaticamente enquanto sua credencial permanecer válida, sem solicitar novamente o código.
- Impedir o acesso autenticado quando o código inicial for inválido.

#### Referências específicas

- **Requisito funcional:** RF-01 — Identificar e registrar colaborador (a atualizar: autorização inicial por código e autenticação automática posterior).
- **Requisito funcional:** RF-04 — Associar colaborador (a atualizar: autorização do primeiro acesso e associação ao gestor).
- **Critério de aceite:** CA-01 — Identificação, acesso e associação (a atualizar conforme o novo fluxo).
- **Critério de aceite:** CA-09 — Privacidade e segurança (proteção das credenciais do agente e comunicação por HTTPS).


### US-13 — Monitorar aplicações durante a task

**Prioridade:** P0

**Como** gestor,
**quero** que as aplicações utilizadas durante uma task sejam registradas,
**para que** seja possível identificar quais atividades ocorreram durante sua execução e se estavam ou não relacionadas ao seu escopo.

#### Escopo

* Identificar a task ativa e obter os serviços ou aplicações definidos nela.
* Identificar a aplicação atualmente utilizada enquanto existir uma task ativa.
* Comparar a aplicação identificada com o escopo da task.
* Registrar a aplicação utilizada, independentemente de pertencer ou não ao escopo da task.
* Associar a cada registro a classificação dentro ou fora do escopo da task.

#### Referências específicas

* **Requisito funcional:** RF-12 — Monitorar serviços da task.
* **Critério de aceite:** CA-03 — Monitoramento da atividade (Cenário B — registro das aplicações e classificação dentro/fora do escopo da task).

### US-14 — Registrar período de utilização

**Prioridade:** P0

**Como** gestor,
**quero** que os períodos de utilização das aplicações sejam registrados,
**para que** seja possível consultar posteriormente as atividades realizadas durante uma task.

#### Escopo

* Identificar o início e o término da utilização da aplicação.
* Calcular a duração do período de utilização.
* Montar o registro da atividade com colaborador, usuário Windows, task, serviço ou aplicação, início, término, duração, estado Ativo/Inativo e relação com o escopo da task.
* Identificar se a atividade pertence ao escopo da task e associar essa informação ao registro.

#### Referências específicas

* **Requisito funcional:** RF-13 — Registrar períodos de utilização.
* **Critério de aceite:** CA-03 — Monitoramento da atividade (Cenário B — períodos de utilização e informações de cada registro).

### US-15 — Identificar atividade e inatividade

**Prioridade:** P1

**Como** gestor,
**quero** identificar os períodos ativos e inativos do colaborador durante uma task,
**para que** os registros representem corretamente o estado da atividade naquele período.

#### Escopo

* Obter o limite de inatividade configurado.
* Identificar o tempo sem interação com mouse ou teclado.
* Alterar o estado para Inativo ao atingir o limite configurado.
* Alterar o estado para Ativo quando houver nova interação.
* Utilizar a interação com mouse e teclado somente para determinar o estado Ativo/Inativo.
* Garantir que o conteúdo das interações não seja coletado nem armazenado.

#### Referências específicas

* **Requisito funcional:** RF-14 — Controlar atividade e inatividade.
* **Critério de aceite:** CA-03 — Monitoramento da atividade (Cenário B — identificação do estado Ativo/Inativo sem coleta do conteúdo das interações).
* **Critério de aceite:** CA-09 — Privacidade e segurança (Cenário B — uso de mouse e teclado somente para identificar atividade/inatividade, sem armazenamento do conteúdo das interações).