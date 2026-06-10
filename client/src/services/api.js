const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('ayn-lang') || 'en';

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Accept-Language': lang,
  };
};

// request wrapper
const request = async (method, endpoint, data = null) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = getAuthHeaders();

    let response;

    if (method === 'GET') {
      response = await fetch(url, { method, headers });
    } else {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: data ? JSON.stringify(data) : null,
      });
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    return result;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
};

// FULL API OBJECT (FIXED)
const api = {
  auth: {
    register: (userData) =>
      request('POST', '/api/auth/register', userData),

    login: (credentials) =>
      request('POST', '/api/auth/login', credentials),

    getMe: () =>
      request('GET', '/api/auth/me'),

    updateLanguage: (preferredLanguage) =>
      request('PUT', '/api/auth/language', { preferredLanguage }),
  },

  patient: {
    getAll: () => request('GET', '/api/patient'),
    getProfile: (patientId) => request('GET', `/api/patient/${patientId}`),
    updateProfile: (profileData) =>
      request('PUT', '/api/patient/profile', profileData),
  },

  dietPlan: {
    create: (planData) =>
      request('POST', '/api/dietplan/create', planData),
  },

  foods: {
    getAll: () => request('GET', '/api/foods'),
  },

  ritu: {
    getCurrent: () => request('GET', '/api/ritu/current'),
  },

  appointments: {
    getAvailable: () =>
      request('GET', '/api/appointments/available'),
  },

  chat: {
    sendMessage: (message, language) =>
      request('POST', '/api/chat/message', { message, language }),
  },

  analytics: {
    getOverview: () => request('GET', '/api/analytics/overview'),
  },
};

export default api;
