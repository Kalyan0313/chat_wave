import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser, clearError } from '../../store/slices/authSlice';
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
  LinearProgress,
  Divider,
} from '@mui/material';
import { 
  PersonOutlined as PersonIcon,
  EmailOutlined as EmailIcon, 
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircleOutlined as CheckIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

interface RegisterProps {
  embedded?: boolean;
  onSwitchToLogin?: () => void;
}

const Register: React.FC<RegisterProps> = ({ embedded = false, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; 
    email?: string; 
    password?: string; 
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean; 
    email?: boolean; 
    password?: boolean; 
    confirmPassword?: boolean;
    agreeTerms?: boolean;
  }>({});

  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && !embedded) {
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, navigate, embedded]);

  // Clear error when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: '', color: '#e2e8f0' };
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pass)) score += 25;

    if (score <= 25) return { score: 25, label: 'Weak', color: '#ef4444' };
    if (score <= 50) return { score: 50, label: 'Fair', color: '#f59e0b' };
    if (score <= 75) return { score: 75, label: 'Good', color: '#3b82f6' };
    return { score: 100, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Validation functions
  const validateName = (val: string): string => {
    if (!val.trim()) return 'Full name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (val: string): string => {
    if (!val.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val: string): string => {
    if (!val.trim()) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const validateConfirmPassword = (val: string, passVal: string): string => {
    if (!val.trim()) return 'Please confirm your password';
    if (val !== passVal) return 'Passwords do not match';
    return '';
  };

  const validateForm = (): boolean => {
    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);
    const termsErr = !agreeTerms ? 'You must agree to the Terms of Service' : '';

    setErrors({
      name: nameErr,
      email: emailErr,
      password: passwordErr,
      confirmPassword: confirmPasswordErr,
      agreeTerms: termsErr,
    });

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    return !nameErr && !emailErr && !passwordErr && !confirmPasswordErr && !termsErr;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (errors.name && val.trim()) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (errors.email && val.trim()) setErrors(prev => ({ ...prev, email: '' }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (errors.password && val.trim()) setErrors(prev => ({ ...prev, password: '' }));
    if (touched.confirmPassword && confirmPassword) {
      const confirmErr = validateConfirmPassword(confirmPassword, val);
      setErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (errors.confirmPassword && val.trim()) setErrors(prev => ({ ...prev, confirmPassword: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!validateForm()) return;

    try {
      const result = await dispatch(registerUser({ name, email, password }));
      if (registerUser.fulfilled.match(result) && !embedded) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Registration error:', err);
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
        Create Account
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: '#64748b', 
          mb: 3,
          textAlign: 'center'
        }}
      >
        Join Chat Wave today and connect with friends
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            mb: 3,
            borderRadius: 2,
            fontSize: '0.875rem',
            '& .MuiAlert-message': { fontWeight: 500 }
          }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        {/* Full Name Input */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', mb: 0.75, display: 'block' }}>
            Full Name
          </Typography>
          <TextField
            fullWidth
            id="name"
            name="name"
            placeholder="John Doe"
            autoComplete="name"
            autoFocus
            value={name}
            onChange={handleNameChange}
            onBlur={() => {
              setTouched(prev => ({ ...prev, name: true }));
              setErrors(prev => ({ ...prev, name: validateName(name) }));
            }}
            disabled={loading}
            error={touched.name && !!errors.name}
            helperText={touched.name && errors.name}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: touched.name && errors.name ? '#ef4444' : '#64748b', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '& fieldset': { borderColor: touched.name && errors.name ? '#ef4444' : '#cbd5e1' },
                '&:hover fieldset': { borderColor: touched.name && errors.name ? '#ef4444' : '#1e40af' },
                '&.Mui-focused fieldset': { borderColor: touched.name && errors.name ? '#ef4444' : '#1e40af', borderWidth: 2 },
              },
              '& .MuiInputBase-input': { py: 1.4, fontSize: '0.95rem', color: '#0f172a' },
            }}
          />
        </Box>

        {/* Email Address Input */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', mb: 0.75, display: 'block' }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            id="email"
            name="email"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => {
              setTouched(prev => ({ ...prev, email: true }));
              setErrors(prev => ({ ...prev, email: validateEmail(email) }));
            }}
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
                '& fieldset': { borderColor: touched.email && errors.email ? '#ef4444' : '#cbd5e1' },
                '&:hover fieldset': { borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af' },
                '&.Mui-focused fieldset': { borderColor: touched.email && errors.email ? '#ef4444' : '#1e40af', borderWidth: 2 },
              },
              '& .MuiInputBase-input': { py: 1.4, fontSize: '0.95rem', color: '#0f172a' },
            }}
          />
        </Box>

        {/* Password Input & Strength Indicator */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', mb: 0.75, display: 'block' }}>
            Password
          </Typography>
          <TextField
            fullWidth
            name="password"
            id="password"
            placeholder="At least 6 characters"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => {
              setTouched(prev => ({ ...prev, password: true }));
              setErrors(prev => ({ ...prev, password: validatePassword(password) }));
            }}
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
                '& fieldset': { borderColor: touched.password && errors.password ? '#ef4444' : '#cbd5e1' },
                '&:hover fieldset': { borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af' },
                '&.Mui-focused fieldset': { borderColor: touched.password && errors.password ? '#ef4444' : '#1e40af', borderWidth: 2 },
              },
              '& .MuiInputBase-input': { py: 1.4, fontSize: '0.95rem', color: '#0f172a' },
            }}
          />

          {/* Password Strength Meter */}
          {password.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                  Password strength:
                </Typography>
                <Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 700, fontSize: '0.75rem' }}>
                  {passwordStrength.label}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={passwordStrength.score}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: '#e2e8f0',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: passwordStrength.color,
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Confirm Password Input */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', mb: 0.75, display: 'block' }}>
            Confirm Password
          </Typography>
          <TextField
            fullWidth
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Re-enter your password"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => {
              setTouched(prev => ({ ...prev, confirmPassword: true }));
              setErrors(prev => ({ ...prev, confirmPassword: validateConfirmPassword(confirmPassword, password) }));
            }}
            disabled={loading}
            error={touched.confirmPassword && !!errors.confirmPassword}
            helperText={touched.confirmPassword && errors.confirmPassword}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CheckIcon sx={{ color: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : '#64748b', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle confirm password visibility"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                    sx={{ color: '#64748b' }}
                  >
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '& fieldset': { borderColor: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : '#cbd5e1' },
                '&:hover fieldset': { borderColor: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : '#1e40af' },
                '&.Mui-focused fieldset': { borderColor: touched.confirmPassword && errors.confirmPassword ? '#ef4444' : '#1e40af', borderWidth: 2 },
              },
              '& .MuiInputBase-input': { py: 1.4, fontSize: '0.95rem', color: '#0f172a' },
            }}
          />
        </Box>

        {/* Terms Checkbox */}
        <Box sx={{ mb: 2.5 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms && e.target.checked) {
                    setErrors(prev => ({ ...prev, agreeTerms: '' }));
                  }
                }}
                size="small"
                sx={{
                  color: touched.agreeTerms && errors.agreeTerms ? '#ef4444' : '#94a3b8',
                  '&.Mui-checked': { color: '#1e40af' },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                I agree to the <span style={{ color: '#1e40af', fontWeight: 600 }}>Terms</span> and <span style={{ color: '#1e40af', fontWeight: 600 }}>Privacy Policy</span>
              </Typography>
            }
          />
          {touched.agreeTerms && errors.agreeTerms && (
            <Typography variant="caption" sx={{ color: '#ef4444', display: 'block', mt: 0.25, ml: 4 }}>
              {errors.agreeTerms}
            </Typography>
          )}
        </Box>

        {/* Submit Button */}
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
              <span>Create Free Account</span>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          )}
        </Button>

        {/* Divider */}
        <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.8rem' }}>
          Existing User?
        </Divider>

        {/* Log In Link */}
        <Box textAlign="center">
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <span
                onClick={onSwitchToLogin}
                style={{
                  color: '#1e40af',
                  cursor: 'pointer',
                  fontWeight: 700,
                }}
              >
                Sign in here
              </span>
            ) : (
              <Link
                to="/login"
                style={{
                  color: '#1e40af',
                  textDecoration: 'none',
                  fontWeight: 700,
                }}
              >
                Sign in here
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

export default Register;
