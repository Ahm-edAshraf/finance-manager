import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AccountCircle } from '@mui/icons-material';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User>('profile', async () => {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return response.json();
  }, {
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        email: data.email,
      });
    }
  });

  const updateProfile = useMutation(
    async (data: { name: string; email: string }) => {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        setEditing(false);
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <AccountCircle sx={{ width: '100%', height: '100%' }} />
              )}
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {user?.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {user?.email}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editing}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  fullWidth
                />
                {editing && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfile.isLoading}
                  >
                    {updateProfile.isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </Box>
            </form>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
