# Organização atual e histórico de refatoração

## Decisões em vigor

- React/Vite é o frontend ativo; Blazor permanece apenas como referência em `legacy/`.
- A aplicação possui páginas em `src/pages/` e navegação por hash via `useHashRoute`.
- `App.jsx` funciona como bootstrap/layout; o domínio do painel foi extraído para `DashboardPage.jsx`.
- O cliente HTTP continua centralizado em `src/services/api.js`.
- Componentes compartilhados incluem `PageHeader`, `EmptyState` e `IntegrationNotice`.
- O frontend não gera mocks operacionais em falha de API.
- Rankings e métricas de produtividade foram removidos do fluxo principal por não fazerem parte dos requisitos.
- Funcionalidades dependentes de persistência permanecem bloqueadas até contrato oficial.

## Melhorias realizadas

- [x] Remoção de produtividade/ranking do dashboard.
- [x] Remoção do fallback automático para dados fictícios.
- [x] Estrutura dos seis indicadores previstos no RF-27.
- [x] Navegação Painel/Colaboradores/Tasks/Relatórios/Configurações.
- [x] Telas de Login/Cadastro do gestor.
- [x] Estrutura de Colaboradores e associação.
- [x] Formulário e validação de Tasks.
- [x] Estrutura de Jornada/Inatividade.
- [x] Estrutura de Relatórios e filtros.
- [x] Melhoria do drawer mobile com Escape/retorno de foco.
- [x] Testes para novos fluxos frontend.
- [x] Auditoria e atualização da documentação técnica após as entregas.

## Pendências priorizadas

1. Integrar autenticação e sessão quando houver contrato oficial.
2. Integrar colaboradores/código de associação após definição das regras pendentes.
3. Integrar CRUD de tasks, jornada/inatividade e filtros completos do RF-27.
4. Integrar relatório/exportação completos.
5. Realizar validação final com leitor de tela e auditoria de contraste.
6. Adicionar E2E quando os fluxos backend estiverem operacionais.

Refatorações futuras não devem introduzir requisitos novos nem alterar contratos externos sem alinhamento com a equipe responsável.
