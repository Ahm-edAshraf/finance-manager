import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { useQuery } from 'react-query';
import { apiCall } from '../../config/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Expense {
  _id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
}

interface TopExpense {
  category: string;
  amount: number;
}

interface AnalyticsData {
  expenses: Expense[];
  totalExpenses: number;
  expensesByCategory: {
    [key: string]: number;
  };
  expensesByMonth: {
    [key: string]: number;
  };
  expensesTrend: {
    labels: string[];
    data: number[];
  };
  budgetVsActual: {
    categories: string[];
    budgeted: number[];
    actual: number[];
  };
  savingsRate: number;
  topExpenses: TopExpense[];
}

const timeRanges = ['Last 7 Days', 'Last 30 Days', 'Last 3 Months', 'Last 6 Months', 'Last Year'];

const fetchAnalytics = async (timeRange: string) => {
  const response = await apiCall(`/analytics?timeRange=${encodeURIComponent(timeRange)}`);
  return response.json();
};

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const { data: analytics, isLoading } = useQuery(
    ['analytics', timeRange],
    () => fetchAnalytics(timeRange)
  );

  if (isLoading || !analytics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const expensesByCategory = {
    labels: Object.keys(analytics.expensesByCategory),
    datasets: [
      {
        data: Object.values(analytics.expensesByCategory),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
        ],
      },
    ],
  };

  const expensesTrend = {
    labels: analytics.expensesTrend.labels,
    datasets: [
      {
        label: 'Expenses',
        data: analytics.expensesTrend.data,
        fill: true,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const budgetVsActual = {
    labels: analytics.budgetVsActual.categories,
    datasets: [
      {
        label: 'Budgeted',
        data: analytics.budgetVsActual.budgeted,
        backgroundColor: 'rgba(33, 150, 243, 0.6)',
      },
      {
        label: 'Actual',
        data: analytics.budgetVsActual.actual,
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
      },
    ],
  };

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Analytics
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRanges.map((range: string) => (
              <MenuItem key={range} value={range}>
                {range}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={expensesByCategory}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Expenses Trend
            </Typography>
            <Box sx={{ height: 300 }}>
              <Line
                data={expensesTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
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
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Budget vs Actual Spending
            </Typography>
            <Box sx={{ height: 400 }}>
              <Bar
                data={budgetVsActual}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
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
                }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Savings Rate
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <Typography variant="h2" sx={{ color: 'primary.main' }}>
                {analytics.savingsRate}%
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Expenses
            </Typography>
            <Box>
              {analytics.topExpenses.map((expense: TopExpense, index: number) => (
                <Box
                  key={expense.category}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography>
                    {index + 1}. {expense.category}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold' }}>
                    ${expense.amount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
