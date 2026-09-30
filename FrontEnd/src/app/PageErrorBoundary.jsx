import { Component } from 'react';

export class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="card" role="alert">
        <h1 className="text-xl font-bold">Não foi possível exibir esta página</h1>
        <p className="mt-2 text-sm muted">
          Ocorreu uma falha inesperada. Tente carregar a página novamente.
        </p>
        <button
          type="button"
          className="primary-button mt-4"
          onClick={() => this.setState({ failed: false })}
        >
          Tentar novamente
        </button>
      </section>
    );
  }
}
