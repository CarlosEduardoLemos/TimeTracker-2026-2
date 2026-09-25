import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

function validSettings(value) {
  return (
    Number.isSafeInteger(value?.capture_interval_seconds) &&
    value.capture_interval_seconds > 0 &&
    Number.isSafeInteger(value?.idle_timeout_seconds) &&
    value.idle_timeout_seconds > 0
  );
}

function editableSettings(value) {
  return {
    capture_interval_seconds: value.capture_interval_seconds,
    idle_timeout_seconds: value.idle_timeout_seconds,
  };
}

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const active = useRef(null);

  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setForm(null);
    setStatus('loading');
    setError('');
    try {
      const value = await api.settings(controller.signal);
      if (!validSettings(value)) throw new Error('Resposta inválida da API');
      if (controller.signal.aborted) return;
      setForm(editableSettings(value));
      setStatus('ready');
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(`Não foi possível carregar: ${cause.message}`);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    return () => active.current?.abort();
  }, [load]);

  async function save(event) {
    event.preventDefault();
    if (status === 'saving' || !form) return;
    const payload = {
      capture_interval_seconds: Number(form.capture_interval_seconds),
      idle_timeout_seconds: Number(form.idle_timeout_seconds),
    };
    if (!validSettings(payload)) {
      setError('Informe números inteiros maiores que zero.');
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    setStatus('saving');
    setError('');
    try {
      const value = await api.saveSettings(payload, controller.signal);
      if (!validSettings(value)) throw new Error('Resposta inválida da API');
      if (controller.signal.aborted) return;
      setForm(editableSettings(value));
      setStatus('saved');
    } catch (cause) {
      if (controller.signal.aborted) return;
      setError(`Não foi possível salvar: ${cause.message}`);
      setStatus('ready');
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
        {status === 'loading' && <p role="status">Carregando configurações…</p>}
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
                  onChange={(event) => {
                    setStatus('ready');
                    setForm({ ...form, capture_interval_seconds: event.target.value });
                  }}
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
                  onChange={(event) => {
                    setStatus('ready');
                    setForm({ ...form, idle_timeout_seconds: event.target.value });
                  }}
                />
              </label>
            </fieldset>
            <button className="primary-button mt-5" disabled={status === 'saving'}>
              {status === 'saving' ? 'Salvando…' : 'Salvar configurações'}
            </button>
          </>
        )}
        {status === 'saved' && (
          <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
            Configurações salvas.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        {status === 'error' && (
          <button type="button" className="secondary-button mt-3" onClick={load}>
            Tentar novamente
          </button>
        )}
      </form>
    </>
  );
}
