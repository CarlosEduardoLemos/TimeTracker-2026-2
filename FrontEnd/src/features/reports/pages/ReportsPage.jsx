import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';
import { todayIso } from '../../../shared/lib/date';
import { PageHeader } from '../../../shared/components/PageHeader';
import { IntegrationNotice } from '../../../shared/components/IntegrationNotice';
import { ReportFilters } from '../components/ReportFilters';
import { ReportUsersState } from '../components/ReportUsersState';
import { ExportActions } from '../components/ExportActions';
import { useReportExport } from '../hooks/useReportExport';

export function ReportsPage() {
  const [date, setDate] = useState(todayIso());
  const [username, setUsername] = useState('');
  const [users, setUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const activeUsers = useRef(null);
  const usersSequence = useRef(0);
  const { exporting, error, success, download, clearFeedback, dismissSuccess } = useReportExport(
    date,
    username,
  );

  const loadUsers = useCallback(async () => {
    activeUsers.current?.abort();
    const controller = new AbortController();
    activeUsers.current = controller;
    const current = ++usersSequence.current;
    const isCurrent = () => !controller.signal.aborted && current === usersSequence.current;
    setLoadingUsers(true);
    setUsersError('');
    try {
      const value = await api.users(controller.signal);
      if (isCurrent()) setUsers(value);
    } catch (cause) {
      if (isCurrent()) {
        setUsers(null);
        setUsersError(getApiErrorMessage(cause));
      }
    } finally {
      if (isCurrent()) setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    return () => activeUsers.current?.abort();
  }, [loadUsers]);

  const changeDate = (value) => {
    setDate(value);
    clearFeedback();
  };
  const changeUsername = (value) => {
    setUsername(value);
    clearFeedback();
  };

  return (
    <>
      <PageHeader title="Relatórios" description="Exportação do resumo diário disponível na API." />
      <IntegrationNotice title="Escopo parcial do RF-24/RF-25">
        O arquivo contém usuário, categoria e tempo registrado de um dia. Período, task, jornada,
        horas extras e classificação por escopo precisam de novos contratos no backend.
      </IntegrationNotice>
      <section className="card mt-5" aria-busy={!!exporting}>
        <h2 className="font-bold">Filtros disponíveis</h2>
        <ReportFilters
          date={date}
          onDateChange={changeDate}
          username={username}
          onUsernameChange={changeUsername}
          users={users}
          loadingUsers={loadingUsers}
          exporting={exporting}
        />
        <ReportUsersState
          loading={loadingUsers}
          users={users}
          error={usersError}
          onRetry={loadUsers}
        />
        <ExportActions
          date={date}
          exporting={exporting}
          error={error}
          success={success}
          onDownload={download}
          onDismiss={dismissSuccess}
        />
      </section>
    </>
  );
}
