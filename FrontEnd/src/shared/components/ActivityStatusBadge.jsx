import { formatActivityStatus } from '../lib/activityStatus';

const colors = {
  online: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200',
  ausente: 'bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  offline: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  'no-data': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  unavailable: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export function ActivityStatusBadge({ person, available = true }) {
  const status = available ? person.status : 'unavailable';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${colors[status] || colors.unavailable}`}
    >
      <span aria-hidden="true" className="text-[9px]">
        ●
      </span>
      {formatActivityStatus(person, available)}
    </span>
  );
}
