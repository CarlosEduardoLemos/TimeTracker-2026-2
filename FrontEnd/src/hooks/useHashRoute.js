import { useEffect, useState } from 'react';

const DEFAULT_ROUTE = 'painel';
const KNOWN_ROUTES = new Set([
  'painel',
  'colaboradores',
  'tasks',
  'relatorios',
  'configuracoes',
  'login',
  'cadastro',
]);

function readRoute() {
  const raw = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  if (!raw) return DEFAULT_ROUTE;
  return KNOWN_ROUTES.has(raw) ? raw : 'notFound';
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
