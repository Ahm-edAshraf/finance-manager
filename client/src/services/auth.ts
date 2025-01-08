import { apiCall, addAuthInterceptor } from '../config/api';

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
  const result = await response.json();
  localStorage.setItem('token', result.token);
  return result;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiCall('/users/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  const result = await response.json();
  localStorage.setItem('token', result.token);
  return result;
};

export const getProfile = async (): Promise<AuthResponse['user']> => {
  const response = await apiCall('/users/profile', addAuthInterceptor());
  return response.json();
};
