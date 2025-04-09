import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#62A800', // Updated green to match sidebar
      light: '#80c124',
      dark: '#4A8000',
      contrastText: '#fff',
    },
    secondary: {
      main: '#2196f3', // Blue - representing water/moisture
      light: '#6ec6ff',
      dark: '#0069c0',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        containedPrimary: {
          backgroundColor: '#62A800',
          '&:hover': {
            backgroundColor: '#538F00',
          },
        },
        outlinedPrimary: {
          borderColor: '#62A800',
          color: '#62A800',
          '&:hover': {
            backgroundColor: 'rgba(98, 168, 0, 0.04)',
            borderColor: '#538F00',
          },
        },
        textPrimary: {
          color: '#62A800',
          '&:hover': {
            backgroundColor: 'rgba(98, 168, 0, 0.04)',
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
