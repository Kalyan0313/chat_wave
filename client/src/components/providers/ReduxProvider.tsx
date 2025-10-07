import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, AppDispatch } from '../../store/store';
import { initializeAuth } from '../../store/slices/authSlice';
import { useAppDispatch } from '../../store/hooks';

interface ReduxProviderProps {
  children: React.ReactNode;
}

const ReduxInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize authentication on app load
    dispatch(initializeAuth());
  }, [dispatch]);

  return <>{children}</>;
};

const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <ReduxInitializer>
        {children}
      </ReduxInitializer>
    </Provider>
  );
};

export default ReduxProvider;
