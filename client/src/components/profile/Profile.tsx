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
import { apiCall } from '../../config/api';
import { AccountCircle } from '@mui/icons-material';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface ProfileData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

const fetchProfile = async () => {
  const response = await apiCall('/users/profile');
  return response.json();
};

const updateProfile = async (data: ProfileData) => {
  const response = await apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const Profile = () => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery('profile', fetchProfile, {
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        email: data.email,
        currentPassword: '',
        newPassword: '',
      });
    }
  });

  const updateProfileMutation = useMutation(updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('profile');
      setIsEditing(false);
      setFormData({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
      });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
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
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} />
              ) : (
                <AccountCircle sx={{ width: '100%', height: '100%' }} />
              )}
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {profile?.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {profile?.email}
            </Typography>
            <Button
              variant="contained"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
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
                  disabled={!isEditing}
                  fullWidth
                />
                <TextField
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!isEditing}
                  fullWidth
                />
                {isEditing && (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfileMutation.isLoading}
                  >
                    {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
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
