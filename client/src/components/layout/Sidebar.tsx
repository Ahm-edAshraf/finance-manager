import { useLocation, Link } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Receipt as ExpensesIcon,
  AccountBalance as BudgetsIcon,
  TrendingUp as InvestmentsIcon,
  BarChart as AnalyticsIcon,
  Psychology as AIIcon,
  Settings as SettingsIcon,
  TipsAndUpdates as InsightsIcon,
} from '@mui/icons-material';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const location = useLocation();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Expenses', icon: <ExpensesIcon />, path: '/expenses' },
    { text: 'Budgets', icon: <BudgetsIcon />, path: '/budgets' },
    { text: 'Investments', icon: <InvestmentsIcon />, path: '/investments' },
    { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  ];

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? 240 : 0,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        '& .MuiDrawer-paper': {
          backgroundColor: theme.palette.background.paper,
          width: 240,
          transition: theme.transitions.create(['transform', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          transform: open ? 'translateX(0)' : 'translateX(-240px)',
          overflowX: 'hidden',
          borderRight: `1px solid ${theme.palette.divider}`,
          height: '100vh',
          mt: '64px',
          pt: 0,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3, pb: 1 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ 
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '0.75rem',
          }}
        >
          Main Menu
        </Typography>
      </Box>

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            disablePadding
            sx={{
              display: 'block',
              mb: 0.5,
              color: isCurrentPath(item.path)
                ? theme.palette.primary.main
                : theme.palette.text.primary,
              bgcolor: isCurrentPath(item.path)
                ? theme.palette.mode === 'dark'
                  ? 'rgba(37, 99, 235, 0.15)'
                  : 'rgba(37, 99, 235, 0.08)'
                : 'transparent',
              borderRadius: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark'
                  ? 'rgba(37, 99, 235, 0.25)'
                  : 'rgba(37, 99, 235, 0.12)',
              },
            }}
          >
            <Box
              sx={{
                minHeight: 44,
                px: 2,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 'auto',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isCurrentPath(item.path) ? 600 : 500,
                }}
              />
            </Box>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

      <List sx={{ px: 2 }}>
        <ListItem
          component={Link}
          to="/settings"
          disablePadding
          sx={{
            display: 'block',
            mb: 0.5,
            color: isCurrentPath('/settings')
              ? theme.palette.primary.main
              : theme.palette.text.primary,
            bgcolor: isCurrentPath('/settings')
              ? theme.palette.mode === 'dark'
                ? 'rgba(37, 99, 235, 0.15)'
                : 'rgba(37, 99, 235, 0.08)'
              : 'transparent',
            borderRadius: 1,
            '&:hover': {
              bgcolor: theme.palette.mode === 'dark'
                ? 'rgba(37, 99, 235, 0.25)'
                : 'rgba(37, 99, 235, 0.12)',
            },
          }}
        >
          <Box
            sx={{
              minHeight: 44,
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 'auto',
                color: 'inherit',
              }}
            >
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: isCurrentPath('/settings') ? 600 : 500,
              }}
            />
          </Box>
        </ListItem>
      </List>
    </Drawer>
  );
};
