import { useState, useMemo, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PaletteMode } from '@mui/material';
import { getTheme } from './theme';
import { Layout } from './components/layout/Layout';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { Dashboard } from './components/dashboard/Dashboard';
import { Expenses } from './components/expenses/Expenses';
import { Budgets } from './components/budgets/Budgets';
import { Investments } from './components/investments/Investments';
import { Analytics } from './components/analytics/Analytics';
import { Profile } from './components/profile/Profile';
import { Settings } from './components/settings/Settings';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

export const ColorModeContext = createContext({
  mode: 'light' as PaletteMode,
  toggleColorMode: () => {},
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  const [mode, setMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as PaletteMode) || 'light';
  });

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        localStorage.setItem('themeMode', newMode);
      },
    }),
    [mode]
  );

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="investments" element={<Investments />} />
                  <Route path="analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                </Route>
              </Routes>
            </Router>
          </LocalizationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
