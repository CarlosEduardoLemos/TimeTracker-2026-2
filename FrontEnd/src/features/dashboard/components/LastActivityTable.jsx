import { EmptyState, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { ActivityStatusBadge } from '../../../shared/components/ActivityStatusBadge';

export function formatLastRead(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  if (seconds < 60) return `${Math.floor(seconds)}s atrás`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}min atrás` : `${hours}h atrás`;
}

function lastRead(person) {
  return person.realtime ? formatLastRead(person.realtime.seconds_since_last_activity) : '—';
}

export function LastActivityTable({ people, loading, available }) {
  return (
    <article className="card min-w-0" aria-busy={loading}>
      <h2 className="font-bold">Última atividade</h2>
      <p className="mt-1 text-xs muted">
        Esta tabela é atual e não segue o filtro de data do resumo.
      </p>
      {loading ? (
        <LoadingSkeleton label="Carregando atividade…" lines={4} />
      ) : !available ? (
        <EmptyState>Dados de atividade indisponíveis.</EmptyState>
      ) : !people.length ? (
        <EmptyState>Nenhum usuário encontrado.</EmptyState>
      ) : (
        <>
          <div
            className="mt-4 grid gap-3 sm:hidden"
            aria-label="Última atividade dos usuários cadastrados"
          >
            {people.map((person) => (
              <div
                key={person.username}
                className="rounded-lg border border-line p-3 text-sm dark:border-slate-700"
              >
                <h3 className="font-semibold">{person.full_name || person.username}</h3>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                  <dt className="muted">Estado</dt>
                  <dd>
                    <ActivityStatusBadge person={person} />
                  </dd>
                  <dt className="muted">Aplicação</dt>
                  <dd>{person.realtime?.process_name || '—'}</dd>
                  <dt className="muted">Última leitura</dt>
                  <dd>{lastRead(person)}</dd>
                </dl>
              </div>
            ))}
          </div>
          <div
            className="mt-4 hidden overflow-x-auto sm:block"
            tabIndex="0"
            aria-label="Tabela de última atividade com rolagem horizontal"
          >
            <table className="w-full min-w-[580px] text-left text-sm">
              <caption className="sr-only">Última atividade dos usuários cadastrados</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="py-2">
                    Usuário
                  </th>
                  <th scope="col">Estado</th>
                  <th scope="col">Aplicação</th>
                  <th scope="col">Última leitura</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr
                    key={person.username}
                    className="border-b border-slate-100 dark:border-slate-800"
                  >
                    <th scope="row" className="py-3 font-semibold">
                      {person.full_name || person.username}
                    </th>
                    <td>
                      <ActivityStatusBadge person={person} />
                    </td>
                    <td>{person.realtime?.process_name || '—'}</td>
                    <td>{lastRead(person)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </article>
  );
}
