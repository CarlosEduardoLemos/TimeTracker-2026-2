export function IntegrationNotice({ title = "Integração pendente", children }) {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
      role="status"
    >
      <strong className="block font-bold">{title}</strong>
      <div className="mt-1 leading-6">{children}</div>
    </div>
  );
}
