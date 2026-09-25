import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { deriveTeam, validRealtime, validUsers } from '../utils/dashboard';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function CollaboratorsPage() {
  const [state, setState] = useState({ loading: true, users: null, realtime: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    Promise.allSettled([api.users(controller.signal), api.realtime(controller.signal)]).then(([users, realtime]) => {
      if (controller.signal.aborted) return;
      setState({
        loading: false,
        users: users.status === 'fulfilled' && validUsers(users.value) ? users.value : null,
        realtime: realtime.status === 'fulfilled' && validRealtime(realtime.value) ? realtime.value : null,
        error: users.status === 'rejected' || realtime.status === 'rejected' ||
          (users.status === 'fulfilled' && !validUsers(users.value)) ||
          (realtime.status === 'fulfilled' && !validRealtime(realtime.value))
          ? 'Alguns dados estão indisponíveis.' : null,
      });
    });
    return () => controller.abort();
  }, []);
  const rows = state.users && state.realtime ? deriveTeam(state.users, state.realtime) : state.users || [];
  return <>
    <PageHeader title="Colaboradores" description="Usuários cadastrados na API atual." />
    <IntegrationNotice>RF-03/RF-05 exigem código de associação e lista restrita ao gestor autenticado. A API atual retorna todos os usuários; o estado de conexão do Agente não está disponível.</IntegrationNotice>
    {state.error && <p role="alert" className="mt-5 text-sm text-red-700">{state.error}</p>}
    <section className="card mt-5"><div className="overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead><tr><th scope="col" className="pb-3">Usuário</th><th scope="col">Nome</th><th scope="col">Departamento</th><th scope="col">Última atividade</th><th scope="col">Aplicação</th></tr></thead><tbody>{rows.map(person => <tr key={person.username} className="border-t border-slate-100 dark:border-slate-800"><th scope="row" className="py-3 font-semibold">{person.username}</th><td>{person.full_name || '—'}</td><td>{person.department || '—'}</td><td>{!state.realtime ? 'Indisponível' : person.status === 'offline' ? 'Sem leitura recente' : person.status}</td><td>{person.realtime?.process_name || '—'}</td></tr>)}</tbody></table>{state.loading && <p role="status" className="py-6 text-center muted">Carregando…</p>}{!state.loading && state.users && !state.users.length && <p className="py-6 text-center muted">Nenhum usuário cadastrado.</p>}{!state.loading && !state.users && <p className="py-6 text-center muted">Lista indisponível.</p>}</div></section>
  </>;
}
