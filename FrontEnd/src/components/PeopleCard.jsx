import { AVATAR_COLOR_PALETTE, USER_STATUS_LABELS } from "../constants/ui";
import { formatRelativeActivityTime } from "../utils/dashboard";
import { Card } from "./Card";
import { SectionHeading } from "./SectionHeading";

/**
 * Visão resumida da equipe.
 *
 * A API atual ainda não fornece task ativa, início e tempo acumulado da task.
 * Esses campos permanecem visíveis como indisponíveis para refletir o contrato
 * necessário sem inferir dados inexistentes.
 */
export function PeopleCard({ realtimePeople = [] }) {
  const people = realtimePeople.map((person, index) => {
    const username = String(person.username || "Desconhecido");
    const secondsSinceLastActivity = Math.max(
      0,
      Number(person.seconds_since_last_activity) || 0,
    );
    const statusLabel =
      USER_STATUS_LABELS[person.status] ||
      (person.status === "online" ? "Online" : "Ausente");
    const avatarColor = AVATAR_COLOR_PALETTE[index % AVATAR_COLOR_PALETTE.length];

    return {
      username,
      initials: username.slice(0, 2).toUpperCase(),
      statusLabel,
      application: person.process_name || "—",
      updated: formatRelativeActivityTime(secondsSinceLastActivity),
      avatarColor,
    };
  });

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
          <thead>
            <tr className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400 dark:bg-slate-800">
              <th className="px-5 py-2.5">Colaborador</th>
              <th className="px-5 py-2.5">Status</th>
              <th className="px-5 py-2.5">Task ativa</th>
              <th className="px-5 py-2.5">Aplicação atual</th>
              <th className="px-5 py-2.5">Última leitura</th>
            </tr>
          </thead>
          <tbody>
            {people.length ? (
              people.map((person) => (
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
                        person.statusLabel === "Online"
                          ? "text-emerald-600"
                          : "text-amber-600"
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
                    {person.application}
                  </td>
                  <td className="px-5 py-3">{person.updated}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-xs text-muted">
                  Nenhum colaborador foi retornado para o filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-muted">
        Task ativa, início da task e tempo registrado na task atual dependem de dados ainda não fornecidos pela API.
      </p>
    </Card>
  );
}
