import { useId, useState } from 'react';
import { validTaskDescription, validTaskTitle } from '../../../shared/api/validators';
import { ErrorNotice } from '../../../shared/components/AsyncFeedback';

export function TaskForm({
  task = null,
  collaborators,
  collaboratorsLoading = false,
  collaboratorsError,
  onRetryCollaborators,
  onSubmit,
  onCancel,
  saving = false,
  disabled = false,
  error = null,
}) {
  const id = useId();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [collaboratorIds, setCollaboratorIds] = useState(
    () => task?.collaborators.map((person) => person.id) || [],
  );
  const [validationError, setValidationError] = useState(null);
  const headingId = `${id}-heading`;

  function toggleCollaborator(personId) {
    setCollaboratorIds((current) =>
      current.includes(personId)
        ? current.filter((value) => value !== personId)
        : [...current, personId],
    );
  }

  async function submit(event) {
    event.preventDefault();
    setValidationError(null);
    if (!validTaskTitle(title)) {
      setValidationError('Informe o título da Task.');
      return;
    }
    if (!validTaskDescription(description)) {
      setValidationError('Informe uma descrição de até 200 caracteres.');
      return;
    }
    if (collaboratorIds.length === 0) {
      setValidationError('Selecione pelo menos um colaborador.');
      return;
    }

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      collaborator_ids: collaboratorIds,
    });
  }

  return (
    <section className="card mt-5 max-w-3xl" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-lg font-bold">
        {task ? 'Editar Task' : 'Criar Task'}
      </h2>
      <form className="mt-4 space-y-4" onSubmit={submit} noValidate>
        <div>
          <label htmlFor={`${id}-title`} className="block text-sm font-semibold">
            Título
          </label>
          <input
            id={`${id}-title`}
            className="form-field mt-1"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            disabled={disabled || saving}
            aria-invalid={validationError && !validTaskTitle(title) ? 'true' : undefined}
          />
        </div>

        <div>
          <label htmlFor={`${id}-description`} className="block text-sm font-semibold">
            Descrição
          </label>
          <textarea
            id={`${id}-description`}
            className="form-field mt-1 min-h-24 resize-y"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
            maxLength={200}
            disabled={disabled || saving}
            aria-describedby={`${id}-description-help`}
            aria-invalid={
              validationError && !validTaskDescription(description) ? 'true' : undefined
            }
          />
          <p id={`${id}-description-help`} className="mt-1 text-xs muted">
            Até 200 caracteres neste formulário demonstrativo. O limite oficial depende do contrato
            do Backend.
          </p>
        </div>

        <fieldset
          className="rounded-lg border border-line p-3 dark:border-slate-700"
          disabled={disabled || saving || !!collaboratorsError}
          aria-describedby={`${id}-collaborators-help`}
        >
          <legend className="px-1 text-sm font-semibold">Colaboradores atribuídos</legend>
          <p id={`${id}-collaborators-help`} className="mb-2 text-xs muted">
            Selecione um ou mais membros da equipe.
          </p>
          {collaboratorsLoading ? (
            <p className="text-sm muted" role="status">
              Carregando colaboradores…
            </p>
          ) : collaboratorsError ? (
            <div>
              <ErrorNotice>{collaboratorsError}</ErrorNotice>
              <button
                type="button"
                className="secondary-button mt-2"
                onClick={onRetryCollaborators}
                disabled={disabled || saving}
              >
                Tentar carregar colaboradores novamente
              </button>
            </div>
          ) : collaborators.length === 0 ? (
            <p className="text-sm muted">
              {disabled
                ? 'A seleção estará disponível quando a API de equipe e Tasks for integrada.'
                : 'Nenhum colaborador está disponível nos dados de demonstração.'}
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {collaborators.map((person) => {
                const checkboxId = `${id}-collaborator-${person.id}`;
                return (
                  <li key={person.id}>
                    <label
                      htmlFor={checkboxId}
                      className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <input
                        id={checkboxId}
                        type="checkbox"
                        value={person.id}
                        checked={collaboratorIds.includes(person.id)}
                        onChange={() => toggleCollaborator(person.id)}
                      />
                      <span>{person.full_name || person.username}</span>
                      {person.full_name && (
                        <span className="text-xs muted">({person.username})</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </fieldset>

        {validationError && (
          <p role="alert" className="text-sm text-red-700 dark:text-red-300">
            {validationError}
          </p>
        )}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="primary-button"
            disabled={disabled || saving || collaborators.length === 0 || !!collaboratorsError}
          >
            {saving ? 'Salvando…' : task ? 'Salvar alterações' : 'Criar Task'}
          </button>
          {task && (
            <button type="button" className="secondary-button" onClick={onCancel} disabled={saving}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
