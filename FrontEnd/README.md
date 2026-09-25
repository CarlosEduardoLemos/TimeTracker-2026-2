# TimeTrack — frontend

Interface React 18, Vite 6 e Tailwind CSS para consultar os dados atualmente disponíveis na API FastAPI do projeto. O frontend usa navegação por hash e não exige React Router. Login, associação de equipe e tasks ainda dependem de contratos de backend.

## Executar

```powershell
cd FrontEnd
npm ci
Copy-Item .env.example .env
npm.cmd run dev
```

`VITE_API_URL` define a origem da API; o padrão é `http://localhost:8000`. O backend precisa estar em execução e permitir a origem do frontend em CORS.

## Validar

```powershell
npm.cmd test
npm.cmd run build
```

As telas disponíveis e seus limites estão em [Funcionalidades](docs/FUNCIONALIDADES.md). A [Arquitetura](docs/ARQUITETURA.md) descreve o fluxo de dados; [Auditoria](docs/AUDITORIA.md), [Pendências](docs/PENDENCIAS.md) e [Testes](docs/TESTES.md) registram decisões e validação desta revisão.
