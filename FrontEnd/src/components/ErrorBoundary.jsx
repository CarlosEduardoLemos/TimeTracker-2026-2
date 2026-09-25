import { Component } from "react";

/**
 * Última barreira de proteção da interface.
 *
 * Impede que uma exceção inesperada durante a renderização deixe toda a SPA
 * em branco. Erros de rede continuam sendo tratados pelos hooks/serviços que
 * já possuem estados próprios de falha e degradação.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Exceções podem incluir dados recebidos da API; detalhes ficam no desenvolvimento.
    if (import.meta.env.DEV) {
      console.error("Erro inesperado na interface do TimeTracker.", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-screen place-items-center bg-page px-4 py-10 dark:bg-slate-950">
          <section
            className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8"
            role="alert"
            aria-labelledby="unexpected-error-heading"
          >
            <span
              className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-red-50 text-lg font-bold text-red-600 dark:bg-red-950/50 dark:text-red-300"
              aria-hidden="true"
            >
              !
            </span>
            <h1
              id="unexpected-error-heading"
              className="mt-4 font-display text-xl font-extrabold text-ink dark:text-white"
            >
              Não foi possível exibir esta tela
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Ocorreu uma falha inesperada na interface. Recarregue a aplicação e tente novamente.
            </p>
            <button
              type="button"
              className="primary-button mt-5"
              onClick={() => window.location.reload()}
            >
              Recarregar aplicação
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
