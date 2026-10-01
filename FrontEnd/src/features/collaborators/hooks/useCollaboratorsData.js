import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../shared/api/api';
import { requestFailure } from '../../../shared/lib/requestFailure';
import { deriveTeam } from '../../../shared/lib/team';

export function useCollaboratorsData() {
  const [state, setState] = useState({ loading: true, users: null, realtime: null, error: null });
  const active = useRef(null);
  const sequence = useRef(0);

  const refresh = useCallback(() => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const current = ++sequence.current;
    setState((previous) => ({ ...previous, loading: true, error: null }));
    Promise.allSettled([api.users(controller.signal), api.realtime(controller.signal)]).then(
      ([users, realtime]) => {
        if (controller.signal.aborted || current !== sequence.current) return;
        setState({
          loading: false,
          users: users.status === 'fulfilled' ? users.value : null,
          realtime: realtime.status === 'fulfilled' ? realtime.value : null,
          error:
            [
              requestFailure(users, users.status === 'fulfilled', 'Usuários'),
              requestFailure(realtime, realtime.status === 'fulfilled', 'Atividade'),
            ]
              .filter(Boolean)
              .join('; ') || null,
        });
      },
    );
  }, []);

  useEffect(() => {
    refresh();
    return () => active.current?.abort();
  }, [refresh]);

  const people =
    state.users && state.realtime ? deriveTeam(state.users, state.realtime) : state.users || [];
  return { ...state, people, refresh };
}
