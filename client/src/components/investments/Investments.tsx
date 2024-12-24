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
  IconButton,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PageContainer } from '../common/PageContainer';

interface Investment {
  _id: string;
  name: string;
  type: string;
  amount: number;
  purchaseDate: string;
  currentValue: number;
  returnRate: number;
  notes?: string;
}

interface InvestmentFormData {
  name: string;
  type: string;
  amount: number;
  purchaseDate: string;
  notes?: string;
}

const investmentTypes = [
  'Stocks',
  'Bonds',
  'Mutual Funds',
  'ETFs',
  'Real Estate',
  'Cryptocurrency',
  'Other',
];

const initialFormData: InvestmentFormData = {
  name: '',
  type: '',
  amount: 0,
  purchaseDate: new Date().toISOString().split('T')[0],
  notes: '',
};

export const Investments = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<InvestmentFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch investments
  const { data: investments, isLoading } = useQuery<Investment[]>('investments', async () => {
    const response = await fetch('http://localhost:5000/api/investments', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch investments');
    }
    return response.json();
  });

  // Create investment mutation
  const createInvestment = useMutation(
    async (data: InvestmentFormData) => {
      const response = await fetch('http://localhost:5000/api/investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to create investment');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('investments');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Update investment mutation
  const updateInvestment = useMutation(
    async ({ id, data }: { id: string; data: InvestmentFormData }) => {
      const response = await fetch(`http://localhost:5000/api/investments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Failed to update investment');
      }
      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('investments');
        handleClose();
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  // Delete investment mutation
  const deleteInvestment = useMutation(
    async (id: string) => {
      const response = await fetch(`http://localhost:5000/api/investments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to delete investment');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('investments');
      },
      onError: (error: Error) => {
        setError(error.message);
      }
    }
  );

  const handleOpen = (investment?: Investment) => {
    if (investment) {
      setFormData({
        name: investment.name,
        type: investment.type,
        amount: investment.amount,
        purchaseDate: new Date(investment.purchaseDate).toISOString().split('T')[0],
        notes: investment.notes,
      });
      setEditingId(investment._id);
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
      updateInvestment.mutate({ id: editingId, data: formData });
    } else {
      createInvestment.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalInvestment = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
  const totalCurrentValue = investments?.reduce((sum, inv) => sum + inv.currentValue, 0) || 0;
  const totalReturn = totalCurrentValue - totalInvestment;
  const returnRate = (totalReturn / totalInvestment) * 100;
  const returnColor = totalReturn >= 0 ? 'success.main' : 'error.main';

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Investments
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography color="textSecondary" gutterBottom>
              Total Investment
            </Typography>
            <Typography variant="h4">${totalInvestment}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography color="textSecondary" gutterBottom>
              Current Value
            </Typography>
            <Typography variant="h4">${totalCurrentValue}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card elevation={0} sx={{ p: 3, height: '100%' }}>
            <Typography color="textSecondary" gutterBottom>
              Total Return
            </Typography>
            <Typography variant="h4" color={returnColor}>
              ${totalReturn} <Typography component="span" color="textSecondary">{returnRate.toFixed(2)}%</Typography>
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Investment
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${totalInvestment.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography color="text.secondary" gutterBottom>
              Current Value
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              ${totalCurrentValue.toLocaleString()}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Typography color="text.secondary" gutterBottom>
              Total Return
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: totalReturn >= 0 ? 'success.main' : 'error.main' }}>
                ${Math.abs(totalReturn).toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                {totalReturn >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                <Typography variant="body2" sx={{ color: totalReturn >= 0 ? 'success.main' : 'error.main' }}>
                  {returnRate.toFixed(2)}%
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Investment Amount</TableCell>
              <TableCell align="right">Current Value</TableCell>
              <TableCell align="right">Return</TableCell>
              <TableCell align="right">Return Rate</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {investments?.map((investment) => {
              const investmentReturn = investment.currentValue - investment.amount;
              return (
                <TableRow key={investment._id}>
                  <TableCell>{investment.name}</TableCell>
                  <TableCell>{investment.type}</TableCell>
                  <TableCell align="right">${investment.amount.toLocaleString()}</TableCell>
                  <TableCell align="right">${investment.currentValue.toLocaleString()}</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: investmentReturn >= 0 ? 'success.main' : 'error.main' }}
                  >
                    ${Math.abs(investmentReturn).toLocaleString()}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ color: investment.returnRate >= 0 ? 'success.main' : 'error.main' }}
                  >
                    {investment.returnRate.toFixed(2)}%
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpen(investment)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => deleteInvestment.mutate(investment._id)} 
                      size="small" 
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Investment' : 'Add Investment'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Investment Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                label="Type"
              >
                {investmentTypes.map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Investment Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
              fullWidth
            />
            <TextField
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
