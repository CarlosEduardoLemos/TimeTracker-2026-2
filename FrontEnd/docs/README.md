# Documentação do frontend

Documentação técnica da aplicação React em `FrontEnd/src/`.

Ponto de entrada: [README principal](../README.md). Revisão mais recente:
[auditoria completa de 25/09/2026](AUDITORIA-COMPLETA-2026-09-25.md).
Organização anterior: [relatório de 25/09/2026](RELATORIO-AUDITORIA-FRONTEND.md).

| Documento | Conteúdo |
| --- | --- |
| [RELATORIO-AUDITORIA-FRONTEND.md](RELATORIO-AUDITORIA-FRONTEND.md) | Organização e auditoria de 25/09/2026, com histórico preservado |
| [AUDITORIA-TECNICA-2026-09-23.md](AUDITORIA-TECNICA-2026-09-23.md) | Auditoria anterior, riscos, alterações e validações daquela revisão |
| [DATA-FLOW.md](DATA-FLOW.md) | Consultas, cache, filtros, estados e cancelamento |
| [EXTERNAL-ISSUES.md](EXTERNAL-ISSUES.md) | Problemas comprovados no backend e contratos pendentes |
| [AUDITORIA-TECNICA-2026-09-21.md](AUDITORIA-TECNICA-2026-09-21.md) | Registro histórico da revisão anterior |
| [FUNCIONALIDADES.md](FUNCIONALIDADES.md) | Telas, rotas, estados e limitações funcionais |
| [COMPONENTES.md](COMPONENTES.md) | Componentes compartilhados e páginas |
| [HOOKS.md](HOOKS.md) | Contratos dos quatro hooks ativos |
| [ARQUITETURA.md](ARQUITETURA.md) | Estrutura, fluxo de dados, páginas e navegação |
| [TESTES.md](TESTES.md) | Ferramentas, cobertura e padrões de teste |
| [INTEGRACAO-FRONTEND-BACKEND.md](INTEGRACAO-FRONTEND-BACKEND.md) | Contratos atuais e dependências externas |
| [STYLES.md](STYLES.md) | Design, responsividade e acessibilidade |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Regras para mudanças no frontend |
| [REFACTORING.md](REFACTORING.md) | Decisões atuais e pendências |
| [IMPLEMENTACAO-REQUISITOS-FRONTEND.md](IMPLEMENTACAO-REQUISITOS-FRONTEND.md) | Matriz rastreável das entregas e auditoria |
| [BACKEND.md](BACKEND.md) | Limite de responsabilidade e legado Blazor |
| [RELATORIO.md](RELATORIO.md) | Histórico da correção de alinhamento e campos sem contrato |
| [MELHORIAS-FRONTEND-2026-09-23.md](MELHORIAS-FRONTEND-2026-09-23.md) | Entrega de ErrorBoundary e carregamento lazy das páginas |
| [REFATORACAO-CLEAN-CODE.md](REFATORACAO-CLEAN-CODE.md) | Histórico de decisões e refatorações |
| [RELATORIO-REFATORACAO-FRONTEND-2026-09-21.md](RELATORIO-REFATORACAO-FRONTEND-2026-09-21.md) | Histórico da revisão de 21/09/2026 |

O antigo índice `README-FRONTEND.md` foi consolidado neste arquivo: seus links já
estavam nesta tabela e não havia conteúdo técnico exclusivo. Registros históricos
descrevem o estado de suas entregas; não certificam a implementação ou os testes atuais.

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
