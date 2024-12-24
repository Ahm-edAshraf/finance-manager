import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useMutation } from 'react-query';
import { register } from '../../services/auth';

export const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const registerMutation = useMutation(register, {
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || 'An error occurred during registration');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    registerMutation.mutate(registerData);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          margin: '0 auto',
          padding: '0 16px'
        }}
      >
        <Card 
          elevation={4}
          sx={{ 
            p: 4,
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 'bold', 
              mb: 3,
              color: 'text.primary'
            }}
          >
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              sx={{ mb: 2 }}
            />

            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={registerMutation.isLoading}
              sx={{ 
                mb: 2,
                height: '48px',
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {registerMutation.isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  style={{ 
                    color: 'primary',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </Card>
      </motion.div>
    </Box>
  );
};
