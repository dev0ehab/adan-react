import { createTheme } from '@mui/material/styles';

const sage = '#4a7c59';
const moss = '#2f5233';
const cream = '#faf8f5';
const paper = '#fffefb';
const sand = '#e8e4dc';

export const appTheme = createTheme({
  direction: 'ltr',
  palette: {
    mode: 'light',
    primary: {
      main: sage,
      dark: moss,
      light: '#7fb685',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c4a77d',
      light: '#e8dcc4',
      dark: '#8d7350',
      contrastText: '#1a1a1a',
    },
    background: {
      default: cream,
      paper: paper,
    },
    text: {
      primary: '#1e2d24',
      secondary: '#5c6b62',
    },
    success: { main: '#3d8b63' },
    warning: { main: '#d4a017' },
    error: { main: '#c45c52' },
    info: { main: '#4a90a4' },
    divider: 'rgba(46, 61, 52, 0.08)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 14,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(30, 45, 36, 0.06)',
    '0 4px 14px rgba(30, 45, 36, 0.08)',
    '0 8px 24px rgba(30, 45, 36, 0.1)',
    '0 12px 32px rgba(30, 45, 36, 0.12)',
    ...Array(20).fill('0 12px 40px rgba(30, 45, 36, 0.14)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: cream,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 22,
          paddingBlock: 10,
          transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
          '&:active': { transform: 'scale(0.98)' },
        },
        containedPrimary: {
          boxShadow: '0 4px 14px rgba(74, 124, 89, 0.35)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(74, 124, 89, 0.42)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: '0 4px 20px rgba(30, 45, 36, 0.06)',
          border: `1px solid ${sand}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const softElevated = {
  boxShadow: '0 8px 30px rgba(30, 45, 36, 0.08)',
  border: `1px solid ${sand}`,
};
