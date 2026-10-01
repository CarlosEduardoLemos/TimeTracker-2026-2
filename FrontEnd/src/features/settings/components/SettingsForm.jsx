import {
  ErrorNotice,
  LoadingSkeleton,
  SuccessToast,
} from '../../../shared/components/AsyncFeedback';

export function SettingsForm({ form, status, error, dirty, load, updateField, restore, save }) {
  return (
    <form
      onSubmit={save}
      className="card mt-5 max-w-2xl"
      aria-busy={status === 'loading' || status === 'saving'}
    >
      {status === 'loading' && <LoadingSkeleton label="Carregando configurações…" lines={2} />}
      {form && (
        <>
          <fieldset disabled={status === 'saving'} className="grid gap-4 sm:grid-cols-2">
            <legend className="sr-only">Parâmetros globais</legend>
            <label className="text-sm font-semibold">
              Intervalo de captura (segundos)
              <input
                className="form-field mt-2"
                min="1"
                step="1"
                required
                type="number"
                value={form.capture_interval_seconds}
                onChange={(event) => updateField('capture_interval_seconds', event.target.value)}
              />
            </label>
            <label className="text-sm font-semibold">
              Limite de inatividade (segundos)
              <input
                className="form-field mt-2"
                min="1"
                step="1"
                required
                type="number"
                value={form.idle_timeout_seconds}
                onChange={(event) => updateField('idle_timeout_seconds', event.target.value)}
              />
            </label>
          </fieldset>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button className="primary-button" disabled={status === 'saving' || !dirty}>
              {status === 'saving' ? 'Salvando…' : 'Salvar configurações'}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={status === 'saving' || !dirty}
              onClick={restore}
            >
              Restaurar
            </button>
            {dirty && (
              <span
                role="status"
                className="text-sm font-semibold text-amber-800 dark:text-amber-200"
              >
                Alterações não salvas
              </span>
            )}
          </div>
        </>
      )}
      {status === 'saved' && <SuccessToast>Configurações salvas.</SuccessToast>}
      {error && <ErrorNotice className="mt-3">{error}</ErrorNotice>}
      {status === 'error' && (
        <button type="button" className="secondary-button mt-3" onClick={load}>
          Tentar novamente
        </button>
      )}
    </form>
  );
}
