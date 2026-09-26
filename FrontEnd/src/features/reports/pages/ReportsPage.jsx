import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { todayIso, validUsers } from '../../../shared/lib/dashboard';
import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';

export function ReportsPage() {
  const [date, setDate] = useState(todayIso());
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const activeExport = useRef(null);
  const activeUsers = useRef(null);

  const loadUsers = useCallback(async () => {
    activeUsers.current?.abort();
    const controller = new AbortController();
    activeUsers.current = controller;
    setLoadingUsers(true);
    setUsersError('');
    try {
      const value = await api.users(controller.signal);
      if (!validUsers(value)) throw new Error('Resposta inválida da API');
      if (!controller.signal.aborted) setUsers(value);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setUsers(null);
        setUsersError(cause instanceof Error ? cause.message : 'Falha desconhecida');
      }
    } finally {
      if (!controller.signal.aborted) setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    return () => {
      activeUsers.current?.abort();
      activeExport.current?.abort();
    };
  }, [loadUsers]);

  async function download(format) {
    if (activeExport.current) return;
    const controller = new AbortController();
    activeExport.current = controller;
    setError('');
    setSuccess('');
    setExporting(format);
    try {
      const blob = await api.exportFile(format, date, username, controller.signal);
      if (controller.signal.aborted) return;
      if (!(blob instanceof Blob) || blob.size === 0) throw new Error('Arquivo vazio ou inválido');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `resumo_${date}.${format}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setSuccess(`Download de ${format.toUpperCase()} iniciado.`);
    } catch (cause) {
      if (!controller.signal.aborted)
        setError(
          `Não foi possível exportar: ${cause instanceof Error ? cause.message : 'Falha desconhecida'}`,
        );
    } finally {
      if (activeExport.current === controller) activeExport.current = null;
      if (!controller.signal.aborted) setExporting('');
    }
  }

  return (
    <>
      <PageHeader title="Relatórios" description="Exportação do resumo diário disponível na API." />
      <IntegrationNotice title="Escopo parcial do RF-24/RF-25">
        O arquivo contém usuário, categoria e tempo registrado de um dia. Período, task, jornada,
        horas extras e classificação por escopo precisam de novos contratos no backend.
      </IntegrationNotice>
      <section className="card mt-5" aria-busy={!!exporting}>
        <h2 className="font-bold">Filtros disponíveis</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold muted">
            Data
            <input
              type="date"
              className="form-field mt-1"
              value={date}
              max={todayIso()}
              disabled={!!exporting}
              onChange={(event) => {
                if (event.target.value) {
                  setDate(event.target.value);
                  setError('');
                  setSuccess('');
                }
              }}
            />
          </label>
          <label className="text-xs font-semibold muted">
            Usuário
            <select
              className="form-field mt-1"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setError('');
                setSuccess('');
              }}
              disabled={loadingUsers || !users || !!exporting}
            >
              <option value="">Todos os usuários</option>
              {username && !(users || []).some((user) => user.username === username) && (
                <option value={username}>{username} (selecionado)</option>
              )}
              {(users || []).map((user) => (
                <option key={user.username} value={user.username}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>
          </label>
        </div>
        {loadingUsers && (
          <p role="status" className="mt-3 text-sm muted">
            Carregando usuários…
          </p>
        )}
        {!loadingUsers && users?.length === 0 && (
          <p className="mt-3 text-sm muted">Nenhum usuário cadastrado.</p>
        )}
        {!loadingUsers && !users && (
          <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-200">
            A lista de usuários não carregou: {usersError}. A exportação com os filtros atuais
            continua disponível.{' '}
            <button type="button" className="font-semibold underline" onClick={loadUsers}>
              Tentar novamente
            </button>
          </p>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="secondary-button"
            disabled={!date || !!exporting}
            onClick={() => download('csv')}
          >
            {exporting === 'csv' ? 'Exportando…' : 'Exportar CSV'}
          </button>
          <button
            className="primary-button"
            disabled={!date || !!exporting}
            onClick={() => download('pdf')}
          >
            {exporting === 'pdf' ? 'Exportando…' : 'Exportar PDF'}
          </button>
        </div>
        {exporting && (
          <p role="status" className="mt-3 text-sm muted">
            Preparando arquivo {exporting.toUpperCase()}…
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p role="status" className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">
            {success}
          </p>
        )}
      </section>
    </>
  );
}
