import { lazy, Suspense } from "react";
import { Sidebar } from "./components/Sidebar";
import { useHashRoute } from "./hooks/useHashRoute";
import { useTheme } from "./hooks/useTheme";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then(({ DashboardPage }) => ({ default: DashboardPage })),
);
const CollaboratorsPage = lazy(() =>
  import("./pages/CollaboratorsPage").then(({ CollaboratorsPage }) => ({ default: CollaboratorsPage })),
);
const TasksPage = lazy(() =>
  import("./pages/TasksPage").then(({ TasksPage }) => ({ default: TasksPage })),
);
const ReportsPage = lazy(() =>
  import("./pages/ReportsPage").then(({ ReportsPage }) => ({ default: ReportsPage })),
);
const SettingsPage = lazy(() =>
  import("./pages/SettingsPage").then(({ SettingsPage }) => ({ default: SettingsPage })),
);
const AuthPage = lazy(() =>
  import("./pages/AuthPage").then(({ AuthPage }) => ({ default: AuthPage })),
);

const pageByRoute = {
  painel: DashboardPage,
  colaboradores: CollaboratorsPage,
  tasks: TasksPage,
  relatorios: ReportsPage,
  configuracoes: SettingsPage,
};

function RouteLoading({ fullScreen = false }) {
  const className = fullScreen
    ? "grid min-h-screen place-items-center bg-page px-4 dark:bg-slate-950"
    : "grid min-h-[240px] place-items-center";

  return (
    <div className={className} role="status" aria-live="polite" aria-busy="true">
      <span className="text-sm font-semibold text-muted">Carregando interface…</span>
    </div>
  );
}

function App() {
  const route = useHashRoute();
  const [dark, toggleTheme] = useTheme();

  if (route === "login" || route === "cadastro") {
    return (
      <Suspense fallback={<RouteLoading fullScreen />}>
        <AuthPage mode={route} />
      </Suspense>
    );
  }

  const CurrentPage = pageByRoute[route] ?? DashboardPage;

  return (
    <div className="min-h-screen bg-page text-ink dark:bg-slate-950">
      <a
        className="skip-link"
        href="#conteudo-principal"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("conteudo-principal")?.focus();
        }}
      >
        Pular para o conteúdo principal
      </a>
      <Sidebar activeSection={route} />
      <main
        id="conteudo-principal"
        tabIndex="-1"
        className="mx-auto w-full max-w-[1610px] px-5 pb-10 pt-20 sm:px-8 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:px-12 lg:py-10"
      >
        <Suspense fallback={<RouteLoading />}>
          <CurrentPage dark={dark} toggleTheme={toggleTheme} />
        </Suspense>
      </main>
    </div>
  );
}

export default App;
