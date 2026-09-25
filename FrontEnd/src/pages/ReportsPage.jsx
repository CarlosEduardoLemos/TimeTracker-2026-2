import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { todayIso, validUsers } from '../utils/dashboard';
import { PageHeader } from '../components/PageHeader';
import { IntegrationNotice } from '../components/IntegrationNotice';

export function ReportsPage() {
  const [date, setDate] = useState(todayIso());
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [exporting, setExporting] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api.users(controller.signal).then(value => setUsers(validUsers(value) ? value : null))
      .catch(() => { if (!controller.signal.aborted) setUsers(null); })
      .finally(() => { if (!controller.signal.aborted) setLoadingUsers(false); });
    return () => controller.abort();
  }, []);

  async function download(format) {
    setError('');
    setExporting(format);
    try {
      const blob = await api.exportFile(format, date, username);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `resumo_${date}.${format}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(`Não foi possível exportar: ${cause.message}`);
    } finally {
      setExporting('');
    }
  }

  return <>
    <PageHeader title="Relatórios" description="Exportação do resumo diário disponível na API." />
    <IntegrationNotice title="Escopo parcial do RF-24/RF-25">O arquivo contém usuário, categoria e tempo registrado de um dia. Período, task, jornada, horas extras e classificação por escopo precisam de novos contratos no backend.</IntegrationNotice>
    <section className="card mt-5"><h2 className="font-bold">Filtros disponíveis</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold muted">Data<input type="date" className="form-field mt-1" value={date} max={todayIso()} onChange={event => setDate(event.target.value)} /></label><label className="text-xs font-semibold muted">Usuário<select className="form-field mt-1" value={username} onChange={event => setUsername(event.target.value)} disabled={!users}><option value="">Todos os usuários</option>{(users || []).map(user => <option key={user.username} value={user.username}>{user.full_name || user.username}</option>)}</select></label></div>
      {!loadingUsers && !users && <p role="alert" className="mt-3 text-sm text-amber-800">A lista de usuários não carregou. A exportação geral continua disponível.</p>}
      <div className="mt-5 flex flex-wrap gap-2"><button className="secondary-button" disabled={!date || !!exporting} onClick={() => download('csv')}>{exporting === 'csv' ? 'Exportando…' : 'Exportar CSV'}</button><button className="primary-button" disabled={!date || !!exporting} onClick={() => download('pdf')}>{exporting === 'pdf' ? 'Exportando…' : 'Exportar PDF'}</button></div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </section>
  </>;
}
