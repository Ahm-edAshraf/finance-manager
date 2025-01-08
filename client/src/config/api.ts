export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = `${BASE_URL}/api`;

interface ApiOptions extends RequestInit {
  responseType?: 'blob';
}

// Helper function to get headers with auth token
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// Helper function for API calls
export const apiCall = async (endpoint: string, options: ApiOptions = {}) => {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response;
};

// Add interceptor-like functionality
export const addAuthInterceptor = () => {
  const token = localStorage.getItem('token');
  if (token) {
    const defaultHeaders = getAuthHeaders();
    return {
      headers: defaultHeaders
    };
  }
  return {};
};
