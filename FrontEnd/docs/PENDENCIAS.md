# Pendências para concluir o frontend

## Revisão do frontend nesta entrega

- As consultas do painel agora tratam resumo, usuários e realtime separadamente:
  uma falha parcial aparece como indisponibilidade, sem transformar ausência de
  resposta em zero. Trocas de filtro cancelam a consulta anterior.
- A exportação diária baixa o arquivo pela API e informa falhas HTTP na tela.
- A configuração global só pode ser editada após a leitura real do servidor e
  valida números inteiros positivos antes de salvar.
- O menu móvel permite fechar com Escape, mantém o foco no diálogo e libera a
  rolagem ao fechar. O link de salto preserva a rota por hash.
- Login/cadastro e tasks continuam sem envio porque os contratos e a
  autorização necessários não existem. Nenhuma pasta do backend foi editada.

## Alterações necessárias no backend

| Local | Alteração necessária | Motivo |
| --- | --- | --- |
| `backend/app/main.py`, `backend/app/models.py`, `backend/app/schemas.py` e novo router de autenticação | Criar conta de gestor, login, sessão segura, consulta da sessão e logout; aplicar autenticação e autorização nos routers existentes | US-05/RF-02 e CA-09 exigem identidade e isolamento; a UI não pode garanti-los |
| `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/users.py` e `backend/app/crud.py` | Persistir vínculo gestor–colaborador, disponibilizar o código numérico de 6 dígitos e retornar somente a equipe do gestor | US-06/RF-03/RF-05; `GET /users/` lista usuários globalmente |
| `backend/app/models.py`, `backend/app/schemas.py` e novo router de tasks | Criar CRUD de tasks com descrição, colaboradores associados, aplicações do escopo e estado de execução | RF-06/RF-11; não existe modelo nem endpoint de task |
| `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/config.py` e `backend/app/crud.py` | Ler/gravar jornada e limite de inatividade por colaborador; usar o limite salvo no cálculo de atividade | RF-20/RF-21; `GET/PUT /config/` é global e `get_realtime_view` usa `MAX_IDLE_SECONDS` de `backend/app/utils.py` |
| `backend/app/models.py`, `backend/app/schemas.py`, `backend/app/routers/activities.py` e `backend/app/crud.py` | Registrar períodos com task, aplicação, classificação, início/fim, duração e estado; oferecer timeline e presença real do Agente | RF-13/RF-16/RF-27; realtime atual é uma janela de registros, não estado de conexão nem histórico |
| `backend/app/routers/dashboard.py` e `backend/app/crud.py` | Disponibilizar agregados por período/colaborador/task, possível hora extra e consulta/exportação CSV/PDF com os mesmos filtros | RF-22/RF-24/RF-25/RF-27; resumo/exportações atuais aceitam só data e usuário |

Os contratos devem definir método, rota, payload, erros, fuso horário e
autorização antes de conectar as telas pendentes. O Agente Desktop também
precisará enviar os novos campos previstos na US-12.

Este documento reúne somente o que impede ou limita o **Dashboard do Gestor**.
Requisitos exclusivos do Agente Desktop não são listados, exceto quando o dado
produzido pelo Agente também é necessário para uma tela do frontend.

A análise considera o frontend em `FrontEnd/src`, os contratos existentes em
`backend/app` e os requisitos RF/CA. Nenhuma alteração de backend foi realizada.

## O que já funciona com o backend atual

| Área | Integração disponível | Limite atual |
| --- | --- | --- |
| Painel | Resumo diário por categoria, lista global de usuários e atividade recente | Sem gestor/equipe, task, período, jornada ou timeline |
| Colaboradores | Lista global e estado derivado de `/activities/realtime` | Não representa colaboradores associados ao gestor |
| Relatórios | Exportação CSV/PDF por uma data e, opcionalmente, usuário | É um resumo parcial por categoria, não o relatório de RF-24 |
| Configurações | Leitura e gravação do intervalo de captura e timeout globais | Não configura jornada nem valores por colaborador |

Endpoints já usados pelo React: `GET /users/`, `GET /activities/realtime`,
`GET /dashboard/summary`, `GET/PUT /config/` e as exportações
`GET /dashboard/export/csv|pdf`.

## Pendências do backend que bloqueiam funcionalidades

### 1. Autenticação, sessão e autorização — bloqueio geral

**Requisitos:** RF-02, RF-23, CA-01 e CA-09.

Faltam contratos para cadastro e login do gestor, consulta da sessão atual,
renovação quando aplicável e logout. As rotas também precisam validar a identidade
do gestor e responder corretamente com `401` e `403`.

Sem isso, o frontend não pode:

- enviar os formulários de login e cadastro;
- proteger Dashboard, Colaboradores, Tasks, Relatórios e Configurações;
- garantir que um gestor veja somente sua equipe e seus registros;
- anexar token ou usar cookie de sessão nas chamadas da API.

### 2. Código de associação e equipe do gestor

**Requisitos:** RF-03, RF-05, RF-16 e CA-01/CA-04.

Faltam:

- gerar ou consultar o código numérico de 6 dígitos do gestor;
- definir validade, expiração e regras de regeneração/reutilização do código;
- listar somente os colaboradores associados ao gestor autenticado;
- retornar o estado Online/Offline de toda a equipe, inclusive quem não possui
  atividade recente.

Hoje, `GET /users/` expõe a lista global. O realtime omite usuários sem registro
nos últimos 15 minutos e retorna `online` ou `ausente`; portanto, ele sozinho não
cumpre o estado Online/Offline definido nos requisitos.

### 3. Tasks e aplicações do escopo

**Requisitos:** RF-06, RF-11 e parte gerencial de CA-02/CA-03.

Não existem modelo nem endpoints de task. O frontend precisa de contratos para:

- listar, criar, consultar e editar tasks do gestor;
- armazenar descrição e situação da task;
- associar e remover colaboradores da equipe;
- cadastrar as aplicações/serviços pertencentes ao escopo;
- informar task ativa e colaboradores que a executam;
- aplicar alterações de escopo ao fluxo do Agente Desktop.

Categorias e regras de categorização atuais não substituem tasks: não possuem
colaboradores associados, execução ativa nem escopo próprio por task.

### 4. Jornada e inatividade por colaborador

**Requisitos:** RF-20, RF-21, RF-22 e CA-06.

Faltam leitura e gravação, por colaborador, de:

- dias de trabalho;
- horário de entrada e saída;
- intervalo;
- carga horária;
- limite de inatividade.

Também falta o cálculo dos períodos de task após a jornada como **possível hora
extra**. O `GET/PUT /config/` atual é global e contém apenas intervalo de captura
e timeout. Além disso, o timeout salvo nessa configuração não é a fonte usada
pelo cálculo realtime atual, que lê uma configuração de ambiente.

### 5. Registros necessários ao Dashboard analítico

**Requisitos:** RF-13, RF-14, RF-22, RF-27 e CA-08/CA-10.

Para preencher as visualizações sem inventar dados, os registros e consultas
precisam fornecer:

- task relacionada e indicação de task ativa;
- aplicação utilizada e classificação dentro/fora do escopo da task;
- início, término e duração de cada período;
- estado Ativo/Inativo do período;
- tempo total registrado e tempo produtivo por task;
- possíveis horas extras;
- sequência cronológica para a Activity Timeline;
- filtros por período, colaborador e task.

O resumo atual agrega apenas data, usuário, categoria e segundos. O realtime é
uma fotografia recente e não substitui uma timeline histórica.

### 6. Relatórios completos

**Requisitos:** RF-24, RF-25 e CA-07.

Os endpoints CSV/PDF existentes podem continuar como exportação de resumo diário,
mas não atendem ao relatório oficial. Faltam consulta e exportação autorizadas com:

- data inicial e final;
- colaborador e task;
- tasks e aplicações registradas;
- classificação dentro/fora do escopo;
- tempos registrado, produtivo, ativo e inativo;
- jornada e possíveis horas extras.

Os mesmos filtros e critérios devem produzir resultados coerentes na consulta da
tela, no CSV e no PDF.

## Funcionalidades ainda pendentes no frontend

Estas implementações continuam necessárias no React quando os contratos acima
forem definidos:

| Tela/camada | Implementação que falta | Dependência principal |
| --- | --- | --- |
| API | Métodos de autenticação, associação, tasks, jornada, timeline e relatório completo | Contratos e schemas do backend |
| Aplicação | Estado de sessão, persistência segura, logout, proteção de rotas e tratamento específico de `401/403` | Autenticação/autorização |
| Login/Cadastro | Enviar formulários, exibir erros da API e redirecionar após sucesso | RF-02 |
| Colaboradores | Exibir/copiar/regenerar código e listar somente a equipe associada | RF-03/RF-05 |
| Tasks | Implementar listagem e formulário real de criação/edição, seleção de colaboradores e aplicações | RF-06/RF-11 |
| Configurações | Implementar seleção de colaborador e formulário de jornada/inatividade individual | RF-20/RF-21 |
| Painel | Adicionar período/task, tasks ativas, ativo/inativo, produtividade por escopo, hora extra e timeline | RF-27 |
| Relatórios | Adicionar período/task e apresentar/exportar o relatório completo | RF-24/RF-25 |

Observação: a tela de Tasks atual é apenas informativa; login/cadastro possuem
validação local, mas não enviam dados; as rotas gerenciais ainda são públicas no
cliente. Esses comportamentos são intencionais enquanto não há contrato seguro,
mas não representam funcionalidades concluídas.

## Ordem mínima recomendada de implementação

1. Autenticação, sessão, autorização e vínculo gestor–colaborador.
2. Código de associação e consulta da equipe autenticada.
3. Modelo/CRUD de tasks, escopo e vínculo de colaboradores.
4. Jornada e inatividade por colaborador.
5. Registros por período vinculados à task e cálculo de agregados.
6. Dashboard analítico e relatórios completos.

Essa ordem evita implementar telas sobre dados globais ou contratos temporários
que depois precisariam ser refeitos para aplicar autorização e escopo de equipe.

## Contratos que precisam ser definidos antes da integração

Para cada recurso pendente, backend e frontend ainda precisam acordar:

- método, rota, parâmetros e payload;
- schema de sucesso e formato padronizado de erro;
- autenticação por cookie seguro ou token e política de renovação;
- regras de autorização por gestor/equipe;
- paginação para listas e timelines;
- fuso horário e limites inclusivo/exclusivo dos períodos;
- estados vazios, conflitos e códigos HTTP esperados.

Não é necessário criar mocks permanentes para considerar essas telas prontas: até
os contratos existirem, o frontend deve manter avisos de integração e não exibir
valores fictícios como se fossem dados reais.
