import { Suspense, useEffect, useRef } from 'react';
import { Sidebar } from './layout/Sidebar';
import { useTheme } from './hooks/useTheme';
import { useHashRoute } from './hooks/useHashRoute';
import { PageErrorBoundary } from './PageErrorBoundary';
import { routes } from './routes';

export default function App() {
  const route = useHashRoute();
  const [dark, toggleTheme] = useTheme();
  const main = useRef(null);
  const previousRoute = useRef(route);
  const config = routes[route];
  const Page = config?.component;

  useEffect(() => {
    document.title = `${config?.title || 'Página não encontrada'} | TimeTrack`;
    if (previousRoute.current !== route) main.current?.focus();
    previousRoute.current = route;
  }, [route, config]);

  const content = Page ? (
    <PageErrorBoundary key={route}>
      <Suspense fallback={<p role="status">Carregando interface…</p>}>
        <Page dark={dark} toggleTheme={toggleTheme} mode={route} />
      </Suspense>
    </PageErrorBoundary>
  ) : (
    <section className="card">
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <p className="mt-2 text-sm muted">
        O endereço informado não corresponde a uma página do TimeTrack.
      </p>
      <a className="mt-4 inline-block font-semibold text-brand underline" href="#/painel">
        Ir para o painel
      </a>
    </section>
  );

  if (config?.auth)
    return (
      <main
        ref={main}
        tabIndex="-1"
        className="grid min-h-screen place-items-center bg-page p-4 dark:bg-slate-950 dark:text-white"
      >
        {content}
      </main>
    );

  return (
    <div className="min-h-screen bg-page text-ink dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#conteudo"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          main.current?.focus();
        }}
      >
        Pular para o conteúdo principal
      </a>
      <Sidebar route={route} />
      <main
        ref={main}
        id="conteudo"
        tabIndex="-1"
        className="mx-auto w-full max-w-[1600px] px-5 pb-10 pt-20 sm:px-8 lg:ml-64 lg:w-[calc(100%_-_16rem)] lg:px-10 lg:py-10"
      >
        {content}
      </main>
    </div>
  );
}
