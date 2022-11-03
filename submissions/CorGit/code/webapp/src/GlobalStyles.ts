// @ts-ignore
// @ts-ignore

import {createTheme, Theme} from '@mui/material/styles';

export const theme = createTheme({
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: 30,
      fontWeight: 600,
      fontFamily: "Roboto"
    },
    h2: {
      fontSize: 24,
      fontWeight: 600,
      fontFamily: "Roboto"
    },
    h3: {
      fontSize: 22,
      fontFamily: "Roboto",
      fontWeight: 600
    },
    h4: {
      fontSize: 18,
      fontFamily: "Roboto",
      fontWeight: 600
    },
    h5: {
      fontSize: 16,
      fontFamily: "Roboto"
    },
    h6: {
      fontSize: 14,
      fontFamily: "Roboto"
    },
    body1: {
      fontSize: 18,
      fontFamily: "Roboto"
    },
    body2: {
      fontSize: 14,
      fontFamily: "Roboto"
    },
    subtitle1: {
      fontSize: 16,
      fontFamily: "Roboto"
    },
    button: {
      fontWeight: 600,
      fontFamily: "Roboto"
    }
  },
  palette: {
    primary: {
      main: '#158fd6',
      light: '#63bfff',
      dark: '#0062a4'
    },
    secondary: {
      main: '#ed9020',
      light: '#ffc154',
      dark: '#b56200'
    },
    text: {
      primary: '#4A4A4A',
      secondary: '#737373',
      disabled: '#B8B8B8',
    },
    error: { main: '#F44336' },
    success: { main: '#80D283' },
    action: {
      selected: '#E6E6E6'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        a {
          color: #ed9020
        }
      `
    }
  }
});

// @ts-ignore
declare module '@mui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}
