let activeGuard = null;

export function registerRouteLeaveGuard(guard) {
  activeGuard = guard;
  return () => {
    if (activeGuard === guard) activeGuard = null;
  };
}

export function canLeaveRoute() {
  return !activeGuard || activeGuard();
}
