import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { initializeAuth } from '../../store/slices/authSlice';

const AuthInitializer: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication on app startup
    dispatch(initializeAuth());
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default AuthInitializer;
