# Hooks customizados — TimeTrack Frontend

## `useDashboardData`

**Arquivo:** `src/hooks/useDashboardData.js`

Responsável pelo ciclo de consulta e pelo estado dos dados do painel. Recebe data, colaborador e opção de auto-refresh; retorna dados, estados de loading/refresh/error, data da última atualização e função `refresh`.

Comportamentos relevantes:

- cancela requisições anteriores com `AbortController`;
- mantém o último resultado durante refresh do mesmo filtro;
- não transforma falha de API em dados fictícios;
- delega o agendamento periódico ao `useAutoRefresh`, evitando misturar timer/Visibility API com estado de rede.

## `useAutoRefresh`

**Arquivo:** `src/hooks/useAutoRefresh.js`

Responsável exclusivamente pelo agendamento periódico. Enquanto habilitado e a aba está visível, dispara `onRefresh` a cada 30 segundos por padrão. Ao ocultar a aba, interrompe o timer; ao retornar, solicita uma atualização imediata e reinicia o intervalo.

Esse hook não conhece a API nem o formato do Dashboard. Ele apenas coordena tempo e visibilidade do documento.

Possui testes em `useAutoRefresh.test.js` para intervalo, modo desabilitado e retorno à aba visível.

## `useTheme`

**Arquivo:** `src/hooks/useTheme.js`

Gerencia tema claro/escuro, persiste `timetracker-theme` em `localStorage` e sincroniza `data-theme` no elemento raiz.

## `useHashRoute`

**Arquivo:** `src/hooks/useHashRoute.js`

Roteamento leve utilizado pela aplicação atual. Observa `window.location.hash`, aceita apenas rotas conhecidas e usa `painel` como fallback.

Rotas reconhecidas:

```text
painel
colaboradores
tasks
relatorios
configuracoes
login
cadastro
```

Possui teste dedicado em `useHashRoute.test.js`.

## `useActiveSection`

**Arquivo:** `src/hooks/useActiveSection.js`

Permanece no código por compatibilidade/histórico, mas **não é o mecanismo principal de navegação da aplicação atual**. A Sidebar atual usa rotas por hash. Não deve ser apresentado em nova documentação como responsável pelo menu principal.

## `useDashboard.js`

Arquivo de compatibilidade para consumidores antigos. Novas implementações devem preferir os hooks modulares diretamente.
