import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { validSettings } from '../../../shared/api/validators';
import { registerRouteLeaveGuard } from '../../../shared/lib/routeLeaveGuard';

function toEditableSettings(value) {
  return {
    capture_interval_seconds: value.capture_interval_seconds,
    idle_timeout_seconds: value.idle_timeout_seconds,
  };
}

export function useSettings() {
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

  function restore() {
    setForm(savedForm);
    setError('');
    setStatus('ready');
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

  return { form, status, error, dirty, load, updateField, restore, save };
}
