import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getProfile } from '../../services/auth';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  const { isLoading, error } = useQuery(
    ['profile'],
    getProfile,
    {
      enabled: !!token,
      retry: false,
      onError: () => {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
    }
  );

  if (!token) {
    // Redirect them to the login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
