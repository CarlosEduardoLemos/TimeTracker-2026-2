export function formatActivityStatus(person, available = true) {
  if (!available) return 'Indisponível';
  if (person.status === 'offline') return 'Sem leitura recente';
  if (person.status === 'no-data') return 'Sem dados';
  if (person.status === 'online') return 'Online';
  if (person.status === 'ausente') return 'Ausente';
  return 'Indisponível';
}
