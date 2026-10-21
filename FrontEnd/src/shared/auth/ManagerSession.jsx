import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/api';
import {
  AUTH_REQUIRED_EVENT,
  clearManagerAccessToken,
  readManagerAccessToken,
  storeManagerAccessToken,
} from './sessionStorage';

const ManagerSessionContext = createContext(null);

function isUnauthorized(error) {
  return error?.status === 401;
}

export function ManagerSessionProvider({ children, client = api }) {
  const [session, setSession] = useState(() => ({
    status: readManagerAccessToken() ? 'checking' : 'anonymous',
    manager: null,
    error: null,
  }));

  const discardSession = useCallback((redirect = false) => {
    clearManagerAccessToken();
    setSession({ status: 'anonymous', manager: null, error: null });
    if (redirect && window.location.hash !== '#/login') window.location.hash = '#/login';
  }, []);

  const validateSession = useCallback(
    async (token, signal) => {
      try {
        const manager = await client.getCurrentManager(token, signal);
        if (!signal?.aborted) setSession({ status: 'authenticated', manager, error: null });
        return manager;
      } catch (error) {
        if (signal?.aborted || error?.type === 'canceled') return null;
        if (isUnauthorized(error)) {
          discardSession();
        } else {
          setSession({ status: 'unavailable', manager: null, error });
        }
        throw error;
      }
    },
    [client, discardSession],
  );

  useEffect(() => {
    const onAuthenticationRequired = () => discardSession(true);
    window.addEventListener(AUTH_REQUIRED_EVENT, onAuthenticationRequired);
    return () => window.removeEventListener(AUTH_REQUIRED_EVENT, onAuthenticationRequired);
  }, [discardSession]);

  useEffect(() => {
    const token = readManagerAccessToken();
    if (!token) {
      setSession({ status: 'anonymous', manager: null, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setSession({ status: 'checking', manager: null, error: null });
    void validateSession(token, controller.signal).catch(() => {});
    return () => controller.abort();
  }, [validateSession]);

  const login = useCallback(
    async (credentials) => {
      const result = await client.loginManager(credentials);
      const manager = await client.getCurrentManager(result.access_token);
      if (!storeManagerAccessToken(result.access_token)) {
        throw Object.assign(
          new Error('Este navegador não permite armazenar a sessão necessária.'),
          {
            type: 'session-storage',
          },
        );
      }
      setSession({ status: 'authenticated', manager, error: null });
      return manager;
    },
    [client],
  );

  const register = useCallback((credentials) => client.registerManager(credentials), [client]);

  const retrySession = useCallback(async () => {
    const token = readManagerAccessToken();
    if (!token) {
      discardSession();
      return null;
    }
    setSession({ status: 'checking', manager: null, error: null });
    try {
      return await validateSession(token);
    } catch {
      return null;
    }
  }, [discardSession, validateSession]);

  const logout = useCallback(() => discardSession(true), [discardSession]);

  const value = useMemo(
    () => ({ ...session, login, register, logout, retrySession }),
    [session, login, register, logout, retrySession],
  );

  return <ManagerSessionContext.Provider value={value}>{children}</ManagerSessionContext.Provider>;
}

export function useManagerSession() {
  const session = useContext(ManagerSessionContext);
  if (!session)
    throw new Error('useManagerSession precisa ser usado dentro de ManagerSessionProvider.');
  return session;
}
