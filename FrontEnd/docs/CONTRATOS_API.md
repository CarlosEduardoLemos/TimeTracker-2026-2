# Contratos da API do Frontend

Revisado em **13/10/2026** com base nos arquivos locais de `backend/app/` e no código de `FrontEnd/src/shared/api/`. A PR #122 do Agent e a PR #123 de autenticação foram incorporadas à `main` da organização conforme os commits informados. A existência de um contrato no backend não significa que a interface web o consuma.

## Rotas usadas pelas telas do frontend

`VITE_API_URL` define a origem da API; sem configuração, o cliente usa `http://localhost:8000`. As telas chamam as rotas abaixo sem token e sem cookie de sessão.

| Método e rota               | Parâmetros/corpo                                                                | Resposta                                                                                            | Consumidor                         |
| --------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `GET /users/`               | Nenhum                                                                          | Array de `UserOut`                                                                                  | Painel, Colaboradores e Relatórios |
| `GET /activities/realtime`  | Nenhum                                                                          | Array de `RealtimeEntry`                                                                            | Painel e Colaboradores             |
| `GET /dashboard/summary`    | `date` obrigatório (`AAAA-MM-DD`); `username` opcional                          | `{ date, users: [{ username, total_seconds, by_category: [{ category, color, total_seconds }] }] }` | Painel                             |
| `GET /dashboard/export/csv` | Mesmos filtros do resumo                                                        | `text/csv`                                                                                          | Relatórios                         |
| `GET /dashboard/export/pdf` | Mesmos filtros do resumo                                                        | `application/pdf`                                                                                   | Relatórios                         |
| `GET /config/`              | Nenhum                                                                          | `{ capture_interval_seconds, idle_timeout_seconds, updated_at? }`                                   | Configurações                      |
| `PUT /config/`              | JSON com `capture_interval_seconds` e `idle_timeout_seconds` inteiros positivos | Objeto de configuração                                                                              | Configurações                      |

Essas chamadas continuam sem cabeçalho `Authorization`. O parâmetro `username` filtra uma consulta; não impõe autorização ou isolamento no servidor.

## Autenticação de gestor implementada no backend

O backend implementa cadastro, login JWT e consulta do gestor. O cliente HTTP agora oferece métodos isolados para esses contratos, mas as telas `#/login` e `#/cadastro` continuam informativas: nenhuma chamada de autenticação é feita durante a navegação e as rotas do MVP não são protegidas.

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

### Métodos preparados na camada HTTP do frontend

`api.registerManager(credentials, signal)`, `api.loginManager(credentials, signal)` e `api.getCurrentManager(accessToken, signal)` chamam os contratos acima e validam as respostas. Reutilizam `ApiError`, timeout de 15 segundos e `AbortSignal`. Os erros dessas chamadas preservam status, mas omitem detalhes fornecidos pelo servidor para evitar refletir credenciais ou tokens em mensagens. Resposta incompatível é `invalid-response`.

Os métodos não armazenam JWT, não renovam sessão, não adicionam Bearer automaticamente às rotas de dados e não implementam logout, estado de autenticação ou proteção de navegação. O token de login só fica sob controle do chamador.

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

Assim, qualquer cliente que alcance a API pode consultar os dados expostos e alterar a configuração global, sujeito apenas à disponibilidade da API. Filtrar colaboradores na interface não é controle de acesso. A autenticação implementada não comprova isolamento por gestor nem protege automaticamente os endpoints existentes; essa limitação e o risco permanecem em B-01/I-02 de [Pendências](PENDENCIAS.md). O frontend não corrige isso localmente.

## Tasks e jornada diária

Não foi localizado modelo/schema/endpoint de consulta ou gravação persistente de Tasks nem dados confiáveis de primeiro/último registro diário. O `realtime` descreve a última atividade e não substitui a jornada. O Agent não envia `task_id`. O frontend não chama rotas presumidas nem inventa esses dados; veja I-03 e I-04–I-07 em [Pendências](PENDENCIAS.md).

## Erros, validação e cancelamento

`api.js` produz `ApiError` com tipo, status, texto de status, detalhe quando seguro e causa. O timeout de 15 segundos inclui leitura do corpo; cada método aceita `AbortSignal`. O cancelamento interrompe a espera do cliente, sem reverter uma gravação já processada pelo servidor. Os validadores recusam respostas `2xx` incompatíveis. Exportações aceitam somente CSV/PDF e validam MIME.

Consulte [Arquitetura](ARQUITETURA.md) para o fluxo do cliente e a análise de armazenamento de sessão. Requisitos/issues descrevem necessidades; não bastam para criar endpoints.
