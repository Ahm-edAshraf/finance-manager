import { useContext, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { DarkMode, LightMode, PictureAsPdf } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ColorModeContext } from '../../App';
import { apiCall, addAuthInterceptor } from '../../config/api';

type TimeRange = '7days' | '30days' | '90days' | '180days' | '365days';

export const Settings = () => {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const exportData = async (timeRange: string) => {
    try {
      const response = await apiCall(`/reports/export?timeRange=${timeRange}`, {
        ...addAuthInterceptor(),
        headers: {
          ...addAuthInterceptor().headers,
          'Accept': 'application/pdf'
        }
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-report-${timeRange}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  };

  const handleExportPDF = async () => {
    setExportStatus('loading');
    try {
      await exportData(timeRange);
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Appearance
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={mode === 'dark'}
                onChange={toggleColorMode}
                icon={<LightMode />}
                checkedIcon={<DarkMode />}
              />
            }
            label={`${mode === 'dark' ? 'Dark' : 'Light'} Mode`}
          />
        </Card>

        <Card sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Export Financial Report
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              >
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="180days">Last 6 Months</MenuItem>
                <MenuItem value="365days">Last Year</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={exportStatus === 'loading' ? <CircularProgress size={20} color="inherit" /> : <PictureAsPdf />}
              onClick={handleExportPDF}
              disabled={exportStatus === 'loading'}
              sx={{ height: '48px' }}
            >
              {exportStatus === 'loading' ? 'Generating Report...' : 'Export PDF Report'}
            </Button>

            {exportStatus === 'success' && (
              <Alert severity="success">
                Report exported successfully!
              </Alert>
            )}

            {exportStatus === 'error' && (
              <Alert severity="error">
                Failed to export report. Please try again.
              </Alert>
            )}
          </Box>
        </Card>
      </motion.div>
    </Box>
  );
};
