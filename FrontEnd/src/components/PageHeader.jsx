export function PageHeader({ title, description, actions }) {
  return <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-extrabold text-ink dark:text-white">{title}</h1>
      <p className="mt-1 text-sm muted">{description}</p>
    </div>
    {actions}
  </header>;
}
