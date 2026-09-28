import { useEffect, useState } from 'react';
import { routes } from '../routes';

const DEFAULT_ROUTE = 'painel';

function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return DEFAULT_ROUTE;
  return Object.hasOwn(routes, raw) ? raw : 'notFound';
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
