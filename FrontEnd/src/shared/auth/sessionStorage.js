export const MANAGER_ACCESS_TOKEN_KEY = 'timetracker.manager.access-token';
export const AUTH_REQUIRED_EVENT = 'timetracker:auth-required';

export function readManagerAccessToken() {
  try {
    return window.sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeManagerAccessToken(token) {
  try {
    window.sessionStorage.setItem(MANAGER_ACCESS_TOKEN_KEY, token);
    return window.sessionStorage.getItem(MANAGER_ACCESS_TOKEN_KEY) === token;
  } catch {
    return false;
  }
}

export function clearManagerAccessToken() {
  try {
    window.sessionStorage.removeItem(MANAGER_ACCESS_TOKEN_KEY);
  } catch {
    // A disabled sessionStorage should not prevent the in-memory logout.
  }
}

export function notifyAuthenticationRequired() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(AUTH_REQUIRED_EVENT));
}
