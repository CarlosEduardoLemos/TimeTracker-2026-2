import { useState } from "react";
import {
  ActivityChart,
  Header,
  MetricCard,
  PeopleCard,
  ReportsAndAgent,
  TimelineCard,
} from "../components";
import { useDashboardData, useTheme } from "../hooks";
import { safeIsoDate } from "../utils/dashboard";

export function DashboardPage() {
  const [dark, toggleTheme] = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => safeIsoDate());
  const [selectedUsername, setSelectedUsername] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const activeDate = safeIsoDate(selectedDate);
  const { data, loading, refreshing, error, updatedAt, refresh } =
    useDashboardData(activeDate, selectedUsername, autoRefresh);

  const realtimePeople = (data?.realtime ?? []).filter(
    (person) => !selectedUsername || person.username === selectedUsername,
  );
  const users = data?.users ?? [];
  const onlinePeople = realtimePeople.filter(
    (person) => person.status === "online",
  ).length;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
    .format(new Date(`${activeDate}T12:00:00`))
    .toUpperCase();

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
        apiStatus={loading ? "loading" : error ? "offline" : "online"}
        refreshing={refreshing}
        onRefresh={refresh}
        updatedAt={updatedAt}
      />

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200" role="alert">
          <div>
            <strong className="block font-bold">Não foi possível carregar o Dashboard</strong>
            <span>Nenhum dado fictício foi aplicado. Verifique a conexão com a API e tente novamente.</span>
          </div>
          <button type="button" className="secondary-button" onClick={refresh}>Tentar novamente</button>
        </div>
      )}

      <section className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-labelledby="metricas-heading">
        <h2 id="metricas-heading" className="sr-only">Resumo da equipe</h2>
        <MetricCard icon="●" tone="bg-emerald-100 text-emerald-600" label="Colaboradores online" value={data ? onlinePeople : "—"} detail={data ? "conectados ao agente" : "aguardando dados"} />
        <MetricCard icon="○" tone="bg-slate-100 text-slate-600" label="Colaboradores offline" value="—" detail="depende da API de equipe associada" />
        <MetricCard icon="▣" tone="bg-blue-100 text-blue-600" label="Tasks ativas" value="—" detail="depende da API de tasks" />
        <MetricCard icon="▶" tone="bg-violet-100 text-violet-600" label="Tempo ativo" value="—" detail="depende de períodos Ativo/Inativo" />
        <MetricCard icon="Ⅱ" tone="bg-amber-100 text-amber-700" label="Tempo inativo" value="—" detail="depende de períodos Ativo/Inativo" />
        <MetricCard icon="+" tone="bg-orange-100 text-orange-600" label="Possível hora extra" value="—" detail="indicação depende da jornada" />
      </section>

      <section className="grid gap-5 lg:grid-cols-2" aria-label="Indicadores e atividade">
        <ActivityChart weeklySummaries={data?.weeklySummaries ?? []} />
        <TimelineCard activities={[]} />
        <PeopleCard realtimePeople={realtimePeople} />
      </section>

      {loading && <p className="mt-4 text-xs text-muted" role="status" aria-live="polite">Consultando dados da API…</p>}

      <div className="mt-5 grid gap-5">
        <ReportsAndAgent selectedDate={activeDate} selectedUsername={selectedUsername} autoRefresh={autoRefresh} setAutoRefresh={setAutoRefresh} />
      </div>
    </>
  );
}
