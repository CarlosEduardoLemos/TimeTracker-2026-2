import { AVATAR_COLOR_PALETTE, USER_STATUS_LABELS } from '../constants/ui';
import { formatRelativeActivityTime } from '../../shared/lib/dashboard';
import { Card } from './Card';
import { SectionHeading } from './SectionHeading';

function buildPeopleRows(realtimePeople) {
  const people = Array.isArray(realtimePeople) ? realtimePeople : [];

  return people.map((person, index) => {
    const username = String(person.username || 'Desconhecido');

    return {
      username,
      initials: username.slice(0, 2).toUpperCase(),
      statusLabel: USER_STATUS_LABELS[person.status] || 'Ausente',
      isOnline: person.status === 'online',
      applicationName: person.process_name || '—',
      lastActivityLabel: formatRelativeActivityTime(person.seconds_since_last_activity),
      avatarColor: AVATAR_COLOR_PALETTE[index % AVATAR_COLOR_PALETTE.length],
    };
  });
}

/**
 * Visão resumida da equipe usando somente os campos necessários ao painel.
 */
export function PeopleCard({ realtimePeople = [], loading = false, unavailable = false }) {
  const peopleRows = buildPeopleRows(realtimePeople);

  return (
    <Card id="equipe" className="overflow-hidden p-5 lg:col-span-2">
      <SectionHeading
        title="Status da equipe"
        description="Última leitura dos colaboradores retornados pela API"
      />
      <div
        className="-mx-5 mt-5 overflow-x-auto focus-visible:outline-2 focus-visible:outline-brand"
        tabIndex={0}
        aria-label="Tabela de status da equipe com rolagem horizontal"
      >
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Status atual da equipe</caption>
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-muted dark:bg-slate-800">
              <th scope="col" className="px-5 py-2.5">
                Colaborador
              </th>
              <th scope="col" className="px-5 py-2.5">
                Status
              </th>
              <th scope="col" className="px-5 py-2.5">
                Task ativa
              </th>
              <th scope="col" className="px-5 py-2.5">
                Aplicação atual
              </th>
              <th scope="col" className="px-5 py-2.5">
                Última leitura
              </th>
            </tr>
          </thead>
          <tbody>
            {peopleRows.length ? (
              peopleRows.map((person) => (
                <tr
                  key={person.username}
                  className="border-t border-slate-100 text-[11px] text-muted dark:border-slate-700"
                >
                  <td className="px-5 py-3">
                    <div className="flex min-w-[155px] items-center gap-2">
                      <div className={`avatar ${person.avatarColor}`} aria-hidden="true">
                        {person.initials}
                      </div>
                      <strong className="text-xs text-ink dark:text-white">
                        {person.username}
                      </strong>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`flex items-center gap-1.5 font-bold ${
                        person.isOnline
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}
                    >
                      <i className="status-dot" aria-hidden="true" />
                      {person.statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span aria-label="Task ativa indisponível na API atual">—</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-ink dark:text-white">
                    {person.applicationName}
                  </td>
                  <td className="px-5 py-3">{person.lastActivityLabel}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-xs text-muted">
                  {loading
                    ? 'Consultando status da equipe…'
                    : unavailable
                      ? 'Status da equipe temporariamente indisponível.'
                      : 'Nenhum colaborador foi retornado para o filtro atual.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Task ativa, início da task e tempo registrado na task atual dependem de dados ainda não
        fornecidos pela API.
      </p>
    </Card>
  );
}
