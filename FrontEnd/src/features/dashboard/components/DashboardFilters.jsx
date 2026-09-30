import { todayIso } from '../../../shared/lib/dashboard';

export function DashboardFilters({
  date,
  onDateChange,
  username,
  onUsernameChange,
  users,
  usersAvailable,
  updatedAt,
  refreshing,
}) {
  return (
    <section
      className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Filtros do resumo"
    >
      <label className="text-xs font-semibold muted">
        Data do resumo
        <input
          className="form-field mt-1"
          type="date"
          value={date}
          max={todayIso()}
          onChange={(event) => event.target.value && onDateChange(event.target.value)}
        />
      </label>
      <label className="text-xs font-semibold muted">
        Usuário
        <select
          className="form-field mt-1"
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          disabled={!usersAvailable}
        >
          <option value="">Todos os usuários</option>
          {username && !users.some((user) => user.username === username) && (
            <option value={username}>{username} (selecionado)</option>
          )}
          {users.map((user) => (
            <option key={user.username} value={user.username}>
              {user.full_name || user.username}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap items-end gap-2 sm:col-span-2">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onDateChange(todayIso())}
          disabled={date === todayIso()}
        >
          Hoje
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => onUsernameChange('')}
          disabled={!username}
        >
          Limpar usuário
        </button>
        {(username || date !== todayIso()) && (
          <span className="self-center text-xs font-semibold text-brand">Filtro ativo</span>
        )}
        <p className="self-center text-xs muted">
          {updatedAt
            ? `Atualizado às ${updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            : 'Aguardando primeira atualização'}
          {refreshing && ' · atualizando'}
        </p>
      </div>
    </section>
  );
}
