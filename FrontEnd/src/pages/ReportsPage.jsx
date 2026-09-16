import { IntegrationNotice } from "../components/IntegrationNotice";
import { PageHeader } from "../components/PageHeader";

export function ReportsPage() {
  return (
    <>
      <PageHeader title="Relatórios" description="Consulte informações por período, colaborador e task e exporte somente os dados permitidos." />

      <IntegrationNotice>
        RF-24 e RF-25 dependem de uma API que aceite período, colaborador e task e retorne tempo por task, atividade/inatividade, serviços, jornada e possíveis horas extras. A exportação permanece bloqueada para não gerar arquivos incompletos.
      </IntegrationNotice>

      <section className="mt-5 rounded-xl border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="report-filters-heading">
        <h2 id="report-filters-heading" className="text-base font-bold text-ink dark:text-white">Filtros do relatório</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-semibold text-muted">Data inicial<input type="date" className="form-field mt-1" disabled /></label>
          <label className="text-xs font-semibold text-muted">Data final<input type="date" className="form-field mt-1" disabled /></label>
          <label className="text-xs font-semibold text-muted">Colaborador<select className="form-field mt-1" disabled><option>Todos</option></select></label>
          <label className="text-xs font-semibold text-muted">Task<select className="form-field mt-1" disabled><option>Todas</option></select></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" className="secondary-button" disabled>Exportar CSV</button>
          <button type="button" className="secondary-button" disabled>Exportar PDF</button>
        </div>
      </section>
    </>
  );
}
