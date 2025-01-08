import { Grid, Card, Typography, IconButton, Box, CircularProgress } from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  MoreVert,
  AccountBalance,
  ShoppingCart,
  LocalAtm,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { useQuery } from 'react-query';
import { apiCall } from '../../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery('dashboard', async () => {
    const response = await apiCall('/dashboard');
    return response.json();
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading dashboard data. Please try again later.</Typography>
      </Box>
    );
  }

  const { 
    totalBalance = 0, 
    totalMonthlyExpenses = 0, 
    monthlyIncome = 0, 
    expenseTrend = { labels: [], data: [] },
    expenseChange = 0,
    incomeChange = 0,
    balanceChange = 0
  } = dashboardData || {};

  const formattedChartData = {
    labels: expenseTrend.labels || [],
    datasets: [
      {
        label: 'Expenses',
        data: expenseTrend.data || [],
        fill: true,
        backgroundColor: 'rgba(67, 56, 202, 0.1)',
        borderColor: '#4338CA',
        tension: 0.4,
      }
    ],
  };

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: '2rem' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton sx={{ bgcolor: 'background.paper', boxShadow: 1 }}>
              <MoreVert />
            </IconButton>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, '&:hover': { boxShadow: 3, transform: 'translateY(-4px)', transition: 'all 0.3s' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Total Balance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      ${totalBalance.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: balanceChange >= 0 ? 'success.main' : 'error.main' }}>
                      {balanceChange >= 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                      <Typography variant="body2">{balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AccountBalance sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, '&:hover': { boxShadow: 3, transform: 'translateY(-4px)', transition: 'all 0.3s' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Monthly Expenses
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      ${totalMonthlyExpenses.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: expenseChange >= 0 ? 'error.main' : 'success.main' }}>
                      {expenseChange >= 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                      <Typography variant="body2">{expenseChange >= 0 ? '+' : ''}{expenseChange.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    bgcolor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShoppingCart sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3, '&:hover': { boxShadow: 3, transform: 'translateY(-4px)', transition: 'all 0.3s' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Monthly Income
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                      ${monthlyIncome.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: incomeChange >= 0 ? 'success.main' : 'error.main' }}>
                      {incomeChange >= 0 ? <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} /> : <TrendingDown sx={{ fontSize: 16, mr: 0.5 }} />}
                      <Typography variant="body2">{incomeChange >= 0 ? '+' : ''}{incomeChange.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    bgcolor: 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <LocalAtm sx={{ color: 'white' }} />
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>

          {/* Chart */}
          <Grid item xs={12}>
            <motion.div variants={itemVariants}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Financial Overview
                </Typography>
                <Box sx={{ height: 400, position: 'relative' }}>
                  {expenseTrend.data && expenseTrend.data.length > 0 ? (
                    <Line data={formattedChartData} options={chartOptions} />
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      color: 'text.secondary'
                    }}>
                      <Typography>No expense data available</Typography>
                    </Box>
                  )}
                </Box>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );
};
