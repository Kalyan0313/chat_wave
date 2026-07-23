import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { forgotPassword, clearError } from '../../store/slices/authSlice';
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
  Divider,
} from '@mui/material';
import { 
  EmailOutlined as EmailIcon, 
  ArrowBack as ArrowBackIcon,
  CheckCircleOutlined as CheckCircleIcon,
  SendOutlined as SendIcon,
} from '@mui/icons-material';

interface ForgotPasswordProps {
  embedded?: boolean;
  onSwitchToLogin?: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ embedded = false, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState('');

  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const validateEmail = (emailVal: string): string => {
    if (!emailVal.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailVal)) return 'Please enter a valid email address';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validateEmail(email);
    if (err) {
      setEmailError(err);
      return;
    }

    try {
      const result = await dispatch(forgotPassword({ email }));
      if (forgotPassword.fulfilled.match(result)) {
        setIsSubmitted(true);
      } else {
        setError((result.payload as string) || 'Failed to send reset link.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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

      {isSubmitted ? (
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 36 }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Check your email
          </Typography>

          <Typography variant="body2" sx={{ color: '#64748b', mb: 3, lineHeight: 1.6 }}>
            We've sent a password reset link to <strong>{email}</strong>
          </Typography>

          {onSwitchToLogin ? (
            <Button
              fullWidth
              variant="contained"
              onClick={onSwitchToLogin}
              sx={{
                py: 1.4,
                borderRadius: '50px',
                fontWeight: 700,
                backgroundColor: '#1e293b',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#0f172a' },
              }}
            >
              Return to Sign In
            </Button>
          ) : (
            <Button
              component={Link}
              to="/login"
              fullWidth
              variant="contained"
              sx={{
                py: 1.4,
                borderRadius: '50px',
                fontWeight: 700,
                backgroundColor: '#1e293b',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#0f172a' },
              }}
            >
              Return to Sign In
            </Button>
          )}
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
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
            Forgot Password?
          </Typography>

          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748b', 
              mb: 3,
              textAlign: 'center'
            }}
          >
            Enter your email and we'll send you a link to reset your password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', mb: 0.75, display: 'block' }}>
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              disabled={loading}
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: emailError ? '#ef4444' : '#64748b', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f8fafc',
                  '& fieldset': { borderColor: emailError ? '#ef4444' : '#cbd5e1' },
                  '&:hover fieldset': { borderColor: emailError ? '#ef4444' : '#1e40af' },
                  '&.Mui-focused fieldset': { borderColor: emailError ? '#ef4444' : '#1e40af', borderWidth: 2 },
                },
                '& .MuiInputBase-input': { py: 1.4, fontSize: '0.95rem', color: '#0f172a' },
              }}
            />
          </Box>

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
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Send Reset Link</span>
                <SendIcon sx={{ fontSize: 18 }} />
              </Box>
            )}
          </Button>

          <Divider sx={{ my: 2.5, color: '#94a3b8', fontSize: '0.8rem' }}>
            Or
          </Divider>

          <Box textAlign="center">
            {onSwitchToLogin ? (
              <span
                onClick={onSwitchToLogin}
                style={{
                  color: '#7c3aed',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.9rem',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Back to Sign In
              </span>
            ) : (
              <Link
                to="/login"
                style={{
                  color: '#7c3aed',
                  textDecoration: 'none',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.9rem',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                Back to Sign In
              </Link>
            )}
          </Box>
        </Box>
      )}
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

export default ForgotPassword;
