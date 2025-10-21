export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const token = localStorage.getItem('token');
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {}),
    ...headers,
  };
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let errMsg = 'Request failed';
    try {
      const data = await res.json();
      errMsg = data.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }
  const contentType = res.headers.get('Content-Type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}
