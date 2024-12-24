import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#7c3aed',
      light: '#a78bfa',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#0f172a' : '#f8fafc',
      paper: mode === 'dark' ? '#1e293b' : '#ffffff',
    },
    text: {
      primary: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      secondary: mode === 'dark' ? '#94a3b8' : '#64748b',
    },
    divider: mode === 'dark' ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.12)',
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    action: {
      active: mode === 'dark' ? '#f1f5f9' : '#0f172a',
      hover: mode === 'dark' ? 'rgba(241, 245, 249, 0.08)' : 'rgba(15, 23, 42, 0.08)',
      selected: mode === 'dark' ? 'rgba(241, 245, 249, 0.16)' : 'rgba(15, 23, 42, 0.16)',
      disabled: mode === 'dark' ? 'rgba(241, 245, 249, 0.3)' : 'rgba(15, 23, 42, 0.3)',
      disabledBackground: mode === 'dark' ? 'rgba(241, 245, 249, 0.12)' : 'rgba(15, 23, 42, 0.12)',
    },
  },
});

export const getTheme = (mode: PaletteMode) => {
  const tokens = getDesignTokens(mode);

  return createTheme({
    ...tokens,
    typography: {
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        color: tokens.palette.text.primary,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        color: tokens.palette.text.primary,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        color: tokens.palette.text.primary,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: tokens.palette.text.primary,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        color: tokens.palette.text.primary,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        color: tokens.palette.text.primary,
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 500,
        color: tokens.palette.text.secondary,
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: tokens.palette.text.secondary,
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: tokens.palette.text.primary,
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: tokens.palette.text.primary,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: tokens.palette.background.default,
            color: tokens.palette.text.primary,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.palette.background.paper,
            color: tokens.palette.text.primary,
            backgroundImage: 'none',
            borderRadius: 12,
            boxShadow: mode === 'dark'
              ? '0px 4px 6px -1px rgba(0, 0, 0, 0.2), 0px 2px 4px -1px rgba(0, 0, 0, 0.14)'
              : '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.palette.background.paper,
            color: tokens.palette.text.primary,
            backgroundImage: 'none',
            borderRadius: 12,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 16px',
            '&.MuiButton-contained': {
              color: '#ffffff',
            },
            '&.MuiButton-text': {
              color: tokens.palette.text.primary,
            },
            '&.MuiButton-outlined': {
              color: tokens.palette.text.primary,
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: tokens.palette.text.primary,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: tokens.palette.background.paper,
            color: tokens.palette.text.primary,
            backgroundImage: 'none',
            borderBottom: `1px solid ${tokens.palette.divider}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: tokens.palette.background.paper,
            color: tokens.palette.text.primary,
            backgroundImage: 'none',
            borderRight: `1px solid ${tokens.palette.divider}`,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: 'inherit',
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            color: 'inherit',
          },
          secondary: {
            color: tokens.palette.text.secondary,
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            color: tokens.palette.text.primary,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.palette.divider,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.palette.text.secondary,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.palette.primary.main,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            color: tokens.palette.text.primary,
            borderBottom: `1px solid ${tokens.palette.divider}`,
          },
          head: {
            color: tokens.palette.text.primary,
            fontWeight: 600,
          },
        },
      },
    },
  });
};

export type Theme = ReturnType<typeof getTheme>;
