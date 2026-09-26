export function MetricCard({ icon, label, value, detail }) {
  return (
    <article className="card">
      {icon && <span aria-hidden="true">{icon}</span>}
      <p className="text-xs font-semibold muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-ink dark:text-white">{value}</p>
      {detail && <p className="mt-1 text-[11px] muted">{detail}</p>}
    </article>
  );
}
