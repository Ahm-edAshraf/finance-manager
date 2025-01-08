import { apiCall } from '../config/api';

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData extends LoginData {
  name: string;
}

interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
  };
  token: string;
}

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiCall('/users/login', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const getProfile = async (): Promise<AuthResponse['user']> => {
  const response = await apiCall('/users/profile');
  return response.json();
};

// Add token to all requests
apiCall.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
