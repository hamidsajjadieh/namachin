/* Tiny fetch wrapper for the admin API. Bearer token in Authorization
   header; a 401 emits 'namadmin:401' so AdminProvider can sign the user out. */

const TOKEN_KEY = 'namadmin_token';

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch { /* storage unavailable */ }
}

export async function api(path, { method = 'GET', body, form } = {}) {
  const token = getToken();
  const headers = {};
  if (!form && body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: form ?? (body ? JSON.stringify(body) : undefined),
  });
  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('namadmin:401'));
    throw new Error('unauthorized');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `request_failed_${res.status}`);
  return data;
}
