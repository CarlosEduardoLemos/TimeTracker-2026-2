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
npm.cmd run lint
npm.cmd run format:check
npm.cmd run build
$env:PLAYWRIGHT_CHANNEL = 'chrome' # Chrome local; omita se instalou o Chromium do Playwright
npm.cmd run test:e2e
```

`npm.cmd run format` aplica Prettier. Para usar o Chromium gerenciado, execute `npx playwright install chromium` antes dos testes E2E. Um teste separado consulta FastAPI real: inicie API e banco, defina `RUN_REAL_API=1` e execute `npm.cmd run test:e2e:real`; consulte [Testes](docs/TESTES.md) para o preparo.

As telas disponíveis e seus limites estão em [Funcionalidades](docs/FUNCIONALIDADES.md). A [Arquitetura](docs/ARQUITETURA.md) descreve o fluxo de dados; [Alterações](docs/ALTERACOES.md), [Auditoria](docs/AUDITORIA.md), [Pendências](docs/PENDENCIAS.md) e [Testes](docs/TESTES.md) registram decisões e validação.
