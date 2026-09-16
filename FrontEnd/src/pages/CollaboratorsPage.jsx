import { EmptyState } from "../components/EmptyState";
import { IntegrationNotice } from "../components/IntegrationNotice";
import { PageHeader } from "../components/PageHeader";

export function CollaboratorsPage() {
  return (
    <>
      <PageHeader
        title="Colaboradores"
        description="Consulte a equipe associada e acesse as configurações individuais de acompanhamento."
        actions={
          <button type="button" className="primary-button" disabled aria-describedby="association-api-note">
            Gerar código de associação
          </button>
        }
      />

      <div id="association-api-note">
        <IntegrationNotice>
          RF-03 e RF-05 dependem de endpoints para gerar o código numérico de 6 dígitos e listar somente os colaboradores associados ao gestor autenticado. Nenhum código é gerado localmente para evitar associação fictícia ou insegura.
        </IntegrationNotice>
      </div>

      <section className="mt-5" aria-labelledby="team-heading">
        <h2 id="team-heading" className="sr-only">Equipe associada</h2>
        <EmptyState
          title="Equipe indisponível até a integração"
          description="Quando a API de colaboradores associados estiver disponível, esta área exibirá status Online/Offline, task atual, atividade/inatividade, jornada e indicação de possível hora extra conforme os requisitos."
        />
      </section>
    </>
  );
}
