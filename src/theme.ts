import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#4F46E5' },
        secondary: { main: '#DB2777' },
        warning: { main: '#F59E0B' },
        success: { main: '#10B981' },
        background: { default: '#F4F5FA', paper: '#FFFFFF' },
        text: { primary: '#0F172A', secondary: '#64748B' },
        divider: 'rgba(15, 23, 42, 0.08)',
      },
    },
    dark: {
      palette: {
        primary: { main: '#818CF8' },
        secondary: { main: '#F472B6' },
        warning: { main: '#FBBF24' },
        success: { main: '#34D399' },
        background: { default: '#0B0D14', paper: '#141824' },
        text: { primary: '#E2E8F0', secondary: '#94A3B8' },
        divider: 'rgba(255, 255, 255, 0.08)',
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.03em' },
    h4: { fontWeight: 800, letterSpacing: '-0.025em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1.6 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 20,
          border: `1px solid ${theme.vars.palette.divider}`,
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px -8px rgba(15,23,42,0.08)',
          ...theme.applyStyles('dark', { boxShadow: 'none' }),
        }),
      },
    },
    MuiButton: { styleOverrides: { root: { borderRadius: 999, paddingInline: 16 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 }, sizeSmall: { height: 22, fontSize: 12 } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: { tooltip: { borderRadius: 8, fontSize: 12, fontWeight: 500, padding: '6px 10px' } },
    },
    MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, paddingInline: 14 } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: 14, minWidth: 220 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 99 }, bar: { borderRadius: 99 } } },
  },
})
