import { formatDuration } from '../utils/dashboard';
import { Card } from './Card';
import { SectionHeading } from './SectionHeading';

/**
 * Activity Timeline conforme RF-27/CA-10.
 *
 * Estrutura esperada por item:
 * { id, application, startedAt, endedAt, durationSeconds, state, task, inScope }
 *
 * A API atual ainda não fornece esses campos; por isso o componente possui
 * um empty state explícito e não utiliza fixtures de demonstração.
 */
export function TimelineCard({ activities = [] }) {
  return (
    <Card id="timeline" className="min-h-[257px] lg:col-span-1">
      <SectionHeading
        title="Activity Timeline"
        description="Sequência das atividades registradas na task"
        action={<span className="text-xs text-muted">RF-27</span>}
      />

      {activities.length ? (
        <ol className="mt-5 grid gap-3" aria-label="Linha do tempo de atividades">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="rounded-lg border border-line p-3 text-xs dark:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-ink dark:text-white">
                  {activity.application || 'Aplicação não informada'}
                </strong>
                <span className="text-muted">{activity.state || 'Estado não informado'}</span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-muted">
                <div>
                  <dt className="sr-only">Início</dt>
                  <dd>Início: {activity.startedAt || '—'}</dd>
                </div>
                <div>
                  <dt className="sr-only">Fim</dt>
                  <dd>Fim: {activity.endedAt || '—'}</dd>
                </div>
                <div>
                  <dt className="sr-only">Duração</dt>
                  <dd>Duração: {formatDuration(activity.durationSeconds)}</dd>
                </div>
                <div>
                  <dt className="sr-only">Escopo</dt>
                  <dd>
                    Escopo:{' '}
                    {activity.inScope === true
                      ? 'Dentro'
                      : activity.inScope === false
                        ? 'Fora'
                        : '—'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="sr-only">Task</dt>
                  <dd>Task: {activity.task || '—'}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-5 grid min-h-[150px] place-items-center rounded-lg bg-slate-50 px-5 text-center text-xs leading-relaxed text-muted dark:bg-slate-800/60">
          <p>
            A API atual ainda não disponibiliza períodos de atividade associados a uma task com
            início, término, estado Ativo/Inativo e classificação dentro/fora do escopo.
          </p>
        </div>
      )}
    </Card>
  );
}
