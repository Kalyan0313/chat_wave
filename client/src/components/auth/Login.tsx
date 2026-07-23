import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { ChatWaveLogo } from '../layout/ChatWaveLogo';
import { AnimatedBackground } from '../layout/AnimatedBackground';
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
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { 
  EmailOutlined as EmailIcon, 
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface LoginProps {
  embedded?: boolean;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

const Login: React.FC<LoginProps> = ({ embedded = false, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
  const validateEmail = (emailVal: string): string => {
    if (!emailVal.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (passwordVal: string): string => {
    if (!passwordVal.trim()) {
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
    if (errors.email && value.trim()) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (errors.password && value.trim()) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const err = validateEmail(email);
    setErrors(prev => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const err = validatePassword(password);
    setErrors(prev => ({ ...prev, password: err }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await dispatch(loginUser({ email, password }));
      if (loginUser.fulfilled.match(result)) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const formContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Logo Brand */}
      {!embedded && (
        <Box sx={{ mb: 3 }}>
          <ChatWaveLogo size="medium" color="#1e40af" textColor="#0f172a" />
        </Box>
      )}

      {/* Title & Subtitle */}
      <Typography 
        variant="h5" 
        component="h1"
        sx={{ 
          fontWeight: 700, 
          color: '#0f172a', 
          mb: 0.5,
          fontSize: { xs: '1.25rem', sm: '1.4rem' },
          textAlign: 'center'
        }}
      >
        Welcome Back
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#64748b', 
          mb: 3,
          textAlign: 'center'
        }}
      >
        Sign in to continue to your conversations
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            mb: 3,
            borderRadius: 2,
            fontSize: '0.875rem',
            '& .MuiAlert-message': {
              fontWeight: 500
            }
          }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        {/* Email Input */}
        <Box sx={{ mb: 2.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#334155', 
              mb: 0.75, 
              display: 'block' 
            }}
          >
            Email Address
          </Typography>
          <TextField
            fullWidth
            id="email"
            name="email"
            placeholder="name@example.com"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            disabled={loading}
            error={touched.email && !!errors.email}
            helperText={touched.email && errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: touched.email && errors.email ? '#ef4444' : '#64748b', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '& fieldset': {
                  borderColor: touched.email && errors.email ? '#ef4444' : '#cbd5e1',
                },
                '&:hover fieldset': {
                  borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af',
                  borderWidth: 2,
                },
              },
              '& .MuiInputBase-input': {
                py: 1.4,
                fontSize: '0.95rem',
                color: '#0f172a',
              },
            }}
          />
        </Box>

        {/* Password Input */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: '#334155', 
              mb: 0.75, 
              display: 'block' 
            }}
          >
            Password
          </Typography>
          <TextField
            fullWidth
            name="password"
            id="password"
            placeholder="••••••••"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            disabled={loading}
            error={touched.password && !!errors.password}
            helperText={touched.password && errors.password}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: touched.password && errors.password ? '#ef4444' : '#64748b', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: '#64748b' }}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '& fieldset': {
                  borderColor: touched.password && errors.password ? '#ef4444' : '#cbd5e1',
                },
                '&:hover fieldset': {
                  borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af',
                },
                '&.Mui-focused fieldset': {
                  borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af',
                  borderWidth: 2,
                },
              },
              '& .MuiInputBase-input': {
                py: 1.4,
                fontSize: '0.95rem',
                color: '#0f172a',
              },
            }}
          />
        </Box>

        {/* Options Row: Remember Me & Forgot Password */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2.5,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="small"
                sx={{
                  color: '#94a3b8',
                  '&.Mui-checked': {
                    color: '#1e40af',
                  },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                Remember me
              </Typography>
            }
          />
          
          {onSwitchToForgotPassword ? (
            <span
              onClick={onSwitchToForgotPassword}
              style={{
                color: '#7c3aed',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Forgot password?
            </span>
          ) : (
            <Link
              to="/forgot-password"
              style={{
                color: '#7c3aed',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Link>
          )}
        </Box>

        {/* Submit Action Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ 
            py: 1.4,
            borderRadius: '50px',
            fontSize: '0.95rem',
            fontWeight: 700,
            textTransform: 'none',
            backgroundColor: '#1e293b',
            boxShadow: '0 4px 14px 0 rgba(15, 23, 42, 0.25)',
            '&:hover': {
              backgroundColor: '#0f172a',
              boxShadow: '0 6px 20px 0 rgba(15, 23, 42, 0.35)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>Sign In</span>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </Button>

        {/* Divider */}
        <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.8rem' }}>
          Account Navigation
        </Divider>

        {/* Sign Up Link */}
        <Box textAlign="center">
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
            Don't have an account?{' '}
            {onSwitchToRegister ? (
              <span
                onClick={onSwitchToRegister}
                style={{
                  color: '#1e40af',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Create account
              </span>
            ) : (
              <Link
                to="/register"
                style={{
                  color: '#1e40af',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Create account
              </Link>
            )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  if (embedded) {
    return formContent;
  }

  return (
    <AnimatedBackground>
      <Container component="main" maxWidth="sm" sx={{ maxWidth: { sm: 480 }, width: '100%' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 3.5, sm: 4.5 }, 
            width: '100%',
            borderRadius: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {formContent}
        </Paper>
      </Container>
    </AnimatedBackground>
  );
};

export default Login;
