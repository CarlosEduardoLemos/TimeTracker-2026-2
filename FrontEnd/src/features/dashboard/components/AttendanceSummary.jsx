import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { useAttendanceData } from '../hooks/useAttendanceData';
import { formatAttendanceTime, isCurrentDateInTimezone } from '../lib/attendance';

function UnavailableAttendance() {
  return (
    <section className="card" aria-labelledby="attendance-title">
      <h2 id="attendance-title" className="text-lg font-bold">
        Entrada e último registro
      </h2>
      <div className="mt-3">
        <IntegrationNotice>
          Indisponível pelo backend. O resumo de jornada não é inferido da atividade em tempo real.
        </IntegrationNotice>
      </div>
    </section>
  );
}

function MockAttendance({ devApi, date, username }) {
  const { data, loading, error, refresh } = useAttendanceData(devApi, date, username);

  return (
    <section className="card" aria-labelledby="attendance-title" data-mock-only="true">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="attendance-title" className="text-lg font-bold">
          Entrada e último registro
        </h2>
        {data && <p className="text-xs muted">Fuso: {data.timezone}</p>}
      </div>
      {error && (
        <ErrorNotice className="mt-3" onRetry={refresh}>
          Fonte de jornada indisponível. {error}
        </ErrorNotice>
      )}
      {loading ? (
        <LoadingSkeleton label="Carregando jornada diária…" />
      ) : data?.users.length === 0 ? (
        <EmptyState>Nenhum colaborador encontrado para os filtros selecionados.</EmptyState>
      ) : data ? (
        <div className="mt-3 overflow-x-auto" tabIndex="0" aria-label="Tabela de jornada diária">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <caption className="sr-only">
              Primeiro e último registro diário, no fuso informado pela API
            </caption>
            <thead className="border-b border-line text-xs uppercase tracking-wide muted dark:border-slate-700">
              <tr>
                <th className="py-2 pr-3" scope="col">
                  Colaborador
                </th>
                <th className="py-2 px-3" scope="col">
                  Primeiro registro
                </th>
                <th className="py-2 px-3" scope="col">
                  Último registro
                </th>
                <th className="py-2 pl-3" scope="col">
                  Situação
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-slate-700">
              {data?.users.map((person) => {
                const hasRecord = person.first_activity_at || person.last_activity_at;
                const currentDay = isCurrentDateInTimezone(
                  data.date,
                  data.timezone,
                  new Date(data.as_of),
                );
                return (
                  <tr key={person.username}>
                    <th className="py-3 pr-3 font-semibold" scope="row">
                      {person.username}
                    </th>
                    <td className="px-3 py-3">
                      {formatAttendanceTime(person.first_activity_at, data.timezone)}
                    </td>
                    <td className="px-3 py-3">
                      {formatAttendanceTime(person.last_activity_at, data.timezone)}
                    </td>
                    <td className="py-3 pl-3">
                      {!hasRecord
                        ? 'Sem registro'
                        : currentDay
                          ? 'Dia em andamento'
                          : 'Registros do dia'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      <p className="mt-3 text-xs muted">
        O último horário representa um registro recebido; não confirma saída nem jornada concluída.
      </p>
    </section>
  );
}

export function AttendanceSummary({ devApi = null, date, username }) {
  return import.meta.env.DEV && devApi ? (
    <MockAttendance devApi={devApi} date={date} username={username} />
  ) : (
    <UnavailableAttendance />
  );
}
