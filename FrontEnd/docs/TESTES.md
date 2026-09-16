# Guia de testes automatizados — TimeTrack Frontend

## Ferramentas

- Vitest 3.2.x
- React Testing Library 16.x
- jest-dom 6.x
- jsdom 26.x
- coverage-v8

## Execução

```powershell
cd FrontEnd
npm.cmd test
npm.cmd run test:watch
npm.cmd run test:coverage
npm.cmd run build
```

## Cobertura atual relevante

### Componentes existentes

- `Card.test.jsx`
- `Header.test.jsx`
- `MetricCard.test.jsx`
- `PeopleCard.test.jsx`
- `ReportsAndAgent.test.jsx`
- `SectionHeading.test.jsx`
- `Sidebar.test.jsx`

### Hooks

- `useTheme.test.js`
- `useHashRoute.test.js`

### Páginas

- `AuthPage.test.jsx`: valida bloqueio de envio sem API e erro de e-mail.
- `TasksPage.test.jsx`: valida descrição curta, botão de salvar bloqueado e limpeza do formulário.
- `ReportsPage.test.jsx`: valida exportações CSV/PDF desabilitadas enquanto o contrato é incompleto.

### Serviços/utilitários

- `api.test.js`
- `dashboard.test.js`
- `report.test.js`

## Padrões

Priorize seletores acessíveis (`getByRole`, `getByLabelText`) e teste comportamento observado pelo usuário.

Casos importantes:

- loading, erro e empty state;
- ações desabilitadas quando dependem de contrato inexistente;
- navegação por hash e rota inválida;
- fechamento do menu mobile por `Escape`;
- ausência de dados fictícios em erro de API;
- validações de formulário;
- dark mode e preferências persistidas.

## Pendências de teste

Quando a API estiver disponível, adicionar testes de integração/E2E para login, sessão, autorização 401/403, associação, CRUD de tasks, jornada, filtros completos do RF-27 e exportação real.
