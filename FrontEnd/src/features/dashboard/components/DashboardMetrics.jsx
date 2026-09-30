import { MetricCard } from '../../../shared/components/MetricCard';
import { countPeopleByStatus, fmtDuration, totalSeconds } from '../../../shared/lib/dashboard';

export function DashboardMetrics({ loading, available, filtered, summary, users, username }) {
  const status = (name) =>
    available.users && available.realtime ? countPeopleByStatus(filtered, name) : '—';
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      aria-label="Indicadores disponíveis"
      aria-busy={loading}
    >
      <MetricCard
        loading={loading}
        label="Online"
        value={status('online')}
        detail="status de leitura da API; não confirma conexão"
      />
      <MetricCard
        loading={loading}
        label="Ausentes"
        value={status('ausente')}
        detail="estado retornado pela API, agora"
      />
      <MetricCard
        loading={loading}
        label="Sem leitura recente"
        value={status('offline')}
        detail="usuários ausentes da janela realtime"
      />
      <MetricCard
        loading={loading}
        label="Tempo registrado"
        value={available.summary ? fmtDuration(totalSeconds(summary)) : '—'}
        detail="resumo da data selecionada"
      />
      <MetricCard
        loading={loading}
        label="Usuários cadastrados"
        value={
          available.users
            ? username
              ? users.filter((user) => user.username === username).length
              : users.length
            : '—'
        }
        detail="lista global retornada pela API"
      />
    </section>
  );
}
