import { Sidebar } from "./components/Sidebar";
import { useHashRoute } from "./hooks/useHashRoute";
import { useTheme } from "./hooks/useTheme";
import { AuthPage } from "./pages/AuthPage";
import { CollaboratorsPage } from "./pages/CollaboratorsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TasksPage } from "./pages/TasksPage";

const pageByRoute = {
  painel: DashboardPage,
  colaboradores: CollaboratorsPage,
  tasks: TasksPage,
  relatorios: ReportsPage,
  configuracoes: SettingsPage,
};

function App() {
  const route = useHashRoute();
  const [dark, toggleTheme] = useTheme();

  if (route === "login" || route === "cadastro") {
    return <AuthPage mode={route} />;
  }

  const CurrentPage = pageByRoute[route] ?? DashboardPage;

  return (
    <div className="min-h-screen bg-page text-ink dark:bg-slate-950">
      <a className="skip-link" href="#conteudo-principal" onClick={(event) => {
        event.preventDefault();
        document.getElementById("conteudo-principal")?.focus();
      }}>Pular para o conteúdo principal</a>
      <Sidebar activeSection={route} />
      <main id="conteudo-principal" tabIndex="-1" className="mx-auto w-full max-w-[1610px] px-5 pb-10 pt-20 sm:px-8 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:px-12 lg:py-10">
        <CurrentPage dark={dark} toggleTheme={toggleTheme} />
      </main>
    </div>
  );
}

export default App;
