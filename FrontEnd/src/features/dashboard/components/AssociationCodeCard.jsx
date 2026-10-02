import { useState } from 'react';

const ASSOCIATION_CODE_PATTERN = /^\d{6}$/;

export function AssociationCodeCard({ code = null, loading = false, error = null }) {
  const [feedback, setFeedback] = useState('');
  const validCode = typeof code === 'string' && ASSOCIATION_CODE_PATTERN.test(code);

  async function copyCode() {
    if (!validCode) return;

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API indisponível');
      await navigator.clipboard.writeText(code);
      setFeedback('Copiado!');
    } catch {
      setFeedback('Não foi possível copiar o código.');
    }
  }

  return (
    <section className="card mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="eyebrow">Acesso da equipe</p>
        <h2 className="text-lg font-extrabold">Código de associação</h2>
        {loading ? (
          <p
            className="mt-1 text-sm muted"
            role="status"
            aria-label="Carregando código de associação"
          >
            Carregando código…
          </p>
        ) : validCode ? (
          <p
            className="mt-1 font-mono text-3xl font-bold tracking-[0.2em]"
            aria-label="Código de associação"
          >
            {code}
          </p>
        ) : (
          <p className="mt-1 text-sm muted" role={error ? 'alert' : undefined}>
            {error || 'Código indisponível enquanto a API de associação não estiver disponível.'}
          </p>
        )}
        <p className="mt-1 text-xs muted">Compartilhe este código com os membros da sua equipe.</p>
        <p className="mt-2 min-h-5 text-sm" aria-live="polite">
          {feedback}
        </p>
      </div>
      <button
        type="button"
        className="primary-button min-h-11 w-full sm:w-auto"
        onClick={copyCode}
        disabled={!validCode || loading}
        aria-label="Copiar código de associação"
      >
        Copiar Código
      </button>
    </section>
  );
}
