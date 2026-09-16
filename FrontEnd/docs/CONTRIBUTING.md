# Contribuindo no frontend

## Escopo

Mudanças de frontend devem permanecer em `FrontEnd/`. Dependências de backend/API devem ser registradas em `docs/INTEGRACAO-FRONTEND-BACKEND.md` ou `docs/IMPLEMENTACAO-REQUISITOS-FRONTEND.md`, sem alterar áreas externas.

## Ambiente e validação

```powershell
cd FrontEnd
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

Revise também tema claro/escuro, mobile/tablet/desktop e navegação por teclado.

## Convenções atuais

- telas completas em `src/pages/`;
- componentes reutilizáveis em `src/components/`;
- hooks em `src/hooks/`;
- chamadas HTTP centralizadas em `src/services/api.js`;
- regras/formatação reutilizáveis em `src/utils/`;
- navegação principal por `useHashRoute` e itens definidos em `dashboardData.js`;
- não criar dados fictícios para suprir contrato ausente;
- não armazenar credenciais/tokens em logs ou armazenamento inseguro;
- novas ações dependentes de API devem possuir loading/error/empty/success quando forem habilitadas.

## Quando atualizar documentação

| Mudança | Documento |
| --- | --- |
| Tela, rota, filtro ou estado | `FUNCIONALIDADES.md` |
| Componente/página | `COMPONENTES.md` |
| Hook/fluxo de estado | `HOOKS.md` |
| Estrutura geral | `ARQUITETURA.md` |
| Contrato/dependência de API | `INTEGRACAO-FRONTEND-BACKEND.md` |
| Testes | `TESTES.md` |
| Estilos/a11y/responsividade | `STYLES.md` |
| Decisão ou pendência | `REFACTORING.md` |
| Alteração ligada a requisito | `IMPLEMENTACAO-REQUISITOS-FRONTEND.md` |

## Checklist de PR

- [ ] Alterações restritas ao escopo autorizado.
- [ ] `npm.cmd test` passa.
- [ ] `npm.cmd run build` passa.
- [ ] Testes adicionados/atualizados para comportamento alterado.
- [ ] Estados de loading/error/empty/success avaliados quando aplicável.
- [ ] Tema e responsividade revisados.
- [ ] Navegação por teclado/foco revisada.
- [ ] Documentação correspondente atualizada.
- [ ] Nenhum segredo, dado pessoal real ou `dist/` incluído.
