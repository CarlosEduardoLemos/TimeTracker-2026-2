import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { validRealtime, validSummary, validUsers } from '../utils/dashboard';

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
    setState(previous => ({
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
      summary: summary.status === 'fulfilled' && validSummary(summary.value),
      users: users.status === 'fulfilled' && validUsers(users.value),
      realtime: realtime.status === 'fulfilled' && validRealtime(realtime.value),
    };
    setState(previous => ({
      loading: false,
      refreshing: false,
      error: Object.values(availability).some(value => !value) ? 'Alguns dados estão temporariamente indisponíveis.' : null,
      data: {
        summary: availability.summary ? summary.value : null,
        users: availability.users ? users.value : [],
        realtime: availability.realtime ? realtime.value : [],
        availability,
      },
      updatedAt: Object.values(availability).some(Boolean) ? new Date() : previous.updatedAt,
    }));
  }, [date, username]);

  useEffect(() => {
    load();
    const refreshVisible = () => { if (!document.hidden) load(); };
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
