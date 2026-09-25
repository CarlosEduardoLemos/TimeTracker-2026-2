# Pendências do frontend e dependências externas

Este documento registra o que **não** foi implementado. Os contratos disponíveis são descritos em [Arquitetura](ARQUITETURA.md); a experiência atual está em [Funcionalidades](FUNCIONALIDADES.md). Prioridade alta indica risco funcional, de dados ou de acesso; média indica lacuna relevante de produto ou manutenção; baixa indica melhoria de menor impacto.

## Contratos e correções necessários no backend

Nenhuma das ações desta seção pode ser concluída com segurança apenas alterando `FrontEnd`. Os nomes dos futuros endpoints, payloads e políticas de autenticação ainda precisam ser definidos pelo backend; esta lista não propõe rotas fictícias.

| Prioridade | Problema e ponto do frontend | Contrato/correção necessária fora do frontend | Por que não foi implementado no frontend |
| --- | --- | --- | --- |
| Alta | `AuthPage`, `App` e todas as páginas não identificam um gestor | Cadastro, login, sessão e autorização de leituras e escritas no servidor | Não há como conferir identidade ou isolar dados com uma senha apenas no navegador |
| Alta | `DashboardPage`, `CollaboratorsPage` e `ReportsPage` consomem usuários globais | Associação do colaborador ao gestor, código de associação previsto em RF-03/RF-04 e consultas restritas ao gestor autenticado | `/users/` devolve todos os usuários; filtro local não é controle de acesso |
| Alta | `TasksPage` não lista, cria nem edita tasks (RF-06/RF-11) | Persistência e contratos para descrição, colaboradores associados, aplicações do escopo e autorização | Não há modelo/rota de task nem associação de atividade a task no backend atual |
| Alta | Painel não mostra task ativa, tempo produtivo, ranking, horas extras ou timeline RF-27 | Registros e consultas por task com início/fim, estado ativo/inativo, aplicação, classificação de escopo e jornada | `DailySummaryResponse` só contém data, usuário, total e categoria; métricas adicionais seriam inventadas |
| Alta | Qualquer página pode solicitar dados globais e `PUT /config/` não exige gestor | Autenticação/autorização das rotas existentes; política CORS adequada ao ambiente | Segurança de consulta/gravação precisa ser imposta no servidor; ocultar botão no frontend não protege a API |
| Média | `SettingsPage` edita apenas valores globais, enquanto RF-20/RF-21 exigem parâmetros por colaborador | Contratos de jornada e limite de inatividade associados ao colaborador | O objeto `/config/` contém somente dois inteiros globais |
| Média | Status de atividade no painel não acompanha o limite salvo em `SettingsPage` | `crud.get_realtime_view` precisa usar a configuração apropriada; hoje usa `MAX_IDLE_SECONDS` da configuração do processo | Atualizar o formulário não altera o cálculo do backend |
| Média | “Online” e “Sem leitura recente” não provam conexão do agente | Definição e emissão de heartbeat/sessão do agente, com estados de conexão | `/activities/realtime` usa a última leitura em uma janela de 15 minutos |
| Média | `ReportsPage` só exporta um dia e não atende RF-24/RF-25 por inteiro | Contrato autorizado para período, colaborador, task, aplicações, escopo, atividade/inatividade, jornada e possível hora extra | CSV/PDF atuais são derivados do resumo diário por categoria |
| Média | Data do resumo pode ter interpretação diferente do dia local exibido | Definição do fuso de `captured_at`, agregação e parâmetro `date`, incluindo viradas de dia | `todayIso()` usa data local do navegador; o backend agrega a data de captura no banco |

### Defeitos e riscos observados no código externo

| Prioridade | Evidência lida no backend | Efeito possível | Ajuste externo necessário |
| --- | --- | --- | --- |
| Alta | `backend/seed.py` consulta e insere `SystemSettings.id == 1`, enquanto `backend/app/models.py` declara `id` UUID | Seed de configuração pode falhar ou não encontrar o registro esperado | Alinhar seed ao tipo/chave real e testar inicialização |
| Alta | `backend/app/main.py` usa `allow_origins=["*"]` e `allow_credentials=True` | Política de origem excessivamente ampla para dados de gestão | Definir origens e credenciais permitidas por ambiente |
| Média | `crud.get_realtime_view` faz join pelo maior `captured_at` por usuário | Empate de capturas pode devolver mais de uma entrada do mesmo usuário | Definir desempate determinístico |
| Média | Registro de atividade não mostra chave de idempotência nem unicidade de reenvio | Reenvio pode duplicar duração no resumo | Definir deduplicação/idempotência no servidor |

Essas observações foram feitas por leitura; não houve alteração, migração ou teste de banco no backend nesta revisão.

## Pendências próprias de `FrontEnd`

| Prioridade | Local | Trabalho recomendado | Condição para executar |
| --- | --- | --- | --- |
| Média | Telas ativas e `src/index.css` | Verificar visualmente foco, contraste, zoom, rolagem horizontal, telas baixas e layout mobile/tablet/desktop | Navegador real e tamanhos de tela definidos |
| Média | `ReportsPage`, `SettingsPage`, `CollaboratorsPage` | Executar fluxos reais com API disponível e indisponível; conferir download, erros de rede, atualização e retry | Ambiente de integração com backend e dados reais |
| Média | `FrontEnd` como aplicação instalável | Decidir se o “Dashboard PWA” dos requisitos exige instalação e funcionamento offline. Atualmente não há manifest nem service worker | Definir comportamento desejado; não simular dados offline sem contrato/política |
| Média | Testes automatizados | Cobrir diretamente lista/erro/retry de Colaboradores e validações/salvamento de Configurações conforme mudanças futuras | Usar casos comportamentais relevantes; não ampliar apenas percentual |
| Baixa | Código preservado sem consumidor em `src/components`, `useAutoRefresh` e utilitários auxiliares | Reutilizar ou remover após definir quais visualizações futuras terão dados reais | Contratos e desenho das telas futuras esclarecidos |
| Baixa | Qualidade de código | Avaliar ESLint/formatador e script específico; atualizar `package-lock.json` junto com qualquer dependência | Ganho de manutenção justificado e instalação disponível |

### Ordem sugerida

1. Concluir verificação manual de navegação e acessibilidade.
2. No backend, definir autenticação/autorização e associação de equipe antes de integrar fluxos de gestor.
3. Definir contratos de task e registros por task; só então implementar criação, seleção e métricas de produtividade.
4. Definir jornada e relatórios completos; integrar filtros e exportação com testes de fluxo.
5. Decidir o alcance de PWA e dos componentes preservados, então limpar o que permanecer sem uso.

Os itens externos não foram corrigidos no backend porque o escopo de alteração deste trabalho é exclusivamente `FrontEnd/`.
