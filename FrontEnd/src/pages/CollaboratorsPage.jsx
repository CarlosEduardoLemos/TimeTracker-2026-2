import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { deriveTeam, validRealtime, validUsers } from '../utils/dashboard';
import { requestFailure } from '../utils/requestFailure';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

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
          users: users.status === 'fulfilled' && validUsers(users.value) ? users.value : null,
          realtime:
            realtime.status === 'fulfilled' && validRealtime(realtime.value)
              ? realtime.value
              : null,
          error:
            [
              requestFailure(
                users,
                users.status === 'fulfilled' && validUsers(users.value),
                'Usuários',
              ),
              requestFailure(
                realtime,
                realtime.status === 'fulfilled' && validRealtime(realtime.value),
                'Atividade',
              ),
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
        <div role="alert" className="mt-5 text-sm text-red-700 dark:text-red-300">
          {state.error}{' '}
          <button className="ml-2 font-semibold underline" onClick={load} disabled={state.loading}>
            Tentar novamente
          </button>
        </div>
      )}
      <section className="card mt-5" aria-busy={state.loading}>
        <div
          className="overflow-x-auto"
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
              {!state.loading &&
                rows.map((person) => (
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
                      {!state.realtime
                        ? 'Indisponível'
                        : person.status === 'offline'
                          ? 'Sem leitura recente'
                          : person.status}
                    </td>
                    <td>{person.realtime?.process_name || '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {state.loading && (
            <p role="status" className="py-6 text-center muted">
              Carregando…
            </p>
          )}
          {!state.loading && state.users && !state.users.length && (
            <p className="py-6 text-center muted">Nenhum usuário cadastrado.</p>
          )}
          {!state.loading && !state.users && (
            <p className="py-6 text-center muted">Lista indisponível.</p>
          )}
        </div>
      </section>
    </>
  );
}
