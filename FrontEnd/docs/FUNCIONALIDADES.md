# Funcionalidades disponíveis no frontend

Este é o inventário das telas que a aplicação **executa hoje**. A [visão do produto](../../requisitos/visao.md), as [regras de negócio e requisitos funcionais](../../requisitos/requisitos/rn_rf.md) e os [critérios de aceite](../../requisitos/requisitos/ca.md) descrevem o produto desejado; os links nos IDs abaixo levam à seção de origem de cada requisito. A ausência de contratos no backend está registrada em [Pendências](PENDENCIAS.md). Nenhuma informação de task, produtividade, usuário autenticado ou equipe é criada no navegador.

## Rotas e navegação

| Hash                     | Conteúdo atual                                                       | Fonte de dados                    |
| ------------------------ | -------------------------------------------------------------------- | --------------------------------- |
| `#/painel` ou hash vazio | Indicadores, última atividade e categorias do resumo diário          | Três endpoints de leitura         |
| `#/colaboradores`        | Usuários globais cadastrados, com última atividade quando disponível | `/users/`, `/activities/realtime` |
| `#/tasks`                | Explicação da dependência de contratos de task                       | Nenhuma consulta                  |
| `#/relatorios`           | Exportação do resumo diário CSV/PDF                                  | `/users/`, `/dashboard/export/*`  |
| `#/configuracoes`        | Dois parâmetros globais do sistema                                   | `GET`/`PUT /config/`              |
| `#/login`, `#/cadastro`  | Aviso de autenticação indisponível e retorno ao painel               | Nenhuma consulta                  |
| Qualquer outro hash      | Página não encontrada e link para o painel                           | Nenhuma consulta                  |

O menu principal mostra Painel, Colaboradores, Tasks, Relatórios e Configurações. Há um link “Criar conta”, mas a rota de cadastro explica que a função ainda não existe. A navegação por hash permite acesso direto às páginas; ao trocar de rota, o foco de teclado vai ao conteúdo principal e o título da aba muda. O tema claro/escuro é mantido entre visitas por `localStorage`; sem escolha anterior, segue a preferência do sistema.

A lista de áreas solicitadas vem do [sitemap do Dashboard PWA](../../requisitos/sitemap.md#1-dashboard-pwa--gestor). Os hashes, estados e fontes da tabela acima descrevem a implementação atual, não uma exigência de URL do sitemap.

## Painel (`#/painel`)

O escopo solicitado para filtros, indicadores e timeline está na [tela de referência do Dashboard](../../requisitos/screens/dashboard.md#objetivo) e em [RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico). Os itens abaixo registram apenas o painel que funciona hoje.

### Filtros e atualização

- **Data do resumo:** inicia na data local do navegador, não aceita data vazia e oferece datas até o dia atual. É enviada ao backend apenas para `/dashboard/summary`.
- **Usuário:** opções provenientes de `/users/`; fica desabilitado quando a lista não está disponível. O `username` selecionado é enviado ao resumo e usado no navegador para filtrar a tabela atual. O backend realtime não recebe filtro.
- **Atualizar:** repete a consulta das três fontes. Também há atualização automática a cada 30 segundos quando a aba está visível; o temporizador é suspenso enquanto ela está oculta e a consulta ocorre imediatamente ao retornar. A interface mostra o horário da última resposta com pelo menos uma fonte válida.

### Indicadores exibidos

| Indicador            | Cálculo e fonte                                                                              | Limite da interpretação                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Online               | Contagem de usuários da lista, filtrados se necessário, cujo status realtime é `online`      | Estado calculado pela API; não é prova de conexão autenticada do Agent          |
| Ausentes             | Contagem com status realtime `ausente`                                                       | Estado ausente informado pela API; sem inferência adicional no frontend         |
| Offline (API)        | Contagem com status realtime `offline`                                                       | Pode refletir `is_idle` ou tempo sem evento; não confirma desconexão do Agent   |
| Sem dados            | Usuários cadastrados sem entrada na resposta realtime                                        | O endpoint conserva entradas por até 24 horas; ausência não significa `offline` |
| Tempo registrado     | Soma de `total_seconds` dos usuários no resumo da data selecionada                           | Tempo agregado de atividades, sem classificar produtividade por task            |
| Usuários cadastrados | Sem filtro, tamanho de `/users/`; com filtro, contagem do `username` selecionado nessa lista | Não é equipe vinculada a gestor; independe da disponibilidade do realtime       |

Se usuários ou realtime falharem, contagens de estado aparecem como indisponíveis, e não como zero. Se o resumo falhar ou vier com data diferente, o tempo registrado e as categorias ficam indisponíveis. O alerta identifica a fonte e informa o motivo da falha quando disponível, incluindo o `detail` da API. Um resumo válido com lista vazia produz zero de tempo e mensagem “Sem registros na data selecionada”.

O indicador **Usuários cadastrados** usa somente `/users/`, inclusive quando há usuário selecionado. Uma falha isolada do realtime não altera essa contagem.

### Tabelas

**Última atividade** mostra usuário, status de leitura em badge, `process_name` e segundos desde a última captura. Os dados são atuais, mesmo quando a data do resumo é antiga. **Tempo por categoria** agrega `by_category` de todos os usuários presentes no resumo filtrado e ordena pela duração. As barras são decorativas; duração e percentual aparecem em texto. Categorias não representam aplicações produtivas dentro de uma task. Ambas as áreas têm mensagens próprias de carregamento, vazio e indisponibilidade.

Um aviso informa que `/users/` é global e que Online, Ausente e Offline são estados calculados pela API a partir das capturas. Como `offline` também pode decorrer de uma captura inativa, esse estado não confirma que o Agent perdeu conexão com o servidor. Tasks ativas, tempo produtivo, horas extras e timeline não são calculados.

## Colaboradores (`#/colaboradores`)

A tabela exibe `username`, `full_name` e `department` da lista global. Quando realtime está disponível, acrescenta o estado informado pela API e o processo mais recente. `offline` é exibido como “Offline (API)” e pode refletir uma captura marcada inativa, não necessariamente falta de evento recente; usuário sem entrada realtime em até 24 horas é “Sem dados”. Se realtime falhar, os usuários ainda aparecem e as colunas de atividade indicam indisponibilidade. Se a lista de usuários falhar, não se apresenta uma lista vazia como resultado real. Há estado de carregamento, aviso de falha, botão “Tentar novamente” e mensagem para lista validamente vazia. Esta tela não mostra código de associação, gestor, permissões ou conexão confirmada do Agent.

## Tasks (`#/tasks`)

A página informa que o backend não oferece consulta, criação, edição ou persistência de tasks, seleção de colaboradores associados e aplicações do escopo. Não há formulário local, botão de salvar, mock ou dados predefinidos. O requisito [RF-06](../../requisitos/requisitos/rn_rf.md#rf-06--criar-e-editar-tasks) permanece dependente dos contratos indicados em [Pendências](PENDENCIAS.md).

## Configurações (`#/configuracoes`)

O formulário aparece após `GET /config/` válido. Permite editar somente `capture_interval_seconds` e `idle_timeout_seconds`, ambos globais e medidos em segundos. Inputs exigem inteiros positivos; a mesma regra é verificada antes do envio e na resposta do servidor. `PUT /config/` envia os dois valores juntos. O botão de salvar fica desabilitado sem mudanças; “Restaurar” repõe os valores lidos. Ao tentar mudar de rota com alterações pendentes, a interface pede confirmação. Refresh e fechamento da aba acionam o aviso padrão do navegador. Durante o salvamento os campos são bloqueados; uma resposta válida mostra “Configurações salvas” temporariamente. Falha de leitura mostra retry; falha de gravação preserva o formulário com erro. Sair da página cancela uma operação em andamento.

O Agent consulta `/config/` e atualiza periodicamente seus intervalos de captura e inatividade. O realtime ainda usa limites próprios de 5 e 15 minutos; salvar o campo global não garante que a classificação do backend passe a usar esse valor ([RF-21](../../requisitos/requisitos/rn_rf.md#rf-21--configurar-limite-de-inatividade), pendência B-04). Não há controles de jornada, dias úteis, horários ou intervalo ([RF-20](../../requisitos/requisitos/rn_rf.md#rf-20--configurar-jornada)).

## Relatórios (`#/relatorios`)

A exigência de consulta por período, colaborador e task vem de [RF-24](../../requisitos/requisitos/rn_rf.md#rf-24--gerar-relatórios); os formatos CSV e PDF vêm de [RF-25](../../requisitos/requisitos/rn_rf.md#rf-25--exportar-relatórios) e [CA-07](../../requisitos/requisitos/ca.md#ca-07--consulta-relatórios-e-exportação). O recorte diário descrito abaixo é o contrato disponível hoje.

A página oferece uma data e, quando `/users/` responde validamente, um filtro opcional de usuário. A consulta anuncia carregamento com skeleton e distingue lista vazia de erro. Falha da lista desabilita apenas esse filtro, preserva a seleção, mostra motivo e retry; a exportação com os filtros atuais continua disponível. Os botões chamam `/dashboard/export/csv` ou `/dashboard/export/pdf` com a data e, se escolhido, `username`. Durante o download há indicação de progresso, filtros ficam bloqueados e não se inicia outro envio, mesmo em ações no mesmo evento. A conclusão anuncia “Download de CSV/PDF iniciado” em toast que desaparece após cinco segundos, sem confirmar salvamento em disco. HTTP com falha, tipo de conteúdo ausente ou incompatível, ou arquivo vazio gera erro. Alterar filtros limpa feedback anterior; sair cancela a operação.

O **CSV atual** contém as colunas `username`, `category`, `total_seconds` e uma linha por categoria retornada para cada usuário. Sem registros, pode conter apenas o cabeçalho. O **PDF atual** contém a data, o total e as categorias de cada usuário retornado. A interface salva o arquivo como `resumo_<data>.csv` ou `.pdf`, incluindo o usuário no nome quando esse filtro está ativo. Esses arquivos são exportações do resumo diário parcial, não relatórios completos de [RF-24](../../requisitos/requisitos/rn_rf.md#rf-24--gerar-relatórios)/[RF-25](../../requisitos/requisitos/rn_rf.md#rf-25--exportar-relatórios): não contêm período, task, aplicação, classificação dentro/fora do escopo, jornada ou possível hora extra.

## Login e cadastro (`#/login`, `#/cadastro`)

As rotas mostram o bloqueio de autenticação e um retorno ao painel. Não há formulário de credenciais, sessão, token, usuário fictício nem proteção de rota. Enquanto o backend não oferecer autenticação e autorização, todas as consultas disponíveis usam os endpoints globais atuais. A possibilidade de navegar até essas telas não significa que cadastro ou login funcionem.

## Acessibilidade e apresentação

O layout adapta menu e colunas a mobile, tablet e desktop. Há link para pular ao conteúdo, foco visível, foco no conteúdo após navegar, labels nos controles, cabeçalhos e `caption` de tabela, mensagens de erro/status anunciáveis, navegação do diálogo móvel por teclado e redução de movimento quando solicitada pelo sistema. Painel e Colaboradores usam cards abaixo de `sm` e tabelas a partir de `sm`; as tabelas extensas permitem rolagem horizontal com foco. O Chrome validou as larguras 375, 390, 768, 1366 e 1920 px; axe-core não detectou violações WCAG nos cenários testados após ajuste de contraste, inclusive no botão de atualização desabilitado. A validação manual restante está em [Testes](TESTES.md).

As diretrizes de adaptação e navegação constam em [Responsividade](../../requisitos/responsividade.md#2-diretriz-geral) e [RNF-12 — Usabilidade](../../requisitos/requisitos/rnf.md#rnf-12--usabilidade). Breakpoints, componentes e resultados de teste acima pertencem ao frontend atual.

## Correspondência com os requisitos do produto

Cada ID aponta para o texto solicitado na pasta `requisitos/`; a segunda coluna registra o que foi observado na implementação, sem declarar o critério como atendido.

| Requisito do projeto                                                                                                                                                                                                                                                                                                   | Situação do frontend atual                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [RF-02](../../requisitos/requisitos/rn_rf.md#rf-02--criar-e-acessar-conta-do-gestor), [RF-03](../../requisitos/requisitos/rn_rf.md#rf-03--disponibilizar-código-de-associação)                                                                                                                                         | Login/cadastro e código de associação indisponíveis por falta de contratos e autorização         |
| [RF-05](../../requisitos/requisitos/rn_rf.md#rf-05--gerenciar-colaboradores-associados), [RF-16](../../requisitos/requisitos/rn_rf.md#rf-16--acompanhar-colaboradores-online)                                                                                                                                          | Há listagem global e status de leitura aproximado; equipe associada e conexão real indisponíveis |
| [RF-06](../../requisitos/requisitos/rn_rf.md#rf-06--criar-e-editar-tasks), [RF-11](../../requisitos/requisitos/rn_rf.md#rf-11--alterar-o-escopo-da-task)                                                                                                                                                               | Criação/edição de task e escopo indisponíveis                                                    |
| [RF-20](../../requisitos/requisitos/rn_rf.md#rf-20--configurar-jornada), [RF-21](../../requisitos/requisitos/rn_rf.md#rf-21--configurar-limite-de-inatividade)                                                                                                                                                         | Apenas configuração global da API; jornada e limite por colaborador indisponíveis                |
| [RF-22](../../requisitos/requisitos/rn_rf.md#rf-22--identificar-possível-hora-extra), [RF-24](../../requisitos/requisitos/rn_rf.md#rf-24--gerar-relatórios), [RF-25](../../requisitos/requisitos/rn_rf.md#rf-25--exportar-relatórios), [RF-27](../../requisitos/requisitos/rn_rf.md#rf-27--exibir-dashboard-analítico) | Resumo e exportação diária parciais; métricas, filtros e timeline completos indisponíveis        |

Os RF relacionados ao Agente Desktop e ao histórico da System Tray estão fora da responsabilidade deste frontend. Detalhes técnicos dos contratos existentes estão em [Contratos da API](CONTRATOS_API.md).
