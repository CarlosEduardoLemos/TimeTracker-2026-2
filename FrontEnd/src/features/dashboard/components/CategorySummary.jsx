import { EmptyState, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';
import { fmtDuration } from '../../../shared/lib/dashboard';

export function CategorySummary({ categories, totalSeconds, loading, available }) {
  const total = totalSeconds || categories.reduce((sum, category) => sum + category.seconds, 0);
  return (
    <article className="card min-w-0" aria-busy={loading}>
      <h2 className="font-bold">Tempo por categoria</h2>
      <p className="mt-1 text-xs muted">Categorias do resumo diário, sem classificação por task.</p>
      {loading ? (
        <LoadingSkeleton label="Carregando categorias…" />
      ) : !available ? (
        <EmptyState>Resumo indisponível.</EmptyState>
      ) : !categories.length ? (
        <EmptyState>Sem registros na data selecionada.</EmptyState>
      ) : (
        <div className="mt-4 grid gap-4" aria-label="Distribuição do tempo por categoria">
          {categories.map((category) => {
            const percent = total ? (category.seconds / total) * 100 : 0;
            return (
              <div key={category.name} title={`${category.name}: ${fmtDuration(category.seconds)}`}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{category.name}</span>
                  <span className="muted">
                    {fmtDuration(category.seconds)} · {percent.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand dark:bg-indigo-400"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
