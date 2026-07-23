import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot-password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  initialTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, open]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'login' | 'register' | 'forgot-password') => {
    setActiveTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          overflow: 'hidden',
          p: { xs: 2.5, sm: 3.5 },
          position: 'relative',
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(8px)',
        },
      }}
    >
      {/* Segmented Tab Bar Switcher (Show Sign In / Create Account tabs unless resetting password) */}
      {activeTab !== 'forgot-password' && (
        <Box sx={{ mb: 3, pt: 1 }}>
          <Box
            sx={{
              backgroundColor: '#f1f5f9',
              borderRadius: '50px',
              p: 0.5,
              display: 'flex',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                width: '100%',
                minHeight: 42,
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              <Tab
                value="login"
                label="Sign In"
                sx={{
                  borderRadius: '50px',
                  minHeight: 42,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748b',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#ffffff',
                    backgroundColor: '#1e293b',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                  },
                }}
              />
              <Tab
                value="register"
                label="Create Account"
                sx={{
                  borderRadius: '50px',
                  minHeight: 42,
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  color: '#64748b',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#ffffff',
                    backgroundColor: '#1e293b',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                  },
                }}
              />
            </Tabs>
          </Box>
        </Box>
      )}

      {/* Modal Body Content */}
      <DialogContent sx={{ p: 0, overflow: 'visible' }}>
        {activeTab === 'login' && (
          <Login
            embedded
            onSwitchToRegister={() => setActiveTab('register')}
            onSwitchToForgotPassword={() => setActiveTab('forgot-password')}
          />
        )}
        {activeTab === 'register' && (
          <Register
            embedded
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
        {activeTab === 'forgot-password' && (
          <ForgotPassword
            embedded
            onSwitchToLogin={() => setActiveTab('login')}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
