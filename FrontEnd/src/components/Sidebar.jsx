import { useEffect, useRef, useState } from "react";
import { navItems as defaultNavItems } from "../data/dashboardData";

const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Sidebar({ activeSection, items = defaultNavItems }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const openButtonRef = useRef(null);
  const closeButtonRef = useRef(null);
  const mobilePanelRef = useRef(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        openButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        mobilePanelRef.current?.querySelectorAll(FOCUSABLE_ELEMENTS) ?? [],
      );

      if (!focusableElements.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = () => {
    setMobileOpen(false);
    window.requestAnimationFrame(() => openButtonRef.current?.focus());
  };

  const sidebarContent = (
    <>
      <a href="#/painel" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg font-display text-[21px] font-extrabold text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:text-white" aria-label="TimeTrack — ir para o Painel">
        <span aria-hidden="true" className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-white">T</span>
        <span>time<span className="text-brand">track</span></span>
      </a>

      <nav className="mt-12 grid gap-1" aria-label="Menu principal">
        {items.map(([id, icon, label]) => {
          const isActive = activeSection === id;
          return (
            <a key={id} href={`#/${id}`} onClick={() => setMobileOpen(false)} aria-current={isActive ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3.5 py-3 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${isActive ? "bg-indigo-50 text-brand dark:bg-indigo-950/50" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
              <span aria-hidden="true" className="w-5 text-center text-lg">{icon}</span>{label}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-line pt-4 dark:border-slate-700">
        <div className="rounded-lg bg-slate-50 px-3 py-3 text-xs leading-5 text-muted dark:bg-slate-800">
          <strong className="block text-ink dark:text-white">Sessão do gestor</strong>
          A identificação do usuário será exibida após integração de RF-02.
        </div>
        <div className="mt-3 flex gap-2">
          <a href="#/login" className="secondary-button flex-1 text-center" onClick={() => setMobileOpen(false)}>Login</a>
          <a href="#/cadastro" className="secondary-button flex-1 text-center" onClick={() => setMobileOpen(false)}>Criar conta</a>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button ref={openButtonRef} type="button" className="fixed left-4 top-4 z-30 grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-lg text-slate-600 shadow-md focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" aria-expanded={mobileOpen} aria-controls="mobile-navigation" title="Abrir menu">
        <span aria-hidden="true">☰</span>
      </button>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-white px-4 py-7 dark:border-slate-700 dark:bg-slate-900 lg:flex">{sidebarContent}</aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeMobile} aria-hidden="true" />
          <aside ref={mobilePanelRef} id="mobile-navigation" className="absolute inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] flex-col overflow-y-auto border-r border-line bg-white px-4 py-7 shadow-xl animate-slide-in dark:border-slate-700 dark:bg-slate-900" aria-label="Menu principal mobile" aria-modal="true" role="dialog">
            <button ref={closeButtonRef} type="button" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-slate-400 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={closeMobile} aria-label="Fechar menu" title="Fechar menu"><span aria-hidden="true">✕</span></button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
