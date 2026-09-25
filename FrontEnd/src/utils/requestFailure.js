export function requestFailure(result, valid, label) {
  if (valid) return null;
  if (result.status === 'rejected') {
    const message = result.reason instanceof Error ? result.reason.message : 'Falha desconhecida';
    return `${label}: ${message}`;
  }
  return `${label}: resposta inválida da API`;
}
