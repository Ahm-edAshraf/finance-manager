import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiCall } from '../../config/api';

interface Expense {
  _id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  location?: string;
  tags?: string[];
  isRecurring: boolean;
}

interface ExpenseFormData {
  amount: number;
  category: string;
  description: string;
  date: Date;
  paymentMethod: string;
  location?: string;
  tags?: string[];
  isRecurring: boolean;
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

const paymentMethods = [
  'credit',
  'debit',
  'cash',
  'online',
  'other'
];

const initialFormData: ExpenseFormData = {
  amount: 0,
  category: 'Other',
  description: '',
  date: new Date(),
  paymentMethod: 'other',
  location: '',
  tags: [],
  isRecurring: false
};

const fetchExpenses = async () => {
  const response = await apiCall('/expenses');
  return response.json();
};

const addExpense = async (data: ExpenseFormData) => {
  const response = await apiCall('/expenses', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      date: data.date.toISOString()
    })
  });
  return response.json();
};

const updateExpense = async ({ id, data }: { id: string; data: ExpenseFormData }) => {
  const response = await apiCall(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...data,
      date: data.date.toISOString()
    })
  });
  return response.json();
};

const deleteExpense = async (id: string) => {
  const response = await apiCall(`/expenses/${id}`, {
    method: 'DELETE'
  });
  return response.json();
};

export const Expenses = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch expenses
  const { data: expenses, isLoading } = useQuery<Expense[]>('expenses', fetchExpenses);

  // Create expense mutation
  const createExpense = useMutation(
    addExpense,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Update expense mutation
  const updateExpenseMutation = useMutation(
    updateExpense,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Delete expense mutation
  const deleteExpenseMutation = useMutation(
    deleteExpense,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('expenses');
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  const handleOpen = (expense?: Expense) => {
    if (expense) {
      setFormData({
        ...expense,
        date: new Date(expense.date)
      });
      setEditingId(expense._id);
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
    // Validate required fields
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }
    if (!formData.paymentMethod) {
      setError('Please select a payment method');
      return;
    }

    if (editingId) {
      updateExpenseMutation.mutate({ id: editingId, data: formData });
    } else {
      createExpense.mutate(formData);
    }
  };

  const handleAddTag = () => {
    if (newTag && !formData.tags?.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Expenses
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
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {expenses?.map((expense) => (
          <Grid item xs={12} sm={6} md={4} key={expense._id}>
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
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 600 }}>
                  ${expense.amount}
                </Typography>
                <Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(expense)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => deleteExpenseMutation.mutate(expense._id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                {expense.description}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={expense.category}
                  size="small"
                  sx={{
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                    color: 'primary.main',
                    fontWeight: 500,
                  }}
                />
                {expense.tags?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(37, 99, 235, 0.1)' : 'rgba(37, 99, 235, 0.05)',
                      color: (theme) => theme.palette.text.primary,
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>

              <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(expense.date).toLocaleDateString()}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Amount"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setFormData(prev => ({ ...prev, amount: value }));
                }
              }}
              inputProps={{ min: 0, step: "0.01" }}
              required
              fullWidth
              error={!!error && (!formData.amount || isNaN(formData.amount) || formData.amount <= 0)}
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              fullWidth
            />
            <FormControl 
              fullWidth 
              required
              error={!!error && !formData.category}
            >
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newValue: Date | null) => setFormData(prev => ({ ...prev, date: newValue || new Date() }))}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    required: true 
                  } 
                }}
              />
            </LocalizationProvider>
            <FormControl 
              fullWidth 
              required
              error={!!error && !formData.paymentMethod}
            >
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                label="Payment Method"
              >
                {paymentMethods.map(method => (
                  <MenuItem key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Location (Optional)"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              fullWidth
            />
            <Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  label="Add Tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  size="small"
                />
                <Button variant="outlined" onClick={handleAddTag}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.tags?.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
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
