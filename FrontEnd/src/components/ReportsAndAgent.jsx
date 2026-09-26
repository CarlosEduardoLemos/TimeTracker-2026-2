/**
 * Área de relatório e preferência de atualização.
 *
 * A exportação antiga gerava apenas dados diários/parciais e não atendia
 * RF-24/RF-25. Os botões permanecem visíveis, porém desabilitados, até que o
 * backend forneça exportação considerando período, colaborador, task, jornada,
 * possíveis horas extras e Activity Timeline.
 */
export function ReportsAndAgent({ autoRefresh, setAutoRefresh }) {
  return (
    <>
      <section
        id="relatorios"
        className="flex flex-col items-start justify-between gap-4 rounded-[13px] border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/40 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl bg-white text-xl text-brand shadow-sm"
            aria-hidden="true"
          >
            ↓
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink dark:text-white">
              Exportar relatório
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
              CSV e PDF devem respeitar os filtros e incluir somente os dados permitidos. A API
              atual ainda não fornece o relatório completo definido em RF-24/RF-25.
            </p>
          </div>
        </div>
        <div className="flex gap-2" aria-label="Formatos de exportação indisponíveis">
          <button
            type="button"
            className="secondary-button cursor-not-allowed opacity-60"
            disabled
            title="Aguardando endpoint de relatório compatível com os requisitos"
          >
            ⇩ CSV
          </button>
          <button
            type="button"
            className="primary-button cursor-not-allowed opacity-60"
            disabled
            title="Aguardando endpoint de relatório compatível com os requisitos"
          >
            ⇩ PDF
          </button>
        </div>
      </section>

      <section
        id="timesheet"
        className="flex flex-col items-start justify-between gap-4 rounded-[13px] border border-line bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-600"
            aria-hidden="true"
          >
            ↻
          </span>
          <div>
            <h2 className="font-display text-base font-bold text-ink dark:text-white">
              Atualização do painel
            </h2>
            <p className="mt-1 text-xs text-muted">
              Consulta os endpoints já disponíveis a cada 30 segundos.
            </p>
          </div>
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-xs font-bold text-ink dark:text-white">
          <input
            type="checkbox"
            className="h-4 w-4 accent-indigo-600"
            checked={autoRefresh}
            onChange={(event) => setAutoRefresh(event.target.checked)}
          />
          Atualização automática
        </label>
      </section>
    </>
  );
}
