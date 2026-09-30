import { MetricCard } from '../../../shared/components/MetricCard';
import { countPeopleByStatus, fmtDuration, totalSeconds } from '../../../shared/lib/dashboard';

export function DashboardMetrics({ loading, available, filtered, summary, users, username }) {
  const status = (name) =>
    available.users && available.realtime ? countPeopleByStatus(filtered, name) : '—';
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"
      aria-label="Indicadores disponíveis"
      aria-busy={loading}
    >
      <MetricCard
        loading={loading}
        label="Online"
        value={status('online')}
        detail="atividade recente recebida pela API"
      />
      <MetricCard
        loading={loading}
        label="Ausentes"
        value={status('ausente')}
        detail="mais de 5 min sem novo evento"
      />
      <MetricCard
        loading={loading}
        label="Sem leitura recente"
        value={status('offline')}
        detail="estado informado pela API após mais de 15 min sem evento"
      />
      <MetricCard
        loading={loading}
        label="Sem dados"
        value={
          available.users && available.realtime ? countPeopleByStatus(filtered, 'no-data') : '—'
        }
        detail="usuários sem entrada na resposta realtime de até 24 h"
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
