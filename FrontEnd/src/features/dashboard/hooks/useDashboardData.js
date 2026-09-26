import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { validRealtime, validSummary, validUsers } from '../../../shared/lib/dashboard';
import { requestFailure } from '../../../shared/lib/requestFailure';

const initial = { loading: true, refreshing: false, error: null, data: null, updatedAt: null };

export function useDashboardData(date, username) {
  const [state, setState] = useState(initial);
  const active = useRef(null);
  const sequence = useRef(0);
  const previousQuery = useRef(null);

  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const current = ++sequence.current;
    const query = `${date}|${username}`;
    const changed = previousQuery.current !== query;
    previousQuery.current = query;
    setState((previous) => ({
      ...previous,
      data: changed ? null : previous.data,
      updatedAt: changed ? null : previous.updatedAt,
      loading: changed || !previous.data,
      refreshing: !changed && !!previous.data,
      error: null,
    }));
    const [summary, users, realtime] = await Promise.allSettled([
      api.summary(date, username, controller.signal),
      api.users(controller.signal),
      api.realtime(controller.signal),
    ]);
    if (controller.signal.aborted || current !== sequence.current) return;
    const availability = {
      summary:
        summary.status === 'fulfilled' &&
        validSummary(summary.value) &&
        summary.value.date === date &&
        (!username || summary.value.users.every((user) => user.username === username)),
      users: users.status === 'fulfilled' && validUsers(users.value),
      realtime: realtime.status === 'fulfilled' && validRealtime(realtime.value),
    };
    setState({
      loading: false,
      refreshing: false,
      error:
        [
          requestFailure(summary, availability.summary, 'Resumo'),
          requestFailure(users, availability.users, 'Usuários'),
          requestFailure(realtime, availability.realtime, 'Atividade'),
        ]
          .filter(Boolean)
          .join('; ') || null,
      data: {
        summary: availability.summary ? summary.value : null,
        users: availability.users ? users.value : [],
        realtime: availability.realtime ? realtime.value : [],
        availability,
      },
      updatedAt: Object.values(availability).some(Boolean) ? new Date() : null,
    });
  }, [date, username]);

  useEffect(() => {
    load();
    const refreshVisible = () => {
      if (!document.hidden) load();
    };
    const interval = setInterval(refreshVisible, 30000);
    document.addEventListener('visibilitychange', refreshVisible);
    return () => {
      active.current?.abort();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshVisible);
    };
  }, [load]);

  return { ...state, refresh: load };
}
