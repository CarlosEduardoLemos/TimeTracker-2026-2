# Documentação do Frontend

Use este índice para localizar informações sobre o estado atual, a arquitetura e a manutenção do frontend.

## Estado atual

- [Funcionalidades](FUNCIONALIDADES.md): telas, comportamentos disponíveis e relação com os requisitos.
- [Pendências](PENDENCIAS.md): bloqueios organizados por área, impacto, prioridade e workaround.

O backend implementa cadastro/login JWT e `GET /auth/me`; métodos HTTP correspondentes estão preparados, mas o frontend não iniciou integração de sessão e o login continua adiado no MVP. A PR #122 do Agent foi integrada. O backend deste checkout ainda não apresenta geração/consulta de código, `POST /associate/` ou persistência do vínculo. O card visual permanece oculto e não representa integração ponta a ponta.

## Arquitetura e contratos

- [Arquitetura](ARQUITETURA.md): estrutura do código, camadas, fluxo da aplicação, estado e decisões arquiteturais.
- [Contratos da API](CONTRATOS_API.md): endpoints consumidos, parâmetros, respostas, validação e comportamento do cliente HTTP.

## Testes e histórico

- [Testes](TESTES.md): verificações automatizadas, evidências e roteiros manuais.
- [Alterações](ALTERACOES.md): histórico cronológico e resumo das revisões.

Atualize o documento correspondente quando mudar uma tela, uma decisão técnica, um contrato ou o resultado de uma verificação. Este índice serve como entrada e não duplica o conteúdo desses documentos.
