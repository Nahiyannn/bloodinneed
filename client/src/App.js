import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import DonorForm from './components/DonorForm';
import DonorList from './components/DonorList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#e53935',
      light: '#ff6f60',
      dark: '#ab000d',
    },
    secondary: {
      main: '#2196f3',
      light: '#6ec6ff',
      dark: '#0069c0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<DonorList />} />
          <Route path="/register" element={<DonorForm />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
