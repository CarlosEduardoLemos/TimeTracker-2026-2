# Funcionalidades do frontend

[Voltar ao README](../README.md). Consulte a [matriz de requisitos](#requisitos)
para relacionar telas, critérios de aceitação e dependências externas.

## Perfis

O frontend React documentado nesta pasta corresponde ao **Dashboard do Gestor**.
PWA é uma intenção dos requisitos; não há manifest ou service worker implementado.
O colaborador utiliza o Agente Desktop e não deve receber fluxo manual de login neste frontend.

## Navegação

| Rota | Tela | Estado |
| --- | --- | --- |
| `#/painel` | Dashboard | Parcialmente integrado |
| `#/colaboradores` | Colaboradores | Estrutura pronta; API pendente |
| `#/tasks` | Tasks | Formulário/validação prontos; API pendente |
| `#/relatorios` | Relatórios | Estrutura/filtros prontos; API pendente |
| `#/configuracoes` | Jornada e inatividade | Estrutura pronta; API pendente |
| `#/login` | Login do gestor | Validação local; API pendente |
| `#/cadastro` | Cadastro do gestor | Validação local; API pendente |

## Painel

O painel exibe somente dados que podem ser obtidos ou derivados com segurança dos contratos atuais. Não há ranking nem métrica de produtividade.

Estados previstos:

- carregamento inicial;
- atualização em segundo plano;
- erro com ação de retry;
- ausência de dados;
- indicadores indisponíveis quando o backend ainda não fornece os campos necessários.

O filtro atual por data de referência e colaborador continua operacional para os endpoints existentes. Os filtros completos por período e task exigidos pelo RF-27 permanecem dependentes de API.

## Login e cadastro

`AuthPage` oferece campos semânticos de e-mail e senha, autocomplete apropriado e validação local. O envio permanece desabilitado porque não existe contrato oficial de autenticação/sessão.

## Colaboradores

A tela possui estrutura de listagem e ação de geração de código de associação. A geração permanece bloqueada até que regras de validade, expiração, reutilização/regeneração e contrato de API sejam definidos.

## Tasks

O formulário contempla descrição, aplicações/serviços monitorados e área de colaboradores associados. Validações locais evitam descrição inválida. Persistência e seleção real de colaboradores dependem da API.

## Configurações

A tela representa jornada semanal, horários/intervalo e limite de inatividade. Os controles são apresentados de forma acessível, mas permanecem sem persistência enquanto não existir contrato por colaborador.

## Relatórios

A tela prevê filtros de período, colaborador e task e as opções CSV/PDF. As exportações permanecem desabilitadas até que a API consiga aplicar os filtros e fornecer todos os dados previstos em RF-24/RF-25.

## O que deliberadamente não é simulado

- usuário gestor autenticado;
- tokens/sessões;
- código de associação;
- colaboradores associados;
- tasks persistidas;
- jornada salva;
- timeline operacional fictícia;
- rankings/produtividade;
- possíveis horas extras calculadas sem jornada;
- CSV/PDF parcial apresentado como relatório oficial.

<a id="requisitos"></a>

## Rastreabilidade dos requisitos

A matriz reúne as entregas 1 e 2 e a auditoria documental, originalmente
validadas sobre `main` com os commits de alinhamento e estruturação das telas.
O escopo dessas entregas foi exclusivamente `FrontEnd/`.

| Prioridade | Área | Requisitos | Estado frontend | Dependência externa |
| --- | --- | --- | --- | --- |
| 🔴 | Login/Cadastro gestor | RF-02, CA-01 | UI + validação local | autenticação/sessão/401/403 |
| 🔴 | Associação | RF-03, RF-05 | UI/empty state | regras do código + API |
| 🔴 | Tasks | RF-06, RF-11 | formulário + validação | persistência e colaboradores |
| 🔴 | Jornada/Inatividade | RF-20, RF-21 | UI estruturada | leitura/gravação por colaborador |
| 🔴 | Dashboard | RF-16, RF-27, CA-10 | parcial, sem produtividade/mocks | dados agregados e filtros completos |
| 🔴 | Relatórios | RF-24, RF-25 | UI/filtros estruturados | consulta/exportação completa |
| 🟠 | Segurança | RNF-03/04/05/06 | sem credenciais fictícias; minimização visual | autorização e HTTPS em backend/deploy |
| 🟠 | Usabilidade | RNF-12 | estados claros, foco, drawer e responsividade | validação final manual/a11y |

Os contratos necessários, responsáveis externos e impactos dos bloqueios estão
em [Integração](INTEGRACAO.md#dados-que-o-frontend-ainda-precisa).
O frontend não pode validar credenciais, autorização ou sessão no lugar do servidor;
por isso envio de autenticação e proteção real de rotas continuam pendentes.

## Histórico de adequação aos requisitos

- removidas métricas/rankings de produtividade e fallback automático para mocks;
- indicadores do RF-27 representados sem inventar valores;
- navegação por hash para Painel, Colaboradores, Tasks, Relatórios e Configurações;
- telas de Login/Cadastro, Colaboradores, Tasks, Configurações e Relatórios;
- componentes reutilizáveis `PageHeader`, `EmptyState` e `IntegrationNotice`;
- drawer mobile com Escape e retorno de foco;
- formulários e validações locais onde o comportamento é exclusivamente frontend;
- testes para rotas, autenticação, tasks, relatórios e componentes afetados.

A inspeção cruzou requisitos, `FrontEnd/src` e Markdown. Corrigiu descrições de
SPA de página única, produtividade/ranking, demonstração e mocks automáticos;
documentou `pages/`, `useHashRoute`, props atuais, `form-field`, drawer e testes.
O guia de backend já delimitava corretamente responsabilidade e legado.
Os índices e as decisões foram alinhados às entregas. O checklist documental
foi concluído; integrações ficaram pendentes, assim como testes/build no ambiente
daquela entrega. Resultados executáveis posteriores estão em [Auditoria](AUDITORIA.md).

A entrega 3 separou agendamento/Visibility API de consulta, simplificou o serviço,
extraiu transformações puras e preparação de dados dos componentes, removeu props
sem uso e adicionou testes. A [matriz de refatoração](REFATORACAO.md#clean-code)
preserva arquivo, problema, solução, motivo, impacto e validação.
Nenhuma dessas entregas alterou backend, banco, Docker, infraestrutura ou CI/CD.
