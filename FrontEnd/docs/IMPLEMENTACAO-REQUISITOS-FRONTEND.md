# Implementação frontend alinhada aos requisitos — entrega 2

Base analisada: branch `main` após o commit `2d16c84a51118c956b465cdb4b2008f0c5e9d391`.

Escopo desta entrega: exclusivamente `FrontEnd/`. Nenhum arquivo de backend, banco, API, Docker, infraestrutura ou CI/CD foi alterado.

## Matriz rastreável de alterações

| Prioridade | Arquivo | O que foi alterado | Requisito relacionado | Por que | Como | Impacto | Validação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 🔴 | `FrontEnd/src/App.jsx` | A aplicação passou a selecionar telas por rota de hash e a usar layout com Sidebar | Sitemap §§2–7; RNF-12 | A navegação anterior era baseada em âncoras de uma única tela e não representava Painel/Colaboradores/Tasks/Relatórios/Configurações | Criação do mapa de rotas e composição de páginas; login/cadastro ficam fora do shell | Usuário passa a navegar entre áreas coerentes com o sitemap sem dependência nova | Revisão estática; rota desconhecida possui fallback para Painel |
| 🔴 | `FrontEnd/src/hooks/useHashRoute.js` | Criado roteamento leve por hash | Sitemap §§2–7 | Era necessário suportar telas distintas sem introduzir biblioteca não existente | Leitura segura de `window.location.hash`, whitelist de rotas e listener `hashchange` | URLs como `#/tasks` e `#/relatorios`; nenhuma alteração de servidor necessária | `node --check`; teste unitário criado |
| 🔴 | `FrontEnd/src/components/Sidebar.jsx` | Navegação alinhada ao sitemap; Configurações habilitada; usuário fictício removido; drawer mobile acessível | Sitemap §§2–7; RF-02; RNF-12 | Itens antigos não correspondiam às áreas oficiais e exibiam gestor fictício | Links para rotas oficiais; Login/Criar conta; `Esc` fecha drawer e foco retorna ao botão de abertura | Navegação consistente e sem identidade falsa; melhoria de teclado/mobile | Teste atualizado para links, remoção do usuário fictício e tecla Escape |
| 🔴 | `FrontEnd/src/data/dashboardData.js` | Itens do menu alterados para Painel, Colaboradores, Tasks, Relatórios e Configurações | Sitemap §2 | Menu antigo possuía áreas não definidas no sitemap | Substituição apenas da configuração de navegação | Sidebar passa a refletir a arquitetura definida | Revisão estática |
| 🔴 | `FrontEnd/src/pages/AuthPage.jsx` | Criadas telas de Login e Criar conta do gestor com validação local | RN-01/RF-02; CA-01; RNF-04 | O Dashboard deve possuir cadastro por e-mail e login, mas não há contrato oficial de autenticação | Formulário com e-mail/senha, `autocomplete`, validação de e-mail e mínimo local de senha; submit desabilitado até API | Fluxo visual fica preparado sem armazenar credenciais nem inventar endpoint | Testes de validação e submit bloqueado |
| 🔴 | `FrontEnd/src/pages/CollaboratorsPage.jsx` | Criada área de colaboradores e ação visual de código de associação | RN-02/RF-03/RF-05; CA-01 | Área obrigatória não existia | Página com heading, ação desabilitada e estado vazio documentando integração | Usuário entende a finalidade e a dependência; nenhum código de associação falso é gerado | Revisão estática e sem persistência local |
| 🔴 | `FrontEnd/src/pages/TasksPage.jsx` | Criada interface de criação de task com validação de descrição e serviços | RN-03/RF-06; RF-11; CA-02 | CRUD de tasks não existia | Formulário local; descrição com mínimo e limite; área de colaboradores explicitamente indisponível; salvar bloqueado | Estrutura e UX prontas para integração, sem simular persistência | Testes para validação, limpar campos e salvar bloqueado |
| 🔴 | `FrontEnd/src/pages/SettingsPage.jsx` | Criada tela de jornada semanal e limite de inatividade | RN-13/RF-20/RF-21; CA-06 | Configurações exigidas não possuíam interface | Campos semânticos de dias/horários e limite; todos desabilitados até API por colaborador | Estrutura responsiva e acessível pronta para contrato oficial | Revisão de labels/fieldset e estados disabled |
| 🔴 | `FrontEnd/src/pages/ReportsPage.jsx` | Criada área de relatórios com filtros exigidos e exportação bloqueada | RN-16/RF-24/RF-25; CA-07 | Relatórios precisam de período, colaborador e task; API atual não fornece contrato completo | Campos de data inicial/final, colaborador, task e botões CSV/PDF desabilitados | Evita exportação enganosa e deixa formato da tela pronto | Teste garante CSV/PDF desabilitados |
| 🟠 | `FrontEnd/src/pages/DashboardPage.jsx` | Dashboard existente extraído do bootstrap da aplicação | RF-27; RNF-12 | `App.jsx` acumulava bootstrap, navegação e domínio do painel | Conteúdo existente movido sem alterar os contratos atuais | Menor acoplamento; Painel continua usando hooks/serviços existentes | Revisão de equivalência com `App.jsx` anterior |
| 🟠 | `FrontEnd/src/components/IntegrationNotice.jsx` | Criado aviso reutilizável de dependência | RNF-12 | Várias áreas dependem de backend e precisavam comunicar isso de forma consistente | Componente com `role=status` e estilo único | Feedback claro sem simulação de funcionalidade | Revisão semântica |
| 🟠 | `FrontEnd/src/components/PageHeader.jsx` | Criado cabeçalho reutilizável de páginas | RNF-12 | Novas áreas precisavam de hierarquia e consistência | Componente de título, descrição e ações | Consistência visual e manutenção | Revisão estática |
| 🟠 | `FrontEnd/src/components/EmptyState.jsx` | Criado estado vazio reutilizável | RNF-12 | Colaboradores/tasks não devem parecer quebrados quando não há integração/dados | Componente semântico com título, descrição e ação opcional | Estados vazios ficam explícitos e consistentes | Revisão estática |
| 🟠 | `FrontEnd/src/index.css` | Adicionado estilo `form-field` e suporte de fonte para `textarea` | RNF-12; responsividade | Novos formulários precisavam de controles consistentes, foco visível e disabled claro | Classe Tailwind reutilizável com light/dark/focus/disabled | UX e acessibilidade de formulários mais uniformes | Revisão de focus/disabled e preservação das regras existentes |
| 🟠 | `FrontEnd/src/components/index.js` | Novos componentes compartilhados exportados | Manutenção frontend | Barrel precisava conhecer componentes reutilizáveis | Inclusão de `EmptyState`, `IntegrationNotice`, `PageHeader` mantendo exports antigos | Imports consistentes | Revisão estática |
| 🟠 | `FrontEnd/src/components/Sidebar.test.jsx` | Testes alinhados à nova navegação | Sitemap; RNF-12 | Teste antigo validava itens removidos e usuário fictício | Casos para rota ativa, itens oficiais, ausência de usuário fictício e fechamento via Escape | Protege navegação e acessibilidade contra regressão | Teste escrito; execução completa pendente de dependências |
| 🟠 | `FrontEnd/src/hooks/useHashRoute.test.js` | Criados testes de fallback e mudança de rota | Sitemap | O roteamento novo precisa de cobertura | `renderHook`, `hashchange` e rota inválida | Protege navegação básica | Teste escrito; execução completa pendente de dependências |
| 🟠 | `FrontEnd/src/pages/AuthPage.test.jsx` | Criados testes de bloqueio e validação de e-mail | RF-02 | Não deve parecer autenticação funcional enquanto API não existe | Verifica botão disabled e erro de e-mail | Evita regressão para submit improvisado | Teste escrito |
| 🟠 | `FrontEnd/src/pages/TasksPage.test.jsx` | Criados testes de validação e limpeza | RF-06 | Formulário possui comportamento frontend real que deve ser protegido | Verifica descrição curta, salvar disabled e limpar | Evita regressão de validação | Teste escrito |
| 🟠 | `FrontEnd/src/pages/ReportsPage.test.jsx` | Criado teste dos exports bloqueados | RF-25 | Exportação não pode ser habilitada com contrato incompleto | Verifica CSV/PDF disabled | Evita arquivo inconsistente | Teste escrito |

## Alterações detalhadas

### Navegação e estrutura
A aplicação agora representa diretamente as áreas do Dashboard PWA definidas no sitemap. Foi adotado roteamento por hash para não adicionar `react-router-dom` nem exigir configuração de fallback no servidor. Rotas reconhecidas: `#/painel`, `#/colaboradores`, `#/tasks`, `#/relatorios`, `#/configuracoes`, `#/login` e `#/cadastro`.

### Autenticação
O frontend implementa somente a camada visual e validação local segura. Não persiste senha, não armazena token e não chama endpoint inventado. Para concluir RF-02, o backend deve fornecer contrato oficial de cadastro, login, sessão atual, logout e semântica de 401/403.

### Associação e colaboradores
O botão de geração de código permanece desabilitado porque validade, expiração, reutilização e regeneração do código ainda constam como pontos pendentes nos requisitos. O backend também deve garantir que a listagem retorne somente colaboradores associados ao gestor autenticado.

### Tasks
O formulário implementa o que é responsabilidade exclusiva do frontend: campos, semântica, acessibilidade, validação simples e feedback. Seleção de colaboradores e persistência não são simuladas. O backend precisa disponibilizar IDs estáveis dos colaboradores associados, estrutura de aplicações/serviços e operações de leitura/criação/edição de task.

### Jornada e inatividade
A estrutura semanal foi criada com campos explícitos de entrada, saída e intervalo. A carga horária pode ser calculada/apresentada no frontend quando o contrato final definir se o backend a recebe calculada ou derivada. O limite de inatividade precisa ser persistido por colaborador.

### Relatórios
A tela possui os filtros exigidos, mas não habilita exportação parcial. A API precisa aceitar período, colaborador e task e aplicar autorização no backend. CSV/PDF não devem ser montados a partir de dados incompletos do realtime atual.

## Problemas fora do frontend

> **Problema encontrado:** autenticação do gestor ausente no contrato atual.  
> **Local:** integração de `AuthPage`.  
> **Por que não pertence ao frontend:** validação de credenciais, sessão e autorização precisam ocorrer no servidor.  
> **Impacto no frontend:** Login/Cadastro e rotas protegidas não podem ser concluídos.  
> **O que o backend precisa fazer:** publicar contrato oficial de cadastro/login/logout/me, mecanismo de sessão/token e respostas 401/403.

> **Problema encontrado:** associação por código sem API e com regras ainda pendentes.  
> **Local:** `CollaboratorsPage`.  
> **Por que não pertence ao frontend:** emissão/validade/consumo do código exigem estado e segurança no servidor.  
> **Impacto no frontend:** botão permanece desabilitado.  
> **O que o backend/outro responsável precisa fazer:** definir validade, uso único/reuso, regeneração e multi-gestor; depois expor contrato de geração.

> **Problema encontrado:** ausência do domínio Task no contrato atual.  
> **Local:** `TasksPage`, Dashboard e Timeline.  
> **Por que não pertence ao frontend:** persistência e autorização são servidor.  
> **Impacto no frontend:** criação/edição, filtro por task e tempo por task ficam bloqueados.  
> **O que o backend precisa fazer:** disponibilizar listagem/criação/edição de tasks com descrição, colaboradores e serviços monitorados.

> **Problema encontrado:** jornada/inatividade não possuem contrato por colaborador.  
> **Local:** `SettingsPage`.  
> **Impacto no frontend:** formulário não pode salvar e possível hora extra não pode ser calculada com segurança.  
> **O que o backend precisa fazer:** leitura/gravação de jornada e limite de inatividade por colaborador, além da indicação de possíveis horas extras.

> **Problema encontrado:** relatório completo e filtros RF-27 não existem na API atual.  
> **Local:** `ReportsPage` e Dashboard.  
> **Impacto no frontend:** período/task, timeline completa, ativo/inativo e CSV/PDF permanecem indisponíveis.  
> **O que o backend precisa fazer:** endpoint(s) autorizados com filtros por período/colaborador/task e estruturas descritas em RF-24/RF-27.

## Validação

Executado neste ambiente:
- `node --check FrontEnd/src/hooks/useHashRoute.js` — OK.
- `node --check FrontEnd/src/data/dashboardData.js` — OK.
- inspeção de escopo: todos os arquivos da entrega estão dentro de `FrontEnd/`.
- revisão estática das rotas, labels, `aria-*`, estados disabled e mensagens de dependência.

Não foi possível validar `npm test`/`npm run build` neste ambiente porque esta entrega é um overlay dos arquivos alterados e não contém `node_modules`. No repositório local completo, executar:

```bash
cd FrontEnd
npm ci
npm test
npm run build
```

## Checklist final desta entrega

- [x] Navegação Painel / Colaboradores / Tasks / Relatórios / Configurações
- [x] Login e Cadastro do gestor estruturados sem endpoint inventado
- [x] Validação local de e-mail e senha
- [x] Área de colaboradores estruturada
- [x] Ação de associação não gera código fictício
- [x] Formulário de task estruturado com validação
- [x] Seleção de colaboradores não é simulada
- [x] Jornada semanal estruturada
- [x] Limite de inatividade estruturado
- [x] Relatórios com filtros previstos no requisito
- [x] CSV/PDF permanecem bloqueados enquanto contrato é incompleto
- [x] Drawer mobile fecha com Escape
- [x] Foco retorna ao botão do menu após fechamento
- [x] Usuário fictício removido da Sidebar
- [x] Componentes reutilizáveis para headings, avisos e empty state
- [x] Testes novos/atualizados documentados
- [x] Nenhum arquivo fora de `FrontEnd/` alterado
- [ ] Autenticação funcional — depende do backend
- [ ] Rotas realmente protegidas por sessão — depende do backend
- [ ] Código de associação funcional — depende do backend + decisões pendentes
- [ ] Lista real de colaboradores — depende do backend
- [ ] CRUD de tasks funcional — depende do backend
- [ ] Jornada/inatividade persistentes — depende do backend
- [ ] Dashboard RF-27 com todos os dados — depende do backend
- [ ] Exportação CSV/PDF completa — depende do backend
- [ ] Execução final de Vitest e build no repositório completo
