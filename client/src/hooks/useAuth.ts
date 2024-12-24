import { useQuery, useQueryClient } from 'react-query';
import { getProfile } from '../services/auth';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const { data: user, isLoading } = useQuery(
    ['profile'],
    getProfile,
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
    }
  );

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    queryClient.clear();
    window.location.href = '/login';
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !!token,
    logout,
  };
};
