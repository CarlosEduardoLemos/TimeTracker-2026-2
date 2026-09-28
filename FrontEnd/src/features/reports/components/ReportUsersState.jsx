import { EmptyState, ErrorNotice, LoadingSkeleton } from '../../../shared/components/AsyncFeedback';

export function ReportUsersState({ loading, users, error, onRetry }) {
  if (loading) return <LoadingSkeleton label="Carregando usuários…" lines={1} />;
  if (users?.length === 0) return <EmptyState>Nenhum usuário cadastrado.</EmptyState>;
  if (!users)
    return (
      <ErrorNotice className="mt-3" onRetry={onRetry}>
        A lista de usuários não carregou: {error}. A exportação com os filtros atuais continua
        disponível.
      </ErrorNotice>
    );
  return null;
}
