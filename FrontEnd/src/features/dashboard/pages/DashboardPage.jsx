import { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardFilters } from '../components/DashboardFilters';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { LastActivityTable } from '../components/LastActivityTable';
import { CategorySummary } from '../components/CategorySummary';
import { DashboardStatusNotice } from '../components/DashboardStatusNotice';
import { ErrorNotice } from '../../../shared/components/AsyncFeedback';
import { PageHeader } from '../../../shared/components/PageHeader';
import {
  categoryTotals,
  deriveTeam,
  filterRealtimePeople,
  todayIso,
  totalSeconds,
} from '../../../shared/lib/dashboard';

export function DashboardPage({ dark, toggleTheme }) {
  const [date, setDate] = useState(todayIso());
  const [username, setUsername] = useState('');
  const { data, loading, refreshing, error, updatedAt, refresh } = useDashboardData(date, username);
  const available = data?.availability || {};
  const users = data?.users || [];
  const team = available.users && available.realtime ? deriveTeam(users, data.realtime) : [];
  const filtered = filterRealtimePeople(team, username);

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Resumo diário e última atividade dos usuários cadastrados na API."
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="secondary-button" onClick={toggleTheme}>
              {dark ? 'Tema claro' : 'Tema escuro'}
            </button>
            <button className="secondary-button" onClick={refresh} disabled={loading || refreshing}>
              {refreshing ? 'Atualizando…' : 'Atualizar'}
            </button>
          </div>
        }
      />
      <DashboardStatusNotice />
      <DashboardFilters
        date={date}
        onDateChange={setDate}
        username={username}
        onUsernameChange={setUsername}
        users={users}
        usersAvailable={available.users}
        updatedAt={updatedAt}
        refreshing={refreshing}
      />
      {error && (
        <ErrorNotice className="mb-5" onRetry={refresh}>
          {error}
        </ErrorNotice>
      )}
      <DashboardMetrics
        loading={loading}
        available={available}
        filtered={filtered}
        summary={data?.summary}
        users={users}
        username={username}
      />
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <LastActivityTable
          people={filtered}
          loading={loading}
          available={available.users && available.realtime}
        />
        <CategorySummary
          categories={available.summary ? categoryTotals(data.summary) : []}
          totalSeconds={available.summary ? totalSeconds(data.summary) : 0}
          loading={loading}
          available={available.summary}
        />
      </section>
      <p className="mt-5 text-sm muted">
        Tasks ativas, tempo produtivo, atividade/inatividade, possíveis horas extras e timeline
        dependem de registros e consultas ainda ausentes na API.
      </p>
    </>
  );
}
