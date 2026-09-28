export function MetricCard({ icon, label, value, detail, loading = false }) {
  return (
    <article className="card">
      {icon && <span aria-hidden="true">{icon}</span>}
      <p className="text-xs font-semibold muted">{label}</p>
      {loading ? (
        <div
          role="status"
          aria-label={`Carregando ${label.toLowerCase()}`}
          className="mt-3 h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700"
        />
      ) : (
        <p className="mt-2 text-2xl font-extrabold text-ink dark:text-white">{value}</p>
      )}
      {detail && <p className="mt-1 text-[11px] muted">{detail}</p>}
    </article>
  );
}
