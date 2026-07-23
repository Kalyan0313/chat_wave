import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ReduxProvider from './components/providers/ReduxProvider';
import SocketProvider from './components/providers/SocketProvider';
import AuthInitializer from './components/auth/AuthInitializer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import ChatDashboard from './components/chat/ChatDashboard';
import Profile from './components/profile/Profile';
import LandingPage from './components/landing/LandingPage';
import theme from './theme';
import notificationService from './services/notificationService';

function App() {
  useEffect(() => {
    // App initialization
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReduxProvider>
        <SocketProvider>
          <AuthInitializer />
          <Router>
            <Routes>
              {/* Public landing route with modal auth */}
              <Route path="/" element={<LandingPage />} />
              
              {/* Protected routes */}
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <ChatDashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </SocketProvider>
      </ReduxProvider>
    </ThemeProvider>
  );
}

export default App;