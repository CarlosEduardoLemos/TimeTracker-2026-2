import { useEffect, useRef, useState } from 'react';

const items = [
  ['painel', 'Painel'],
  ['colaboradores', 'Colaboradores'],
  ['tasks', 'Tasks'],
  ['relatorios', 'Relatórios'],
  ['configuracoes', 'Configurações'],
];

function Navigation({ route, onNavigate }) {
  return (
    <>
      <a
        href="#/painel"
        onClick={onNavigate}
        className="w-fit text-xl font-extrabold tracking-tight text-ink dark:text-white"
        aria-label="TimeTrack, ir para o painel"
      >
        time<span className="text-brand">track</span>
      </a>
      <p className="mt-1 text-xs muted">Acompanhamento de atividades</p>
      <nav aria-label="Menu principal" className="mt-8 grid gap-1.5">
        {items.map(([id, label]) => (
          <a
            key={id}
            href={`#/${id}`}
            onClick={onNavigate}
            aria-current={route === id ? 'page' : undefined}
            className="sidebar-link"
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="mt-auto rounded-lg bg-slate-50 p-3 text-xs muted dark:bg-slate-800">
        A identificação do usuário será exibida após integração.{' '}
        <a href="#/cadastro" onClick={onNavigate} className="mt-2 block font-semibold text-brand">
          Criar conta
        </a>
      </div>
    </>
  );
}

export function Sidebar({ route, activeSection }) {
  const selected = route || activeSection;
  const [open, setOpen] = useState(false);
  const trigger = useRef(null);
  const panel = useRef(null);
  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector('button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key !== 'Tab') return;
      const focusable = [...panel.current.querySelectorAll('a,button')];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !panel.current.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = before;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const onHistory = () => {
      if (open) close();
    };
    window.addEventListener('hashchange', onHistory);
    return () => window.removeEventListener('hashchange', onHistory);
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1024px)');
    const onResize = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener('change', onResize);
    return () => desktop.removeEventListener('change', onResize);
  }, []);

  return (
    <>
      <button
        ref={trigger}
        onClick={() => setOpen(true)}
        className="icon-control fixed left-4 top-4 z-30 bg-white text-slate-900 lg:hidden dark:bg-slate-900 dark:text-white"
        aria-label="Abrir menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-white p-5 dark:border-slate-700 dark:bg-slate-900 lg:flex">
        <Navigation route={selected} />
      </aside>
      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <aside
            ref={panel}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal mobile"
            className="flex h-full w-72 max-w-[90vw] flex-col bg-white p-5 dark:bg-slate-900"
          >
            <button
              onClick={close}
              className="secondary-button mb-5 self-end"
              aria-label="Fechar menu"
            >
              <span>Fechar</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-2 h-4 w-4" fill="none">
                <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" />
              </svg>
            </button>
            <Navigation route={selected} onNavigate={close} />
          </aside>
        </div>
      )}
    </>
  );
}
