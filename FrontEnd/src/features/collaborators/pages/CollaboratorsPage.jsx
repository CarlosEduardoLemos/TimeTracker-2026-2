import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { useCollaboratorsData } from '../hooks/useCollaboratorsData';
import { CollaboratorsTable } from '../components/CollaboratorsTable';

export function CollaboratorsPage() {
  const { loading, users, realtime, error, people, refresh } = useCollaboratorsData();
  return (
    <>
      <PageHeader title="Colaboradores" description="Usuários cadastrados na API atual." />
      <IntegrationNotice>
        RF-03/RF-05 exigem código de associação e lista restrita ao gestor autenticado. A API atual
        retorna todos os usuários. Online, Ausente e Offline são estados calculados pela API a
        partir da captura e de sua inatividade; eles não confirmam a conexão do Agent. “Sem dados”
        indica que o usuário não consta na janela realtime de até 24 horas.
      </IntegrationNotice>
      {error && (
        <ErrorNotice className="mt-5" onRetry={refresh}>
          {error}
        </ErrorNotice>
      )}
      <section className="card mt-5" aria-busy={loading}>
        {loading ? (
          <LoadingSkeleton label="Carregando colaboradores…" lines={5} />
        ) : users && !users.length ? (
          <EmptyState>Nenhum usuário cadastrado.</EmptyState>
        ) : !users ? (
          <EmptyState>Lista indisponível.</EmptyState>
        ) : (
          <CollaboratorsTable people={people} realtimeAvailable={!!realtime} />
        )}
      </section>
    </>
  );
}
