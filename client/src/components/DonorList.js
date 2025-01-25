import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  MenuItem,
  TextField,
  Grid,
  ThemeProvider,
  createTheme,
  IconButton,
  Chip,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Favorite,
  Add,
  Phone,
  LocationOn,
  CalendarToday,
  Facebook,
  LocalHospital,
  ArrowBack,
  BloodtypeOutlined,
} from '@mui/icons-material';
import axios from 'axios';
import TermsDialog from './TermsDialog';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f5f5f5',
      light: '#ffffff',
      dark: '#e0e0e0',
      contrastText: '#000',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Arial', sans-serif",
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #d32f2f 30%, #ef5350 90%)',
          boxShadow: '0 3px 12px rgba(211, 47, 47, 0.3)',
          '&:hover': {
            background: 'linear-gradient(45deg, #c62828 30%, #d32f2f 90%)',
            boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 6px 30px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
            transition: 'all 0.3s ease',
          },
        },
      },
    },
  },
});

const bloodGroups = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DonorList() {
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [termsDialog, setTermsDialog] = useState({
    open: false,
    title: 'Register as Blood Donor',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/donors');
        setDonors(response.data);
      } catch (error) {
        console.error('Error fetching donors:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch donors. Please try again later.',
          severity: 'error'
        });
      }
    };
    fetchDonors();
  }, []);

  const handleRegisterClick = () => {
    setTermsDialog({ ...termsDialog, open: true });
  };

  const handleTermsClose = () => {
    setTermsDialog({ ...termsDialog, open: false });
  };

  const handleTermsAccept = () => {
    setTermsDialog({ ...termsDialog, open: false });
    navigate('/register');
  };

  const filteredDonors = selectedBloodGroup === 'All'
    ? donors
    : donors.filter(donor => donor.bloodGroup === selectedBloodGroup);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        pb: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '300px',
          background: 'linear-gradient(180deg, #d32f2f 0%, #ef5350 100%)',
          zIndex: 0,
        }
      }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Container maxWidth="lg">
            <Toolbar sx={{ px: { xs: 0 } }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalHospital />
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  BloodinNeed
                </Typography>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Add />}
                onClick={handleRegisterClick}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: 'primary.main',
                  '&:hover': { 
                    bgcolor: 'rgba(255,255,255,1)',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s',
                  },
                }}
              >
                Register as Donor
              </Button>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: 'white', mb: 6, mt: 4 }}>
            <Typography variant="h3" gutterBottom>
              Find Blood Donors
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Connect with willing donors in your area
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <BloodtypeOutlined color="primary" />
                  <Typography variant="subtitle1" sx={{ mr: 2 }}>
                    Filter by Blood Group:
                  </Typography>
                  {bloodGroups.map((group) => (
                    <Chip
                      key={group}
                      label={group}
                      onClick={() => setSelectedBloodGroup(group)}
                      color={selectedBloodGroup === group ? 'primary' : 'default'}
                      variant={selectedBloodGroup === group ? 'filled' : 'outlined'}
                      sx={{ 
                        borderRadius: '8px',
                        '&:hover': {
                          bgcolor: selectedBloodGroup === group ? 'primary.dark' : 'rgba(0,0,0,0.1)',
                        },
                      }}
                    />
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {filteredDonors.map((donor) => (
              <Grid item xs={12} sm={6} md={4} key={donor._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {donor.bloodGroup}
                      </Avatar>
                      <Box sx={{ ml: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {donor.name}
                        </Typography>
                        <Chip 
                          size="small"
                          label={donor.bloodGroup}
                          color="primary"
                          sx={{ borderRadius: '6px' }}
                        />
                      </Box>
                    </Box>

                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {donor.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {donor.phoneNumber}
                        </Typography>
                      </Box>

                      {donor.lastDonatedDate ? (
                        <Grid container spacing={1} alignItems="center">
                          <Grid item>
                            <CalendarToday fontSize="small" color="action" />
                          </Grid>
                          <Grid item>
                            <Typography variant="body2">
                              Last Donated: {format(new Date(donor.lastDonatedDate), 'dd/MM/yyyy')}
                            </Typography>
                          </Grid>
                        </Grid>
                      ) : null}
                    </Stack>

                    {donor.facebookProfileUrl && (
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        startIcon={<Facebook />}
                        href={donor.facebookProfileUrl}
                        target="_blank"
                        sx={{ mt: 2 }}
                      >
                        View Profile
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        <TermsDialog
          open={termsDialog.open}
          onClose={handleTermsClose}
          onAccept={handleTermsAccept}
          title={termsDialog.title}
        />
      </Box>
    </ThemeProvider>
  );
}

export default DonorList;
