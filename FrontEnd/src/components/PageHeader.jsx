export function PageHeader({ eyebrow = "TIME TRACKER", title, description, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
