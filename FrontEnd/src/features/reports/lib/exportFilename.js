export function exportFilename(format, date, username = '') {
  const safeUser = username
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
  return `resumo_${username ? `${safeUser || 'usuario'}_` : ''}${date}.${format}`;
}
