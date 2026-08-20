/**
 * SevaAI API Client
 * Handles HTTP requests to Express backend with JWT token authorization
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Get stored JWT auth token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem('sevaai_token');
};

/**
 * Set or clear JWT auth token in localStorage
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('sevaai_token', token);
  } else {
    localStorage.removeItem('sevaai_token');
  }
};

/**
 * Generic Fetch wrapper with JSON serialization and Bearer token attachment
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Vite returns an empty proxy response when the backend is stopped. Parse
    // defensively so users see the real connection problem instead of a JSON error.
    const rawBody = await response.text();
    let data = {};
    if (rawBody) {
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = { message: rawBody };
      }
    }

    if (!response.ok) {
      const error = new Error(
        data.message || `The server returned ${response.status}. Please try again.`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      const connectionError = new Error(
        'Cannot reach the SevaAI backend. Start it with "npm run dev" (or "npm run dev:mem") in the backend folder.'
      );
      connectionError.code = 'BACKEND_UNAVAILABLE';
      throw connectionError;
    }
    // If token is invalid or expired, clear it
    if (error.status === 401 && endpoint !== '/api/auth/login') {
      setAuthToken(null);
    }
    throw error;
  }
}

/**
 * SevaAI Auth API Service
 */
export const authApi = {
  /**
   * Register a new citizen
   */
  register: (userData) => {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Log in citizen with Email + Password
   */
  login: (credentials) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Request 6-digit OTP for Indian phone number
   */
  sendOtp: (phone) => {
    return request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  /**
   * Verify 6-digit OTP code
   */
  verifyOtp: (payload) => {
    return request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch currently logged-in citizen profile
   */
  getMe: () => {
    return request('/api/auth/me', {
      method: 'GET',
    });
  },
};

export const aiApi = {
  chat: (payload) => request('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

/** Application & Report Tracker API */
export const trackingApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    const suffix = params.toString() ? `?${params}` : '';
    return request(`/api/tracking${suffix}`, { method: 'GET' });
  },
  getSummary: () => request('/api/tracking/summary', { method: 'GET' }),
  getOne: (trackingId) => request(`/api/tracking/${encodeURIComponent(trackingId)}`, { method: 'GET' }),
  create: (payload) => request('/api/tracking', { method: 'POST', body: JSON.stringify(payload) }),
  updateStatus: (trackingId, payload) => request(`/api/tracking/${encodeURIComponent(trackingId)}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
};

/** Quick Access directory API */
export const quickAccessApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    return request(`/api/quick-access${params.toString() ? `?${params}` : ''}`, { method: 'GET' });
  },
  getFilters: () => request('/api/quick-access/filters', { method: 'GET' }),
  getOne: (id) => request(`/api/quick-access/${encodeURIComponent(id)}`, { method: 'GET' }),
};
