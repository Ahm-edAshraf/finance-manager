import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  IconButton,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';

interface Budget {
  _id: string;
  category: string;
  amount: number;
  currentSpending: number;
  percentageUsed: number;
  remaining: number;
  period: 'monthly' | 'yearly';
  description?: string;
}

interface BudgetFormData {
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  description?: string;
}

const categories = [
  'Food',
  'Rent',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Other'
];

const initialFormData: BudgetFormData = {
  category: '',
  amount: 0,
  period: 'monthly',
  description: '',
};

export const Budgets = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<BudgetFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch budgets
  const { data: budgets, isLoading } = useQuery<Budget[]>('budgets', async () => {
    const response = await fetch('http://localhost:5000/api/budgets', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch budgets');
    }
    return response.json();
  });

  // Create budget mutation
  const createBudget = useMutation(
    async (data: BudgetFormData) => {
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create budget');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Update budget mutation
  const updateBudget = useMutation(
    async ({ id, data }: { id: string; data: BudgetFormData }) => {
      const response = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update budget');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Delete budget mutation
  const deleteBudget = useMutation(
    async (id: string) => {
      const response = await fetch(`http://localhost:5000/api/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete budget');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('budgets');
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  const handleOpen = (budget?: Budget) => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount,
        period: budget.period,
        description: budget.description,
      });
      setEditingId(budget._id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormData(initialFormData);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateBudget.mutate({ id: editingId, data: formData });
    } else {
      createBudget.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Budgets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{
            borderRadius: 2,
            px: 3,
          }}
        >
          Add Budget
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {budgets?.map((budget) => (
          <Grid item xs={12} sm={6} md={4} key={budget._id}>
            <Card
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
                    ${budget.amount}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 0.5 }}>
                    Monthly Budget
                  </Typography>
                </Box>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(budget)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteBudget.mutate(budget._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 2 }}>
                {budget.category}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Spent: ${budget.currentSpending}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {budget.percentageUsed}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={budget.percentageUsed}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: (theme) => 
                        budget.percentageUsed > 90 ? theme.palette.error.main :
                        budget.percentageUsed > 70 ? theme.palette.warning.main :
                        theme.palette.success.main
                    }
                  }}
                />
              </Box>

              {budget.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  {budget.description}
                </Typography>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                label="Category"
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={formData.period}
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'yearly' }))}
                label="Period"
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
