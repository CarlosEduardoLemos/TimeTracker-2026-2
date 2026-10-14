export function MocksNotice({ enabled }) {
  if (!enabled) return null;

  return (
    <aside
      role="note"
      aria-label="Aviso de dados simulados"
      className="border-b border-amber-300 bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
    >
      DADOS SIMULADOS — respostas de Tasks e jornada são fictícias e existem apenas neste modo de
      desenvolvimento.
    </aside>
  );
}
