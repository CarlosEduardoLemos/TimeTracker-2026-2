export function getApiErrorMessage(error) {
  if (error?.type === 'canceled') return 'Requisição cancelada';
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Falha desconhecida';
}
