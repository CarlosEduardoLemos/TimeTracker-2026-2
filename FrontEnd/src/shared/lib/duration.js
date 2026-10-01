export function fmtDuration(seconds = 0) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value < 0) return '—';
  return `${Math.floor(value / 3600)}h ${String(Math.floor((value % 3600) / 60)).padStart(2, '0')}min`;
}
