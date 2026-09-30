import { getApiErrorMessage } from '../api/errorMessage';

export function requestFailure(result, valid, label) {
  if (valid) return null;
  if (result.status === 'rejected') {
    return `${label}: ${getApiErrorMessage(result.reason)}`;
  }
  return `${label}: resposta inválida da API`;
}
