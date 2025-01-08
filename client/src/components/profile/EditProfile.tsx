import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from 'react-query';
import { apiCall } from '../../config/api';

interface EditProfileProps {
  open: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
  };
}

interface ProfileFormData {
  name: string;
  email: string;
}

const updateProfile = async (data: ProfileFormData) => {
  const response = await apiCall('/users/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
};

export const EditProfile = ({ open, onClose, currentUser }: EditProfileProps) => {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: currentUser.name,
    email: currentUser.email,
  });
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation(updateProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('profile');
      onClose();
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfileMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Profile</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateProfileMutation.isLoading}
          >
            {updateProfileMutation.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
