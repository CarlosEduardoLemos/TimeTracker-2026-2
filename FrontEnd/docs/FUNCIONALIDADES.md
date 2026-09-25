# Funcionalidades disponíveis no frontend

Este é o inventário das telas que a aplicação **executa hoje**. Os requisitos em `requisitos/` descrevem o produto desejado; a ausência de um contrato no backend está registrada em [Pendências](PENDENCIAS.md). Nenhuma informação de task, produtividade, usuário autenticado ou equipe é criada no navegador.

## Rotas e navegação

| Hash | Conteúdo atual | Fonte de dados |
| --- | --- | --- |
| `#/painel` ou hash vazio | Indicadores, última atividade e categorias do resumo diário | Três endpoints de leitura |
| `#/colaboradores` | Usuários globais cadastrados, com última atividade quando disponível | `/users/`, `/activities/realtime` |
| `#/tasks` | Explicação da dependência de contratos de task | Nenhuma consulta |
| `#/relatorios` | Exportação do resumo diário CSV/PDF | `/users/`, `/dashboard/export/*` |
| `#/configuracoes` | Dois parâmetros globais do sistema | `GET`/`PUT /config/` |
| `#/login`, `#/cadastro` | Aviso de autenticação indisponível e retorno ao painel | Nenhuma consulta |
| Qualquer outro hash | Página não encontrada e link para o painel | Nenhuma consulta |

O menu principal mostra Painel, Colaboradores, Tasks, Relatórios e Configurações. Há um link “Criar conta”, mas a rota de cadastro explica que a função ainda não existe. A navegação por hash permite acesso direto às páginas, e o título da aba muda conforme a rota. O tema claro/escuro é mantido entre visitas por `localStorage`; sem escolha anterior, segue a preferência do sistema.

## Painel (`#/painel`)

### Filtros e atualização

- **Data do resumo:** inicia na data local do navegador, não aceita data vazia e oferece datas até o dia atual. É enviada ao backend apenas para `/dashboard/summary`.
- **Usuário:** opções provenientes de `/users/`; fica desabilitado quando a lista não está disponível. O `username` selecionado é enviado ao resumo e usado no navegador para filtrar a tabela atual. O backend realtime não recebe filtro.
- **Atualizar:** repete a consulta das três fontes. Também há atualização automática a cada 30 segundos quando a aba está visível e atualização imediata ao retornar à aba. A interface mostra o horário da última resposta com pelo menos uma fonte válida.

### Indicadores exibidos

| Indicador | Cálculo e fonte | Limite da interpretação |
| --- | --- | --- |
| Online | Contagem de usuários da lista, filtrados se necessário, cujo status realtime é `online` | Status de leitura calculado pelo backend; não é prova de conexão autenticada do agente |
| Ausentes | Contagem com status realtime `ausente` | Indica leitura recente marcada como ociosa ou acima do limite do backend |
| Sem leitura recente | Usuários cadastrados que não aparecem na resposta realtime | Derivado no frontend da janela de 15 minutos; não equivale a offline de rede |
| Tempo registrado | Soma de `total_seconds` dos usuários no resumo da data selecionada | Tempo agregado de atividades, sem classificar produtividade por task |
| Usuários cadastrados | Sem filtro, tamanho de `/users/`; com filtro, contagem do `username` selecionado nessa lista | Não é equipe vinculada a gestor; independe da disponibilidade do realtime |

Se usuários ou realtime falharem, contagens de estado aparecem como indisponíveis, e não como zero. Se o resumo falhar ou vier com data diferente, o tempo registrado e as categorias ficam indisponíveis. Um resumo válido com lista vazia produz zero de tempo e mensagem “Sem registros na data selecionada”.

O indicador **Usuários cadastrados** usa somente `/users/`, inclusive quando há usuário selecionado. Uma falha isolada do realtime não altera essa contagem.

### Tabelas

**Última atividade** mostra usuário, status de leitura, `process_name` e segundos desde a última captura. Os dados são atuais, mesmo quando a data do resumo é antiga. **Tempo por categoria** agrega `by_category` de todos os usuários presentes no resumo filtrado e ordena pela duração. Categorias não representam aplicações produtivas dentro de uma task. Ambas as áreas têm mensagens próprias de carregamento, vazio e indisponibilidade.

Um aviso informa que `/users/` é global e que a API não oferece conexão real do agente. Tasks ativas, tempo produtivo, horas extras e timeline não são calculados.

## Colaboradores (`#/colaboradores`)

A tabela exibe `username`, `full_name` e `department` da lista global. Quando realtime está disponível, acrescenta estado da última leitura e processo mais recente. Se realtime falhar, os usuários ainda aparecem e as colunas de atividade indicam indisponibilidade. Se a lista de usuários falhar, não se apresenta uma lista vazia como resultado real. Há estado de carregamento, aviso de falha, botão “Tentar novamente” e mensagem para lista validamente vazia. Esta tela não mostra código de associação, gestor, permissões ou conexão confirmada do agente.

## Tasks (`#/tasks`)

A página informa que o backend não oferece consulta, criação, edição ou persistência de tasks, seleção de colaboradores associados e aplicações do escopo. Não há formulário local, botão de salvar, mock ou dados predefinidos. O requisito RF-06 permanece dependente dos contratos indicados em [Pendências](PENDENCIAS.md).

## Configurações (`#/configuracoes`)

O formulário aparece após `GET /config/` válido. Permite editar somente `capture_interval_seconds` e `idle_timeout_seconds`, ambos globais e medidos em segundos. Inputs exigem inteiros positivos; a mesma regra é verificada antes do envio e na resposta do servidor. `PUT /config/` envia os dois valores juntos. Durante o salvamento os campos são bloqueados; uma resposta válida mostra “Configurações salvas”. Falha de leitura mostra retry; falha de gravação preserva o formulário com erro. Sair da página cancela uma operação em andamento.

O campo global de inatividade **não** configura o limite individual previsto em RF-21. O backend usa atualmente uma constante própria para calcular o status realtime; salvar esse campo não muda esse cálculo por si só. Não há controles de jornada, dias úteis, horários ou intervalo (RF-20).

## Relatórios (`#/relatorios`)

A página oferece uma data e, quando `/users/` responde validamente, um filtro opcional de usuário. A falha da lista desabilita apenas esse filtro; a exportação geral continua disponível. Os botões chamam `/dashboard/export/csv` ou `/dashboard/export/pdf` com a data e, se escolhido, `username`. Durante o download há indicação de progresso e não se inicia outro. HTTP com falha, tipo de conteúdo incompatível ou arquivo vazio gera mensagem de erro. A operação é cancelada ao sair da página.

O **CSV atual** contém as colunas `username`, `category`, `total_seconds` e uma linha por categoria retornada para cada usuário. Sem registros, pode conter apenas o cabeçalho. O **PDF atual** contém a data, o total e as categorias de cada usuário retornado. A interface salva o arquivo como `resumo_<data>.csv` ou `.pdf`. Esses arquivos são exportações do resumo diário parcial, não relatórios completos de RF-24/RF-25: não contêm período, task, aplicação, classificação dentro/fora do escopo, jornada ou possível hora extra.

## Login e cadastro (`#/login`, `#/cadastro`)

As rotas mostram o bloqueio de autenticação e um retorno ao painel. Não há formulário de credenciais, sessão, token, usuário fictício nem proteção de rota. Enquanto o backend não oferecer autenticação e autorização, todas as consultas disponíveis usam os endpoints globais atuais. A possibilidade de navegar até essas telas não significa que cadastro ou login funcionem.

## Acessibilidade e apresentação

O layout adapta menu e colunas a mobile, tablet e desktop. Há link para pular ao conteúdo, foco visível, labels nos controles, cabeçalhos e `caption` de tabela, mensagens de erro/status anunciáveis, navegação do diálogo móvel por teclado e redução de movimento quando solicitada pelo sistema. Tabelas extensas permitem rolagem horizontal com foco. Essas medidas estão implementadas no código; a validação manual restante está em [Testes](TESTES.md).

## Correspondência com os requisitos do produto

| Requisito do projeto | Situação do frontend atual |
| --- | --- |
| RF-02, RF-03 | Login/cadastro e código de associação indisponíveis por falta de contratos e autorização |
| RF-05, RF-16 | Há listagem global e status de leitura aproximado; equipe associada e conexão real indisponíveis |
| RF-06, RF-11 | Criação/edição de task e escopo indisponíveis |
| RF-20, RF-21 | Apenas configuração global da API; jornada e limite por colaborador indisponíveis |
| RF-22, RF-24, RF-25, RF-27 | Resumo e exportação diária parciais; métricas, filtros e timeline completos indisponíveis |

Os RF relacionados ao Agente Desktop e ao histórico da System Tray estão fora da responsabilidade deste frontend. Detalhes técnicos dos contratos existentes estão em [Arquitetura](ARQUITETURA.md).
