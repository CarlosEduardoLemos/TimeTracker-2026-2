import { ActivityStatusBadge } from '../../../shared/components/ActivityStatusBadge';

export function CollaboratorCard({ person, realtimeAvailable }) {
  return (
    <article className="rounded-lg border border-line p-3 text-sm dark:border-slate-700">
      <h2 className="font-semibold">{person.full_name || person.username}</h2>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="muted">Usuário</dt>
        <dd>{person.username}</dd>
        <dt className="muted">Departamento</dt>
        <dd>{person.department || '—'}</dd>
        <dt className="muted">Última atividade</dt>
        <dd>
          <ActivityStatusBadge person={person} available={realtimeAvailable} />
        </dd>
        <dt className="muted">Aplicação</dt>
        <dd>{person.realtime?.process_name || '—'}</dd>
      </dl>
    </article>
  );
}
