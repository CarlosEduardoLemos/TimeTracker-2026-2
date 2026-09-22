# Auditoria e Melhoria do Frontend — TimeTracker

Repositório analisado: `CarlosEduardoLemos/TimeTracker-2026-2`
Escopo: exclusivamente `FrontEnd/`
Data da auditoria: 2026-09-21

## 1. Melhorias realizadas

### `FrontEnd/src/components/Sidebar.jsx`
- **Problema:** o menu mobile usa `role="dialog"` e move o foco ao abrir, mas permitia que a navegação por `Tab` escapasse do modal.
- **Alteração:** inclusão de referência para o painel mobile e contenção de foco entre o primeiro e o último elemento focável; `Escape` continua fechando o menu e devolvendo o foco ao botão de abertura.
- **Motivo:** corrigir uma lacuna real de acessibilidade por teclado sem alterar navegação ou layout.
- **Benefício:** navegação previsível para usuários de teclado e tecnologias assistivas.

### `FrontEnd/src/components/ActivityChart.jsx`
- **Problema:** o gráfico Recharts era essencialmente visual; leitores de tela não tinham uma representação tabular equivalente dos valores.
- **Alteração:** o gráfico visual foi marcado como decorativo para tecnologias assistivas e foi adicionada uma tabela `sr-only` com dia e tempo registrado.
- **Motivo:** fornecer alternativa textual/semântica equivalente aos dados do gráfico.
- **Benefício:** os mesmos dados ficam disponíveis para leitores de tela sem duplicar informação visual.

### `FrontEnd/src/pages/AuthPage.jsx`
- **Problema:** o campo de e-mail marcava `aria-invalid`, porém a mensagem de erro não estava vinculada ao campo. O campo de senha também podia ficar inválido sem apresentar uma mensagem de erro específica.
- **Alteração:** inclusão de `aria-describedby` condicionado ao erro, IDs estáveis, mensagens com `role="alert"` e feedback explícito para senha com menos de 8 caracteres.
- **Motivo:** tornar validações compreensíveis e anunciáveis por tecnologia assistiva.
- **Benefício:** melhor acessibilidade e comportamento de formulário mais claro, sem habilitar autenticação ainda não integrada.

### `FrontEnd/src/hooks/useDashboardData.js`
- **Problema:** o hook dependia do comportamento de abort do `fetch` para impedir que uma resposta antiga atualizasse o estado após troca de filtro/desmontagem.
- **Alteração:** adicionado `controller.signal.aborted` antes de atualizar estado tanto na resolução quanto no tratamento de erro.
- **Motivo:** tornar o hook resistente a clientes/mocks/adapters que possam resolver uma Promise mesmo depois do cancelamento.
- **Benefício:** reduz risco de race condition e de dados antigos sobrescreverem o filtro atual.

## 2. Testes

### Testes existentes identificados
O frontend já possui Vitest + Testing Library e testes para componentes, hooks, serviços e utilitários, incluindo `Header`, `Sidebar`, `PeopleCard`, `ReportsAndAgent`, `useAutoRefresh`, `useHashRoute`, `useTheme`, `api`, `dashboard` e `report`.

### Testes adicionados/expandidos
- `FrontEnd/src/components/ActivityChart.test.jsx`
  - valida alternativa acessível tabular do gráfico;
  - valida estado vazio.
- `FrontEnd/src/components/Sidebar.test.jsx`
  - mantém os testes existentes;
  - valida retorno de foco após `Escape`;
  - valida focus trap com `Tab` e `Shift+Tab`.
- `FrontEnd/src/pages/AuthPage.test.jsx`
  - valida estrutura de login/cadastro ainda desabilitada;
  - valida associação do erro de e-mail ao campo;
  - valida feedback acessível de senha.
- `FrontEnd/src/hooks/useDashboardData.test.js`
  - valida carregamento e timestamp;
  - valida refresh sem apagar dados já exibidos;
  - valida estado de erro;
  - valida que resposta antiga não sobrescreve dados após mudança de filtro.

### Execução
Os testes **não puderam ser executados neste ambiente** porque a conexão GitHub disponível é somente leitura e o ambiente local não possui `node_modules`; também não há acesso de rede para instalar as dependências do projeto.

Foi possível verificar sintaxe dos módulos JavaScript sem JSX com o runtime Node disponível. A execução completa recomendada após aplicar os arquivos é:

```bash
cd FrontEnd
npm ci
npm test
npm run build
```

## 3. Pontos que não foram alterados

### Backend
Nenhum arquivo de `backend/` foi criado, removido, editado ou refatorado.

Dependências funcionais já documentadas no próprio frontend (autenticação, tasks, relatórios completos, jornada e associação de colaboradores) continuam bloqueadas porque dependem de contratos/endpoints ainda não disponíveis ao frontend. Não foram implementados workarounds nem dados fictícios.

### `FrontEnd/legacy`
A pasta `FrontEnd/legacy/blazor` foi analisada quanto a referências no repositório. Não foram encontradas referências textuais ao caminho/arquivos legacy no código atual e os scripts do `package.json` apontam para a aplicação React/Vite.

Mesmo assim, **nenhum arquivo legacy foi removido**, porque o escopo solicitado exige confirmação de uso antes de exclusão e a ausência de referência textual não prova, sozinha, que não exista valor histórico ou processo externo dependente.

### Refatorações não realizadas
- Não foram criados componentes base genéricos apenas para eliminar pequenas repetições.
- Não foi alterada a estrutura de `services/api.js`, pois ela já centraliza adequadamente requisições, fallback opcional e propagação de `AbortError`.
- Não foram movidos arquivos apenas por organização estética.
- Não foram alteradas regras de negócio ou placeholders dependentes de API.

## 4. Resumo

- **Arquivos alterados/adicionados no pacote:** 8.
- **Arquivos de aplicação alterados:** 4.
- **Arquivos de teste adicionados/expandidos:** 4.
- **Principais melhorias:** contenção de foco no menu mobile, alternativa acessível para gráfico, validações acessíveis na autenticação e proteção adicional contra respostas obsoletas no hook de dashboard.
- **Duplicidades removidas:** nenhuma duplicidade relevante foi removida por não haver benefício suficiente que justificasse nova abstração nos pontos auditados.
- **Componentes refatorados:** `Sidebar`, `ActivityChart`, `AuthPage`.
- **Hook reforçado:** `useDashboardData`.
- **Legacy:** mantido e documentado como aparentemente não referenciado pelo app atual.
- **Backend:** 0 alterações.

## Aplicação do pacote

Este ZIP contém apenas os arquivos frontend modificados/adicionados. Copie-os sobre os caminhos equivalentes do repositório e execute a suíte de testes/build antes do commit.
