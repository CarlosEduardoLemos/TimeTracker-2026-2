import { todayIso } from '../../../shared/lib/dashboard';

export function ReportFilters({
  date,
  onDateChange,
  username,
  onUsernameChange,
  users,
  loadingUsers,
  exporting,
}) {
  const today = todayIso();
  return (
    <>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold muted">
          Data
          <input
            type="date"
            className="form-field mt-1"
            value={date}
            max={today}
            disabled={!!exporting}
            onChange={(event) => event.target.value && onDateChange(event.target.value)}
          />
        </label>
        <label className="text-xs font-semibold muted">
          Usuário
          <select
            className="form-field mt-1"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            disabled={loadingUsers || !users || !!exporting}
          >
            <option value="">Todos os usuários</option>
            {username && !(users || []).some((user) => user.username === username) && (
              <option value={username}>{username} (selecionado)</option>
            )}
            {(users || []).map((user) => (
              <option key={user.username} value={user.username}>
                {user.full_name || user.username}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="secondary-button"
          disabled={!!exporting || date === today}
          onClick={() => onDateChange(today)}
        >
          Hoje
        </button>
        <button
          type="button"
          className="secondary-button"
          disabled={!!exporting || !username}
          onClick={() => onUsernameChange('')}
        >
          Limpar usuário
        </button>
        {(username || date !== today) && (
          <span className="text-xs font-semibold text-brand">Filtro ativo</span>
        )}
      </div>
    </>
  );
}
