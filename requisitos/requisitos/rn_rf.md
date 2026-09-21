# Regras de Negócio e Requisitos Funcionais — Time Tracker

**Versão:** 1.0.0  
**Status:** Rascunho  
**Data:** Setembro de 2026

---

## 1. Objetivo

Este documento organiza as **Regras de Negócio (RN)** e os **Requisitos Funcionais (RF)** do Time Tracker.

Cada regra apresenta abaixo as funcionalidades necessárias para atendê-la.

---

# RN-01 — Identificação e contas de usuário

O gestor deve possuir conta própria, criada com e-mail e senha, para acessar o Dashboard.

O colaborador deve ser identificado pelo usuário Windows e pela estação corporativa, sem criar uma conta com e-mail e senha.

Seu primeiro acesso depende de um código de autorização de 6 dígitos fornecido pelo gestor, cuja validação autoriza o acesso e a associação à equipe.

Nos acessos seguintes, a autenticação deve ser automática enquanto a credencial do agente permanecer válida. O código inicial não deve ser utilizado como credencial permanente.

### RF-01 — Identificar e registrar colaborador

O Agente Desktop deve:

- Identificar o usuário Windows e a estação corporativa.
- Solicitar o código no primeiro acesso e encaminhá-lo ao fluxo de autorização e associação definido no RF-04.
- Após a autorização, verificar se o colaborador existe e registrá-lo quando necessário.
- Receber e utilizar uma credencial própria para autenticação automática nos acessos seguintes.

### RF-02 — Criar e acessar conta do gestor

O Dashboard deve permitir ao gestor criar uma conta utilizando e-mail e senha, realizar login e manter uma sessão autenticada.

---

# RN-02 — Autorização e associação entre gestor e colaborador

O código de autorização de 6 dígitos fornecido pelo gestor deve autorizar o primeiro acesso do colaborador e associá-lo à equipe desse gestor.

Após a associação, o colaborador poderá ser incluído nas tasks do gestor.

O gestor deve acessar somente os colaboradores associados a ele.

### RF-03 — Gerar código de autorização

O Dashboard deve permitir ao gestor gerar um código numérico de 6 dígitos, vinculado à sua equipe, para autorizar o primeiro acesso do colaborador e realizar sua associação.

### RF-04 — Autorizar e associar colaborador

O backend deve validar o código de 6 dígitos informado pelo colaborador no Agente Desktop.

Quando válido, deve autorizar o primeiro acesso, vincular o colaborador ao gestor correspondente e emitir a credencial do agente para os acessos seguintes.

Quando inválido, não deve autorizar o acesso nem realizar a associação.

### RF-05 — Gerenciar colaboradores associados

O Dashboard deve permitir ao gestor consultar os colaboradores associados a ele e disponibilizá-los para utilização nas tasks.

---

# RN-03 — Configuração da task

Toda task deve ser criada pelo gestor e definir:

- descrição;
- colaboradores associados;
- serviços ou aplicações monitorados.

### RF-06 — Criar e editar tasks

O Dashboard deve permitir ao gestor criar e editar tasks e definir seus colaboradores e serviços monitorados.

---

# RN-04 — Acesso às tasks

O colaborador deve visualizar e iniciar somente as tasks às quais estiver associado.

### RF-07 — Listar tasks do colaborador

O agente deve apresentar somente as tasks disponíveis para o colaborador identificado.

---

# RN-05 — Monitoramento vinculado à task

Todo monitoramento deve estar associado a uma **task ativa**.

Não deve existir monitoramento sem uma task em execução.

### RF-08 — Iniciar task

O agente deve permitir o início de uma task somente após o cumprimento das condições necessárias para o monitoramento.

---

# RN-06 — Transparência e ciência

Antes de iniciar uma task, o colaborador deve conhecer:

- a task selecionada;
- os serviços monitorados;
- as informações registradas;
- o uso de mouse e teclado para atividade/inatividade.

O colaborador deve confirmar sua ciência antes do início.

### RF-09 — Exibir condições da task

O agente deve apresentar as condições de monitoramento antes do início da task.

### RF-10 — Registrar ciência

O agente deve solicitar e registrar a confirmação de ciência do colaborador antes de iniciar o monitoramento.

---

# RN-07 — Alteração do monitoramento

Alterações nos serviços monitorados de uma task em execução devem ser informadas ao colaborador antes de serem aplicadas.

### RF-11 — Alterar serviços monitorados

O Dashboard deve permitir ao gestor alterar os serviços da task e o agente deve informar o colaborador quando o escopo da task ativa for alterado.

---

# RN-08 — Serviços monitorados

O agente deve monitorar os serviços ou aplicações definidos.

### RF-12 — Monitorar serviços da task

O agente deve identificar a aplicação utilizada, comparar com os serviços definidos na task e registrar quando houver correspondência e quando não houver.

---

# RN-09 — Informações registradas

Durante o monitoramento devem ser registrados:

- colaborador;
- usuário Windows;
- task;
- serviço ou aplicação;
- início;
- término;
- duração;
- estado Ativo/Inativo.

### RF-13 — Registrar períodos de utilização

O agente deve registrar os períodos de utilização das aplicações identificadas, estejam elas dentro ou fora do escopo da task, com as informações definidas nesta regra.

---

# RN-10 — Atividade e inatividade

Mouse e teclado devem ser utilizados somente para determinar o estado **Ativo/Inativo**.

O conteúdo das interações não deve ser coletado.

### RF-14 — Controlar atividade e inatividade

O agente deve alterar o estado entre Ativo e Inativo conforme o tempo sem interação e o limite configurado pelo gestor.

---

# RN-11 — Estado e execução da task

O colaborador será considerado **Online** enquanto o Agente Desktop estiver autenticado e conectado ao sistema.

O colaborador não pode possuir duas tasks ativas simultaneamente.

### RF-15 — Exibir estado do monitoramento

O agente deve apresentar ao colaborador:

- task ativa;
- serviços monitorados;
- estado Online/Offline;
- estado Ativo/Inativo.

### RF-16 — Acompanhar colaboradores Online

O Dashboard deve permitir ao gestor visualizar o estado dos colaboradores associados.

### RF-17 — Encerrar ou trocar task

O agente deve permitir encerrar ou trocar a task ativa, finalizando o monitoramento anterior antes de iniciar uma nova task.

---

# RN-12 — Continuidade dos registros

Falhas de comunicação não devem causar perda dos registros produzidos durante uma task.

### RF-18 — Armazenar registros localmente

O agente deve manter localmente os registros até que sejam confirmados pelo servidor.

### RF-19 — Sincronizar registros

O agente deve enviar os registros pendentes ao backend e retomar a sincronização após o restabelecimento da comunicação.

---

# RN-13 — Configurações do gestor

A **jornada de trabalho** e o **limite de inatividade** devem ser configurados pelo gestor para cada colaborador associado.

### RF-20 — Configurar jornada

O Dashboard deve permitir ao gestor selecionar um colaborador associado e definir:

- dias de trabalho;
- entrada;
- saída;
- intervalo;
- carga horária.

### RF-21 — Configurar limite de inatividade

O Dashboard deve permitir ao gestor definir, para cada colaborador associado, o tempo sem interação necessário para considerá-lo Inativo.

---

# RN-14 — Possível hora extra

Atividades realizadas após o término previsto da jornada poderão ser identificadas como **possível hora extra**.

### RF-22 — Identificar possível hora extra

O sistema deve identificar períodos de task ativa após o horário previsto de término da jornada.

---

# RN-15 — Acesso aos dados

O colaborador deve acessar somente seus próprios dados.

O gestor deve acessar somente dados dos colaboradores associados a ele.

### RF-23 — Consultar registros

O sistema deve permitir:

- ao colaborador consultar seus próprios registros;
- ao gestor consultar registros dos colaboradores associados.

---

# RN-16 — Relatórios e exportação

O gestor poderá consultar e exportar informações referentes aos colaboradores sob sua responsabilidade.

### RF-24 — Gerar relatórios

O Dashboard deve permitir consultar relatórios contendo:

- tasks;
- tempo por task;
- serviços monitorados;
- atividade/inatividade;
- jornada;
- possíveis horas extras.

### RF-25 — Exportar relatórios

A área de relatórios deve possuir um **botão de exportação** permitindo escolher entre:

- CSV;
- PDF.

---

# RN-17 — Histórico do colaborador

O colaborador deve poder consultar um histórico contendo somente as informações que foram efetivamente enviadas ao sistema.

Os registros confirmados pelo backend devem ser marcados localmente como sincronizados e mantidos disponíveis conforme a política de retenção aplicável.

### RF-26 — Consultar histórico TXT

A System Tray deve permitir ao colaborador visualizar seu histórico em formato **TXT**, utilizando os registros locais marcados como sincronizados.

---

# RN-18 — Finalidade e minimização

O monitoramento deve ser limitado às informações necessárias para:

- acompanhamento de tasks;
- serviços utilizados;
- atividade e inatividade;
- jornada;
- relatórios.

Dados que não atendam a essas finalidades não devem fazer parte do monitoramento.

### RFs relacionados

Esta regra deve ser respeitada principalmente por:

- **RF-12 — Monitorar serviços da task**;
- **RF-13 — Registrar períodos de utilização**;
- **RF-14 — Controlar atividade e inatividade**.

---

# RN-19 — Visão gerencial do Dashboard

O gestor deve possuir uma visão consolidada das informações dos colaboradores associados a ele.

As informações apresentadas no Dashboard devem permitir acompanhar:

- estado Online/Offline dos colaboradores;
- tasks em andamento;
- tempo ativo e inativo;
- tempo registrado por task;
- possíveis horas extras;
- sequência das atividades registradas.

O Dashboard não deve apresentar rankings ou métricas de produtividade dos colaboradores.

As informações devem respeitar os filtros selecionados e as regras de acesso aos dados.

### RF-27 — Exibir Dashboard analítico

O Dashboard deve permitir ao gestor visualizar informações consolidadas dos colaboradores associados, incluindo:

- quantidade de colaboradores Online e Offline;
- quantidade de tasks ativas;
- tempo total ativo;
- tempo total inativo;
- tempo registrado por task;
- possíveis horas extras;
- status dos colaboradores;
- Activity Timeline das tasks;
- classificação das aplicações utilizadas como dentro ou fora do escopo da task.

O Dashboard deve permitir filtrar as informações por:

- período;
- colaborador;
- task.

Ao alterar um filtro, os indicadores e visualizações relacionados devem ser atualizados de acordo com a seleção.

O Dashboard deve apresentar somente informações que o gestor possui permissão para consultar.

O Dashboard não deve apresentar rankings ou métricas de produtividade.

---

## Pontos pendentes

Devem ser definidos antes da implementação da associação:

- validade e expiração do código de 6 dígitos;
- possibilidade de reutilização ou uso único do código;
- comportamento de regeneração do código;
- possibilidade de um colaborador estar associado a mais de um gestor.

---
