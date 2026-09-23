# Backend, API e código legado

## Limite de responsabilidade

O frontend ativo é React/Vite e está em `FrontEnd/src/`. A implementação da API
está em `backend/`, fora desta pasta: FastAPI, schemas Pydantic, SQLAlchemy e
PostgreSQL. Nesta auditoria, essa implementação foi consultada somente para leitura.
O contrato usado pelo frontend está em [Integração frontend–backend](INTEGRACAO-FRONTEND-BACKEND.md).

## Protótipo Blazor removido

A antiga pasta `FrontEnd/legacy/blazor/` continha um protótipo .NET com dados
visuais estáticos. Foi removida por solicitação do usuário após verificar que
não era importada pela aplicação, incluída nas rotas ou utilizada pelos scripts
de desenvolvimento, build e testes. Os artefatos locais bin/obj também foram removidos.

O protótipo nunca forneceu os endpoints consumidos pelo React. Para consulta
histórica, utilize o histórico do Git; a aplicação atual não depende de .NET.
