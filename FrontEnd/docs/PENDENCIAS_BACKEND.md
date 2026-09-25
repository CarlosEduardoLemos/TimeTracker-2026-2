# Pendências identificadas no backend

A análise foi feita somente para orientar o frontend. Nenhuma alteração de backend foi realizada.

## Sprint 2 / requisitos prioritários

1. **RF-02 — autenticação do gestor**
   - Não existem endpoints de cadastro, login, logout/renovação de sessão.
   - Não existe contrato de token/sessão para proteger o Dashboard.

2. **RF-03 — código de associação**
   - Não existe endpoint para gerar/consultar o código numérico de 6 dígitos do gestor.

3. **RF-05 — colaboradores associados**
   - `/users/` lista usuários globalmente; não há vínculo/escopo pelo gestor autenticado.

4. **RF-06 / RF-11 — tasks**
   - Não existem endpoints CRUD de tasks.
   - Faltam associação de colaboradores e lista de aplicações pertencentes ao escopo da task.

5. **RF-27 / CA-10 — Dashboard analítico**
   - O resumo atual possui usuário, categoria e tempo total, mas não task.
   - O realtime não informa task ativa.
   - Não há endpoint de Activity Timeline com início, término, duração, estado Ativo/Inativo e classificação dentro/fora do escopo.
   - Não há cálculo/retorno de possível hora extra baseado em jornada.

6. **RF-20 / RF-21 — configurações por colaborador**
   - `/config/` é global e possui somente `capture_interval_seconds` e `idle_timeout_seconds`.
   - Faltam dias de trabalho, entrada, saída, intervalo, carga horária e timeout individual por colaborador.

7. **RF-24 / RF-25 — relatórios completos**
   - CSV/PDF atuais funcionam para uma data e colaborador opcional.
   - Faltam intervalo de datas, task, jornada, possíveis horas extras e demais campos previstos no requisito.

## Observação de nomenclatura

O endpoint realtime retorna `online` ou `ausente`. O CA-10 fala em Online/Offline. O frontend revisado mantém `ausente` como estado distinto e considera `offline` apenas usuários cadastrados que não aparecem na janela realtime de 15 minutos.
