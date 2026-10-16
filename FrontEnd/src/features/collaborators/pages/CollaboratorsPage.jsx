import { useMemo, useState } from 'react';
import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { useCollaboratorsData } from '../hooks/useCollaboratorsData';
import { CollaboratorsTable } from '../components/CollaboratorsTable';
import { CollaboratorFilters } from '../components/CollaboratorFilters';
import { getRealtimeProcessOptions } from '../../../shared/lib/processFilter';
import { filterCollaborators } from '../lib/agentFilters';

export function CollaboratorsPage() {
  const { loading, users, realtime, error, people, refresh } = useCollaboratorsData();
  const [filters, setFilters] = useState({ query: '', status: '', process: '', sort: 'name' });
  const realtimeAvailable = Boolean(realtime);
  const processOptions = useMemo(() => getRealtimeProcessOptions(people), [people]);
  const visiblePeople = useMemo(
    () => filterCollaborators(people, { ...filters, realtimeAvailable }),
    [people, filters, realtimeAvailable],
  );
  const hasFilters = Boolean(filters.query || filters.status || filters.process);

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters((current) => ({ ...current, query: '', status: '', process: '' }));
  }

  return (
    <>
      <PageHeader
        title="Colaboradores"
        description="Estado e última leitura informados pela atividade mais recente da API."
        actions={
          <button type="button" className="secondary-button" onClick={refresh} disabled={loading}>
            {loading ? 'Atualizando…' : 'Atualizar'}
          </button>
        }
      />
      <IntegrationNotice>
        RF-03/RF-05 exigem código de associação e lista restrita ao gestor autenticado. A API atual
        retorna todos os usuários. Online, Ausente e Offline são estados calculados pela API a
        partir da captura e de sua inatividade; eles não confirmam a conexão do Agent. “Sem dados”
        indica que o usuário não consta na janela realtime de até 24 horas. “Última leitura” é o
        tempo desde a captura informada, não uma confirmação de sincronização ou contato atual.
      </IntegrationNotice>
      {error && (
        <ErrorNotice className="mt-5" onRetry={refresh}>
          {error}
        </ErrorNotice>
      )}
      {users?.length > 0 && (
        <CollaboratorFilters
          query={filters.query}
          onQueryChange={(value) => updateFilter('query', value)}
          status={filters.status}
          onStatusChange={(value) => updateFilter('status', value)}
          process={filters.process}
          onProcessChange={(value) => updateFilter('process', value)}
          sort={filters.sort}
          onSortChange={(value) => updateFilter('sort', value)}
          processOptions={processOptions}
          processAvailable={realtimeAvailable}
          resultCount={visiblePeople.length}
          totalCount={people.length}
          hasFilters={hasFilters}
          onClear={clearFilters}
        />
      )}
      <section className="card mt-5" aria-busy={loading}>
        {loading ? (
          <LoadingSkeleton label="Carregando colaboradores…" lines={5} />
        ) : users && !users.length ? (
          <EmptyState>Nenhum usuário cadastrado.</EmptyState>
        ) : !users ? (
          <EmptyState>Lista indisponível.</EmptyState>
        ) : !visiblePeople.length ? (
          <EmptyState>Nenhum colaborador corresponde aos filtros aplicados.</EmptyState>
        ) : (
          <CollaboratorsTable people={visiblePeople} realtimeAvailable={realtimeAvailable} />
        )}
      </section>
    </>
  );
}
