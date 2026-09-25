export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-5 py-10 text-center dark:border-slate-700 dark:bg-slate-900">
      <div
        className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        aria-hidden="true"
      >
        —
      </div>
      <h2 className="mt-3 text-sm font-bold text-ink dark:text-white">{title}</h2>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-muted">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
