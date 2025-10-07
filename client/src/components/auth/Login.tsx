import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Login as LoginIcon, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Chat as ChatIcon
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean; password?: boolean}>({});
  
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

  const validatePassword = (password: string): string => {
    if (!password.trim()) {
      return 'Password is required';
    }
    return '';
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
    });
    
    setTouched({
      email: true,
      password: true,
    });
    
    return !emailError && !passwordError;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Clear error when user starts typing
    if (errors.email && value.trim()) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    // Clear error when user starts typing
    if (errors.password && value.trim()) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const error = validatePassword(password);
    setErrors(prev => ({ ...prev, password: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(result)) {
        navigate('/chat');
      }
      // If rejected, the error will be handled by Redux and displayed in the UI
    } catch (err) {
      console.error('Login error:', err);
    }
  };

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

              {/* Password Field */}
              <TextField
                margin="normal"
                fullWidth
                name="password"
                label={
                  <span>
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                disabled={loading}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#6b7280' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                    '& fieldset': {
                      borderColor: touched.password && errors.password ? '#ef4444' : '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af',
                      borderWidth: 2,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    fontWeight: 500,
                    color: touched.password && errors.password ? '#ef4444' : '#374151',
                    '&.Mui-focused': {
                      color: touched.password && errors.password ? '#ef4444' : '#1e40af',
                    },
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    marginTop: '4px',
                  }
                }}
              />

              {/* Forgot Password Link */}
              <Box textAlign="right" sx={{ mt: 1 }}>
                <Link
                  to="/forgot-password"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.textDecoration = 'underline';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.textDecoration = 'none';
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

              {/* Sign In Button */}
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
                    Sign In
                    <LoginIcon sx={{ ml: 1, fontSize: 20 }} />
                  </>
                )}
              </Button>

              {/* Sign Up Link */}
              <Box textAlign="center">
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 400 }}>
                  New to Chat Wave?{' '}
                  <Link
                    to="/register"
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
                    Create your free account now!
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

export default Login;
