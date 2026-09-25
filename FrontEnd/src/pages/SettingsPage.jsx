import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function SettingsPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const active = useRef(null);
  const load = useCallback(() => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setStatus('loading');
    setError('');
    api.settings(controller.signal).then(value => {
      if (controller.signal.aborted) return;
      if (!Number.isInteger(value?.capture_interval_seconds) || !Number.isInteger(value?.idle_timeout_seconds)) throw new Error('Resposta inválida da API');
      setForm({ capture_interval_seconds: value.capture_interval_seconds, idle_timeout_seconds: value.idle_timeout_seconds });
      setStatus('ready');
    }).catch(cause => { if (!controller.signal.aborted) { setError(cause.message); setStatus('error'); } });
  }, []);
  useEffect(() => {
    load();
    return () => active.current?.abort();
  }, [load]);

  async function save(event) {
    event.preventDefault();
    const capture = Number(form.capture_interval_seconds);
    const idle = Number(form.idle_timeout_seconds);
    if (!Number.isSafeInteger(capture) || capture < 1 || !Number.isSafeInteger(idle) || idle < 1) {
      setError('Informe números inteiros maiores que zero.');
      return;
    }
    setStatus('saving');
    setError('');
    try {
      const value = await api.saveSettings({ capture_interval_seconds: capture, idle_timeout_seconds: idle });
      setForm({ capture_interval_seconds: value.capture_interval_seconds, idle_timeout_seconds: value.idle_timeout_seconds });
      setStatus('saved');
    } catch (cause) {
      setError(`Não foi possível salvar: ${cause.message}`);
      setStatus('ready');
    }
  }

  return <>
    <PageHeader title="Configurações" description="Parâmetros globais fornecidos pela API atual." />
    <IntegrationNotice>RF-20/RF-21 exigem jornada e inatividade por colaborador. Estes campos são globais; o backend também precisa aplicar o timeout salvo ao cálculo de atividade.</IntegrationNotice>
    <form onSubmit={save} className="card mt-5 max-w-2xl">
      {status === 'loading' && <p role="status">Carregando configurações…</p>}
      {form && <><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Intervalo de captura (segundos)<input className="form-field mt-2" min="1" step="1" required type="number" value={form.capture_interval_seconds} onChange={event => setForm({ ...form, capture_interval_seconds: event.target.value })} /></label><label className="text-sm font-semibold">Limite de inatividade (segundos)<input className="form-field mt-2" min="1" step="1" required type="number" value={form.idle_timeout_seconds} onChange={event => setForm({ ...form, idle_timeout_seconds: event.target.value })} /></label></div><button className="primary-button mt-5" disabled={status === 'saving'}>{status === 'saving' ? 'Salvando…' : 'Salvar configurações'}</button></>}
      {status === 'saved' && <p role="status" className="mt-3 text-sm text-emerald-700">Configurações salvas.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {status === 'error' && <button type="button" className="secondary-button mt-3" onClick={load}>Tentar novamente</button>}
    </form>
  </>;
}
