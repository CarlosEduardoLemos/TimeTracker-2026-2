import { useState } from "react";
import {
  ActivityChart,
  Header,
  MetricCard,
  PeopleCard,
  ReportsAndAgent,
  TimelineCard,
} from "../components";
import { useDashboardData } from "../hooks";
import {
  countPeopleByStatus,
  filterRealtimePeople,
  formatDashboardReferenceDate,
  safeIsoDate,
} from "../utils/dashboard";

export function DashboardPage({ dark, toggleTheme } = {}) {
  const [selectedDate, setSelectedDate] = useState(() => safeIsoDate());
  const [selectedUsername, setSelectedUsername] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const activeDate = safeIsoDate(selectedDate);
  const { data, loading, refreshing, error, updatedAt, refresh } =
    useDashboardData(activeDate, selectedUsername, autoRefresh);

  const realtimePeople = filterRealtimePeople(data?.realtime, selectedUsername);
  const users = data?.users ?? [];
  const onlinePeople = countPeopleByStatus(realtimePeople, "online");
  const formattedDate = formatDashboardReferenceDate(activeDate);
  const availability = data?.availability;
  const hasPartialData = Boolean(
    availability && Object.values(availability).some((available) => !available),
  );
  const hasRealtimeData = Boolean(data) && availability?.realtime !== false;
  const apiStatus = loading
    ? "loading"
    : error
      ? "offline"
      : hasPartialData
        ? "degraded"
        : "online";

  return (
    <>
      <Header
        formattedDate={formattedDate}
        dark={dark}
        toggleTheme={toggleTheme}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedUsername={selectedUsername}
        setSelectedUsername={setSelectedUsername}
        users={users}
        apiStatus={apiStatus}
        refreshing={refreshing}
        onRefresh={refresh}
        updatedAt={updatedAt}
      />

      {error && (
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
          role="alert"
        >
          <div>
            <strong className="block font-bold">Não foi possível carregar o Dashboard</strong>
            <span>
              {data
                ? "Os dados exibidos são da última consulta concluída. Tente atualizar novamente."
                : "Verifique a conexão com a API e tente novamente."}
            </span>
          </div>
          <button type="button" className="secondary-button" onClick={refresh}>
            Tentar novamente
          </button>
        </div>
      )}

      {!error && hasPartialData && (
        <div
          className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
        >
          <strong className="block font-bold">Alguns dados estão temporariamente indisponíveis</strong>
          <span>
            O painel mantém apenas os dados confirmados pela API. Tente atualizar novamente para recuperar as fontes indisponíveis.
          </span>
        </div>
      )}

      <section
        className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
        aria-labelledby="metricas-heading"
      >
        <h2 id="metricas-heading" className="sr-only">Resumo da equipe</h2>
        <MetricCard
          icon="●"
          tone="bg-emerald-100 text-emerald-600"
          label="Colaboradores online"
          value={hasRealtimeData ? onlinePeople : "—"}
          detail={
            hasRealtimeData
              ? "status informado pela API"
              : "dados em tempo real indisponíveis"
          }
        />
        <MetricCard icon="○" tone="bg-slate-100 text-slate-600" label="Colaboradores offline" value="—" detail="depende da API de equipe associada" />
        <MetricCard icon="▣" tone="bg-blue-100 text-blue-600" label="Tasks ativas" value="—" detail="depende da API de tasks" />
        <MetricCard icon="▶" tone="bg-violet-100 text-violet-600" label="Tempo ativo" value="—" detail="depende de períodos Ativo/Inativo" />
        <MetricCard icon="Ⅱ" tone="bg-amber-100 text-amber-700" label="Tempo inativo" value="—" detail="depende de períodos Ativo/Inativo" />
        <MetricCard icon="+" tone="bg-orange-100 text-orange-600" label="Possível hora extra" value="—" detail="indicação depende da jornada" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Indicadores e atividade">
        <ActivityChart weeklySummaries={data?.weeklySummaries ?? []} loading={loading} unavailable={!data && Boolean(error)} />
        <TimelineCard activities={[]} />
        <PeopleCard realtimePeople={realtimePeople} loading={loading} unavailable={!loading && !hasRealtimeData} />
      </section>

      {loading && (
        <p className="mt-4 text-xs text-muted" role="status" aria-live="polite">
          Consultando dados da API…
        </p>
      )}

      <div className="mt-5 grid gap-5">
        <ReportsAndAgent
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
        />
      </div>
    </>
  );
}
