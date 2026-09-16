# Funcionalidades do frontend

## Perfis

O frontend React documentado nesta pasta corresponde ao **Dashboard PWA do Gestor**. O colaborador utiliza o Agente Desktop e não deve receber fluxo manual de login neste frontend.

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
