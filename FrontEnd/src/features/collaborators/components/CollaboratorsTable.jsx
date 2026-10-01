import { ActivityStatusBadge } from '../../../shared/components/ActivityStatusBadge';
import { CollaboratorCard } from './CollaboratorCard';

export function CollaboratorsTable({ people, realtimeAvailable }) {
  return (
    <>
      <div className="grid gap-3 sm:hidden" aria-label="Usuários cadastrados na API">
        {people.map((person) => (
          <CollaboratorCard
            key={person.username}
            person={person}
            realtimeAvailable={realtimeAvailable}
          />
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
            {people.map((person) => (
              <tr key={person.username} className="border-t border-slate-100 dark:border-slate-800">
                <th scope="row" className="py-3 font-semibold">
                  {person.username}
                </th>
                <td>{person.full_name || '—'}</td>
                <td>{person.department || '—'}</td>
                <td>
                  <ActivityStatusBadge person={person} available={realtimeAvailable} />
                </td>
                <td>{person.realtime?.process_name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
