export function IntegrationNotice({ children, title = 'Dependência de backend' }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
    <strong>{title}</strong>
    <p className="mt-1 text-xs leading-5">{children}</p>
  </div>;
}
