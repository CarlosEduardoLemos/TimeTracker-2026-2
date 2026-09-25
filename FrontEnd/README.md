# TimeTracker — Frontend revisado

Versão preparada a partir dos requisitos e das Sprints 1 e 2 do repositório `CarlosEduardoLemos/TimeTracker-2026-2`.

## O que foi melhorado

- Dashboard passa a aproveitar integralmente os endpoints atualmente existentes: `/users/`, `/activities/realtime` e `/dashboard/summary`.
- Estado **Offline** é derivado apenas quando um usuário cadastrado não aparece na janela de 15 minutos do endpoint realtime; o estado `ausente` do backend permanece distinto.
- Indicador de tempo registrado usa exclusivamente o resumo diário retornado pela API.
- Tela de colaboradores deixou de ser somente um empty state e agora lista os dados que o backend realmente entrega.
- Exportação CSV e PDF foi habilitada na tela de Relatórios usando os endpoints já existentes `/dashboard/export/csv` e `/dashboard/export/pdf`.
- Tela de Configurações passou a ler e salvar `/config/`, sem fingir que isso já atende jornada individual por colaborador.
- Tasks e autenticação continuam bloqueadas funcionalmente quando dependem de contratos inexistentes no backend, evitando dados ou segurança simulados.
- Navegação responsiva e suporte básico a teclado/tema escuro foram preservados.

## Executar

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, o frontend espera a API em `http://localhost:8000`.

## Limites do backend atual

Consulte `docs/PENDENCIAS_BACKEND.md`. Nenhuma pasta ou arquivo do backend foi alterado nesta entrega.
