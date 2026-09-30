import { useEffect, useState } from 'react';

export function ErrorNotice({ children, onRetry, className = '' }) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 ${className}`}
    >
      {children}
      {onRetry && (
        <button type="button" className="ml-2 font-semibold underline" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}

export function EmptyState({ children, className = '' }) {
  return <p className={`py-6 text-center text-sm muted ${className}`}>{children}</p>;
}

export function LoadingSkeleton({ lines = 3, label = 'Carregando dados…' }) {
  return (
    <div role="status" aria-label={label} className="animate-pulse space-y-3 py-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-6 rounded-lg bg-slate-200 dark:bg-slate-700"
          style={{ width: `${100 - index * 12}%` }}
        />
      ))}
    </div>
  );
}

export function SuccessToast({ children, onDismiss, duration = 5000 }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!duration) return undefined;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;
  return (
    <div
      role="status"
      className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"
    >
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          className="font-semibold underline"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          aria-label="Dispensar confirmação"
        >
          Fechar
        </button>
      )}
    </div>
  );
}
