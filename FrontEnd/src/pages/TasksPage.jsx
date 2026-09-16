import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { IntegrationNotice } from "../components/IntegrationNotice";
import { PageHeader } from "../components/PageHeader";

export function TasksPage() {
  const [description, setDescription] = useState("");
  const [services, setServices] = useState("");
  const descriptionError = description.length > 0 && description.trim().length < 3;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Crie e edite tasks definindo descrição, colaboradores associados e aplicações ou serviços monitorados."
      />

      <IntegrationNotice>
        RF-06 e RF-11 exigem persistência e seleção de colaboradores associados. A interface abaixo implementa somente validação e estrutura visual; o salvamento permanece bloqueado até existir contrato oficial da API de tasks.
      </IntegrationNotice>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)]" aria-label="Gerenciamento de tasks">
        <form className="rounded-xl border border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900" onSubmit={(event) => event.preventDefault()} noValidate>
          <h2 className="text-base font-bold text-ink dark:text-white">Nova task</h2>

          <label className="mt-5 block text-sm font-semibold text-ink dark:text-white" htmlFor="task-description">
            Descrição
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            maxLength={500}
            aria-invalid={descriptionError || undefined}
            aria-describedby={descriptionError ? "task-description-error" : "task-description-help"}
            className="form-field mt-2 min-h-28 resize-y"
            placeholder="Descreva a finalidade da task"
          />
          {descriptionError ? (
            <p id="task-description-error" className="mt-1 text-xs font-semibold text-red-600 dark:text-red-300">Informe pelo menos 3 caracteres.</p>
          ) : (
            <p id="task-description-help" className="mt-1 text-xs text-muted">Máximo de 500 caracteres.</p>
          )}

          <label className="mt-5 block text-sm font-semibold text-ink dark:text-white" htmlFor="task-services">
            Aplicações ou serviços monitorados
          </label>
          <textarea
            id="task-services"
            value={services}
            onChange={(event) => setServices(event.target.value)}
            rows={4}
            className="form-field mt-2 min-h-28 resize-y"
            placeholder="Ex.: ERP.exe, Excel.exe"
            aria-describedby="task-services-help"
          />
          <p id="task-services-help" className="mt-1 text-xs text-muted">O formato final de armazenamento depende do contrato da API.</p>

          <fieldset className="mt-5" disabled>
            <legend className="text-sm font-semibold text-ink dark:text-white">Colaboradores associados</legend>
            <div className="mt-2 rounded-lg border border-dashed border-line px-4 py-3 text-sm text-muted dark:border-slate-700">
              A seleção será habilitada quando RF-05 disponibilizar a lista da equipe associada.
            </div>
          </fieldset>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className="primary-button" disabled>Salvar task</button>
            <button type="button" className="secondary-button" onClick={() => { setDescription(""); setServices(""); }}>Limpar formulário</button>
          </div>
        </form>

        <EmptyState
          title="Nenhuma lista de tasks disponível"
          description="A listagem, edição e indicação de tasks em execução serão conectadas quando o backend expuser os dados previstos em RF-06 e RF-27."
        />
      </section>
    </>
  );
}
