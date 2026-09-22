# Hooks customizados — TimeTrack Frontend

## `useDashboardData`

**Arquivo:** `src/hooks/useDashboardData.js`

Responsável pelo ciclo de consulta e pelo estado dos dados do painel. Recebe data, colaborador e opção de auto-refresh; retorna dados, estados de loading/refresh/error, data da última atualização e função `refresh`.

Comportamentos relevantes:

- cancela requisições anteriores com `AbortController`;
- mantém o último resultado durante refresh do mesmo filtro;
- não transforma falha de API em dados fictícios;
- reutiliza os seis resumos históricos já carregados com sucesso enquanto data/colaborador não mudam;
- não reutiliza dias históricos que falharam: eles são tentados novamente no refresh seguinte;
- mantém resumo atual, realtime e lista de usuários sendo consultados a cada atualização;
- delega o agendamento periódico ao `useAutoRefresh`.

A reutilização do histórico reduz o polling normal do mesmo filtro de 9 para 3 requisições quando os seis dias anteriores já foram carregados com sucesso.

## `useAutoRefresh`

**Arquivo:** `src/hooks/useAutoRefresh.js`

Responsável exclusivamente pelo agendamento periódico. Enquanto habilitado e a aba está visível, dispara `onRefresh` a cada 30 segundos por padrão. Ao ocultar a aba, interrompe o timer; ao retornar, solicita uma atualização imediata e reinicia o intervalo.

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

`useActiveSection` e o barrel legado `useDashboard.js` foram removidos porque não possuíam consumidores no frontend ativo após a migração para navegação por hash.
