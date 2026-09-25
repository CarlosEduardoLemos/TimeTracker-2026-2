import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { useTheme } from './hooks/useTheme';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const CollaboratorsPage = lazy(() => import('./pages/CollaboratorsPage').then(module => ({ default: module.CollaboratorsPage })));
const TasksPage = lazy(() => import('./pages/TasksPage').then(module => ({ default: module.TasksPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));

const pages = {
  painel: DashboardPage,
  colaboradores: CollaboratorsPage,
  tasks: TasksPage,
  relatorios: ReportsPage,
  configuracoes: SettingsPage,
};
function currentRoute() {
  return window.location.hash.replace(/^#\//, '') || 'painel';
}

export default function App() {
  const [route, setRoute] = useState(currentRoute);
  const [dark, toggleTheme] = useTheme();
  const main = useRef(null);
  useEffect(() => {
    const updateRoute = () => setRoute(currentRoute());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);

  if (route === 'login' || route === 'cadastro') return <Suspense fallback={<p role="status">Carregando interface…</p>}><AuthPage mode={route} /></Suspense>;
  const Page = pages[route] || DashboardPage;
  return <div className="min-h-screen bg-page text-ink dark:bg-slate-950 dark:text-slate-100">
    <a href="#conteudo" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Pular para o conteúdo principal</a>
    <Sidebar route={route} />
    <main ref={main} id="conteudo" tabIndex="-1" className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:px-10 lg:py-10">
      <Suspense fallback={<p role="status">Carregando interface…</p>}><Page dark={dark} toggleTheme={toggleTheme} /></Suspense>
    </main>
  </div>;
}
