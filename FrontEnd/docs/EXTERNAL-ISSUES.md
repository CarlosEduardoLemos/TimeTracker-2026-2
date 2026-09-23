# Problemas fora do FrontEnd

Revisão estática de 23/09/2026. Nenhum arquivo externo foi alterado. Severidade
considera impacto potencial se a API for exposta; não presume um deploy público.
Não houve execução do banco, seed ou chamadas mutantes à API.

## Crítico — ausência de autenticação e autorização

- **Local:** `backend/app/main.py`, `backend/app/routers/*.py`, `backend/app/crud.py`.
- **Evidência:** handlers dependem apenas de `get_db`; não existe dependência de
  identidade/permissão. `list_users` retorna todos e `get_daily_summary` filtra
  pelo username enviado, sem vínculo ao gestor. Rotas de escrita também são abertas.
- **Impacto:** filtros e botões desabilitados no React não impedem leitura/escrita
  direta nem asseguram isolamento de equipe previsto em RNF-05.
- **Correção sugerida:** definir contrato de autenticação e impor autorização e
  vínculo de equipe no servidor em todas as leituras/escritas relevantes.
- **Arquivos envolvidos:** routers, schemas, models, crud e main; exigirá desenho
  de persistência e migrations fora do escopo. Não simular proteção no frontend.

## Importante — seed de configurações usa inteiro em coluna UUID

- **Local:** `backend/seed.py:run`, `backend/app/models.py:SystemSettings`.
- **Evidência:** filtro `SystemSettings.id == 1` e criação `id=1`; modelo declara
  `Uuid(as_uuid=True)` com default `uuid.uuid7`.
- **Impacto:** caminho de inicialização é incompatível com o tipo e pode impedir
  o seed de concluir; popular categorias não cria usuários/logs/tasks.
- **Correção sugerida:** localizar a configuração pela regra de singleton e
  deixar o default UUID gerar a chave; revisar idempotência do seed.
- **Arquivos envolvidos:** `backend/seed.py`; eventualmente constraints/models
  e migrations para garantir singleton. Falha identificada estaticamente.

## Importante — configuração salva não determina status realtime

- **Local:** `backend/app/crud.py:get_realtime_view`, `update_settings`, `backend/app/utils.py`.
- **Evidência:** realtime compara tempo com `MAX_IDLE_SECONDS`, lido do ambiente;
  PUT `/config/` grava `SystemSettings.idle_timeout_seconds`, não consultado ali.
- **Impacto:** estado calculado pode divergir da configuração persistida. Além
  disso, online/ausente é calculado por recência/is_idle, não pela conexão
  autenticada do agente exigida em RN-11. Usuários sem logs em 15 minutos somem.
- **Correção sugerida:** esclarecer o contrato de conexão versus atividade e
  unificar a fonte de timeout; fornecer estado de equipe completa conforme domínio.
- **Arquivos envolvidos:** crud, utils, schemas, routers de activities/config e
  modelos pertinentes. O frontend preserva online/ausente sem inventar offline.

## Importante — empates e reenvios podem duplicar dados

- **Local:** `backend/app/crud.py:create_activity_log`, `get_realtime_view`; `backend/app/models.py:ActivityLog`.
- **Evidência:** cada POST cria novo UUID, sem chave de idempotência; índice
  `(user_id, captured_at)` não é único. Realtime junta todos os registros iguais
  ao maior timestamp, sem critério de desempate.
- **Impacto:** reenvios podem inflar totais; empates podem gerar duas linhas para
  o mesmo usuário e inflar contagem online/chaves React duplicadas.
- **Correção sugerida:** definir identidade de registro para sincronização e
  seleção determinística da última leitura. Não deduplicar por suposição na UI.
- **Arquivos envolvidos:** models, schemas, crud e router activities, além de
  migrations e contrato do agente quando disponível.

## Importante — contratos de domínio ainda ausentes

- **Local:** `backend/app/models.py`, `schemas.py`, `routers/`; comparação com
  `requisitos/requisitos/rn_rf.md` e `ca.md`.
- **Evidência:** não há gestor/associação/task/jornada/períodos com início/fim e
  escopo. Exportações só têm date/username e totais por categoria; config é global.
- **Impacto:** login, associação, tasks, jornada, timeline e relatório completo
  não podem ser conectados com os contratos atuais.
- **Correção sugerida:** implementar contratos acordados a partir dos requisitos
  existentes; preservar bloqueios explícitos até então.
- **Arquivos envolvidos:** models, schemas, crud, routers, migrations e agente.
  Nenhum nome de endpoint futuro foi presumido nesta auditoria.

## Melhoria — correspondência BOTH não normaliza o alvo

- **Local:** `backend/app/crud.py:categorize`.
- **Evidência:** keyword é convertida para lowercase; process/title também,
  mas BOTH usa fallback `f"{process_name} {window_title}"` sem lowercase.
- **Impacto:** capitalização pode impedir regra válida de casar e alterar
  categoria dos registros/resumos. A escolha da primeira regra não tem order_by.
- **Correção sugerida:** compor BOTH a partir dos alvos normalizados e definir
  prioridade explícita das regras com testes do contrato.
- **Arquivos envolvidos:** crud e testes backend; schemas/models apenas se uma
  prioridade persistida for aprovada no domínio.

## Observações de implantação e dados a confirmar

- `backend/app/main.py` combina CORS wildcard e credentials habilitadas. Não há
  sessão hoje; restringir origens conforme deploy/contrato futuro exige mudança
  externa. CORS não substitui autorização.
- `crud.get_daily_summary` usa `func.date(captured_at)`; frontend seleciona dia
  local. O fuso de sessão PostgreSQL/deploy não foi confirmado. Definir fuso de
  negócio antes de alterar fronteiras de dias (crud/configuração do banco).
- `routers/dashboard.py:export_csv` escreve username/category recebidos sem
  tratamento específico para fórmulas de planilhas; revisar neutralização na
  exportação do servidor antes de disponibilizá-la como relatório. Frontend não
  chama essa rota. Arquivos envolvidos: router dashboard e testes de exportação.
- PDF usa fonte Helvetica sem fonte Unicode incorporada: revisar nomes fora do
  conjunto suportado no router dashboard e dependências/assets de fontes.
- `main.py` usa create_all no startup, sem histórico de migrations; estratégia
  de evolução de schema requer infraestrutura/backend. Docker/banco não foram
  iniciados nesta revisão; configurações operacionais não foram certificadas.
