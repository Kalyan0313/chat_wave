import { io, Socket } from 'socket.io-client';
import { store } from '../store/store';
import { addMessage, addTypingUser, removeTypingUser, updateUserStatus } from '../store/slices/chatSlice';
import { logout } from '../store/slices/authSlice';
import { Message } from '../types';
import notificationService from './notificationService';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3002';
let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (socket && socket.connected) {
    console.log('Socket already connected.');
    return;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
  });

  // Authenticate immediately after connection
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
    // Authenticate with the server
    socket.emit('authenticate', { token });
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (error.message === "Authentication error: Invalid token" || error.message === "Authentication error: No token provided") {
      store.dispatch(logout());
    }
  });

  // Handle authentication success
  socket.on('authenticated', (data) => {
    // Socket authenticated successfully
  });

  // Handle authentication error
  socket.on('auth_error', (data) => {
    store.dispatch(logout());
  });

  socket.on('user_online', (data) => {
    // Check if current user wants to see online status
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      store.dispatch(updateUserStatus({ userId: data.userId, status: 'online' }));
    }
  });

  socket.on('user_offline', (data) => {
    // Check if current user wants to see online status
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.onlineStatus !== false) {
      store.dispatch(updateUserStatus({ userId: data.userId, status: 'offline' }));
    }
  });

  socket.on('new_message', (data) => {
    const message = data.message;
    store.dispatch(addMessage(message));
    
    // Show notification if message is not from current user
    const currentUser = store.getState().auth.user;
    
    if (message.sender._id !== currentUser?._id) {
      // Show browser notification
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

  socket.on('user_typing', (data: { chatId: string; userId: string; userName: string }) => {
    // User typing
    store.dispatch(addTypingUser(data));
  });

  socket.on('user_stopped_typing', (data: { chatId: string; userId: string }) => {
    // User stopped typing
    store.dispatch(removeTypingUser(data));
  });

  socket.on('messages_read', (data: { chatId: string; messageIds: string[]; userId: string }) => {
    // Messages read
    // Message read status update
  });

  socket.on('error', (errorMessage: string) => {
    // Socket error
    // Handle specific errors, e.g., authentication failure
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
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
  if (socket) {
    console.log('Joining chat:', chatId);
    socket.emit('join_chat', { chatId });
  }
};

export const leaveChat = (chatId: string) => {
  if (socket) {
    console.log('Leaving chat:', chatId);
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
  if (socket) {
    console.log('Sending socket message:', data);
    socket.emit('send_message', data);
  }
};

export const startTyping = (chatId: string) => {
  if (socket) {
    socket.emit('typing_start', { chatId });
  }
};

export const stopTyping = (chatId: string) => {
  if (socket) {
    socket.emit('typing_stop', { chatId });
  }
};

export const markMessagesRead = (data: { chatId: string; messageIds: string[] }) => {
  if (socket) {
    const settings = JSON.parse(localStorage.getItem('chatSettings') || '{}');
    if (settings.readReceipts !== false) {
      socket.emit('mark_messages_read', data);
    }
  }
};