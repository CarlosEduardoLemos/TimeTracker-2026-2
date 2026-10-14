import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { useState } from 'react';
import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { useTasks } from '../hooks/useTasks';
import { validTaskDescription } from '../../../shared/api/validators';

function UnavailableTasks() {
  return (
    <>
      <PageHeader title="Tasks" description="Criação e edição de tasks do gestor." />
      <IntegrationNotice>
        O backend ainda não oferece consulta ou persistência de tasks, associação de colaboradores
        nem aplicações do escopo. Esta página será habilitada quando esses contratos existirem. A
        criação persistida pelo Dashboard, quando disponível, não inicia nem controla o
        monitoramento pelo Agent.
      </IntegrationNotice>
      <section className="card mt-5 max-w-3xl text-center" aria-labelledby="tasks-empty-title">
        <div
          aria-hidden="true"
          className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-3xl text-brand dark:bg-indigo-950"
        >
          ☷
        </div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wide text-brand">
          Aguardando integração
        </p>
        <h2 id="tasks-empty-title" className="mt-2 text-xl font-bold">
          Organização de tasks da equipe
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 muted">
          Quando a API oferecer suporte, esta área reunirá as tasks definidas pelo gestor e a
          associação de colaboradores e aplicações ao escopo de cada uma.
        </p>
      </section>
    </>
  );
}

function MockTasks({ devApi }) {
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState(null);
  const { tasks, loading, error, saving, saveError, created, load, createTask } = useTasks(devApi);

  async function submit(event) {
    event.preventDefault();
    setValidationError(null);
    if (!validTaskDescription(description)) {
      setValidationError('Informe uma descrição de até 200 caracteres.');
      return;
    }
    const saved = await createTask(description);
    if (saved) setDescription('');
  }

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Lista e criação de Tasks em ambiente de demonstração."
      />
      <IntegrationNotice>
        Esta tela usa os contratos propostos apenas quando os mocks de desenvolvimento estão ativos.
        Criar uma Task não inicia monitoramento nem a atribui a um colaborador.
      </IntegrationNotice>
      <section className="card mt-5 max-w-3xl" aria-labelledby="create-task-title">
        <h2 id="create-task-title" className="text-lg font-bold">
          Criar Task
        </h2>
        <form className="mt-4 space-y-3" onSubmit={submit}>
          <label htmlFor="task-description" className="block text-sm font-semibold">
            Descrição
          </label>
          <input
            id="task-description"
            className="form-field"
            value={description}
            required
            maxLength={200}
            onChange={(event) => setDescription(event.target.value)}
            aria-invalid={validationError ? 'true' : undefined}
            aria-describedby={
              validationError
                ? 'task-description-help task-description-error'
                : 'task-description-help'
            }
          />
          <p id="task-description-help" className="text-xs muted">
            Até 200 caracteres.
          </p>
          {validationError && (
            <p
              id="task-description-error"
              role="alert"
              className="text-sm text-red-700 dark:text-red-300"
            >
              {validationError}
            </p>
          )}
          {saveError && <ErrorNotice>{saveError}</ErrorNotice>}
          {created && (
            <p
              role="status"
              className="text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            >
              Task criada em dados simulados.
            </p>
          )}
          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Criando…' : 'Criar Task'}
          </button>
        </form>
      </section>
      <section className="card mt-5 max-w-3xl" aria-labelledby="tasks-list-title">
        <h2 id="tasks-list-title" className="text-lg font-bold">
          Tasks cadastradas
        </h2>
        {error && (
          <ErrorNotice className="mt-3" onRetry={load}>
            {error}
          </ErrorNotice>
        )}
        {loading ? (
          <LoadingSkeleton label="Carregando Tasks…" />
        ) : error && tasks.length === 0 ? null : tasks.length === 0 ? (
          <EmptyState>Nenhuma Task foi criada neste modo de demonstração.</EmptyState>
        ) : (
          <ul className="mt-3 divide-y divide-line dark:divide-slate-700">
            {tasks.map((task) => (
              <li key={task.id} className="py-3">
                <p className="font-semibold">{task.description}</p>
                <p className="mt-1 text-xs muted">
                  Criada em {new Date(task.created_at).toLocaleString('pt-BR')}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export function TasksPage({ devApi = null }) {
  return devApi ? <MockTasks devApi={devApi} /> : <UnavailableTasks />;
}
