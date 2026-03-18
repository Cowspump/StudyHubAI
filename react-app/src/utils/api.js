const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function parseResponse(res) {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(optHeaders || {}),
    },
  });

  const data = await parseResponse(res);

  if (!res.ok) {
    const message = data?.detail || data?.error || data?.message || `Request failed: ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function authHeaders() {
  const token = JSON.parse(localStorage.getItem('auth_token') || 'null');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function adminAuthHeaders() {
  const token = sessionStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const adminApi = {
  login(username, password) {
    return apiRequest('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  getTeachers() {
    return apiRequest('/api/admin/teachers', { headers: adminAuthHeaders() });
  },
  createTeacher(payload) {
    return apiRequest('/api/admin/teachers', {
      method: 'POST',
      headers: adminAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },
  updateTeacher(id, payload) {
    return apiRequest(`/api/admin/teachers/${id}`, {
      method: 'PUT',
      headers: adminAuthHeaders(),
      body: JSON.stringify(payload),
    });
  },
  deleteTeacher(id) {
    return apiRequest(`/api/admin/teachers/${id}`, {
      method: 'DELETE',
      headers: adminAuthHeaders(),
    });
  },
  getStats() {
    return apiRequest('/api/admin/stats', { headers: adminAuthHeaders() });
  },
};

export const authApi = {
  register(payload) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  verifyEmailCode(payload) {
    return apiRequest('/api/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login(payload) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
