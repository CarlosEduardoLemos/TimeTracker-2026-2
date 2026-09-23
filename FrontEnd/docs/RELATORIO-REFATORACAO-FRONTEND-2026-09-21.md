# Relatório — Refatoração completa do frontend

> Registro histórico. Validação atual: [23/09/2026](AUDITORIA-TECNICA-2026-09-23.md).

**Escopo:** exclusivamente `FrontEnd/`  
**Data:** 21/09/2026  
**Backend alterado:** não

## 1. O que foi alterado

A refatoração concentrou mudanças onde havia benefício técnico verificável: cliente HTTP/dashboard, tratamento de degradação parcial, cache de histórico, componentes do painel, acessibilidade, remoção de código morto, utilitários e testes. Não foram adicionadas funcionalidades de produto, bibliotecas ou camadas arquiteturais novas.

### Rede e confiabilidade

- `services/api.js` passou a diferenciar requisição principal de chamadas opcionais com estado de disponibilidade.
- Payloads opcionais que deveriam ser arrays (`/activities/realtime` e `/users/`) são validados antes de serem aceitos.
- Falha de um dia histórico gera `unavailable: true` em vez de um resumo vazio indistinguível de zero atividade.
- `fetchDashboardData` aceita resumos históricos previamente confirmados e reutiliza somente os dias válidos.
- O primeiro carregamento continua podendo realizar 9 chamadas; refreshes do mesmo filtro caem para 3 quando os seis dias anteriores foram carregados com sucesso.
- Histórico que falhou não entra no cache e é tentado novamente.

### Estado do Dashboard

- `useDashboardData` renomeou o estado interno `dataDate` para `filterKey`, que representa corretamente data + colaborador.
- O hook mantém um cache em memória apenas dos seis resumos históricos do filtro atual.
- Respostas obsoletas continuam bloqueadas por `AbortController` e verificação de `signal.aborted`.
- `DashboardPage` diferencia API online, offline e parcialmente disponível.
- Falha do realtime não é mais apresentada como `0` colaboradores online.

### Componentes e acessibilidade

- `MetricCard`: removida prop `positive`, que não possuía consumidores; ícone marcado como decorativo.
- `ActivityChart`: removida representação interna em décimos de hora; o gráfico trabalha diretamente em horas e diferencia ausência de dado de zero real.
- `PeopleCard`: removida sanitização duplicada de segundos, status `ausente` alinhado ao backend, uso de status bruto para cor, `caption` na tabela e `scope="col"` nos cabeçalhos.
- `Header`: adicionado estado visual/semântico `degraded`; offline passa a ter tom de erro distinto.
- `constants/ui.js`: removidos comentários excessivos e corrigido o mapeamento `idle` → `ausente` conforme o contrato atual.

### Código morto removido

- `src/components/AppsCard.jsx`
- `src/components/CategoryChart.jsx`
- `src/hooks/useActiveSection.js`
- `src/hooks/useDashboard.js`
- `src/utils/report.js`
- `src/utils/report.test.js`
- exportações correspondentes em `components/index.js` e `hooks/index.js`
- `getReportUrl` em `services/api.js`, sem consumidor enquanto a exportação oficial permanece bloqueada
- `getLocalIsoDate` em `utils/dashboard.js`, sem consumidor
- classes CSS antigas sem referências no frontend ativo (`notification-dot`, `legend-dot`, `pill*`, `online-badge`) e media query redundante de layout mobile

## 2. Problemas que existiam

- falhas opcionais eram reduzidas silenciosamente a arrays vazios;
- o cabeçalho podia declarar `API online` com realtime ou usuários indisponíveis;
- falha de realtime podia resultar visualmente em `0` usuários online;
- falha histórica era indistinguível de um dia real com zero registros;
- seis resumos históricos eram reconsultados a cada ciclo de 30 segundos;
- status `ausente` do backend não existia no mapa de status do frontend;
- havia código de compatibilidade sem uso mantido no build/source tree;
- existiam pequenas duplicidades de sanitização e props/estilos sem consumidores;
- tabela de equipe podia ter semântica mais explícita para leitores de tela.

## 3. Por que as alterações foram necessárias

As mudanças evitam informação enganosa, reduzem carga de rede, tornam estados de falha observáveis e diminuem superfície de manutenção. A remoção de arquivos mortos reduz pontos de entrada e testes que protegiam código sem uso. Nenhuma mudança depende de requisito novo.

## 4. Como o código foi simplificado

- cache limitado ao dado estável já existente, sem biblioteca de estado/cache;
- serviço HTTP continua em um único arquivo porque o número de contratos ativos ainda é pequeno;
- lógica de disponibilidade usa três flags simples (`realtime`, `users`, `history`);
- horas do gráfico não usam mais escala intermediária em décimos;
- `PeopleCard` reutiliza a sanitização já existente em `formatRelativeActivityTime`;
- barrels deixaram de exportar módulos obsoletos;
- nenhum componente base genérico ou abstração sem consumidor foi criado.

## 5. Duplicidades eliminadas

- sanitização de `seconds_since_last_activity` em `PeopleCard` duplicava a proteção de `formatRelativeActivityTime`;
- representação de tempo em décimos de hora no gráfico exigia multiplicação/divisão desnecessárias;
- módulos antigos de relatório local duplicavam uma responsabilidade que hoje deve ser atendida pelo contrato oficial de relatório;
- hooks/componentes de compatibilidade permaneciam ao lado do fluxo atual sem consumidor.

## 6. Arquivos/componentes refatorados

Principais arquivos de runtime: `services/api.js`, `hooks/useDashboardData.js`, `pages/DashboardPage.jsx`, `components/Header.jsx`, `components/ActivityChart.jsx`, `components/PeopleCard.jsx`, `components/MetricCard.jsx`, `constants/ui.js`, `utils/dashboard.js`, `components/index.js`, `hooks/index.js` e `index.css`.

Documentação técnica atualizada: `docs/ARQUITETURA.md`, `docs/COMPONENTES.md`, `docs/HOOKS.md`, `docs/REFACTORING.md` e `docs/TESTES.md`.

## 7. Testes adicionados/ajustados

- `api.test.js`: degradação parcial, payload opcional inválido, dia histórico indisponível e redução de 9 para 3 chamadas com histórico reutilizado.
- `useDashboardData.test.js`: verifica passagem do cache histórico no refresh, além dos casos já existentes.
- `ActivityChart.test.jsx`: distingue indisponibilidade de zero real.
- `Header.test.jsx`: cobre estado `degraded`.
- `PeopleCard.test.jsx`: cobre status `ausente` e semântica da tabela.
- `MetricCard.test.jsx`: cobre ícone decorativo.
- `DashboardPage.test.jsx`: garante que falha de realtime não seja exibida como zero usuários online.
- `report.test.js` removido junto com o módulo morto.

## 8. Problemas encontrados no backend e não alterados

- autenticação/sessão ainda não possui contrato consumível pelo frontend;
- associação por código e CRUD de tasks ainda não possuem os contratos necessários;
- `/config/` atual é global (`capture_interval_seconds` e `idle_timeout_seconds`), enquanto a tela prevista trabalha com jornada/inatividade por colaborador;
- `/activities/realtime` retorna apenas colaboradores presentes na janela recente, portanto não permite calcular corretamente o total de offline;
- `/dashboard/export/csv` e `/dashboard/export/pdf` são exportações diárias legadas e não atendem o relatório completo previsto por RF-24/RF-25;
- CORS do backend está configurado com origem `*` e credenciais habilitadas; deve ser restringido no ambiente de produção.

Nenhum desses pontos recebeu alteração, por serem exclusivamente backend/infraestrutura ou exigirem definição de contrato.

## 9. O que permaneceu sem alteração e por quê

- `Sidebar`, `useAutoRefresh`, `useTheme` e `useHashRoute`: responsabilidades já estavam coesas; reescrever não traria ganho proporcional.
- `AuthPage`, `CollaboratorsPage`, `TasksPage`, `ReportsPage` e `SettingsPage`: interfaces já representam corretamente integrações pendentes sem inventar persistência.
- hash routing: suficiente para o sitemap atual; React Router adicionaria dependência/complexidade sem necessidade imediata.
- `legacy/blazor`: fora do build atual, porém possui valor histórico; remoção não melhora o runtime React.
- dependências/package.json: nenhuma dependência nova foi necessária.
- backend: zero arquivos modificados.

## Validação possível neste ambiente

O ambiente não possui acesso de rede ao npm/GitHub para instalar `node_modules`; portanto Vitest/Vite não puderam ser executados aqui. Os arquivos JavaScript/JSX alterados foram validados sintaticamente com o parser TypeScript disponível no ambiente. No checkout completo, a validação final deve ser:

```powershell
cd FrontEnd
npm ci
npm test
npm run build
```
