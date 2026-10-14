import { useCallback, useEffect, useRef, useState } from 'react';

export function useAttendanceData(devApi, date, username) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const active = useRef(null);
  const previousQuery = useRef(null);

  const load = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const query = `${date}|${username}`;
    const changed = previousQuery.current !== query;
    previousQuery.current = query;
    setState((previous) => ({
      ...previous,
      data: changed ? null : previous.data,
      loading: true,
      error: null,
    }));
    try {
      const data = await devApi.attendance(date, username, controller.signal);
      if (!controller.signal.aborted) setState({ loading: false, error: null, data });
    } catch (cause) {
      if (!controller.signal.aborted) {
        setState((previous) => ({
          ...previous,
          loading: false,
          error: cause.message || 'Fonte de jornada indisponível.',
        }));
      }
    }
  }, [date, devApi, username]);

  useEffect(() => {
    load();
    return () => active.current?.abort();
  }, [load]);

  return { ...state, refresh: load };
}
