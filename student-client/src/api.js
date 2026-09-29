const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function request(path, options) {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Unable to load data. Please try again.');
  return body;
}

export const studentsApi = {
  list: () => request('/students'),
  create: (student) => request('/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) }),
  update: (id, student) => request(`/students/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(student) }),
  remove: (id) => request(`/students/${id}`, { method: 'DELETE' }),
};
