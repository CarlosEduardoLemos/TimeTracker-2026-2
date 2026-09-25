import { useMemo, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { MetricCard } from '../components/MetricCard';
import { PageHeader } from '../components/PageHeader';
import { categoryTotals, deriveTeam, fmtDuration, todayIso, totalSeconds } from '../utils/dashboard';

export function DashboardPage({ dark, toggleTheme }) {
  const [date, setDate] = useState(todayIso());
  const [username, setUsername] = useState('');
  const { data, loading, refreshing, error, updatedAt, refresh } = useDashboardData(date, username);
  const available = data?.availability || {};
  const team = useMemo(() => available.users && available.realtime
    ? deriveTeam(data.users, data.realtime) : [], [data, available.users, available.realtime]);
  const filtered = username ? team.filter(person => person.username === username) : team;
  const count = status => filtered.filter(person => person.status === status).length;
  const cats = available.summary ? categoryTotals(data.summary) : [];
  const unavailable = '—';

  return <>
    <PageHeader title="Visão geral" description="Resumo diário e última atividade dos usuários cadastrados na API." actions={<div className="flex flex-wrap gap-2"><button className="secondary-button" onClick={toggleTheme}>{dark ? 'Tema claro' : 'Tema escuro'}</button><button className="secondary-button" onClick={refresh} disabled={loading || refreshing}>{refreshing ? 'Atualizando…' : 'Atualizar'}</button></div>} />
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">A lista da API é global e ainda não representa uma equipe vinculada ao gestor. Os estados de atividade são aproximados pela última leitura; o backend ainda não informa a conexão do Agente.</div>
    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Filtros do resumo">
      <label className="text-xs font-semibold muted">Data do resumo<input className="form-field mt-1" type="date" value={date} max={todayIso()} onChange={event => setDate(event.target.value)} /></label>
      <label className="text-xs font-semibold muted">Usuário<select className="form-field mt-1" value={username} onChange={event => setUsername(event.target.value)} disabled={!available.users}><option value="">Todos os usuários</option>{(data?.users || []).map(user => <option key={user.username} value={user.username}>{user.full_name || user.username}</option>)}</select></label>
      <div className="flex items-end sm:col-span-2"><p className="text-xs muted">{updatedAt ? `Atualizado às ${updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Aguardando primeira atualização'}{refreshing && ' · atualizando'}</p></div>
    </section>
    {error && <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error} <button className="ml-2 font-bold underline" onClick={refresh}>Tentar novamente</button></div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Indicadores disponíveis">
      <MetricCard label="Online" value={loading ? '…' : available.users && available.realtime ? count('online') : unavailable} detail="última leitura da API, agora" />
      <MetricCard label="Ausentes" value={loading ? '…' : available.users && available.realtime ? count('ausente') : unavailable} detail="estado retornado pela API, agora" />
      <MetricCard label="Sem leitura recente" value={loading ? '…' : available.users && available.realtime ? count('offline') : unavailable} detail="usuários ausentes da janela realtime" />
      <MetricCard label="Tempo registrado" value={loading ? '…' : available.summary ? fmtDuration(totalSeconds(data.summary)) : unavailable} detail="resumo da data selecionada" />
      <MetricCard label="Usuários cadastrados" value={loading ? '…' : available.users ? username ? filtered.length : data.users.length : unavailable} detail="lista global retornada pela API" />
    </section>
    <section className="mt-5 grid gap-5 xl:grid-cols-2">
      <article className="card"><h2 className="font-bold">Última atividade</h2><p className="mt-1 text-xs muted">Esta tabela é atual e não segue o filtro de data do resumo.</p><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[580px] text-left text-sm"><thead><tr className="border-b"><th scope="col" className="py-2">Usuário</th><th scope="col">Estado</th><th scope="col">Aplicação</th><th scope="col">Última leitura</th></tr></thead><tbody>{filtered.map(person => <tr key={person.username} className="border-b border-slate-100 dark:border-slate-800"><th scope="row" className="py-3 font-semibold">{person.full_name || person.username}</th><td>{person.status === 'offline' ? 'Sem leitura recente' : person.status}</td><td>{person.realtime?.process_name || '—'}</td><td>{person.realtime ? `${person.realtime.seconds_since_last_activity}s atrás` : '—'}</td></tr>)}</tbody></table>{!loading && available.users && available.realtime && !filtered.length && <p className="py-6 text-center text-sm muted">Nenhum usuário encontrado.</p>}{!loading && (!available.users || !available.realtime) && <p className="py-6 text-center text-sm muted">Dados de atividade indisponíveis.</p>}</div></article>
      <article className="card"><h2 className="font-bold">Tempo por categoria</h2><p className="mt-1 text-xs muted">Categorias do resumo diário, sem classificação por task.</p><div className="mt-4 grid gap-3">{available.summary ? cats.length ? cats.map(category => <div key={category.name} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-3 dark:bg-slate-800"><span className="text-sm font-semibold">{category.name}</span><span className="text-sm muted">{fmtDuration(category.seconds)}</span></div>) : <p className="text-sm muted">Sem registros na data selecionada.</p> : <p className="text-sm muted">{loading ? 'Carregando…' : 'Resumo indisponível.'}</p>}</div></article>
    </section>
    <p className="mt-5 text-sm muted">Tasks ativas, tempo produtivo, atividade/inatividade, possíveis horas extras e timeline dependem de registros e consultas ainda ausentes na API.</p>
  </>;
}
