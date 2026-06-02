const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('ayn-lang') || 'en';
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Accept-Language': lang
  };
};

// Generic request wrapper to handle responses and errors
const request = async (method, endpoint, data = null) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const headers = getAuthHeaders();
    
    let response;
    if (method === 'GET') {
      const controller = new AbortController();
      response = await fetch(url, { method, headers, signal: controller.signal });
    } else {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: data ? JSON.stringify(data) : null
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

const api = {
  // Authentication
  auth: {
    register: (userData) => request('POST', '/auth/register', userData),
    login: (credentials) => request('POST', '/auth/login', credentials),
    getMe: () => request('GET', '/auth/me'),
    updateLanguage: (preferredLanguage) => request('PUT', '/auth/language', { preferredLanguage }),
  },

  // Patients
  patient: {
    getAll: () => request('GET', '/patient'),
    getProfile: (patientId) => request('GET', `/patient/${patientId}`),
    updateProfile: (profileData) => request('PUT', '/patient/profile', profileData),
    getPrakriti: (patientId) => request('GET', `/patient/prakriti/${patientId}`),
    savePrakriti: (answers) => request('POST', '/patient/prakriti', { answers }),
    updateMedicalHistory: (patientId, medicalHistory) => 
      request('PUT', `/patient/${patientId}/medical-history`, { medicalHistory }),
    updateHydration: (date, count) => request('POST', '/patient/hydration', { date, count }),
    getProgress: (patientId) => request('GET', `/patient/progress/${patientId}`),
  },

  // Diet Plans
  dietPlan: {
    create: (planData) => request('POST', '/dietplan/create', planData),
    getPatientPlan: (patientId) => request('GET', `/dietplan/patient/${patientId}`),
    updatePlan: (planId, updateData) => request('PUT', `/dietplan/${planId}`, updateData),
    logCompliance: (complianceData) => request('POST', '/dietplan/compliance', complianceData),
    validate: (planData) => request('POST', '/dietplan/validate', planData),
  },

  // Foods / Viruddha Ahara
  foods: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request('GET', `/foods?${query}`);
    },
    getById: (id) => request('GET', `/foods/${id}`),
    checkCompatibility: (foodsList) => request('POST', '/foods/check-compatibility', { foods: foodsList }),
  },

  // Ritu Charya
  ritu: {
    getCurrent: () => request('GET', '/ritu/current'),
  },

  // Appointments
  appointments: {
    createSlots: (slotsData) => request('POST', '/appointments/slots', slotsData),
    getAvailable: () => request('GET', '/appointments/available'),
    book: (bookingData) => request('POST', '/appointments/book', bookingData),
    getMine: () => request('GET', '/appointments/mine'),
    updateStatus: (id, statusData) => request('PUT', `/appointments/${id}/status`, statusData),
  },

  // Chatbot
  chat: {
    getHistory: (patientId) => request('GET', `/chat/history/${patientId}`),
    sendMessage: (message, language) => request('POST', '/chat/message', { message, language }),
  },

  // Analytics
  analytics: {
    getOverview: () => request('GET', '/analytics/overview'),
    getDeficiencies: (patientId) => request('GET', `/analytics/deficiencies/${patientId}`),
  }
};

export default api;
