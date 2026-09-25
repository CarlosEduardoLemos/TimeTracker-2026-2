# Testes e validação do frontend

Este guia distingue verificação automatizada, build e verificações manuais ainda pendentes. O resultado mais recente registrado nesta revisão está em [Auditoria](AUDITORIA.md).

## Preparação e comandos

Execute na pasta `FrontEnd` com as dependências do `package-lock.json` instaladas:

```powershell
cd FrontEnd
npm ci
npm.cmd test
npm.cmd run build
```

Para desenvolvimento, `npm.cmd run test:watch` mantém Vitest em observação. `npm.cmd run test:coverage` gera cobertura V8 em texto e HTML; o script existe, mas uma meta numérica de cobertura não foi definida. `git diff --check` verifica whitespace no diff e `git status --short` permite confirmar que só `FrontEnd/` foi alterado. `npm.cmd run dev` inicia Vite na porta 5173; `npm.cmd run preview` serve o build para inspeção.

`vitest.config.js` usa `jsdom`, plugin React e `src/test/setup.js` com `@testing-library/jest-dom`. O script inclui `--configLoader runner`, necessário para a execução usada no ambiente Windows desta revisão. A cobertura configura `src/**/*.{js,jsx}` e exclui `src/test/**`.

## Resultado automatizado registrado

| Verificação | Resultado | O que comprova |
| --- | --- | --- |
| `npm.cmd test` | **86 testes passaram em 21 arquivos** em 25/09/2026 | Comportamentos cobertos pelos mocks e por jsdom |
| `npm.cmd run build` | **Concluído** pelo Vite 6.4.3 | Imports, JSX, CSS e geração dos chunks das páginas |
| `git diff --check` | **Sem erros** | Ausência de erros de whitespace no diff |
| `git status --short` | **Somente `FrontEnd/`** | Escopo das alterações registradas no Git |

Build bem sucedido não comprova disponibilidade da API, layout em navegador ou ausência de erro no console durante uso real.

## Inventário dos testes existentes

| Arquivo(s) | Comportamento protegido |
| --- | --- |
| `src/App.test.jsx` | Entrada direta em rotas com tema salvo, fallback de carregamento, link de salto, 404 e título |
| `src/services/api.test.js` | Codificação do usuário, erro HTTP, cancelamento externo, timeout na leitura, formatos de exportação, data inválida e HTML recebido como CSV |
| `src/hooks/useDashboardData.test.js` | Três fontes, horário de atualização, dados mantidos no refresh, falha parcial e data divergente |
| `src/hooks/useHashRoute.test.js` | Hash desconhecido e reação a `hashchange` |
| `src/hooks/useTheme.test.js` | Preferência do sistema, preferência salva, alternância, classe/documento e `localStorage` |
| `src/hooks/useAutoRefresh.test.js` | Intervalo, desativação e atualização ao retornar à aba; protege um hook preservado, sem consumidor no fluxo ativo |
| `src/pages/DashboardPage.test.jsx` | Loading, indicadores baseados na API, falha de realtime, filtro de usuário e contagem de cadastrados independente do realtime |
| `src/pages/frontendRevision.test.jsx` | Falha parcial, resposta antiga, resumo malformado, configuração indisponível/inválida, cancelamento de gravação e exportação, erro HTTP no download |
| `src/pages/ReportsPage.test.jsx` | Disponibilidade dos formatos existentes e explicação do escopo parcial |
| `src/pages/AuthPage.test.jsx`, `src/pages/TasksPage.test.jsx` | Páginas bloqueadas explicam a dependência sem coletar credenciais nem task local |
| `src/components/Sidebar.test.jsx` | Navegação, rota ativa, diálogo móvel, Tab, Escape, foco, histórico, rolagem e mudança para desktop |
| `src/components/ErrorBoundary.test.jsx` | Mensagem segura após exceção e ausência de log de payload em produção |
| `src/components/MetricCard.test.jsx`, `Card.test.jsx`, `SectionHeading.test.jsx` | Semântica e apresentação básica de componentes |
| `src/components/ActivityChart.test.jsx`, `PeopleCard.test.jsx`, `Header.test.jsx`, `ReportsAndAgent.test.jsx` | Componentes preservados fora do painel atual; estados, acessibilidade e controles desses componentes isolados |
| `src/utils/dashboard.test.js` | Formatação de tempo/data, soma, filtros e contagens sem alterar a lista original |

Os testes de componentes preservados não significam que gráfico semanal, timeline ou exportação completa estejam ativos na aplicação. Não há teste direto de `CollaboratorsPage`; `SettingsPage` é exercitada por `frontendRevision.test.jsx`, mas ainda não cobre todas as mudanças de campo e retorno de leitura. Veja [Pendências](PENDENCIAS.md).

## Cenários críticos a manter em futuras mudanças

- Diferenciar **lista vazia válida** de falha/JSON inválido em cada fonte.
- Impedir que resposta de consulta anterior ou de outra data substitua o filtro atual.
- Impedir que uma falha de realtime apareça como zero de usuários online.
- Cancelar solicitações quando filtros mudam ou a página sai de cena; encerrar timeout e listeners.
- Validar inteiros positivos antes de gravar configurações e não anunciar sucesso quando a resposta for inválida.
- Não baixar HTML, arquivo vazio ou resposta HTTP de erro como CSV/PDF.
- Garantir navegação por teclado, foco restaurado no menu móvel, rota 404 e tema na entrada direta.
- Continuar sem testes que pressupõem login ou tasks funcionais antes de existir contrato real.

## Validação manual pendente

Os itens abaixo **não foram comprovados** pelos testes automatizados. Executar em navegador com backend disponível e também com API indisponível:

| Área | Verificação manual |
| --- | --- |
| Navegação | Acesso direto por hash, voltar/avançar, 404, título da aba, carregamento de chunks e link de salto |
| Teclado/leitor de tela | Ordem de Tab, foco visível, Escape no menu, anúncio de erros/loading, leitura dos cabeçalhos e `caption` de tabelas |
| Responsividade | Larguras mobile/tablet/desktop, telas baixas, rolagem horizontal de tabelas, zoom de 200% e tema claro/escuro |
| Dados | Resumo com e sem registros, filtro de usuário, falha isolada de uma fonte, retry de Colaboradores, refresh do painel e mudança de data |
| Configurações | Leitura, valores inválidos, salvamento, erro 4xx/5xx, queda de rede e saída durante operação |
| Exportação | CSV/PDF reais, nome e conteúdo do arquivo, falha/timeout, ausência de usuários e cancelamento ao sair |
| Console e rede | Exceções de renderização, rejeições não tratadas, requests inesperados e mensagens de CORS |

Os testes usam mocks de `fetch` e jsdom; não avaliam banco de dados, autorização do backend, CORS de implantação, contraste medido, downloads reais ou leitor de tela. E2E, lint e typecheck não estão configurados no `package.json` atual.
