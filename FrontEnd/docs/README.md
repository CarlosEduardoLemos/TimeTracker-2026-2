# Documentação do Frontend

Use este índice para localizar informações sobre o estado atual, a arquitetura e a manutenção do frontend.

## Estado atual

- [Funcionalidades](FUNCIONALIDADES.md): telas, comportamentos disponíveis e relação com os requisitos.
- [Pendências](PENDENCIAS.md): bloqueios organizados por área, impacto, prioridade e workaround.
- [Plano de execução](PLANO_EXECUCAO_FRONTEND.md): auditoria inicial, dependências, prioridades e validações desta revisão.
- [Matriz de issues](MATRIZ_ISSUES_FRONTEND.md): inventário oficial e classificação técnica das 38 issues consultadas.
- [Relatório da execução](RELATORIO_EXECUCAO_FRONTEND.md): mudanças, resultados reais dos testes, limites e próximos passos.

O frontend integra cadastro/login JWT, restauração em `sessionStorage`, logout e guarda de páginas após validar `/auth/me`. As rotas de dados do backend ainda não exigem JWT nem isolam equipes; consulte B-01 e [Pendências](PENDENCIAS.md). A PR #128 do frontend permanece aberta nesta auditoria; as mudanças locais ainda não estão no `upstream/main`. A PR #122 do Agent foi integrada, mas o backend deste checkout ainda não apresenta geração/consulta de código, `POST /associate/` ou persistência do vínculo. O card visual permanece oculto.

## Arquitetura e contratos

- [Arquitetura](ARQUITETURA.md): estrutura do código, camadas, fluxo da aplicação, estado e decisões arquiteturais.
- [Contratos da API](CONTRATOS_API.md): endpoints consumidos, parâmetros, respostas, validação e comportamento do cliente HTTP.
- [Pendências](PENDENCIAS.md#propostas-de-contratos-de-integracao): inclui o status por ID e as propostas de contratos ainda não implementadas para Tasks, associação, jornada diária, agregações, autorização e fusos.

## Testes e histórico

- [Testes](TESTES.md): verificações automatizadas, evidências e roteiros manuais.
- [Alterações](ALTERACOES.md): histórico cronológico e resumo das revisões.

Atualize o documento correspondente quando mudar uma tela, uma decisão técnica, um contrato ou o resultado de uma verificação. Este índice serve como entrada e não duplica o conteúdo desses documentos.
