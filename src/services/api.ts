const API_URL = import.meta.env?.VITE_API_URL || 'https://web-production-3b13.up.railway.app/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const getToken = (): string => localStorage.getItem('token') || '';

export const api = {
  auth: {
    register: async (data: { phone: string; password: string; displayName: string }) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Registration failed');
      }
      return res.json();
    },

    login: async (data: { phone: string; password: string }) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Login failed');
      }
      return res.json();
    },
  },

  user: {
    getProfile: async () => {
      const res = await fetch(`${API_URL}/user/profile`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Profile fetch failed');
      }
      return res.json();
    },

    updateName: async (displayName: string) => {
      const res = await fetch(`${API_URL}/user/profile/name`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Name update failed');
      }
      return res.json();
    },

    updatePassword: async (data: { oldPassword: string; newPassword: string }) => {
      const res = await fetch(`${API_URL}/user/profile/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Password update failed');
      }
      return res.json();
    },

    getHistory: async (limit = 20) => {
      const res = await fetch(`${API_URL}/user/history?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'History fetch failed');
      }
      return res.json();
    },

    deleteHistory: async (id: string) => {
      const res = await fetch(`${API_URL}/user/history/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Delete failed');
      }
      return res.json();
    },

    clearHistory: async () => {
      const res = await fetch(`${API_URL}/user/history`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Clear failed');
      }
      return res.json();
    },
  },

  search: {
    // BUG FIX #1: field nomi 'image' bo'lishi kerak, 'file' emas
    identify: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_URL}/search/identify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Search failed');
      }
      return res.json();
    },

    getRemaining: async () => {
      const res = await fetch(`${API_URL}/search/remaining`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Failed to get remaining');
      }
      return res.json();
    },
  },

  admin: {
    getUsers: async (limit = 100) => {
      const res = await fetch(`${API_URL}/admin/users?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Failed to fetch users');
      }
      return res.json();
    },

    getUser: async (uid: string) => {
      const res = await fetch(`${API_URL}/admin/users/${uid}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Failed to fetch user');
      }
      return res.json();
    },

    deleteUser: async (uid: string) => {
      const res = await fetch(`${API_URL}/admin/users/${uid}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Delete failed');
      }
      return res.json();
    },

    toggleUser: async (uid: string, isActive: boolean) => {
      const res = await fetch(`${API_URL}/admin/users/${uid}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Toggle failed');
      }
      return res.json();
    },

    updateLimit: async (uid: string, dailyLimit: number) => {
      const res = await fetch(`${API_URL}/admin/users/${uid}/limit`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ dailyLimit }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Limit update failed');
      }
      return res.json();
    },

    updateRole: async (uid: string, role: 'admin' | 'user') => {
      const res = await fetch(`${API_URL}/admin/users/${uid}/role?role=${role}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Role update failed');
      }
      return res.json();
    },

    getHistory: async (limit = 50) => {
      const res = await fetch(`${API_URL}/admin/history?limit=${limit}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'History fetch failed');
      }
      return res.json();
    },

    getStats: async () => {
      const res = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Stats fetch failed');
      }
      return res.json();
    },

    updateSettings: async (settings: { defaultDailyLimit?: number; adminDailyLimit?: number }) => {
      const res = await fetch(`${API_URL}/admin/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Settings update failed');
      }
      return res.json();
    },
  },
};
