import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { deriveTeam } from '../../../shared/lib/dashboard';
import { requestFailure } from '../../../shared/lib/requestFailure';
import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { ActivityStatusBadge } from '../../../shared/components/ActivityStatusBadge';

export function CollaboratorsPage() {
  const [state, setState] = useState({ loading: true, users: null, realtime: null, error: null });
  const active = useRef(null);
  const load = useCallback(() => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    Promise.allSettled([api.users(controller.signal), api.realtime(controller.signal)]).then(
      ([users, realtime]) => {
        if (controller.signal.aborted) return;
        setState({
          loading: false,
          users: users.status === 'fulfilled' ? users.value : null,
          realtime: realtime.status === 'fulfilled' ? realtime.value : null,
          error:
            [
              requestFailure(users, users.status === 'fulfilled', 'Usuários'),
              requestFailure(realtime, realtime.status === 'fulfilled', 'Atividade'),
            ]
              .filter(Boolean)
              .join('; ') || null,
        });
      },
    );
  }, []);
  useEffect(() => {
    load();
    return () => active.current?.abort();
  }, [load]);
  const rows =
    state.users && state.realtime ? deriveTeam(state.users, state.realtime) : state.users || [];
  return (
    <>
      <PageHeader title="Colaboradores" description="Usuários cadastrados na API atual." />
      <IntegrationNotice>
        RF-03/RF-05 exigem código de associação e lista restrita ao gestor autenticado. A API atual
        retorna todos os usuários; o estado de conexão do Agente não está disponível.
      </IntegrationNotice>
      {state.error && (
        <ErrorNotice className="mt-5" onRetry={load}>
          {state.error}
        </ErrorNotice>
      )}
      <section className="card mt-5" aria-busy={state.loading}>
        {state.loading ? (
          <LoadingSkeleton label="Carregando colaboradores…" lines={5} />
        ) : state.users && !state.users.length ? (
          <EmptyState>Nenhum usuário cadastrado.</EmptyState>
        ) : !state.users ? (
          <EmptyState>Lista indisponível.</EmptyState>
        ) : (
          <>
            <div className="grid gap-3 sm:hidden" aria-label="Usuários cadastrados na API">
              {rows.map((person) => (
                <article
                  key={person.username}
                  className="rounded-lg border border-line p-3 text-sm dark:border-slate-700"
                >
                  <h2 className="font-semibold">{person.full_name || person.username}</h2>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <dt className="muted">Usuário</dt>
                    <dd>{person.username}</dd>
                    <dt className="muted">Departamento</dt>
                    <dd>{person.department || '—'}</dd>
                    <dt className="muted">Última atividade</dt>
                    <dd>
                      <ActivityStatusBadge person={person} available={!!state.realtime} />
                    </dd>
                    <dt className="muted">Aplicação</dt>
                    <dd>{person.realtime?.process_name || '—'}</dd>
                  </dl>
                </article>
              ))}
            </div>
            <div
              className="hidden overflow-x-auto sm:block"
              tabIndex="0"
              aria-label="Tabela de colaboradores com rolagem horizontal"
            >
              <table className="w-full min-w-[580px] text-left text-sm">
                <caption className="sr-only">Usuários cadastrados na API</caption>
                <thead>
                  <tr>
                    <th scope="col" className="pb-3">
                      Usuário
                    </th>
                    <th scope="col">Nome</th>
                    <th scope="col">Departamento</th>
                    <th scope="col">Última atividade</th>
                    <th scope="col">Aplicação</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((person) => (
                    <tr
                      key={person.username}
                      className="border-t border-slate-100 dark:border-slate-800"
                    >
                      <th scope="row" className="py-3 font-semibold">
                        {person.username}
                      </th>
                      <td>{person.full_name || '—'}</td>
                      <td>{person.department || '—'}</td>
                      <td>
                        <ActivityStatusBadge person={person} available={!!state.realtime} />
                      </td>
                      <td>{person.realtime?.process_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}
