import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { getApiErrorMessage } from '../../../shared/api/errorMessage';

export function useReportUsers() {
  const [users, setUsers] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const activeUsers = useRef(null);
  const usersSequence = useRef(0);

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

  return { users, loadingUsers, usersError, loadUsers };
}
