import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { validSettings } from '../../../shared/api/validators';
import { registerRouteLeaveGuard } from '../../../shared/lib/routeLeaveGuard';
import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import {
  ErrorNotice,
  LoadingSkeleton,
  SuccessToast,
} from '../../../shared/components/AsyncFeedback';

function toEditableSettings(value) {
  return {
    capture_interval_seconds: value.capture_interval_seconds,
    idle_timeout_seconds: value.idle_timeout_seconds,
  };
}

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [savedForm, setSavedForm] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const active = useRef(null);
  const saving = useRef(false);

  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setForm(null);
    setSavedForm(null);
    setStatus('loading');
    setError('');
    try {
      const value = await api.settings(controller.signal);
      if (controller.signal.aborted) return;
      setForm(toEditableSettings(value));
      setSavedForm(toEditableSettings(value));
      setStatus('ready');
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(`Não foi possível carregar: ${getApiErrorMessage(cause)}`);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    return () => active.current?.abort();
  }, [load]);

  const dirty =
    !!form &&
    !!savedForm &&
    (Number(form.capture_interval_seconds) !== savedForm.capture_interval_seconds ||
      Number(form.idle_timeout_seconds) !== savedForm.idle_timeout_seconds);

  useEffect(() => {
    if (!dirty) return undefined;
    const unregister = registerRouteLeaveGuard(() =>
      window.confirm('Há alterações não salvas. Deseja sair sem salvar?'),
    );
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      unregister();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [dirty]);

  function updateField(field, value) {
    setStatus('ready');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function save(event) {
    event.preventDefault();
    if (saving.current || !form || !dirty) return;
    const payload = {
      capture_interval_seconds: Number(form.capture_interval_seconds),
      idle_timeout_seconds: Number(form.idle_timeout_seconds),
    };
    if (!validSettings(payload)) {
      setStatus('ready');
      setError('Informe números inteiros maiores que zero.');
      return;
    }
    const controller = new AbortController();
    saving.current = true;
    active.current = controller;
    setStatus('saving');
    setError('');
    try {
      const value = await api.saveSettings(payload, controller.signal);
      if (controller.signal.aborted) return;
      setForm(toEditableSettings(value));
      setSavedForm(toEditableSettings(value));
      setStatus('saved');
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(`Não foi possível salvar: ${getApiErrorMessage(cause)}`);
      setStatus('ready');
    } finally {
      saving.current = false;
    }
  }

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Parâmetros globais fornecidos pela API atual."
      />
      <IntegrationNotice>
        Jornada e limite de inatividade por colaborador precisam de contratos próprios. Estes campos
        são globais; o backend também precisa aplicar o limite salvo ao cálculo de atividade.
      </IntegrationNotice>
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
                onClick={() => {
                  setForm(savedForm);
                  setError('');
                  setStatus('ready');
                }}
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
    </>
  );
}
