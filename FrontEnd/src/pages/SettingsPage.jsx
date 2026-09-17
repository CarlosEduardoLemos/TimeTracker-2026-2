import { IntegrationNotice } from "../components/IntegrationNotice";
import { PageHeader } from "../components/PageHeader";

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

export function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Configurações de acompanhamento"
        description="Configure jornada e limite de inatividade por colaborador associado."
      />

      <IntegrationNotice>
        RF-20 e RF-21 são configurações por colaborador e dependem da identificação do colaborador e de endpoints de leitura/gravação. Os campos permanecem desabilitados até essa integração existir.
      </IntegrationNotice>

      <form className="mt-5 grid gap-5" onSubmit={(event) => event.preventDefault()}>
        <section className="rounded-xl border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="schedule-heading">
          <h2 id="schedule-heading" className="text-base font-bold text-ink dark:text-white">Jornada</h2>
          <div className="mt-4 grid gap-3">
            {days.map((day) => (
              <div key={day} className="grid gap-3 rounded-lg border border-line p-3 dark:border-slate-700 sm:grid-cols-[120px_repeat(4,minmax(0,1fr))] sm:items-end">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink dark:text-white">
                  <input type="checkbox" disabled /> {day}
                </label>
                <label className="text-xs font-semibold text-muted">Entrada<input className="form-field mt-1" type="time" disabled /></label>
                <label className="text-xs font-semibold text-muted">Saída<input className="form-field mt-1" type="time" disabled /></label>
                <label className="text-xs font-semibold text-muted">Intervalo início<input className="form-field mt-1" type="time" disabled /></label>
                <label className="text-xs font-semibold text-muted">Intervalo fim<input className="form-field mt-1" type="time" disabled /></label>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="idle-heading">
          <h2 id="idle-heading" className="text-base font-bold text-ink dark:text-white">Limite de inatividade</h2>
          <label className="mt-4 block max-w-sm text-sm font-semibold text-ink dark:text-white" htmlFor="idle-minutes">
            Minutos sem interação
          </label>
          <input id="idle-minutes" className="form-field mt-2 max-w-sm" type="number" min="1" step="1" disabled />
          <p className="mt-2 text-xs leading-5 text-muted">Mouse e teclado são usados somente para determinar Ativo/Inativo; o conteúdo das interações não deve ser coletado.</p>
        </section>

        <div><button className="primary-button" type="submit" disabled>Salvar configurações</button></div>
      </form>
    </>
  );
}
