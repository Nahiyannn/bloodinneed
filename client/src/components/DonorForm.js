import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  AppBar,
  Toolbar,
  Stack,
  ThemeProvider,
  createTheme,
  Grid,
  Snackbar,
  IconButton,
  Divider,
} from '@mui/material';
import { Favorite, Search, ArrowBack, LocalHospital, BloodtypeOutlined, Phone } from '@mui/icons-material';
import api from '../config/api';
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
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#fff',
            '&:hover fieldset': {
              borderColor: '#d32f2f',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#d32f2f',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function DonorForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    phoneNumber: '',
    lastDonatedDate: '',
    bloodGroup: '',
    facebookProfileUrl: '',
  });
  const [errors, setErrors] = useState({});
  const [termsDialog, setTermsDialog] = useState({
    open: false,
    action: null,
    title: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name is required and must be at least 2 characters';
    }

    // Blood group validation
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Please select a blood group';
    }

    // Location validation
    if (!formData.location || formData.location.trim().length < 2) {
      newErrors.location = 'Location is required';
    }

    // Contact validation - either phone or Facebook must be provided
    const hasValidPhone = formData.phoneNumber && /^\d{11}$/.test(formData.phoneNumber);
    
    // Improved Facebook URL validation - allow usernames with more characters and special chars
    const facebookUrlRegex = /^https?:\/\/(www\.)?(facebook|fb)\.com\/[\w.-]+[^/]$/;
    const hasValidFacebook = formData.facebookProfileUrl && facebookUrlRegex.test(formData.facebookProfileUrl);

    if (!hasValidPhone && !hasValidFacebook) {
      newErrors.phoneNumber = 'Either Phone Number or Facebook Profile URL is required';
      newErrors.facebookProfileUrl = 'Either Phone Number or Facebook Profile URL is required';
    } else {
      // If phone is provided, validate format
      if (formData.phoneNumber && !hasValidPhone) {
        newErrors.phoneNumber = 'Phone Number must be exactly 11 digits';
      }
      // If Facebook URL is provided, validate format
      if (formData.facebookProfileUrl && !hasValidFacebook) {
        newErrors.facebookProfileUrl = 'Please enter a complete Facebook profile URL (e.g., https://www.facebook.com/username)';
      }
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid Gmail address';
    }

    // Date validation
    if (formData.lastDonatedDate) {
      const donatedDate = new Date(formData.lastDonatedDate);
      const currentDate = new Date();
      if (isNaN(donatedDate.getTime())) {
        newErrors.lastDonatedDate = 'Please enter a valid date';
      } else if (donatedDate > currentDate) {
        newErrors.lastDonatedDate = 'Last donated date cannot be in the future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phoneNumber') {
      const numbersOnly = value.replace(/\D/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: numbersOnly });
      return;
    }

    // Special handling for date
    if (name === 'lastDonatedDate') {
      try {
        // Ensure the date is valid
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          setFormData({ ...formData, [name]: value });
        }
      } catch (err) {
        console.error('Invalid date:', err);
      }
      return;
    }

    // Special handling for Facebook URL
    if (name === 'facebookProfileUrl' && value) {
      let formattedUrl = value;
      if (!value.startsWith('http')) {
        formattedUrl = `https://www.facebook.com/${value}`;
      }
      setFormData({ ...formData, [name]: formattedUrl });
      return;
    }

    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please correct the errors in the form',
        severity: 'error'
      });
      return;
    }

    setTermsDialog({
      open: true,
      action: 'submit',
      title: 'Submit Donor Registration',
    });
  };

  const handleFindDonors = () => {
    setTermsDialog({
      open: true,
      action: 'find',
      title: 'Access Donor Information',
    });
  };

  const handleTermsClose = () => {
    setTermsDialog({ ...termsDialog, open: false });
  };

  const handleTermsAccept = async () => {
    const { action } = termsDialog;
    setTermsDialog({ ...termsDialog, open: false });

    if (action === 'submit') {
      try {
        const response = await api.post('/api/donors', formData);
        console.log('Donor registered:', response.data);
        setSnackbar({ 
          open: true, 
          message: 'Registration successful! Redirecting to donor list...', 
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error);
        let errorMessage = 'Registration failed. ';
        
        // Handle different types of errors
        if (error.response) {
          // Server responded with an error
          if (error.response.data?.error) {
            errorMessage += error.response.data.error;
          } else if (error.response.status === 400) {
            errorMessage += 'Invalid form data. Please check your inputs.';
          } else {
            errorMessage += 'Server error. Please try again.';
          }
        } else if (error.request) {
          // Request was made but no response
          errorMessage += 'Cannot connect to server. Please check your connection.';
        } else {
          // Something else happened
          errorMessage += 'An unexpected error occurred. Please try again.';
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } else if (action === 'find') {
      navigate('/');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => navigate('/')}
                sx={{ mr: 2 }}
              >
                <ArrowBack />
              </IconButton>
              <Stack direction="row" alignItems="center" spacing={1}>
                <LocalHospital />
                <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                  BloodinNeed
                </Typography>
              </Stack>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                color="inherit"
                startIcon={<Search />}
                onClick={handleFindDonors}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                  backdropFilter: 'blur(10px)',
                }}
              >
                Find Donors
              </Button>
            </Toolbar>
          </Container>
        </AppBar>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', color: 'white', mb: 6, mt: 4 }}>
            <Typography variant="h3" gutterBottom>
              Become a Blood Donor
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9 }}>
              Your donation can save lives
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, md: 6 },
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              background: '#fff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(239,83,80,0.1) 0%, rgba(255,255,255,0) 70%)',
                zIndex: 0,
              }
            }}
          >
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BloodtypeOutlined color="primary" />
                    Personal Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Blood Group"
                    name="bloodGroup"
                    select
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                    error={!!errors.bloodGroup}
                    helperText={errors.bloodGroup}
                  >
                    {bloodGroups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    error={!!errors.location}
                    helperText={errors.location}
                    placeholder="Enter your city or area"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ my: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone color="primary" />
                    Contact Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber || 'Enter 11 digit number (optional if Facebook provided)'}
                    placeholder="01XXXXXXXXX"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={!!errors.email}
                    helperText={errors.email || 'Enter your Gmail address'}
                    placeholder="example@gmail.com"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Donated Date"
                    type="date"
                    name="lastDonatedDate"
                    value={formData.lastDonatedDate}
                    onChange={handleChange}
                    error={!!errors.lastDonatedDate}
                    helperText={errors.lastDonatedDate || 'When did you last donate blood? (Optional)'}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      max: format(new Date(), 'yyyy-MM-dd')
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facebook Profile"
                    name="facebookProfileUrl"
                    value={formData.facebookProfileUrl}
                    onChange={handleChange}
                    error={!!errors.facebookProfileUrl}
                    helperText={errors.facebookProfileUrl || 'Enter complete profile URL (optional if Phone provided)'}
                    placeholder="https://www.facebook.com/username"
                    sx={{
                      '& .MuiFormHelperText-root': {
                        color: errors.facebookProfileUrl ? 'error.main' : 'text.secondary',
                        marginLeft: 0,
                        marginTop: 1
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Favorite />}
                      sx={{
                        minWidth: 250,
                        py: 1.5,
                        fontSize: '1.1rem',
                      }}
                    >
                      Register as Donor
                    </Button>
                    <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                      By registering, you agree to our terms and conditions
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>

        <TermsDialog
          open={termsDialog.open}
          onClose={handleTermsClose}
          onAccept={handleTermsAccept}
          title={termsDialog.title}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          ContentProps={{
            sx: { 
              bgcolor: snackbar.severity === 'error' ? 'error.main' : 'success.main',
              color: '#fff',
              '& .MuiSnackbarContent-message': {
                fontSize: '1rem',
                fontWeight: 500
              }
            }
          }}
        />
      </Box>
    </ThemeProvider>
  );
}

export default DonorForm;
