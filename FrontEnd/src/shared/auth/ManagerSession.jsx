import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { api } from '../api/api';
import { validJwtAccessToken } from '../api/validators';
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

function canceledAuthOperation() {
  return Object.assign(new Error('Autenticação cancelada.'), { type: 'canceled' });
}

export function ManagerSessionProvider({ children, client = api }) {
  const [session, setSession] = useState(() => ({
    status: readManagerAccessToken() ? 'checking' : 'anonymous',
    manager: null,
    error: null,
  }));
  const activeRequest = useRef(null);
  const requestSequence = useRef(0);

  const cancelActiveRequest = useCallback(() => {
    requestSequence.current += 1;
    activeRequest.current?.abort();
    activeRequest.current = null;
  }, []);

  const discardSession = useCallback(
    (redirect = false) => {
      cancelActiveRequest();
      clearManagerAccessToken();
      setSession({ status: 'anonymous', manager: null, error: null });
      if (redirect && window.location.hash !== '#/login') window.location.hash = '#/login';
    },
    [cancelActiveRequest],
  );

  const validateSession = useCallback(
    async (token, signal, sequence) => {
      if (!validJwtAccessToken(token)) {
        if (sequence === requestSequence.current) discardSession();
        return null;
      }

      try {
        const manager = await client.getCurrentManager(token, signal);
        if (signal?.aborted || sequence !== requestSequence.current) return null;
        setSession({ status: 'authenticated', manager, error: null });
        return manager;
      } catch (error) {
        if (signal?.aborted || error?.type === 'canceled' || sequence !== requestSequence.current) {
          return null;
        }
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
      requestSequence.current += 1;
      setSession({ status: 'anonymous', manager: null, error: null });
      return undefined;
    }

    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    activeRequest.current?.abort();
    activeRequest.current = controller;
    setSession({ status: 'checking', manager: null, error: null });
    void validateSession(token, controller.signal, sequence).catch(() => {});
    return () => {
      controller.abort();
      if (activeRequest.current === controller) activeRequest.current = null;
    };
  }, [validateSession]);

  const login = useCallback(
    async (credentials) => {
      activeRequest.current?.abort();
      const controller = new AbortController();
      const sequence = ++requestSequence.current;
      activeRequest.current = controller;
      try {
        const result = await client.loginManager(credentials, controller.signal);
        if (controller.signal.aborted || sequence !== requestSequence.current) {
          throw canceledAuthOperation();
        }
        if (!validJwtAccessToken(result?.access_token)) {
          throw Object.assign(new Error('Token JWT inválido.'), { type: 'invalid-response' });
        }

        const manager = await client.getCurrentManager(result.access_token, controller.signal);
        if (controller.signal.aborted || sequence !== requestSequence.current) {
          throw canceledAuthOperation();
        }
        if (!storeManagerAccessToken(result.access_token)) {
          throw Object.assign(
            new Error('Este navegador não permite armazenar a sessão necessária.'),
            { type: 'session-storage' },
          );
        }
        setSession({ status: 'authenticated', manager, error: null });
        return manager;
      } catch (error) {
        if (controller.signal.aborted || sequence !== requestSequence.current) {
          throw canceledAuthOperation();
        }
        throw error;
      } finally {
        if (activeRequest.current === controller) activeRequest.current = null;
      }
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
    activeRequest.current?.abort();
    const controller = new AbortController();
    const sequence = ++requestSequence.current;
    activeRequest.current = controller;
    setSession({ status: 'checking', manager: null, error: null });
    try {
      return await validateSession(token, controller.signal, sequence);
    } catch {
      return null;
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
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
