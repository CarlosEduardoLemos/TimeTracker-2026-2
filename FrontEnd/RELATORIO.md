# Relatório técnico — TimeTracker

> Registro histórico. Revisão atual: [23/09/2026](docs/AUDITORIA-TECNICA-2026-09-23.md).

Base analisada: `main` (commit `87938499a1feec72ecca32be049343a3d0ce0a0e`)

## Serviço solicitado
Investigar o desalinhamento dos controles do Dashboard e os campos que permanecem sem dados após popular o banco, modificando somente o frontend.

## Problema identificado — alinhamento
Os filtros de data e colaborador usam a classe compartilhada `control`, que cria um container `flex` com altura de 40px, mas não aplica alinhamento vertical dos filhos. No mesmo projeto, outro uso de `control` já adiciona `items-center` explicitamente.

## Causa
Bug de frontend em `FrontEnd/src/components/Header.jsx`: ausência de `items-center` nos dois labels dos filtros.

## Correção aplicada
Adicionado `items-center` somente aos controles de data e colaborador. A alteração é localizada e não muda o contrato da API nem o comportamento funcional.

## Campos sem dados
A causa principal está no backend/contrato disponível, não no frontend:
- `backend/seed.py` popula categorias, regras de categorização e configurações; não popula usuários, atividades, tasks, jornadas ou timeline.
- O backend atual não possui modelo/endpoint de Task nem contratos para jornada, tempo ativo/inativo, possível hora extra e Activity Timeline.
- `GET /dashboard/summary` retorna apenas data, usuário, tempo total e distribuição por categoria.
- `GET /activities/realtime` retorna estado recente, processo/janela/categoria e status, mas não task ativa.
- Por isso o frontend mantém explicitamente `—`/empty states para esses campos, conforme a documentação existente. Preencher esses valores no frontend seria mascarar ausência de contrato do backend.

## Arquivos alterados
- `FrontEnd/src/components/Header.jsx`: alinhamento vertical dos filtros.

## Backend
Nenhum arquivo de backend foi alterado.

## Testes
Não foi possível executar `npm test`/`npm run build` neste ambiente porque o repositório não pôde ser clonado pela rede do runtime e as dependências npm não estão instaladas. A alteração é sintática e limitada a classes Tailwind já usadas no próprio projeto.

## Validação recomendada no checkout do projeto
```powershell
cd FrontEnd
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

Validar visualmente:
1. botão de tema, refresh, data e colaborador na mesma linha/base vertical;
2. tema claro e escuro;
3. larguras desktop e mobile;
4. troca da data e do colaborador continua disparando os filtros normalmente.

## Pendência para equipe backend
Para preencher integralmente RF-27, o backend precisa fornecer contratos oficiais para tasks, atividade/inatividade, jornada, possível hora extra e timeline, além de dados coerentes com os filtros de período/colaborador/task.
