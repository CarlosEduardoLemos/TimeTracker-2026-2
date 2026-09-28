import { useEffect, useRef, useState } from 'react';
import { canLeaveRoute } from '../../shared/lib/routeLeaveGuard';
import { routes } from '../routes';

const DEFAULT_ROUTE = 'painel';

function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return DEFAULT_ROUTE;
  return Object.hasOwn(routes, raw) ? raw : 'notFound';
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);
  const acceptedRoute = useRef(route);
  const acceptedUrl = useRef(window.location.href);

  useEffect(() => {
    const onHashChange = () => {
      const nextRoute = readRoute();
      if (nextRoute !== acceptedRoute.current && !canLeaveRoute()) {
        window.history.replaceState(window.history.state, '', acceptedUrl.current);
        return;
      }
      acceptedRoute.current = nextRoute;
      acceptedUrl.current = window.location.href;
      setRoute(nextRoute);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
