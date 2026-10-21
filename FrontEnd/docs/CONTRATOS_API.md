# Contratos da API do Frontend

Revisado em **21/10/2026** com base nos arquivos locais de `backend/app/`, `agent/` e no código de `FrontEnd/src/shared/api/`. A PR #122 do Agent e a PR #123 de autenticação foram incorporadas à `main` da organização. A PR #128 do frontend ainda está aberta na revisão deste checkout; a existência de um contrato não significa que o servidor já o proteja.

## Rotas usadas pelas telas do frontend

`VITE_API_URL` define a origem da API; sem configuração, o cliente usa `http://localhost:8000`. A sessão do gestor envia Bearer nas rotas de dados abaixo; o Backend atual ainda não exige esses tokens.

| Método e rota               | Parâmetros/corpo                                                                | Resposta                                                                                            | Bearer enviado pelo frontend | Consumidor                         |
| --------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------- |
| `GET /users/`               | Nenhum                                                                          | Array de `UserOut`                                                                                  | Sim                          | Painel, Colaboradores e Relatórios |
| `GET /activities/realtime`  | Nenhum                                                                          | Array de `RealtimeEntry`                                                                            | Sim                          | Painel e Colaboradores             |
| `GET /dashboard/summary`    | `date` obrigatório (`AAAA-MM-DD`); `username` opcional                          | `{ date, users: [{ username, total_seconds, by_category: [{ category, color, total_seconds }] }] }` | Sim                          | Painel                             |
| `GET /dashboard/export/csv` | Mesmos filtros do resumo                                                        | `text/csv`                                                                                          | Sim                          | Relatórios                         |
| `GET /dashboard/export/pdf` | Mesmos filtros do resumo                                                        | `application/pdf`                                                                                   | Sim                          | Relatórios                         |
| `GET /config/`              | Nenhum                                                                          | `{ capture_interval_seconds, idle_timeout_seconds, updated_at? }`                                   | Sim                          | Configurações                      |
| `PUT /config/`              | JSON com `capture_interval_seconds` e `idle_timeout_seconds` inteiros positivos | Objeto de configuração                                                                              | Sim                          | Configurações                      |

O cliente envia `Authorization: Bearer <JWT>` nas chamadas de dados da tabela. **O backend inspecionado não exige esse header nessas rotas**; envio do token pelo frontend não equivale a autenticação/isolamento. O parâmetro `username` filtra uma consulta, mas não impõe autorização no servidor.

### Resposta realtime consumida pelo Dashboard e por Colaboradores

`GET /activities/realtime` retorna uma captura (a mais recente) por usuário com registro dentro da janela de até 24 horas; não retorna o status de cada máquina se houver múltiplos Agents por usuário. Os campos incluem `username`, `hostname`, `process_name`, `status` e `seconds_since_last_activity`; a resposta também contém `window_title`, `category` e `is_idle`. O tempo é calculado sobre `captured_at` da captura, não sobre uma confirmação de gravação/recebimento no servidor. Eventos antigos sincronizados posteriormente ou relógios divergentes podem, portanto, alterar a idade exibida.

O backend atual classifica `offline` quando `is_idle` é verdadeiro **ou** quando passaram mais de 900 segundos desde a captura; `ausente` usa o limite de 300 segundos. Portanto, `offline` não comprova desconexão, e a regra acordada de conexão por máquina ainda não é garantida. Não há campo de conexão, versão, fila local, pausa, última sincronização ou Task ativa, nem rota `/agents/status` implementada. Consulte B-10/I-05 em [Pendências](PENDENCIAS.md).

Na página de Colaboradores, o timestamp de atualização é local: marca quando o navegador recebeu uma resposta validada. `seconds_since_last_activity` continua sendo a idade da captura calculada pelo Backend. O frontend avança essa idade com tempo monotônico decorrido desde a resposta, sem inferir `captured_at`, horário de recebimento no servidor ou conexão do Agent. A resposta realtime não expõe o `captured_at` bruto.

Os validadores do frontend verificam o tipo de `is_idle`, `CategorySummary.color` e `SystemSettingsOut.updated_at` quando esses campos opcionais estão presentes; a ausência continua permitida onde o cliente não depende desses campos. As rotas, parâmetros e payloads consumidos não apresentaram divergência com os routers/schemas consultados. Isso não comprova comunicação com uma instância real; os cenários reais permanecem opt-in.

## Autenticação de gestor no backend e frontend

O backend implementa cadastro, login JWT e consulta do gestor; o frontend usa os contratos para iniciar e validar a sessão. As rotas do gestor aguardam uma identidade verificada antes de exibir conteúdo. A autorização das rotas de dados permanece uma dependência separada de backend descrita em B-01.

### `POST /auth/register`

Recebe `ManagerCreate`:

```json
{
  "email": "gestor@empresa.com",
  "password": "SenhaSegura123!"
}
```

O backend valida e normaliza o e-mail, exige e-mail único e senha com pelo menos 8 caracteres e no máximo 72 bytes em UTF-8. A senha é armazenada como hash bcrypt.

- `201`: cadastro concluído, resposta `ManagerOut`.
- `409`: e-mail já cadastrado.
- `422`: e-mail ou senha inválidos.

`ManagerOut` tem `id` (UUID), `email` e `created_at`. Não contém `association_code` nem hash da senha.

### `POST /auth/login`

Recebe o mesmo par `email` e `password`; e-mail inválido ou credenciais incorretas resultam em `422` ou `401`, respectivamente. O sucesso retorna o schema `Token`:

```json
{
  "access_token": "<JWT_EMITIDO_PELO_SERVIDOR>",
  "token_type": "bearer",
  "expires_in": 3600
}
```

`expires_in` é um inteiro positivo em segundos, calculado a partir da configuração do backend. A implementação usa JWT HS256 com audiência de gestor; o servidor controla assinatura e expiração.

### `GET /auth/me`

Exige `Authorization: Bearer <JWT_DO_GESTOR>` e retorna `ManagerOut`. Token ausente, inválido, expirado ou associado a gestor inexistente resulta em `401`. A rota está implementada e retorna a identidade do gestor; o schema não inclui código de associação.

### Métodos de autenticação na camada HTTP do frontend

`api.registerManager(credentials, signal)`, `api.loginManager(credentials, signal)` e `api.getCurrentManager(accessToken, signal)` chamam os contratos acima e validam as respostas. Antes do envio, cadastro/login exigem um objeto com e-mail e senha não vazios e enviam somente esses dois campos. A tela também valida formato de e-mail, mínimo de 8 caracteres e limite de 72 bytes UTF-8 no cadastro. `/auth/me` exige a forma compacta de JWT com três segmentos base64url, rejeitando espaços e caracteres de controle antes de compor `Authorization`. Essa verificação é apenas sintática: assinatura, validade e autorização continuam sob responsabilidade do servidor.

Os métodos reutilizam `ApiError`, timeout de 15 segundos e `AbortSignal`. Os erros dessas chamadas preservam status HTTP, inclusive `401`, `409` e `422`, mas omitem detalhes fornecidos pelo servidor para evitar refletir credenciais ou tokens em mensagens. Resposta incompatível é `invalid-response`. Os validadores aceitam somente os campos definidos pelos schemas atuais `ManagerOut` e `Token`; novas propriedades exigem atualização coordenada do contrato antes de serem consumidas.

`ManagerSessionProvider` controla cadastro, login e validação de identidade. Cadastro retorna `ManagerOut` e apresenta um link para entrar; não cria sessão. Login consulta `/auth/me` antes de armazenar o JWT em `sessionStorage`. A sessão é restaurada por outra chamada a `/auth/me`; logout remove o item da aba. O cliente injeta Bearer nas consultas privadas e emite evento coordenado após `401`; `403` preserva a sessão. Não há refresh token nem revogação no backend.

## Outras rotas presentes no backend, sem uso pelas telas

O backend também declara `GET /` (healthcheck), `POST /activities/`, `GET/POST /categories/`, `GET/POST /categories/rules`, `PUT/DELETE /categories/rules/{rule_id}`. A interface web atual não chama essas rotas.

## Associação Agent–gestor: endpoints ainda não confirmados no backend

A PR #122 (`ed48ad7cfff9e724406ef9ffffeb6c0f132caf32`) foi integrada à `main` da organização em 12/10/2026 (merge `e43673b4dca212eaa991308d14c9dc25b6c64061`). O Agent implementa formulário de código numérico de seis dígitos, `POST /associate/`, armazenamento protegido por DPAPI do token obtido (`token` ou `access_token`), Bearer em chamadas posteriores e bloqueio do monitoramento até associação.

Payload enviado pelo Agent:

```json
{
  "code": "012345",
  "username": "colaborador",
  "hostname": "ESTACAO-01"
}
```

`code` é string para preservar zeros à esquerda. A implementação do cliente Agent e o merge da PR não demonstram que o backend tenha a rota correspondente. Na inspeção dos routers, modelos, schemas e CRUD deste checkout, não foram encontrados:

- `POST /associate/` ou outra rota de associação;
- campo/modelo `association_code`, geração ou consulta autenticada do código;
- persistência do vínculo colaborador–gestor ou consulta de colaboradores por gestor;
- política de validade, consumo único ou erros do código.

Logo, o endpoint e payload acima são o comportamento do cliente Agent, não contrato confirmado do servidor. As issues #113 e #114 descrevem gerar/consultar e exibir o código, mas não confirmam rota nem resposta. `GET /auth/me` é uma rota real para identidade do gestor, não uma consulta de código.

O JWT do gestor e o token do Agent são credenciais distintas. O frontend não deve reutilizar o token do Agent. `AssociationCodeCard` permanece um componente de apresentação com prop de código; continua fora do Dashboard do MVP e não faz requisições. Não conectar a resposta de `/auth/me` ao card.

## Autorização e isolamento de dados

`get_current_manager` é aplicado em `GET /auth/me`, mas não está aplicado aos routers de `/users/`, `/activities/realtime`, `/dashboard/summary`, exportações nem `/config/`. Essas rotas dependem apenas de `get_db`; `PUT /config/` também não verifica gestor. As consultas de usuários, atividades, resumos e arquivos são globais no código atual, sem vínculo com `Manager`.

Assim, qualquer cliente que alcance a API pode consultar os dados expostos e alterar a configuração global, sujeito apenas à disponibilidade da API. A guarda de rota evita mostrar páginas do gestor sem `/auth/me` válido e os cabeçalhos Bearer estão preparados, mas as rotas acima ignoram autenticação e não filtram por gestor. Filtrar colaboradores na interface não é controle de acesso. Essa limitação e o risco permanecem em B-01/#137 de [Pendências](PENDENCIAS.md); autorização real depende do backend.

## Tasks e jornada diária

Não foi localizado modelo/schema/endpoint de consulta ou gravação persistente de Tasks nem dados confiáveis de primeiro/último registro diário. O `realtime` descreve a última atividade e não substitui a jornada. O Agent não envia `task_id`. O cliente HTTP de produção não chama rotas presumidas nem infere esses dados.

### Rotas de demonstração local — MSW, não contratos do Backend

Quando `import.meta.env.DEV` e `VITE_USE_MOCKS=true`, os handlers MSW oferecem as rotas abaixo para testar a interface. Elas não estão no Backend, não persistem e não devem ser usadas como evidência de integração real:

| Método/rota                                               | Uso somente na demonstração local                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Identidade local de demonstração para navegar pelas rotas protegidas.          |
| `GET /users/`                                             | Catálogo fixo de colaboradores demonstrativos.                                 |
| `GET/POST /tasks`, `PUT/DELETE /tasks/{task_id}`          | CRUD volátil de Tasks para lista, formulário, edição e exclusão.               |
| `GET /dashboard/tasks-summary?date&username&task_id`      | Valida filtros e responde `{ date, timezone, tasks: [] }`, sem criar métricas. |

O payload demonstrativo de Task usa `title`, `description` e `collaborator_ids` na gravação; a resposta contém `id`, `title`, `description`, objetos de `collaborators` e timestamps. Os formatos são candidatos de interface, não schemas aceitos por um servidor. A interface de produção mostra prévia desabilitada e não chama essas rotas. A proposta atual de CRUD e resumo por Task está centralizada em [Pendências](PENDENCIAS.md#propostas-de-contratos-de-integracao).

O resumo por Task é independente dos indicadores gerais e do resumo por categoria. A interface não deriva tempo de categoria, janela ativa ou status realtime. Para implementar a rota real, Backend e Agent ainda precisam definir TaskId persistido, escopo/autorização, fuso e semântica da duração.

Veja I-03 e I-04–I-07 em [Pendências](PENDENCIAS.md).

## Erros, validação e cancelamento

`api.js` produz `ApiError` com tipo, status, texto de status, detalhe quando seguro e causa. O timeout de 15 segundos inclui leitura do corpo; cada método aceita `AbortSignal`. O cancelamento interrompe a espera do cliente, sem reverter uma gravação já processada pelo servidor. Os validadores recusam respostas `2xx` incompatíveis. Exportações aceitam somente CSV/PDF e validam MIME.

Consulte [Arquitetura](ARQUITETURA.md) para o fluxo do cliente e a análise de armazenamento de sessão. Requisitos/issues descrevem necessidades; não bastam para criar endpoints.
