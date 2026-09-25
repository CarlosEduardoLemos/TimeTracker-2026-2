import { lazy, Suspense, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { useTheme } from './hooks/useTheme';
import { useHashRoute } from './hooks/useHashRoute';

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
export default function App() {
  const route = useHashRoute();
  const [dark, toggleTheme] = useTheme();
  const main = useRef(null);
  useEffect(() => {
    const titles = { painel: 'Painel', colaboradores: 'Colaboradores', tasks: 'Tasks', relatorios: 'Relatórios', configuracoes: 'Configurações', login: 'Entrar', cadastro: 'Criar conta', notFound: 'Página não encontrada' };
    document.title = `${titles[route]} | TimeTrack`;
  }, [route]);

  if (route === 'login' || route === 'cadastro') return <Suspense fallback={<p role="status">Carregando interface…</p>}><AuthPage mode={route} /></Suspense>;
  const Page = pages[route];
  return <div className="min-h-screen bg-page text-ink dark:bg-slate-950 dark:text-slate-100">
    <a href="#conteudo" className="skip-link" onClick={event => { event.preventDefault(); main.current?.focus(); }}>Pular para o conteúdo principal</a>
    <Sidebar route={route} />
    <main ref={main} id="conteudo" tabIndex="-1" className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:px-10 lg:py-10">
      {Page ? <Suspense fallback={<p role="status">Carregando interface…</p>}><Page dark={dark} toggleTheme={toggleTheme} /></Suspense> : <section className="card"><h1 className="text-2xl font-bold">Página não encontrada</h1><p className="mt-2 text-sm muted">O endereço informado não corresponde a uma página do TimeTrack.</p><a className="mt-4 inline-block font-semibold text-brand underline" href="#/painel">Ir para o painel</a></section>}
    </main>
  </div>;
}
