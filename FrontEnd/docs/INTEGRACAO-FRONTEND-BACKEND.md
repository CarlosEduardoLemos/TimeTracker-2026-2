# Integração frontend–backend

Este documento registra apenas a perspectiva do frontend. Nenhuma definição abaixo altera ou presume implementação do backend.

## Configuração atual

O cliente HTTP existente está em `src/services/api.js`. A URL base usa `VITE_API_URL`, com fallback local para `http://localhost:8000`.

Em produção, a comunicação deve utilizar HTTPS conforme RNF-03.

## Contratos atualmente consumidos

| Método/rota atual | Uso atual |
| --- | --- |
| `GET /dashboard/summary?date=...&username=...` | Resumo diário e série histórica disponível |
| `GET /activities/realtime` | Estado/atividade recente disponível |
| `GET /users/` | Opções atuais de colaborador |

Os contratos acima são legados em relação ao domínio novo e não são suficientes para atender integralmente RF-02, RF-03, RF-05, RF-06, RF-20, RF-21, RF-24, RF-25 e RF-27.

## Dados que o frontend ainda precisa

### Autenticação do gestor

O frontend precisa de contrato oficial para:

- criar conta do gestor;
- login;
- sessão/usuário atual;
- logout;
- respostas 401/403.

O frontend não deve armazenar senha em texto puro nem criar sessão fictícia.

### Colaboradores e associação

Necessário:

- listar apenas colaboradores associados ao gestor autenticado;
- gerar código de associação de 6 dígitos;
- informar validade/expiração e regras de reutilização/regeneração.

### Tasks

Necessário fornecer estrutura estável para:

- ID;
- descrição;
- colaboradores associados;
- aplicações/serviços monitorados;
- leitura/criação/edição.

### Jornada e inatividade

Necessário ler/gravar por colaborador:

- dias de trabalho;
- entrada/saída;
- intervalo;
- carga horária ou regra de derivação;
- limite de inatividade.

### Dashboard RF-27

O frontend precisa receber, sob os filtros de período/colaborador/task:

- online/offline;
- tasks ativas;
- tempo ativo/inativo;
- tempo por task;
- possíveis horas extras;
- status atual dos colaboradores;
- Activity Timeline;
- aplicação dentro/fora do escopo.

### Relatórios

A API precisa permitir consulta/exportação coerente com os filtros atuais e produzir dados autorizados para CSV/PDF. O frontend não usa mais a exportação parcial existente como relatório oficial.

## Tratamento de erros esperado no frontend

- loading inicial distinto de refresh;
- `AbortError` não apresentado como falha;
- erro de rede/HTTP com feedback e retry quando aplicável;
- 401 deve direcionar ao fluxo de autenticação quando o contrato existir;
- 403 deve informar falta de permissão sem revelar dados;
- respostas vazias devem gerar empty state, não mocks.
