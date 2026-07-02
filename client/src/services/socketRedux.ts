import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { addMessage, addTypingUser, removeTypingUser, updateUserStatus, setSocketConnected } from '../store/slices/chatSlice';
import { logout } from '../store/slices/authSlice';
import { Message } from '../types';
import notificationService from './notificationService';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3002';
let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 1000; // Start with 1 second
let reconnectTimeout: NodeJS.Timeout | null = null;
let isManualDisconnect = false;

const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const removeAllListeners = (socketInstance: Socket) => {
  socketInstance.removeAllListeners('connect');
  socketInstance.removeAllListeners('disconnect');
  socketInstance.removeAllListeners('connect_error');
  socketInstance.removeAllListeners('authenticated');
  socketInstance.removeAllListeners('auth_error');
  socketInstance.removeAllListeners('user_online');
  socketInstance.removeAllListeners('user_offline');
  socketInstance.removeAllListeners('new_message');
  socketInstance.removeAllListeners('user_typing');
  socketInstance.removeAllListeners('user_stopped_typing');
  socketInstance.removeAllListeners('messages_read');
  socketInstance.removeAllListeners('error');
  socketInstance.removeAllListeners('reconnect');
  socketInstance.removeAllListeners('reconnect_attempt');
  socketInstance.removeAllListeners('reconnect_error');
  socketInstance.removeAllListeners('reconnect_failed');
};

const setupEventListeners = (socketInstance: Socket, token: string) => {
  socketInstance.on('connect', () => {
    reconnectAttempts = 0;
    store.dispatch(setSocketConnected(true));
    
    if (socketInstance.connected) {
      const currentToken = getToken();
      if (currentToken) {
        socketInstance.emit('authenticate', { token: currentToken });
      }
    }
  });

  socketInstance.on('disconnect', (reason) => {
    store.dispatch(setSocketConnected(false));
    
    if (!isManualDisconnect && reason !== 'io server disconnect') {
      attemptReconnect();
    }
  });

  socketInstance.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    store.dispatch(setSocketConnected(false));
    
    if (error.message.includes('Authentication error') || error.message.includes('Invalid token')) {
      store.dispatch(logout());
      isManualDisconnect = true;
      return;
    }
    
    if (!isManualDisconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      attemptReconnect();
    } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      store.dispatch(setSocketConnected(false));
    }
  });

  socketInstance.on('authenticated', (data) => {
    reconnectAttempts = 0;
    store.dispatch(setSocketConnected(true));
  });

  socketInstance.on('auth_error', (data) => {
    console.error('Socket authentication error:', data.message);
    store.dispatch(setSocketConnected(false));
    store.dispatch(logout());
    isManualDisconnect = true;
  });

  socketInstance.on('reconnect', (attemptNumber) => {
    reconnectAttempts = 0;
    store.dispatch(setSocketConnected(true));
    
    const currentToken = getToken();
    if (currentToken) {
      socketInstance.emit('authenticate', { token: currentToken });
    }
  });

  socketInstance.on('reconnect_attempt', () => {
  });

  socketInstance.on('reconnect_error', () => {
  });

  socketInstance.on('reconnect_failed', () => {
    store.dispatch(setSocketConnected(false));
  });
  socketInstance.on('user_online', (data) => {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      store.dispatch(updateUserStatus({ userId: data.userId, status: 'online' }));
    }
  });

  socketInstance.on('user_offline', (data) => {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      store.dispatch(updateUserStatus({ userId: data.userId, status: 'offline' }));
    }
  });
  socketInstance.on('new_message', (data) => {
    const message = data.message;
    store.dispatch(addMessage(message));
    
    const currentUser = store.getState().auth.user;
    
    if (message.sender._id !== currentUser?._id) {
      const chatName = typeof message.chat === 'string' 
        ? 'Chat' 
        : message.chat.chatName;
      
      notificationService.showMessageNotification(
        message.sender.name,
        message.content,
        message.chat._id || message.chat
      );
    }
  });

  socketInstance.on('user_typing', (data: { chatId: string; userId: string; userName: string }) => {
    store.dispatch(addTypingUser(data));
  });

  socketInstance.on('user_stopped_typing', (data: { chatId: string; userId: string }) => {
    store.dispatch(removeTypingUser(data));
  });

  socketInstance.on('messages_read', () => {
  });

  socketInstance.on('error', (errorMessage: string) => {
    console.error('Socket error:', errorMessage);
  });
};

const attemptReconnect = () => {
  if (isManualDisconnect || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    return;
  }

  reconnectAttempts++;
  const delay = Math.min(RECONNECT_DELAY * Math.pow(2, reconnectAttempts - 1), 30000);
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
  }
  
  reconnectTimeout = setTimeout(() => {
    const token = getToken();
    if (token && socket) {
      if (!socket.connected) {
        socket.connect();
      }
    } else {
      isManualDisconnect = true;
    }
  }, delay);
};

export const connectSocket = (token: string) => {
  if (socket && socket.connected) {
    return;
  }

  if (socket && !socket.connected) {
    removeAllListeners(socket);
    socket.disconnect();
    socket = null;
  }

  isManualDisconnect = false;
  reconnectAttempts = 0;
  
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    timeout: 20000,
    forceNew: false,
  });

  setupEventListeners(socket, token);
};

export const disconnectSocket = () => {
  isManualDisconnect = true;
  
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  
  if (socket) {
    removeAllListeners(socket);
    socket.disconnect();
    socket = null;
  }
  
  reconnectAttempts = 0;
  store.dispatch(setSocketConnected(false));
};

export const emitUserOnline = () => {
  if (socket && socket.connected) {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      socket.emit('user_online');
    }
  }
};

export const emitUserOffline = () => {
  if (socket && socket.connected) {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      socket.emit('user_offline');
    }
  }
};

export const joinChat = (chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('join_chat', { chatId });
  }
};

export const leaveChat = (chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('leave_chat', { chatId });
  }
};

export const sendSocketMessage = (data: { 
  chatId: string; 
  content: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}) => {
  if (socket && socket.connected) {
    socket.emit('send_message', data);
  }
};

export const startTyping = (chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('typing_start', { chatId });
  }
};

export const stopTyping = (chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('typing_stop', { chatId });
  }
};

export const markMessagesRead = (data: { chatId: string; messageIds: string[] }) => {
  if (socket && socket.connected) {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.readReceipts !== false) {
      socket.emit('mark_messages_read', data);
    }
  }
};

export const isSocketConnected = (): boolean => {
  return socket !== null && socket.connected;
};

export const getSocket = (): Socket | null => {
  return socket;
};
