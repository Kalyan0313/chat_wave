import React from 'react';

interface SocketProviderProps {
  children: React.ReactNode;
}

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  // Socket connection is now handled automatically by the Redux-based socket service
  // when users log in/out, so this provider just passes through the children
  return <>{children}</>;
};

export default SocketProvider;
