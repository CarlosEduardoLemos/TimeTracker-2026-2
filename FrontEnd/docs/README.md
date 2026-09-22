# Documentação do frontend

Documentação técnica da aplicação React em `FrontEnd/src/`.

| Documento | Conteúdo |
| --- | --- |
| [AUDITORIA-TECNICA-2026-09-21.md](AUDITORIA-TECNICA-2026-09-21.md) | Auditoria atual, contratos, correções, validações e pendências externas |
| [FUNCIONALIDADES.md](FUNCIONALIDADES.md) | Telas, rotas, estados e limitações funcionais |
| [COMPONENTES.md](COMPONENTES.md) | Componentes compartilhados e páginas |
| [HOOKS.md](HOOKS.md) | `useDashboardData`, `useTheme`, `useHashRoute` e legado compatível |
| [ARQUITETURA.md](ARQUITETURA.md) | Estrutura, fluxo de dados, páginas e navegação |
| [TESTES.md](TESTES.md) | Ferramentas, cobertura e padrões de teste |
| [INTEGRACAO-FRONTEND-BACKEND.md](INTEGRACAO-FRONTEND-BACKEND.md) | Contratos atuais e dependências externas |
| [STYLES.md](STYLES.md) | Design, responsividade e acessibilidade |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Regras para mudanças no frontend |
| [REFACTORING.md](REFACTORING.md) | Decisões atuais e pendências |
| [IMPLEMENTACAO-REQUISITOS-FRONTEND.md](IMPLEMENTACAO-REQUISITOS-FRONTEND.md) | Matriz rastreável das entregas e auditoria |
| [BACKEND.md](BACKEND.md) | Limite de responsabilidade e legado Blazor |

## Início rápido

```powershell
cd FrontEnd
npm.cmd ci
npm.cmd run dev
```

## Validação

```powershell
npm.cmd test
npm.cmd run build
```

A aplicação usa `VITE_API_URL` para configurar a API. Dependências de backend devem ser documentadas neste diretório, mas não implementadas fora de `FrontEnd/` por quem trabalha exclusivamente no frontend.
