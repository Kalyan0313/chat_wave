import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{email?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean}>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    
    setErrors({
      email: emailError,
    });
    
    setTouched({
      email: true,
    });
    
    return !emailError;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email && value.trim()) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(forgotPassword({ email }));
      
      if (forgotPassword.fulfilled.match(result)) {
        setIsSubmitted(true);
      }
      // If rejected, the error will be handled by Redux and displayed in the UI
    } catch (err) {
      console.error('Forgot password error:', err);
    }
  };

  if (isSubmitted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'white',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              linear-gradient(
                135deg,
                white 0%,
                white 50%,
                #1e40af 50%,
                #1e40af 100%
              )
            `,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
          }
        }}
      >
        <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 4, sm: 5 }, 
              width: '100%',
              borderRadius: 2,
              background: 'white',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            >
              {/* Logo/Brand */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <ChatIcon sx={{ fontSize: 40, color: '#1e40af', mr: 1 }} />
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    color: '#1e40af',
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  Chat Wave
                </Typography>
              </Box>

              {/* Success Message */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <EmailIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2,
                  color: '#1e293b',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                Check Your Email
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  color: '#64748b', 
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                We've sent a password reset link to <strong>{email}</strong>. 
                Please check your email and follow the instructions to reset your password.
              </Typography>

              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b', 
                  mb: 4,
                  fontWeight: 400,
                }}
              >
                Didn't receive the email? Check your spam folder or try again.
              </Typography>

              {/* Back to Login Button */}
              <Button
                component={Link}
                to="/login"
                variant="contained"
                sx={{ 
                  mb: 2, 
                  py: 1.5,
                  px: 4,
                  borderRadius: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: '#1e40af',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
              >
                <ArrowBackIcon sx={{ mr: 1, fontSize: 20 }} />
                Back to Login
              </Button>

              {/* Resend Email Button */}
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                  setErrors({});
                  setTouched({});
                }}
                variant="outlined"
                sx={{ 
                  py: 1.5,
                  px: 4,
                  borderRadius: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#1e40af',
                  color: '#1e40af',
                  '&:hover': {
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(30, 64, 175, 0.04)',
                  },
                }}
              >
                Try Different Email
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(
              135deg,
              white 0%,
              white 50%,
              #1e40af 50%,
              #1e40af 100%
            )
          `,
          clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        }
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 4, sm: 5 }, 
            width: '100%',
            borderRadius: 2,
            background: 'white',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Logo/Brand */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <ChatIcon sx={{ fontSize: 40, color: '#1e40af', mr: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#1e40af',
                  fontSize: { xs: '1.5rem', sm: '2rem' }
                }}
              >
                Chat Wave
              </Typography>
            </Box>

            {/* Header */}
            <Typography 
              component="h1" 
              variant="h3" 
              sx={{ 
                fontWeight: 800, 
                mb: 1,
                color: '#1e293b',
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              Forgot Password?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#64748b', 
                mb: 4,
                fontWeight: 400,
                opacity: 0.8
              }}
            >
              No worries! Enter your email address and we'll send you a reset link.
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              {/* Email Field */}
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label={
                  <span>
                    Your Email <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                disabled={loading}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: touched.email && errors.email ? '#ef4444' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                    color: touched.email && errors.email ? '#ef4444' : '#374151',
                    '&.Mui-focused': {
                      color: touched.email && errors.email ? '#ef4444' : '#1e40af',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }
                }}
              />

              {/* Send Reset Link Button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  backgroundColor: '#1e40af',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <>
                    Send Reset Link
                    <EmailIcon sx={{ ml: 1, fontSize: 20 }} />
                  </>
                )}
              </Button>

              {/* Back to Login Link */}
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 400 }}>
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: '#1e40af',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
