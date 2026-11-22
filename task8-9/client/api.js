const BASE = 'http://localhost:3001';

const request = async (url, options = {}) => {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Ошибка ${res.status}`);
  return data;
};

export const getCategories = () => request('/categories');
export const createCategory = body => request('/categories', { method: 'POST', body: JSON.stringify(body) });

export const getTransactions = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
  const qs = params.toString();
  return request(`/transactions${qs ? `?${qs}` : ''}`);
};

export const createTransaction = body => request('/transactions', { method: 'POST', body: JSON.stringify(body) });
export const updateTransaction = (id, body) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteTransaction = id => request(`/transactions/${id}`, { method: 'DELETE' });